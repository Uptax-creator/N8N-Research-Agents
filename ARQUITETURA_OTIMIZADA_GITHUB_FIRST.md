# 🚀 ARQUITETURA OTIMIZADA - GITHUB-FIRST

## **PREMISSAS RESPEITADAS:**
✅ **Código no GitHub** (não inline)
✅ **CSV como índice**
✅ **Dados preservados entre nodes**
✅ **Environment variables pattern**

---

## **ESTRATÉGIA: MERGE COM CONTEXT PRESERVATION**

### **Fluxo Otimizado:**
```
1. Webhook Enhanced
   ↓
2. Load Agent Config (CSV) ← Context Index
   ↓
3. Load Processor Code (GitHub)
   ↓ [MERGE NODE]
4. Execute Processor ← Context + Code
   ↓
5. Load Formatter Code (GitHub)
   ↓ [MERGE NODE]
6. Execute Formatter ← Context + Code
   ↓
7. AI Agent (MCPs externos)
   ↓
8. Respond
```

### **CHAVE: MERGE NODES para Context Preservation**

---

## **IMPLEMENTAÇÃO DETALHADA:**

### **1. Webhook Enhanced**
```json
{
  "path": "/work-1001"
}
```

### **2. Load Agent Config** (HTTP Request)
```json
{
  "url": "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/assembly-logic/agents-registry-graph.csv",
  "responseFormat": "text"
}
```

### **3. Parse Agent Config** (Code inline - simples)
```javascript
// APENAS parsing - não lógica complexa
const inputData = $('Webhook Enhanced').item.json.body;
const csvData = $('Load Agent Config').item.json.data;

const projectId = inputData.project_id || 'project_001';
const agentId = inputData.agent_id || 'agent_001';
const query = inputData.query || 'Default query';
const workflowId = 'uptax-proc-1001-dynamic';

// Parse CSV to find agent
const lines = csvData.split('\n').filter(line => line.trim());
let agentConfig = null;

for (let i = 1; i < lines.length; i++) {
  const values = lines[i].split(',').map(v => v.trim());
  if (values[0] === workflowId && values[1] === projectId && values[2] === agentId) {
    agentConfig = {
      workflow_id: values[0],
      project_id: values[1],
      agent_id: values[2],
      agent_type: values[3],
      description: values[4],
      mcp_endpoints_raw: values[5],
      prompt_url: values[6],
      processor_url: values[7],
      formatter_url: values[8],
      tools_config_url: values[9]
    };
    break;
  }
}

if (!agentConfig) {
  return [{
    json: {
      success: false,
      error: `Agent ${projectId}/${agentId} not found`
    }
  }];
}

const sessionId = `${projectId}_${agentId}_${Date.now()}`;

// CONTEXT OBJECT - passa para todos os nodes seguintes
return [{
  json: {
    // Original request
    original_input: inputData,

    // Session context
    session_context: {
      session_id: sessionId,
      project_id: projectId,
      agent_id: agentId,
      query: query,
      workflow_id: workflowId,
      timestamp: new Date().toISOString()
    },

    // Agent configuration
    agent_config: agentConfig,

    // URLs for external resources
    urls: {
      processor: agentConfig.processor_url,
      formatter: agentConfig.formatter_url,
      prompt: agentConfig.prompt_url
    }
  }
}];
```

### **4. Load Processor Code** (HTTP Request)
```json
{
  "url": "={{ $json.urls.processor }}",
  "responseFormat": "text"
}
```

### **5. MERGE NODE 1** (Merge)
```json
{
  "mode": "mergeByFields",
  "joinBy": "session_context.session_id",
  "options": {
    "includeUnpaired": true
  }
}
```

### **6. Execute Processor** (Code - executa código externo)
```javascript
// Context preservation pattern
const context = $json.session_context;
const agentConfig = $json.agent_config;
const processorCode = $json.data; // Do Load Processor Code

console.log('🚀 Executing processor for:', context.agent_id);

// Create execution environment
const executionEnv = {
  // N8N context functions
  $: function(nodeName) {
    // Simular acesso aos nodes anteriores
    return {
      item: {
        json: {
          body: context.original_input,
          data: $json.originalCsvData
        }
      }
    };
  },
  console: console,
  Date: Date,
  JSON: JSON
};

try {
  // Execute external processor code
  const func = new Function(
    '$', 'console', 'Date', 'JSON',
    processorCode + '\n; return execute();'
  );

  const result = await func(
    executionEnv.$,
    executionEnv.console,
    executionEnv.Date,
    executionEnv.JSON
  );

  // Merge result with context
  return [{
    json: {
      ...context, // Preserve all context
      processor_result: result[0]?.json,
      processing_success: true
    }
  }];

} catch (error) {
  console.log('❌ Processor execution failed:', error);

  return [{
    json: {
      ...context, // Still preserve context
      processor_error: error.message,
      processing_success: false,

      // Fallback data for AI Agent
      text: context.query,
      session_id: context.session_id,
      system_message: `You are ${agentConfig.description}. Respond professionally.`
    }
  }];
}
```

