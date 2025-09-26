/**
 * Context Builder Processor
 * GitHub-hosted processor for N8N Context Building
 * URL: https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/code/processors/context-builder.js
 */

function execute(input, vars) {
  console.log('🎯 Context Builder - Starting...');

  // Build session context
  const context = {
    // Session identification
    session_id: `${input.project_id}_${input.agent_id}_${Date.now()}`,
    project_id: input.project_id || vars.UPTAX_PROJECT_ID,
    agent_id: input.agent_id || 'agent_001',
    query: input.query || 'Default query',

    // Dynamic URLs using variables
    config_url: `${vars.UPTAX_GITHUB_BASE}/agents/${input.agent_id || 'agent_001'}/config.json`,
    prompt_url: `${vars.UPTAX_GITHUB_BASE}/agents/${input.agent_id || 'agent_001'}/prompt.json`,

    // Metadata
    timestamp: new Date().toISOString(),
    workflow_id: 'uptax-proc-1001-dynamic',
    original_input: input
  };

  console.log('✅ Context built for session:', context.session_id);
  console.log('📍 Agent ID:', context.agent_id);
  console.log('🔗 Config URL:', context.config_url);

  return [{ json: context }];
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { execute };
}