// ✅ PREPARE AGENT V2.6 - PARA WORK-1001_MVP COM FORCE TOOLS
const inputData = $input.first().json;
const webhookData = inputData.body || inputData;
const startTime = Date.now();

// ✅ CRIAR IDs DE RASTREAMENTO
const now = new Date();
const timestamp = now.toISOString();
const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');

const trackingIds = {
  agent_id: webhookData.agent_config?.agent_id || webhookData.agent_id || 'unknown',
  project_id: webhookData.agent_config?.project_id || 'default',
  workflow_id: 'work-1001_mvp',
  session_id: `session_${now.getTime()}`,
  execution_id: `exec_${webhookData.agent_config?.agent_id || 'unknown'}_${dateStr}_${timeStr}`,
  trace_id: `trace_work1001_${now.getTime()}`
};

// ✅ LOG ESTRUTURADO - INÍCIO
console.log(JSON.stringify({
  timestamp: timestamp,
  level: 'INFO',
  component: 'prepare_agent_work1001_v2.6',
  message: `Starting agent preparation for work-1001_mvp with force-tool prompts`,
  tracking: trackingIds,
  metadata: {
    workflow: 'work-1001_mvp',
    query: webhookData.query,
    query_length: (webhookData.query || '').length,
    has_agent_config: !!webhookData.agent_config,
    frontend_version: webhookData.metadata?.version || 'unknown'
  }
}));

