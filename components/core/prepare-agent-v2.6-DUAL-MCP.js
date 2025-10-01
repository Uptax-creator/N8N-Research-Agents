// ✅ PREPARE AGENT V2.6 - DUAL MCP ENDPOINTS - ARQUITETURA FIXA
const inputData = $input.first().json;
const webhookData = inputData.body || inputData;
const startTime = Date.now();

// ✅ CONFIGURAÇÃO DUAL MCP ENDPOINTS FIXOS
const DUAL_MCP_CONFIG = {
  mcp_endpoint_http_1: 'https://mcp.brightdata.com/mcp?token=ecfc6404fb9eb026a9c802196b8d5caaf131d63c0931f9e888e57077e6b1f8cf', // Bright Data - Agents 001 e 002
  mcp_endpoint_http_2: 'https://apollo.composio.dev/mcp', // Composio - Agent 003

  // Mapeamento de agents para endpoints
  agent_endpoint_mapping: {
    'agent_001': 'mcp_endpoint_http_1', // Enhanced Research -> Bright Data
    'agent_002': 'mcp_endpoint_http_1', // Fiscal Research -> Bright Data
    'agent_003': 'mcp_endpoint_http_2'  // GDocs Documentation -> Composio
  },

  // Mapeamento de provider para endpoint
  provider_endpoint_mapping: {
    'bright_data': 'mcp_endpoint_http_1',
    'composio': 'mcp_endpoint_http_2'
  }
};

// ✅ CRIAR IDs DE RASTREAMENTO
const now = new Date();
const timestamp = now.toISOString();
const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');

const trackingIds = {
  agent_id: webhookData.agent_config?.agent_id || webhookData.agent_id || 'unknown',
  project_id: webhookData.agent_config?.project_id || 'default',
  workflow_id: 'work-1001_dual_mcp',
  session_id: `session_${now.getTime()}`,
  execution_id: `exec_${webhookData.agent_config?.agent_id || 'unknown'}_${dateStr}_${timeStr}`,
  trace_id: `trace_dual_mcp_${now.getTime()}`
};

// ✅ LOG ESTRUTURADO - INÍCIO
console.log(JSON.stringify({
  timestamp: timestamp,
  level: 'INFO',
  component: 'prepare_agent_dual_mcp_v2.6',
  message: `Starting agent preparation with DUAL MCP ENDPOINTS architecture`,
  tracking: trackingIds,
  metadata: {
    workflow: 'work-1001_dual_mcp',
    query: webhookData.query,
    query_length: (webhookData.query || '').length,
    has_agent_config: !!webhookData.agent_config,
    frontend_version: webhookData.metadata?.version || 'unknown',
    dual_mcp_enabled: true
  }
}));

