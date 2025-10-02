# 🔧 N8N Code Templates - Versões Corrigidas

> **Documento para implementação rápida** - Copie e cole diretamente nos Code Nodes do N8N

## ⚠️ PROBLEMA RECORRENTE RESOLVIDO

**ERROS COMUNS:**
- ❌ `"fetch is not defined"`
- ❌ `"Module 'axios' is disallowed"`
- ❌ `"response.ok is not a function"`

**✅ SOLUÇÃO:** Usar `$helpers.httpRequest()` (método nativo N8N)

---

## 📋 CODE NODE 1: Execute Envelope Clean

**COPIE E COLE ESTE CÓDIGO:**

```javascript
// ✅ EXECUTOR LIMPO - N8N NATIVE HTTP REQUEST
const componentUrl = $json.envelope_processor_url || 'https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/main/components/dynamic/envelope-processor-dynamic-v1.0.js';

console.log('🔗 Carregando Envelope Processor:', componentUrl);

try {
  // Carregar código do GitHub usando N8N native method
  const githubCode = await $helpers.httpRequest({
    method: 'GET',
    url: componentUrl
  });

  console.log('✅ Código carregado, tamanho:', githubCode.length, 'chars');

  // Executar código do GitHub com contexto completo
  const vm = require('vm');
  const context = {
    $input,
    $json,
    console,
    require,
    Date,
    JSON,
    Promise,
    Buffer,
    process: { env: process.env }
  };

  const result = vm.runInNewContext(githubCode, context);
  console.log('✅ Envelope Processor executado com sucesso');
  return result;

} catch (error) {
  console.error('❌ Erro na execução:', error.message);

  // Fallback em caso de erro
  return [{
    json: {
      status: 'error',
      error: error.message,
      agent_id: $json.agent_id || 'unknown',
      project_id: $json.project_id || 'unknown',
      dateNow: $json.dateNow || new Date().toISOString(),
      fallback: true
    }
  }];
}
```

---

## 📋 CODE NODE 2: Execute Response Clean

**COPIE E COLE ESTE CÓDIGO:**

```javascript
// ✅ RESPONSE PROCESSOR - N8N NATIVE HTTP
const responseUrl = $json.response_processor_url || 'https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/main/components/dynamic/response-processor-dynamic-v1.0.js';

console.log('🔗 Carregando Response Processor:', responseUrl);

try {
  // Carregar código do GitHub usando N8N native method
  const githubCode = await $helpers.httpRequest({
    method: 'GET',
    url: responseUrl
  });

  console.log('✅ Response Processor carregado, tamanho:', githubCode.length);

  // Executar código do GitHub
  const vm = require('vm');
  const context = {
    $input,
    $json,
    console,
    require,
    Date,
    JSON
  };

  const result = vm.runInNewContext(githubCode, context);
  console.log('✅ Response Processor executado com sucesso');
  return result;

} catch (error) {
  console.error('❌ Erro no Response Processor:', error.message);

  // Fallback para resposta simples
  const result_text = $json.text || $json.output || 'Resposta não disponível';
  return [{
    json: {
      status: 'success',
      result: result_text,
      agent_id: $json.agent_id || 'unknown',
      project_id: $json.project_id || 'unknown',
      dateNow: $json.dateNow || new Date().toISOString(),
      processed_at: new Date().toISOString(),
      fallback_response: true
    }
  }];
}
```

---

## 🚀 IMPLEMENTAÇÃO RÁPIDA

### Passo 1: Abrir Workflow N8N
1. Vá para o workflow `work-1001-dynamic`
2. Clique no node **"Execute Envelope Clean"**
3. Cole o **CODE NODE 1** acima
4. Salvar

### Passo 2: Segundo Code Node
1. Clique no node **"Execute Response Clean"**
2. Cole o **CODE NODE 2** acima
3. Salvar

### Passo 3: Testar
- Use o frontend para testar agent_001
- Deve funcionar sem erros de `fetch` ou `axios`

---

## 🔍 DIFERENÇAS TÉCNICAS

