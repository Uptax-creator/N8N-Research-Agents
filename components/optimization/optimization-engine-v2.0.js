// ✅ OPTIMIZATION ENGINE v2.0 - OTIMIZAÇÃO INTELIGENTE DO PIPELINE
const inputData = $input.first().json;
const envelope = inputData; // Envelope vem do Pre-LLM Observability
const startTime = Date.now();

// ✅ VALIDAR ENVELOPE
if (!envelope.envelope_metadata || !envelope.envelope_metadata.tracking_ids) {
  throw new Error('Envelope inválido recebido no optimization engine');
}

const trackingIds = envelope.envelope_metadata.tracking_ids;

// ✅ LOG INÍCIO
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'INFO',
  component: 'optimization_engine',
  message: 'Iniciando otimização inteligente do pipeline',
  tracking: trackingIds
}));

// ✅ COLETAR DADOS PARA OTIMIZAÇÃO
const optimizationInput = {
  query_complexity: envelope.observability_data?.metrics?.query_analysis?.complexity || 'medium',
  config_quality: envelope.observability_data?.metrics?.config_quality_score || 0.5,
  readiness_score: envelope.observability_data?.metrics?.llm_readiness_score || 0.5,
  agent_type: envelope.agent_config?.agent_type || 'unknown',
  mcp_provider: envelope.agent_config?.mcp_provider || 'unknown',
  predicted_duration: envelope.observability_data?.metrics?.performance_prediction?.estimated_duration_seconds || 30
};

// ✅ OTIMIZAÇÃO DE QUERY
let queryOptimization = {
  original_query: envelope.webhook_data?.query || '',
  enhanced_query: '',
  search_terms_added: [],
  context_improvement: false
};

if (envelope.webhook_data?.query) {
  let enhancedQuery = envelope.webhook_data.query;

  // Adicionar contexto brasileiro se não presente
  if (!enhancedQuery.toLowerCase().includes('brasil') &&
      !enhancedQuery.toLowerCase().includes('mercado brasileiro') &&
      envelope.agent_config?.agent_type === 'enhanced_research') {
    enhancedQuery += ' mercado brasileiro';
    queryOptimization.search_terms_added.push('mercado brasileiro');
    queryOptimization.context_improvement = true;
  }

  // Adicionar termos fiscais específicos
  if (envelope.agent_config?.agent_type === 'fiscal_research') {
    if (!enhancedQuery.toLowerCase().includes('legislação') &&
        !enhancedQuery.toLowerCase().includes('receita federal')) {
      enhancedQuery += ' legislação receita federal';
      queryOptimization.search_terms_added.push('legislação receita federal');
      queryOptimization.context_improvement = true;
    }
  }

  queryOptimization.enhanced_query = enhancedQuery;
}

// ✅ OTIMIZAÇÃO DE TIMEOUT DINÂMICO
let timeoutOptimization = {
  base_timeout: optimizationInput.predicted_duration,
  adjusted_timeout: optimizationInput.predicted_duration,
  adjustment_factor: 1.0,
  adjustment_reason: 'baseline'
};

// Ajustar baseado na qualidade da configuração
if (optimizationInput.config_quality < 0.6) {
  timeoutOptimization.adjustment_factor = 1.5;
  timeoutOptimization.adjustment_reason = 'low_config_quality';
} else if (optimizationInput.config_quality > 0.9) {
  timeoutOptimization.adjustment_factor = 0.8;
  timeoutOptimization.adjustment_reason = 'high_config_quality';
}

// Ajustar baseado na complexidade da query
if (optimizationInput.query_complexity === 'high') {
  timeoutOptimization.adjustment_factor *= 1.3;
  timeoutOptimization.adjustment_reason += '_high_complexity';
} else if (optimizationInput.query_complexity === 'low') {
  timeoutOptimization.adjustment_factor *= 0.7;
  timeoutOptimization.adjustment_reason += '_low_complexity';
}

timeoutOptimization.adjusted_timeout = Math.round(
  timeoutOptimization.base_timeout * timeoutOptimization.adjustment_factor
);

// ✅ SELEÇÃO INTELIGENTE DE FALLBACK
let fallbackStrategy = {
  primary_agent: envelope.agent_config?.agent_id || 'unknown',
  fallback_chain: [],
  fallback_probability: 0.1
};

// Definir cadeia de fallback baseada no tipo de agent
switch (envelope.agent_config?.agent_type) {
  case 'enhanced_research':
    fallbackStrategy.fallback_chain = ['agent_002', 'agent_fallback'];
    break;
  case 'fiscal_research':
    fallbackStrategy.fallback_chain = ['agent_001', 'agent_fallback'];
    break;
  case 'gdocs_documentation':
    fallbackStrategy.fallback_chain = ['agent_001', 'agent_fallback'];
    break;
  default:
    fallbackStrategy.fallback_chain = ['agent_001', 'agent_002', 'agent_fallback'];
}

// Ajustar probabilidade de fallback baseada no readiness
if (optimizationInput.readiness_score < 0.5) {
  fallbackStrategy.fallback_probability = 0.4;
} else if (optimizationInput.readiness_score > 0.8) {
  fallbackStrategy.fallback_probability = 0.05;
}

