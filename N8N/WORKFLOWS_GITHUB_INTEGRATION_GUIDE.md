# 🚀 WORKFLOWS - GUIA DE INTEGRAÇÃO GITHUB

**Data:** 07/10/2025
**Estratégia:** 100% código no GitHub, workflows apenas carregam e executam

---

## 🎯 ARQUITETURA

```
GitHub Repository (Code)
    ↓ HTTP GET
N8N Workflows (Execution)
    ↓ CRUD
Data Tables (Storage)
    ↓ JSON
Frontend (UI)
```

---

## 📦 COMPONENTES NO GITHUB

### **Base URL:**
```
https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/N8N/code
```

### **Componentes:**

| Arquivo | Path | Função |
|---------|------|--------|
| **agent-data-mapper.js** | `/processors/agent-data-mapper.js` | INSERT agents com auto-geração URLs |
| **project-data-mapper.js** | `/processors/project-data-mapper.js` | INSERT projects com validação |
| **agent-query-helper.js** | `/helpers/agent-query-helper.js` | GET agents com filtros |
| **project-query-helper.js** | `/helpers/project-query-helper.js` | GET projects com filtros |

---

## 🔧 CODE NODES (Carregadores)

Todos os 4 workflows usam o mesmo padrão de carregamento:

### **Template Padrão:**

```javascript
// ========================================
// LOAD & EXECUTE FROM GITHUB
// ========================================

const GITHUB_BASE = 'https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/N8N/code';

try {
  // 1. Carregar componente
  const code = await this.helpers.httpRequest({
    method: 'GET',
    url: `${GITHUB_BASE}/PATH/COMPONENT.js`,
    returnFullResponse: false
  });

  // 2. Executar (cria funções)
  eval(code);

  // 3. Usar funções
  const result = await FUNCTION_NAME(params, $);

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

---

## 📋 WORKFLOWS

### **1. INSERT AGENT**

**Endpoint:** `POST /insert_agent`

**Estrutura:**
```
Webhook POST
  ↓
Code Node (carrega agent-data-mapper.js)
  ↓
Data Table INSERT (agents)
  ↓
Data Table GET (agents) - confirmação
  ↓
Respond to Webhook
```

**Code Node:**
```javascript
const GITHUB_BASE = 'https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/N8N/code';

try {
  const code = await this.helpers.httpRequest({
    method: 'GET',
    url: `${GITHUB_BASE}/processors/agent-data-mapper.js`,
    returnFullResponse: false
  });

  eval(code);

  const webhookData = $input.item.json.body || $input.item.json;
  const mappedData = await mapAgentData(webhookData, $);

  console.log('[INSERT_AGENT] Success:', mappedData.agent_id);

  return { json: mappedData };

} catch (error) {
  console.error('[INSERT_AGENT] ERROR:', error.message);

  return {
    json: {
      error: true,
      message: error.message,
      constraint_violation: error.constraint_violation,
      suggestion: error.suggestion,
      existing_agent: error.existing_agent
    }
  };
}
```

**Payload:**
```json
{
  "agent_id": "agent_004",
  "project_id": "project_001",
  "agent_type": "tax_calculator",
  "agent_name": "Tax Calculator Agent",
  "description": "Calculadora fiscal automática"
}
```

**Response Success:**
```json
{
  "agent_id": "agent_004",
  "project_id": "project_001",
  "agent_name": "Tax Calculator Agent",
  "agent_type": "tax_calculator",
  "github_config_url": "https://github.com/.../agent_004/config.json",
  "github_prompts_url": "https://github.com/.../agent_004_prompts.json",
  "status": "active",
  "is_latest": true,
  "version": 1,
  "created_at": "2025-10-07T14:30:00.000Z"
}
```

**Response Error:**
```json
{
  "error": true,
  "message": "❌ Agent agent_004 already exists in project_001 with is_latest=true",
  "constraint_violation": "DUPLICATE_LATEST",
  "suggestion": "Use UPDATE operation or mark existing as inactive first",
  "existing_agent": {
    "id": 12,
    "version": 1,
    "created_at": "2025-10-06T10:00:00.000Z"
  }
}
```

---

### **2. INSERT PROJECT**

**Endpoint:** `POST /insert_project`

**Estrutura:**
```
Webhook POST
  ↓
