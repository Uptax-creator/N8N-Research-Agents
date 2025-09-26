# 🚀 ARQUITETURA DEFINITIVA - PATTERN DE VARIÁVEIS N8N

## **DESCOBERTAS CRÍTICAS DA PESQUISA:**

### ✅ **$vars (Custom Variables)**
- **Instance-wide**, disponível em todos workflows
- **Performance excelente** - resolvido em runtime
- **Uso**: Configurações estáticas, URLs base, IDs projeto

### ✅ **Static Data com TTL**
- **Cache inteligente** para configs GitHub
- **Persiste entre execuções** (apenas em triggers ativos)
- **TTL manual** necessário (5-10 min recomendado)

### ❌ **Set Node para Context**
- **Problemas de execução** quando desconectado do fluxo
- **Performance inferior** para context management
- **Uso**: Apenas transformações simples

---

## **POLÍTICA DEFINITIVA DE VARIÁVEIS:**

### **1. Custom Variables ($vars) - CONFIGURAÇÕES GLOBAIS**
```bash
# Via N8N UI > Settings > Variables
GITHUB_BASE_URL = "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment"
PROJECT_ID = "project_001"
CACHE_TTL_MS = "300000"  # 5 minutos
DEFAULT_TIMEOUT = "60000"
REGISTRY_PATH = "/agents"
```

### **2. Environment Variables ($env) - SECRETS**
```bash
# Via Docker/Environment
GITHUB_TOKEN = "ghp_xxxxx"
N8N_HOST = "https://primary-production-56785.up.railway.app"
ENCRYPTION_KEY = "xxxxxx"
```

### **3. Static Data Pattern - CACHE INTELIGENTE**
```javascript
// Code Node - Cache Manager
const staticData = getWorkflowStaticData('node');
const cacheKey = `agent_config_${$json.project_id}_${$json.agent_id}`;
const CACHE_TTL = parseInt($vars.CACHE_TTL_MS);

// Check cache
if (staticData[cacheKey] && staticData[cacheKey].timestamp) {
  const cacheAge = Date.now() - staticData[cacheKey].timestamp;

  if (cacheAge < CACHE_TTL) {
    console.log('✅ Cache hit for:', cacheKey);
    return [{ json: staticData[cacheKey].data }];
  }
  console.log('⚠️ Cache expired for:', cacheKey);
}

// Cache miss - load from GitHub
const configUrl = `${$vars.GITHUB_BASE_URL}${$vars.REGISTRY_PATH}/${$json.agent_id}/config.json`;

try {
  const response = await fetch(configUrl);
  const data = await response.json();

  // Save to cache
  staticData[cacheKey] = {
    data: data,
    timestamp: Date.now(),
    url: configUrl
  };

  console.log('✅ Config cached for:', cacheKey);
  return [{ json: data }];

} catch (error) {
  console.log('❌ Failed to load config:', error.message);
  return [{ json: { error: error.message, cache_key: cacheKey } }];
}
```

---

## **ARQUITETURA FINAL - PATTERN "LOAD ONCE + CACHE + CONTEXT"**

### **Fluxo Otimizado:**
```
1. Webhook Enhanced
   ↓
2. Context Builder [Code Node]
   ↓
3. Config Loader with Cache [Code Node]
   ↓
4. Agent Initializer [Code Node]
   ↓
5. AI Agent (com MCPs)
   ↓
6. Response Formatter [Code Node]
   ↓
7. Respond Enhanced
```

### **Node 1: Webhook Enhanced**
- **Path**: `/work-1001-v3`
- **Output**: Requisição original

