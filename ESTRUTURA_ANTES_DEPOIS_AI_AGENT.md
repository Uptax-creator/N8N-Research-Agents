# 📋 ESTRUTURA ANTES E DEPOIS DO AI AGENT

## **WORKFLOW: uptax-proc-1001-dynamic**
**Endpoint**: `https://primary-production-56785.up.railway.app/webhook/work-1001`
**Workflow ID**: `https://primary-production-56785.up.railway.app/workflow/scJSDgRWiHTkfNUn`

---

## **📥 ANTES DO AI AGENT**

### **Node 1: Webhook Enhanced**
```json
{
  "path": "/work-1001",
  "method": "POST",
  "response_mode": "last_node"
}
```

### **Node 2: Context Builder** (Code Node)
```javascript
// Estrutura de entrada esperada
const input = $('Webhook Enhanced').item.json.body;

const context = {
  // Dados da requisição
  session_id: `${input.project_id}_${input.agent_id}_${Date.now()}`,
  project_id: input.project_id || $vars.UPTAX_PROJECT_ID,
  agent_id: input.agent_id || 'agent_001',
  query: input.query || 'Default query',

  // URLs dinâmicas usando variáveis
  config_url: `${$vars.UPTAX_GITHUB_BASE}/agents/${input.agent_id || 'agent_001'}/config.json`,
  prompt_url: `${$vars.UPTAX_GITHUB_BASE}/agents/${input.agent_id || 'agent_001'}/prompt.json`,

  // Metadata
  timestamp: new Date().toISOString(),
  workflow_id: 'uptax-proc-1001-dynamic',
  original_input: input
};

console.log('🎯 Context built for session:', context.session_id);
return [{ json: context }];
```

### **Node 3: Config Loader with Cache** (Code Node)
```javascript
// Advanced cache manager
const context = $('Context Builder').item.json;
const staticData = getWorkflowStaticData('global');
const cacheKey = `config_${context.project_id}_${context.agent_id}`;
const CACHE_TTL = parseInt($vars.UPTAX_CACHE_TTL_MS);

// Check cache first
if (staticData[cacheKey] && staticData[cacheKey].timestamp) {
  const cacheAge = Date.now() - staticData[cacheKey].timestamp;

  if (cacheAge < CACHE_TTL) {
    console.log('✅ Cache hit:', cacheKey);
    return [{
      json: {
        ...context,
        agent_config: staticData[cacheKey].data,
        config_source: 'cache',
        cache_age_ms: cacheAge
      }
    }];
  }
}

// Cache miss - load from GitHub
try {
  const response = await fetch(context.config_url);
  const agentConfig = await response.json();

  // Cache the config
  staticData[cacheKey] = {
    data: agentConfig,
    timestamp: Date.now()
  };

  return [{
    json: {
      ...context,
      agent_config: agentConfig,
      config_source: 'github'
    }
  }];

} catch (error) {
  console.log('❌ Config loading failed:', error.message);
  // Fallback config
  return [{
    json: {
      ...context,
      agent_config: {
        agent_id: context.agent_id,
        system_message: "You are a helpful assistant.",
        mcp_endpoints: []
      },
      config_source: 'fallback',
      config_error: error.message
    }
  }];
}
```