Code Node (carrega project-data-mapper.js)
  ↓
Data Table INSERT (cad_projects)
  ↓
Data Table GET (cad_projects) - confirmação
  ↓
Respond to Webhook
```

**Code Node:**
```javascript
const GITHUB_BASE = 'https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/N8N/code';

try {
  const code = await this.helpers.httpRequest({
    method: 'GET',
    url: `${GITHUB_BASE}/processors/project-data-mapper.js`,
    returnFullResponse: false
  });

  eval(code);

  const webhookData = $input.item.json.body || $input.item.json;
  const mappedData = await mapProjectData(webhookData, $);

  console.log('[INSERT_PROJECT] Success:', mappedData.project_id);

  return { json: mappedData };

} catch (error) {
  console.error('[INSERT_PROJECT] ERROR:', error.message);

  return {
    json: {
      error: true,
      message: error.message,
      constraint_violation: error.constraint_violation,
      suggestion: error.suggestion,
      existing_project: error.existing_project
    }
  };
}
```

**Payload:**
```json
{
  "project_id": "project_002",
  "project_name": "Projeto Teste",
  "description": "Projeto para testes",
  "owner_email": "teste@uptax.net",
  "status": "active",
  "repository_url": "https://github.com/Uptax-creator/N8N-Research-Agents",
  "branch": "development",
  "code_base_path": "N8N/code/",
  "prompts_base_path": "N8N/prompts/agents/",
  "agents_base_path": "N8N/agents/",
  "projects_base_path": "N8N/projects/"
}
```

**Response Success:**
```json
{
  "project_id": "project_002",
  "project_name": "Projeto Teste",
  "description": "Projeto para testes",
  "owner_email": "teste@uptax.net",
  "status": "active",
  "repository_url": "https://github.com/Uptax-creator/N8N-Research-Agents",
  "branch": "development",
  "code_base_path": "N8N/code/",
  "prompts_base_path": "N8N/prompts/agents/",
  "agents_base_path": "N8N/agents/",
  "projects_base_path": "N8N/projects/",
  "created_at": "2025-10-07T14:30:00.000Z",
  "updated_at": "2025-10-07T14:30:00.000Z"
}
```

---

### **3. GET AGENT**

**Endpoint:** `GET /get_agentes`

**Query Params:**
- `agent_id` (opcional) - ID do agent
- `project_id` (opcional) - ID do projeto

**Estrutura:**
```
Webhook GET
  ↓
Code Node (carrega agent-query-helper.js)
  ↓
Respond to Webhook
```

**Code Node:**
```javascript
const GITHUB_BASE = 'https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/N8N/code';

try {
  const code = await this.helpers.httpRequest({
    method: 'GET',
    url: `${GITHUB_BASE}/helpers/agent-query-helper.js`,
    returnFullResponse: false
  });

  eval(code);

  const queryParams = $input.item.json.query || {};
  const agent_id = queryParams.agent_id;
  const project_id = queryParams.project_id;

  let result;

  if (agent_id && project_id) {
    // Buscar agent específico
    result = await getAgent($, agent_id, project_id);
    console.log('[GET_AGENT] Found:', result.found);
  } else if (project_id) {
    // Listar agents do projeto
    result = await listAgentsByProject($, project_id);
    console.log('[GET_AGENT] Total:', result.total);
  } else {
    // Listar todos ativos
    result = await listActiveAgents($);
    console.log('[GET_AGENT] Total active:', result.total);
  }

  return { json: result };

} catch (error) {
  console.error('[GET_AGENT] ERROR:', error.message);

  return {
    json: {
      error: true,
      message: error.message
    }
  };
}
```

**Exemplos de Uso:**

```bash
# Buscar agent específico
GET /get_agentes?agent_id=agent_001&project_id=project_001

# Listar agents de um projeto
GET /get_agentes?project_id=project_001

