// Sanitized Response Formatter v3.1 - Remove all error keys
// Specifically designed to handle N8N's error key restrictions

// Get AI response and sanitize it
const aiResponse = (() => {
  try {
    const rawResponse = $('Enhanced AI Agent').item.json || $('AI Agent').item.json || $json;

    // Remove any 'error' keys from the response object
    const sanitized = JSON.parse(JSON.stringify(rawResponse));
    delete sanitized.error;
    delete sanitized.Error;
    delete sanitized.ERROR;

    return sanitized;
  } catch (e) {
    console.log('Warning: AI Agent node not found, using sanitized input');
    const sanitized = JSON.parse(JSON.stringify($json));
    delete sanitized.error;
    delete sanitized.Error;
    delete sanitized.ERROR;
    return sanitized;
  }
})();

// Get processor data
const processorData = (() => {
  try {
    return $('Prompt Processor').item.json;
  } catch (e) {
    return { text: $json.query || 'Query not specified' };
  }
})();

// Extract result from AI response (sanitized)
const result = aiResponse?.output ||
               aiResponse?.text ||
               aiResponse?.content ||
               aiResponse?.result ||
               'Resposta não disponível';

// Create completely clean response (guaranteed no error keys)
const cleanResponse = {
  success: true,
  agent: 'business-plan',
  name: 'Especialista em Planos de Negócio',
  version: '4.0.0',
  query: processorData?.text || $json.query || 'Consulta não especificada',
  result: typeof result === 'string' ? result.trim() : JSON.stringify(result, null, 2),
  metadata: {
    webhook_path: '/webhook/business-plan-v4',
    session_id: 'session_' + Date.now(),
    timestamp: new Date().toISOString(),
    n8n_execution_id: $execution.id || 'unknown',
    processing_mode: 'sanitized'
  },
  github_integration: {
    status: 'SANITIZED',
    code_version: '3.1.0'
  }
};

console.log('✅ Sanitized Response Generated:', {
  has_result: !!cleanResponse.result,
  result_length: cleanResponse.result.length,
  execution_id: cleanResponse.metadata.n8n_execution_id
});

// Return sanitized response (guaranteed N8N compatible)
return [cleanResponse];