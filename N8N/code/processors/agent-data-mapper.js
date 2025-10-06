/**
 * Agent Data Mapper
 *
 * Mapeia dados do webhook body para estrutura da tabela agents
 * Valida campos obrigatórios e aplica defaults
 *
 * GitHub: https://github.com/Uptax-creator/N8N-Research-Agents
 * Branch: clean-deployment
 * Path: N8N/code/processors/agent-data-mapper.js
 *
 * @version 1.0.0
 */

/**
 * Mapeia dados do body do webhook para estrutura da tabela agents
 * @param {Object} body - Dados recebidos do webhook
 * @returns {Object} Dados mapeados para inserção/update
 */
function mapAgentData(body) {
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
    status: data.status?.trim() || 'active'
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

  return mapped;
}

// Export para N8N Code Node
if (typeof module !== 'undefined' && module.exports) {
  module.exports = mapAgentData;
}

// Export para uso direto no N8N Code Node (sem module.exports)
if (typeof mapAgentData !== 'undefined') {
  mapAgentData;
}
