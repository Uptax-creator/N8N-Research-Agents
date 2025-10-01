// ✅ REDIS STORAGE HELPER v2.0 - MÉTRICAS TEMPO REAL
// Este helper pode ser incluído em qualquer componente para salvar métricas

function saveMetricsToRedis(envelope, componentName, metricsData) {
  // ✅ PREPARAR DADOS PARA REDIS
  const trackingIds = envelope.envelope_metadata?.tracking_ids || {};
  const timestamp = new Date().toISOString();

  const redisKey = `metrics:${trackingIds.agent_id}:${trackingIds.project_id}:${timestamp}`;

  const redisPayload = {
    // Identificadores
    agent_id: trackingIds.agent_id,
    project_id: trackingIds.project_id,
    workflow_id: trackingIds.workflow_id,
    session_id: trackingIds.session_id,
    execution_id: trackingIds.execution_id,
    trace_id: trackingIds.trace_id,

    // Timestamp e componente
    timestamp: timestamp,
    component: componentName,

    // Métricas específicas
    metrics: metricsData,

    // Performance geral
    pipeline_stage: envelope.session_state?.stage || 'unknown',
    total_components_executed: envelope.session_state?.components_executed?.length || 0,

    // TTL para Redis (24 horas)
    ttl: 86400
  };

  // ✅ LOG PARA CONSOLE (sempre funciona)
  console.log(JSON.stringify({
    timestamp: timestamp,
    level: 'METRICS',
    component: 'redis_storage_helper',
    message: `Métricas preparadas para Redis: ${redisKey}`,
    tracking: trackingIds,
    redis_payload: redisPayload
  }));

  // ✅ SIMULAR SALVAMENTO NO REDIS
  // TODO: Implementar salvamento real quando MCP Upstash estiver disponível
  /*
  try {
    // Exemplo de como seria com MCP Upstash:
    // await redis.set(redisKey, JSON.stringify(redisPayload), 'EX', 86400);

    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      component: 'redis_storage_helper',
      message: `Métricas salvas no Redis: ${redisKey}`,
      tracking: trackingIds,
      success: true
    }));
  } catch (error) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      component: 'redis_storage_helper',
      message: `Erro ao salvar no Redis: ${error.message}`,
      tracking: trackingIds,
      error: error.toString()
    }));
  }
  */

  return redisPayload;
}

function saveDashboardDataToLooker(envelope, dashboardData) {
  // ✅ PREPARAR DADOS PARA LOOKER STUDIO
  const trackingIds = envelope.envelope_metadata?.tracking_ids || {};
  const timestamp = new Date().toISOString();

  const lookerPayload = {
    // Dimensões para dashboard
    agent_id: trackingIds.agent_id,
    project_id: trackingIds.project_id,
    workflow_id: trackingIds.workflow_id,
    date: timestamp.split('T')[0],
    hour: parseInt(timestamp.split('T')[1].substring(0, 2)),

    // Métricas para visualização
    execution_count: 1,
    success_rate: dashboardData.success ? 1 : 0,
    response_time_seconds: dashboardData.duration_seconds || 0,
    quality_score: dashboardData.quality_score || 0,
    optimization_score: dashboardData.optimization_score || 0,

    // Metadados
    query_complexity: dashboardData.query_complexity || 'medium',
    mcp_provider: envelope.agent_config?.mcp_provider || 'unknown',
    component_count: envelope.session_state?.components_executed?.length || 0
  };

  // ✅ LOG PREPARAÇÃO LOOKER
  console.log(JSON.stringify({
    timestamp: timestamp,
    level: 'DASHBOARD',
    component: 'looker_storage_helper',
    message: 'Dados preparados para Looker Studio',
    tracking: trackingIds,
    looker_payload: lookerPayload
  }));

  // ✅ SIMULAR ENVIO PARA LOOKER
  // TODO: Implementar envio real quando MCP Looker estiver disponível
  /*
  try {
    // Exemplo de como seria com MCP Looker:
    // await looker.createDashboardElement(lookerPayload);

    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      component: 'looker_storage_helper',
      message: 'Dados enviados para Looker Studio',
      tracking: trackingIds,
      success: true
    }));
  } catch (error) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      component: 'looker_storage_helper',
      message: `Erro ao enviar para Looker: ${error.message}`,
      tracking: trackingIds,
      error: error.toString()
    }));
  }
  */

  return lookerPayload;
}

// ✅ EXEMPLO DE USO EM COMPONENTES:
/*
// No final de cada componente, adicionar:

const componentMetrics = {
  duration_ms: endTime - startTime,
  success: true,
  errors_count: 0,
  memory_usage: process.memoryUsage ? process.memoryUsage().heapUsed : null
};

// Salvar no Redis
const redisData = saveMetricsToRedis(envelope, 'component_name', componentMetrics);

// Salvar no Looker (para dashboards)
const dashboardMetrics = {
  success: true,
  duration_seconds: (endTime - startTime) / 1000,
  quality_score: envelope.observability_data?.metrics?.quality_score || 0.8,
  optimization_score: envelope.optimization_data?.runtime?.optimization_score || 0.7,
  query_complexity: envelope.observability_data?.metrics?.query_analysis?.complexity || 'medium'
};

const lookerData = saveDashboardDataToLooker(envelope, dashboardMetrics);

// Adicionar ao envelope para próximo componente
envelope.observability_data.metrics.redis_payload = redisData;
envelope.observability_data.metrics.looker_payload = lookerData;
*/

module.exports = { saveMetricsToRedis, saveDashboardDataToLooker };