# Graph Processor - Código de Produção

## Versão Final para N8N Code Node

Este código deve ser usado no node **Graph Processor** do workflow `uptax-proc-1001-graph-WORKING`.

```javascript
// Graph Processor - PRODUÇÃO
const inputData = $('Webhook Enhanced2').item.json.body;
const csvData = $('Load Graph CSV').item.json.data;

console.log('🚀 Graph Processor - Produção');

const projectId = inputData.project_id;
const agentId = inputData.agent_id;
const query = inputData.query || 'Default query';
const workflowId = 'uptax-proc-1001-dynamic';

// Parse CSV lines
const lines = csvData.split('\n').filter(line => line.trim());
console.log('📋 CSV lines:', lines.length);

// Find agent
let targetLine = null;
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes(workflowId) && line.includes(projectId) && line.includes(agentId)) {
    targetLine = line;
    console.log('✅ Agent found');
    break;
  }
}

if (!targetLine) {
  return [{
    json: {
      success: false,
      error: 'Agent não encontrado',
      search: { workflowId, projectId, agentId }
    }
  }];
}

// Extrair URLs do CSV - SUPORTE PARA 2 MCPs
const promptUrlMatch = targetLine.match(/https:\/\/raw\.githubusercontent\.com[^,]+enhanced_research_brazilian_proactive\.txt/);
const brightDataMatch = targetLine.match(/https:\/\/mcp\.brightdata\.com\/sse\?token=[a-f0-9]+/);
const composioMatch = targetLine.match(/https:\/\/apollo[^"]+mcp\?include_composio_helper_actions=true/);

const agentConfig = {
  workflow_id: workflowId,
  project_id: projectId,
  agent_id: agentId,
  agent_type: 'enhanced_research',
  description: 'Brazilian research agent with dual MCPs',

  // URLs extraídas do CSV
  prompt_url: promptUrlMatch ? promptUrlMatch[0] : 'https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/prompts/agents/enhanced_research_brazilian_proactive.txt',

  // DOIS MCPs DIFERENTES
  mcp_endpoint_sse: brightDataMatch ? brightDataMatch[0] : 'https://mcp.brightdata.com/sse?token=ecfc6404fb9eb026a9c802196b8d5caaf131d63c0931f9e888e57077e6b1f8cf',
  mcp_endpoint_http: composioMatch ? composioMatch[0] : 'https://apollo-3irns8zl6-composio.vercel.app/v3/mcp/aab98bef-8816-4873-95f6-45615ca063d4/mcp?include_composio_helper_actions=true'
};

console.log('✅ Config ready:', agentConfig.agent_type);

const sessionId = `${projectId}_${agentId}_${Date.now()}`;

// RETORNO LIMPO PARA O AI AGENT - COM 2 MCPs
return [{
  json: {
    text: query,
    session_id: sessionId,
    agent_config: agentConfig,
    prompt_url: agentConfig.prompt_url,          // Para o node Load Prompt
    mcp_endpoint_sse: agentConfig.mcp_endpoint_sse,    // Para Bright Data MCP (SSE)
    mcp_endpoint_http: agentConfig.mcp_endpoint_http   // Para Composio MCP (HTTP)
  }
}];
```

## O que foi removido da versão de teste:

### ❌ Removido (era só para debug/teste):
- `success: true`
- `test_step: 'structure_validated'`
- `input: {...}`
- `csv_test: {...}`
- `next_steps: [...]`
- `timestamp`
- `version`
- `raw_line`
- `parsing_method`

### ✅ Mantido (essencial para funcionamento):
- `text` - A query do usuário
- `session_id` - Para o Buffer Memory
- `agent_config` - Configurações do agent
- `prompt_url` - Para carregar o prompt do GitHub
- `mcp_endpoint` - Para o MCP Client Tool

## Nodes necessários após o Graph Processor:

1. **Load Prompt from GitHub** (HTTP Request)
   - URL: `={{ $json.prompt_url }}`
   - Response Format: text

2. **Prepare for AI Agent** (Code Node)
```javascript
// Prepare data for AI Agent
const processorData = $('Graph Processor').item.json;
const promptData = $('Load Prompt from GitHub').item.json.data;

console.log('🎯 Preparing for AI Agent');
console.log('📄 Prompt loaded:', promptData ? promptData.length : 0, 'chars');

return [{
  json: {
    text: processorData.text,
    session_id: processorData.session_id,
    system_message: promptData || `You are ${processorData.agent_config.description}. Use your tools proactively.`,
    mcp_endpoint_sse: processorData.mcp_endpoint_sse,    // Bright Data
    mcp_endpoint_http: processorData.mcp_endpoint_http   // Composio/Google Docs
  }
}];
```

3. **Enhanced AI Agent**
   - Prompt: `={{ $json.text }}`
   - System Message: `={{ $json.system_message }}`

4. **MCP Client Tool - Bright Data (SSE)**
   - Endpoint URL: `={{ $json.mcp_endpoint_sse }}`
   - Timeout: 60000
   - Nome: "Bright Data MCP"

5. **MCP Client Tool - Composio (HTTP)**
   - Endpoint URL: `={{ $json.mcp_endpoint_http }}`
   - Timeout: 60000
   - Nome: "Google Docs MCP"

6. **Buffer Memory**
   - Session Key: `={{ $json.session_id }}`

## Fluxo completo com 2 MCPs:

```
Webhook → Load CSV → Graph Processor → Load Prompt → Prepare Agent → AI Agent → Response Formatter → Respond
                                                                         ↑
                                                            Gemini ────┤
                                                            Memory ─────┤
                                                     Bright Data MCP ──┤
                                                     Google Docs MCP ─┘
```

## Configuração dos MCPs no AI Agent:

1. **Conecte AMBOS os MCPs** ao Enhanced AI Agent
2. **Bright Data MCP** - para search_engine e scrape_as_markdown
3. **Google Docs MCP** - para GOOGLEDOCS_CREATE_DOCUMENT_MARKDOWN
4. O prompt inteligente decidirá qual MCP usar baseado na query

## Teste com curl:

```bash
curl -X POST "https://primary-production-56785.up.railway.app/webhook/[seu-webhook]" \
-H "Content-Type: application/json" \
-d '{
  "project_id": "project_001",
  "agent_id": "agent_001",
  "query": "Pesquise sobre o mercado de IA no Brasil"
}'
```