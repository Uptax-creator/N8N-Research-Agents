# 🔧 N8N Variables Setup - Sprint 3

## **Required Variables Configuration**

### **1. Access N8N Variables**
```
URL: https://primary-production-56785.up.railway.app/settings/variables
```

### **2. Create the following Custom Variables:**

| Variable Name | Value | Description |
|---------------|--------|-------------|
| `UPTAX_GITHUB_BASE` | `https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment` | Base URL for GitHub processors |
| `UPTAX_PROJECT_ID` | `project_001` | Default project identifier |
| `UPTAX_CACHE_TTL_MS` | `300000` | Cache TTL (5 minutes) |
| `UPTAX_DEFAULT_TIMEOUT` | `60000` | Default request timeout |

### **3. Variable Usage in Code Nodes**
```javascript
// Access variables using $vars
const githubBase = $vars.UPTAX_GITHUB_BASE;
const cacheTimeout = parseInt($vars.UPTAX_CACHE_TTL_MS);
```

---

## **Node Code Updates Required**

### **Context Builder** (Node ID: bb7cbc09-7340-4d0b-a2df-16b4656b1868)
```javascript
// ❌ REPLACE: Reference to 'Webhook Enhanced'
const input = $('Webhook Enhanced').item.json.body;

// ✅ WITH: Correct node reference
const input = $('Webhook_Work_1001').item.json.body;

// ❌ REPLACE: Missing fallback for variables
project_id: input.project_id || $vars.UPTAX_PROJECT_ID,

// ✅ WITH: Proper fallback
project_id: input.project_id || $vars.UPTAX_PROJECT_ID || 'project_001',
```

### **Response Formatter** (Node ID: f10069c9-1aeb-4b45-9aa0-4417b31025f1)
```javascript
// ❌ CURRENT: Uses hardcoded session_context path
const sessionContext = $('Agent Initializer').item.json.session_context;

// ✅ ALTERNATIVE: GitHub Loader Approach
const processorUrl = `${$vars.UPTAX_GITHUB_BASE}/code/processors/response-formatter.js`;
const response = await fetch(processorUrl);
const code = await response.text();
const func = new Function('aiResponse', 'sessionContext', code + '; return execute(aiResponse, sessionContext);');
return func($('AI Agent').item.json, $('Agent Initializer').item.json.session_context);
```

---

## **Complete Node Replacement Strategy**

### **Option A: Minimal Loader (Recommended)**
Replace each Code Node content with:

```javascript
// Replace PROCESSOR_NAME with: context-builder, config-loader-cache, prompt-loader, agent-initializer, response-formatter
const processorName = 'PROCESSOR_NAME';
const processorUrl = `${$vars.UPTAX_GITHUB_BASE}/code/loaders/${processorName}-loader.js`;

try {
  const response = await fetch(processorUrl);
  const code = await response.text();
  const func = new Function('$', '$vars', 'getWorkflowStaticData', 'fetch', 'console', code);
  return await func($, $vars, getWorkflowStaticData, fetch, console);
} catch (error) {
  console.error(`❌ ${processorName} failed:`, error);
  return [{ json: { error: 'Processor loading failed', details: error.message } }];
}
```

### **Option B: Direct Processor Loading**
```javascript
const processorUrl = `${$vars.UPTAX_GITHUB_BASE}/code/processors/PROCESSOR_NAME.js`;
const response = await fetch(processorUrl);
const code = await response.text();
const func = new Function('input', 'vars', 'getWorkflowStaticData', code + '; return execute(input, vars, getWorkflowStaticData);');
return await func(INPUT_DATA, $vars, getWorkflowStaticData);
```

---

## **Testing Commands**

### **1. Test Variables Access**
```bash
curl -X POST "https://primary-production-56785.up.railway.app/webhook/work-1001" \
-H "Content-Type: application/json" \
-d '{"project_id": "test_vars", "agent_id": "agent_001", "query": "test variables"}'
```

### **2. Test GitHub Processor Loading**
```bash
curl -s "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/code/processors/context-builder.js" | head -5
```

### **3. Validate Cache Functionality**
```bash
# First call - should cache
curl -X POST "https://primary-production-56785.up.railway.app/webhook/work-1001" \
-H "Content-Type: application/json" \
-d '{"project_id": "cache_test", "agent_id": "agent_001", "query": "cache test 1"}'

# Second call - should use cache (under 5 min)
curl -X POST "https://primary-production-56785.up.railway.app/webhook/work-1001" \
-H "Content-Type: application/json" \
-d '{"project_id": "cache_test", "agent_id": "agent_001", "query": "cache test 2"}'
```

---

## **Next Steps**

1. ✅ Variables configured in N8N UI
2. ⏳ Node code updated with loaders
3. ⏳ Test webhook end-to-end
4. ⏳ Validate cache TTL behavior

**Priority**: Update Context Builder node first to fix the "Referenced node doesn't exist" error.