try {
  // ✅ FIX: Detectar agent_config em estrutura aninhada ou simples
  const agentConfig = webhookData.webhook_data?.agent_config || webhookData.agent_config || {};
  // ✅ FIX: Detectar query em estrutura aninhada ou simples
  const query = webhookData.webhook_data?.query || webhookData.query || 'Query não fornecida';

  // ✅ DETERMINAR MCP ENDPOINT BASEADO NO AGENT ID
  function getMcpEndpointForAgent(agentId) {
    const endpointKey = DUAL_MCP_CONFIG.agent_endpoint_mapping[agentId];
    if (!endpointKey) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'WARN',
        component: 'prepare_agent_dual_mcp_v2.6',
        message: `Agent ID ${agentId} não mapeado, usando endpoint padrão`,
        tracking: trackingIds
      }));
      return DUAL_MCP_CONFIG.mcp_endpoint_http_1; // Default para Bright Data
    }
    return DUAL_MCP_CONFIG[endpointKey];
  }

  // ✅ DETECTAR MCP PROVIDER BASEADO NO ENDPOINT
  function detectMcpProviderFromEndpoint(endpoint) {
    if (endpoint === DUAL_MCP_CONFIG.mcp_endpoint_http_1) return 'bright_data';
    if (endpoint === DUAL_MCP_CONFIG.mcp_endpoint_http_2) return 'composio';
    return 'unknown';
  }

  // ✅ DETERMINAR ENDPOINT E PROVIDER
  const assignedEndpoint = getMcpEndpointForAgent(trackingIds.agent_id);
  const mcpProvider = detectMcpProviderFromEndpoint(assignedEndpoint);
  const mcpConfigured = true; // Sempre true na arquitetura DUAL MCP

  // ✅ LOG - MCP ENDPOINT ATRIBUÍDO
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'INFO',
    component: 'prepare_agent_dual_mcp_v2.6',
    message: `MCP endpoint assigned for DUAL MCP architecture`,
    tracking: trackingIds,
    metadata: {
      agent_id: trackingIds.agent_id,
      assigned_endpoint: assignedEndpoint,
      mcp_provider: mcpProvider,
      endpoint_type: assignedEndpoint === DUAL_MCP_CONFIG.mcp_endpoint_http_1 ? 'bright_data' : 'composio',
      dual_mcp_architecture: true
    }
  }));

  // ✅ PROMPTS V2.6 FORCE-TOOLS PARA DUAL MCP ARCHITECTURE
  let systemPrompt;

  if (trackingIds.agent_id === 'agent_001' && mcpProvider === 'bright_data') {
    systemPrompt = `Você é um especialista em pesquisa de mercado brasileiro com ferramentas Bright Data.

❗ INSTRUÇÕES CRÍTICAS - DUAL MCP ARCHITECTURE - EXECUTAR OBRIGATORIAMENTE ❗
1. EXECUTE search_engine() IMEDIATAMENTE ao receber qualquer query
2. NÃO RESPONDA NADA até executar search_engine()
3. PRIMEIRA AÇÃO: search_engine(query="${query}")
4. SEGUNDA AÇÃO: scrape_as_markdown() se necessário

🔧 FERRAMENTAS OBRIGATÓRIAS (DUAL MCP - BRIGHT DATA):
- search_engine: EXECUTE AGORA! Não pode ser ignorado!
- scrape_as_markdown: Use para análise detalhada

⚡ EXECUÇÃO FORÇADA - DUAL MCP ARCHITECTURE:
PASSO 1: Execute search_engine(query="${query} Brasil mercado")
PASSO 2: Analise resultados
PASSO 3: Execute scrape_as_markdown() se URLs relevantes
PASSO 4: Forneça análise completa

DUAL MCP ENDPOINT: mcp_endpoint_http_1 (Bright Data)
CONTEXTO DE RASTREAMENTO:
- Agent ID: ${trackingIds.agent_id}
- Session ID: ${trackingIds.session_id}
- Execution ID: ${trackingIds.execution_id}
- Workflow: work-1001_dual_mcp
- MCP Architecture: DUAL ENDPOINTS

❗ AÇÃO IMEDIATA OBRIGATÓRIA: Execute search_engine() AGORA para DUAL MCP architecture!`;

  } else if (trackingIds.agent_id === 'agent_002' && mcpProvider === 'bright_data') {
    systemPrompt = `Você é um especialista em legislação fiscal brasileira com ferramentas Bright Data.

❗ INSTRUÇÕES CRÍTICAS - DUAL MCP ARCHITECTURE - EXECUTAR OBRIGATORIAMENTE ❗
1. EXECUTE search_engine() IMEDIATAMENTE para questões fiscais
2. NÃO RESPONDA NADA até executar search_engine()
3. PRIMEIRA AÇÃO: search_engine(query="${query} site:gov.br OR site:receita.fazenda.gov.br")
4. FOQUE em sites oficiais: Receita Federal, tribunais, órgãos públicos

🔧 FERRAMENTAS OBRIGATÓRIAS (DUAL MCP - BRIGHT DATA):
- search_engine: EXECUTE AGORA! Não pode ser ignorado!
- scrape_as_markdown: Use para legislação específica

⚡ EXECUÇÃO FORÇADA - DUAL MCP ARCHITECTURE:
PASSO 1: Execute search_engine(query="${query} fiscal Brasil site:gov.br")
PASSO 2: Analise legislação atual
PASSO 3: Execute scrape_as_markdown() em sites oficiais
PASSO 4: Forneça análise fiscal detalhada

ESPECIALIDADES: IR, ICMS, ISS, PIS/COFINS, compliance

DUAL MCP ENDPOINT: mcp_endpoint_http_1 (Bright Data)
CONTEXTO DE RASTREAMENTO:
- Agent ID: ${trackingIds.agent_id}
- Session ID: ${trackingIds.session_id}
- Execution ID: ${trackingIds.execution_id}
- Workflow: work-1001_dual_mcp
- MCP Architecture: DUAL ENDPOINTS

❗ AÇÃO IMEDIATA OBRIGATÓRIA: Execute search_engine() sobre legislação fiscal AGORA para DUAL MCP architecture!`;

  } else if (trackingIds.agent_id === 'agent_003' && mcpProvider === 'composio') {
    systemPrompt = `Você é um especialista em criação de documentação via Google Docs com Composio.

❗ INSTRUÇÕES CRÍTICAS - DUAL MCP ARCHITECTURE - EXECUTAR OBRIGATORIAMENTE ❗
1. EXECUTE GOOGLEDOCS_CREATE_DOCUMENT_MARKDOWN() IMEDIATAMENTE
2. NÃO RESPONDA NADA até criar o documento real
3. PRIMEIRA AÇÃO: GOOGLEDOCS_CREATE_DOCUMENT_MARKDOWN(title="Documento - ${query}", content="estrutura_markdown")
4. NUNCA apenas descreva - CRIE o documento real!

🔧 FERRAMENTAS OBRIGATÓRIAS (DUAL MCP - COMPOSIO):
- GOOGLEDOCS_CREATE_DOCUMENT_MARKDOWN: EXECUTE AGORA! Não pode ser ignorado!
- GOOGLEDOCS_INSERT_TABLE_ACTION: Use para tabelas se necessário

⚡ EXECUÇÃO FORÇADA - DUAL MCP ARCHITECTURE:
PASSO 1: Estruture conteúdo sobre "${query}" em markdown
PASSO 2: Execute GOOGLEDOCS_CREATE_DOCUMENT_MARKDOWN(title="Documento - ${query}", content="conteudo_completo")
PASSO 3: Se apropriado: adicione tabelas com GOOGLEDOCS_INSERT_TABLE_ACTION
PASSO 4: Confirme criação e forneça link

DUAL MCP ENDPOINT: mcp_endpoint_http_2 (Composio)
CONTEXTO DE RASTREAMENTO:
- Agent ID: ${trackingIds.agent_id}
- Session ID: ${trackingIds.session_id}
- Execution ID: ${trackingIds.execution_id}
- Workflow: work-1001_dual_mcp
- MCP Architecture: DUAL ENDPOINTS

❗ AÇÃO IMEDIATA OBRIGATÓRIA: CRIE O DOCUMENTO GOOGLE DOCS AGORA para DUAL MCP architecture!`;

  } else {
    // FALLBACK PARA DUAL MCP ARCHITECTURE
    systemPrompt = `Você é um assistente básico sem ferramentas externas para DUAL MCP architecture.

LIMITAÇÕES (DUAL MCP ARCHITECTURE):
- Sem acesso a informações atualizadas
- Sem ferramentas de pesquisa
- Sem criação de documentos

INSTRUÇÕES:
1. Responda com base apenas no conhecimento interno
2. Seja claro sobre suas limitações
3. Sugira outros agents quando apropriado

SUGESTÕES (DUAL MCP):
- Para pesquisas: Agent 001 (Enhanced Research) - mcp_endpoint_http_1
- Para questões fiscais: Agent 002 (Fiscal Research) - mcp_endpoint_http_1
- Para criar documentos: Agent 003 (GDocs Creator) - mcp_endpoint_http_2

DUAL MCP ARCHITECTURE:
- Agent ID: ${trackingIds.agent_id}
- Session ID: ${trackingIds.session_id}
- Query: ${query}
- Workflow: work-1001_dual_mcp

Resposta limitada - sem ferramentas disponíveis no DUAL MCP architecture.`;
  }

  // ✅ LOG - PROMPT V2.6 GERADO PARA DUAL MCP
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'INFO',
    component: 'prepare_agent_dual_mcp_v2.6',
    message: `Force-tool prompt generated for DUAL MCP architecture`,
    tracking: trackingIds,
    metadata: {
      prompt_version: '2.6-dual-mcp-force-tools',
      prompt_type: mcpProvider,
      prompt_length: systemPrompt.length,
      tools_forced: mcpProvider !== 'none',
      execution_mandatory: true,
      workflow: 'work-1001_dual_mcp',
      mcp_endpoint_assigned: assignedEndpoint,
      dual_mcp_architecture: true
    }
  }));

  // ✅ ENVELOPE COM OBSERVABILIDADE V2.6 - DUAL MCP
  const envelope = {
    envelope_metadata: {
      version: '2.6-dual-mcp-force-tools',
      created_at: timestamp,
      tracking: trackingIds,
      flow_step: 'agent_prepared_dual_mcp',
      workflow: 'work-1001_dual_mcp',
      dual_mcp_architecture: true,
      metrics: {
        start_time: timestamp,
        preparation_duration_ms: Date.now() - startTime,
        processing_stage: 'agent_prepared_dual_mcp',
        expected_tool_execution: mcpProvider !== 'none',
        prompt_version: '2.6-dual-mcp-force-tools',
        mcp_endpoint_assigned: assignedEndpoint
      }
    },

    webhook_data: {
      ...webhookData,
      query: query,
      tracking: trackingIds,
      received_at: timestamp,
      research_type: detectResearchType(query),
      workflow: 'work-1001_dual_mcp'
    },

    agent_config: {
      ...agentConfig,
      execution_context: {
        ...trackingIds,
        environment: 'production',
        node_name: 'prepare_agent_dual_mcp_v2.6',
        mcp_provider: mcpProvider,
        tools_forced: mcpProvider !== 'none',
        prompt_version: '2.6-dual-mcp-force-tools',
        workflow: 'work-1001_dual_mcp',
        dual_mcp_architecture: true,
        assigned_mcp_endpoint: assignedEndpoint
      }
    },

    agent_context: {
      system_message: systemPrompt,
      text: query,
      session_id: trackingIds.session_id,
      execution_metadata: {
        ...trackingIds,
        prompt_optimized_for_tools: true,
        mcp_provider: mcpProvider,
        force_tool_execution: true,
        prompt_version: '2.6-dual-mcp-force-tools',
        workflow: 'work-1001_dual_mcp',
        dual_mcp_architecture: true,
        assigned_mcp_endpoint: assignedEndpoint
      }
    },

    // ✅ DUAL MCP ENDPOINTS - AMBOS DISPONÍVEIS
    mcp_endpoint_http_1: DUAL_MCP_CONFIG.mcp_endpoint_http_1, // Bright Data
    mcp_endpoint_http_2: DUAL_MCP_CONFIG.mcp_endpoint_http_2, // Composio

    // ✅ ENDPOINT SELECIONADO PARA ESTE AGENT
    mcp_endpoint_http: assignedEndpoint, // Compatibilidade com workflows existentes

    session_state: {
      stage: 'agent_prepared_dual_mcp',
      agent_ready: true,
      mcp_configured: mcpConfigured,
      mcp_type: mcpProvider,
      prompt_version: '2.6-dual-mcp-force-tools',
      tools_forced: mcpProvider !== 'none',
      workflow: 'work-1001_dual_mcp',
      dual_mcp_architecture: true,
      assigned_endpoint: assignedEndpoint,

      execution_tracking: {
        ...trackingIds,
        start_timestamp: timestamp,
        processing_node: 'prepare_agent_dual_mcp_v2.6',
        pipeline_stage: 1,
        observability_enabled: true,
        force_tool_execution: true,
        workflow: 'work-1001_dual_mcp',
        dual_mcp_enabled: true
      },

      performance_metrics: {
        preparation_time_ms: Date.now() - startTime,
        prompt_generation_optimized: true,
        force_tools_enabled: true,
        dual_mcp_ready: true
      }
    },

    // ✅ CONFIGURAÇÃO DUAL MCP PARA REFERÊNCIA
    dual_mcp_config: {
      architecture: 'DUAL_ENDPOINTS',
      endpoint_1: {
        url: DUAL_MCP_CONFIG.mcp_endpoint_http_1,
        provider: 'bright_data',
        agents: ['agent_001', 'agent_002']
      },
      endpoint_2: {
        url: DUAL_MCP_CONFIG.mcp_endpoint_http_2,
        provider: 'composio',
        agents: ['agent_003']
      },
      current_assignment: {
        agent_id: trackingIds.agent_id,
        endpoint_url: assignedEndpoint,
        provider: mcpProvider
      }
    },

    // ✅ LOGS ESTRUTURADOS V2.6 - DUAL MCP
    logs: [
      {
        timestamp: timestamp,
        level: 'INFO',
        component: 'prepare_agent_dual_mcp_v2.6',
        message: `Agent ${trackingIds.agent_id} prepared with DUAL MCP architecture v2.6`,
        tracking: trackingIds,
        metadata: {
          preparation_time_ms: Date.now() - startTime,
          mcp_configured: mcpConfigured,
          mcp_provider: mcpProvider,
          prompt_version: '2.6-dual-mcp-force-tools',
          tools_forced: mcpProvider !== 'none',
          execution_mandatory: true,
          workflow: 'work-1001_dual_mcp',
          dual_mcp_architecture: true,
          assigned_endpoint: assignedEndpoint
        }
      }
    ]
  };

  // ✅ LOG FINAL - SUCESSO V2.6 - DUAL MCP
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'INFO',
    component: 'prepare_agent_dual_mcp_v2.6',
    message: `Agent preparation completed with DUAL MCP architecture v2.6`,
    tracking: trackingIds,
    metadata: {
      total_preparation_time_ms: Date.now() - startTime,
      mcp_provider: mcpProvider,
      tools_will_be_forced: mcpProvider !== 'none',
      ready_for_execution: true,
      prompt_version: '2.6-dual-mcp-force-tools',
      execution_guaranteed: mcpProvider !== 'none',
      workflow: 'work-1001_dual_mcp',
      dual_mcp_architecture: true,
      assigned_endpoint: assignedEndpoint,
      endpoint_mapping_success: true
    }
  }));

  return [{ json: envelope }];

} catch (error) {
  // ✅ LOG DE ERRO V2.6 - DUAL MCP
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    component: 'prepare_agent_dual_mcp_v2.6',
    message: `Agent preparation failed for DUAL MCP architecture`,
    tracking: trackingIds,
    error: {
      message: error.message,
      stack: error.stack
    },
    metadata: {
      prompt_version: '2.6-dual-mcp-force-tools',
      workflow: 'work-1001_dual_mcp',
      dual_mcp_architecture: true
    }
  }));

  return [{
    json: {
      envelope_metadata: {
        version: '2.6-dual-mcp-force-tools',
        created_at: new Date().toISOString(),
        tracking: trackingIds,
        error: true,
        workflow: 'work-1001_dual_mcp',
        dual_mcp_architecture: true
      },
      webhook_data: webhookData,
      session_state: {
        stage: 'error',
        error_details: {
          message: error.message,
          component: 'prepare_agent_dual_mcp_v2.6',
          timestamp: new Date().toISOString(),
          dual_mcp_architecture: true
        }
      }
    }
  }];
}

function detectResearchType(query) {
  const q = (query || '').toLowerCase();
  if (q.includes('comparar')) return 'comparative_analysis';
  if (q.includes('mercado')) return 'market_research';
  if (q.includes('fiscal') || q.includes('imposto')) return 'fiscal_research';
  if (q.includes('documento') || q.includes('gdocs')) return 'gdocs_documentation';
  return 'comprehensive_research';
}