/**
 * Agent Filter - GET operations
 *
 * Filtra e formata agents vindos do Data Table node
 * IMPORTANTE: Este componente recebe dados JÁ carregados do Data Table
 *
 * GitHub: https://github.com/Uptax-creator/N8N-Research-Agents
 * Branch: clean-deployment
 * Path: N8N/code/filters/agent-filter.js
 *
 * @version 1.0.0
 */

/**
 * Filtra agent específico por ID + project
 * @param {Array} allAgents - Todos os agents do Data Table
 * @param {string} agent_id - ID do agent
 * @param {string} project_id - ID do projeto
 * @returns {Object} Resultado da busca
 */
function filterAgentById(allAgents, agent_id, project_id) {
  const agent = allAgents.find(
    a => a.agent_id === agent_id &&
         a.project_id === project_id &&
         a.is_latest === true
  );

  if (!agent) {
    return {
      found: false,
      message: `❌ Agent ${agent_id} not found in project ${project_id}`,
      agent: null
    };
  }

  console.log(`✅ Agent found: ${agent.agent_id} (${agent.agent_name})`);

  return {
    found: true,
    message: `✅ Agent ${agent_id} found`,
    agent: agent
  };
}

/**
 * Filtra agents por projeto
 * @param {Array} allAgents - Todos os agents
 * @param {string} project_id - ID do projeto
 * @returns {Object} Lista filtrada
 */
function filterAgentsByProject(allAgents, project_id) {
  const filtered = allAgents.filter(
    a => a.project_id === project_id &&
         a.status === 'active' &&
         a.is_latest === true
  );

  console.log(`✅ Found ${filtered.length} agents in project ${project_id}`);

  return {
    success: true,
    project_id: project_id,
    total: filtered.length,
    agents: filtered
  };
}

/**
 * Filtra agents por tipo
 * @param {Array} allAgents - Todos os agents
 * @param {string} agent_type - Tipo do agent
 * @returns {Object} Lista filtrada
 */
function filterAgentsByType(allAgents, agent_type) {
  const filtered = allAgents.filter(
    a => a.agent_type === agent_type &&
         a.status === 'active' &&
         a.is_latest === true
  );

  console.log(`✅ Found ${filtered.length} agents with type=${agent_type}`);

  return {
    success: true,
    agent_type: agent_type,
    total: filtered.length,
    agents: filtered
  };
}

/**
 * Lista todos os agents ativos
 * @param {Array} allAgents - Todos os agents
 * @returns {Object} Lista de ativos
 */
function listActiveAgents(allAgents) {
  const filtered = allAgents.filter(
    a => a.status === 'active' && a.is_latest === true
  );

  console.log(`✅ Found ${filtered.length} active agents`);

  return {
    success: true,
    total: filtered.length,
    agents: filtered
  };
}

/**
 * Formata agent para Frontend
 * @param {Object} agent - Agent raw
 * @returns {Object} Agent formatado
 */
function formatAgentForFrontend(agent) {
  return {
    id: agent.id,
    agent_id: agent.agent_id,
    project_id: agent.project_id,
    agent_name: agent.agent_name,
    agent_type: agent.agent_type,
    description: agent.description,
    status: agent.status,
    version: agent.version,
    github: {
      config_url: agent.github_config_url,
      prompts_url: agent.github_prompts_url
    },
    workflow: {
      workflow_id: agent.workflow_id,
      webhook_id: agent.webhook_id,
      webhook_url: agent.webhook_url
    },
    metadata: {
      is_latest: agent.is_latest,
      created_at: agent.created_at,
      updated_at: agent.updated_at
    }
  };
}

/**
 * Filtra e formata agents
 * @param {Array} allAgents - Todos os agents do Data Table
 * @param {Object} filters - Filtros { agent_id, project_id, agent_type, format }
 * @returns {Object} Resultado filtrado e formatado
 */
function filterAndFormatAgents(allAgents, filters = {}) {
  const { agent_id, project_id, agent_type, format = false } = filters;

  let result;

  // Filtro 1: Por ID específico (requer project_id)
  if (agent_id && project_id) {
    result = filterAgentById(allAgents, agent_id, project_id);

    if (format && result.agent) {
      result.agent = formatAgentForFrontend(result.agent);
    }

    return result;
  }

  // Filtro 2: Por projeto
  if (project_id) {
    result = filterAgentsByProject(allAgents, project_id);
  }
  // Filtro 3: Por tipo
  else if (agent_type) {
    result = filterAgentsByType(allAgents, agent_type);
  }
  // Sem filtros: retorna todos ativos
  else {
    result = listActiveAgents(allAgents);
  }

  // Formatar para frontend se solicitado
  if (format) {
    result.agents = result.agents.map(formatAgentForFrontend);
  }

  return result;
}

// Export para N8N Code Node
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    filterAgentById,
    filterAgentsByProject,
    filterAgentsByType,
    listActiveAgents,
    formatAgentForFrontend,
    filterAndFormatAgents
  };
}
