// Enhanced Response Formatter v3.0 - Dynamic Multi-Agent
// GitHub-driven agent configuration with automatic detection
// Compatible with N8N workflow execution

// Get inputs from previous nodes with fallback
const aiResponse = (() => {
  try {
    return $('Enhanced AI Agent').item.json || $('AI Agent').item.json;
  } catch (e) {
    console.log('Warning: AI Agent node not found, using current input');
    return $json;
  }
})();

const processorData = (() => {
  try {
    return $('Prompt Processor').item.json;
  } catch (e) {
    console.log('Warning: Prompt Processor not found, using defaults');
    return { text: $json.query || 'Query not specified' };
  }
})();

// Try to load agent configuration from GitHub
let agentConfig = null;
try {
  agentConfig = $('Load Agent Config').item.json;
  console.log('✅ Agent config loaded from GitHub');
} catch (e) {
  console.log('⚠️ Agent config not found, using fallback detection');
}

// Detect agent type from webhook path
const webhookUrl = (() => {
  if ($execution.mode === 'webhook') {
    return $json.headers?.['x-forwarded-uri'] ||
           $json.headers?.['x-webhook-url'] ||
           $json.headers?.referer ||
           '/webhook/business-plan-v4';
  }
  return '/webhook/business-plan-v4';
})();

// Agent type mapping for multi-agent support
const agentMapping = {
  'business-plan': {
    agent_type: 'business-plan',
    name: 'Especialista em Planos de Negócio',
    version: '4.0.0',
    tools: ['langchain', 'gemini', 'business-analysis'],
    specialization: 'Planos de negócio e estratégia empresarial'
  },
  'research-software': {
    agent_type: 'research-software',
    name: 'Pesquisador de Software',
    version: '3.0.0',
    tools: ['langchain', 'gemini', 'web-search', 'code-analysis'],
    specialization: 'Análise e pesquisa de software'
  },
  'data-analysis': {
    agent_type: 'data-analysis',
    name: 'Analista de Dados',
    version: '2.1.0',
    tools: ['langchain', 'gemini', 'data-tools', 'visualization'],
    specialization: 'Análise e visualização de dados'
  },
  'tax-optimization': {
    agent_type: 'tax-optimization',
    name: 'Especialista Tributário',
    version: '1.5.0',
    tools: ['langchain', 'gemini', 'tax-analysis', 'legal-search'],
    specialization: 'Otimização tributária e planejamento fiscal'
  },
  'market-research': {
    agent_type: 'market-research',
    name: 'Pesquisador de Mercado',
    version: '2.0.0',
    tools: ['langchain', 'gemini', 'market-analysis', 'competitor-search'],
    specialization: 'Pesquisa de mercado e análise competitiva'
  }
};

// Extract agent type from webhook path
const agentTypeMatch = webhookUrl.match(/\/webhook(?:-test)?\/([^-\/]+)/);
const detectedType = agentTypeMatch ? agentTypeMatch[1] : 'business-plan';

console.log('🔍 Webhook URL:', webhookUrl);
console.log('🎯 Detected Agent Type:', detectedType);

// Use GitHub config or fallback to mapping
const finalConfig = agentConfig || agentMapping[detectedType] || agentMapping['business-plan'];

// Process AI response
const result = (() => {
  const response = aiResponse?.output ||
                  aiResponse?.text ||
                  aiResponse?.content ||
                  aiResponse?.result ||
                  'Resposta não disponível';

  // Clean up response if needed
  if (typeof response === 'string') {
    return response.trim();
  }
  return JSON.stringify(response, null, 2);
})();

// Calculate processing metrics
const startTime = $execution.startedAt ? new Date($execution.startedAt).getTime() : Date.now();
const processingTime = Math.max(Date.now() - startTime, 100);

// Build dynamic response with rich metadata
const dynamicResponse = {
  success: true,
  agent: finalConfig.agent_type || detectedType,
  name: finalConfig.name || 'Agente Dinâmico',
  version: finalConfig.version || '1.0.0',
  specialization: finalConfig.specialization,
  query: processorData?.text || $json.query || 'Consulta não especificada',
  result: result,
  metadata: {
    agent_source: agentConfig ? 'github' : 'fallback',
    webhook_path: webhookUrl,
    detected_type: detectedType,
    session_id: processorData?.session_id || `session_${Date.now()}`,
    timestamp: new Date().toISOString(),
    tools_used: finalConfig.tools || ['langchain', 'gemini'],
    processing_time_ms: processingTime,
    n8n_execution_id: $execution.id,
    workflow_name: $workflow.name || 'dynamic-multi-agent',
    execution_mode: $execution.mode
  },
  github_integration: {
    status: agentConfig ? 'SUCCESS' : 'FALLBACK',
    config_version: finalConfig.version,
    config_url: agentConfig ?
      `https://raw.githubusercontent.com/uptax-dev/n8n-orchestrator/main/prompts/agents/${detectedType}.json` :
      null,
    code_version: '3.0.0',
    code_url: 'https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/N8N/code/processors/enhanced-response-formatter.js'
  },
  context_variables: finalConfig.context_variables || {
    market_focus: 'Brasil',
    target_audience: 'Empresas e Startups',
    language: 'pt-BR'
  },
  performance: {
    ai_processing_time: aiResponse?.processing_time || processingTime,
    total_execution_time: processingTime,
    tokens_used: aiResponse?.tokens || null,
    model_used: aiResponse?.model || 'gemini-2.0-flash-exp'
  }
};

// Debug logging for development
console.log('✅ Dynamic Response Generated:', {
  webhook_url: webhookUrl,
  detected_type: detectedType,
  agent_config_found: !!agentConfig,
  final_agent: dynamicResponse.agent,
  response_length: result.length,
  execution_id: $execution.id
});

// Return formatted response
return [dynamicResponse];