// ✅ OTIMIZAÇÃO DE MCP ENDPOINTS
let mcpOptimization = {
  primary_provider: envelope.agent_config?.mcp_provider || 'bright_data',
  backup_provider: null,
  connection_timeout: 10,
  retry_strategy: 'exponential_backoff',
  max_retries: 3
};

// Definir backup provider
if (mcpOptimization.primary_provider === 'bright_data') {
  mcpOptimization.backup_provider = 'composio';
} else if (mcpOptimization.primary_provider === 'composio') {
  mcpOptimization.backup_provider = 'bright_data';
}

// Ajustar retries baseado na qualidade
if (optimizationInput.config_quality > 0.8) {
  mcpOptimization.max_retries = 2;
  mcpOptimization.connection_timeout = 8;
} else if (optimizationInput.config_quality < 0.6) {
  mcpOptimization.max_retries = 5;
  mcpOptimization.connection_timeout = 15;
}

// ✅ CÁLCULO DE SCORE DE OTIMIZAÇÃO
let optimizationScore = 0;
if (queryOptimization.context_improvement) optimizationScore += 0.25;
if (timeoutOptimization.adjustment_factor !== 1.0) optimizationScore += 0.25;
if (fallbackStrategy.fallback_chain.length > 0) optimizationScore += 0.25;
if (mcpOptimization.backup_provider) optimizationScore += 0.25;

// ✅ ATUALIZAR ENVELOPE COM OTIMIZAÇÕES
envelope.optimization_data.runtime = {
  ...envelope.optimization_data.runtime,
  query_optimization: queryOptimization,
  timeout_optimization: timeoutOptimization,
  fallback_strategy: fallbackStrategy,
  mcp_optimization: mcpOptimization,
  optimization_score: optimizationScore,
  applied_at: new Date().toISOString()
};

// ✅ APLICAR OTIMIZAÇÕES AO ENVELOPE
if (queryOptimization.context_improvement) {
  envelope.webhook_data.query = queryOptimization.enhanced_query;
  envelope.webhook_data.query_optimized = true;
}

// Atualizar configuração de timeout
if (envelope.llm_config) {
  envelope.llm_config.timeout_seconds = timeoutOptimization.adjusted_timeout;
  envelope.llm_config.max_retries = mcpOptimization.max_retries;
}

// ✅ TIMING E MÉTRICAS
const endTime = Date.now();
envelope.observability_data.metrics.component_timings.optimization_engine = {
  start: startTime,
  end: endTime,
  duration: endTime - startTime
};

envelope.observability_data.tracking_stack.push('optimization_engine');

// ✅ ATUALIZAR SESSION STATE
envelope.session_state.stage = 'optimized_ready';
envelope.session_state.optimization_score = optimizationScore;
envelope.session_state.components_executed.push('optimization-engine-v2.0');

// ✅ LOG DETALHADO DAS OTIMIZAÇÕES
const optimizationLog = {
  timestamp: new Date().toISOString(),
  level: 'INFO',
  component: 'optimization_engine',
  message: 'Otimizações aplicadas com sucesso',
  tracking: trackingIds,
  optimizations: {
    query: queryOptimization,
    timeout: timeoutOptimization,
    fallback: fallbackStrategy,
    mcp: mcpOptimization,
    score: optimizationScore
  },
  performance: {
    duration_ms: endTime - startTime
  }
};

console.log(JSON.stringify(optimizationLog));

// ✅ RECOMENDAÇÕES PARA PRÓXIMA EXECUÇÃO
const nextExecutionHints = {
  agent_performance_feedback: optimizationInput.readiness_score > 0.8 ? 'excellent' : 'needs_improvement',
  recommended_improvements: [],
  optimization_effectiveness: optimizationScore
};

if (optimizationInput.config_quality < 0.7) {
  nextExecutionHints.recommended_improvements.push('improve_agent_configuration');
}
if (timeoutOptimization.adjustment_factor > 1.2) {
  nextExecutionHints.recommended_improvements.push('optimize_query_complexity');
}
if (fallbackStrategy.fallback_probability > 0.2) {
  nextExecutionHints.recommended_improvements.push('enhance_primary_agent_reliability');
}

envelope.optimization_data.post = {
  next_execution_hints: nextExecutionHints,
  optimization_effectiveness: optimizationScore,
  generated_at: new Date().toISOString()
};

// ✅ MÉTRICAS PARA STORAGE EXTERNO
const metricsForRedis = {
  agent_id: envelope.agent_config?.agent_id,
  project_id: envelope.webhook_data?.project_id,
  timestamp: new Date().toISOString(),
  optimization_score: optimizationScore,
  timeout_adjustment: timeoutOptimization.adjustment_factor,
  query_enhanced: queryOptimization.context_improvement,
  readiness_score: optimizationInput.readiness_score
};

envelope.observability_data.metrics.redis_optimization_payload = metricsForRedis;

// ✅ ATUALIZAR METADATA DO ENVELOPE
envelope.envelope_metadata.flow_step = 'optimization_engine';
envelope.envelope_metadata.last_updated = new Date().toISOString();
envelope.envelope_metadata.optimization_applied = true;

return [{ json: envelope }];