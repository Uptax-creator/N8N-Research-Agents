// 🔍 VARIABLE PRECEDENCE RESOLVER
// Simula SQL VIEW para resolver precedência de variáveis
// Precedência: execution > webhook > workflow > project

/**
 * Resolve variável seguindo ordem de precedência
 * @param {string} variableName - Nome da variável
 * @param {object} context - Contexto com execution_id, webhook_id, workflow_id, project_id
 * @returns {Promise<object|null>} - Variável encontrada ou null
 */
async function getVariableWithPrecedence($, variableName, context) {
  const DataTableHelper = require('../loaders/data-table-helper-enhanced.js');
  const helper = new DataTableHelper($);

  const {
    execution_id,
    webhook_id,
    workflow_id,
    project_id
  } = context;

  // 1. Escopo EXECUTION (mais específico)
  if (execution_id) {
    const execVar = await helper.get('wrk_variables', {
      variable_name: variableName,
      execution_id: execution_id
    });

    if (execVar.length > 0) {
      return {
        ...execVar[0],
        resolved_from: 'execution',
        precedence_level: 1
      };
    }
  }

  // 2. Escopo WEBHOOK
  if (webhook_id) {
    const webhookVar = await helper.get('wrk_variables', {
      variable_name: variableName,
      webhook_id: webhook_id,
      execution_id: null
    });

    if (webhookVar.length > 0) {
      return {
        ...webhookVar[0],
        resolved_from: 'webhook',
        precedence_level: 2
      };
    }
  }

  // 3. Escopo WORKFLOW
  if (workflow_id) {
    const workflowVar = await helper.get('wrk_variables', {
      variable_name: variableName,
      workflow_id: workflow_id,
      execution_id: null,
      webhook_id: null
    });

    if (workflowVar.length > 0) {
      return {
        ...workflowVar[0],
        resolved_from: 'workflow',
        precedence_level: 3
      };
    }
  }

  // 4. Escopo PROJECT (mais genérico)
  if (project_id) {
    const projectVar = await helper.get('wrk_variables', {
      variable_name: variableName,
      project_id: project_id,
      execution_id: null,
      webhook_id: null,
      workflow_id: null
    });

    if (projectVar.length > 0) {
      return {
        ...projectVar[0],
        resolved_from: 'project',
        precedence_level: 4
      };
    }
  }

  // Variável não encontrada
  return null;
}

/**
 * Resolve múltiplas variáveis de uma vez
 */
async function resolveVariables($, variableNames, context) {
  const results = {};

  for (const varName of variableNames) {
    results[varName] = await getVariableWithPrecedence($, varName, context);
  }

  return results;
}

/**
 * Salva variável no escopo apropriado
 */
async function setVariable($, variableName, variableValue, scope, context) {
  const DataTableHelper = require('../loaders/data-table-helper-enhanced.js');
  const helper = new DataTableHelper($);

  const variableData = {
    variable_name: variableName,
    variable_value_json: JSON.stringify(variableValue),
    variable_type: scope,
    project_id: context.project_id,
    workflow_id: scope === 'project' ? null : context.workflow_id,
    webhook_id: ['project', 'workflow'].includes(scope) ? null : context.webhook_id,
    execution_id: scope === 'execution' ? context.execution_id : null,
    created_at: new Date().toISOString()
  };

  // Verifica se já existe (upsert pattern)
  const existing = await helper.get('wrk_variables', {
    variable_name: variableName,
    variable_type: scope,
    execution_id: variableData.execution_id,
    webhook_id: variableData.webhook_id,
    workflow_id: variableData.workflow_id,
    project_id: variableData.project_id
  });

  if (existing.length > 0) {
    // Update
    return await helper.update('wrk_variables', existing[0].id, {
      variable_value_json: variableData.variable_value_json,
      updated_at: new Date().toISOString()
    });
  } else {
    // Insert
    return await helper.insert('wrk_variables', variableData, {
      validateUnique: true,
      uniqueFields: [
        'variable_name',
        'variable_type',
        'execution_id',
        'webhook_id',
        'workflow_id',
        'project_id'
      ]
    });
  }
}

/**
 * Lista todas as variáveis disponíveis no contexto (com precedência aplicada)
 */
async function listAvailableVariables($, context) {
  const DataTableHelper = require('../loaders/data-table-helper-enhanced.js');
  const helper = new DataTableHelper($);

  // Buscar todas as variáveis que podem se aplicar ao contexto
  const filters = {
    project_id: context.project_id
  };

  const allVariables = await helper.get('wrk_variables', filters, {
    includeIsolation: false
  });

  // Agrupar por nome e aplicar precedência
  const variableMap = {};

  for (const variable of allVariables) {
    const name = variable.variable_name;

    // Determinar nível de precedência
    let precedence = 4; // project
    if (variable.execution_id === context.execution_id) {
      precedence = 1;
    } else if (variable.webhook_id === context.webhook_id) {
      precedence = 2;
    } else if (variable.workflow_id === context.workflow_id) {
      precedence = 3;
    }

    // Manter apenas a de maior precedência (menor número)
    if (!variableMap[name] || precedence < variableMap[name].precedence_level) {
      variableMap[name] = {
        ...variable,
        precedence_level: precedence,
        resolved_from: ['execution', 'webhook', 'workflow', 'project'][precedence - 1]
      };
    }
  }

  return Object.values(variableMap);
}

/**
 * Delete variável de um escopo específico
 */
async function deleteVariable($, variableName, scope, context) {
  const DataTableHelper = require('../loaders/data-table-helper-enhanced.js');
  const helper = new DataTableHelper($);

  const filters = {
    variable_name: variableName,
    variable_type: scope,
    project_id: context.project_id,
    workflow_id: scope === 'project' ? null : context.workflow_id,
    webhook_id: ['project', 'workflow'].includes(scope) ? null : context.webhook_id,
    execution_id: scope === 'execution' ? context.execution_id : null
  };

  return await helper.deleteWhere('wrk_variables', filters);
}

// Export para uso em nodes N8N
module.exports = {
  getVariableWithPrecedence,
  resolveVariables,
  setVariable,
  listAvailableVariables,
  deleteVariable
};

// Uso direto em Code node:
if (typeof $ !== 'undefined') {
  // Exemplo: Resolver variável 'api_key' no contexto atual
  const context = {
    execution_id: 'exec_123',
    webhook_id: 'webhook_001',
    workflow_id: 'work-1001',
    project_id: 'project_001'
  };

  return getVariableWithPrecedence($, 'api_key', context);
}
