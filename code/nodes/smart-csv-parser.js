/**
 * Smart CSV Parser v2.0.0
 * Treats CSV as "configuration spreadsheet"
 * Supports filtering, validation, and metadata
 */

function execute(input) {
  const csvData = input.data;
  const projectId = input.project_id;
  const agentId = input.agent_id;
  const workflowId = input.workflow_id || 'uptax-proc-1001-dynamic';

  console.log(`[Smart CSV] Looking for agent: ${workflowId}/${projectId}/${agentId}`);

  // Parse CSV with headers
  const lines = csvData.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());

  console.log(`[Smart CSV] Headers found:`, headers);
  console.log(`[Smart CSV] Total rows: ${lines.length - 1}`);

  // Find matching agent
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};

    // Map headers to values
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    // Check match and status
    if (row.workflow_id === workflowId &&
        row.project_id === projectId &&
        row.agent_id === agentId) {

      console.log(`[Smart CSV] Found agent config:`, row);

      // Check if agent is active
      if (row.status && row.status !== 'active') {
        return [{
          json: {
            error_occurred: true,
            message: `Agent ${agentId} is ${row.status}, not active`,
            agent_status: row.status,
            timestamp: new Date().toISOString()
          }
        }];
      }

      // Return enhanced config with metadata
      return [{
        json: {
          // Original params
          ...input,

          // Agent configuration
          agent_config: {
            workflow_id: row.workflow_id,
            project_id: row.project_id,
            agent_id: row.agent_id,
            agent_type: row.agent_type,
            description: row.description,
            prompt_url: row.prompt_url,
            processor_url: row.processor_url,
            mcp_endpoint: row.mcp_endpoint,
            tools_config_url: row.tools_config_url
          },

          // Metadata from CSV
          metadata: {
            status: row.status || 'unknown',
            version: row.version || 'v1.0',
            created_by: row.created_by || 'system',
            updated_at: row.updated_at || new Date().toISOString(),
            csv_row: i,
            csv_source: 'github'
          },

          // Success flag
          found_match: true,
          csv_parsed: true
        }
      }];
    }
  }

  // No match found
  console.log(`[Smart CSV] No match found for: ${workflowId}/${projectId}/${agentId}`);

  return [{
    json: {
      error_occurred: true,
      message: `Agent not found: ${workflowId}/${projectId}/${agentId}`,
      searched_rows: lines.length - 1,
      available_agents: lines.slice(1, 4).map(line => {
        const vals = line.split(',');
        return `${vals[0]}/${vals[1]}/${vals[2]}`;
      }),
      timestamp: new Date().toISOString()
    }
  }];
}

// N8N execution
if (typeof $input !== 'undefined') {
  return execute($input.all()[0].json);
} else {
  module.exports = { execute };
}