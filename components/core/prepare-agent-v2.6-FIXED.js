// ✅ PREPARE AGENT V2.6 FIXED - CORREÇÃO DEFINITIVA DA QUERY
const inputData = $input.first().json;
const webhookData = inputData.body || inputData;

// ✅ DEBUG - Ver estrutura completa
console.log('🔍 [DEBUG] Estrutura recebida:', JSON.stringify(webhookData, null, 2));

// ✅ FIX DEFINITIVO - Buscar query em QUALQUER nível
function findQuery(obj) {
  // Procura direta
  if (obj.query && obj.query !== 'Query não fornecida') return obj.query;

  // Procura em webhook_data
  if (obj.webhook_data?.query && obj.webhook_data.query !== 'Query não fornecida') {
    return obj.webhook_data.query;
  }

  // Procura em webhook_data.webhook_data (duplo aninhamento)
  if (obj.webhook_data?.webhook_data?.query) {
    return obj.webhook_data.webhook_data.query;
  }

  return null;
}

// ✅ FIX DEFINITIVO - Buscar agent_config em QUALQUER nível
function findAgentConfig(obj) {
  // Procura direta
  if (obj.agent_config && Object.keys(obj.agent_config).length > 0) {
    return obj.agent_config;
  }

  // Procura em webhook_data
  if (obj.webhook_data?.agent_config && Object.keys(obj.webhook_data.agent_config).length > 0) {
    return obj.webhook_data.agent_config;
  }

  // Procura em webhook_data.webhook_data (duplo aninhamento)
  if (obj.webhook_data?.webhook_data?.agent_config) {
    return obj.webhook_data.webhook_data.agent_config;
  }

  return {};
}

// ✅ APLICAR FIXES
const query = findQuery(webhookData) || 'Query não fornecida';
const agentConfig = findAgentConfig(webhookData);

console.log('✅ [FIX] Query detectada:', query);
console.log('✅ [FIX] Agent config:', agentConfig.agent_id || 'não encontrado');

// ✅ RESTO DO CÓDIGO ORIGINAL (com as variáveis corrigidas)
const startTime = Date.now();
const now = new Date();
const timestamp = now.toISOString();
const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');

const trackingIds = {
  agent_id: agentConfig.agent_id || webhookData.agent_id || 'unknown',
  project_id: agentConfig.project_id || webhookData.project_id || 'default',
  workflow_id: 'work-1001_mvp',
  session_id: `session_${now.getTime()}`,
  execution_id: `exec_${agentConfig.agent_id || 'unknown'}_${dateStr}_${timeStr}`,
  trace_id: `trace_work1001_${now.getTime()}`
};

// ✅ CONTINUA COM O PREPARE AGENT NORMAL...
// (resto do código igual ao original, mas usando 'query' e 'agentConfig' já corrigidos)

// O resto do código permanece igual...
// INCLUIR TODO O CÓDIGO DO PREPARE AGENT ORIGINAL AQUI
// mas já usando as variáveis 'query' e 'agentConfig' corrigidas

return [{
  json: {
    envelope_metadata: {
      version: '2.6-fixed',
      created_at: timestamp,
      tracking: trackingIds,
      flow_step: 'agent_prepared',
      query_detected: query !== 'Query não fornecida'
    },
    agent_config: agentConfig,
    agent_context: {
      system_message: `Query recebida: "${query}"`,
      text: query,
      session_id: trackingIds.session_id
    },
    mcp_endpoint_http: agentConfig.mcp_endpoint || '',
    session_state: {
      stage: 'agent_prepared',
      agent_ready: true,
      query_found: query !== 'Query não fornecida'
    }
  }
}];