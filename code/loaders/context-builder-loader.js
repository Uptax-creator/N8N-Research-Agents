/**
 * Context Builder Loader - For N8N Code Node
 * Loads and executes context-builder.js from GitHub
 */

async function execute() {
  const processorUrl = `${$vars.UPTAX_GITHUB_BASE}/code/processors/context-builder.js`;
  const inputData = $('Webhook_Work_1001').item.json.body;
  
  try {
    const response = await fetch(processorUrl);
    const code = await response.text();
    const func = new Function('input', 'vars', code + '; return execute(input, vars);');
    return func(inputData, $vars);
  } catch (error) {
    console.error('❌ Context Builder loading failed:', error);
    return [{ json: { error: 'Processor loading failed', details: error.message } }];
  }
}

return await execute();