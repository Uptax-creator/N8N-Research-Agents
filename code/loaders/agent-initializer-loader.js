/**
 * Agent Initializer - For N8N Code Node
 * Loads and executes agent-initializer.js from GitHub
 */

async function execute() {
  const processorUrl = `${$vars.UPTAX_GITHUB_BASE}/code/processors/agent-initializer.js`;
  const inputData = $('Prompt Loader with Cache').item.json;
  
  try {
    const response = await fetch(processorUrl);
    const code = await response.text();
    const func = new Function('input', 'vars', code + '; return execute(input, vars);');
    return func(inputData, $vars);
  } catch (error) {
    console.error('❌ Agent Initializer loading failed:', error);
    return [{ json: { error: 'Processor loading failed', details: error.message } }];
  }
}

return await execute();