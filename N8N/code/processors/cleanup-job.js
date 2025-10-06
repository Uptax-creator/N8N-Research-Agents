// 🧹 CLEANUP JOB - Retenção de dados (simula particionamento)
// Compensa falta de particionamento automático no N8N Data Tables

/**
 * Cleanup de execuções antigas
 * Equivale a: DELETE FROM wrk_execution WHERE createdAt < (NOW() - INTERVAL '180 days')
 */
async function cleanupOldExecutions($, retentionDays = 180) {
  const DataTableHelper = require('../loaders/data-table-helper-enhanced.js');
  const helper = new DataTableHelper($);

  try {
    // 1. Calcular data de corte
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffISO = cutoffDate.toISOString();

    console.log(`🧹 Starting cleanup: retention=${retentionDays} days, cutoff=${cutoffISO}`);

    // 2. Buscar execuções antigas
    // Nota: N8N Data Tables pode não suportar operadores de comparação
    // Workaround: buscar todas e filtrar no código
    const allExecutions = await helper.get('wrk_execution', {}, {
      includeIsolation: false
    });

    const oldExecutions = allExecutions.filter((exec) => {
      const createdAt = new Date(exec.createdAt);
      return createdAt < cutoffDate;
    });

    console.log(`📊 Found ${oldExecutions.length} executions to delete (out of ${allExecutions.length} total)`);

    // 3. Delete execuções e estados relacionados (cascade manual)
    let deletedExecutions = 0;
    let deletedStates = 0;

    for (const execution of oldExecutions) {
      // Delete estados relacionados
      const statesResult = await helper.deleteWhere('wrk_state', {
        execution_id: execution.execution_id
      });
      deletedStates += statesResult.deletedCount || 0;

      // Delete execução
      await helper.delete('wrk_execution', execution.id, {
        cascadeDelete: false
      });
      deletedExecutions++;
    }

    // 4. Estatísticas
    const result = {
      success: true,
      retention_days: retentionDays,
      cutoff_date: cutoffISO,
      total_executions_before: allExecutions.length,
      deleted_executions: deletedExecutions,
      deleted_states: deletedStates,
      total_executions_after: allExecutions.length - deletedExecutions,
      cleanup_timestamp: new Date().toISOString()
    };

    console.log('✅ Cleanup completed:', JSON.stringify(result, null, 2));

    return result;
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    return {
      success: false,
      error: error.message,
      cleanup_timestamp: new Date().toISOString()
    };
  }
}

/**
 * Cleanup de variáveis antigas (se existir tabela wrk_variables)
 */
async function cleanupOldVariables($, retentionDays = 90) {
  const DataTableHelper = require('../loaders/data-table-helper-enhanced.js');
  const helper = new DataTableHelper($);

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const allVariables = await helper.get('wrk_variables', {}, {
      includeIsolation: false
    });

    const oldVariables = allVariables.filter((v) => {
      const createdAt = new Date(v.createdAt);
      return createdAt < cutoffDate && v.variable_type !== 'permanent';
    });

    let deletedCount = 0;
    for (const variable of oldVariables) {
      await helper.delete('wrk_variables', variable.id);
      deletedCount++;
    }

    return {
      success: true,
      retention_days: retentionDays,
      deleted_variables: deletedCount,
      cleanup_timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      cleanup_timestamp: new Date().toISOString()
    };
  }
}

/**
 * Cleanup completo (todas as tabelas)
 */
async function cleanupAll($, config = {}) {
  const {
    executions_retention_days = 180,
    variables_retention_days = 90,
    dry_run = false
  } = config;

  console.log('🧹 Starting full cleanup...');
  console.log('Config:', JSON.stringify(config, null, 2));

  if (dry_run) {
    console.log('⚠️ DRY RUN MODE - No deletions will be performed');
    return {
      dry_run: true,
      message: 'Preview only, set dry_run=false to execute'
    };
  }

  const results = {
    executions: await cleanupOldExecutions($, executions_retention_days),
    variables: await cleanupOldVariables($, variables_retention_days)
  };

  return {
    success: results.executions.success && results.variables.success,
    results: results,
    total_deleted:
      (results.executions.deleted_executions || 0) +
      (results.executions.deleted_states || 0) +
      (results.variables.deleted_variables || 0)
  };
}

// Export para uso em nodes N8N
module.exports = {
  cleanupOldExecutions,
  cleanupOldVariables,
  cleanupAll
};

// Uso direto em Code node:
if (typeof $ !== 'undefined') {
  // Exemplo: Executar cleanup de 180 dias
  return cleanupOldExecutions($, 180);
}
