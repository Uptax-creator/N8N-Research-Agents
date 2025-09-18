// Environment Variable Loader v1.0
// Loads configuration from ENV vars with GitHub fallback

const startTime = Date.now();
console.log('=== Environment Variable Loader v1.0 ===');

// Load configuration with priority chain
const loadConfigWithFallback = () => {
  try {
    // Priority 1: Environment Variables
    if (process.env.AGENT_CONFIG) {
      console.log('✅ Loading config from environment variables');
      return JSON.parse(process.env.AGENT_CONFIG);
    }

    // Priority 2: GitHub (existing system)
    if ($('Load GitHub Config') && $('Load GitHub Config').item.json.body) {
      console.log('✅ Loading config from GitHub');
      return $('Load GitHub Config').item.json.body;
    }

    // Priority 3: Default fallback
    console.log('⚠️ Using default configuration');
    return {
      agent_name: 'default-agent',
      version: '1.0.0',
      type: 'basic_agent'
    };
  } catch (error) {
    console.error('❌ Config loading error:', error.message);
    return { agent_name: 'error-agent', version: '1.0.0' };
  }
};

// Load prompts with priority chain
const loadPromptsWithFallback = () => {
  try {
    // Priority 1: Environment Variables
    if (process.env.AGENT_PROMPTS) {
      console.log('✅ Loading prompts from environment variables');
      return JSON.parse(process.env.AGENT_PROMPTS);
    }

    // Priority 2: GitHub (existing system)
    if ($('Load GitHub Prompts') && $('Load GitHub Prompts').item.json.body) {
      console.log('✅ Loading prompts from GitHub');
      return $('Load GitHub Prompts').item.json.body;
    }

    // Priority 3: Default prompts
    console.log('⚠️ Using default prompts');
    return {
      system_prompts: {
        base_system: 'You are a helpful AI assistant.'
      },
      task_prompts: {
        comprehensive_research: 'Research and analyze: {query}'
      }
    };
  } catch (error) {
    console.error('❌ Prompts loading error:', error.message);
    return { system_prompts: { base_system: 'Basic assistant.' } };
  }
};

// Load input data
const inputData = $('Webhook Enhanced').item.json.body;

// Execute loading
const config = loadConfigWithFallback();
const prompts = loadPromptsWithFallback();

// Determine processing parameters
const researchType = inputData.research_type || 'comprehensive_research';
const query = inputData.query || 'Default query';

// Build prompts
const systemPrompt = prompts.system_prompts?.base_system || 'You are a helpful assistant.';
const taskPrompt = prompts.task_prompts?.[researchType] || prompts.task_prompts?.comprehensive_research || 'Analyze: {query}';
const finalTaskPrompt = taskPrompt.replace('{query}', query);

// Session management
const sessionId = inputData.session_id || `session_${Date.now()}`;

// Performance metrics
const processingTime = Date.now() - startTime;

console.log('✅ Configuration loaded:', config.agent_name, config.version);
console.log('✅ Prompts loaded:', Object.keys(prompts.task_prompts || {}).length, 'templates');
console.log('✅ Processing completed in', processingTime, 'ms');

// Return processed data
return [{
  // For AI Agent
  text: finalTaskPrompt,
  session_id: sessionId,
  system_message: systemPrompt,

  // Configuration metadata
  config: config,
  prompts: prompts,
  research_type: researchType,
  output_format: inputData.output_format || 'research',

  // Loading metadata
  loading_metadata: {
    config_source: process.env.AGENT_CONFIG ? 'environment' : 'github',
    prompts_source: process.env.AGENT_PROMPTS ? 'environment' : 'github',
    processing_time_ms: processingTime,
    fallback_used: !process.env.AGENT_CONFIG || !process.env.AGENT_PROMPTS
  },

  // Environment info
  environment: {
    has_agent_config: !!process.env.AGENT_CONFIG,
    has_agent_prompts: !!process.env.AGENT_PROMPTS,
    node_env: process.env.NODE_ENV || 'development',
    load_from_github: process.env.LOAD_FROM_GITHUB !== 'false'
  },

  timestamp: new Date().toISOString()
}];