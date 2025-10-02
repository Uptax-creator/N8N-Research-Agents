// ✅ RESPONSE PROCESSOR DINÂMICO V1.0 - GITHUB READY
const inputData = $input.first().json;

console.log('🔍 [RESPONSE DYNAMIC] PROCESSANDO RESPOSTA DO AI AGENT');
console.log('📋 Input keys:', Object.keys(inputData));

// ✅ EXTRAIR DADOS DO AI AGENT
const result_text = inputData.text || inputData.output || inputData.result || 'Resposta não disponível';
const agent_id = inputData.agent_id || inputData.node_transfer_vars?.agent_id || 'unknown';
const project_id = inputData.project_id || inputData.node_transfer_vars?.project_id || 'unknown';
const dateNow = inputData.dateNow || inputData.node_transfer_vars?.dateNow || new Date().toISOString();

// ✅ EXTRAIR CONTEXTO DE CONVERSAÇÃO
const conversation_context = inputData.conversation_context || {};
const node_transfer_vars = inputData.node_transfer_vars || {};
const envelope_metadata = inputData.envelope_metadata || {};

// ✅ CRIAR RESPOSTA ESTRUTURADA PARA FRONTEND
const response = {
  // ✅ STATUS E RESULTADO PRINCIPAL
  status: 'success',
  result: result_text,

  // ✅ VARIÁVEIS ESSENCIAIS
  agent_id: agent_id,
  project_id: project_id,
  dateNow: dateNow,

  // ✅ DADOS DA QUERY
  query: inputData.agent_context?.text || inputData.query || 'N/A',
  session_id: inputData.agent_context?.session_id || inputData.session_id,

  // ✅ INFORMAÇÕES MCP E TOOLS
  mcp_provider: inputData.mcp_provider || 'unknown',
  mcp_used: inputData.mcp_endpoint_http ? 'yes' : 'no',
  mcp_endpoint: inputData.mcp_endpoint_http || 'none',

  // ✅ CONTEXTO DE CONVERSAÇÃO
  conversation: {
    user_response: conversation_context.user_response,
    history_count: (conversation_context.history || []).length,
    turn_count: conversation_context.turn_count || 0
  },

  // ✅ INFORMAÇÕES DE PROCESSAMENTO
  processing: {
    execution_id: node_transfer_vars.execution_id,
    components_loaded: node_transfer_vars.components_count || 0,
    pipeline: node_transfer_vars.processing_pipeline || [],
    processed_at: new Date().toISOString()
  },

  // ✅ METADATA COMPLETA
  metadata: {
    ...envelope_metadata,
    response_version: 'dynamic_v1.0',
    response_processor: 'github_dynamic',
    result_length: result_text.length,
    processing_completed: new Date().toISOString(),
    success: true
  },

  // ✅ DEBUG INFO (removível em produção)
  debug: {
    input_keys: Object.keys(inputData),
    agent_context_exists: !!inputData.agent_context,
    mcp_endpoint_set: !!inputData.mcp_endpoint_http,
    conversation_context_exists: !!inputData.conversation_context,
    loaded_from_github: true
  }
};

console.log('✅ [RESPONSE DYNAMIC] RESPOSTA ESTRUTURADA CRIADA:');
console.log('- Status:', response.status);
console.log('- Agent ID:', response.agent_id);
console.log('- Project ID:', response.project_id);
console.log('- Date Now:', response.dateNow);
console.log('- Execution ID:', response.processing.execution_id);
console.log('- MCP Used:', response.mcp_used);
console.log('- Result Length:', response.metadata.result_length);
console.log('- Components Loaded:', response.processing.components_loaded);

return [{ json: response }];