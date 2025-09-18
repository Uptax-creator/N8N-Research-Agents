// Simple Response Formatter v1.0
// Formats AI responses without complex inline execution

const aiResponse = $('Enhanced AI Agent').item.json;
const processorData = $('Prompt Processor').item.json;

// Extract AI output
const aiOutput = aiResponse.output || aiResponse.text || aiResponse.response || 'No response';

// Build formatted response
const formattedResponse = {
  success: true,
  agent: processorData.config?.agent_name || 'enhanced-research-agent',
  version: processorData.config?.version || '2.0.0',
  query: processorData.text || 'Unknown query',
  research_type: processorData.research_type || 'comprehensive_research',
  result: aiOutput,
  metadata: {
    tools_used: ['langchain_agent', 'gemini'],
    session_id: processorData.session_id || 'default',
    processing_time_ms: Date.now() - (processorData.timestamp ? new Date(processorData.timestamp).getTime() : Date.now()),
    response_length: aiOutput.length
  },
  github_integration: {
    status: 'SUCCESS',
    config_version: processorData.config?.version || '2.0.0'
  },
  timestamp: new Date().toISOString()
};

return [formattedResponse];