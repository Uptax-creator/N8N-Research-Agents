/**
 * CSV Parser with Data Merge v1.0.0
 * GitHub-hosted node code for N8N
 * Auto-deploy via URL: https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/code/nodes/csv-parser-with-merge.js
 */

function execute(currentInput, previousData) {
  // MERGE strategy - preserve all previous data
  const merged = {
    ...previousData,
    ...currentInput
  };

  const csvData = currentInput.data || currentInput.csv_data;
  const projectId = merged.project_id;
  const agentId = merged.agent_id;
  const workflowId = merged.workflow_id || 'uptax-proc-1001-dynamic';

  console.log('[CSV Parser] Looking for:', { workflowId, projectId, agentId });

  if (!csvData) {
    return [{
      json: {
        ...merged,
        error_occurred: true,
        message: 'No CSV data found',
        timestamp: new Date().toISOString()
      }
    }];
  }

  // Parse CSV
  const lines = csvData.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());

  let agentConfig = null;

  // Find matching row
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());

    if (values[0] === workflowId && values[1] === projectId && values[2] === agentId) {
      agentConfig = {};
      headers.forEach((header, index) => {
        agentConfig[header] = values[index] || '';
      });
      console.log('[CSV Parser] Match found:', agentConfig);
      break;
    }
  }

  if (!agentConfig) {
    return [{
      json: {
        ...merged,
        error_occurred: true,
        message: `No config found for: ${workflowId}/${projectId}/${agentId}`,
        csv_rows: lines.length - 1,
        timestamp: new Date().toISOString()
      }
    }];
  }

  // MERGE everything - never lose data!
  return [{
    json: {
      ...merged,  // All previous data
      agent_config: agentConfig,  // New config
      found_match: true,
      csv_parsed: true,
      version: "1.0.0"
    }
  }];
}

// N8N execution with merge
if (typeof $input !== 'undefined') {
  const current = $input.all()[0].json;
  const previous = $('Graph Params Parser')?.item?.json || {};
  return execute(current, previous);
} else {
  module.exports = { execute };
}