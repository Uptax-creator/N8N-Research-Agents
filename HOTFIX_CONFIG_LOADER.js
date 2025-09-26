// ✅ HOTFIX - Config Loader with Cache (Node 204a3aac-7602-4600-a2e0-4cb980e4200a)
// Corrigido: getWorkflowStaticData + fallbacks robustos

const context = $('Context Builder').item.json;

// Variables com fallbacks
const CACHE_TTL = parseInt($vars?.UPTAX_CACHE_TTL_MS || '300000');

console.log('⚙️ Config Loader - Starting...');
console.log('📍 Project:', context.project_id);
console.log('🤖 Agent:', context.agent_id);
console.log('🔗 Config URL:', context.config_url);

// Tentar usar static data com fallback
let staticData = {};
let cacheKey = `config_${context.project_id}_${context.agent_id}`;
let cacheAvailable = false;

try {
  staticData = getWorkflowStaticData('global');
  cacheAvailable = true;
  console.log('💾 Cache available');
} catch (error) {
  console.log('⚠️ Cache unavailable:', error.message);
  staticData = {}; // Fallback para objeto vazio
}

// Verificar cache se disponível
if (cacheAvailable && staticData[cacheKey] && staticData[cacheKey].timestamp) {
  const cacheAge = Date.now() - staticData[cacheKey].timestamp;

  if (cacheAge < CACHE_TTL) {
    console.log('✅ Cache hit! Age:', Math.round(cacheAge / 1000), 'seconds');
    return [{
      json: {
        ...context,
        agent_config: staticData[cacheKey].data,
        config_source: 'cache',
        cache_age_ms: cacheAge
      }
    }];
  } else {
    console.log('⏰ Cache expired. Age:', Math.round(cacheAge / 1000), 'seconds');
  }
}

// Tentar carregar do GitHub
if (context.config_url && !context.config_url.includes('undefined')) {
  try {
    console.log('🔄 Loading from GitHub...');
    const response = await fetch(context.config_url);

    if (response.ok) {
      const agentConfig = await response.json();
      console.log('📦 Config loaded:', agentConfig.agent_id || agentConfig.agent_type);

      // Tentar salvar no cache
      if (cacheAvailable) {
        try {
          staticData[cacheKey] = {
            data: agentConfig,
            timestamp: Date.now()
          };
          console.log('💾 Config cached successfully');
        } catch (e) {
          console.log('⚠️ Cache save failed:', e.message);
        }
      }

      return [{
        json: {
          ...context,
          agent_config: agentConfig,
          config_source: 'github'
        }
      }];
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

  } catch (error) {
    console.log('❌ GitHub loading failed:', error.message);
  }
}

// Fallback config robusto
console.log('🔄 Using enhanced fallback config');
const fallbackConfig = {
  agent_id: context.agent_id,
  agent_type: 'enhanced_research',
  description: 'Enhanced research assistant with fallback configuration',
  system_message: "You are a helpful research assistant. Use your available tools proactively to help users find information and create documents.",
  mcp_endpoints: [
    {
      type: 'search',
      name: 'bright_data',
      description: 'Search and web scraping capabilities',
      url: 'https://mcp.brightdata.com/sse?token=ecfc6404fb9eb026a9c802196b8d5caaf131d63c0931f9e888e57077e6b1f8cf'
    },
    {
      type: 'documentation',
      name: 'google_docs',
      description: 'Document creation and management',
      url: 'https://apollo-3irns8zl6-composio.vercel.app/v3/mcp/aab98bef-8816-4873-95f6-45615ca063d4/mcp?include_composio_helper_actions=true'
    }
  ],
  tools_config: {
    timeout: 60000,
    max_retries: 3
  }
};

return [{
  json: {
    ...context,
    agent_config: fallbackConfig,
    config_source: 'fallback',
    debug_info: {
      cache_available: cacheAvailable,
      config_url_valid: context.config_url && !context.config_url.includes('undefined'),
      variables_status: 'check_logs'
    }
  }
}];