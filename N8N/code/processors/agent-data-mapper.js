/**
 * Agent Data Mapper - INSERT com validação de constraint
 *
 * Mapeia dados do webhook body para estrutura da tabela agents
 * Valida campos obrigatórios e aplica defaults
 * ✅ VALIDAÇÃO: Apenas 1 agent active por (agent_id + project_id)
 *
 * GitHub: https://github.com/Uptax-creator/N8N-Research-Agents
 * Branch: clean-deployment
 * Path: N8N/code/processors/agent-data-mapper.js
 *
 * @version 3.0.0 - Auto-geração de URLs GitHub baseada em project config
 */

/**
 * Valida constraint: apenas 1 agent com is_latest=true por (agent_id + project_id)
 * @param {Object} $ - N8N context
 * @param {string} agent_id - ID do agent
 * @param {string} project_id - ID do projeto
 * @returns {Object} Resultado da validação
 */
async function validateUniqueLatestConstraint(ctx, agent_id, project_id) {
  try {
    const allAgents = await ctx.getDataTableRows('agents');

    const existingLatest = allAgents.filter(
      (agent) =>
        agent.agent_id === agent_id &&
        agent.project_id === project_id &&
        agent.is_latest === true
    );

    if (existingLatest.length === 0) {
      return {
        valid: true,
        message: `✅ No latest version found with agent_id=${agent_id} in project_id=${project_id}`,
        can_insert: true
      };
    }

    if (existingLatest.length === 1) {
      return {
        valid: false,
        constraint_violation: 'DUPLICATE_LATEST',
        message: `❌ Agent ${agent_id} already exists in ${project_id} with is_latest=true (id=${existingLatest[0].id})`,
        can_insert: false,
        existing_agent: {
          id: existingLatest[0].id,
          version: existingLatest[0].version || 1,
          created_at: existingLatest[0].created_at
        },
        suggestion: 'Use UPDATE operation to modify existing agent, or mark existing as inactive first'
      };
    }

    // Se > 1 latest: constraint violado (dados corrompidos)
    return {
      valid: false,
      constraint_violation: 'MULTIPLE_LATEST',
      message: `⚠️ DATA CORRUPTION: Found ${existingLatest.length} versions with is_latest=true for agent ${agent_id} in ${project_id}`,
      can_insert: false,
      corrupted_ids: existingLatest.map((a) => a.id),
      suggestion: 'Fix data corruption: mark all but one as is_latest=false'
    };

  } catch (error) {
    return {
      valid: false,
      constraint_violation: 'VALIDATION_ERROR',
      message: `❌ Validation failed: ${error.message}`,
      can_insert: false,
      error: error.message
    };
  }
}

/**
 * Mapeia dados do body do webhook para estrutura da tabela agents
 * @param {Object} body - Dados recebidos do webhook
 * @param {Object} $ - N8N context (opcional, para validação de constraint)
 * @returns {Object} Dados mapeados para inserção
 */
async function mapAgentData(body, $ = null) {
  // Extrai dados do body (pode vir como body.data ou direto no body)
  const data = body.data || body;

  // Validações obrigatórias
  if (!data.agent_id) {
    throw new Error('Missing required field: agent_id');
  }

  if (!data.project_id) {
    throw new Error('Missing required field: project_id');
  }

  if (!data.agent_type) {
    throw new Error('Missing required field: agent_type');
  }

  // ✅ VALIDAÇÃO DE CONSTRAINT (se $ disponível)
  if ($) {
    const validation = await validateUniqueLatestConstraint($, data.agent_id, data.project_id);

    if (!validation.valid) {
      const error = new Error(validation.message);
      error.constraint_violation = validation.constraint_violation;
      error.existing_agent = validation.existing_agent;
      error.suggestion = validation.suggestion;
      throw error;
    }

    // ⭐ AUTO-GERAR URLs DO GITHUB (busca configuração do projeto)
    if (!data.github_config_url || !data.github_prompts_url) {
      const allProjects = await $.getDataTableRows('cad_projects');
      const project = allProjects.find(p => p.project_id === data.project_id);

      if (!project) {
        throw new Error(`Project ${data.project_id} not found in Data Tables`);
      }

      // Validar se projeto tem configuração GitHub completa
      if (!project.repository_url || !project.branch || !project.agents_base_path || !project.prompts_base_path) {
        throw new Error(`Project ${data.project_id} missing GitHub configuration (repository_url, branch, agents_base_path, prompts_base_path)`);
      }

      // Montar URL base
      const baseUrl = `${project.repository_url}/raw/${project.branch}`;

      // Auto-gerar URLs
      data.github_config_url = `${baseUrl}/${project.agents_base_path}${data.agent_id}/config.json`;
      data.github_prompts_url = `${baseUrl}/${project.prompts_base_path}${data.agent_id}_prompts.json`;

      console.log(`✅ GitHub URLs auto-generated from project ${project.project_id}:`);
      console.log(`   Config: ${data.github_config_url}`);
      console.log(`   Prompts: ${data.github_prompts_url}`);
    }
  }

  // Mapeia campos
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

    // ⭐ Soft Delete Parcial com is_latest
    is_latest: true,              // ✅ Sempre true para novos agents
    version: data.version || 1,   // ✅ Versão inicial
    status: 'active',             // ✅ Status sempre active
    deleted_at: null,
    superseded_by: null,

    // Timestamps
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Validação de URLs GitHub (se fornecidas)
  if (mapped.github_config_url && !mapped.github_config_url.startsWith('https://')) {
    throw new Error('Invalid github_config_url: must be a valid HTTPS URL');
  }

  if (mapped.github_prompts_url && !mapped.github_prompts_url.startsWith('https://')) {
    throw new Error('Invalid github_prompts_url: must be a valid HTTPS URL');
  }

  // Validação de webhook_url (se fornecida)
  if (mapped.webhook_url && !mapped.webhook_url.startsWith('https://')) {
    throw new Error('Invalid webhook_url: must be a valid HTTPS URL');
  }

  // Validação de status
  const validStatuses = ['active', 'inactive', 'deprecated', 'archived'];
  if (!validStatuses.includes(mapped.status)) {
    throw new Error(`Invalid status: ${mapped.status}. Must be one of: ${validStatuses.join(', ')}`);
  }

  console.log(`✅ Agent data mapped successfully: ${mapped.agent_id} v${mapped.version}`);

  return mapped;
}

// Export para N8N Code Node
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { mapAgentData, validateUniqueLatestConstraint };
}

// Auto-execução em Code Node
if (typeof $ !== 'undefined') {
  const inputData = $input.all()[0].json;
  return mapAgentData(inputData, $);
}
