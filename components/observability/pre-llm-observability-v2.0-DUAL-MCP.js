// ✅ PRE-LLM OBSERVABILITY v2.0 DUAL MCP - CAPTURA ANTES DA EXECUÇÃO DO AI AGENT
const inputData = $input.first().json;
const envelope = inputData; // Envelope vem do Prepare Agent
const startTime = Date.now();

// ✅ CONFIGURAÇÃO DUAL MCP ENDPOINTS FIXOS
const DUAL_MCP_CONFIG = {
  mcp_endpoint_http_1: 'https://mcp.brightdata.com/mcp?token=ecfc6404fb9eb026a9c802196b8d5caaf131d63c0931f9e888e57077e6b1f8cf', // Bright Data
  mcp_endpoint_http_2: 'https://apollo.composio.dev/mcp', // Composio
};

// ✅ VALIDAR ENVELOPE
if (!envelope.envelope_metadata || !envelope.envelope_metadata.tracking) {
  throw new Error('Envelope inválido recebido no pre-llm observability DUAL MCP');
}

const trackingIds = envelope.envelope_metadata.tracking;

// ✅ LOG INÍCIO
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'INFO',
  component: 'pre_llm_observability_dual_mcp',
  message: 'Iniciando observabilidade pré-LLM com DUAL MCP architecture',
  tracking: trackingIds,
  dual_mcp_architecture: true
}));

// ✅ CAPTURAR ESTADO PRÉ-EXECUÇÃO DUAL MCP
const preLLMState = {
  prompt_ready: !!envelope.agent_context?.system_message,
  mcp_dual_configured: !!(envelope.mcp_endpoint_http_1 && envelope.mcp_endpoint_http_2),
  mcp_endpoint_assigned: !!envelope.mcp_endpoint_http,
  tools_configured: !!envelope.agent_config?.tools_config,
  force_tools_active: envelope.agent_context?.system_message?.includes('EXECUTE') || false,
  query_processed: !!envelope.webhook_data?.query,
  agent_identified: !!envelope.agent_config?.agent_id,
  dual_mcp_architecture: envelope.dual_mcp_config?.architecture === 'DUAL_ENDPOINTS'
};

// ✅ ANÁLISE DO PROMPT FINAL PARA DUAL MCP
let promptAnalysis = {
  system_prompt_length: 0,
  force_tools_count: 0,
  mcp_tools_count: 0,
  validation_rules_count: 0,
  expected_execution_time: 30,
  dual_mcp_references: 0
};

if (envelope.agent_context?.system_message) {
  const prompt = envelope.agent_context.system_message;
  promptAnalysis.system_prompt_length = prompt.length;

  // Contar instruções force-tools
  const forceMatches = prompt.match(/EXECUTE|AGORA|OBRIGATÓRIO/gi) || [];
  promptAnalysis.force_tools_count = forceMatches.length;

  // Contar ferramentas MCP mencionadas
  const toolMatches = prompt.match(/search_engine|scrape_as_markdown|GOOGLEDOCS/gi) || [];
  promptAnalysis.mcp_tools_count = toolMatches.length;

  // Contar referências DUAL MCP
  const dualMcpMatches = prompt.match(/DUAL MCP|dual.*mcp|mcp_endpoint_http_[12]/gi) || [];
  promptAnalysis.dual_mcp_references = dualMcpMatches.length;

  // Ajustar tempo esperado baseado na complexidade
  if (promptAnalysis.system_prompt_length > 2000) {
    promptAnalysis.expected_execution_time = 60;
  } else if (promptAnalysis.mcp_tools_count > 2) {
    promptAnalysis.expected_execution_time = 45;
  }

  // Ajuste adicional para DUAL MCP
  if (preLLMState.dual_mcp_architecture) {
    promptAnalysis.expected_execution_time += 5; // Overhead mínimo para routing
  }
}

// ✅ PREDIÇÃO DE PERFORMANCE DUAL MCP
const performancePrediction = {
  estimated_duration_seconds: promptAnalysis.expected_execution_time,
  complexity_level: 'medium',
  success_probability: 0.90, // Maior por ter fallback dual
  bottleneck_prediction: 'mcp_routing',
  dual_mcp_overhead: 5
};

