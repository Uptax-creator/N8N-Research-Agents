/**
 * Config Loader with Cache - For N8N Code Node
 * Loads and executes config-loader-cache.js from GitHub
 */

async function execute() {
  const processorUrl = `${$vars.UPTAX_GITHUB_BASE}/code/processors/config-loader-cache.js`;
  const inputData = $('Context Builder').item.json;
  
  try {
    const response = await fetch(processorUrl);
    const code = await response.text();
    const func = new Function('input', 'vars', 'getWorkflowStaticData', 'fetch', 'console', 
      code + '; return execute(input, vars, getWorkflowStaticData, fetch, console);');
    return await func(inputData, $vars, getWorkflowStaticData, fetch, console);
  } catch (error) {
    console.error('❌ Config Loader loading failed:', error);
    return [{ json: { error: 'Processor loading failed', details: error.message } }];
  }
}

return await execute();