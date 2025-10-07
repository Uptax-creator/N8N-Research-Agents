/**
 * Agent Data Mapper - SEM VALIDAÇÃO (igual funcionava ontem)
 * @version 1.0.0 - Simples, sem verificar duplicatas
 */

function mapAgentData(body) {
  const data = body.data || body;

  // Validações básicas
  if (!data.agent_id) throw new Error('Missing required field: agent_id');
  if (!data.project_id) throw new Error('Missing required field: project_id');
  if (!data.agent_type) throw new Error('Missing required field: agent_type');

  // Mapeia campos (SEM validação de duplicatas)
  return {
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
    is_latest: true,
    version: data.version || 1,
    status: 'active',
    deleted_at: null,
    superseded_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { mapAgentData };
}
