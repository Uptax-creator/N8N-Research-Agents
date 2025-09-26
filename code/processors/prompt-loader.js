/**
 * Prompt Loader with Cache - GitHub-hosted processor
 * URL: https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/code/processors/prompt-loader.js
 */

async function execute(input, vars, getWorkflowStaticData) {
  console.log('=Ä Prompt Loader - Starting...');

  const staticData = getWorkflowStaticData('global');
  const promptCacheKey = `prompt_${input.project_id}_${input.agent_id}`;
  const CACHE_TTL = parseInt(vars.UPTAX_CACHE_TTL_MS || '300000');

  // Check prompt cache
  if (staticData[promptCacheKey] && staticData[promptCacheKey].timestamp) {
    const cacheAge = Date.now() - staticData[promptCacheKey].timestamp;

    if (cacheAge < CACHE_TTL) {
      console.log(' Prompt cache hit:', promptCacheKey);
      return [{
        json: {
          ...input,
          prompt_data: staticData[promptCacheKey].data,
          prompt_source: 'cache',
          cache_age_ms: cacheAge
        }
      }];
    }
  }

  // Load prompt from GitHub
  try {
    console.log('= Loading prompt from:', input.prompt_url);
    const response = await fetch(input.prompt_url);
    const promptData = await response.json();

    // Cache the prompt
    staticData[promptCacheKey] = {
      data: promptData,
      timestamp: Date.now()
    };

    console.log(' Prompt loaded and cached');
    return [{
      json: {
        ...input,
        prompt_data: promptData,
        prompt_source: 'github'
      }
    }];

  } catch (error) {
    console.log('L Prompt loading failed:', error.message);
    // Fallback prompt
    return [{
      json: {
        ...input,
        prompt_data: {
          system_message: "You are a helpful assistant. Use your tools proactively.",
          instructions: ["Be thorough", "Use available tools", "Provide structured responses"],
          tools_guidance: {
            "search": "Use for finding current information",
            "documentation": "Use for creating documents"
          }
        },
        prompt_source: 'fallback',
        prompt_error: error.message
      }
    }];
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { execute };
}