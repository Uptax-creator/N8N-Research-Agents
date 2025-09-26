# 🎯 PLANO MICRO ATIVIDADE - GITHUB-FIRST REAL

## **📋 OBJETIVO DA MICRO ATIVIDADE:**

Substituir o mock atual por busca GitHub real, mantendo apenas **código de busca** no Node 2.

---

## **🔄 ETAPAS DE IMPLEMENTAÇÃO:**

### **ETAPA 1: Criar Agent Config no GitHub**
- Arquivo: `/configs/agents/agent_001_micro_test.json`
- Contém: configuração real para teste

### **ETAPA 2: Atualizar CSV Registry**
- Arquivo: `/assembly-logic/agents-registry-micro.csv`
- Adicionar: entrada para micro teste

### **ETAPA 3: Node 2 - Busca GitHub Real**
- Substituir mock por busca real
- Carregar CSV → Config → Response
- **Zero lógica hardcoded**

### **ETAPA 4: Teste End-to-End**
- Webhook com agent_id específico
- Validar dados vindos do GitHub
- Comparar com baseline

---

## **📁 ARQUIVOS A CRIAR:**

### **1. Agent Config (GitHub)**
```json
{
  "agent_id": "agent_micro_test",
  "agent_name": "Micro Test Agent",
  "agent_type": "micro_test",
  "description": "Agent para testar GitHub-First integration",
  "system_message": "Você é um agente de teste para validar integração GitHub-First.",
  "specialization": "Testing GitHub integration",
  "mcp_endpoints": [
    {
      "name": "test_endpoint",
      "url": "https://api.example.com/test",
      "type": "test"
    }
  ],
  "version": "micro-v1.0",
  "github_integration": true
}
```

### **2. CSV Registry Entry**
```csv
agent_micro_test,Micro Test Agent,GitHub integration testing,MICRO_TEST_001,https://raw.githubusercontent.com/.../agent_001_micro_test.json,https://raw.githubusercontent.com/.../micro_test_prompts.json,https://api.example.com/test,test_type,active
```

### **3. Node 2 - GitHub Loader Real**
```javascript
// 🔍 GITHUB LOADER REAL - Micro Test
// Apenas busca GitHub, zero hardcode

const ssv = $input.item.json;

console.log('🔍 GitHub Loader Real - Starting...');

try {
  // 1. Buscar CSV registry do GitHub
  const csvUrl = ssv.workflow_config.registry_csv_url;
  const csvResponse = await fetchFromGitHub(csvUrl);

  // 2. Parse CSV e fazer lookup
  const agentRow = findAgentInCSV(csvResponse, ssv.request_data.agent_id);

  // 3. Carregar config específico
  const configResponse = await fetchFromGitHub(agentRow.config_url);

  // 4. Montar response com dados reais
  const realResponse = buildRealResponse(ssv, agentRow, configResponse);

  return [{ json: realResponse }];

} catch (error) {
  // Fallback caso GitHub indisponível
  return [{ json: fallbackResponse(ssv, error) }];
}

// Funções auxiliares (também no GitHub)
```

---

## **🧪 TESTE DA MICRO ATIVIDADE:**

### **Input:**
```json
{
  "project_id": "micro_test",
  "agent_id": "agent_micro_test",
  "ID_workflow": "MICRO_TEST_001",
  "query": "teste busca GitHub real"
}
```

### **Output Esperado:**
```json
{
  "success": true,
  "output": "Response carregado do GitHub!",
  "agent_info": {
    "agent_name": "Micro Test Agent",  // ← Do GitHub
    "description": "Agent para testar GitHub-First integration"  // ← Do GitHub
  },
  "metadata": {
    "github_integration": true,
    "config_loaded_from_github": true,
    "csv_registry_accessed": true
  }
}
```

---

## **⚡ IMPLEMENTAÇÃO IMEDIATA:**

### **1. Primeiro - Criar configs no GitHub**
### **2. Segundo - Commit e push**
### **3. Terceiro - Atualizar Node 2**
### **4. Quarto - Testar micro atividade**

---

## **🎯 CRITÉRIO DE SUCESSO:**

✅ Response mostra dados do GitHub
✅ CSV registry acessado dinamicamente
✅ Config carregado do GitHub
✅ Zero código hardcoded no Node 2
✅ Workflow mantém funcionamento end-to-end

**Pronto para implementar a micro atividade?**