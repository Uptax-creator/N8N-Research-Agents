/**
 * Project Data Mapper - INSERT com validação
 *
 * Mapeia dados do webhook body para estrutura da tabela projects
 * Valida campos obrigatórios e aplica defaults
 * ✅ VALIDAÇÃO: Apenas 1 project por project_id (UNIQUE)
 *
 * GitHub: https://github.com/Uptax-creator/N8N-Research-Agents
 * Branch: clean-deployment
 * Path: N8N/code/processors/project-data-mapper.js
 *
 * @version 1.0.0
 */

/**
 * Valida se project_id já existe
 * @param {Object} $ - N8N context
 * @param {string} project_id - ID do projeto
 * @returns {Object} Resultado da validação
 */
async function validateUniqueProjectId($, project_id) {
  try {
    const allProjects = await $.getDataTableRows('cad_projects');

    const existingProject = allProjects.find(
      (project) => project.project_id === project_id
    );

    if (!existingProject) {
      return {
        valid: true,
        message: `✅ Project ${project_id} does not exist, can insert`,
        can_insert: true
      };
    }

    return {
      valid: false,
      constraint_violation: 'DUPLICATE_PROJECT_ID',
      message: `❌ Project ${project_id} already exists (id=${existingProject.id})`,
      can_insert: false,
      existing_project: {
        id: existingProject.id,
        project_name: existingProject.project_name,
        status: existingProject.status,
        created_at: existingProject.created_at
      },
      suggestion: 'Use UPDATE operation or choose different project_id'
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
 * Mapeia dados do body do webhook para estrutura da tabela projects
 * @param {Object} body - Dados recebidos do webhook
 * @param {Object} $ - N8N context (opcional, para validação)
 * @returns {Object} Dados mapeados para inserção
 */
async function mapProjectData(body, $ = null) {
  // Extrai dados do body (pode vir como body.data ou direto no body)
  const data = body.data || body;

  // Validações obrigatórias
  if (!data.project_id) {
    throw new Error('Missing required field: project_id');
  }

  if (!data.project_name) {
    throw new Error('Missing required field: project_name');
  }

  if (!data.repository_url) {
    throw new Error('Missing required field: repository_url');
  }

  if (!data.branch) {
    throw new Error('Missing required field: branch');
  }

  // ✅ VALIDAÇÃO DE CONSTRAINT (se $ disponível)
  if ($) {
    const validation = await validateUniqueProjectId($, data.project_id);

    if (!validation.valid) {
      const error = new Error(validation.message);
      error.constraint_violation = validation.constraint_violation;
      error.existing_project = validation.existing_project;
      error.suggestion = validation.suggestion;
      throw error;
    }
  }

  // Validação de URL do repositório
  if (!data.repository_url.startsWith('https://github.com/')) {
    throw new Error('Invalid repository_url: must be a GitHub HTTPS URL (https://github.com/...)');
  }

  // Validação de status
  const validStatuses = ['active', 'inactive', 'archived'];
  const status = data.status || 'active';
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
  }

  // Mapeia campos
  const mapped = {
    project_id: data.project_id.trim(),
    project_name: data.project_name.trim(),
    description: data.description?.trim() || '',
    owner_email: data.owner_email?.trim() || null,
    status: status,

    // ⭐ GitHub Configuration (URLs variáveis)
    repository_url: data.repository_url.trim(),
    branch: data.branch.trim(),
    code_base_path: data.code_base_path?.trim() || 'N8N/code/',
    prompts_base_path: data.prompts_base_path?.trim() || 'N8N/prompts/agents/',
    agents_base_path: data.agents_base_path?.trim() || 'N8N/agents/',
    projects_base_path: data.projects_base_path?.trim() || 'N8N/projects/',

    // Timestamps
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Validação de email (se fornecido)
  if (mapped.owner_email && !mapped.owner_email.includes('@')) {
    throw new Error('Invalid owner_email: must be a valid email address');
  }

  console.log(`✅ Project data mapped successfully: ${mapped.project_id}`);
  console.log(`   Repository: ${mapped.repository_url}`);
  console.log(`   Branch: ${mapped.branch}`);

  return mapped;
}

// Export para N8N Code Node
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { mapProjectData, validateUniqueProjectId };
}

// Auto-execução em Code Node
if (typeof $ !== 'undefined') {
  const inputData = $input.all()[0].json;
  return mapProjectData(inputData, $);
}