### **Node 4: Prompt Loader with Cache** (Code Node)
```javascript
// Load prompt.json from GitHub with cache
const data = $('Config Loader with Cache').item.json;
const staticData = getWorkflowStaticData('global');
const promptCacheKey = `prompt_${data.project_id}_${data.agent_id}`;
const CACHE_TTL = parseInt($vars.UPTAX_CACHE_TTL_MS);

// Check prompt cache
if (staticData[promptCacheKey] && staticData[promptCacheKey].timestamp) {
  const cacheAge = Date.now() - staticData[promptCacheKey].timestamp;

  if (cacheAge < CACHE_TTL) {
    console.log('✅ Prompt cache hit:', promptCacheKey);
    return [{
      json: {
        ...data,
        prompt_data: staticData[promptCacheKey].data,
        prompt_source: 'cache'
      }
    }];
  }
}

// Load prompt from GitHub
try {
  const response = await fetch(data.prompt_url);
  const promptData = await response.json();

  // Cache the prompt
  staticData[promptCacheKey] = {
    data: promptData,
    timestamp: Date.now()
  };

  return [{
    json: {
      ...data,
      prompt_data: promptData,
      prompt_source: 'github'
    }
  }];

} catch (error) {
  console.log('❌ Prompt loading failed:', error.message);
  // Fallback prompt
  return [{
    json: {
      ...data,
      prompt_data: {
        system_message: "You are a helpful assistant. Use your tools proactively.",
        instructions: ["Be thorough", "Use available tools", "Provide structured responses"]
      },
      prompt_source: 'fallback',
      prompt_error: error.message
    }
  }];
}
```

### **Node 5: Agent Initializer** (Code Node)
```javascript
// Prepare final data for AI Agent
const data = $('Prompt Loader with Cache').item.json;

console.log('🤖 Initializing agent:', data.agent_config.agent_type);

// Extract MCP endpoints from config
let mcp_sse = null;
let mcp_http = null;

if (data.agent_config.mcp_endpoints && data.agent_config.mcp_endpoints.length > 0) {
  mcp_sse = data.agent_config.mcp_endpoints.find(m => m.type === 'search')?.url;
  mcp_http = data.agent_config.mcp_endpoints.find(m => m.type === 'documentation')?.url;
}

// Build system message from prompt data
const systemMessage = data.prompt_data.system_message + "\n\n" +
  "Instructions:\n" + data.prompt_data.instructions.join("\n") + "\n\n" +
  "Tools Available:\n" + Object.entries(data.prompt_data.tools_guidance || {})
    .map(([tool, guidance]) => `- ${tool}: ${guidance}`).join("\n");

return [{
  json: {
    // AI Agent inputs
    text: data.query,
    system_message: systemMessage,

    // MCP endpoints
    mcp_endpoint_sse: mcp_sse,
    mcp_endpoint_http: mcp_http,

    // Complete context for response formatter
    session_context: {
      session_id: data.session_id,
      project_id: data.project_id,
      agent_id: data.agent_id,
      agent_config: data.agent_config,
      prompt_data: data.prompt_data,
      config_source: data.config_source,
      prompt_source: data.prompt_source,
      timestamp: data.timestamp
    }
  }
}];
```

---

## **🤖 AI AGENT NODE**

### **Configuração do AI Agent**
```json
{
  "text": "={{ $json.text }}",
  "systemMessage": "={{ $json.system_message }}",
  "options": {
    "temperature": 0.7,
    "maxTokens": 4000
  }
}
```

### **Nodes Conectados ao AI Agent:**
- **Buffer Memory**: Para preservar contexto da conversa
- **Google Gemini**: LLM principal
- **MCP SSE Client**: `={{ $json.mcp_endpoint_sse }}`
- **MCP HTTP Client**: `={{ $json.mcp_endpoint_http }}`

---

## **📤 DEPOIS DO AI AGENT**