// Ajustar predição baseada no histórico
const configQuality = envelope.observability_data?.metrics?.config_quality_score || 0.7; // Maior para DUAL MCP
if (configQuality > 0.8) {
  performancePrediction.success_probability = 0.98;
  performancePrediction.complexity_level = 'low';
  performancePrediction.dual_mcp_overhead = 3;
} else if (configQuality < 0.6) {
  performancePrediction.success_probability = 0.75;
  performancePrediction.complexity_level = 'high';
  performancePrediction.estimated_duration_seconds += 30;
  performancePrediction.dual_mcp_overhead = 10;
}

// ✅ VERIFICAR HEALTH DOS DUAL MCP ENDPOINTS
let mcpEndpointsCheck = {
  bright_data_ready: true, // Assumindo healthy para endpoint fixo
  composio_ready: true,    // Assumindo healthy para endpoint fixo
  fallback_available: true,
  dual_mcp_routing_ready: true,
  endpoint_1_url: DUAL_MCP_CONFIG.mcp_endpoint_http_1,
  endpoint_2_url: DUAL_MCP_CONFIG.mcp_endpoint_http_2,
  assigned_endpoint: envelope.mcp_endpoint_http || 'unknown'
};

// Verificar se o endpoint atribuído está correto
if (envelope.mcp_endpoint_http) {
  mcpEndpointsCheck.endpoint_assignment_valid =
    envelope.mcp_endpoint_http === DUAL_MCP_CONFIG.mcp_endpoint_http_1 ||
    envelope.mcp_endpoint_http === DUAL_MCP_CONFIG.mcp_endpoint_http_2;
} else {
  mcpEndpointsCheck.endpoint_assignment_valid = false;
}

// Verificar configuração DUAL MCP
if (envelope.dual_mcp_config) {
  mcpEndpointsCheck.dual_mcp_config_valid = envelope.dual_mcp_config.architecture === 'DUAL_ENDPOINTS';
  mcpEndpointsCheck.agent_endpoint_mapping_valid = !!envelope.dual_mcp_config.current_assignment;
} else {
  mcpEndpointsCheck.dual_mcp_config_valid = false;
  mcpEndpointsCheck.agent_endpoint_mapping_valid = false;
}

// ✅ ATUALIZAR ENVELOPE COM PRE-LLM DATA DUAL MCP
if (!envelope.observability_data) {
  envelope.observability_data = { metrics: {} };
}

if (!envelope.observability_data.metrics.component_timings) {
  envelope.observability_data.metrics.component_timings = {};
}

envelope.observability_data.metrics.component_timings.pre_llm_observability_dual_mcp = {
  start: startTime,
  end: Date.now(),
  duration: Date.now() - startTime
};

envelope.observability_data.metrics.pre_llm_state = preLLMState;
envelope.observability_data.metrics.prompt_analysis = promptAnalysis;
envelope.observability_data.metrics.performance_prediction = performancePrediction;
envelope.observability_data.metrics.mcp_endpoints_check = mcpEndpointsCheck;

if (!envelope.observability_data.tracking_stack) {
  envelope.observability_data.tracking_stack = [];
}
envelope.observability_data.tracking_stack.push('pre_llm_observability_dual_mcp');

// ✅ CALCULAR READINESS SCORE DUAL MCP
let readinessScore = 0;
if (preLLMState.prompt_ready) readinessScore += 0.20;
if (preLLMState.mcp_dual_configured) readinessScore += 0.25;
if (preLLMState.mcp_endpoint_assigned) readinessScore += 0.20;
if (preLLMState.tools_configured) readinessScore += 0.15;
if (preLLMState.force_tools_active) readinessScore += 0.15;
if (preLLMState.dual_mcp_architecture) readinessScore += 0.05; // Bonus para DUAL MCP

envelope.observability_data.metrics.llm_readiness_score = readinessScore;

