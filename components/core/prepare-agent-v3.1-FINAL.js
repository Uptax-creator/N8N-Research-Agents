// ✅ PREPARE AGENT V3.1 - FIXED ENVELOPE GUARANTEED
const inputData = $input.first().json;
const webhookData = inputData.webhook_data || inputData.body || inputData;

console.log('🚀 [PREPARE V3.1] INICIANDO COM ENVELOPE GARANTIDO');
console.log('📥 Input keys:', Object.keys(inputData));

// ✅ BUSCAR DADOS COM FALLBACKS MÚLTIPLOS
function findQuery(obj) {
  const sources = [
    obj.query,
    obj.webhook_data?.query,
    obj.webhook_data?.webhook_data?.query,
    obj.body?.query,
    inputData.query
  ];

  for (const source of sources) {
    if (source && source !== 'Query não fornecida') {
      console.log('✅ Query encontrada:', source);
      return source;
    }
  }

  console.log('⚠️ Query não encontrada, usando default');
  return 'Query não fornecida';
}

function findAgentId(obj) {
  const sources = [
    obj.agent_id,
    obj.agent_config?.agent_id,
    obj.webhook_data?.agent_id,
    obj.webhook_data?.agent_config?.agent_id,
    obj.body?.agent_id,
    inputData.agent_id
  ];

  for (const source of sources) {
    if (source) {
      console.log('✅ Agent ID encontrado:', source);
      return source;
    }
  }

  console.log('⚠️ Agent ID não encontrado, usando unknown');
  return 'unknown';
}

// ✅ DETECTAR VALORES
const query = findQuery(webhookData);
const agent_id = findAgentId(webhookData);

console.log('🎯 Query final:', query);
console.log('🎯 Agent ID final:', agent_id);

// ✅ ENDPOINTS FIXOS - GARANTIDOS
const BRIGHT_DATA_URL = "https://mcp.brightdata.com/mcp?token=ecfc6404fb9eb026a9c802196b8d5caaf131d63c0931f9e888e57077e6b1f8cf";
const COMPOSIO_URL = "https://apollo-3irns8zl6-composio.vercel.app/v3/mcp/aab98bef-8816-4873-95f6-45615ca063d4/mcp?include_composio_helper_actions=true";

// ✅ MAPEAMENTO FORÇADO
let mcp_endpoint_http_1 = "";
let mcp_endpoint_http_2 = "";
let primary_mcp = "";

if (agent_id === 'agent_001' || agent_id === 'agent_002') {
  mcp_endpoint_http_1 = BRIGHT_DATA_URL;
  mcp_endpoint_http_2 = "";
  primary_mcp = BRIGHT_DATA_URL;
  console.log(`🔌 Agent ${agent_id} → BRIGHT DATA (HTTP 1)`);
} else if (agent_id === 'agent_003') {
  mcp_endpoint_http_1 = "";
  mcp_endpoint_http_2 = COMPOSIO_URL;
  primary_mcp = COMPOSIO_URL;
  console.log(`🔌 Agent ${agent_id} → COMPOSIO (HTTP 2)`);
} else {
  mcp_endpoint_http_1 = BRIGHT_DATA_URL;
  mcp_endpoint_http_2 = COMPOSIO_URL;
  primary_mcp = BRIGHT_DATA_URL;
  console.log(`🔌 Agent ${agent_id} → AMBOS MCPs`);
}

// ✅ FORÇAR VERIFICAÇÃO
console.log('🔍 VERIFICAÇÃO DE URLs:');
console.log(`mcp_endpoint_http_1: ${mcp_endpoint_http_1 ? '✅ SET' : '❌ EMPTY'}`);
console.log(`mcp_endpoint_http_2: ${mcp_endpoint_http_2 ? '✅ SET' : '❌ EMPTY'}`);

// ✅ PROMPTS FORCE-TOOLS
let systemPrompt = "";

