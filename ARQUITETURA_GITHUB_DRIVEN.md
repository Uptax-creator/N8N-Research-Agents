# 🚀 ARQUITETURA GITHUB-DRIVEN N8N

## Conceito: TUDO no GitHub, NADA hardcoded no N8N!

### **Workflow N8N Simplificado:**

```
1. Webhook (recebe request)
   ↓
2. Load CSV from GitHub (carrega configurações)
   ↓
3. Load Processor from GitHub (carrega lógica de processamento)
   ↓
4. Execute Processor (Code node executa o código carregado)
   ↓
5. Load Prompt from GitHub (carrega prompt do agent)
   ↓
6. Load Formatter from GitHub (carrega formatador de resposta)
   ↓
7. Prepare for AI Agent (monta dados)
   ↓
8. AI Agent (com MCPs dinâmicos)
   ↓
9. Execute Formatter (formata resposta)
   ↓
10. Respond to Webhook
```

## **CSV Structure v2** (agents-registry-graph-v2.csv):

```csv
workflow_id,project_id,agent_id,agent_type,description,mcp_endpoints,prompt_url,processor_url,formatter_url,tools_config_url
```

### Colunas:
1. **workflow_id**: Identificador do workflow
2. **project_id**: ID do projeto/tenant
3. **agent_id**: ID do agente
4. **agent_type**: Tipo do agente
5. **description**: Descrição
6. **mcp_endpoints**: JSON array com MCPs
7. **prompt_url**: URL do prompt no GitHub
8. **processor_url**: URL do processador no GitHub
9. **formatter_url**: URL do formatador no GitHub
10. **tools_config_url**: URL de configuração de tools

## **Nodes N8N Necessários:**

### 1. Load CSV (HTTP Request)
```
URL: https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/assembly-logic/agents-registry-graph-v2.csv
Response Format: text
```

### 2. Load Processor (HTTP Request)
```
URL: {{ $json.processor_url }}
Response Format: text
```

### 3. Execute Processor (Code)
```javascript
// Execute GitHub-loaded processor
const processorCode = $('Load Processor').item.json.data;
const inputData = $('Webhook').item.json.body;
const csvData = $('Load CSV').item.json.data;

// Create execution context
const context = {
  $: function(nodeName) {
    if (nodeName === 'Webhook') {
      return { item: { json: { body: inputData } } };
    }
    if (nodeName === 'Load CSV') {
      return { item: { json: { data: csvData } } };
    }
  },
  console: console,
  Date: Date,
  JSON: JSON,
  $http: $http  // N8N HTTP helper
};

// Execute processor
try {
  const func = new Function('$', 'console', 'Date', 'JSON', '$http',
    processorCode + '; return execute();');
  const result = await func(context.$, context.console,
    context.Date, context.JSON, context.$http);
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

### 4. Load Prompt (HTTP Request)
```
URL: {{ $json.prompt_url }}
Response Format: text
```

### 5. Load Formatter (HTTP Request)
```
URL: {{ $json.formatter_url }}
Response Format: text
```

### 6. Execute Formatter (Code)
```javascript
// Execute GitHub-loaded formatter
const formatterCode = $('Load Formatter').item.json.data;
const aiResponse = $('Enhanced AI Agent').item.json;
const processorData = $('Execute Processor').item.json;

// Create context for formatter
const context = {
  $: function(nodeName) {
    if (nodeName === 'Enhanced AI Agent') {
      return { item: { json: aiResponse } };
    }
    if (nodeName === 'Prepare for AI Agent') {
      return { item: { json: processorData } };
    }
  },
  console: console,
  Date: Date
};

// Execute formatter
try {
  const func = new Function('$', 'console', 'Date',
    formatterCode);
  const result = await func(context.$, context.console, context.Date);
  return result;
} catch (error) {
  return [{
    json: {
      success: false,
      error: 'Formatter execution failed',
      details: error.message,
      raw_response: aiResponse
    }
  }];
}
```

## **Vantagens desta Arquitetura:**

1. ✅ **100% Customizável** - Mude qualquer comportamento editando arquivos no GitHub
2. ✅ **Versionado** - Todo código no Git com histórico
3. ✅ **Multi-Tenant** - Cada agent tem seus próprios arquivos
4. ✅ **Hot Reload** - Mudanças aplicadas imediatamente
5. ✅ **Sem Lock-in** - N8N apenas orquestra, lógica no GitHub
6. ✅ **Reusável** - Mesmos processors/formatters para múltiplos agents

## **Como Adicionar Novo Agent:**

1. Adicione linha no CSV com URLs dos arquivos
2. Crie os arquivos no GitHub:
   - `prompts/agents/[agent_name].txt`
   - `code/processors/[processor_name].js`
   - `code/formatters/[formatter_name].js`
3. Commit e push
4. Pronto! Agent disponível imediatamente

## **Exemplo de Processor (graph-processor-dynamic.js):**

```javascript
async function execute() {
  // Acesso aos dados via $()
  const inputData = $('Webhook').item.json.body;
  const csvData = $('Load CSV').item.json.data;

  // Sua lógica aqui

  return [{
    json: {
      // Seus dados
    }
  }];
}
```

## **Exemplo de Formatter (response-formatter-production.js):**

```javascript
// Acesso aos dados do AI Agent
const aiResponse = $('Enhanced AI Agent').item.json;
const processorData = $('Prepare for AI Agent').item.json;

// Formatação da resposta
const result = {
  success: true,
  result: aiResponse.output,
  // etc...
};

return [{ json: result }];
```

## **Teste com curl:**

```bash
curl -X POST "https://primary-production-56785.up.railway.app/webhook/[seu-webhook]" \
-H "Content-Type: application/json" \
-d '{
  "project_id": "project_001",
  "agent_id": "agent_001",
  "query": "Sua query aqui"
}'
```

## **Resultado:**

Um sistema completamente dinâmico onde:
- N8N = Orquestrador puro
- GitHub = Fonte de verdade para toda lógica
- Zero hardcode = Máxima flexibilidade

🎯 **TUDO CUSTOMIZÁVEL SEM TOCAR NO N8N!**