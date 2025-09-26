# 🔧 NODE 1 CORRETO - Variables Setup (Set Node)

## **📋 CÓDIGO PARA NODE 1 (Set Node):**

```javascript
// 🏗️ SSV VARIABLES SETUP - Final Correto
// Para Set Node apenas

const webhookData = $input.item.json.body || {};

console.log('🏗️ SSV Variables Setup - Final');
console.log('📥 Webhook input:', JSON.stringify(webhookData, null, 2));

return [{
  json: {
    // === WORKFLOW CONFIG ===
    workflow_config: {
      version: "github-first-v2.3",
      github_base: "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment",
      registry_csv_url: "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/assembly-logic/agents-registry-updated.csv",
      cache_enabled: true,
      cache_ttl_ms: 300000,
      processor_type: "universal_github",
      processor_url: "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/processors/universal-workflow-processor.js"
    },

    // === REQUEST DATA ===
    request_data: {
      project_id: webhookData.project_id || "project_001",
      agent_id: webhookData.agent_id || "agent_001",
      ID_workflow: webhookData.ID_workflow || "scJSDgRWiHTkfNUn",
      query: webhookData.query || "Default test query",
      session_id: `${webhookData.project_id || 'project_001'}_${webhookData.agent_id || 'agent_001'}_${Date.now()}`,
      timestamp: new Date().toISOString()
    },

    // === RUNTIME CONTEXT ===
    runtime: {
      workflow_id: webhookData.ID_workflow || "scJSDgRWiHTkfNUn",
      n8n_execution_id: $executionId || 'local_test',
      processing_step: "variables_setup_completed",
      debug_mode: true,
      node_count: 3,
      architecture: "github_first"
    }
  }
}];
```

## **⚠️ IMPORTANTE:**
- Este código é para **Set Node** (não Code Node)
- **SEM $http** ou outras funções de Code Node
- Apenas preparação de dados