// ✅ POST-LLM OBSERVABILITY v2.0 - CAPTURA APÓS EXECUÇÃO DO AI AGENT
const inputData = $input.first().json;
const envelope = inputData; // Envelope vem do AI Agent
const startTime = Date.now();

// ✅ VALIDAR ENVELOPE
if (!envelope.envelope_metadata || !envelope.envelope_metadata.tracking_ids) {
  throw new Error('Envelope inválido recebido no post-llm observability');
}

const trackingIds = envelope.envelope_metadata.tracking_ids;

// ✅ LOG INÍCIO
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'INFO',
  component: 'post_llm_observability',
  message: 'Iniciando observabilidade pós-LLM',
  tracking: trackingIds
}));

// ✅ CAPTURAR RESULTADO DA EXECUÇÃO LLM
const llmResult = envelope.llm_result || envelope.ai_response || {};
const executionSuccess = !!llmResult.content || !!llmResult.response;

// ✅ ANALISAR QUALIDADE DA RESPOSTA
let responseQualityAnalysis = {
  has_content: !!llmResult.content,
  content_length: (llmResult.content || '').length,
  structure_score: 0,
  completeness_score: 0,
  mcp_tools_used: false,
  tools_execution_count: 0
};

if (llmResult.content) {
  const content = llmResult.content;

  // Verificar estrutura da resposta
  const hasHeaders = /##\s/.test(content);
  const hasSections = content.split('\n').length > 5;
  const hasConclusion = content.toLowerCase().includes('conclusão') ||
                       content.toLowerCase().includes('resumo') ||
                       content.toLowerCase().includes('agent:');

  responseQualityAnalysis.structure_score =
    (hasHeaders ? 0.4 : 0) +
    (hasSections ? 0.3 : 0) +
    (hasConclusion ? 0.3 : 0);

  // Verificar completude baseada no tipo de agent
  const agentType = envelope.agent_config?.agent_type || 'unknown';
  if (agentType === 'enhanced_research') {
    const hasMarketAnalysis = content.toLowerCase().includes('mercado') ||
                             content.toLowerCase().includes('análise');
    const hasSources = content.toLowerCase().includes('fonte') ||
                      content.toLowerCase().includes('referência');
    responseQualityAnalysis.completeness_score =
      (hasMarketAnalysis ? 0.5 : 0) + (hasSources ? 0.5 : 0);
  } else if (agentType === 'fiscal_research') {
    const hasLegislation = content.toLowerCase().includes('lei') ||
                          content.toLowerCase().includes('legislação');
    const hasCompliance = content.toLowerCase().includes('compliance') ||
                         content.toLowerCase().includes('conformidade');
    responseQualityAnalysis.completeness_score =
      (hasLegislation ? 0.5 : 0) + (hasCompliance ? 0.5 : 0);
  } else if (agentType === 'gdocs_documentation') {
    const hasDocumentRef = content.toLowerCase().includes('documento') ||
                          content.toLowerCase().includes('google docs');
    responseQualityAnalysis.completeness_score = hasDocumentRef ? 1.0 : 0.3;
  }

  // Verificar uso de ferramentas MCP
  responseQualityAnalysis.mcp_tools_used =
    content.includes('search_engine') ||
    content.includes('scrape_as_markdown') ||
    content.includes('GOOGLEDOCS') ||
    content.toLowerCase().includes('pesquisa realizada') ||
    content.toLowerCase().includes('fonte consultada');

  // Contar execuções de ferramentas (aproximado)
  const toolMatches = content.match(/fonte:|referência:|consultado:|pesquisado:/gi) || [];
  responseQualityAnalysis.tools_execution_count = toolMatches.length;
}

// ✅ CALCULAR SCORE GERAL DE QUALIDADE
const overallQualityScore =
  (responseQualityAnalysis.structure_score * 0.3) +
  (responseQualityAnalysis.completeness_score * 0.4) +
  (responseQualityAnalysis.mcp_tools_used ? 0.3 : 0);

// ✅ MÉTRICAS DE PERFORMANCE
let performanceMetrics = {
  total_execution_time: 0,
  predicted_vs_actual: {},
  component_breakdown: {},
  efficiency_score: 0
};

// Calcular tempo total baseado nos componentes executados
if (envelope.observability_data?.metrics?.component_timings) {
  const timings = envelope.observability_data.metrics.component_timings;
  let totalTime = 0;

  Object.entries(timings).forEach(([component, timing]) => {
    if (timing.duration) {
      totalTime += timing.duration;
      performanceMetrics.component_breakdown[component] = timing.duration;
    }
  });

  performanceMetrics.total_execution_time = totalTime;

  // Comparar com predição
  const predictedTime = envelope.observability_data?.metrics?.performance_prediction?.estimated_duration_seconds * 1000 || 30000;
  performanceMetrics.predicted_vs_actual = {
    predicted_ms: predictedTime,
    actual_ms: totalTime,
    accuracy_ratio: totalTime > 0 ? predictedTime / totalTime : 0,
    variance_percentage: totalTime > 0 ? Math.abs((totalTime - predictedTime) / predictedTime) * 100 : 0
  };

  // Score de eficiência (melhor quando próximo da predição)
  const accuracy = performanceMetrics.predicted_vs_actual.accuracy_ratio;
  performanceMetrics.efficiency_score = accuracy > 0 ? Math.max(0, 1 - Math.abs(1 - accuracy)) : 0;
}

