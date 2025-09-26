# 🏗️ MVP - Node 1: SSV Variables Setup

## **Tipo de Node**: Set Node

## **Nome do Node**: `SSV Variables Setup`

## **Código para copiar:**

```javascript
// 🏗️ SSV VARIABLES SETUP - MVP TEST CORRIGIDO
// Usar $input diretamente para evitar erro de referência

const webhookData = $input.item.json.body || {};

return [{
  json: {
    // === WORKFLOW CONFIG (UI JSON) ===
    workflow_config: {
      version: "mvp-v1.0",
      github_base: "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment",
      cache_enabled: false,
      debug_mode: true,
      processor_type: "fixed_code_mvp"
    },

    // === REQUEST DATA ===
    request_data: {
      project_id: webhookData.project_id || "mvp_test",
      agent_id: webhookData.agent_id || "test_agent",
      query: webhookData.query || "teste do fluxo SSV variables",
      session_id: `mvp_${Date.now()}`,
      timestamp: new Date().toISOString()
    },

    // === RUNTIME CONTEXT ===
    runtime: {
      workflow_id: "work-1001-mvp",
      step: "variables_setup_completed",
      n8n_node_count: 3,
      test_mode: true
    }
  }
}];
```

## **Conexões:**
- **Input**: Webhook_Work_1001
- **Output**: Fixed Processor MVP