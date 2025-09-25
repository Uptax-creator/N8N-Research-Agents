/**
 * Graph Processor - Dynamic Prompt Loading v1.0.0
 * GitHub-hosted node code for N8N Graph System
 * Auto-deploy via URL: https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/code/processors/graph-processor-dynamic.js
 */

async function execute() {
  console.log('🚀 Graph Processor - Dynamic Prompt Loading Starting...');

  // Get input data
  const inputData = $('Webhook Enhanced').item.json.body;
  const csvData = $('Load Graph CSV').item.json.data;

  console.log('📥 Input received:', inputData);

  const projectId = inputData.project_id;
  const agentId = inputData.agent_id;
  const query = inputData.query || 'Default query';
  const workflowId = 'uptax-proc-1001-dynamic';

  // Validation
  if (!projectId || !agentId) {
    return [{
      json: {
        success: false,
        error: 'Missing project_id or agent_id',
        received: inputData,
        timestamp: new Date().toISOString()
      }
    }];
  }

  // Parse CSV
  console.log('📊 Parsing CSV data...');
  const lines = csvData.split('\n').filter(line => line.trim());
  let agentConfig = null;

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values[0] === workflowId && values[1] === projectId && values[2] === agentId) {
      // Parse MCP endpoints - support both single URL and JSON array
      let mcpEndpoints;
      const mcpField = values[5]; // mcp_endpoints field

      try {
        // Try to parse as JSON array (new format)
        if (mcpField.startsWith('[') && mcpField.endsWith(']')) {
          mcpEndpoints = JSON.parse(mcpField.replace(/""/g, '"'));
          console.log('✅ Parsed multiple MCP endpoints:', mcpEndpoints.length);
        } else {
          // Fallback to single URL (legacy format)
          mcpEndpoints = [{
            name: "legacy_mcp",
            url: mcpField,
            type: "unknown",
            priority: 1
          }];
          console.log('⚠️ Using legacy single MCP endpoint');
        }
      } catch (error) {
        console.log('❌ Error parsing MCP endpoints:', error.message);
        mcpEndpoints = [];
      }

      agentConfig = {
        workflow_id: values[0],
        project_id: values[1],
        agent_id: values[2],
        agent_type: values[3],
        description: values[4],
        mcp_endpoints: mcpEndpoints,
        prompt_url: values[6],
        processor_url: values[7],
        tools_config_url: values[8]
      };
      break;
    }
  }

  if (!agentConfig) {
    return [{
      json: {
        success: false,
        error: `No config found for ${workflowId}/${projectId}/${agentId}`,
        csv_rows: lines.length - 1,
        timestamp: new Date().toISOString()
      }
    }];
  }

  console.log('✅ Agent config found:', agentConfig.agent_type);

  // LOAD PROMPT FROM GITHUB DYNAMICALLY
  let systemMessage;
  try {
    console.log('🌐 Loading prompt from GitHub:', agentConfig.prompt_url);

    const response = await fetch(agentConfig.prompt_url);
    if (response.ok) {
      systemMessage = await response.text();
      console.log('✅ Prompt loaded successfully from GitHub:', systemMessage.length, 'characters');
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.log('❌ Failed to load prompt, using fallback:', error.message);
    // Fallback system message
    systemMessage = `You are ${agentConfig.description}.

IMPORTANT: Use your available tools proactively to provide comprehensive results.

For research requests:
1. Use search_engine to gather information
2. Use scrape_as_markdown to extract detailed content
3. Analyze and structure the findings
4. Create documents with your results when appropriate

Always be thorough, professional, and results-oriented.`;
  }

  // Generate session ID
  const sessionId = `${projectId}_${agentId}_${Date.now()}`;

  console.log('🎯 Processing completed successfully');
  console.log('📋 Session ID:', sessionId);
  console.log('🔧 MCP Endpoints:', agentConfig.mcp_endpoints.map(mcp => `${mcp.name}(${mcp.type})`).join(', '));

  // Return data for LangChain AI Agent
  return [{
    json: {
      text: query,
      session_id: sessionId,
      system_message: systemMessage,
      agent_config: agentConfig,
      graph_success: true,
      processing_metadata: {
        prompt_source: agentConfig.prompt_url,
        prompt_length: systemMessage.length,
        mcp_count: agentConfig.mcp_endpoints.length,
        mcp_types: agentConfig.mcp_endpoints.map(mcp => mcp.type),
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      }
    }
  }];
}

// N8N execution wrapper
if (typeof $input !== 'undefined') {
  // Async execution for N8N
  return execute();
} else {
  // Module export for testing
  module.exports = { execute };
}