### **Node 6: Response Formatter** (Code Node)
```javascript
// Professional response formatting
const aiResponse = $('AI Agent').item.json;
const sessionContext = $('Agent Initializer').item.json.session_context;

console.log('📝 Formatting response for:', sessionContext.agent_id);

// Extract AI output
const aiOutput = aiResponse?.output || aiResponse?.text || 'No response generated';

// Detect tools used (parsing from AI response)
const toolsUsed = [];
if (aiOutput.toLowerCase().includes('search') || aiOutput.includes('bright_data')) {
  toolsUsed.push('Bright Data Search');
}
if (aiOutput.includes('GOOGLEDOCS') || aiOutput.includes('docs.google.com')) {
  toolsUsed.push('Google Docs');
}
if (aiOutput.includes('scrape_as_markdown') || aiOutput.toLowerCase().includes('scraping')) {
  toolsUsed.push('Web Scraping');
}

// Extract links from response
const links = {
  google_docs: aiOutput.match(/https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9_-]+/)?.[0],
  sources: [...(aiOutput.match(/https?:\/\/[^\s\)]+/g) || [])]
    .filter(url => !url.includes('docs.google.com'))
    .slice(0, 5)
};

// Apply output format from prompt data
const outputFormat = sessionContext.prompt_data?.output_requirements?.format || 'structured_json';

let formattedResponse;

if (outputFormat === 'structured_json') {
  formattedResponse = {
    success: true,
    session: {
      id: sessionContext.session_id,
      agent: sessionContext.agent_config.agent_type,
      project_id: sessionContext.project_id,
      agent_id: sessionContext.agent_id
    },
    request: {
      query: sessionContext.session_context?.original_input?.query || 'No query',
      timestamp: sessionContext.timestamp
    },
    response: {
      content: aiOutput,
      tools_used: toolsUsed,
      links: links,
      confidence_level: toolsUsed.length > 0 ? 0.9 : 0.7
    },
    metadata: {
      workflow: 'uptax-proc-1001-dynamic',
      config_source: sessionContext.config_source,
      prompt_source: sessionContext.prompt_source,
      execution_time_ms: Date.now() - parseInt(sessionContext.session_id.split('_')[2]),
      version: '1.0.0-variables'
    }
  };
} else {
  // Other formats (html, yaml, etc.) can be handled here
  formattedResponse = {
    content: aiOutput,
    format: outputFormat,
    metadata: { /* minimal metadata */ }
  };
}

console.log('✅ Response formatted successfully');
if (links.google_docs) {
  console.log('📄 Document created:', links.google_docs);
}

return [{ json: formattedResponse }];
```

### **Node 7: Respond Enhanced** (Webhook Response)
```json
{
  "options": {
    "responseCode": 200,
    "responseHeaders": {
      "Content-Type": "application/json"
    }
  }
}
```

---

## **📊 DADOS TRAFEGADOS**

### **Input Structure (Webhook)**
```json
{
  "project_id": "project_001",
  "agent_id": "agent_001",
  "query": "Pesquise sobre IA no Brasil e crie um documento"
}
```

### **Output Structure (Response)**
```json
{
  "success": true,
  "session": {
    "id": "project_001_agent_001_1727285234567",
    "agent": "enhanced_research",
    "project_id": "project_001",
    "agent_id": "agent_001"
  },
  "request": {
    "query": "Pesquise sobre IA no Brasil e crie um documento",
    "timestamp": "2025-01-25T15:30:00.000Z"
  },
  "response": {
    "content": "Realizei uma pesquisa abrangente sobre IA no Brasil...",
    "tools_used": ["Bright Data Search", "Google Docs", "Web Scraping"],
    "links": {
      "google_docs": "https://docs.google.com/document/d/xyz123",
      "sources": ["https://source1.com", "https://source2.com"]
    },
    "confidence_level": 0.9
  },
  "metadata": {
    "workflow": "uptax-proc-1001-dynamic",
    "config_source": "cache",
    "prompt_source": "github",
    "execution_time_ms": 15420,
    "version": "1.0.0-variables"
  }
}
```

---

## **🔧 VARIABLES NECESSÁRIAS**

### **Custom Variables ($vars) - Configurar no N8N UI**
```
UPTAX_GITHUB_BASE = "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment"
UPTAX_PROJECT_ID = "project_001"
UPTAX_CACHE_TTL_MS = "300000"  # 5 minutos
UPTAX_DEFAULT_TIMEOUT = "60000"
```

### **Static Data Structure**
```javascript
// getWorkflowStaticData('global') structure:
{
  "config_project_001_agent_001": {
    "data": { /* agent config */ },
    "timestamp": 1727285234567
  },
  "prompt_project_001_agent_001": {
    "data": { /* prompt data */ },
    "timestamp": 1727285234567
  }
}
```

Esta é a estrutura completa **ANTES** e **DEPOIS** do AI Agent no workflow atual!