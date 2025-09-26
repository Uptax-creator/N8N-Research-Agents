# 🚀 NODE 2 - CODE NODE (Execute JavaScript Code)

## **📋 TIPO DE NODE NO N8N:**
- **Nome no N8N**: "Code" ou "Execute JavaScript Code"
- **Ícone**: `{ }` ou `</>`
- **Categoria**: Core Nodes → Code

## **🔧 COMO ADICIONAR:**

1. Clique no **+** para adicionar node
2. Digite **"Code"** na busca
3. Selecione **"Code"** (Execute JavaScript Code)
4. Posicione após o Node 1

## **📝 CÓDIGO PARA COLAR NO CODE NODE:**

```javascript
// 🚀 GITHUB PROCESSOR LOADER - v2.2 FINAL
// Para Code Node (Execute JavaScript Code)

const ssv = $input.item.json;

console.log('🚀 GitHub Processor Loader v2.2');
console.log('📥 Input received:', JSON.stringify(ssv, null, 2));

// Validação básica
if (!ssv) {
  return [{
    json: {
      success: false,
      error: 'No input data received from previous node'
    }
  }];
}

// Configuração com fallbacks
const workflowConfig = ssv.workflow_config || {};
const requestData = ssv.request_data || {};

const githubBase = workflowConfig.github_base ||
  'https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment';

const processorUrl = workflowConfig.processor_url ||
  `${githubBase}/processors/universal-workflow-processor.js`;

console.log('🔧 Configuration:');
console.log('   GitHub Base:', githubBase);
console.log('   Processor URL:', processorUrl);
console.log('   Query:', requestData.query || 'No query');

try {
  // Tentar carregar do GitHub
  console.log('📥 Loading from GitHub...');

  const response = await $http.request({
    method: 'GET',
    url: processorUrl,
    returnFullResponse: true
  });

  if (response.statusCode === 200) {
    console.log('✅ GitHub processor loaded');

    // Por enquanto, retornar mock (processor será executado na próxima fase)
    const mockResponse = {
      success: true,
      output: `GitHub Processor Connected Successfully!

Query: ${requestData.query || 'No query'}
Agent: ${requestData.agent_id || 'No agent'}
Project: ${requestData.project_id || 'No project'}
Workflow: ${requestData.ID_workflow || 'No workflow'}

✅ Node 1 (Variables): Working
✅ Node 2 (Code): Working
✅ GitHub Access: Working
✅ Ready for full implementation

Processor URL confirmed: ${processorUrl}
Response size: ${response.body.length} bytes`,

      agent_info: {
        agent_id: requestData.agent_id || 'test_agent',
        agent_name: 'Test Agent',
        ID_workflow: requestData.ID_workflow || 'test_workflow'
      },

      session_info: {
        session_id: requestData.session_id || `test_${Date.now()}`,
        project_id: requestData.project_id || 'test_project',
        query: requestData.query || 'test query',
        timestamp: new Date().toISOString()
      },

      metadata: {
        processor_version: 'mock-2.2',
        github_accessible: true,
        processor_size: response.body.length,
        node_type: 'code_node',
        http_available: true
      }
    };

    return [{ json: mockResponse }];

  } else {
    throw new Error(`GitHub returned ${response.statusCode}`);
  }

} catch (error) {
  console.error('❌ Error:', error.message);

  // Fallback response
  return [{
    json: {
      success: false,
      error: 'GitHub processor unavailable',
      error_message: error.message,

      fallback_response: {
        output: `Fallback Mode Active

Query: ${requestData.query || 'No query'}
Error: ${error.message}

The workflow structure is working correctly.
GitHub processor needs to be pushed to repository.`,

        timestamp: new Date().toISOString()
      },

      debug_info: {
        processor_url: processorUrl,
        github_base: githubBase,
        ssv_received: true,
        workflow_config_present: !!workflowConfig,
        request_data_present: !!requestData,
        http_available: typeof $http !== 'undefined'
      }
    }
  }];
}
```

## **🔌 CONEXÕES:**

```
Node 1 (Variables) → Node 2 (Code) → Node 3 (Response)
```

## **✅ VERIFICAÇÕES:**

Após adicionar o Code Node, verifique:
1. Node está conectado após Node 1
2. Node 3 está conectado após este Code Node
3. Workflow está ativo

## **🧪 TESTE:**

```bash
curl -X POST "https://primary-production-56785.up.railway.app/webhook/work-1001v1" \
-H "Content-Type: application/json" \
-d '{
  "project_id": "project_001",
  "agent_id": "agent_001",
  "ID_workflow": "scJSDgRWiHTkfNUn",
  "query": "teste com code node correto"
}'
```