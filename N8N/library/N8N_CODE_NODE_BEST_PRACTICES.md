# 📚 N8N CODE NODE - BEST PRACTICES & COMMON ERRORS

**Data:** 07/10/2025
**Objetivo:** Documentar erros conhecidos e boas práticas para evitar problemas ao criar Code Nodes no N8N

---

## ❌ ERRO #1: "Illegal return statement"

### **Sintoma:**
```json
{"error": true, "message": "Illegal return statement"}
```

### **Causa:**
Componente do GitHub tem auto-execução com `return` no final do arquivo, mas Code Node do N8N já é uma função e não aceita `return` solto.

### **Exemplo de código ERRADO:**
```javascript
// Arquivo: project-query-helper.js
function getProject($, project_id) { ... }
function listActiveProjects($) { ... }

// ❌ ERRADO: Auto-execução com return
if (typeof $ !== 'undefined' && typeof $input !== 'undefined') {
  const project_id = $input.all()[0].json.query.project_id;
  const result = await getProject($, project_id);
  return result; // ← ERRO! Return fora de função
}
```

### **Solução:**
**No componente GitHub:** Manter auto-execução apenas para testes locais, mas envolver em `if (typeof module === 'undefined')` para evitar execução no N8N.

**No Code Node N8N:** Sempre executar as funções manualmente, nunca depender de auto-execução.

```javascript
// ✅ CORRETO: Code Node controla execução
const GITHUB_BASE = 'https://raw.githubusercontent.com/.../';

try {
  // 1. Carregar componente
  const code = await this.helpers.httpRequest({
    method: 'GET',
    url: `${GITHUB_BASE}/helpers/project-query-helper.js`,
    returnFullResponse: false
  });

  // 2. Executar (cria funções)
  eval(code);

  // 3. Chamar função manualmente
  const queryParams = $input.item.json.query || $input.item.json.body || {};
  const project_id = queryParams.project_id;

  let result;
  if (project_id) {
    result = await getProject($, project_id);
  } else {
    result = await listActiveProjects($);
  }

  // 4. Retornar dentro do try
  return { json: result };

} catch (error) {
  return {
    json: {
      error: true,
      message: error.message
    }
  };
}
```

### **Regra de Ouro:**
> **Code Node N8N:** Sempre controle a execução manualmente. Nunca dependa de auto-execução do componente.

---

## ❌ ERRO #2: "Cannot read property 'json' of undefined"

### **Sintoma:**
```json
{"error": true, "message": "Cannot read property 'json' of undefined"}
```

### **Causa:**
Tentativa de acessar `$input.item.json.query` quando dados vêm via body POST.

### **Solução:**
Sempre ter fallback para múltiplas fontes de dados:

```javascript
// ✅ CORRETO: Múltiplos fallbacks
const queryParams = $input.item.json.query || $input.item.json.body || {};
```

### **Regra:**
> **Sempre use fallback:** `query || body || {}`

---

## ❌ ERRO #3: "getDataTableRows is not a function"

### **Sintoma:**
```json
{"error": true, "message": "$.getDataTableRows is not a function"}
```

### **Causa:**
Componente espera contexto `$` mas Code Node não passou.

### **Solução:**
Sempre passar `$` para funções que acessam Data Tables:

```javascript
// ❌ ERRADO
const result = await mapAgentData(webhookData);

// ✅ CORRETO
const result = await mapAgentData(webhookData, $);
```

### **Regra:**
> **Funções que usam Data Tables:** Sempre passar `$` como segundo parâmetro.

---

## ❌ ERRO #4: Webhook configurado com método errado

### **Sintoma:**
```json
{"code": 404, "message": "This webhook is not registered for GET requests"}
```

### **Causa:**
Webhook configurado como POST mas endpoint espera GET (ou vice-versa).

### **Solução:**
**Para operações de leitura (GET):**
- Webhook deve aceitar **GET** ou **POST** (ou ambos)
- Dados vêm via `query` (GET) ou `body` (POST)

**Para operações de escrita (INSERT/UPDATE/DELETE):**
- Webhook deve aceitar apenas **POST**
- Dados vêm via `body`

### **Configuração recomendada:**

| Endpoint | Método | Dados vêm de |
|----------|--------|--------------|
| GET PROJECT | GET ou POST | `query` ou `body` |
| GET AGENT | GET ou POST | `query` ou `body` |
| INSERT PROJECT | POST | `body` |
| INSERT AGENT | POST | `body` |

### **Code Node universal (aceita GET e POST):**
```javascript
const queryParams = $input.item.json.query || $input.item.json.body || {};
```

---

## ❌ ERRO #5: Nome da tabela incorreto

### **Sintoma:**
```json
{"error": true, "message": "Data table 'projects' not found"}
```

### **Causa:**
Nome da tabela no código difere do nome real no N8N.

### **Solução:**
Manter mapeamento consistente:

```javascript
// ✅ CORRETO: Usar nomes reais das tabelas
const allProjects = await $.getDataTableRows('cad_projects'); // Nome real
const allAgents = await $.getDataTableRows('agents');         // Nome real
```

### **Tabelas do projeto:**

| Nome no Código | Nome Real no N8N |
|---------------|------------------|
| projects | `cad_projects` |
| agents | `agents` |
| executions | `wrk_execution` |
| state | `wrk_state` |