switch (agent_id) {
  case 'agent_001':
    systemPrompt = `INSTRUÇÕES OBRIGATÓRIAS:
1. USE search_engine() IMEDIATAMENTE
2. Pesquise: "${query}"
3. Analise mercado brasileiro
AÇÃO: search_engine(query="${query} Brasil mercado")`;
    break;

  case 'agent_002':
    systemPrompt = `INSTRUÇÕES OBRIGATÓRIAS:
1. USE search_engine() para legislação
2. Pesquise: "${query}"
3. Foque em sites .gov.br
AÇÃO: search_engine(query="${query} legislação site:gov.br")`;
    break;

  case 'agent_003':
    systemPrompt = `INSTRUÇÕES OBRIGATÓRIAS:
1. USE GOOGLEDOCS_CREATE_DOCUMENT_MARKDOWN()
2. Crie documento: "${query}"
3. NÃO apenas descreva - CRIE
AÇÃO: GOOGLEDOCS_CREATE_DOCUMENT_MARKDOWN(title="${query}")`;
    break;

  default:
    systemPrompt = `Responda sobre: "${query}"`;
}

// ✅ TIMESTAMPS
const now = new Date();
const timestamp = now.toISOString();
const sessionId = `session_${now.getTime()}`;

// ✅ ENVELOPE COMPLETO GARANTIDO
const guaranteedEnvelope = {
  // PRESERVAR DADOS ANTERIORES
  ...inputData,

  // METADATA
  envelope_metadata: {
    ...(inputData.envelope_metadata || {}),
    version: '3.1-guaranteed-envelope',
    created_at: timestamp,
    flow_step: 'agent_prepared_v3.1',
    envelope_guaranteed: true
  },

  // WEBHOOK DATA
  webhook_data: {
    ...webhookData,
    agent_id: agent_id,
    query: query
  },

  // AGENT CONFIG
  agent_config: {
    ...(inputData.agent_config || {}),
    agent_id: agent_id,
    mcp_1_active: !!mcp_endpoint_http_1,
    mcp_2_active: !!mcp_endpoint_http_2
  },

  // AGENT CONTEXT - CRÍTICO PARA AI AGENT
  agent_context: {
    system_message: systemPrompt,
    text: query,
    session_id: sessionId
  },

  // ✅ MCP ENDPOINTS - SEMPRE PRESENTES
  mcp_endpoint_http: primary_mcp,
  mcp_endpoint_http_1: mcp_endpoint_http_1,
  mcp_endpoint_http_2: mcp_endpoint_http_2,

  // SESSION STATE
  session_state: {
    ...(inputData.session_state || {}),
    stage: 'agent_prepared_v3.1',
    agent_ready: true,
    envelope_guaranteed: true,
    mcp_routing: {
      agent_id: agent_id,
      uses_mcp_1: !!mcp_endpoint_http_1,
      uses_mcp_2: !!mcp_endpoint_http_2,
      primary_provider: mcp_endpoint_http_1 ? 'bright_data' : 'composio'
    }
  },

  // DEBUG GARANTIDO
  debug_v31: {
    envelope_generated_at: timestamp,
    agent_id_detected: agent_id,
    query_detected: query,
    mcp_1_url_set: !!mcp_endpoint_http_1,
    mcp_2_url_set: !!mcp_endpoint_http_2,
    mcp_1_length: mcp_endpoint_http_1.length,
    mcp_2_length: mcp_endpoint_http_2.length
  }
};

// ✅ VALIDAÇÃO FINAL
console.log('✅ ENVELOPE V3.1 GERADO:');
console.log(`- Agent ID: ${guaranteedEnvelope.agent_config.agent_id}`);
console.log(`- Query: ${guaranteedEnvelope.agent_context.text}`);
console.log(`- MCP 1: ${guaranteedEnvelope.mcp_endpoint_http_1 ? 'SET' : 'EMPTY'}`);
console.log(`- MCP 2: ${guaranteedEnvelope.mcp_endpoint_http_2 ? 'SET' : 'EMPTY'}`);
console.log(`- System Message: ${guaranteedEnvelope.agent_context.system_message ? 'SET' : 'EMPTY'}`);

return [{ json: guaranteedEnvelope }];