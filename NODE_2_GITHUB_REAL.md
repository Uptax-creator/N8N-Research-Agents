# 🔍 NODE 2 - GITHUB LOADER REAL

## **📋 CÓDIGO PARA NODE 2 (Code Node):**

```javascript
// 🔍 GITHUB LOADER REAL - Micro Test
// Apenas busca GitHub, zero hardcode

const ssv = $input.item.json;

console.log('🔍 GitHub Loader Real - Starting...');
console.log('📥 SSV Input:', JSON.stringify(ssv, null, 2));

try {
  // === FUNÇÃO FETCH PARA GITHUB ===
  async function fetchFromGitHub(url) {
    console.log(`📡 Fetching from: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'N8N-GitHub-Processor'
      },
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`GitHub fetch failed: ${response.status} - ${response.statusText}`);
    }

    return await response.text();
  }

  // === FUNÇÃO PARSE CSV ===
  function findAgentInCSV(csvText, agentId) {
    console.log(`🔍 Looking for agent_id: ${agentId}`);

    const lines = csvText.split('\n');
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values[0] === agentId) {
        const agent = {};
        headers.forEach((header, index) => {
          agent[header.trim()] = values[index] ? values[index].trim() : '';
        });
        console.log('✅ Agent found:', JSON.stringify(agent, null, 2));
        return agent;
      }
    }

    throw new Error(`Agent not found: ${agentId}`);
  }

  // === FUNÇÃO BUILD RESPONSE ===
  function buildRealResponse(ssv, agentRow, configData) {
    const config = JSON.parse(configData);

    return {
      success: true,
      output: "✅ Response carregado do GitHub!",
      query_received: ssv.request_data.query,
      agent_id_received: ssv.request_data.agent_id,
      project_id_received: ssv.request_data.project_id,
      workflow_id_received: ssv.request_data.ID_workflow,
      session_id_generated: ssv.request_data.session_id,

      // === DADOS DO GITHUB ===
      agent_info: {
        agent_name: config.agent_name,
        description: config.description,
        specialization: agentRow.specialization,
        agent_type: config.agent_type
      },

      // === METADATA GITHUB ===
      metadata: {
        github_integration: true,
        config_loaded_from_github: true,
        csv_registry_accessed: true,
        processor_version: "github-real-v3.0",
        github_config_url: agentRow.config_url,
        csv_agent_row: agentRow
      },

      // === DEBUG INFO ===
      debug_info: {
        node_type: "code_node_github_real",
        fetch_available: typeof fetch !== 'undefined',
        ssv_data_flow: {
          workflow_config: !!ssv.workflow_config,
          request_data: !!ssv.request_data,
          runtime: !!ssv.runtime
        }
      }
    };
  }

  // === FUNÇÃO FALLBACK ===
  function fallbackResponse(ssv, error) {
    console.log('⚠️ GitHub fallback activated:', error.message);

    return {
      success: false,
      output: "⚠️ GitHub indisponível - usando fallback",
      error: error.message,
      query_received: ssv.request_data.query,
      agent_id_received: ssv.request_data.agent_id,

      // === FALLBACK DATA ===
      agent_info: {
        agent_name: "Fallback Agent",
        description: "Fallback response when GitHub is unavailable"
      },

      metadata: {
        github_integration: false,
        fallback_mode: true,
        error_type: error.name
      }
    };
  }

  // === EXECUÇÃO PRINCIPAL ===

  // 1. Buscar CSV registry do GitHub
  const csvUrl = ssv.workflow_config.registry_csv_url;
  console.log(`📋 Loading CSV from: ${csvUrl}`);
  const csvResponse = await fetchFromGitHub(csvUrl);

  // 2. Parse CSV e fazer lookup
  const agentRow = findAgentInCSV(csvResponse, ssv.request_data.agent_id);

  // 3. Carregar config específico
  console.log(`⚙️ Loading config from: ${agentRow.config_url}`);
  const configResponse = await fetchFromGitHub(agentRow.config_url);

  // 4. Montar response com dados reais
  const realResponse = buildRealResponse(ssv, agentRow, configResponse);

  console.log('✅ GitHub integration successful!');
  return [{ json: realResponse }];

} catch (error) {
  console.log('❌ GitHub integration failed:', error.message);

  // Fallback caso GitHub indisponível
  const fallbackResp = fallbackResponse(ssv, error);
  return [{ json: fallbackResp }];
}
```

## **⚡ CARACTERÍSTICAS:**

- **Zero código hardcoded**
- **Busca real do GitHub**
- **CSV registry dinâmico**
- **Config loading real**
- **Fallback automático**
- **Debug completo**

## **🎯 TESTE:**

Input:
```json
{
  "project_id": "micro_test",
  "agent_id": "agent_micro_test",
  "ID_workflow": "MICRO_TEST_001",
  "query": "teste busca GitHub real"
}
```

Output esperado:
```json
{
  "success": true,
  "output": "✅ Response carregado do GitHub!",
  "agent_info": {
    "agent_name": "Micro Test Agent",
    "description": "Agent para testar GitHub-First integration"
  },
  "metadata": {
    "github_integration": true,
    "config_loaded_from_github": true,
    "csv_registry_accessed": true
  }
}
```