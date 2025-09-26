/**
 * Response Formatter - For N8N Code Node
 * Loads and executes response-formatter.js from GitHub
 */

async function execute() {
  const processorUrl = `${$vars.UPTAX_GITHUB_BASE}/code/processors/response-formatter.js`;
  const aiResponse = $('AI Agent').item.json;
  const sessionContext = $('Agent Initializer').item.json.session_context;
  
  try {
    const response = await fetch(processorUrl);
    const code = await response.text();
    const func = new Function('aiResponse', 'sessionContext', code + '; return execute(aiResponse, sessionContext);');
    return func(aiResponse, sessionContext);
  } catch (error) {
    console.error('❌ Response Formatter loading failed:', error);
    return [{ json: { error: 'Processor loading failed', details: error.message } }];
  }
}

return await execute();