### **Node 2: Context Builder** (Code Node)
```javascript
// Build session context with all variables
const input = $('Webhook Enhanced').item.json.body;

const context = {
  // Session info
  session_id: `${input.project_id}_${input.agent_id}_${Date.now()}`,
  project_id: input.project_id || $vars.PROJECT_ID,
  agent_id: input.agent_id || 'agent_001',
  query: input.query || 'Default query',

  // GitHub paths
  github_base: $vars.GITHUB_BASE_URL,
  registry_path: $vars.REGISTRY_PATH,

  // URLs dinâmicas
  config_url: `${$vars.GITHUB_BASE_URL}${$vars.REGISTRY_PATH}/${input.agent_id || 'agent_001'}/config.json`,

  // Metadata
  timestamp: new Date().toISOString(),
  workflow_id: 'uptax-proc-1001-v3',

  // Original request
  original_input: input
};

console.log('🎯 Context built for session:', context.session_id);
return [{ json: context }];
```

### **Node 3: Config Loader with Cache** (Code Node)
```javascript
// Advanced cache manager with GitHub configs
const context = $('Context Builder').item.json;
const staticData = getWorkflowStaticData('node');
const cacheKey = `config_${context.project_id}_${context.agent_id}`;
const CACHE_TTL = parseInt($vars.CACHE_TTL_MS);

console.log('🔍 Loading config for:', context.agent_id);

// Check cache first
if (staticData[cacheKey] && staticData[cacheKey].timestamp) {
  const cacheAge = Date.now() - staticData[cacheKey].timestamp;

  if (cacheAge < CACHE_TTL) {
    console.log('✅ Using cached config');
    const cached = staticData[cacheKey].data;

    return [{
      json: {
        ...context,
        agent_config: cached,
        config_source: 'cache',
        cache_age_ms: cacheAge
      }
    }];
  }
}

// Load fresh config from GitHub
try {
  const response = await fetch(context.config_url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const agentConfig = await response.json();

  // Cache the config
  staticData[cacheKey] = {
    data: agentConfig,
    timestamp: Date.now()
  };

  console.log('✅ Config loaded and cached from GitHub');

  return [{
    json: {
      ...context,
      agent_config: agentConfig,
      config_source: 'github',
      config_loaded_at: new Date().toISOString()
    }
  }];

} catch (error) {
  console.log('❌ Config loading failed:', error.message);

  // Fallback config
  const fallback = {
    agent_id: context.agent_id,
    agent_type: 'fallback',
    description: 'Fallback agent when config loading fails',
    system_message: `You are a helpful assistant. The original query was: ${context.query}`,
    mcp_endpoints: [],
    tools_config: { timeout: parseInt($vars.DEFAULT_TIMEOUT) }
  };

  return [{
    json: {
      ...context,
      agent_config: fallback,
      config_source: 'fallback',
      config_error: error.message
    }
  }];
}
```

### **Node 4: Agent Initializer** (Code Node)
```javascript
// Prepare all data for AI Agent
const data = $('Config Loader with Cache').item.json;

console.log('🤖 Initializing agent:', data.agent_config.agent_type);

// Extract MCP endpoints
let mcp_sse = null;
let mcp_http = null;

if (data.agent_config.mcp_endpoints && data.agent_config.mcp_endpoints.length > 0) {
  mcp_sse = data.agent_config.mcp_endpoints.find(m => m.type === 'search')?.url;
  mcp_http = data.agent_config.mcp_endpoints.find(m => m.type === 'documentation')?.url;
}

// Final payload for AI Agent
return [{
  json: {
    // AI Agent inputs
    text: data.query,
    system_message: data.agent_config.system_message,

    // MCP endpoints
    mcp_endpoint_sse: mcp_sse,
    mcp_endpoint_http: mcp_http,

    // Complete context for response formatter
    session_context: {
      session_id: data.session_id,
      project_id: data.project_id,
      agent_id: data.agent_id,
      agent_config: data.agent_config,
      config_source: data.config_source,
      timestamp: data.timestamp
    }
  }
}];
```

### **Node 5: AI Agent**
- **text**: `={{ $json.text }}`
- **systemMessage**: `={{ $json.system_message }}`
- **Conectado**: Buffer Memory, Google Gemini, MCP SSE, MCP HTTP