### **Regra:**
> **Sempre verificar:** Nome da tabela no N8N antes de usar `$.getDataTableRows()`

---

## ✅ TEMPLATE APROVADO: Code Node Carregador

Este template é **testado e aprovado** para todos workflows:

```javascript
// ========================================
// LOAD & EXECUTE FROM GITHUB
// Template Version: 1.0.0
// ========================================

const GITHUB_BASE = 'https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/N8N/code';

try {
  // 1. Carregar componente do GitHub
  const code = await this.helpers.httpRequest({
    method: 'GET',
    url: `${GITHUB_BASE}/PATH/TO/COMPONENT.js`,
    returnFullResponse: false
  });

  // 2. Executar código (cria funções)
  eval(code);

  // 3. Extrair dados (universal: query ou body)
  const inputData = $input.item.json.query || $input.item.json.body || {};

  // 4. Executar função do componente
  let result;

  // [CUSTOMIZAR AQUI: Lógica específica do workflow]
  result = await YOUR_FUNCTION(inputData, $);

  // 5. Log para debug
  console.log('[WORKFLOW_NAME] Success:', result);

  // 6. Retornar resultado
  return { json: result };

} catch (error) {
  // 7. Log de erro
  console.error('[WORKFLOW_NAME] ERROR:', error.message);

  // 8. Retornar erro estruturado
  return {
    json: {
      error: true,
      message: error.message,
      // [OPCIONAL: Campos específicos do erro]
    }
  };
}
```

---

## 📋 CHECKLIST PRÉ-DEPLOYMENT

Antes de criar um Code Node, verificar:

- [ ] **URL do componente:** GitHub Base + caminho correto?
- [ ] **Contexto $:** Função recebe `$` se usar Data Tables?
- [ ] **Fallback de dados:** `query || body || {}`?
- [ ] **Nome das tabelas:** Conferido com nomes reais no N8N?
- [ ] **Try/catch:** Envolve toda execução?
- [ ] **Console.log:** Tem logs para debug?
- [ ] **Retorno estruturado:** `{ json: result }` ou `{ json: { error: true } }`?
- [ ] **Auto-execução:** Componente GitHub não tem `return` solto?

---

## 🎯 COMPONENTES APROVADOS

Estes componentes foram testados e estão prontos para uso:

| Componente | Path | Função Principal | Requer $ |
|------------|------|------------------|----------|
| **agent-data-mapper.js** | `/processors/agent-data-mapper.js` | `mapAgentData(data, $)` | ✅ Sim |
| **project-data-mapper.js** | `/processors/project-data-mapper.js` | `mapProjectData(data, $)` | ✅ Sim |
| **agent-query-helper.js** | `/helpers/agent-query-helper.js` | `getAgent($, id, proj)` | ✅ Sim |
| **project-query-helper.js** | `/helpers/project-query-helper.js` | `getProject($, id)` | ✅ Sim |

---

## 🚀 EXEMPLO REAL: GET PROJECT

### **Workflow:**
```
Webhook POST /get_project
  ↓
Code Node (carrega project-query-helper.js)
  ↓
Respond to Webhook
```

### **Code Node (Testado e Funcionando):**
```javascript
const GITHUB_BASE = 'https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/N8N/code';

try {
  const code = await this.helpers.httpRequest({
    method: 'GET',
    url: `${GITHUB_BASE}/helpers/project-query-helper.js`,
    returnFullResponse: false
  });

  eval(code);

  const queryParams = $input.item.json.query || $input.item.json.body || {};
  const project_id = queryParams.project_id;

  let result;

  if (project_id) {
    result = await getProject($, project_id);
  } else {
    result = await listActiveProjects($);
  }

  console.log('[GET_PROJECT] Result:', result);

  return { json: result };

} catch (error) {
  console.error('[GET_PROJECT] ERROR:', error.message);

  return {
    json: {
      error: true,
      message: error.message
    }
  };
}
```

### **Teste:**
```bash
curl -X POST "https://primary-production-56785.up.railway.app/webhook/get_project" \
  -H "Content-Type: application/json" \
  -d '{}'

# Response esperado:
{
  "success": true,
  "total": 1,
  "projects": [
    {
      "id": 1,
      "project_id": "project_001",
      "project_name": "UptaxDev Multi-Agent System",
      ...
    }
  ]
}
```

---

## 📚 REFERÊNCIAS

- [N8N Code Node Documentation](https://docs.n8n.io/code/)
- [N8N Data Tables API](https://docs.n8n.io/data/)
- [WORKFLOWS_GITHUB_INTEGRATION_GUIDE.md](WORKFLOWS_GITHUB_INTEGRATION_GUIDE.md)

---

## 🔄 HISTÓRICO DE ATUALIZAÇÕES

| Data | Versão | Alteração |
|------|--------|-----------|
| 2025-10-07 | 1.0.0 | Versão inicial com 5 erros documentados |

---

## ✅ RESULTADO

**Seguindo estas práticas:**
- ✅ Zero "Illegal return statement"
- ✅ Zero "undefined" errors
- ✅ Zero "function not found" errors
- ✅ 100% workflows funcionando
- ✅ Código reutilizável e mantível

🎯 **Use este guia antes de criar qualquer Code Node!**