# Listar todos agents ativos
GET /get_agentes
```

**Response Success (agent específico):**
```json
{
  "found": true,
  "message": "✅ Agent agent_001 found",
  "agent": {
    "id": 5,
    "agent_id": "agent_001",
    "project_id": "project_001",
    "agent_name": "Enhanced Research Agent",
    "agent_type": "enhanced_research",
    "github_config_url": "...",
    "status": "active",
    "is_latest": true
  }
}
```

**Response Success (lista):**
```json
{
  "success": true,
  "total": 3,
  "agents": [
    { "agent_id": "agent_001", ... },
    { "agent_id": "agent_002", ... },
    { "agent_id": "agent_003", ... }
  ]
}
```

---

### **4. GET PROJECT**

**Endpoint:** `GET /get_project`

**Query Params:**
- `project_id` (opcional) - ID do projeto

**Estrutura:**
```
Webhook GET
  ↓
Code Node (carrega project-query-helper.js)
  ↓
Respond to Webhook
```

**Code Node:**
```javascript
const GITHUB_BASE = 'https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/N8N/code';

try {
  const code = await this.helpers.httpRequest({
    method: 'GET',
    url: `${GITHUB_BASE}/helpers/project-query-helper.js`,
    returnFullResponse: false
  });

  eval(code);

  const queryParams = $input.item.json.query || {};
  const project_id = queryParams.project_id;

  let result;

  if (project_id) {
    // Buscar project específico
    result = await getProject($, project_id);
    console.log('[GET_PROJECT] Found:', result.found);
  } else {
    // Listar todos ativos
    result = await listActiveProjects($);
    console.log('[GET_PROJECT] Total:', result.total);
  }

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

**Exemplos de Uso:**

```bash
# Buscar project específico
GET /get_project?project_id=project_001

# Listar todos projects ativos
GET /get_project
```

**Response Success (project específico):**
```json
{
  "found": true,
  "message": "✅ Project project_001 found",
  "project": {
    "id": 1,
    "project_id": "project_001",
    "project_name": "UptaxDev Multi-Agent System",
    "repository_url": "https://github.com/Uptax-creator/N8N-Research-Agents",
    "branch": "clean-deployment",
    "status": "active"
  }
}
```

---

## ✅ VANTAGENS DESTA ARQUITETURA

| Aspecto | Benefício |
|---------|-----------|
| **Manutenção** | 1 commit atualiza todos workflows |
| **Versionamento** | Git history completo |
| **Rollback** | `git revert` rápido |
| **Testes** | Branch development separada |
| **Colaboração** | Pull requests + code review |
| **Performance** | Cache GitHub (~200ms primeira vez) |
| **Documentação** | README + CHANGELOG no GitHub |

---

## 🔄 WORKFLOW DE ATUALIZAÇÃO

```bash
# 1. Editar componente localmente
vim N8N/code/processors/agent-data-mapper.js

# 2. Commit
git add N8N/code/processors/agent-data-mapper.js
git commit -m "feat: Add new validation"

# 3. Push
git push origin clean-deployment

# 4. Aguardar ~30s (cache GitHub)

# 5. Testar workflow no N8N
# ✅ Código atualizado automaticamente!
```

---

## 📊 PRÓXIMOS PASSOS

### **Para Você (N8N UI):**
1. [ ] Atualizar Code Node do INSERT AGENT
2. [ ] Atualizar Code Node do INSERT PROJECT
3. [ ] Atualizar Code Node do GET AGENT
4. [ ] Atualizar Code Node do GET PROJECT
5. [ ] Ativar todos workflows
6. [ ] Testar cada endpoint

### **Depois:**
7. [ ] Commit dos componentes no GitHub
8. [ ] Criar testes para Frontend
9. [ ] Documentar URLs dos webhooks

---

## 🚀 RESULTADO FINAL

**Frontend envia:**
```json
{
  "agent_id": "agent_004",
  "project_id": "project_001",
  "agent_type": "tax_calculator"
}
```

**Workflow faz:**
1. Carrega `agent-data-mapper.js` do GitHub
2. Busca configuração do `project_001`
3. Auto-gera URLs GitHub
4. Valida constraint UNIQUE
5. INSERT na Data Table
6. Retorna agent completo

**Resultado:**
```json
{
  "agent_id": "agent_004",
  "github_config_url": "https://github.com/.../agent_004/config.json",
  "github_prompts_url": "https://github.com/.../agent_004_prompts.json",
  "status": "active"
}
```

✅ **100% código no GitHub, manutenção centralizada, workflows sempre atualizados!**