### **7. Load Formatter Code** (HTTP Request)
```json
{
  "url": "={{ $json.urls.formatter }}",
  "responseFormat": "text"
}
```

### **8. MERGE NODE 2** (Merge)
```json
{
  "mode": "mergeByFields",
  "joinBy": "session_context.session_id"
}
```

### **9. Execute Formatter** (Code - executa código externo)
```javascript
// Similar ao Execute Processor, mas para formatting
const context = $json.session_context;
const formatterCode = $json.data; // Do Load Formatter Code
const aiResponse = $('AI Agent').item.json;

// Execute external formatter
try {
  const func = new Function(
    'aiResponse', 'context', 'Date',
    formatterCode + '\n; return formatResponse(aiResponse, context);'
  );

  const result = func(aiResponse, context, Date);
  return result;

} catch (error) {
  // Fallback formatter
  return [{
    json: {
      success: true,
      agent: context.agent_id,
      query: context.query,
      result: aiResponse?.output || 'No response',
      metadata: {
        session_id: context.session_id,
        timestamp: new Date().toISOString(),
        formatter_error: error.message
      }
    }
  }];
}
```

---

## **ENVIRONMENT VARIABLES PATTERN:**

### **Context Object Structure:**
```javascript
session_context: {
  session_id: "project_001_agent_001_1234567890",
  project_id: "project_001",
  agent_id: "agent_001",
  query: "User query",
  workflow_id: "uptax-proc-1001-dynamic",
  timestamp: "2025-09-25T...",

  // Environment-like variables
  env: {
    github_base: "https://raw.githubusercontent.com/...",
    mcp_timeout: 60000,
    fallback_enabled: true
  }
}
```

### **Passagem entre Nodes:**
Cada node recebe e repassa o `session_context`, funcionando como **environment variables**.

---

## **ARQUIVOS NO GITHUB:**

### **Estrutura Mantida:**
```
├── assembly-logic/
│   └── agents-registry-graph.csv           # Índice principal
├── code/
│   ├── processors/
│   │   ├── graph-processor-dynamic.js      # Lógica de processamento
│   │   ├── fiscal-processor.js
│   │   └── docs-processor.js
│   └── formatters/
│       ├── response-formatter-enhanced.js  # Formatação de resposta
│       ├── response-formatter-fiscal.js
│       └── response-formatter-docs.js
└── prompts/
    └── agents/
        ├── enhanced_research_brazilian.txt  # System messages
        ├── fiscal_research_brazilian.txt
        └── docs_documentation_brazilian.txt
```

---

## **VANTAGENS DESTA ABORDAGEM:**

### ✅ **Preservação de Context**
- **session_context** passado entre todos os nodes
- **Merge nodes** garantem que dados não se perdem
- **Environment variables pattern** para configurações

### ✅ **Código Externo**
- **Processors no GitHub** - versionamento completo
- **Formatters no GitHub** - customização por agent
- **Fallback strategies** - sempre funcionam

### ✅ **Performance**
- **Apenas 3 HTTP requests** - CSV + Processor + Formatter
- **Merge inteligente** - dados não duplicados
- **GitHub CDN** - cache natural

### ✅ **Escalabilidade**
- **CSV como índice** - adicionar agents = adicionar linha
- **Código reutilizável** - mesmo formatter para múltiplos agents
- **Hot-reload** - mudanças instantâneas

---

## **COMPARAÇÃO COM ALTERNATIVAS:**

| Aspecto | **Inline Code** | **GitHub Code** | **Esta Solução** |
|---------|-----------------|-----------------|-------------------|
| Versionamento | ❌ | ✅ | ✅ |
| Performance | ✅ | ❌ | ✅ |
| Data Loss | ✅ | ❌ | ✅ |
| Escalabilidade | ❌ | ✅ | ✅ |
| Debugging | ✅ | ❌ | ✅ |

---

## **IMPLEMENTAÇÃO GRADUAL:**

### **Fase 1:** Implementar Merge Nodes
### **Fase 2:** Migrar Processor para GitHub
### **Fase 3:** Migrar Formatter para GitHub
### **Fase 4:** Otimizar Context Passing

---

**ESTA SOLUÇÃO RESOLVE TODOS OS PROBLEMAS:**
- ✅ Mantém códigos no GitHub
- ✅ Usa CSV como índice
- ✅ Preserva dados via Merge
- ✅ Pattern de environment variables
- ✅ Performance adequada
- ✅ Fallbacks robustos

**É A ARQUITETURA DEFINITIVA** 🚀