### ❌ VERSÃO ANTIGA (PROBLEMÁTICA):
```javascript
// NÃO FUNCIONA no N8N v1.113.3+
const axios = require('axios');
const response = await axios.get(url);
const data = response.data;
```

### ✅ VERSÃO NOVA (FUNCIONA):
```javascript
// FUNCIONA no N8N v1.113.3+
const data = await $helpers.httpRequest({
  method: 'GET',
  url: url
});
```

---

## 🛠️ WORKFLOW JSON COMPLETO CORRIGIDO

```json
{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "work-1001-dynamic",
        "responseMode": "responseNode",
        "options": { "rawBody": false }
      },
      "name": "Webhook Clean",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.1
    },
    {
      "parameters": {
        "jsCode": "// VER CODE NODE 1 ACIMA"
      },
      "name": "Execute Envelope Clean",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "={{ $json.agent_context.text }}",
        "options": {
          "systemMessage": "={{ $json.agent_context.system_message }}"
        }
      },
      "name": "AI Agent Clean",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2
    },
    {
      "parameters": {
        "modelName": "models/gemini-2.0-flash",
        "options": { "temperature": 0.7, "topP": 0.3 }
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatGoogleGemini",
      "name": "Gemini Model Clean",
      "credentials": {
        "googlePalmApi": { "id": "fo1wxthXWXgY03J3" }
      }
    },
    {
      "parameters": {
        "sessionIdType": "customKey",
        "sessionKey": "session_{{ $json.node_transfer_vars.agent_id }}_{{ $json.node_transfer_vars.dateNow }}"
      },
      "name": "Buffer Memory Clean",
      "type": "@n8n/n8n-nodes-langchain.memoryBufferWindow",
      "typeVersion": 1.3
    },
    {
      "parameters": {
        "endpointUrl": "={{ $json.mcp_endpoint_http }}",
        "serverTransport": "httpStreamable",
        "options": { "timeout": 60000 }
      },
      "name": "MCP Client Clean",
      "type": "@n8n/n8n-nodes-langchain.mcpClientTool",
      "typeVersion": 1.1
    },
    {
      "parameters": {
        "jsCode": "// VER CODE NODE 2 ACIMA"
      },
      "name": "Execute Response Clean",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ $json }}",
        "options": {}
      },
      "name": "Respond Webhook Clean",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.5
    }
  ]
}
```

---

## 🚨 TROUBLESHOOTING

### Erro: "vm is not defined"
**CAUSA:** N8N sandbox muito restritivo
**SOLUÇÃO:** Usar HTTP Request node ao invés de Code node

### Erro: "$helpers is not defined"
**CAUSA:** Versão N8N muito antiga
**SOLUÇÃO:** Atualizar N8N para v1.113.3+

### Erro: "GitHub 404"
**CAUSA:** URLs incorretas ou branch errada
**SOLUÇÃO:** Verificar URLs apontam para branch `main`

### Erro: "Context timeout"
**CAUSA:** Componentes GitHub muito grandes
**SOLUÇÃO:** Aumentar timeout nos Code nodes

---

## 📚 LINKS ÚTEIS

- **GitHub Components**: https://github.com/Uptax-creator/N8N-Research-Agents
- **N8N Docs**: https://docs.n8n.io/code-examples/javascript-functions/
- **N8N HTTP Helper**: https://docs.n8n.io/code-examples/javascript-functions/#http-requests

---

## ✅ CHECKLIST FINAL

- [ ] Code Node 1 atualizado com `$helpers.httpRequest()`
- [ ] Code Node 2 atualizado com `$helpers.httpRequest()`
- [ ] Removido todos `require('axios')`
- [ ] Removido todos `fetch()`
- [ ] Adicionado try-catch em ambos os nodes
- [ ] URLs GitHub apontam para branch `main`
- [ ] Workflow testado com agent_001
- [ ] Logs mostram ✅ sem erros de HTTP

---

**📅 Última atualização**: 2025-10-02
**🔄 Versão**: 2.0 - N8N Native HTTP
**👥 Equipe**: N8N Development Team