// ✅ ENVELOPE PROCESSOR DINÂMICO V1.0 - GITHUB READY
const inputData = $input.first().json;
const componentUrls = inputData.componentes || {};

// ✅ VARIÁVEIS ESSENCIAIS
const dateNow = new Date();
const agent_id = inputData.agent_id || 'unknown';
const project_id = inputData.project_id || 'default_project';

console.log('🚀 [ENVELOPE DYNAMIC] INICIANDO PROCESSAMENTO');
console.log('📋 Agent ID:', agent_id);
console.log('📋 Project ID:', project_id);
console.log('📋 Date Now:', dateNow.toISOString());
console.log('📋 Components para carregar:', Object.keys(componentUrls).length);

// ✅ CARREGAR TODOS OS COMPONENTES EM PARALELO (N8N COMPATIBLE)
async function loadAllComponents() {
  try {
    const axios = require('axios');
    const loadPromises = Object.entries(componentUrls).map(async ([key, url]) => {
      console.log(`🔗 Carregando ${key}: ${url}`);
      const response = await axios.get(url);

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status} para ${key}: ${url}`);
      }

      const data = url.endsWith('.json') ? response.data : response.data;
      console.log(`✅ ${key} carregado:`, typeof data, data.length || Object.keys(data).length);
      return [key, data];
    });

    const loadedComponents = Object.fromEntries(await Promise.all(loadPromises));
    console.log('✅ TODOS OS COMPONENTES CARREGADOS:', Object.keys(loadedComponents));
    return loadedComponents;

  } catch (error) {
    console.error('❌ ERRO NO CARREGAMENTO:', error.message);
    return {};
  }
}

// ✅ EXECUTAR CARREGAMENTO
const loadedComponents = await loadAllComponents();

// ✅ EXTRAIR CONFIGURAÇÕES DINÂMICAS
const prompts = loadedComponents.system_prompts || {};
const mcpConfigs = loadedComponents.mcp_configs || {};
const agentConfigs = loadedComponents.agent_configs || {};

// ✅ CRIAR ENVELOPE COMPLETO COM TODAS AS VARIÁVEIS
const envelope = {
  // ✅ DADOS ORIGINAIS DO FRONTEND
  ...inputData,

  // ✅ VARIÁVEIS ESSENCIAIS
  agent_id: agent_id,
  project_id: project_id,
  dateNow: dateNow.toISOString(),

  // ✅ CONTEXTO DO AGENTE
  agent_context: {
    text: inputData.query || 'Query não fornecida',
    system_message: prompts[agent_id]?.template?.replace('{{query}}', inputData.query) ||
                   `Analise e responda sobre: "${inputData.query}"`,
    session_id: inputData.session_id || `session_${dateNow.getTime()}`,
    agent_id: agent_id,
    project_id: project_id
  },

  // ✅ CONFIGURAÇÃO MCP DINÂMICA
  mcp_endpoint_http: mcpConfigs[agent_id]?.endpoint ||
                    mcpConfigs.default?.endpoint ||
                    'https://mcp.brightdata.com/sse?token=ecfc6404fb9eb026a9c802196b8d5caaf131d63c0931f9e888e57077e6b1f8cf',
  mcp_provider: mcpConfigs[agent_id]?.provider || 'bright_data',

  // ✅ CONTEXTO DE CONVERSAÇÃO
  conversation_context: {
    user_response: inputData.user_response || null,
    history: inputData.conversation_history || [],
    turn_count: (inputData.conversation_history || []).length,
    last_interaction: dateNow.toISOString()
  },

  // ✅ VARIÁVEIS DE TRANSFERÊNCIA ENTRE NODES
  node_transfer_vars: {
    agent_id: agent_id,
    project_id: project_id,
    dateNow: dateNow.toISOString(),
    execution_id: `exec_${agent_id}_${dateNow.getTime()}`,
    processing_pipeline: ['envelope', 'ai_agent', 'response'],
    loaded_components: loadedComponents,
    components_count: Object.keys(loadedComponents).length
  },

  // ✅ CONFIGURAÇÃO DO AGENTE
  agent_config: {
    ...agentConfigs[agent_id],
    agent_id: agent_id,
    project_id: project_id,
    tools: mcpConfigs[agent_id]?.tools || ['search_engine'],
    query: inputData.query
  },

  // ✅ METADATA PARA DEBUG E OBSERVABILIDADE
  envelope_metadata: {
    created_at: dateNow.toISOString(),
    version: 'dynamic_v1.0',
    agent_id: agent_id,
    project_id: project_id,
    components_loaded: Object.keys(loadedComponents).length,
    variables_created: true,
    user_response_included: !!inputData.user_response,
    mcp_endpoint_set: true,
    processing_mode: 'dynamic_github_loading'
  }
};

console.log('✅ ENVELOPE DINÂMICO CRIADO COM SUCESSO:');
console.log('- Agent ID:', envelope.agent_id);
console.log('- Project ID:', envelope.project_id);
console.log('- Date Now:', envelope.dateNow);
console.log('- Execution ID:', envelope.node_transfer_vars.execution_id);
console.log('- MCP Endpoint:', envelope.mcp_endpoint_http);
console.log('- Components Loaded:', envelope.node_transfer_vars.components_count);
console.log('- System Prompt Length:', envelope.agent_context.system_message.length);

return [{ json: envelope }];