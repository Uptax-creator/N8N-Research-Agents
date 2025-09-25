# Graph Params Parser - Código Corrigido

## 📋 Copie este código para o node "Graph Params Parser" no N8N:

```javascript
// Graph CSV Parser - Works with both GET and POST
const input = $input.all()[0].json;

// Try to get params from body (POST) or query (GET)
const projectId = input.project_id || input.query?.project_id || input.body?.project_id;
const agentId = input.agent_id || input.query?.agent_id || input.body?.agent_id;
const queryText = input.query || input.query?.query || input.body?.query || "Default query";

console.log('Debug - Input received:', JSON.stringify(input));
console.log('Debug - Project ID:', projectId);
console.log('Debug - Agent ID:', agentId);

if (!projectId || !agentId) {
  return [{
    json: {
      error_occurred: true,
      message: "Missing required parameters: project_id and agent_id",
      graph_key: "invalid",
      debug: {
        received_input: input,
        expected: "project_id and agent_id in request body or query params"
      }
    }
  }];
}

// Generate graph key
const graphKey = `${projectId}_${agentId}_${Date.now()}`;

return [{
  json: {
    project_id: projectId,
    agent_id: agentId,
    query: queryText,
    graph_key: graphKey,
    csv_url: "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/assembly-logic/agents-registry-graph.csv"
  }
}];
```

## 🔧 Instruções:

1. Abra o workflow **uptax-proc-1001-graph** no N8N
2. Localize o node **"Graph Params Parser"**
3. Delete o código atual
4. Cole este código novo
5. Salve o workflow
6. Teste novamente com:

```bash
curl -X POST "https://primary-production-56785.up.railway.app/webhook/work-1001" \
-H "Content-Type: application/json" \
-d '{
  "project_id": "project_001",
  "agent_id": "agent_001",
  "query": "Teste simples"
}'
```

## 🎯 O que foi corrigido:

- ✅ Agora busca parâmetros de múltiplas fontes
- ✅ Funciona com GET e POST
- ✅ Adiciona debug logs
- ✅ Retorna informações de debug quando falha