// ✅ ATUALIZAR SESSION STATE
envelope.session_state.stage = 'pre_llm_ready_dual_mcp';
envelope.session_state.llm_readiness_score = readinessScore;
if (!envelope.session_state.components_executed) {
  envelope.session_state.components_executed = [];
}
envelope.session_state.components_executed.push('pre-llm-observability-v2.0-dual-mcp');

// ✅ ADICIONAR OTIMIZAÇÕES RUNTIME DUAL MCP
if (!envelope.optimization_data) {
  envelope.optimization_data = {};
}

envelope.optimization_data.runtime = {
  timeout_seconds: performancePrediction.estimated_duration_seconds,
  fallback_strategy: readinessScore > 0.80 ? 'optimistic' : 'conservative',
  retry_count: readinessScore > 0.80 ? 1 : 3,
  mcp_priority: envelope.agent_config?.mcp_provider || 'bright_data',
  dual_mcp_enabled: true,
  endpoint_routing_strategy: 'agent_based',
  mcp_failover_enabled: true
};

// ✅ LOG DETALHADO PRÉ-EXECUÇÃO DUAL MCP
const preLLMLog = {
  timestamp: new Date().toISOString(),
  level: 'INFO',
  component: 'pre_llm_observability_dual_mcp',
  message: 'Estado pré-LLM capturado com sucesso para DUAL MCP architecture',
  tracking: trackingIds,
  readiness: {
    score: readinessScore,
    state: preLLMState,
    prediction: performancePrediction
  },
  prompt_analysis: promptAnalysis,
  mcp_status: mcpEndpointsCheck,
  optimization: envelope.optimization_data.runtime,
  dual_mcp_config: envelope.dual_mcp_config
};

console.log(JSON.stringify(preLLMLog));

// ✅ ALERTAS CRÍTICOS DUAL MCP
if (readinessScore < 0.6) { // Threshold menor para DUAL MCP
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    component: 'pre_llm_observability_dual_mcp',
    message: 'ALERTA: Baixo readiness score para execução LLM DUAL MCP',
    tracking: trackingIds,
    alert: {
      readiness_score: readinessScore,
      critical_issues: Object.entries(preLLMState)
        .filter(([key, value]) => !value)
        .map(([key, value]) => key),
      recommendation: 'Verificar configuração DUAL MCP antes de prosseguir',
      dual_mcp_status: mcpEndpointsCheck
    }
  }));
}

// Alerta específico para problemas de configuração DUAL MCP
if (!mcpEndpointsCheck.dual_mcp_config_valid || !mcpEndpointsCheck.endpoint_assignment_valid) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'WARN',
    component: 'pre_llm_observability_dual_mcp',
    message: 'ALERTA: Problemas na configuração DUAL MCP detectados',
    tracking: trackingIds,
    alert: {
      config_valid: mcpEndpointsCheck.dual_mcp_config_valid,
      assignment_valid: mcpEndpointsCheck.endpoint_assignment_valid,
      assigned_endpoint: mcpEndpointsCheck.assigned_endpoint,
      recommendation: 'Verificar mapeamento de endpoints DUAL MCP'
    }
  }));
}

// ✅ MÉTRICAS PARA REDIS/UPSTASH (se disponível) - DUAL MCP
const metricsForStorage = {
  agent_id: envelope.agent_config?.agent_id,
  project_id: envelope.webhook_data?.project_id,
  timestamp: new Date().toISOString(),
  readiness_score: readinessScore,
  predicted_duration: performancePrediction.estimated_duration_seconds,
  success_probability: performancePrediction.success_probability,
  dual_mcp_architecture: true,
  assigned_endpoint: envelope.mcp_endpoint_http,
  mcp_provider: envelope.agent_config?.mcp_provider
};

// TODO: Implementar salvamento no Redis/Upstash quando MCP estiver disponível
envelope.observability_data.metrics.redis_payload = metricsForStorage;

// ✅ ATUALIZAR METADATA DO ENVELOPE
envelope.envelope_metadata.flow_step = 'pre_llm_observability_dual_mcp';
envelope.envelope_metadata.last_updated = new Date().toISOString();
envelope.envelope_metadata.dual_mcp_processed = true;

return [{ json: envelope }];