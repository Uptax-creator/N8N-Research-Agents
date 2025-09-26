# 🚀 NODE 2 - GitHub Processor Loader SIMPLES

## **📋 CÓDIGO CORRETO PARA N8N:**

Este código vai no **Node 2** do N8N e carrega o processor do GitHub.

```javascript
// 🚀 GITHUB PROCESSOR LOADER - v2.1 Simples
// Carrega e executa o universal-workflow-processor.js do GitHub

const ssv = $('SSV Variables Setup').item.json;

console.log('🚀 GitHub Processor Loader v2.1 - Starting...');
console.log('📋 SSV Config:', ssv.workflow_config?.version);
console.log('🎯 Workflow ID:', ssv.request_data?.ID_workflow);

// URL do processor no GitHub
const processorUrl = ssv.workflow_config.processor_url ||
  `${ssv.workflow_config.github_base}/processors/universal-workflow-processor.js`;

try {
  console.log('📥 Loading processor from:', processorUrl);

  // Carregar código do GitHub usando $http (N8N compatible)
  const response = await $http.request({
    method: 'GET',
    url: processorUrl,
    returnFullResponse: true
  });

  if (response.statusCode !== 200) {
    throw new Error(`HTTP ${response.statusCode}`);
  }

  const processorCode = response.body;
  console.log('✅ Processor loaded, size:', processorCode.length);

  // Criar wrapper fetch para o processor usar
  const fetchWrapper = async (url) => {
    console.log('🔗 Fetching:', url);
    const httpResp = await $http.request({
      method: 'GET',
      url: url,
      returnFullResponse: true
    });

    // Simular response do fetch
    return {
      ok: httpResp.statusCode === 200,
      status: httpResp.statusCode,
      text: async () => httpResp.body,
      json: async () => JSON.parse(httpResp.body)
    };
  };

  // Executar processor
  console.log('⚙️ Executing processor...');

  const processor = new Function(
    'ssv', 'vars', 'getWorkflowStaticData', 'fetch', 'console',
    processorCode + '; return executeWorkflow(ssv, vars, getWorkflowStaticData, fetch, console);'
  );

  const result = await processor(
    ssv,
    $vars,
    getWorkflowStaticData,
    fetchWrapper,  // Passa o wrapper como fetch
    console
  );

  console.log('✅ Processor executed successfully');
  return [{ json: result }];

} catch (error) {
  console.error('❌ Error:', error.message);

  // Fallback response
  return [{
    json: {
      success: false,
      error: error.message,
      fallback_response: {
        query: ssv.request_data?.query,
        message: 'Using fallback - processor unavailable'
      },
      ssv_debug: ssv
    }
  }];
}
```

## **🔧 COMO APLICAR:**

1. **Abra o N8N**
2. **Edite** o Node 2 (GitHub Processor Loader)
3. **Delete** todo código atual
4. **Cole** este código novo
5. **Save** e teste

## **🎯 O QUE MUDOU:**

- ✅ Usa `$http.request` ao invés de `fetch`
- ✅ Cria `fetchWrapper` para o processor usar
- ✅ Código mais simples e limpo
- ✅ Compatível com N8N

## **🧪 TESTE:**

```bash
curl -X POST "https://primary-production-56785.up.railway.app/webhook/work-1001v1" \
-H "Content-Type: application/json" \
-d '{
  "project_id": "project_001",
  "agent_id": "agent_001",
  "ID_workflow": "scJSDgRWiHTkfNUn",
  "query": "teste com node 2 simplificado"
}'
```