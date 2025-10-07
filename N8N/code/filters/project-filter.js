/**
 * Project Filter - GET operations
 *
 * Filtra e formata projetos vindos do Data Table node
 * IMPORTANTE: Este componente recebe dados JÁ carregados do Data Table
 *
 * GitHub: https://github.com/Uptax-creator/N8N-Research-Agents
 * Branch: clean-deployment
 * Path: N8N/code/filters/project-filter.js
 *
 * @version 1.0.0
 */

/**
 * Filtra projeto específico por ID
 * @param {Array} allProjects - Todos os projetos do Data Table
 * @param {string} project_id - ID do projeto
 * @returns {Object} Resultado da busca
 */
function filterProjectById(allProjects, project_id) {
  const project = allProjects.find(p => p.project_id === project_id);

  if (!project) {
    return {
      found: false,
      message: `❌ Project ${project_id} not found`,
      project: null
    };
  }

  console.log(`✅ Project found: ${project.project_id} (${project.project_name})`);

  return {
    found: true,
    message: `✅ Project ${project_id} found`,
    project: project
  };
}

/**
 * Filtra projetos por status
 * @param {Array} allProjects - Todos os projetos
 * @param {string} status - Status para filtrar (ex: 'active')
 * @returns {Object} Lista filtrada
 */
function filterProjectsByStatus(allProjects, status = 'active') {
  const filtered = allProjects.filter(p => p.status === status);

  console.log(`✅ Found ${filtered.length} projects with status=${status}`);

  return {
    success: true,
    total: filtered.length,
    status: status,
    projects: filtered
  };
}

/**
 * Lista todos os projetos ativos
 * @param {Array} allProjects - Todos os projetos
 * @returns {Object} Lista de ativos
 */
function listActiveProjects(allProjects) {
  return filterProjectsByStatus(allProjects, 'active');
}

/**
 * Formata projeto para Frontend
 * @param {Object} project - Projeto raw
 * @returns {Object} Projeto formatado
 */
function formatProjectForFrontend(project) {
  return {
    id: project.id,
    project_id: project.project_id,
    project_name: project.project_name,
    description: project.description,
    owner_email: project.owner_email,
    status: project.status,
    github: {
      repository_url: project.repository_url,
      branch: project.branch,
      paths: {
        code: project.code_base_path,
        prompts: project.prompts_base_path,
        agents: project.agents_base_path,
        projects: project.projects_base_path
      }
    },
    created_at: project.created_at,
    updated_at: project.updated_at
  };
}

/**
 * Filtra e formata projetos
 * @param {Array} allProjects - Todos os projetos do Data Table
 * @param {Object} filters - Filtros { project_id, status, format }
 * @returns {Object} Resultado filtrado e formatado
 */
function filterAndFormatProjects(allProjects, filters = {}) {
  const { project_id, status, format = false } = filters;

  let result;

  // Filtro 1: Por ID específico
  if (project_id) {
    result = filterProjectById(allProjects, project_id);

    if (format && result.project) {
      result.project = formatProjectForFrontend(result.project);
    }

    return result;
  }

  // Filtro 2: Por status
  if (status) {
    result = filterProjectsByStatus(allProjects, status);
  } else {
    // Sem filtros: retorna todos ativos
    result = listActiveProjects(allProjects);
  }

  // Formatar para frontend se solicitado
  if (format) {
    result.projects = result.projects.map(formatProjectForFrontend);
  }

  return result;
}

// Export para N8N Code Node
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    filterProjectById,
    filterProjectsByStatus,
    listActiveProjects,
    formatProjectForFrontend,
    filterAndFormatProjects
  };
}
