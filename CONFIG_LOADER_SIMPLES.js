// ✅ CONFIG LOADER SUPER SIMPLES - SEM CACHE
// Versão mínima que funciona sem getWorkflowStaticData

const context = $('Context Builder').item.json;

console.log('⚙️ Config Loader SIMPLES - Starting...');
console.log('📍 Project:', context.project_id);
console.log('🤖 Agent:', context.agent_id);
console.log('🔗 Config URL:', context.config_url);

// Tentar carregar do GitHub (sem cache)
if (context.config_url && !context.config_url.includes('undefined')) {
  try {
    console.log('🔄 Loading from GitHub...');
    const response = await fetch(context.config_url);

    if (response.ok) {
      const agentConfig = await response.json();
      console.log('📦 Config loaded from GitHub:', agentConfig.agent_id || agentConfig.agent_type);

      return [{
        json: {
          ...context,
          agent_config: agentConfig,
          config_source: 'github'
        }
      }];
    } else {
      console.log('⚠️ GitHub response not OK:', response.status);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

  } catch (error) {
    console.log('❌ GitHub loading failed:', error.message);
  }
}

// Fallback config (sem cache)
console.log('🔄 Using fallback config (no cache)');
const fallbackConfig = {
  agent_id: context.agent_id,
  agent_type: 'enhanced_research',
  description: 'Research assistant with fallback configuration',
  system_message: 'You are a helpful research assistant. Use your available tools proactively.',
  mcp_endpoints: [
    {
      type: 'search',
      name: 'bright_data',
      url: 'https://mcp.brightdata.com/sse?token=ecfc6404fb9eb026a9c802196b8d5caaf131d63c0931f9e888e57077e6b1f8cf'
    },
    {
      type: 'documentation',
      name: 'google_docs',
      url: 'https://apollo-3irns8zl6-composio.vercel.app/v3/mcp/aab98bef-8816-4873-95f6-45615ca063d4/mcp?include_composio_helper_actions=true'
    }
  ]
};

console.log('✅ Config Loader completed - using fallback');

return [{
  json: {
    ...context,
    agent_config: fallbackConfig,
    config_source: 'fallback_simple'
  }
}];