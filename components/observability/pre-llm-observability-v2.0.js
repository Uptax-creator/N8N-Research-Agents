// ✅ PRE-LLM OBSERVABILITY v2.0 - CAPTURA ANTES DA EXECUÇÃO DO AI AGENT
const inputData = $input.first().json;
const envelope = inputData; // Envelope vem do Prepare Agent
const startTime = Date.now();

// ✅ VALIDAR ENVELOPE
if (!envelope.envelope_metadata || !envelope.envelope_metadata.tracking_ids) {
  throw new Error('Envelope inválido recebido no pre-llm observability');
}

const trackingIds = envelope.envelope_metadata.tracking_ids;

// ✅ LOG INÍCIO
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'INFO',
  component: 'pre_llm_observability',
  message: 'Iniciando observabilidade pré-LLM',
  tracking: trackingIds
}));

// ✅ CAPTURAR ESTADO PRÉ-EXECUÇÃO
const preLLMState = {
  prompt_ready: !!envelope.llm_config?.system_prompt,
  mcp_configured: !!envelope.llm_config?.mcp_endpoints,
  tools_configured: !!envelope.llm_config?.tools_config,
  force_tools_active: envelope.llm_config?.system_prompt?.includes('EXECUTE') || false,
  query_processed: !!envelope.webhook_data?.query,
  agent_identified: !!envelope.agent_config?.agent_id
};

// ✅ ANÁLISE DO PROMPT FINAL
let promptAnalysis = {
  system_prompt_length: 0,
  force_tools_count: 0,
  mcp_tools_count: 0,
  validation_rules_count: 0,
  expected_execution_time: 30
};

if (envelope.llm_config?.system_prompt) {
  const prompt = envelope.llm_config.system_prompt;
  promptAnalysis.system_prompt_length = prompt.length;

  // Contar instruções force-tools
  const forceMatches = prompt.match(/EXECUTE|AGORA|OBRIGATÓRIO/gi) || [];
  promptAnalysis.force_tools_count = forceMatches.length;

  // Contar ferramentas MCP mencionadas
  const toolMatches = prompt.match(/search_engine|scrape_as_markdown|GOOGLEDOCS/gi) || [];
  promptAnalysis.mcp_tools_count = toolMatches.length;

  // Ajustar tempo esperado baseado na complexidade
  if (promptAnalysis.system_prompt_length > 2000) {
    promptAnalysis.expected_execution_time = 60;
  } else if (promptAnalysis.mcp_tools_count > 2) {
    promptAnalysis.expected_execution_time = 45;
  }
}

// ✅ PREDIÇÃO DE PERFORMANCE
const performancePrediction = {
  estimated_duration_seconds: promptAnalysis.expected_execution_time,
  complexity_level: 'medium',
  success_probability: 0.85,
  bottleneck_prediction: 'mcp_tools'
};

// Ajustar predição baseada no histórico
const configQuality = envelope.observability_data?.metrics?.config_quality_score || 0.5;
if (configQuality > 0.8) {
  performancePrediction.success_probability = 0.95;
  performancePrediction.complexity_level = 'low';
} else if (configQuality < 0.6) {
  performancePrediction.success_probability = 0.65;
  performancePrediction.complexity_level = 'high';
  performancePrediction.estimated_duration_seconds += 30;
}

// ✅ VERIFICAR HEALTH DOS MCP ENDPOINTS
let mcpEndpointsCheck = {
  bright_data_ready: false,
  composio_ready: false,
  fallback_available: true
};

if (envelope.llm_config?.mcp_endpoints) {
  mcpEndpointsCheck.bright_data_ready = !!envelope.llm_config.mcp_endpoints.bright_data;
  mcpEndpointsCheck.composio_ready = !!envelope.llm_config.mcp_endpoints.composio;
}

// ✅ ATUALIZAR ENVELOPE COM PRE-LLM DATA
envelope.observability_data.metrics.component_timings.pre_llm_observability = {
  start: startTime,
  end: Date.now(),
  duration: Date.now() - startTime
};

envelope.observability_data.metrics.pre_llm_state = preLLMState;
envelope.observability_data.metrics.prompt_analysis = promptAnalysis;
envelope.observability_data.metrics.performance_prediction = performancePrediction;
envelope.observability_data.metrics.mcp_endpoints_check = mcpEndpointsCheck;

envelope.observability_data.tracking_stack.push('pre_llm_observability');

// ✅ CALCULAR READINESS SCORE
let readinessScore = 0;
if (preLLMState.prompt_ready) readinessScore += 0.25;
if (preLLMState.mcp_configured) readinessScore += 0.25;
if (preLLMState.tools_configured) readinessScore += 0.25;
if (preLLMState.force_tools_active) readinessScore += 0.25;

envelope.observability_data.metrics.llm_readiness_score = readinessScore;

// ✅ ATUALIZAR SESSION STATE
envelope.session_state.stage = 'pre_llm_ready';
envelope.session_state.llm_readiness_score = readinessScore;
envelope.session_state.components_executed.push('pre-llm-observability-v2.0');

// ✅ ADICIONAR OTIMIZAÇÕES RUNTIME
envelope.optimization_data.runtime = {
  timeout_seconds: performancePrediction.estimated_duration_seconds,
  fallback_strategy: readinessScore > 0.75 ? 'optimistic' : 'conservative',
  retry_count: readinessScore > 0.75 ? 1 : 3,
  mcp_priority: envelope.agent_config?.mcp_provider || 'bright_data'
};

// ✅ LOG DETALHADO PRÉ-EXECUÇÃO
const preLLMLog = {
  timestamp: new Date().toISOString(),
  level: 'INFO',
  component: 'pre_llm_observability',
  message: 'Estado pré-LLM capturado com sucesso',
  tracking: trackingIds,
  readiness: {
    score: readinessScore,
    state: preLLMState,
    prediction: performancePrediction
  },
  prompt_analysis: promptAnalysis,
  mcp_status: mcpEndpointsCheck,
  optimization: envelope.optimization_data.runtime
};

console.log(JSON.stringify(preLLMLog));

// ✅ ALERTAS CRÍTICOS
if (readinessScore < 0.5) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    component: 'pre_llm_observability',
    message: 'ALERTA: Baixo readiness score para execução LLM',
    tracking: trackingIds,
    alert: {
      readiness_score: readinessScore,
      critical_issues: Object.entries(preLLMState)
        .filter(([key, value]) => !value)
        .map(([key, value]) => key),
      recommendation: 'Verificar configuração antes de prosseguir'
    }
  }));
}

// ✅ MÉTRICAS PARA REDIS/UPSTASH (se disponível)
const metricsForStorage = {
  agent_id: envelope.agent_config?.agent_id,
  project_id: envelope.webhook_data?.project_id,
  timestamp: new Date().toISOString(),
  readiness_score: readinessScore,
  predicted_duration: performancePrediction.estimated_duration_seconds,
  success_probability: performancePrediction.success_probability
};

// TODO: Implementar salvamento no Redis/Upstash quando MCP estiver disponível
envelope.observability_data.metrics.redis_payload = metricsForStorage;

// ✅ ATUALIZAR METADATA DO ENVELOPE
envelope.envelope_metadata.flow_step = 'pre_llm_observability';
envelope.envelope_metadata.last_updated = new Date().toISOString();

return [{ json: envelope }];