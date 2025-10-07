/**
 * Project Data Mapper - Schema Simplificado
 * Usa apenas colunas existentes na tabela cad_projects
 * @version 2.0.0
 */

/**
 * Valida se project_id já existe
 */
function validateUniqueProject(allProjects, project_id) {
  const existing = allProjects.filter(
    (project) => project.project_id === project_id && project.status === 'active'
  );

  if (existing.length === 0) {
    return {
      valid: true,
      message: `✅ Can insert project ${project_id}`,
      can_insert: true
    };
  }

  return {
    valid: false,
    constraint_violation: 'DUPLICATE_PROJECT_ID',
    message: `❌ Project ${project_id} already exists (id=${existing[0].id})`,
    can_insert: false,
    existing_project: {
      id: existing[0].id,
      project_name: existing[0].project_name,
      status: existing[0].status
    },
    suggestion: 'Use a different project_id or UPDATE existing project'
  };
}

/**
 * Mapeia dados do webhook - APENAS COLUNAS EXISTENTES
 */
function mapProjectData(body, allProjects) {
  const data = body.data || body;

  // Validações obrigatórias
  if (!data.project_id) throw new Error('Missing required field: project_id');
  if (!data.project_name) throw new Error('Missing required field: project_name');

  // Validação de constraint
  if (allProjects && allProjects.length >= 0) {
    const validation = validateUniqueProject(allProjects, data.project_id);

    if (!validation.valid) {
      const error = new Error(validation.message);
      error.constraint_violation = validation.constraint_violation;
      error.existing_project = validation.existing_project;
      error.suggestion = validation.suggestion;
      throw error;
    }
  }

  // Mapear APENAS campos que existem na tabela
  const mapped = {
    project_id: data.project_id.trim(),
    project_name: data.project_name.trim(),
    description: data.description?.trim() || '',
    owner_email: data.owner_email?.trim() || null,
    status: data.status || 'active',

    // GitHub Configuration (se fornecidos)
    repository_url: data.repository_url?.trim() || null,
    branch: data.branch?.trim() || null,
    code_base_path: data.code_base_path?.trim() || null,
    prompts_base_path: data.prompts_base_path?.trim() || null,
    agents_base_path: data.agents_base_path?.trim() || null,
    projects_base_path: data.projects_base_path?.trim() || null
  };

  // Validações opcionais
  if (mapped.owner_email && !mapped.owner_email.includes('@')) {
    throw new Error('Invalid owner_email: must be a valid email address');
  }

  if (mapped.repository_url && !mapped.repository_url.startsWith('https://github.com/')) {
    throw new Error('Invalid repository_url: must be a GitHub HTTPS URL');
  }

  const validStatuses = ['active', 'inactive', 'archived'];
  if (!validStatuses.includes(mapped.status)) {
    throw new Error(`Invalid status: ${mapped.status}. Must be one of: ${validStatuses.join(', ')}`);
  }

  console.log(`✅ Project data mapped: ${mapped.project_id}`);
  return mapped;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { mapProjectData, validateUniqueProject };
}
