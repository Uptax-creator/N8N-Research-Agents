/**
 * Project Query Helper - GET operations
 *
 * Busca projetos na Data Table com filtros
 * Fornece helpers para construir URLs GitHub
 *
 * GitHub: https://github.com/Uptax-creator/N8N-Research-Agents
 * Branch: clean-deployment
 * Path: N8N/code/helpers/project-query-helper.js
 *
 * @version 1.0.0
 */

/**
 * Busca projeto por project_id
 * @param {Object} $ - N8N context
 * @param {string} project_id - ID do projeto
 * @returns {Object} Resultado da busca
 */
async function getProject($, project_id) {
  try {
    const allProjects = await $.getDataTableRows('projects');

    const project = allProjects.find(p => p.project_id === project_id);

    if (!project) {
      return {
        found: false,
        message: `❌ Project ${project_id} not found in Data Tables`,
        project: null
      };
    }

    console.log(`✅ Project found: ${project.project_id} (${project.project_name})`);

    return {
      found: true,
      message: `✅ Project ${project_id} found`,
      project: project
    };

  } catch (error) {
    return {
      found: false,
      error: true,
      message: `❌ Query failed: ${error.message}`,
      project: null
    };
  }
}

/**
 * Lista todos os projetos
 * @param {Object} $ - N8N context
 * @param {Object} filters - Filtros opcionais { status: 'active' }
 * @returns {Object} Lista de projetos
 */
async function listProjects($, filters = {}) {
  try {
    let allProjects = await $.getDataTableRows('projects');

    // Aplicar filtros
    if (filters.status) {
      allProjects = allProjects.filter(p => p.status === filters.status);
    }

    console.log(`✅ Found ${allProjects.length} projects`);

    return {
      success: true,
      total: allProjects.length,
      projects: allProjects
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      projects: []
    };
  }
}

/**
 * Lista apenas projetos ativos
 * @param {Object} $ - N8N context
 * @returns {Object} Lista de projetos ativos
 */
async function listActiveProjects($) {
  return listProjects($, { status: 'active' });
}

/**
 * Monta URL base do GitHub para um projeto
 * @param {Object} project - Objeto do projeto
 * @returns {string} URL base (ex: https://github.com/.../raw/branch)
 */
function buildGitHubBaseUrl(project) {
  if (!project.repository_url || !project.branch) {
    throw new Error('Project missing repository_url or branch');
  }
  return `${project.repository_url}/raw/${project.branch}`;
}

/**
 * Monta URL completa para config.json de um agent
 * @param {Object} project - Objeto do projeto
 * @param {string} agent_id - ID do agent
 * @returns {string} URL completa do config.json
 */
function buildAgentConfigUrl(project, agent_id) {
  const baseUrl = buildGitHubBaseUrl(project);
  return `${baseUrl}/${project.agents_base_path}${agent_id}/config.json`;
}

/**
 * Monta URL completa para prompts.json de um agent
 * @param {Object} project - Objeto do projeto
 * @param {string} agent_id - ID do agent
 * @returns {string} URL completa do prompts.json
 */
function buildAgentPromptsUrl(project, agent_id) {
  const baseUrl = buildGitHubBaseUrl(project);
  return `${baseUrl}/${project.prompts_base_path}${agent_id}_prompts.json`;
}

/**
 * Monta URL completa para um código (loader/processor)
 * @param {Object} project - Objeto do projeto
 * @param {string} codePath - Caminho relativo (ex: 'loaders/config-loader.js')
 * @returns {string} URL completa do código
 */
function buildCodeUrl(project, codePath) {
  const baseUrl = buildGitHubBaseUrl(project);
  return `${baseUrl}/${project.code_base_path}${codePath}`;
}

/**
 * Monta todas as URLs de um agent baseado no projeto
 * @param {Object} project - Objeto do projeto
 * @param {string} agent_id - ID do agent
 * @returns {Object} Objeto com todas as URLs
 */
function buildAgentUrls(project, agent_id) {
  return {
    config_url: buildAgentConfigUrl(project, agent_id),
    prompts_url: buildAgentPromptsUrl(project, agent_id),
    base_url: buildGitHubBaseUrl(project)
  };
}

/**
 * Valida se todas as configurações GitHub do projeto estão completas
 * @param {Object} project - Objeto do projeto
 * @returns {Object} Resultado da validação
 */
function validateProjectGitHubConfig(project) {
  const required = [
    'repository_url',
    'branch',
    'code_base_path',
    'prompts_base_path',
    'agents_base_path',
    'projects_base_path'
  ];

  const missing = required.filter(field => !project[field]);

  if (missing.length > 0) {
    return {
      valid: false,
      message: `❌ Project ${project.project_id} missing GitHub config fields: ${missing.join(', ')}`,
      missing_fields: missing
    };
  }

  return {
    valid: true,
    message: `✅ Project ${project.project_id} has complete GitHub configuration`
  };
}

// Export para N8N Code Node
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getProject,
    listProjects,
    listActiveProjects,
    buildGitHubBaseUrl,
    buildAgentConfigUrl,
    buildAgentPromptsUrl,
    buildCodeUrl,
    buildAgentUrls,
    validateProjectGitHubConfig
  };
}

// Auto-execução em Code Node
if (typeof $ !== 'undefined') {
  const inputData = $input.all()[0].json;

  // Se receber project_id, busca projeto específico
  if (inputData.project_id) {
    return getProject($, inputData.project_id);
  }

  // Senão, lista todos os projetos ativos
  return listActiveProjects($);
}
