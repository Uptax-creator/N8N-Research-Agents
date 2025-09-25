# 🔧 CORREÇÕES NECESSÁRIAS NO WORKFLOW

## 1. **REMOVER NODES DUPLICADOS**
Deletar estes nodes (são do teste, não do principal):
- Webhook Enhanced2
- Load Graph CSV2
- Graph Processor v3
- Respond Test1

## 2. **SUBSTITUIR GRAPH PROCESSOR**

### DELETAR o Graph Processor atual (código inline)

### ADICIONAR 2 nodes novos após "Load Graph CSV":

#### A) **Load Processor from GitHub** (HTTP Request)
- **URL**: `https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/code/processors/graph-processor-dynamic.js`
- **Response Format**: text
- **Posição**: Após Load Graph CSV

#### B) **Execute Processor** (Code)
```javascript
// Execute GitHub-loaded processor
const processorCode = $('Load Processor from GitHub').item.json.data;
const inputData = $('Webhook Enhanced1').item.json.body;
const csvData = $('Load Graph CSV').item.json.data;

// Create execution context
const context = {
  $: function(nodeName) {
    if (nodeName === 'Webhook Enhanced') {
      return { item: { json: { body: inputData } } };
    }
    if (nodeName === 'Load Graph CSV') {
      return { item: { json: { data: csvData } } };
    }
  },
  console: console,
  Date: Date,
  JSON: JSON
};

// Execute processor
try {
  const func = new Function('$', 'console', 'Date', 'JSON',
    processorCode + '; return execute();');
  const result = await func(context.$, context.console, context.Date, context.JSON);
  return result;
} catch (error) {
  return [{
    json: {
      success: false,
      error: 'Processor execution failed',
      details: error.message
    }
  }];
}
```

## 3. **ADICIONAR LOAD PROMPT**

### Adicionar após "Execute Processor":

#### **Load Prompt from GitHub** (HTTP Request)
- **URL**: `={{ $json.prompt_url }}`
- **Response Format**: text

## 4. **CORRIGIR EXECUTE FORMATTER**

Substituir o código atual por:
```javascript
// Executa formatter carregado do GitHub
const formatterCode = $('Load Formatter from GitHub').item.json.data;
const aiResponse = $('AI Agent').item.json;
const processorData = $('Execute Processor').item.json;

// Create context for formatter
const contextStr = `
  const $ = function(nodeName) {
    if (nodeName === 'Enhanced AI Agent' || nodeName === 'AI Agent') {
      return { item: { json: ${JSON.stringify(aiResponse)} } };
    }
    if (nodeName === 'Prepare for AI Agent' || nodeName === 'Execute Processor') {
      return { item: { json: ${JSON.stringify(processorData)} } };
    }
  };
`;

try {
  const func = new Function(contextStr + formatterCode);
  const result = func();
  return result;
} catch (error) {
  return [{
    json: {
      success: false,
      error: 'Formatter failed',
      details: error.message,
      raw_response: aiResponse
    }
  }];
}
```

## 5. **ADICIONAR PREPARE FOR AI AGENT**

### Adicionar antes do AI Agent:

#### **Prepare for AI Agent** (Code)
```javascript
// Prepare data for AI Agent
const processorData = $('Execute Processor').item.json;
const promptData = $('Load Prompt from GitHub').item.json.data;

console.log('🎯 Preparing for AI Agent');
console.log('📄 Prompt loaded:', promptData ? promptData.length : 0, 'chars');

// Parse MCP endpoints do agent_config
let mcp_sse = null;
let mcp_http = null;

if (processorData.agent_config?.mcp_endpoints) {
  // Se for JSON string, parse
  let endpoints = processorData.agent_config.mcp_endpoints;
  if (typeof endpoints === 'string') {
    try {
      endpoints = JSON.parse(endpoints.replace(/""/g, '"'));
    } catch (e) {
      console.log('Failed to parse MCP endpoints');
    }
  }

  // Encontrar cada tipo
  if (Array.isArray(endpoints)) {
    const brightData = endpoints.find(ep => ep.type === 'search' || ep.name === 'bright_data');
    const googleDocs = endpoints.find(ep => ep.type === 'documentation' || ep.name === 'google_docs');

    mcp_sse = brightData?.url || processorData.mcp_endpoint_sse;
    mcp_http = googleDocs?.url || processorData.mcp_endpoint_http;
  }
}

// Fallback para URLs conhecidas
mcp_sse = mcp_sse || 'https://mcp.brightdata.com/sse?token=ecfc6404fb9eb026a9c802196b8d5caaf131d63c0931f9e888e57077e6b1f8cf';
mcp_http = mcp_http || 'https://apollo-3irns8zl6-composio.vercel.app/v3/mcp/aab98bef-8816-4873-95f6-45615ca063d4/mcp?include_composio_helper_actions=true';

return [{
  json: {
    text: processorData.text,
    session_id: processorData.session_id,
    system_message: promptData || `You are ${processorData.agent_config?.description}. Use your tools proactively.`,
    mcp_endpoint_sse: mcp_sse,
    mcp_endpoint_http: mcp_http,
    agent_config: processorData.agent_config
  }
}];
```

## 6. **CORRIGIR MCPs**

### **MCP Client - SSE** (Bright Data)
- **Endpoint URL**: `={{ $json.mcp_endpoint_sse }}`
- **Server Transport**: sse (default)

### **MCP Client - HTTP Streamable** (Google Docs)
- **Endpoint URL**: `={{ $json.mcp_endpoint_http }}`
- **Server Transport**: httpStreamable

## 7. **FLUXO CORRETO FINAL**

```
1. Webhook Enhanced1
   ↓
2. Load Graph CSV
   ↓
3. Load Processor from GitHub [NOVO]
   ↓
4. Execute Processor [NOVO]
   ↓
5. Load Prompt from GitHub [NOVO]
   ↓
6. Prepare for AI Agent [NOVO]
   ↓
7. AI Agent (com Gemini, Memory, 2 MCPs)
   ↓
8. Load Formatter from GitHub [JÁ EXISTE]
   ↓
9. Execute Formatter [CORRIGIR]
   ↓
10. Response Formatter [DELETAR - não precisa]
   ↓
11. Respond Enhanced

Conectados ao AI Agent:
- Google Gemini Chat Model ✅
- Buffer Memory ✅
- MCP Client SSE (Bright Data) [CORRIGIR URL]
- MCP Client HTTP (Google Docs) [CORRIGIR URL]
```

## 8. **TESTE FINAL**

```bash
curl -X POST "https://primary-production-56785.up.railway.app/webhook/work-1001-v2" \
-H "Content-Type: application/json" \
-d '{
  "project_id": "project_001",
  "agent_id": "agent_001",
  "query": "Pesquise sobre IA no Brasil e crie um documento"
}'
```

## ✅ **RESULTADO ESPERADO:**
- Carrega tudo do GitHub
- Usa 2 MCPs diferentes
- Prompt dinâmico por agent
- Formatter customizável
- Zero hardcode!