/**
 * GitHub Processor Loader - Template for N8N Code Nodes
 * Minimal loader that fetches and executes GitHub-hosted processors
 */

// Configuration - REPLACE "PROCESSOR_NAME" with actual processor name
const PROCESSOR_NAME = 'context-builder'; // context-builder, config-loader-cache, prompt-loader, agent-initializer, response-formatter

async function loadAndExecute() {
  // Get data from previous node based on processor type
  let inputData, previousNodeData;

  switch (PROCESSOR_NAME) {
    case 'context-builder':
      inputData = $('Webhook_Work_1001').item.json.body;
      break;
    case 'config-loader-cache':
      previousNodeData = $('Context Builder').item.json;
      inputData = previousNodeData;
      break;
    case 'prompt-loader':
      previousNodeData = $('Config Loader with Cache').item.json;
      inputData = previousNodeData;
      break;
    case 'agent-initializer':
      previousNodeData = $('Prompt Loader with Cache').item.json;
      inputData = previousNodeData;
      break;
    case 'response-formatter':
      const aiResponse = $('AI Agent').item.json;
      const sessionContext = $('Agent Initializer').item.json.session_context;
      return await executeProcessor(aiResponse, sessionContext);
    default:
      throw new Error('Unknown processor: ' + PROCESSOR_NAME);
  }

  return await executeProcessor(inputData);
}

async function executeProcessor(inputData, secondArg = null) {
  try {
    // Load processor from GitHub
    const processorUrl = `${$vars.UPTAX_GITHUB_BASE}/code/processors/${PROCESSOR_NAME}.js`;
    console.log('🔄 Loading processor:', processorUrl);

    const response = await fetch(processorUrl);
    if (!response.ok) {
      throw new Error(`Failed to load processor: ${response.status}`);
    }

    const processorCode = await response.text();

    // Create execution context
    const func = new Function('input', 'vars', 'getWorkflowStaticData', 'fetch', 'console', 'Date', 'JSON',
      processorCode + '\n; return execute(input, vars, getWorkflowStaticData);'
    );

    // Execute processor
    const result = secondArg
      ? await func(inputData, $vars, getWorkflowStaticData, fetch, console, Date, JSON)
      : await func(inputData, $vars, getWorkflowStaticData, fetch, console, Date, JSON);

    console.log('✅ Processor executed successfully');
    return result;

  } catch (error) {
    console.error('❌ Processor execution failed:', error);
    return [{
      json: {
        success: false,
        error: 'GitHub processor loading failed',
        processor: PROCESSOR_NAME,
        details: error.message,
        fallback_data: inputData || {}
      }
    }];
  }
}

// Execute and return result
return await loadAndExecute();