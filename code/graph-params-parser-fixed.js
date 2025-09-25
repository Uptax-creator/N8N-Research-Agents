// Graph CSV Parser - Works with both GET and POST
const input = $input.all()[0].json;

// Try to get params from body (POST) or query (GET)
const projectId = input.project_id || input.query?.project_id || $input.all()[0].json.body?.project_id;
const agentId = input.agent_id || input.query?.agent_id || $input.all()[0].json.body?.agent_id;
const queryText = input.query || input.query?.query || $input.all()[0].json.body?.query || "Default query";

console.log('Debug - Input received:', JSON.stringify(input));
console.log('Debug - Project ID:', projectId);
console.log('Debug - Agent ID:', agentId);

if (!projectId || !agentId) {
  return [{
    json: {
      error_occurred: true,
      message: "Missing required parameters: project_id and agent_id",
      graph_key: "invalid",
      debug: {
        received_input: input,
        expected: "project_id and agent_id in request body or query params"
      }
    }
  }];
}

// Generate graph key
const graphKey = `${projectId}_${agentId}_${Date.now()}`;

return [{
  json: {
    project_id: projectId,
    agent_id: agentId,
    query: queryText,
    graph_key: graphKey,
    csv_url: "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/assembly-logic/agents-registry-graph.csv"
  }
}];