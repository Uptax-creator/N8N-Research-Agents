// ✅ PRE-OBSERVABILITY v2.0 - INICIALIZAÇÃO DO PIPELINE
const inputData = $input.first().json;
const webhookData = inputData.body || inputData;
const startTime = Date.now();

// ✅ CRIAR IDs DE RASTREAMENTO ÚNICOS
const now = new Date();
const timestamp = now.toISOString();
const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');

const trackingIds = {
  agent_id: webhookData.agent_id || 'unknown',
  project_id: webhookData.project_id || 'default',
  workflow_id: webhookData.workflow_id || 'work-1001_mvp',
  session_id: `session_${now.getTime()}`,
  execution_id: `exec_${webhookData.agent_id || 'unknown'}_${dateStr}_${timeStr}`,
  trace_id: `trace_${webhookData.project_id || 'default'}_${now.getTime()}`
};

// ✅ INICIALIZAR ENVELOPE v2.0
const envelope_v2 = {
  envelope_metadata: {
    version: '2.0-modular',
    created_at: timestamp,
    pipeline_components: ['pre-obs', 'csv-loader', 'post-obs', 'prepare-agent', 'optimizer'],
    tracking_ids: trackingIds,
    flow_step: 'pre_observability'
  },
  webhook_data: {
    ...webhookData,
    query: webhookData.query || 'Query não fornecida',
    format: webhookData.format || 'comprehensive_research',
    metadata: {
      version: '2.0',
      source: webhookData.metadata?.source || 'unknown',
      received_at: timestamp
    }
  },
  agent_config: {}, // Será preenchido pelo CSV Loader
  observability_data: {
    metrics: {
      start_time: timestamp,
      component_timings: {
        pre_observability: { start: startTime }
      },
      performance: {},
      mcp_health: {}
    },
    logs: [],
    errors: [],
    tracking_stack: ['pre_observability']
  },
  optimization_data: {
    pre: {},
    runtime: {},
    post: {}
  },
  session_state: {
    stage: 'pre_observability_initialized',
    csv_loaded: false,
    agent_found: false,
    mcp_status: 'unknown',
    components_executed: ['pre-observability-v2.0']
  }
};

// ✅ LOG ESTRUTURADO - INÍCIO DO PIPELINE
const logEntry = {
  timestamp: timestamp,
  level: 'INFO',
  component: 'pre_observability',
  message: 'Pipeline v2.0 iniciado',
  tracking: trackingIds,
  metadata: {
    query: webhookData.query,
    query_length: (webhookData.query || '').length,
    agent_id: webhookData.agent_id,
    project_id: webhookData.project_id,
    has_frontend_config: !!webhookData.agent_config,
    pipeline_version: '2.0-modular'
  },
  performance: {
    start_time: startTime,
    memory_usage: process.memoryUsage ? process.memoryUsage() : null
  }
};

console.log(JSON.stringify(logEntry));

// ✅ ANÁLISE INICIAL DA QUERY
let queryAnalysis = {
  language: 'pt-BR',
  complexity: 'medium',
  estimated_processing_time: 30,
  requires_web_search: true,
  requires_document_creation: false
};

if (webhookData.query) {
  const query = webhookData.query.toLowerCase();

  // Detectar complexidade
  if (query.length > 200 || query.includes('análise') || query.includes('relatório')) {
    queryAnalysis.complexity = 'high';
    queryAnalysis.estimated_processing_time = 60;
  } else if (query.length < 50) {
    queryAnalysis.complexity = 'low';
    queryAnalysis.estimated_processing_time = 15;
  }

  // Detectar necessidade de criação de documentos
  if (query.includes('documento') || query.includes('gdocs') || query.includes('criar')) {
    queryAnalysis.requires_document_creation = true;
  }

  // Detectar tipo de pesquisa
  if (query.includes('fiscal') || query.includes('tributário') || query.includes('lei')) {
    queryAnalysis.search_type = 'fiscal_research';
    queryAnalysis.requires_gov_sites = true;
  } else {
    queryAnalysis.search_type = 'general_research';
  }
}

// ✅ ADICIONAR ANÁLISE AO ENVELOPE
envelope_v2.observability_data.metrics.query_analysis = queryAnalysis;
envelope_v2.optimization_data.pre = {
  query_analysis: queryAnalysis,
  processing_hints: {
    timeout_suggestion: queryAnalysis.estimated_processing_time,
    mcp_priority: queryAnalysis.requires_web_search ? 'bright_data' : 'composio'
  }
};

// ✅ ATUALIZAR TIMING
const endTime = Date.now();
envelope_v2.observability_data.metrics.component_timings.pre_observability.end = endTime;
envelope_v2.observability_data.metrics.component_timings.pre_observability.duration = endTime - startTime;

// ✅ LOG FINAL
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'INFO',
  component: 'pre_observability',
  message: 'Pre-observability concluído com sucesso',
  tracking: trackingIds,
  metrics: {
    duration_ms: endTime - startTime,
    query_complexity: queryAnalysis.complexity,
    estimated_processing_time: queryAnalysis.estimated_processing_time
  }
}));

// ✅ RETORNAR ENVELOPE INICIALIZADO
return [{ json: envelope_v2 }];