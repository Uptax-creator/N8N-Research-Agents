/**
 * Agent Update Validator
 *
 * Valida se agent existe antes de UPDATE
 * Busca por agent_id + project_id e retorna ID do N8N
 *
 * GitHub: https://github.com/Uptax-creator/N8N-Research-Agents
 * Branch: clean-deployment
 * Path: N8N/code/processors/agent-update-validator.js
 *
 * @version 1.0.0
 */

/**
 * Valida e prepara dados para UPDATE
 * @param {Object} updateData - Dados que serão atualizados
 * @param {Array} existingAgents - Lista de agents da tabela (resultado do GET)
 * @returns {Object} Dados validados com ID correto para UPDATE
 */
function validateAndPrepareUpdate(updateData, existingAgents) {
  // Validações obrigatórias
  if (!updateData.agent_id) {
    throw new Error('Missing required field: agent_id');
  }

  if (!updateData.project_id) {
    throw new Error('Missing required field: project_id');
  }

  // Busca agent existente por agent_id + project_id
  const existingAgent = existingAgents.find(agent =>
    agent.agent_id === updateData.agent_id &&
    agent.project_id === updateData.project_id
  );

  // Se não encontrar, retorna erro
  if (!existingAgent) {
    throw new Error(
      `Agent not found: agent_id='${updateData.agent_id}', project_id='${updateData.project_id}'. ` +
      `Cannot UPDATE non-existent agent. Use INSERT instead.`
    );
  }

  // Se cliente enviou ID, valida se corresponde
  if (updateData.id && updateData.id !== existingAgent.id) {
    throw new Error(
      `ID mismatch: provided id=${updateData.id}, but agent has id=${existingAgent.id}. ` +
      `The 'id' field should match the N8N record ID.`
    );
  }

  // Prepara dados para UPDATE com ID correto
  const validatedData = {
    // ID do registro N8N (obtido do GET)
    id: existingAgent.id,

    // Chaves de negócio (não devem mudar, mas incluímos para segurança)
    agent_id: updateData.agent_id.trim(),
    project_id: updateData.project_id.trim(),

    // Campos atualizáveis
    workflow_id: updateData.workflow_id?.trim() || existingAgent.workflow_id,
    webhook_id: updateData.webhook_id?.trim() || existingAgent.webhook_id,
    webhook_url: updateData.webhook_url?.trim() || existingAgent.webhook_url,
    agent_name: updateData.agent_name?.trim() || existingAgent.agent_name,
    agent_type: updateData.agent_type?.trim() || existingAgent.agent_type,
    description: updateData.description?.trim() || existingAgent.description,
    github_config_url: updateData.github_config_url?.trim() || existingAgent.github_config_url,
    github_prompts_url: updateData.github_prompts_url?.trim() || existingAgent.github_prompts_url,
    status: updateData.status?.trim() || existingAgent.status
  };

  // Validação de URLs (se foram atualizadas)
  if (validatedData.github_config_url && !validatedData.github_config_url.startsWith('https://')) {
    throw new Error('Invalid github_config_url: must be a valid HTTPS URL');
  }

  if (validatedData.github_prompts_url && !validatedData.github_prompts_url.startsWith('https://')) {
    throw new Error('Invalid github_prompts_url: must be a valid HTTPS URL');
  }

  if (validatedData.webhook_url && !validatedData.webhook_url.startsWith('https://')) {
    throw new Error('Invalid webhook_url: must be a valid HTTPS URL');
  }

  return {
    validated: validatedData,
    existing: existingAgent,
    message: `Agent found with id=${existingAgent.id}. Ready for UPDATE.`
  };
}

// Export para N8N Code Node
if (typeof module !== 'undefined' && module.exports) {
  module.exports = validateAndPrepareUpdate;
}

// Export para uso direto
if (typeof validateAndPrepareUpdate !== 'undefined') {
  validateAndPrepareUpdate;
}