// ✅ ANÁLISE DE ERROS E PROBLEMAS
let errorAnalysis = {
  has_errors: false,
  error_count: 0,
  error_types: [],
  critical_failures: [],
  warnings: []
};

if (envelope.observability_data?.errors && envelope.observability_data.errors.length > 0) {
  errorAnalysis.has_errors = true;
  errorAnalysis.error_count = envelope.observability_data.errors.length;
  errorAnalysis.error_types = envelope.observability_data.errors.map(e => e.type || 'unknown');
}

// Verificar falhas críticas baseadas na qualidade
if (overallQualityScore < 0.3) {
  errorAnalysis.critical_failures.push('low_quality_response');
}
if (!responseQualityAnalysis.mcp_tools_used) {
  errorAnalysis.warnings.push('mcp_tools_not_detected');
}
if (performanceMetrics.total_execution_time > 120000) { // 2 minutos
  errorAnalysis.warnings.push('execution_time_exceeded');
}

// ✅ ATUALIZAR ENVELOPE COM MÉTRICAS FINAIS
envelope.observability_data.metrics.component_timings.post_llm_observability = {
  start: startTime,
  end: Date.now(),
  duration: Date.now() - startTime
};

envelope.observability_data.metrics.response_quality = responseQualityAnalysis;
envelope.observability_data.metrics.overall_quality_score = overallQualityScore;
envelope.observability_data.metrics.performance_final = performanceMetrics;
envelope.observability_data.metrics.error_analysis = errorAnalysis;

envelope.observability_data.tracking_stack.push('post_llm_observability');

// ✅ FEEDBACK PARA OTIMIZAÇÕES FUTURAS
const optimizationFeedback = {
  quality_score: overallQualityScore,
  performance_score: performanceMetrics.efficiency_score,
  mcp_usage_success: responseQualityAnalysis.mcp_tools_used,
  timeout_adequacy: performanceMetrics.predicted_vs_actual.accuracy_ratio > 0.5,
  recommendations: []
};

if (overallQualityScore < 0.6) {
  optimizationFeedback.recommendations.push('improve_prompt_quality');
}
if (!responseQualityAnalysis.mcp_tools_used) {
  optimizationFeedback.recommendations.push('enhance_force_tools_execution');
}
if (performanceMetrics.efficiency_score < 0.7) {
  optimizationFeedback.recommendations.push('adjust_timeout_prediction');
}

envelope.optimization_data.post = {
  ...envelope.optimization_data.post,
  execution_feedback: optimizationFeedback,
  quality_metrics: {
    overall_score: overallQualityScore,
    performance_score: performanceMetrics.efficiency_score,
    success_rate: executionSuccess ? 1 : 0
  }
};

// ✅ ATUALIZAR SESSION STATE
envelope.session_state.stage = 'post_llm_completed';
envelope.session_state.final_quality_score = overallQualityScore;
envelope.session_state.execution_success = executionSuccess;
envelope.session_state.components_executed.push('post-llm-observability-v2.0');

// ✅ LOG FINAL DETALHADO
const finalLog = {
  timestamp: new Date().toISOString(),
  level: executionSuccess ? 'INFO' : 'ERROR',
  component: 'post_llm_observability',
  message: 'Observabilidade pós-LLM concluída',
  tracking: trackingIds,
  final_metrics: {
    execution_success: executionSuccess,
    quality_score: overallQualityScore,
    performance_score: performanceMetrics.efficiency_score,
    total_time_ms: performanceMetrics.total_execution_time,
    mcp_tools_used: responseQualityAnalysis.mcp_tools_used,
    error_count: errorAnalysis.error_count
  },
  optimization_feedback: optimizationFeedback
};

console.log(JSON.stringify(finalLog));

// ✅ PREPARAR MÉTRICAS PARA STORAGE EXTERNO
const finalMetricsForStorage = {
  agent_id: envelope.agent_config?.agent_id,
  project_id: envelope.webhook_data?.project_id,
  timestamp: new Date().toISOString(),
  success: executionSuccess,
  quality_score: overallQualityScore,
  performance_score: performanceMetrics.efficiency_score,
  duration_seconds: performanceMetrics.total_execution_time / 1000,
  mcp_tools_executed: responseQualityAnalysis.mcp_tools_used,
  error_count: errorAnalysis.error_count,
  optimization_score: envelope.optimization_data?.runtime?.optimization_score || 0
};

// Incluir helper de storage se disponível
/*
const storageHelper = require('./redis-storage-helper-v2.0.js');
storageHelper.saveMetricsToRedis(envelope, 'post_llm_observability', finalMetricsForStorage);
storageHelper.saveDashboardDataToLooker(envelope, finalMetricsForStorage);
*/

envelope.observability_data.metrics.final_storage_payload = finalMetricsForStorage;

// ✅ ATUALIZAR METADATA DO ENVELOPE
envelope.envelope_metadata.flow_step = 'post_llm_observability';
envelope.envelope_metadata.last_updated = new Date().toISOString();
envelope.envelope_metadata.pipeline_completed = true;

return [{ json: envelope }];