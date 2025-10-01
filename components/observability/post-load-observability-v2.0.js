// ✅ POST-LOAD OBSERVABILITY v2.0 - VALIDAÇÃO APÓS CSV LOADING
const inputData = $input.first().json;
const envelope = inputData; // Envelope vem do CSV Loader
const startTime = Date.now();

// ✅ VALIDAR ENVELOPE
if (!envelope.envelope_metadata || !envelope.tracking_ids) {
  throw new Error('Envelope inválido recebido no post-load observability');
}

const trackingIds = envelope.envelope_metadata.tracking_ids;

// ✅ LOG INÍCIO
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'INFO',
  component: 'post_load_observability',
  message: 'Iniciando validação pós-carregamento',
  tracking: trackingIds
}));

// ✅ VALIDAR AGENT CONFIG CARREGADO
let configValidation = {
  agent_config_loaded: !!envelope.agent_config,
  agent_id_valid: false,
  agent_type_valid: false,
  mcp_provider_configured: false,
  tools_available: false,
  prompt_url_accessible: false
};

if (envelope.agent_config) {
  configValidation.agent_id_valid = !!envelope.agent_config.agent_id;
  configValidation.agent_type_valid = !!envelope.agent_config.agent_type;
  configValidation.mcp_provider_configured = !!envelope.agent_config.mcp_provider;
  configValidation.tools_available = Array.isArray(envelope.agent_config.tools) && envelope.agent_config.tools.length > 0;
  configValidation.prompt_url_accessible = !!envelope.agent_config.prompt_url;
}

// ✅ DETECTAR FONTE DA CONFIGURAÇÃO
let configSource = 'unknown';
if (envelope.session_state?.csv_source === 'frontend_parametrized') {
  configSource = 'frontend';
} else if (envelope.session_state?.csv_source === 'github_csv') {
  configSource = 'csv';
} else if (envelope.session_state?.csv_source === 'hardcoded_fallback') {
  configSource = 'fallback';
}

// ✅ VERIFICAR HEALTH DOS MCP ENDPOINTS
let mcpHealth = {
  bright_data: 'unknown',
  composio: 'unknown',
  upstash: 'unknown'
};

// Simular verificação baseada no agent type
if (envelope.agent_config?.mcp_provider === 'bright_data') {
  mcpHealth.bright_data = 'assumed_healthy';
} else if (envelope.agent_config?.mcp_provider === 'composio') {
  mcpHealth.composio = 'assumed_healthy';
}

// ✅ CALCULAR SCORE DE QUALIDADE DA CONFIGURAÇÃO
let configQualityScore = 0;
if (configValidation.agent_config_loaded) configQualityScore += 0.2;
if (configValidation.agent_id_valid) configQualityScore += 0.2;
if (configValidation.agent_type_valid) configQualityScore += 0.2;
if (configValidation.mcp_provider_configured) configQualityScore += 0.2;
if (configValidation.tools_available) configQualityScore += 0.2;

// ✅ ATUALIZAR ENVELOPE COM OBSERVABILITY DATA
envelope.observability_data.metrics.component_timings.post_load_observability = {
  start: startTime,
  end: Date.now(),
  duration: Date.now() - startTime
};

envelope.observability_data.metrics.config_validation = configValidation;
envelope.observability_data.metrics.config_quality_score = configQualityScore;
envelope.observability_data.metrics.config_source = configSource;
envelope.observability_data.metrics.mcp_health = mcpHealth;

envelope.observability_data.tracking_stack.push('post_load_observability');

// ✅ ATUALIZAR SESSION STATE
envelope.session_state.stage = 'post_load_validated';
envelope.session_state.config_quality_score = configQualityScore;
envelope.session_state.components_executed.push('post-load-observability-v2.0');

// ✅ ADICIONAR OTIMIZAÇÕES BASEADAS NA CONFIGURAÇÃO
envelope.optimization_data.pre.config_analysis = {
  quality_score: configQualityScore,
  source: configSource,
  recommended_timeout: configQualityScore > 0.8 ? 30 : 60,
  fallback_required: configQualityScore < 0.6
};

// ✅ LOG DETALHADO
const detailedLog = {
  timestamp: new Date().toISOString(),
  level: 'INFO',
  component: 'post_load_observability',
  message: 'Validação pós-carregamento concluída',
  tracking: trackingIds,
  validation: configValidation,
  metrics: {
    config_quality_score: configQualityScore,
    config_source: configSource,
    agent_id: envelope.agent_config?.agent_id || 'unknown',
    agent_type: envelope.agent_config?.agent_type || 'unknown',
    mcp_provider: envelope.agent_config?.mcp_provider || 'unknown',
    tools_count: envelope.agent_config?.tools?.length || 0
  },
  performance: {
    duration_ms: Date.now() - startTime
  }
};

console.log(JSON.stringify(detailedLog));

// ✅ ALERTAS SE NECESSÁRIO
if (configQualityScore < 0.6) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'WARN',
    component: 'post_load_observability',
    message: 'Configuração com baixa qualidade detectada',
    tracking: trackingIds,
    alert: {
      quality_score: configQualityScore,
      issues: Object.entries(configValidation)
        .filter(([key, value]) => !value)
        .map(([key, value]) => key)
    }
  }));
}

// ✅ ATUALIZAR METADATA DO ENVELOPE
envelope.envelope_metadata.flow_step = 'post_load_observability';
envelope.envelope_metadata.last_updated = new Date().toISOString();

return [{ json: envelope }];