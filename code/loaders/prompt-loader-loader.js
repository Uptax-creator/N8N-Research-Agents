/**
 * Prompt Loader with Cache - For N8N Code Node
 * Loads and executes prompt-loader.js from GitHub
 */

async function execute() {
  const processorUrl = `${$vars.UPTAX_GITHUB_BASE}/code/processors/prompt-loader.js`;
  const inputData = $('Config Loader with Cache').item.json;
  
  try {
    const response = await fetch(processorUrl);
    const code = await response.text();
    const func = new Function('input', 'vars', 'getWorkflowStaticData', 'fetch', 'console', 
      code + '; return execute(input, vars, getWorkflowStaticData);');
    return await func(inputData, $vars, getWorkflowStaticData);
  } catch (error) {
    console.error('❌ Prompt Loader loading failed:', error);
    return [{ json: { error: 'Processor loading failed', details: error.message } }];
  }
}

return await execute();