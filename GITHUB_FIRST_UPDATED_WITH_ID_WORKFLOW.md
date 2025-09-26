# 🔄 GITHUB-FIRST ARCHITECTURE - ATUALIZAÇÃO ID_WORKFLOW

## **💡 MUDANÇA APROVADA**

**ANTES**: `agent_type: "enhanced_research"` (string genérica)
**DEPOIS**: `ID_workflow: "scJSDgRWiHTkfNUn"` (ID real do N8N)

---

## **📊 ESTRUTURA ATUALIZADA**

### **SSV Variables Structure (UPDATED):**
```javascript
{
  workflow_config: {
    version: "github-first-v2.0",
    github_base: $vars.UPTAX_GITHUB_BASE,
    registry_csv_url: "${github_base}/assembly-logic/agents-registry.csv"
  },

  request_data: {
    project_id: "project_001",
    agent_id: "agent_001",
    ID_workflow: "scJSDgRWiHTkfNUn",  // ← NEW: Real N8N workflow ID
    query: "user query text",
    session_id: "project_001_agent_001_1234567890"
  },

  runtime: {
    workflow_id: "scJSDgRWiHTkfNUn",  // ← Match ID_workflow
    n8n_execution_id: $executionId
  }
}
```

### **CSV Registry Structure (UPDATED):**
```csv
agent_id,agent_name,specialization,ID_workflow,config_url,prompts_url,mcp_endpoint,mcp_type,status
agent_001,enhanced_research,Brazilian market research,scJSDgRWiHTkfNUn,https://raw.githubusercontent.com/.../config.json,https://raw.githubusercontent.com/.../prompts.json,https://mcp.brightdata.com/sse,bright_data,active
agent_002,fiscal_research,Brazilian fiscal research,kL9MpQwRtY8NxVc2,https://raw.githubusercontent.com/.../config.json,https://raw.githubusercontent.com/.../prompts.json,https://mcp.brightdata.com/sse,bright_data,active
agent_003,gdocs_documentation,Google Docs research,mN4BpXzK7LqR9wE5,https://raw.githubusercontent.com/.../config.json,https://raw.githubusercontent.com/.../prompts.json,https://apollo-3irns8zl6-composio.vercel.app,uptax_gdocs,active
```

---

## **🔧 CÓDIGO ATUALIZADO**

### **Variables Setup Node (UPDATED):**
```javascript
// Node Name: SSV Variables Setup
const webhookData = $input.item.json.body || {};

return [{
  json: {
    workflow_config: {
      version: "github-first-v2.1",
      github_base: $vars.UPTAX_GITHUB_BASE || "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment",
      registry_csv_url: `${$vars.UPTAX_GITHUB_BASE}/assembly-logic/agents-registry.csv`
    },

    request_data: {
      project_id: webhookData.project_id || "project_001",
      agent_id: webhookData.agent_id || "agent_001",
      ID_workflow: webhookData.ID_workflow || "scJSDgRWiHTkfNUn",  // ← NEW FIELD
      query: webhookData.query || "Default query",
      session_id: `${webhookData.project_id || 'project_001'}_${webhookData.agent_id || 'agent_001'}_${Date.now()}`
    },

    runtime: {
      workflow_id: webhookData.ID_workflow || "scJSDgRWiHTkfNUn",  // ← Match ID_workflow
      n8n_execution_id: $executionId || 'local_test'
    }
  }
}];
```

### **GitHub Processor Lookup (UPDATED):**
```javascript
// Universal Processor Logic
async function executeWorkflow(ssv) {
  // Load CSV registry
  const csvUrl = ssv.workflow_config.registry_csv_url;
  const csvResponse = await fetch(csvUrl);
  const csvText = await csvResponse.text();
  const csvData = parseCSV(csvText);

  // Lookup by ID_workflow (instead of agent_type)
  const workflowRow = csvData.find(row =>
    row.ID_workflow === ssv.request_data.ID_workflow
  );

  if (!workflowRow) {
    throw new Error(`Workflow not found: ${ssv.request_data.ID_workflow}`);
  }

  console.log('🎯 Workflow found:', workflowRow.agent_name, workflowRow.ID_workflow);

  // Load configs using URLs from CSV
  const config = await fetch(workflowRow.config_url).then(r => r.json());
  const prompts = await fetch(workflowRow.prompts_url).then(r => r.json());

  // Continue with AI Agent processing...
}
```

---

## **🧪 TEST REQUEST (UPDATED):**

```bash
curl -X POST "https://primary-production-56785.up.railway.app/webhook/work-1001v1" \
-H "Content-Type: application/json" \
-d '{
  "project_id": "project_001",
  "agent_id": "agent_001",
  "ID_workflow": "scJSDgRWiHTkfNUn",
  "query": "teste com ID_workflow real"
}'
```

---

## **💡 BENEFÍCIOS DA MUDANÇA:**

### **1. Precisão Total**
- **ID único** garante workflow correto
- **Zero ambiguidade** na identificação
- **Rastreabilidade** N8N nativa

### **2. Flexibilidade Avançada**
```csv
agent_001,enhanced_research_v1,Research v1,scJSDgRWiHTkfNUn,config_v1.json,active
agent_001,enhanced_research_v2,Research v2,kL9MpQwRtY8NxVc2,config_v2.json,active
agent_001,enhanced_research_test,Research test,mN4BpXzK7LqR9wE5,config_test.json,testing
```

### **3. N8N Integration**
- **API calls** diretos por ID
- **Workflow status** monitoring
- **Execution history** tracking

---

## **🔄 MIGRATION IMPACT:**

### **Files to Update:**
1. ✅ **SSV Variables Setup** → Add ID_workflow field
2. ✅ **GitHub Processor** → Lookup by ID_workflow
3. ✅ **CSV Registry** → Add ID_workflow column
4. ✅ **Test requests** → Include ID_workflow

### **Backward Compatibility:**
```javascript
// Support both old and new format
const workflowId = ssv.request_data.ID_workflow ||
                  ssv.request_data.agent_type ||
                  "scJSDgRWiHTkfNUn"; // default
```

---

**✅ MUDANÇA APROVADA: agent_type → ID_workflow**
**Benefício**: Identificação precisa dos workflows N8N
**Impacto**: Mínimo (backward compatible)
**Próximo**: Implementar nos códigos dos 3 nodes**