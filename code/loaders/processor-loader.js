/**
 * Generic Processor Loader
 * Minimal code to load and execute GitHub-hosted processors in N8N nodes
 * This is the ONLY code that should be in N8N Code Nodes
 */

async function loadAndExecuteProcessor(processorName, previousNodeName, vars, getWorkflowStaticData) {
  const processorUrl = `${vars.UPTAX_GITHUB_BASE}/code/processors/${processorName}.js`;

  console.log(`🚀 Loading processor: ${processorName}`);
  console.log(`🔗 URL: ${processorUrl}`);

  try {
    // Get input data from previous node
    const inputData = $(previousNodeName).item.json;

    // Load processor code from GitHub
    const response = await fetch(processorUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const processorCode = await response.text();
    console.log(`📦 Processor loaded: ${processorCode.length} chars`);

    // Create execution environment
    const executionContext = {
      console: console,
      Date: Date,
      fetch: fetch,
      JSON: JSON
    };

    // Execute processor
    const func = new Function(
      'inputData', 'vars', 'getWorkflowStaticData', 'console', 'Date', 'fetch', 'JSON',
      processorCode + '\n; return execute(inputData, vars, getWorkflowStaticData);'
    );

    const result = await func(
      inputData,
      vars,
      getWorkflowStaticData,
      executionContext.console,
      executionContext.Date,
      executionContext.fetch,
      executionContext.JSON
    );

    console.log(`✅ Processor executed: ${processorName}`);
    return result;

  } catch (error) {
    console.log(`❌ Processor failed: ${processorName}`, error.message);

    return [{
      json: {
        success: false,
        error: error.message,
        processor: processorName,
        timestamp: new Date().toISOString()
      }
    }];
  }
}

// Export for direct use in N8N Code Nodes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { loadAndExecuteProcessor };
}