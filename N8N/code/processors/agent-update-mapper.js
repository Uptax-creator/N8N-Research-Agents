/**
 * Agent Update Mapper
 *
 * Mapeia dados do webhook body para UPDATE de agent existente
 * Valida campos obrigatórios incluindo ID do registro
 *
 * GitHub: https://github.com/Uptax-creator/N8N-Research-Agents
 * Branch: clean-deployment
 * Path: N8N/code/processors/agent-update-mapper.js
 *
 * @version 1.0.0
 */

/**
 * Mapeia dados do body do webhook para UPDATE de agent
 * @param {Object} body - Dados recebidos do webhook
 * @returns {Object} Dados mapeados para update
 */
function mapAgentUpdateData(body) {
  // Extrai dados do body (pode vir como body.data ou direto no body)
  const data = body.data || body;

  // Validações obrigatórias para UPDATE
  if (!data.id) {
    throw new Error('Missing required field for UPDATE: id (N8N record ID)');
  }

  if (!data.agent_id) {
    throw new Error('Missing required field: agent_id');
  }

  if (!data.project_id) {
    throw new Error('Missing required field: project_id');
  }

  // Mapeia campos (incluindo ID para filtros)
  const mapped = {
    // ID do registro N8N (obrigatório para UPDATE)
    id: parseInt(data.id, 10),

    // Chaves de negócio
    agent_id: data.agent_id.trim(),
    project_id: data.project_id.trim(),

    // Campos atualizáveis
    workflow_id: data.workflow_id?.trim() || null,
    webhook_id: data.webhook_id?.trim() || null,
    webhook_url: data.webhook_url?.trim() || null,
    agent_name: data.agent_name?.trim() || data.agent_id,
    agent_type: data.agent_type?.trim() || null,
    description: data.description?.trim() || '',
    github_config_url: data.github_config_url?.trim() || null,
    github_prompts_url: data.github_prompts_url?.trim() || null,
    status: data.status?.trim() || 'active'
  };

  // Validação de ID
  if (isNaN(mapped.id) || mapped.id <= 0) {
    throw new Error('Invalid id: must be a positive integer');
  }

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
  module.exports = mapAgentUpdateData;
}

// Export para uso direto no N8N Code Node (sem module.exports)
if (typeof mapAgentUpdateData !== 'undefined') {
  mapAgentUpdateData;
}
