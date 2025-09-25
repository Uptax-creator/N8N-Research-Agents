# 🚀 PLANO: MIGRAR RESPONSE FORMATTER PARA GITHUB

## **OBJETIVO:**
Tornar o Response Formatter 100% dinâmico e customizável via GitHub, como os outros componentes.

---

## **PASSO 1: CRIAR FORMATTER NO GITHUB**

### Arquivo: `code/formatters/response-formatter-enhanced-research.js`

```javascript
/**
 * Response Formatter - Enhanced Research Agent
 * GitHub-hosted formatter for N8N Graph System
 */

// Acesso aos dados via contexto N8N
const aiResponse = $('AI Agent').item.json;
const processorData = $('Execute Processor').item.json;

console.log('🎯 Formatting response for Enhanced Research Agent');

// Extrair informações importantes da resposta
const aiOutput = aiResponse?.output || aiResponse?.text || 'Nenhuma resposta gerada';

// Detectar ferramentas utilizadas baseado no conteúdo
const toolsUsed = [];
if (aiOutput.includes('search_engine') || aiOutput.toLowerCase().includes('pesquisa')) {
  toolsUsed.push('Bright Data Search Engine');
}
if (aiOutput.includes('scrape_as_markdown') || aiOutput.toLowerCase().includes('scraping')) {
  toolsUsed.push('Web Scraping');
}
if (aiOutput.includes('GOOGLEDOCS_CREATE_DOCUMENT') || aiOutput.includes('docs.google.com')) {
  toolsUsed.push('Google Docs Creation');
}

// Extrair links importantes
const links = {
  google_docs: null,
  sources: []
};

// Buscar link do Google Docs
const docsMatch = aiOutput.match(/https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9_-]+/g);
if (docsMatch) {
  links.google_docs = docsMatch[0];
}

// Buscar outras URLs mencionadas
const urlMatches = aiOutput.match(/https?:\/\/[^\s\)]+/g);
if (urlMatches) {
  links.sources = urlMatches.filter(url => !url.includes('docs.google.com')).slice(0, 5);
}

// Estruturar resposta final
const result = {
  success: true,
  agent: {
    type: processorData.agent_config?.agent_type || 'enhanced_research',
    project_id: processorData.agent_config?.project_id || 'unknown',
    agent_id: processorData.agent_config?.agent_id || 'unknown',
    description: processorData.agent_config?.description || 'Brazilian Research Agent'
  },

  request: {
    query: processorData.text || 'No query provided',
    session_id: processorData.session_id
  },

  response: {
    content: aiOutput,
    summary: aiOutput.length > 500 ? aiOutput.substring(0, 500) + '...' : aiOutput,
    tools_used: toolsUsed,
    links: links
  },

  metadata: {
    timestamp: new Date().toISOString(),
    workflow: 'uptax-proc-1001-dynamic',
    execution_time: Date.now() - parseInt(processorData.session_id?.split('_')[2] || Date.now()),
    version: '2.0.0-github',
    mcps_available: ['bright_data_search', 'google_docs_creation']
  }
};

console.log('✅ Response formatted successfully');
console.log('🔧 Tools detected:', toolsUsed.join(', ') || 'None');
if (links.google_docs) {
  console.log('📄 Google Docs created:', links.google_docs);
}

return [{ json: result }];
```

---

## **PASSO 2: ATUALIZAR CSV COM FORMATTER_URL**

### Adicionar coluna `formatter_url` no CSV:

```csv
workflow_id,project_id,agent_id,agent_type,description,mcp_endpoints,prompt_url,processor_url,formatter_url,tools_config_url
uptax-proc-1001-dynamic,project_001,agent_001,enhanced_research,Brazilian research with dual MCPs,"[{""name"":""bright_data"",""url"":""https://mcp.brightdata.com/sse?token=ecfc6404fb9eb026a9c802196b8d5caaf131d63c0931f9e888e57077e6b1f8cf"",""type"":""search"",""priority"":1},{""name"":""google_docs"",""url"":""https://apollo-3irns8zl6-composio.vercel.app/v3/mcp/aab98bef-8816-4873-95f6-45615ca063d4/mcp?include_composio_helper_actions=true"",""type"":""documentation"",""priority"":2}]",https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/prompts/agents/enhanced_research_brazilian_proactive.txt,https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/code/processors/graph-processor-dynamic.js,https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/code/formatters/response-formatter-enhanced-research.js,https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/N8N/projects/project_001/agent_001_tools.json
```

---

## **PASSO 3: MODIFICAR O GRAPH PROCESSOR**

### Atualizar `graph-processor-dynamic.js` para incluir `formatter_url`:

```javascript
// No final do processor, adicionar:
agentConfig = {
  // ... configurações existentes
  formatter_url: values[8], // Nova coluna formatter_url
  // ... resto das configurações
};

// No return, adicionar:
return [{
  json: {
    // ... dados existentes
    formatter_url: agentConfig.formatter_url, // Para o Load Formatter
    // ... resto dos dados
  }
}];
```

---

## **PASSO 4: ADICIONAR NODES NO N8N**

### **Node 1: Load Formatter from GitHub** (HTTP Request)
- **Posição**: Após AI Agent, antes de Response Formatter
- **URL**: `={{ $json.formatter_url }}`
- **Response Format**: text

### **Node 2: Execute Formatter** (Code)
```javascript
// Execute GitHub-loaded formatter
const formatterCode = $('Load Formatter from GitHub').item.json.data;
const aiResponse = $('AI Agent').item.json;
const processorData = $('Execute Processor').item.json;

// Create execution context
const context = {
  $: function(nodeName) {
    if (nodeName === 'AI Agent') {
      return { item: { json: aiResponse } };
    }
    if (nodeName === 'Execute Processor') {
      return { item: { json: processorData } };
    }
  },
  console: console,
  Date: Date
};

try {
  // Execute formatter code
  const func = new Function('$', 'console', 'Date',
    formatterCode);
  const result = func(context.$, context.console, context.Date);
  return result;
} catch (error) {
  console.log('❌ Formatter execution failed:', error.message);
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

---

## **PASSO 5: FLUXO FINAL**

```
1. Webhook Enhanced1
   ↓
2. Load Graph CSV
   ↓
3. Load Processor from GitHub
   ↓
4. Execute Processor
   ↓
5. Load Prompt from GitHub
   ↓
6. Prepare for AI Agent
   ↓
7. AI Agent (com MCPs)
   ↓
8. Load Formatter from GitHub [NOVO]
   ↓
9. Execute Formatter [NOVO]
   ↓
10. Respond Enhanced

[DELETAR: Response Formatter inline]
```

---

## **VANTAGENS:**

✅ **100% GitHub-driven** - Zero hardcode no N8N
✅ **Formatters customizáveis** por agent
✅ **Versionamento** - Formatters no Git
✅ **Reutilização** - Mesmo formatter para múltiplos agents
✅ **Hot-reload** - Mudanças aplicadas imediatamente

---

## **TESTE FINAL:**

```bash
curl -X POST "https://primary-production-56785.up.railway.app/webhook/work-1001-v2" \
-H "Content-Type: application/json" \
-d '{
  "project_id": "project_001",
  "agent_id": "agent_001",
  "query": "Pesquise sobre IA no Brasil e crie um documento"
}'
```

**Resultado esperado:**
- Resposta estruturada do formatter do GitHub
- Links extraídos automaticamente
- Ferramentas detectadas
- Metadata completa
- Customizável sem tocar no N8N!

---

**STATUS:** Planejamento completo ✅
**PRÓXIMO:** Implementar passo-a-passo