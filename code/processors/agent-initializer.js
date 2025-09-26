/**
 * Agent Initializer - GitHub-hosted processor
 * URL: https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/code/processors/agent-initializer.js
 */

function execute(input, vars) {
  console.log('> Agent Initializer - Starting...');
  console.log('<¯ Agent ID:', input.agent_id);
  console.log('=Ê Agent type:', input.agent_config?.agent_type);

  // Extract MCP endpoints from config
  let mcp_sse = null;
  let mcp_http = null;

  if (input.agent_config.mcp_endpoints && input.agent_config.mcp_endpoints.length > 0) {
    mcp_sse = input.agent_config.mcp_endpoints.find(m => m.type === 'search')?.url;
    mcp_http = input.agent_config.mcp_endpoints.find(m => m.type === 'documentation')?.url;
  }

  // Fallback URLs
  mcp_sse = mcp_sse || 'https://mcp.brightdata.com/sse?token=ecfc6404fb9eb026a9c802196b8d5caaf131d63c0931f9e888e57077e6b1f8cf';
  mcp_http = mcp_http || 'https://apollo-3irns8zl6-composio.vercel.app/v3/mcp/aab98bef-8816-4873-95f6-45615ca063d4/mcp?include_composio_helper_actions=true';

  // Build system message from prompt data
  let systemMessage = input.prompt_data.system_message || "You are a helpful assistant.";

  if (input.prompt_data.instructions && Array.isArray(input.prompt_data.instructions)) {
    systemMessage += "\n\nInstructions:\n" + input.prompt_data.instructions.join("\n");
  }

  if (input.prompt_data.tools_guidance) {
    systemMessage += "\n\nTools Available:\n" +
      Object.entries(input.prompt_data.tools_guidance)
        .map(([tool, guidance]) => `- ${tool}: ${guidance}`).join("\n");
  }

  console.log(' Agent initialized successfully');
  console.log('= MCP SSE:', mcp_sse ? 'configured' : 'fallback');
  console.log('= MCP HTTP:', mcp_http ? 'configured' : 'fallback');

  return [{
    json: {
      // AI Agent inputs
      text: input.query,
      session_id: input.session_id,
      system_message: systemMessage,

      // MCP endpoints
      mcp_endpoint_sse: mcp_sse,
      mcp_endpoint_http: mcp_http,

      // Complete context for response formatter
      session_context: {
        session_id: input.session_id,
        project_id: input.project_id,
        agent_id: input.agent_id,
        agent_config: input.agent_config,
        prompt_data: input.prompt_data,
        config_source: input.config_source,
        prompt_source: input.prompt_source,
        timestamp: input.timestamp
      }
    }
  }];
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { execute };
}