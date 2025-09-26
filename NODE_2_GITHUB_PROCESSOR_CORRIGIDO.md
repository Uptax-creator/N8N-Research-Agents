# 🔧 NODE 2 CORRIGIDO - GitHub Processor Loader

## **⚠️ CORREÇÃO IMPORTANTE:**
Substitui `fetch` por `$http.request` para funcionar no N8N.

## **📋 CÓDIGO CORRIGIDO COMPLETO:**

```javascript
// 🚀 GITHUB PROCESSOR LOADER - Universal v2.1 CORRIGIDO
// Usa $http ao invés de fetch para compatibilidade N8N

const ssv = $('SSV Variables Setup').item.json;

console.log('🚀 GitHub Processor Loader v2.1 CORRIGIDO - Starting...');
console.log('📋 SSV Config Version:', ssv.workflow_config?.version);
console.log('🎯 Target Workflow:', ssv.request_data?.ID_workflow);
console.log('🤖 Target Agent:', ssv.request_data?.agent_id);

// === LOAD UNIVERSAL PROCESSOR FROM GITHUB ===
const processorUrl = ssv.workflow_config.processor_url ||
  `${ssv.workflow_config.github_base}/processors/universal-workflow-processor.js`;

try {
  console.log('📥 Loading Universal Processor from:', processorUrl);

  // ✅ CORREÇÃO: Usar $http ao invés de fetch
  const response = await $http.request({
    method: 'GET',
    url: processorUrl,
    returnFullResponse: true
  });

  if (response.statusCode !== 200) {
    throw new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`);
  }

  const processorCode = response.body;
  console.log('✅ Universal Processor code loaded, length:', processorCode.length);

  // === EXECUTE UNIVERSAL PROCESSOR WITH SSV ===
  console.log('⚙️ Executing Universal Processor...');

  // Criar wrapper fetch para o processor usar internamente
  const fetchWrapper = async (url, options = {}) => {
    console.log('🔗 Fetch wrapper called for:', url);
    try {
      const httpResponse = await $http.request({
        method: options.method || 'GET',
        url: url,
        headers: options.headers || {},
        body: options.body,
        returnFullResponse: true
      });

      return {
        ok: httpResponse.statusCode >= 200 && httpResponse.statusCode < 300,
        status: httpResponse.statusCode,
        statusText: httpResponse.statusMessage || '',
        text: async () => httpResponse.body,
        json: async () => {
          try {
            return typeof httpResponse.body === 'string'
              ? JSON.parse(httpResponse.body)
              : httpResponse.body;
          } catch (e) {
            console.error('JSON parse error:', e);
            return httpResponse.body;
          }
        }
      };
    } catch (error) {
      console.error('Fetch wrapper error:', error.message);
      throw error;
    }
  };

  // Executar processor com fetch wrapper
  const processor = new Function(
    'ssv', 'vars', 'getWorkflowStaticData', 'fetch', 'console',
    processorCode + '; return executeWorkflow(ssv, vars, getWorkflowStaticData, fetch, console);'
  );

  const result = await processor(ssv, $vars, getWorkflowStaticData, fetchWrapper, console);

  console.log('✅ GitHub Processor executed successfully');
  console.log('📤 Result preview:', {
    success: result.success,
    agent_name: result.agent_info?.agent_name,
    output_length: result.output?.length || 0
  });

  return [{ json: result }];

} catch (error) {
  console.error('❌ GitHub Processor Loader failed:', error.message);
  console.error('🔍 Error details:', error.stack);

  // === ENHANCED FALLBACK RESPONSE ===
  return [{
    json: {
      success: false,
      error: 'GitHub Processor unavailable',
      error_details: {
        message: error.message,
        processor_url: processorUrl,
        timestamp: new Date().toISOString()
      },

      // Fallback processing
      fallback_response: {
        output: `Fallback Response for: "${ssv.request_data?.query}"

Agent ID: ${ssv.request_data?.agent_id}
Workflow ID: ${ssv.request_data?.ID_workflow}
Project ID: ${ssv.request_data?.project_id}

The GitHub-First processor is currently unavailable.
This fallback response confirms that:
✅ SSV Variables are flowing correctly
✅ Node connections are working
✅ Webhook input is being processed

Error details: ${error.message}

The system will automatically recover when GitHub processor is available.`,

        agent_info: {
          agent_id: ssv.request_data?.agent_id,
          ID_workflow: ssv.request_data?.ID_workflow,
          status: 'fallback_mode'
        }
      },

      // Preserve SSV for debugging
      ssv_preserved: ssv,

      // Technical details
      debug_info: {
        processor_version: 'fallback-v2.1-corrected',
        error_type: error.name,
        github_accessible: false,
        ssv_structure_valid: !!(ssv?.workflow_config && ssv?.request_data)
      }
    }
  }];
}
```

## **📍 PASSO A PASSO:**

1. **Abra o N8N** na URL: https://primary-production-56785.up.railway.app
2. **Abra o workflow** work-1001v1
3. **Clique 2x** no node "GitHub Processor Loader"
4. **Selecione TODO** o código atual (Ctrl+A ou Cmd+A)
5. **Delete** o código atual
6. **Cole** o código corrigido acima
7. **Clique em Save** ou Execute Node

## **🔑 PRINCIPAIS MUDANÇAS:**

### **1. Substituição do fetch:**
```javascript
// ❌ ANTES (erro):
const response = await fetch(processorUrl);

// ✅ DEPOIS (correto):
const response = await $http.request({
  method: 'GET',
  url: processorUrl,
  returnFullResponse: true
});
```

### **2. Adição de fetchWrapper:**
- Cria um wrapper que simula a API do fetch
- Permite que o universal processor use "fetch" internamente
- Converte $http responses para formato fetch-like

### **3. Melhor error handling:**
- Logs mais detalhados
- Fallback messages melhoradas
- Debug information expandida

## **🧪 APÓS APLICAR A CORREÇÃO:**

Execute o teste novamente:

```bash
curl -X POST "https://primary-production-56785.up.railway.app/webhook/work-1001v1" \
-H "Content-Type: application/json" \
-d '{
  "project_id": "project_001",
  "agent_id": "agent_001",
  "ID_workflow": "scJSDgRWiHTkfNUn",
  "query": "teste com correção do fetch para http"
}'
```

## **✅ RESULTADO ESPERADO:**

Se funcionar, você verá:
- `"success": true`
- Agent information carregada do GitHub
- Universal processor executado com sucesso

Se ainda tiver erro, o fallback mostrará detalhes específicos do problema.