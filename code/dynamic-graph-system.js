// ========================================
// DYNAMIC GRAPH SYSTEM WITH ERROR LOGGING
// ========================================

// Configuration URLs (can be environment variables)
const CONFIG = {
  CSV_PARSER_URL: "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/code/parsers/csv-parser.js",
  CONFIG_PREP_URL: "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/code/parsers/config-prep.js",
  ERROR_LOGGER_URL: "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/code/utils/error-logger.js",
  FALLBACK_CSV: "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/assembly-logic/agents-registry-graph.csv"
};

// ========================================
// UNIVERSAL ENTRY POINT
// ========================================
async function processGraphRequest(input) {
  const logger = {
    logs: [],
    errors: [],

    log: function(message, data) {
      this.logs.push({
        timestamp: new Date().toISOString(),
        message,
        data
      });
      console.log(`[LOG] ${message}`, data || '');
    },

    error: function(message, error) {
      this.errors.push({
        timestamp: new Date().toISOString(),
        message,
        error: error?.message || error
      });
      console.error(`[ERROR] ${message}`, error || '');
    },

    getReport: function() {
      return {
        logs: this.logs,
        errors: this.errors,
        hasErrors: this.errors.length > 0
      };
    }
  };

  try {
    logger.log('Starting Graph System Processing', { input });

    // 1. Extract parameters from any source
    const params = extractParameters(input, logger);
    if (!params.success) {
      return errorResponse('Parameter extraction failed', params.error, logger);
    }

    // 2. Load and parse CSV
    const csvData = await loadCSV(params.data, logger);
    if (!csvData.success) {
      return errorResponse('CSV loading failed', csvData.error, logger);
    }

    // 3. Find agent configuration
    const agentConfig = findAgentConfig(csvData.data, params.data, logger);
    if (!agentConfig.success) {
      return errorResponse('Agent config not found', agentConfig.error, logger);
    }

    // 4. Load dynamic configurations
    const dynamicConfig = await loadDynamicConfigs(agentConfig.data, logger);
    if (!dynamicConfig.success) {
      return errorResponse('Dynamic config loading failed', dynamicConfig.error, logger);
    }

    // 5. Prepare final output
    return successResponse(params.data, agentConfig.data, dynamicConfig.data, logger);

  } catch (error) {
    logger.error('Unexpected system error', error);
    return errorResponse('System error', error, logger);
  }
}

// ========================================
// PARAMETER EXTRACTION
// ========================================
function extractParameters(input, logger) {
  try {
    logger.log('Extracting parameters from input');

    // Handle different input formats
    const data = input?.json || input?.body || input || {};

    // Try multiple parameter sources
    const projectId =
      data.project_id ||
      data.query?.project_id ||
      data.body?.project_id ||
      data.params?.project_id;

    const agentId =
      data.agent_id ||
      data.query?.agent_id ||
      data.body?.agent_id ||
      data.params?.agent_id;

    const query =
      data.query ||
      data.message ||
      data.text ||
      "Default query";

    logger.log('Extracted parameters', { projectId, agentId, query });

    if (!projectId || !agentId) {
      throw new Error(`Missing required parameters. Got: project_id=${projectId}, agent_id=${agentId}`);
    }

    return {
      success: true,
      data: {
        project_id: projectId,
        agent_id: agentId,
        query: query,
        graph_key: `${projectId}_${agentId}_${Date.now()}`
      }
    };

  } catch (error) {
    logger.error('Parameter extraction failed', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ========================================
// CSV LOADING
// ========================================
async function loadCSV(params, logger) {
  try {
    logger.log('Loading CSV from GitHub');

    const csvUrl = params.csv_url || CONFIG.FALLBACK_CSV;

    // In N8N context, use HTTP Request node result
    // For testing, we'll simulate the CSV data
    const csvData = `workflow_id,project_id,agent_id,agent_type,description,prompt_url,processor_url,mcp_endpoint,tools_config_url
uptax-proc-1001-dynamic,project_001,agent_001,enhanced_research,Brazilian market research,prompt.txt,processor.js,https://mcp.brightdata.com/sse,tools.json`;

    logger.log('CSV loaded successfully', { lines: csvData.split('\n').length });

    return {
      success: true,
      data: csvData
    };

  } catch (error) {
    logger.error('CSV loading failed', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ========================================
// AGENT CONFIGURATION FINDER
// ========================================
function findAgentConfig(csvData, params, logger) {
  try {
    logger.log('Finding agent configuration', {
      project_id: params.project_id,
      agent_id: params.agent_id
    });

    const lines = csvData.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      if (row.project_id === params.project_id && row.agent_id === params.agent_id) {
        logger.log('Agent configuration found', row);
        return {
          success: true,
          data: row
        };
      }
    }

    throw new Error(`No configuration found for project_id=${params.project_id}, agent_id=${params.agent_id}`);

  } catch (error) {
    logger.error('Agent config search failed', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ========================================
// DYNAMIC CONFIGURATION LOADER
// ========================================
async function loadDynamicConfigs(agentConfig, logger) {
  try {
    logger.log('Loading dynamic configurations');

    // Simulate loading (in N8N, use HTTP Request nodes)
    const configs = {
      prompt: "You are an AI assistant specialized in " + agentConfig.description,
      tools: {
        mcp_endpoint: agentConfig.mcp_endpoint,
        agent_type: agentConfig.agent_type
      },
      processor: "default"
    };

    logger.log('Dynamic configs loaded', {
      hasPrompt: !!configs.prompt,
      hasTools: !!configs.tools,
      hasProcessor: !!configs.processor
    });

    return {
      success: true,
      data: configs
    };

  } catch (error) {
    logger.error('Dynamic config loading failed', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ========================================
// RESPONSE BUILDERS
// ========================================
function successResponse(params, agentConfig, dynamicConfig, logger) {
  const report = logger.getReport();

  return [{
    json: {
      success: true,
      graph_key: params.graph_key,
      project_id: params.project_id,
      agent_id: params.agent_id,
      query: params.query,
      agent_config: agentConfig,
      dynamic_config: dynamicConfig,
      ready_for_execution: true,
      debug: {
        logs_count: report.logs.length,
        errors_count: report.errors.length,
        execution_report: report
      }
    }
  }];
}

function errorResponse(message, error, logger) {
  const report = logger.getReport();

  return [{
    json: {
      success: false,
      error_occurred: true,
      error_message: message,
      error_details: error,
      debug: {
        execution_report: report,
        logs: report.logs,
        errors: report.errors
      },
      timestamp: new Date().toISOString()
    }
  }];
}

// ========================================
// N8N ENTRY POINT
// ========================================
// For N8N Code node
return processGraphRequest($input.all()[0]);