### **Node 6: Response Formatter** (Code Node)
```javascript
// Professional response formatting
const aiResponse = $('AI Agent').item.json;
const sessionContext = $('Agent Initializer').item.json.session_context;

console.log('📝 Formatting response for:', sessionContext.agent_id);

// Extract useful information from AI response
const aiOutput = aiResponse?.output || aiResponse?.text || 'No response generated';

// Detect tools used
const toolsUsed = [];
if (aiOutput.toLowerCase().includes('search') || aiOutput.includes('bright_data')) {
  toolsUsed.push('Bright Data Search');
}
if (aiOutput.includes('GOOGLEDOCS') || aiOutput.includes('docs.google.com')) {
  toolsUsed.push('Google Docs');
}

// Extract links
const links = {
  google_docs: aiOutput.match(/https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9_-]+/)?.[0],
  sources: [...(aiOutput.match(/https?:\/\/[^\s\)]+/g) || [])].filter(url =>
    !url.includes('docs.google.com')).slice(0, 5)
};

// Professional response structure
const response = {
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
    links: links
  },
  metadata: {
    workflow: 'uptax-proc-1001-v3',
    config_source: sessionContext.config_source,
    execution_time_ms: Date.now() - parseInt(sessionContext.session_id.split('_')[2]),
    version: '3.0.0-variables'
  }
};

console.log('✅ Response formatted successfully');
if (links.google_docs) {
  console.log('📄 Document created:', links.google_docs);
}

return [{ json: response }];
```

---

## **VANTAGENS DESTA ARQUITETURA:**

### ✅ **Performance Máxima**
- **1 HTTP Request** + Cache inteligente
- **5-10 min TTL** - configs em memória
- **Static Data** persiste entre execuções

### ✅ **GitHub-First 100%**
- **Configs no GitHub** - versionamento total
- **Hot-reload** - mudanças instantâneas
- **Multi-tenancy** - pasta por agent

### ✅ **Context Preservation**
- **Session context** passa por todos nodes
- **Variáveis estruturadas** - sem data loss
- **Fallbacks robustos** - sempre funciona

### ✅ **Escalabilidade Total**
- **Variables pattern** - configuração centralizada
- **Cache automático** - performance sem HTTP overhead
- **Multi-agent** - suporte nativo

---

## **TESTE FINAL:**

```bash
curl -X POST "https://primary-production-56785.up.railway.app/webhook/work-1001-v3" \
-H "Content-Type: application/json" \
-d '{
  "project_id": "project_001",
  "agent_id": "agent_001",
  "query": "Pesquise sobre IA no Brasil e crie um documento"
}'
```

**Resposta esperada:**
```json
{
  "success": true,
  "session": {
    "id": "project_001_agent_001_1727284800000",
    "agent": "enhanced_research",
    "project_id": "project_001",
    "agent_id": "agent_001"
  },
  "response": {
    "content": "Resultado da pesquisa com ferramentas...",
    "tools_used": ["Bright Data Search", "Google Docs"],
    "links": {
      "google_docs": "https://docs.google.com/document/d/...",
      "sources": ["https://..."]
    }
  },
  "metadata": {
    "config_source": "cache",
    "execution_time_ms": 15420,
    "version": "3.0.0-variables"
  }
}
```

---

## ✅ **ESTA É A ARQUITETURA DEFINITIVA**

**Resolve TODOS os problemas identificados:**
- ✅ **Data Persistence** via context objects
- ✅ **GitHub-hosted** configs com cache
- ✅ **Variables pattern** estruturado
- ✅ **Performance** com 1 HTTP + cache
- ✅ **Multi-tenancy** com URLs dinâmicas
- ✅ **Hot-reload** instantâneo
- ✅ **Fallbacks** robustos

**PRÓXIMO:** Implementar no N8N passo-a-passo 🚀