// Parse CSV and find matching workflow_id + project_id + agent_id
// IMPORTANT: Preserve all input data!

const input = $input.all()[0].json;

// CSV data comes from HTTP Request
const csvData = input.data;

// These come from the PREVIOUS node (Graph Params Parser)
// We need to look in the right place!
const projectId = input.project_id || $('Graph Params Parser').item.json.project_id;
const agentId = input.agent_id || $('Graph Params Parser').item.json.agent_id;
const query = input.query || $('Graph Params Parser').item.json.query;
const graphKey = input.graph_key || $('Graph Params Parser').item.json.graph_key;

const workflowId = 'uptax-proc-1001-dynamic';

console.log('CSV Parser - Looking for:', { workflowId, projectId, agentId });

if (!projectId || !agentId) {
  return [{
    json: {
      error_occurred: true,
      message: `Missing parameters - project_id: ${projectId}, agent_id: ${agentId}`,
      debug: {
        input_received: input,
        params_parser_data: $('Graph Params Parser').item.json
      }
    }
  }];
}

// Parse CSV
const lines = csvData.split('\n').filter(line => line.trim());
let agentConfig = null;

// Find matching row (skip header)
for (let i = 1; i < lines.length; i++) {
  const values = lines[i].split(',');

  if (values[0] === workflowId && values[1] === projectId && values[2] === agentId) {
    agentConfig = {
      workflow_id: values[0],
      project_id: values[1],
      agent_id: values[2],
      agent_type: values[3],
      description: values[4],
      prompt_url: values[5],
      processor_url: values[6],
      mcp_endpoint: values[7],
      tools_config_url: values[8]
    };
    console.log('Match found!', agentConfig);
    break;
  }
}

if (!agentConfig) {
  return [{
    json: {
      error_occurred: true,
      message: `No configuration found for: ${workflowId}, ${projectId}, ${agentId}`,
      graph_key: graphKey,
      csv_rows_checked: lines.length - 1
    }
  }];
}

// RETURN ALL DATA - don't lose anything!
return [{
  json: {
    // Preserve original params
    project_id: projectId,
    agent_id: agentId,
    query: query,
    graph_key: graphKey,

    // Add agent config
    agent_config: agentConfig,
    found_match: true,

    // Debug info
    debug: {
      parser_success: true,
      config_found: true
    }
  }
}];