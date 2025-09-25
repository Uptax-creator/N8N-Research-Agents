/**
 * Graph Params Parser v1.0.0
 * GitHub-hosted node code for N8N
 * Auto-deploy via URL: https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/code/nodes/graph-params-parser.js
 */

function execute(input) {
  const data = input?.json || input || {};

  // Extract from multiple sources
  const projectId = data.project_id || data.query?.project_id || data.body?.project_id;
  const agentId = data.agent_id || data.query?.agent_id || data.body?.agent_id;
  const queryText = data.query || data.message || "Default query";

  // Validation
  if (!projectId || !agentId) {
    return [{
      json: {
        error_occurred: true,
        message: `Missing required params: project_id=${projectId}, agent_id=${agentId}`,
        received: data,
        timestamp: new Date().toISOString()
      }
    }];
  }

  // Generate unique key
  const graphKey = `${projectId}_${agentId}_${Date.now()}`;

  return [{
    json: {
      project_id: projectId,
      agent_id: agentId,
      query: queryText,
      graph_key: graphKey,
      csv_url: process.env.CSV_URL || "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/assembly-logic/agents-registry-graph.csv",
      version: "1.0.0",
      source: "github"
    }
  }];
}

// N8N execution
if (typeof $input !== 'undefined') {
  return execute($input.all()[0]);
} else {
  module.exports = { execute };
}