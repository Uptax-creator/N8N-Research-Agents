// Response Formatter for Brazilian Enhanced Research Agent
const formatResponse = (aiResponse, originalInput) => {
  try {
    // Extract key information from AI response
    const response = aiResponse?.output || aiResponse?.message || aiResponse?.text || aiResponse;

    return {
      success: true,
      agent: 'enhanced_research_brazilian',
      project_id: originalInput?.project_id || 'project_001',
      agent_id: originalInput?.agent_id || 'agent_001',
      query: originalInput?.query || '',
      response: response,
      metadata: {
        timestamp: new Date().toISOString(),
        graph_key: originalInput?.graph_key || 'unknown',
        mcp_used: 'bright_data',
        language: 'pt-BR',
        market: 'brazilian'
      }
    };
  } catch (error) {
    return {
      success: false,
      agent: 'enhanced_research_brazilian',
      error_message: error.message,
      original_input: originalInput
    };
  }
};

// Export for N8N
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { formatResponse };
} else {
  // For browser/eval context
  ({ formatResponse });
}