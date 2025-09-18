# 🤖 Código JavaScript para n8n - AI Research Agent

## Código para o Node "AI Agent Processor"

Copie e cole exatamente este código no Code Node:

```javascript
const githubConfig = $('Load Agent Config').item.json.body || $('Load Agent Config').item.json; const githubPrompts = $('Load Agent Prompts').item.json.body || $('Load Agent Prompts').item.json; const githubCode = $('Load AI Handler Code').item.json.data; const inputData = $('Webhook POC').item.json.body; const executeFunction = new Function('inputData', 'githubConfig', 'githubPrompts', 'console', githubCode); return executeFunction(inputData, githubConfig, githubPrompts, console);
```

## URLs para os HTTP Request Nodes:

### Load Agent Config:
```
https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/N8N/agents/ai-research-agent/config.json
```

### Load Agent Prompts:
```
https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/N8N/agents/ai-research-agent/prompts.json
```

### Load AI Handler Code:
```
https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/N8N/code/processors/ai-agent-handler.js
```

## Estrutura do Workflow AI Agent:

```
1. Webhook POC (entrada)
2. Load Agent Config (HTTP Request - JSON)
3. Load Agent Prompts (HTTP Request - JSON)
4. Load AI Handler Code (HTTP Request - TEXT)
5. AI Agent Processor (Code Node - código acima)
6. Respond POC (saída)
```

## Exemplo de Input para Teste:

```json
{
  "query": "Como implementar autenticação JWT em n8n workflows?",
  "context": "Desenvolvimento de API segura para aplicação web",
  "provider": "claude",
  "format": "structured",
  "tone": "technical"
}
```

## ⚠️ IMPORTANTE:
- Todos os HTTP Request nodes em "fullResponse: true"
- Config e Prompts como "responseFormat: json"
- Handler Code como "responseFormat: text"
- Código JavaScript em UMA LINHA SÓ

## 🎯 Resultado Esperado:
- ✅ Configuração carregada do GitHub
- ✅ Prompts dinâmicos aplicados
- ✅ Processamento AI simulado
- ✅ Resposta estruturada completa

---

**Data:** 15/09/2025
**Status:** MVP pronto para teste