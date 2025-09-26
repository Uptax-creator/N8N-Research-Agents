// 🚀 UNIVERSAL WORKFLOW PROCESSOR - GitHub First Architecture
// Version: 2.1 with ID_workflow support
// Created: 2025-01-26
// Purpose: Dynamic agent loading and execution

/**
 * Main entry point for GitHub-First workflow processing
 * @param {Object} ssv - SSV Variables from N8N Variables Setup node
 * @param {Object} vars - N8N $vars object
 * @param {Function} getWorkflowStaticData - N8N static data function
 * @param {Function} fetch - Fetch function for HTTP requests
 * @param {Object} console - Console for logging
 * @returns {Object} Formatted response with agent result
 */
async function executeWorkflow(ssv, vars, getWorkflowStaticData, fetch, console) {
  console.log('🚀 Universal Workflow Processor v2.1 - Starting...');
  console.log('📋 SSV Input:', JSON.stringify({
    workflow_config: ssv.workflow_config?.version,
    request_data: {
      project_id: ssv.request_data?.project_id,
      agent_id: ssv.request_data?.agent_id,
      ID_workflow: ssv.request_data?.ID_workflow,
      query_length: ssv.request_data?.query?.length
    }
  }, null, 2));

  try {
    // === STEP 1: VALIDATE SSV INPUT ===
    const validation = validateSSVInput(ssv);
    if (!validation.valid) {
      throw new Error(`SSV Validation failed: ${validation.error}`);
    }

    // === STEP 2: LOAD AGENT CONFIGURATION FROM CSV REGISTRY ===
    console.log('📊 Loading agent configuration from CSV registry...');
    const agentConfig = await loadAgentFromRegistry(ssv, fetch);

    // === STEP 3: LOAD DETAILED CONFIGURATIONS ===
    console.log('📁 Loading detailed configurations from GitHub...');
    const configs = await loadDetailedConfigurations(agentConfig, fetch, getWorkflowStaticData);

    // === STEP 4: INITIALIZE AI AGENT WITH TOOLS ===
    console.log('🤖 Initializing AI Agent with MCP tools...');
    const aiResult = await callAIAgentWithTools(ssv, configs, fetch);

    // === STEP 5: FORMAT FINAL RESPONSE ===
    console.log('📤 Formatting final response...');
    const finalResponse = formatFinalResponse(ssv, agentConfig, configs, aiResult);

    console.log('✅ Universal Workflow Processor completed successfully');
    return finalResponse;

  } catch (error) {
    console.error('❌ Universal Workflow Processor failed:', error.message);
    console.error('🔍 Error stack:', error.stack);

    // Return structured error response
    return {
      success: false,
      error: 'Universal Workflow Processor failed',
      error_details: error.message,
      fallback_response: {
        query: ssv.request_data?.query || 'No query provided',
        message: 'Processor unavailable, using fallback response',
        timestamp: new Date().toISOString()
      },
      ssv_preserved: ssv,
      debug_info: {
        processor_version: '2.1',
        error_type: error.name,
        processing_step: 'error_handling'
      }
    };
  }
}

/**
 * Validate SSV Variables structure
 */
function validateSSVInput(ssv) {
  if (!ssv) {
    return { valid: false, error: 'SSV object is null or undefined' };
  }

  if (!ssv.workflow_config) {
    return { valid: false, error: 'workflow_config missing in SSV' };
  }

  if (!ssv.request_data) {
    return { valid: false, error: 'request_data missing in SSV' };
  }

  if (!ssv.request_data.project_id) {
    return { valid: false, error: 'project_id missing in request_data' };
  }

  if (!ssv.request_data.agent_id) {
    return { valid: false, error: 'agent_id missing in request_data' };
  }

  if (!ssv.request_data.ID_workflow) {
    return { valid: false, error: 'ID_workflow missing in request_data' };
  }

  return { valid: true };
}

/**
 * Load agent configuration from CSV registry
 */
async function loadAgentFromRegistry(ssv, fetch) {
  const registryUrl = ssv.workflow_config.registry_csv_url ||
    `${ssv.workflow_config.github_base}/assembly-logic/agents-registry.csv`;

  console.log('🔍 Loading CSV registry from:', registryUrl);

  const response = await fetch(registryUrl);
  if (!response.ok) {
    throw new Error(`Failed to load CSV registry: HTTP ${response.status}`);
  }

  const csvText = await response.text();
  const csvData = parseCSV(csvText);

  console.log('📊 CSV registry loaded, entries:', csvData.length);

  // Lookup by ID_workflow (primary) or fallback to agent_id
  let agentRow = csvData.find(row => row.ID_workflow === ssv.request_data.ID_workflow);

  if (!agentRow) {
    console.log('⚠️ ID_workflow not found, trying agent_id fallback...');
    agentRow = csvData.find(row => row.agent_id === ssv.request_data.agent_id);
  }

  if (!agentRow) {
    throw new Error(`Agent not found in registry. ID_workflow: ${ssv.request_data.ID_workflow}, agent_id: ${ssv.request_data.agent_id}`);
  }

  console.log('✅ Agent found in registry:', agentRow.agent_name);
  return agentRow;
}

