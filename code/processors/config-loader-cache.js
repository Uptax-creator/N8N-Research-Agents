/**
 * Config Loader with Cache Processor
 * GitHub-hosted processor for N8N Config Loading with TTL Cache
 * URL: https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/code/processors/config-loader-cache.js
 */

async function execute(context, vars, getWorkflowStaticData) {
  console.log('📊 Config Loader with Cache - Starting...');

  const staticData = getWorkflowStaticData('global');
  const cacheKey = `config_${context.project_id}_${context.agent_id}`;
  const CACHE_TTL = parseInt(vars.UPTAX_CACHE_TTL_MS);

  console.log('🔍 Checking cache for:', cacheKey);

  // Check cache first
  if (staticData[cacheKey] && staticData[cacheKey].timestamp) {
    const cacheAge = Date.now() - staticData[cacheKey].timestamp;

    if (cacheAge < CACHE_TTL) {
      console.log('✅ Cache hit:', cacheKey, `(${Math.round(cacheAge/1000)}s old)`);
      return [{
        json: {
          ...context,
          agent_config: staticData[cacheKey].data,
          config_source: 'cache',
          cache_age_ms: cacheAge
        }
      }];
    } else {
      console.log('⚠️ Cache expired:', cacheKey, `(${Math.round(cacheAge/1000)}s old)`);
    }
  }

  // Cache miss - load from GitHub
  console.log('🌐 Loading config from GitHub:', context.config_url);

  try {
    const response = await fetch(context.config_url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const agentConfig = await response.json();

    // Cache the config
    staticData[cacheKey] = {
      data: agentConfig,
      timestamp: Date.now(),
      url: context.config_url
    };

    console.log('✅ Config loaded and cached:', agentConfig.agent_type);
    console.log('🔧 MCP Endpoints:', agentConfig.mcp_endpoints?.length || 0);

    return [{
      json: {
        ...context,
        agent_config: agentConfig,
        config_source: 'github',
        config_loaded_at: new Date().toISOString()
      }
    }];

  } catch (error) {
    console.log('❌ Config loading failed:', error.message);

    // Fallback config
    const fallbackConfig = {
      workflow_id: context.workflow_id,
      project_id: context.project_id,
      agent_id: context.agent_id,
      agent_type: 'fallback',
      description: 'Fallback agent when config loading fails',
      system_message: 'You are a helpful assistant.',
      mcp_endpoints: [],
      tools_config: { timeout: 60000 }
    };

    return [{
      json: {
        ...context,
        agent_config: fallbackConfig,
        config_source: 'fallback',
        config_error: error.message
      }
    }];
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { execute };
}