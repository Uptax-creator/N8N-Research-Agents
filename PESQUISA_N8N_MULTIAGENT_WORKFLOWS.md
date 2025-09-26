# 📚 PESQUISA N8N: Multi-Agent Workflows e Configurações GitHub-Hosted

## **REPOSITÓRIOS GITHUB IDENTIFICADOS VIA GEMINI**

### **🔹 codexdhruv11/n8n-multi-agent-workflows**
**URL**: `https://github.com/codexdhruv11/n8n-multi-agent-workflows`
- **Arquitetura**: 4 agentes especializados com supervisor central
- **Pattern Aplicável**: Supervisor Agent + Sub-workflows especializados
- **Code Relevante**: Sistema modular com LangChain integration

### **🔹 Zie619/n8n-workflows**
**URL**: `https://github.com/Zie619/n8n-workflows`
- **Descrição**: 2.053 workflows profissionalmente organizados
- **Pattern Aplicável**: Templates categorizados e sistema de busca
- **Benefício**: Base de referência para patterns complexos

### **🔹 telepilotco/n8n-nodes-kv-storage**
**URL**: `https://github.com/telepilotco/n8n-nodes-kv-storage`
- **Pattern**: Cache em memória com TTL automático
- **Code Específico**:
  ```javascript
  {
    "ttl": 3600,
    "scope": "workflow", // execution-only, workflow, instance
    "autoDelete": true
  }
  ```

---

## **CASOS DE USO EMPRESARIAIS DOCUMENTADOS**

### **🏢 Stepstone (Job Platform)**
- **Resultado**: 200+ workflows críticos com 25X melhoria de velocidade
- **Pattern**: Multi-agent system para processos HR complexos
- **Aplicação UPTAX**: Processamento fiscal em larga escala

### **🎵 Musixmatch (Music Platform)**
- **Resultado**: Economia de 47 dias de trabalho em 4 meses
- **Pattern**: Multi-source data aggregation com automation
- **Aplicação UPTAX**: Agregação de dados fiscais de múltiplas fontes

---

## **PADRÕES TÉCNICOS IDENTIFICADOS**

### **📊 Variables Management Pattern**
```javascript
// Custom Variables ($vars) - Global, read-only
$vars.GITHUB_BASE_URL = "https://raw.githubusercontent.com/..."
$vars.PROJECT_ID = "project_001"
$vars.CACHE_TTL_MS = "300000"

// Workflow Static Data - Persistente durante execuções
const staticData = $getWorkflowStaticData('global');
staticData.agent_states = {
  agent_001: { status: 'active', last_run: Date.now() }
};

// Cache com TTL manual
const cacheKey = `config_${agentId}`;
if (staticData[cacheKey] && (Date.now() - staticData[cacheKey].timestamp) < TTL) {
  return staticData[cacheKey].data;
}
```

### **🤖 Multi-Agent Orchestration Pattern**
```javascript
// Supervisor Pattern - Delegação inteligente
{
  "supervisor": {
    "delegation_rules": {
      "fiscal_queries": "fiscal_agent",
      "research_tasks": "research_agent",
      "documentation": "docs_agent"
    }
  }
}

// Sub-Workflow Communication
const result = await executeWorkflow('agent-specialist', {
  context: preservedContext,
  task: specificTask
});
```

---

## **IMPLEMENTAÇÃO UPTAX ESPECÍFICA**

### **🎯 Configuração de Variáveis Recomendada**
```javascript
// N8N Custom Variables ($vars) - Configurar via UI
UPTAX_GITHUB_BASE = "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment"
UPTAX_PROJECT_ID = "project_001"
UPTAX_CACHE_TTL_MS = "300000"  // 5 minutos
UPTAX_DEFAULT_TIMEOUT = "60000"
UPTAX_WEBHOOK_PATH = "/work-1001-v4"
```

### **🏗️ Estrutura GitHub-Hosted**
```
uptax-n8n-agents/
├── configs/
│   ├── variables/
│   │   └── global.json          # Variáveis centralizadas
│   └── agents/
│       ├── agent_001/
│       │   ├── config.json      # Configuração completa
│       │   └── tools.json       # MCP endpoints
│       └── agent_002/
│           └── config.json
└── workflows/
    ├── main-orchestrator.json   # Workflow principal
    └── sub-workflows/           # Agentes especializados
```

### **⚡ Memory Strategy para uptax-proc-1001-graph**
```javascript
// Workflow Static Data Implementation
const workflowMemory = $getWorkflowStaticData('global');

// Initialize uptax-specific memory structure
if (!workflowMemory.uptax_process) {
  workflowMemory.uptax_process = {
    process_id: "uptax-proc-1001-graph",
    sessions: {},
    agent_cache: {},
    last_cleanup: Date.now()
  };
}

// Session management com TTL
const sessionId = `${$json.project_id}_${$json.agent_id}_${Date.now()}`;
workflowMemory.uptax_process.sessions[sessionId] = {
  project_id: $json.project_id,
  agent_id: $json.agent_id,
  context: $json,
  created_at: Date.now()
};

// Cache de configurações com TTL de 5 minutos
const cacheKey = `agent_config_${$json.agent_id}`;
const cache = workflowMemory.uptax_process.agent_cache;

if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp) < 300000) {
  return cache[cacheKey].data; // Cache hit
}
```

---

## **WORKFLOW OTIMIZADO PARA UPTAX**

