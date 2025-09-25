// Parse CSV and find matching workflow_id + project_id + agent_id
const input = $input.all()[0].json;
const csvData = input.data;
const projectId = input.project_id;
const agentId = input.agent_id;
const workflowId = 'uptax-proc-1001-dynamic';

console.log('Looking for:', { workflowId, projectId, agentId });

// Parse CSV
const lines = csvData.split('\n').filter(line => line.trim());

// Get headers
const headers = lines[0].split(',');
console.log('CSV Headers:', headers);

let agentConfig = null;

// Find matching row (skip header)
for (let i = 1; i < lines.length; i++) {
  const values = lines[i].split(',');
  console.log(`Row ${i} values:`, values);

  // Check if this row matches our criteria
  if (values[0] === workflowId && values[1] === projectId && values[2] === agentId) {
    console.log('MATCH FOUND at row', i);

    agentConfig = {
      workflow_id: values[0] || '',
      project_id: values[1] || '',
      agent_id: values[2] || '',
      agent_type: values[3] || '',
      description: values[4] || '',
      prompt_url: values[5] || '',
      processor_url: values[6] || '',
      mcp_endpoint: values[7] || '',
      tools_config_url: values[8] || ''
    };

    console.log('Agent Config built:', agentConfig);
    break;
  }
}

if (!agentConfig) {
  console.log('NO MATCH FOUND in CSV');
  return [{
    json: {
      error_occurred: true,
      message: `No configuration found for workflow: ${workflowId}, project_id: ${projectId}, agent_id: ${agentId}`,
      graph_key: input.graph_key,
      debug: {
        searched_for: { workflowId, projectId, agentId },
        csv_rows: lines.length,
        csv_sample: lines.slice(0, 3)
      }
    }
  }];
}

// Validate URLs exist
if (!agentConfig.tools_config_url || agentConfig.tools_config_url === '') {
  console.log('WARNING: tools_config_url is empty!');
  agentConfig.tools_config_url = 'https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/N8N/projects/project_001/agent_001_tools.json';
}

if (!agentConfig.prompt_url || agentConfig.prompt_url === '') {
  console.log('WARNING: prompt_url is empty!');
  agentConfig.prompt_url = 'https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/prompts/agents/enhanced_research_brazilian.txt';
}

return [{
  json: {
    ...input,
    agent_config: agentConfig,
    found_match: true,
    debug: {
      config_validated: true,
      has_tools_url: !!agentConfig.tools_config_url,
      has_prompt_url: !!agentConfig.prompt_url,
      has_mcp_endpoint: !!agentConfig.mcp_endpoint
    }
  }
}];