# 🧪 TEMPLATE DE TESTE PARAMETRIZADO

## **OBJETIVO:**
Acelerar testes de nodes N8N com dados parametrizáveis e validação automática

## **ARQUIVO CRIADO:**
`/templates/evaluation-node-test.json`

## **COMO USAR:**

### **1. Import no N8N**
- Abrir N8N UI
- Import workflow: `evaluation-node-test.json`
- Configurar Custom Variables se necessário

### **2. Parametrização via Variables**
```javascript
// N8N Custom Variables ($vars)
TEST_QUERY = "Teste de pesquisa sobre IA no Brasil"
WEBHOOK_URL = "https://primary-production-56785.up.railway.app/webhook/work-1001"
UPTAX_GITHUB_BASE = "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment"
UPTAX_CACHE_TTL_MS = "300000"
DEFAULT_TIMEOUT = "10000"
```

### **3. Execução Rápida**
- **Manual execution** do template
- **Pin Data** já configurado para teste básico
- **Resultados imediatos** com validação

## **ESTRUTURA DO TEMPLATE:**

### **Node 1: Test Data Generator** (Evaluation)
- Gera dados parametrizáveis
- Usa `$vars` para configuração
- Input fixo para teste rápido

### **Node 2: Context Builder Test** (Code)
- Testa logic do Context Builder
- Valida URLs dinâmicas
- Debug detalhado

### **Node 3: Config Loader Test** (HTTP Request)
- Testa conectividade GitHub
- Carrega config.json do agent
- Continue on fail para debug

### **Node 4: Validation & Results** (Code)
- Consolida resultados
- Validation automática
- Debug completo

## **CASOS DE TESTE RÁPIDOS:**

### **Teste 1: Conectividade Básica**
```json
{
  "project_id": "project_001",
  "agent_id": "agent_001",
  "query": "teste conectividade"
}
```

### **Teste 2: Agent Inexistente**
```json
{
  "project_id": "project_001",
  "agent_id": "agent_999",
  "query": "teste fallback"
}
```

### **Teste 3: Performance**
```json
{
  "project_id": "project_001",
  "agent_id": "agent_001",
  "query": "teste performance",
  "timeout": "5000"
}
```

## **RESULTADOS ESPERADOS:**

### ✅ **Sucesso:**
```json
{
  "context_valid": true,
  "config_loaded": true,
  "test_results": {
    "session_created": "project_001_agent_001_1727285234567",
    "urls_generated": {
      "config": "https://raw.githubusercontent.com/.../config.json",
      "prompt": "https://raw.githubusercontent.com/.../prompt.json"
    },
    "config_status": "SUCCESS",
    "config_data": { /* agent config */ }
  }
}
```

### ❌ **Falha:**
```json
{
  "context_valid": true,
  "config_loaded": false,
  "test_results": {
    "config_status": "FAILED",
    "config_data": { "error": "404 Not Found" }
  }
}
```

## **VANTAGENS:**

### ⚡ **Teste Rápido**
- **30 segundos** para validar configuração
- **Sem dependencies** complexas
- **Pin Data** para execução imediata

### 🔧 **Parametrizável**
- **Variables** customizáveis
- **Multiple scenarios** fáceis
- **Debug detalhado** incluído

### 📊 **Validation Automática**
- **Status checks** automáticos
- **Error detection** clara
- **Performance metrics** básicos

## **PRÓXIMOS PASSOS:**

1. **Import template** no N8N
2. **Execute teste básico** com Pin Data
3. **Ajustar variables** se necessário
4. **Testar scenarios** diferentes
5. **Usar resultados** para debug do workflow principal

**Este template economiza tempo identificando problemas rapidamente antes de testar o workflow completo!** ⚡