### **🔄 Arquitetura Final Recomendada**
```
1. Webhook Enhanced (/work-1001-v4)
   ↓
2. Context Builder (Code Node)
   - Build session context
   - Extract project_id/agent_id
   ↓
3. Config Loader with Cache (Code Node)
   - Check Static Data cache first
   - Load from GitHub if cache miss
   - Save to cache with TTL
   ↓
4. Agent Initializer (Code Node)
   - Prepare AI Agent inputs
   - Extract MCP endpoints
   - Build system message
   ↓
5. AI Agent (LangChain)
   - Connected to MCPs
   - Uses cached config
   ↓
6. Response Formatter (Code Node)
   - Professional formatting
   - Extract links/tools used
   ↓
7. Respond Enhanced
```

### **💾 Implementação do CSV vs JSON**

**❌ CSV Anterior**: Parsing complexo, difícil manutenção
**✅ JSON Novo**: Estruturado, tipado, validável

```javascript
// Estrutura JSON por agente (substitui CSV)
{
  "workflow_id": "uptax-proc-1001-dynamic",
  "project_id": "project_001",
  "agent_id": "agent_001",
  "agent_type": "enhanced_research",
  "description": "Brazilian research agent with dual MCPs",
  "system_message": "Você é um especialista...",
  "mcp_endpoints": [
    {
      "name": "bright_data",
      "url": "https://mcp.brightdata.com/sse?token=...",
      "type": "search",
      "priority": 1
    }
  ],
  "tools_config": {
    "timeout": 60000,
    "retries": 2
  }
}
```

---

## **IMPLEMENTAÇÃO DETALHADA DAS VARIÁVEIS**

### **🔧 Passo 1: Setup Custom Variables**
1. **Acessar N8N UI** > Settings > Variables
2. **Adicionar variáveis**:
   ```
   UPTAX_GITHUB_BASE = "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment"
   UPTAX_PROJECT_ID = "project_001"
   UPTAX_CACHE_TTL_MS = "300000"
   ```

### **🔧 Passo 2: Context Builder Node**
```javascript
// Code Node - Context Builder
const input = $('Webhook Enhanced').item.json.body;

const context = {
  session_id: `${input.project_id}_${input.agent_id}_${Date.now()}`,
  project_id: input.project_id || $vars.UPTAX_PROJECT_ID,
  agent_id: input.agent_id || 'agent_001',
  query: input.query || 'Default query',

  // URLs dinâmicas usando variáveis
  config_url: `${$vars.UPTAX_GITHUB_BASE}/agents/${input.agent_id || 'agent_001'}/config.json`,

  // Metadata
  timestamp: new Date().toISOString(),
  workflow_id: 'uptax-proc-1001-v4'
};

return [{ json: context }];
```

### **🔧 Passo 3: Config Loader with Cache**
```javascript
// Code Node - Advanced Cache Manager
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
  // Fallback config
  return [{
    json: {
      ...context,
      agent_config: {
        agent_id: context.agent_id,
        system_message: `You are a helpful assistant.`,
        mcp_endpoints: []
      },
      config_source: 'fallback',
      config_error: error.message
    }
  }];
}
```

---

## **ANÁLISE DO CONTEXTO DA JANELA**

### **📏 Status Atual da Conversa**
- **Tokens utilizados**: ~85% da janela de contexto
- **Informações críticas preservadas**: ✅
- **Documentação criada**: 3 arquivos principais
- **Tasks completadas**: 6/6

### **🔄 Recomendação para Próxima Etapa**
**✅ CONTINUAR na janela atual** para implementação porque:
- Context está bem preservado
- Arquitetura está definida
- Próximo passo é execução prática
- ~15% de contexto disponível para implementação

**⚠️ NOVA JANELA será necessária** apenas se:
- Implementação completa demorar +30min
- Surgirem problemas técnicos complexos
- Precisarmos fazer debugging extenso

---

## ✅ **RESPOSTAS ÀS SUAS PERGUNTAS**

### **❓ "Não vamos precisar mais do CSV?"**
**RESPOSTA**: Não! A arquitetura evoluiu:
- **❌ CSV**: Parsing complexo, manutenção difícil
- **✅ JSON por agente**: Estruturado, tipado, validável
- **✅ Variáveis $vars**: URLs base e configurações globais
- **✅ Static Data**: Cache inteligente com TTL

### **❓ "Como implantar as variáveis?"**
**RESPOSTA**: 3 níveis de variáveis:
1. **$vars (Custom Variables)**: Configurações globais via N8N UI
2. **Static Data**: Cache dinâmico dentro dos workflows
3. **Context Objects**: Dados passados entre nodes

### **❓ "Exemplos para referência?"**
**RESPOSTA**: Documentados em `PESQUISA_N8N_MULTIAGENT_WORKFLOWS.md`:
- 3 repositórios GitHub específicos
- 2 casos empresariais comprovados
- Patterns técnicos aplicáveis ao UPTAX
- Code snippets prontos para uso

**🚀 PRÓXIMA ETAPA**: Implementar os 6 nodes no N8N seguindo a arquitetura documentada!

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "Documentar exemplos e refer\u00eancias encontradas na pesquisa", "status": "completed", "activeForm": "Documentando exemplos e refer\u00eancias encontradas na pesquisa"}, {"content": "Explicar implementa\u00e7\u00e3o detalhada das vari\u00e1veis N8N", "status": "completed", "activeForm": "Explicando implementa\u00e7\u00e3o detalhada das vari\u00e1veis N8N"}, {"content": "Avaliar necessidade do CSV na nova arquitetura", "status": "completed", "activeForm": "Avaliando necessidade do CSV na nova arquitetura"}, {"content": "Analisar contexto da janela para pr\u00f3ximas etapas", "status": "completed", "activeForm": "Analisando contexto da janela para pr\u00f3ximas etapas"}]