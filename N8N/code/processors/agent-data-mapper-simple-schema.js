/**
 * Agent Data Mapper - COM VALIDAÇÃO (schema simplificado)
 * Usa apenas colunas existentes na tabela agents do N8N
 * @version 5.0.0
 */

/**
 * Valida constraint: apenas 1 agent ativo por (agent_id + project_id)
 */
function validateUniqueAgent(allAgents, agent_id, project_id) {
  const existing = allAgents.filter(
    (agent) =>
      agent.agent_id === agent_id &&
      agent.project_id === project_id &&
      agent.status === 'active'
  );

  if (existing.length === 0) {
    return {
      valid: true,
      message: `✅ Can insert agent ${agent_id}`,
      can_insert: true
    };
  }

  return {
    valid: false,
    constraint_violation: 'DUPLICATE_ACTIVE_AGENT',
    message: `❌ Agent ${agent_id} already exists in ${project_id} with status=active (id=${existing[0].id})`,
    can_insert: false,
    existing_agent: {
      id: existing[0].id,
      agent_name: existing[0].agent_name
    },
    suggestion: 'Use a different agent_id or mark existing as inactive first'
  };
}

/**
 * Mapeia dados do webhook - APENAS COLUNAS EXISTENTES
 */
function mapAgentData(body, allAgents, allProjects) {
  const data = body.data || body;

  // Validações obrigatórias
  if (!data.agent_id) throw new Error('Missing required field: agent_id');
  if (!data.project_id) throw new Error('Missing required field: project_id');
  if (!data.agent_type) throw new Error('Missing required field: agent_type');

  // Validação de constraint
  if (allAgents && allAgents.length >= 0) {
    const validation = validateUniqueAgent(allAgents, data.agent_id, data.project_id);

    if (!validation.valid) {
      const error = new Error(validation.message);
      error.constraint_violation = validation.constraint_violation;
      error.existing_agent = validation.existing_agent;
      error.suggestion = validation.suggestion;
      throw error;
    }
  }

  // Auto-gerar URLs do GitHub
  if (allProjects && allProjects.length > 0) {
    if (!data.github_config_url || !data.github_prompts_url) {
      const project = allProjects.find(p => p.project_id === data.project_id);

      if (!project) {
        throw new Error(`Project ${data.project_id} not found in Data Tables`);
      }

      if (!project.repository_url || !project.branch || !project.agents_base_path || !project.prompts_base_path) {
        throw new Error(`Project ${data.project_id} missing GitHub configuration`);
      }

      const baseUrl = `${project.repository_url}/raw/${project.branch}`;
      data.github_config_url = `${baseUrl}/${project.agents_base_path}${data.agent_id}/config.json`;
      data.github_prompts_url = `${baseUrl}/${project.prompts_base_path}${data.agent_id}_prompts.json`;

      console.log(`✅ GitHub URLs auto-generated`);
    }
  }

  // Mapeia APENAS campos que existem na tabela
  const mapped = {
    agent_id: data.agent_id.trim(),
    project_id: data.project_id.trim(),
    workflow_id: data.workflow_id?.trim() || null,
    webhook_id: data.webhook_id?.trim() || null,
    webhook_url: data.webhook_url?.trim() || null,
    agent_name: data.agent_name?.trim() || data.agent_id,
    agent_type: data.agent_type.trim(),
    description: data.description?.trim() || '',
    github_config_url: data.github_config_url?.trim() || null,
    github_prompts_url: data.github_prompts_url?.trim() || null,
    status: 'active'
  };

  console.log(`✅ Agent data mapped: ${mapped.agent_id}`);
  return mapped;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { mapAgentData, validateUniqueAgent };
}
