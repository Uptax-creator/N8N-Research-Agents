// Minimal Response Formatter v3.1 - Test Version
// No error keys, minimal code to isolate the issue

// Simple response without any error keys
const response = {
  success: true,
  agent: "business-plan",
  name: "Especialista em Planos de Negócio",
  version: "4.0.0",
  query: $json.query || "Test query",
  result: "Test response - no AI processing",
  timestamp: new Date().toISOString(),
  test_mode: true
};

console.log('✅ Minimal Response Generated:', response);

return [response];