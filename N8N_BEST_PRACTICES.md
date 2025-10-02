# 🚀 N8N Best Practices - Boas Práticas para Desenvolvimento

> **Documento essencial** para evitar erros recorrentes no desenvolvimento N8N

## ⚠️ PROBLEMAS COMUNS E SOLUÇÕES

### 1. 🔴 ERRO: "fetch is not defined"

**PROBLEMA:**
```javascript
// ❌ NÃO FUNCIONA no N8N
const response = await fetch(url);
```

**CAUSA:** N8N v1.113.3+ roda em Node.js backend, `fetch()` não está disponível globalmente.

**✅ SOLUÇÃO:**
```javascript
// ✅ SEMPRE USE AXIOS
const axios = require('axios');
const response = await axios.get(url);
const data = response.data; // Não precisa de .text() ou .json()
```

### 2. 🔴 ERRO: "require is not defined" em vm.runInNewContext

**PROBLEMA:**
```javascript
// ❌ Context incompleto
const context = { $input, $json, console };
vm.runInNewContext(code, context);
```

**✅ SOLUÇÃO:**
```javascript
// ✅ Context completo para N8N
const context = {
  $input,
  $json,
  console,
  require,
  Date,
  JSON,
  Promise,
  Buffer,
  process: { env: process.env },
  // Não incluir fetch - usar axios dentro do código
};
```

### 3. 🔴 ERRO: HTTP Request vs Code Node

**PROBLEMA:** Usar HTTP Request nodes desnecessariamente.

**✅ SOLUÇÃO:**
```javascript
// ✅ Tudo em um Code Node
const axios = require('axios');

// Carregar múltiplos recursos
const promises = urls.map(url => axios.get(url));
const responses = await Promise.all(promises);
const data = responses.map(r => r.data);
```

## 🛠️ PADRÕES DE CÓDIGO RECOMENDADOS

### Estrutura de Code Node Padrão
```javascript
// ✅ TEMPLATE PADRÃO PARA CODE NODES
try {
  const axios = require('axios');

  // 1. Extrair dados do input
  const inputData = $input.first().json;

  // 2. Validar dados essenciais
  if (!inputData.required_field) {
    throw new Error('Campo obrigatório não encontrado');
  }

  // 3. Fazer requests HTTP
  const response = await axios.get(url);
  if (response.status !== 200) {
    throw new Error(`HTTP ${response.status}: ${url}`);
  }

  // 4. Processar dados
  const processedData = response.data;

  // 5. Retornar resultado estruturado
  return [{ json: {
    status: 'success',
    data: processedData,
    timestamp: new Date().toISOString()
  }}];

} catch (error) {
  console.error('❌ Erro:', error.message);
  return [{ json: {
    status: 'error',
    error: error.message,
    timestamp: new Date().toISOString()
  }}];
}
```

### Carregamento Dinâmico de GitHub
```javascript
// ✅ PADRÃO PARA CARREGAR COMPONENTES DO GITHUB
const axios = require('axios');
const vm = require('vm');

const componentUrl = $json.component_url || 'https://raw.githubusercontent.com/...';

try {
  // Carregar código
  const response = await axios.get(componentUrl);
  const githubCode = response.data;

  // Preparar contexto
  const context = {
    $input,
    $json,
    console,
    require,
    Date,
    JSON,
    Promise,
    Buffer
  };

  // Executar código
  const result = vm.runInNewContext(githubCode, context);
  return result;

} catch (error) {
  console.error('❌ Erro ao carregar componente:', error.message);
  throw error;
}
```

## 🔧 CONFIGURAÇÕES MCP

### Bright Data
```json
{
  "endpoint": "https://mcp.brightdata.com/sse?token=YOUR_TOKEN",
  "provider": "bright_data",
  "transport": "httpStreamable",
  "timeout": 60000
}
```

### Composio
```json
{
  "endpoint": "https://apollo-3irns8zl6-composio.vercel.app/v3/mcp/YOUR_ID/mcp",
  "provider": "composio",
  "transport": "httpStreamable",
  "timeout": 60000
}
```

## 📋 CHECKLIST PRÉ-DEPLOY

- [ ] ✅ Todos os `fetch()` substituídos por `axios.get()`
- [ ] ✅ Context do `vm.runInNewContext()` completo
- [ ] ✅ MCP Client com `serverTransport: "httpStreamable"`
- [ ] ✅ URLs do Bright Data usando `/sse?token=`
- [ ] ✅ Tratamento de erro em todos os Code Nodes
- [ ] ✅ Logs console.log() para debugging
- [ ] ✅ Timeout configurado (60000ms)
- [ ] ✅ Variáveis essenciais (`agent_id`, `project_id`, `dateNow`)

## 🚨 ERROS MAIS FREQUENTES

1. **"fetch is not defined"** → Use `axios`
2. **"require is not defined"** → Context incompleto
3. **"Cannot read property of undefined"** → Validar inputs
4. **MCP timeout** → Verificar `serverTransport` e URLs
5. **GitHub 404** → Verificar branch (usar `main`, não `clean-deployment`)

## 🎯 TEMPLATE DE WORKFLOW LIMPO

```json
{
  "nodes": [
    {
      "type": "n8n-nodes-base.webhook",
      "parameters": { "path": "your-endpoint" }
    },
    {
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// Carrega componente GitHub com axios\nconst axios = require('axios');\nconst response = await axios.get($json.component_url);\nconst result = vm.runInNewContext(response.data, context);\nreturn result;"
      }
    },
    {
      "type": "@n8n/n8n-nodes-langchain.agent",
      "parameters": { "promptType": "define" }
    },
    {
      "type": "n8n-nodes-base.respondToWebhook"
    }
  ]
}
```

---

## 📚 RECURSOS ADICIONAIS

- **N8N Docs**: https://docs.n8n.io/
- **GitHub Components**: https://github.com/Uptax-creator/N8N-Research-Agents
- **MCP Protocol**: https://modelcontextprotocol.io/

---

**📅 Última atualização**: 2025-10-02
**🔄 Versão**: 1.0
**👥 Equipe**: N8N Development Team