/**
 * Simple CSV parser
 */
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map(line => {
    const values = line.split(',');
    const row = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || '';
    });
    return row;
  });
}

/**
 * Load detailed configurations from GitHub
 */
async function loadDetailedConfigurations(agentConfig, fetch, getWorkflowStaticData) {
  const configs = {};

  // Load agent config.json
  if (agentConfig.config_url) {
    try {
      console.log('📋 Loading config.json...');
      const response = await fetch(agentConfig.config_url);
      if (response.ok) {
        configs.agent_config = await response.json();
        console.log('✅ Agent config loaded');
      } else {
        console.log('⚠️ Agent config not available, using fallback');
        configs.agent_config = createFallbackConfig(agentConfig);
      }
    } catch (error) {
      console.log('⚠️ Agent config load error:', error.message);
      configs.agent_config = createFallbackConfig(agentConfig);
    }
  }

  // Load prompts.json
  if (agentConfig.prompts_url) {
    try {
      console.log('📜 Loading prompts.json...');
      const response = await fetch(agentConfig.prompts_url);
      if (response.ok) {
        configs.prompts = await response.json();
        console.log('✅ Prompts loaded');
      } else {
        console.log('⚠️ Prompts not available, using fallback');
        configs.prompts = createFallbackPrompts(agentConfig);
      }
    } catch (error) {
      console.log('⚠️ Prompts load error:', error.message);
      configs.prompts = createFallbackPrompts(agentConfig);
    }
  }

  // Load tools.json if available
  if (agentConfig.tools_config_url) {
    try {
      console.log('🔧 Loading tools.json...');
      const response = await fetch(agentConfig.tools_config_url);
      if (response.ok) {
        configs.tools = await response.json();
        console.log('✅ Tools loaded');
      }
    } catch (error) {
      console.log('⚠️ Tools load error:', error.message);
    }
  }

  return configs;
}

/**
 * Create fallback agent configuration
 */
function createFallbackConfig(agentRow) {
  return {
    agent_name: agentRow.agent_name || 'fallback-agent',
    version: '1.0.0-fallback',
    type: 'fallback_agent',
    description: `Fallback configuration for ${agentRow.agent_name}`,
    tools_config: {
      primary_llm: 'openrouter',
      fallback_mode: true
    }
  };
}

/**
 * Create fallback prompts
 */
function createFallbackPrompts(agentRow) {
  return {
    agent_name: agentRow.agent_name,
    system_prompts: {
      base_system: agentRow.system_prompt || 'You are a helpful AI assistant.',
      tool_selection: 'Use available tools to help the user with their query.',
      response_format: 'Provide clear, helpful responses with proper citations.'
    }
  };
}

/**
 * Call AI Agent with MCP tools
 */
async function callAIAgentWithTools(ssv, configs, fetch) {
  console.log('🤖 Preparing AI Agent call...');

  // For MVP, simulate AI response
  // TODO: Replace with actual AI Agent integration
  const simulatedResponse = {
    success: true,
    output: `AI Agent Response for query: "${ssv.request_data.query}"

Agent: ${configs.agent_config?.agent_name || 'Unknown'}
System Message: ${configs.prompts?.system_prompts?.base_system || 'Default prompt'}
MCP Endpoint: Available
Processing Time: ${Math.round(Math.random() * 5000)}ms

This is a simulated response from the Universal Workflow Processor.
The actual AI Agent integration will be implemented in the next phase.`,

    metadata: {
      agent_name: configs.agent_config?.agent_name,
      processing_time_ms: Math.round(Math.random() * 5000),
      mcp_tools_used: ['simulation_tool'],
      model_used: 'gemini-2.0-flash',
      tokens_used: Math.round(Math.random() * 1000)
    }
  };

  console.log('✅ AI Agent call completed (simulated)');
  return simulatedResponse;
}

/**
 * Format final response
 */
function formatFinalResponse(ssv, agentConfig, configs, aiResult) {
  return {
    // Main response
    success: true,
    output: aiResult.output,

    // Agent information
    agent_info: {
      agent_id: ssv.request_data.agent_id,
      agent_name: agentConfig.agent_name,
      ID_workflow: ssv.request_data.ID_workflow,
      specialization: agentConfig.specialization
    },

    // Session information
    session_info: {
      session_id: ssv.request_data.session_id,
      project_id: ssv.request_data.project_id,
      query: ssv.request_data.query,
      timestamp: new Date().toISOString()
    },

    // Processing metadata
    processing_metadata: {
      processor_version: '2.1',
      config_source: 'github',
      agent_config_loaded: !!configs.agent_config,
      prompts_loaded: !!configs.prompts,
      tools_loaded: !!configs.tools,
      processing_time_ms: aiResult.metadata?.processing_time_ms,
      github_base: ssv.workflow_config.github_base
    },

    // Debug information (if enabled)
    ...(ssv.runtime?.debug_mode && {
      debug_info: {
        ssv_original: ssv,
        agent_config_summary: agentConfig,
        configs_loaded: Object.keys(configs),
        ai_metadata: aiResult.metadata
      }
    })
  };
}

// Export for Node.js environments or make available globally
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { executeWorkflow };
} else if (typeof global !== 'undefined') {
  global.executeWorkflow = executeWorkflow;
}