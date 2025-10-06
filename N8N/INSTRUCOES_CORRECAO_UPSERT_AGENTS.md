# 🔧 CORREÇÃO DO UPSERT DE AGENTS

## ❌ PROBLEMA ATUAL

O workflow está fazendo **UPDATE sempre**, sobrescrevendo o mesmo registro (id: 5) em vez de criar novos registros para agent_002 e agent_003.

**Causa:** Os filtros `agent_id` + `project_id` não estão funcionando corretamente para UPSERT no N8N Data Table node.

---

## ✅ SOLUÇÃO: USAR OPERATION "INSERT" EM VEZ DE "UPSERT"

Como estamos inserindo **agents diferentes** (agent_001, agent_002, agent_003), e eles têm `agent_id` único, devemos usar **INSERT** direto.

### **Mudança no Workflow:**

**Node: "Update Agents"**

**ANTES (❌ UPSERT sobrescrevendo):**
```json
{
  "operation": "upsert",
  "filters": {
    "conditions": [
      { "keyName": "agent_id", "keyValue": "={{ $json.agent_id }}" },
      { "keyName": "project_id", "keyValue": "={{ $json.project_id }}" }
    ]
  }
}
```

**DEPOIS (✅ INSERT criando novas linhas):**
```json
{
  "operation": "insert"
  // Remover bloco "filters" completamente
}
```

---

## 📋 PASSO A PASSO

### **1. No N8N, abra o workflow**

### **2. Clique no node "Update Agents"**

### **3. Mude a operação:**
- **Operation:** `UPSERT` → mude para **`INSERT`**

### **4. Remova os filtros:**
- Delete o bloco completo de **Filters/Conditions**

### **5. Mantenha:**
- ✅ `mappingMode: "autoMapInputData"`
- ✅ Schema com todos os campos
- ✅ Data Table: `agents`

### **6. Salve o workflow**

### **7. Desative e reative o workflow** (toggle)

---

## 🧪 TESTE

Depois de fazer a mudança, execute:

```bash
# Deletar registros existentes manualmente na UI do N8N Data Tables
# (ou usar operation DELETE via workflow)

# Inserir agent_001
curl -X POST https://primary-production-56785.up.railway.app/webhook/data-table-crud \
  -H "Content-Type: application/json" \
  -d '{"agent_id":"agent_001","project_id":"project_001",...}'

# Inserir agent_002
curl -X POST https://primary-production-56785.up.railway.app/webhook/data-table-crud \
  -H "Content-Type: application/json" \
  -d '{"agent_id":"agent_002","project_id":"project_001",...}'

# Inserir agent_003
curl -X POST https://primary-production-56785.up.railway.app/webhook/data-table-crud \
  -H "Content-Type: application/json" \
  -d '{"agent_id":"agent_003","project_id":"project_001",...}'
```

**Resultado esperado:**
```json
[
  { "id": 6, "agent_id": "agent_001", ... },
  { "id": 7, "agent_id": "agent_002", ... },
  { "id": 8, "agent_id": "agent_003", ... }
]
```

Cada agent terá um **id único** e **não sobrescreverá** os outros.

---

## 🔄 QUANDO USAR UPSERT?

UPSERT é útil quando você quer **atualizar um agent existente**:

**Exemplo:** Atualizar webhook_url do agent_001:

```bash
curl -X POST https://primary-production-56785.up.railway.app/webhook/data-table-crud \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "agent_001",
    "project_id": "project_001",
    "webhook_url": "https://new-url.com/webhook"
  }'
```

Para isso funcionar, você precisaria:
1. Usar operation **UPSERT**
2. Configurar filtros corretamente: `agent_id` + `project_id`
3. N8N buscaria o registro existente e atualizaria apenas os campos fornecidos

---

## 📝 RESUMO

**Para inserir agents novos (001, 002, 003):**
- ✅ Use **INSERT**
- ✅ Remova filtros
- ✅ Cada agent terá id único

**Para atualizar agents existentes:**
- ✅ Use **UPSERT**
- ✅ Configure filtros: `agent_id` + `project_id`
- ✅ N8N encontra e atualiza o registro

---

## ✅ PRÓXIMOS PASSOS

1. Mudar operation para INSERT
2. Remover filtros
3. Salvar e reativar workflow
4. Limpar tabela agents (deletar registros existentes)
5. Testar inserção dos 3 agents
6. Validar que cada um tem id único