try {
  // ✅ FIX: Detectar agent_config em estrutura aninhada ou simples
  const agentConfig = webhookData.webhook_data?.agent_config || webhookData.agent_config || {};
  // ✅ FIX: Detectar query em estrutura aninhada ou simples
  const query = webhookData.webhook_data?.query || webhookData.query || 'Query não fornecida';

  // ✅ DETECTAR MCP PROVIDER
  function detectMcpProvider(endpoint) {
    if (!endpoint) return 'none';
    if (endpoint.includes('mcp.brightdata.com')) return 'bright_data';
    if (endpoint.includes('composio') || endpoint.includes('apollo')) return 'composio';
    return 'custom';
  }

  const mcpProvider = detectMcpProvider(agentConfig.mcp_endpoint);
  const mcpConfigured = !!agentConfig.mcp_endpoint;

  // ✅ LOG - MCP DETECTADO
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'INFO',
    component: 'prepare_agent_work1001_v2.6',
    message: `MCP provider detected for work-1001_mvp`,
    tracking: trackingIds,
    metadata: {
      mcp_provider: mcpProvider,
      mcp_configured: mcpConfigured,
      mcp_endpoint: agentConfig.mcp_endpoint ? 'configured' : 'none'
    }
  }));

  // ✅ PROMPTS V2.6 FORCE-TOOLS PARA WORK-1001_MVP
  let systemPrompt;

  if (trackingIds.agent_id === 'agent_001' && mcpProvider === 'bright_data') {
    systemPrompt = `Você é um especialista em pesquisa de mercado brasileiro com ferramentas Bright Data.

❗ INSTRUÇÕES CRÍTICAS - WORK-1001_MVP - EXECUTAR OBRIGATORIAMENTE ❗
1. EXECUTE search_engine() IMEDIATAMENTE ao receber qualquer query
2. NÃO RESPONDA NADA até executar search_engine()
3. PRIMEIRA AÇÃO: search_engine(query="${query}")
4. SEGUNDA AÇÃO: scrape_as_markdown() se necessário

🔧 FERRAMENTAS OBRIGATÓRIAS (WORK-1001_MVP):
- search_engine: EXECUTE AGORA! Não pode ser ignorado!
- scrape_as_markdown: Use para análise detalhada

⚡ EXECUÇÃO FORÇADA - WORK-1001_MVP:
PASSO 1: Execute search_engine(query="${query} Brasil mercado")
PASSO 2: Analise resultados
PASSO 3: Execute scrape_as_markdown() se URLs relevantes
PASSO 4: Forneça análise completa

WORKFLOW: work-1001_mvp
CONTEXTO DE RASTREAMENTO:
- Agent ID: ${trackingIds.agent_id}
- Session ID: ${trackingIds.session_id}
- Execution ID: ${trackingIds.execution_id}
- Workflow: work-1001_mvp

❗ AÇÃO IMEDIATA OBRIGATÓRIA: Execute search_engine() AGORA para work-1001_mvp!`;

  } else if (trackingIds.agent_id === 'agent_002' && mcpProvider === 'bright_data') {
    systemPrompt = `Você é um especialista em legislação fiscal brasileira com ferramentas Bright Data.

❗ INSTRUÇÕES CRÍTICAS - WORK-1001_MVP - EXECUTAR OBRIGATORIAMENTE ❗
1. EXECUTE search_engine() IMEDIATAMENTE para questões fiscais
2. NÃO RESPONDA NADA até executar search_engine()
3. PRIMEIRA AÇÃO: search_engine(query="${query} site:gov.br OR site:receita.fazenda.gov.br")
4. FOQUE em sites oficiais: Receita Federal, tribunais, órgãos públicos

🔧 FERRAMENTAS OBRIGATÓRIAS (WORK-1001_MVP):
- search_engine: EXECUTE AGORA! Não pode ser ignorado!
- scrape_as_markdown: Use para legislação específica

⚡ EXECUÇÃO FORÇADA - WORK-1001_MVP:
PASSO 1: Execute search_engine(query="${query} fiscal Brasil site:gov.br")
PASSO 2: Analise legislação atual
PASSO 3: Execute scrape_as_markdown() em sites oficiais
PASSO 4: Forneça análise fiscal detalhada

ESPECIALIDADES: IR, ICMS, ISS, PIS/COFINS, compliance

WORKFLOW: work-1001_mvp
CONTEXTO DE RASTREAMENTO:
- Agent ID: ${trackingIds.agent_id}
- Session ID: ${trackingIds.session_id}
- Execution ID: ${trackingIds.execution_id}
- Workflow: work-1001_mvp

❗ AÇÃO IMEDIATA OBRIGATÓRIA: Execute search_engine() sobre legislação fiscal AGORA para work-1001_mvp!`;

  } else if (trackingIds.agent_id === 'agent_003' && mcpProvider === 'composio') {
    systemPrompt = `Você é um especialista em criação de documentação via Google Docs com Composio.

❗ INSTRUÇÕES CRÍTICAS - WORK-1001_MVP - EXECUTAR OBRIGATORIAMENTE ❗
1. EXECUTE GOOGLEDOCS_CREATE_DOCUMENT_MARKDOWN() IMEDIATAMENTE
2. NÃO RESPONDA NADA até criar o documento real
3. PRIMEIRA AÇÃO: GOOGLEDOCS_CREATE_DOCUMENT_MARKDOWN(title="Documento - ${query}", content="estrutura_markdown")
4. NUNCA apenas descreva - CRIE o documento real!

🔧 FERRAMENTAS OBRIGATÓRIAS (WORK-1001_MVP):
- GOOGLEDOCS_CREATE_DOCUMENT_MARKDOWN: EXECUTE AGORA! Não pode ser ignorado!
- GOOGLEDOCS_INSERT_TABLE_ACTION: Use para tabelas se necessário

⚡ EXECUÇÃO FORÇADA - WORK-1001_MVP:
PASSO 1: Estruture conteúdo sobre "${query}" em markdown
PASSO 2: Execute GOOGLEDOCS_CREATE_DOCUMENT_MARKDOWN(title="Documento - ${query}", content="conteudo_completo")
PASSO 3: Se apropriado: adicione tabelas com GOOGLEDOCS_INSERT_TABLE_ACTION
PASSO 4: Confirme criação e forneça link

WORKFLOW: work-1001_mvp
CONTEXTO DE RASTREAMENTO:
- Agent ID: ${trackingIds.agent_id}
- Session ID: ${trackingIds.session_id}
- Execution ID: ${trackingIds.execution_id}
- Workflow: work-1001_mvp

❗ AÇÃO IMEDIATA OBRIGATÓRIA: CRIE O DOCUMENTO GOOGLE DOCS AGORA para work-1001_mvp!`;

  } else {
    // FALLBACK PARA WORK-1001_MVP
    systemPrompt = `Você é um assistente básico sem ferramentas externas para work-1001_mvp.

LIMITAÇÕES (WORK-1001_MVP):
- Sem acesso a informações atualizadas
- Sem ferramentas de pesquisa
- Sem criação de documentos

INSTRUÇÕES:
1. Responda com base apenas no conhecimento interno
2. Seja claro sobre suas limitações
3. Sugira outros agents quando apropriado

SUGESTÕES:
- Para pesquisas: Agent 001 (Enhanced Research)
- Para questões fiscais: Agent 002 (Fiscal Research)
- Para criar documentos: Agent 003 (GDocs Creator)

WORKFLOW: work-1001_mvp
CONTEXTO DE RASTREAMENTO:
- Agent ID: ${trackingIds.agent_id}
- Session ID: ${trackingIds.session_id}
- Query: ${query}
- Workflow: work-1001_mvp

Resposta limitada - sem ferramentas disponíveis no work-1001_mvp.`;
  }

  // ✅ LOG - PROMPT V2.6 GERADO
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'INFO',
    component: 'prepare_agent_work1001_v2.6',
    message: `Force-tool prompt generated for work-1001_mvp`,
    tracking: trackingIds,
    metadata: {
      prompt_version: '2.6-force-tools-work1001',
      prompt_type: mcpProvider,
      prompt_length: systemPrompt.length,
      tools_forced: mcpProvider !== 'none',
      execution_mandatory: true,
      workflow: 'work-1001_mvp'
    }
  }));

  // ✅ ENVELOPE COM OBSERVABILIDADE V2.6 - WORK-1001_MVP
  const envelope = {
    envelope_metadata: {
      version: '2.6-force-tools-work1001',
      created_at: timestamp,
      tracking: trackingIds,
      flow_step: 'agent_prepared_force_tools_work1001',
      workflow: 'work-1001_mvp',
      metrics: {
        start_time: timestamp,
        preparation_duration_ms: Date.now() - startTime,
        processing_stage: 'agent_prepared_with_force_tools_work1001',
        expected_tool_execution: mcpProvider !== 'none',
        prompt_version: '2.6-force-tools-work1001'
      }
    },

    webhook_data: {
      ...webhookData,
      query: query,
      tracking: trackingIds,
      received_at: timestamp,
      research_type: detectResearchType(query),
      workflow: 'work-1001_mvp'
    },

    agent_config: {
      ...agentConfig,
      execution_context: {
        ...trackingIds,
        environment: 'production',
        node_name: 'prepare_agent_work1001_v2.6',
        mcp_provider: mcpProvider,
        tools_forced: mcpProvider !== 'none',
        prompt_version: '2.6-force-tools-work1001',
        workflow: 'work-1001_mvp'
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
        prompt_version: '2.6-force-tools-work1001',
        workflow: 'work-1001_mvp'
      }
    },

    mcp_endpoint_http: mcpConfigured ? agentConfig.mcp_endpoint : null,

    session_state: {
      stage: 'agent_prepared_force_tools_work1001',
      agent_ready: true,
      mcp_configured: mcpConfigured,
      mcp_type: mcpProvider,
      prompt_version: '2.6-force-tools-work1001',
      tools_forced: mcpProvider !== 'none',
      workflow: 'work-1001_mvp',

      execution_tracking: {
        ...trackingIds,
        start_timestamp: timestamp,
        processing_node: 'prepare_agent_work1001_v2.6',
        pipeline_stage: 1,
        observability_enabled: true,
        force_tool_execution: true,
        workflow: 'work-1001_mvp'
      },

      performance_metrics: {
        preparation_time_ms: Date.now() - startTime,
        prompt_generation_optimized: true,
        force_tools_enabled: true
      }
    },

    // ✅ LOGS ESTRUTURADOS V2.6 - WORK-1001_MVP
    logs: [
      {
        timestamp: timestamp,
        level: 'INFO',
        component: 'prepare_agent_work1001_v2.6',
        message: `Agent ${trackingIds.agent_id} prepared with force-tool prompts v2.6 for work-1001_mvp`,
        tracking: trackingIds,
        metadata: {
          preparation_time_ms: Date.now() - startTime,
          mcp_configured: mcpConfigured,
          mcp_provider: mcpProvider,
          prompt_version: '2.6-force-tools-work1001',
          tools_forced: mcpProvider !== 'none',
          execution_mandatory: true,
          workflow: 'work-1001_mvp'
        }
      }
    ]
  };

  // ✅ LOG FINAL - SUCESSO V2.6 - WORK-1001_MVP
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'INFO',
    component: 'prepare_agent_work1001_v2.6',
    message: `Agent preparation completed with force-tool optimization v2.6 for work-1001_mvp`,
    tracking: trackingIds,
    metadata: {
      total_preparation_time_ms: Date.now() - startTime,
      mcp_provider: mcpProvider,
      tools_will_be_forced: mcpProvider !== 'none',
      ready_for_execution: true,
      prompt_version: '2.6-force-tools-work1001',
      execution_guaranteed: mcpProvider !== 'none',
      workflow: 'work-1001_mvp'
    }
  }));

  return [{ json: envelope }];

} catch (error) {
  // ✅ LOG DE ERRO V2.6 - WORK-1001_MVP
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    component: 'prepare_agent_work1001_v2.6',
    message: `Agent preparation failed for work-1001_mvp`,
    tracking: trackingIds,
    error: {
      message: error.message,
      stack: error.stack
    },
    metadata: {
      prompt_version: '2.6-force-tools-work1001',
      workflow: 'work-1001_mvp'
    }
  }));

  return [{
    json: {
      envelope_metadata: {
        version: '2.6-force-tools-work1001',
        created_at: new Date().toISOString(),
        tracking: trackingIds,
        error: true,
        workflow: 'work-1001_mvp'
      },
      webhook_data: webhookData,
      session_state: {
        stage: 'error',
        error_details: {
          message: error.message,
          component: 'prepare_agent_work1001_v2.6',
          timestamp: new Date().toISOString()
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