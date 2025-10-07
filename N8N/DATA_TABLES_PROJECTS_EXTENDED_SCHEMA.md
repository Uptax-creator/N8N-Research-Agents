# 📊 DATA TABLES - PROJECTS EXTENDED SCHEMA

## 🎯 OBJETIVO

Adicionar campos de configuração GitHub à tabela `projects` para permitir URLs variáveis por projeto, centralizando a configuração de repositórios e caminhos base.

---

## 📋 SCHEMA COMPLETO: `projects`

### **Campos Existentes (NÃO ALTERAR)**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | number | Auto | Auto-incrementado pelo N8N |
| project_id | string | ✅ | Identificador único (ex: project_001) |
| project_name | string | ✅ | Nome do projeto |
| description | string | ❌ | Descrição do projeto |
| owner_email | string | ❌ | Email do responsável |
| status | string | ✅ | active, inactive, archived |
| created_at | datetime | ✅ | Data de criação |
| updated_at | datetime | ❌ | Data de atualização |

### **Campos NOVOS (Adicionar no N8N UI)**

| Campo | Tipo | Obrigatório | Descrição | Exemplo |
|-------|------|-------------|-----------|---------|
| **repository_url** | string | ✅ | URL base do repositório GitHub | `https://github.com/Uptax-creator/N8N-Research-Agents` |
| **branch** | string | ✅ | Branch ativa do repositório | `clean-deployment` |
| **code_base_path** | string | ✅ | Caminho dos códigos (loaders/processors) | `N8N/code/` |
| **prompts_base_path** | string | ✅ | Caminho dos prompts | `N8N/prompts/agents/` |
| **agents_base_path** | string | ✅ | Caminho dos agents (configs) | `N8N/agents/` |
| **projects_base_path** | string | ✅ | Caminho dos projects | `N8N/projects/` |

---

## 🎯 VANTAGENS

### **1. URLs Variáveis por Projeto**
```javascript
// Projeto 1: Produção
{
  "project_id": "project_001",
  "repository_url": "https://github.com/Uptax-creator/N8N-Research-Agents",
  "branch": "clean-deployment"
}

// Projeto 2: Desenvolvimento
{
  "project_id": "project_002",
  "repository_url": "https://github.com/Uptax-creator/N8N-Research-Agents",
  "branch": "development"
}

// Projeto 3: Outro repositório
{
  "project_id": "project_003",
  "repository_url": "https://github.com/AnotherOrg/Another-Repo",
  "branch": "main"
}
```

### **2. Centralização de Configuração**
- ✅ Mudar branch uma vez afeta todos agents do projeto
- ✅ Migrar para novo repositório sem alterar agents
- ✅ Frontend não precisa saber caminhos GitHub
- ✅ Menos erros de URL hardcoded

### **3. Auto-geração de URLs**
```javascript
// Componente busca projeto
const project = await $.getDataTableRows('projects', {
  filter: { project_id: 'project_001' }
})[0];

// Monta URL base
const baseUrl = `${project.repository_url}/raw/${project.branch}`;

// Gera URLs automaticamente
const configUrl = `${baseUrl}/${project.agents_base_path}agent_004/config.json`;
const promptsUrl = `${baseUrl}/${project.prompts_base_path}agent_004_prompts.json`;

// Resultado:
// https://github.com/Uptax-creator/N8N-Research-Agents/raw/clean-deployment/N8N/agents/agent_004/config.json
// https://github.com/Uptax-creator/N8N-Research-Agents/raw/clean-deployment/N8N/prompts/agents/agent_004_prompts.json
```

---

## 📄 DADOS INICIAIS

### **project_001 (ATUALIZADO)**

```json
{
  "project_id": "project_001",
  "project_name": "UptaxDev Multi-Agent System",
  "description": "Sistema multi-agente para pesquisa e análise fiscal",
  "owner_email": "kleber.ribeiro@uptax.net",
  "status": "active",

  "repository_url": "https://github.com/Uptax-creator/N8N-Research-Agents",
  "branch": "clean-deployment",
  "code_base_path": "N8N/code/",
  "prompts_base_path": "N8N/prompts/agents/",
  "agents_base_path": "N8N/agents/",
  "projects_base_path": "N8N/projects/",

  "created_at": "2025-01-15T10:00:00.000Z",
  "updated_at": "2025-10-07T10:00:00.000Z"
}
```

---

## 🔧 GUIA DE ATUALIZAÇÃO NO N8N UI

### **Passo 1: Adicionar Colunas**
1. Abrir N8N → Data Tables → `projects`
2. Clicar em **Edit Table**
3. Adicionar 6 novas colunas:

| Nome | Tipo | Obrigatório |
|------|------|-------------|
| repository_url | string | Sim |
| branch | string | Sim |
| code_base_path | string | Sim |
| prompts_base_path | string | Sim |
| agents_base_path | string | Sim |
| projects_base_path | string | Sim |

4. Salvar alterações

### **Passo 2: Atualizar Registro project_001**
1. Localizar registro `project_001`
2. Clicar em **Edit**
3. Preencher novos campos:
   - **repository_url:** `https://github.com/Uptax-creator/N8N-Research-Agents`
   - **branch:** `clean-deployment`
   - **code_base_path:** `N8N/code/`
   - **prompts_base_path:** `N8N/prompts/agents/`
   - **agents_base_path:** `N8N/agents/`
   - **projects_base_path:** `N8N/projects/`
4. Atualizar campo `updated_at` com data atual
5. Salvar

---

## 📊 INTEGRAÇÃO COM COMPONENTES

### **agent-data-mapper.js (Atualizado)**

```javascript
/**
 * Busca configurações do projeto e auto-gera URLs GitHub
 */
async function mapAgentData(body, $ = null) {
  const data = body.data || body;

  // Validações obrigatórias
  if (!data.agent_id) throw new Error('Missing required field: agent_id');
  if (!data.project_id) throw new Error('Missing required field: project_id');
  if (!data.agent_type) throw new Error('Missing required field: agent_type');

  // ✅ BUSCAR CONFIGURAÇÕES DO PROJETO
  if ($) {
    const projects = await $.getDataTableRows('projects');
    const project = projects.find(p => p.project_id === data.project_id);

    if (!project) {
      throw new Error(`Project ${data.project_id} not found in Data Tables`);
    }

    // ✅ AUTO-GERAR URLs do GitHub
    const baseUrl = `${project.repository_url}/raw/${project.branch}`;

    data.github_config_url = `${baseUrl}/${project.agents_base_path}${data.agent_id}/config.json`;
    data.github_prompts_url = `${baseUrl}/${project.prompts_base_path}${data.agent_id}_prompts.json`;

    console.log(`✅ URLs auto-generated from project: ${project.project_id}`);
    console.log(`   Config: ${data.github_config_url}`);
    console.log(`   Prompts: ${data.github_prompts_url}`);
  }

  // Mapear dados
  const mapped = {
    agent_id: data.agent_id.trim(),
    project_id: data.project_id.trim(),
    agent_name: data.agent_name?.trim() || data.agent_id,
    agent_type: data.agent_type.trim(),
    description: data.description?.trim() || '',

    // URLs auto-geradas
    github_config_url: data.github_config_url,
    github_prompts_url: data.github_prompts_url,

    // Campos opcionais
    workflow_id: data.workflow_id?.trim() || null,
    webhook_id: data.webhook_id?.trim() || null,
    webhook_url: data.webhook_url?.trim() || null,

    // Soft Delete
    is_latest: true,
    version: data.version || 1,
    status: 'active',
    deleted_at: null,
    superseded_by: null,

    // Timestamps
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  return mapped;
}
```

---

## 🎯 COMPONENTES NECESSÁRIOS

### **1. project-data-mapper.js (INSERT)**

```javascript
/**
 * Project Data Mapper - INSERT
 * Mapeia dados do webhook para tabela projects
 */
async function mapProjectData(body, $ = null) {
  const data = body.data || body;

  // Validações obrigatórias
  if (!data.project_id) throw new Error('Missing required field: project_id');
  if (!data.project_name) throw new Error('Missing required field: project_name');
  if (!data.repository_url) throw new Error('Missing required field: repository_url');
  if (!data.branch) throw new Error('Missing required field: branch');

  // ✅ VALIDAÇÃO: Projeto já existe?
  if ($) {
    const projects = await $.getDataTableRows('projects');
    const exists = projects.find(p => p.project_id === data.project_id);

    if (exists) {
      const error = new Error(`Project ${data.project_id} already exists (id=${exists.id})`);
      error.constraint_violation = 'DUPLICATE_PROJECT_ID';
      error.existing_project = exists;
      throw error;
    }
  }

  // Validação URL
  if (!data.repository_url.startsWith('https://github.com/')) {
    throw new Error('Invalid repository_url: must be a GitHub HTTPS URL');
  }

  // Mapear dados
  const mapped = {
    project_id: data.project_id.trim(),
    project_name: data.project_name.trim(),
    description: data.description?.trim() || '',
    owner_email: data.owner_email?.trim() || null,
    status: data.status || 'active',

    // GitHub Config
    repository_url: data.repository_url.trim(),
    branch: data.branch.trim(),
    code_base_path: data.code_base_path?.trim() || 'N8N/code/',
    prompts_base_path: data.prompts_base_path?.trim() || 'N8N/prompts/agents/',
    agents_base_path: data.agents_base_path?.trim() || 'N8N/agents/',
    projects_base_path: data.projects_base_path?.trim() || 'N8N/projects/',

    // Timestamps
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  console.log(`✅ Project data mapped: ${mapped.project_id}`);
  return mapped;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { mapProjectData };
}

// Auto-execução
if (typeof $ !== 'undefined') {
  const inputData = $input.all()[0].json;
  return mapProjectData(inputData, $);
}
```

### **2. project-query-helper.js (GET)**

```javascript
/**
 * Project Query Helper - GET
 * Busca projetos na Data Table com filtros
 */
async function getProject($, project_id) {
  try {
    const allProjects = await $.getDataTableRows('projects');

    const project = allProjects.find(p => p.project_id === project_id);

    if (!project) {
      return {
        found: false,
        message: `❌ Project ${project_id} not found`,
        project: null
      };
    }

    return {
      found: true,
      message: `✅ Project ${project_id} found`,
      project: project
    };

  } catch (error) {
    return {
      found: false,
      error: true,
      message: `❌ Query failed: ${error.message}`,
      project: null
    };
  }
}

/**
 * Lista todos os projetos ativos
 */
async function listActiveProjects($) {
  try {
    const allProjects = await $.getDataTableRows('projects');
    const activeProjects = allProjects.filter(p => p.status === 'active');

    return {
      success: true,
      total: activeProjects.length,
      projects: activeProjects
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      projects: []
    };
  }
}

/**
 * Monta URL base do GitHub para um projeto
 */
function buildGitHubBaseUrl(project) {
  return `${project.repository_url}/raw/${project.branch}`;
}

/**
 * Monta URL completa para config de agent
 */
function buildAgentConfigUrl(project, agent_id) {
  const baseUrl = buildGitHubBaseUrl(project);
  return `${baseUrl}/${project.agents_base_path}${agent_id}/config.json`;
}

/**
 * Monta URL completa para prompts de agent
 */
function buildAgentPromptsUrl(project, agent_id) {
  const baseUrl = buildGitHubBaseUrl(project);
  return `${baseUrl}/${project.prompts_base_path}${agent_id}_prompts.json`;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getProject,
    listActiveProjects,
    buildGitHubBaseUrl,
    buildAgentConfigUrl,
    buildAgentPromptsUrl
  };
}

// Auto-execução
if (typeof $ !== 'undefined') {
  const inputData = $input.all()[0].json;
  const project_id = inputData.project_id;
  return getProject($, project_id);
}
```

---

## 📚 ENDPOINTS FRONTEND → N8N

### **1. Listar Projetos**
```
GET /webhook/list-projects
Response: { projects: [...] }
```

### **2. Buscar Projeto**
```
GET /webhook/get-project?project_id=project_001
Response: { found: true, project: {...} }
```

### **3. Criar Projeto**
```
POST /webhook/create-project
Body: {
  "project_id": "project_002",
  "project_name": "Projeto Teste",
  "repository_url": "https://github.com/...",
  "branch": "development"
}
Response: { success: true, project: {...} }
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### **Fase 1: Atualizar Data Table (30min)**
- [ ] Adicionar 6 colunas na tabela `projects`
- [ ] Atualizar registro `project_001` com valores
- [ ] Validar dados salvos

### **Fase 2: Criar Componentes (1h)**
- [ ] Criar `project-data-mapper.js`
- [ ] Criar `project-query-helper.js`
- [ ] Atualizar `agent-data-mapper.js`
- [ ] Commit no GitHub

### **Fase 3: Workflows (1h)**
- [ ] Workflow: List Projects
- [ ] Workflow: Get Project
- [ ] Workflow: Create Project
- [ ] Workflow: Create Agent (com auto-geração de URLs)

### **Fase 4: Testes (30min)**
- [ ] Testar busca de projeto
- [ ] Testar criação de agent com URLs auto-geradas
- [ ] Validar URLs funcionando

---

## 📊 DIAGRAMA DE FLUXO

```
┌─────────────┐
│  FRONTEND   │
└──────┬──────┘
       │ POST /create-agent
       │ { agent_id, project_id, agent_type }
       ▼
┌─────────────────────────────────────┐
│  N8N WORKFLOW: Create Agent         │
├─────────────────────────────────────┤
│                                     │
│  Node 1: Webhook                    │
│    ↓                                │
│  Node 2: Get Project (query-helper)│
│    ↓                                │
│  Node 3: Agent Data Mapper          │
│    ├─ Busca project config          │
│    ├─ Auto-gera github_config_url   │
│    └─ Auto-gera github_prompts_url  │
│    ↓                                │
│  Node 4: Insert Agent (Data Table)  │
│    ↓                                │
│  Node 5: Response                   │
│                                     │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────┐
│ DATA TABLES │
├─────────────┤
│  projects   │ ← Configuração GitHub
│  agents     │ ← URLs auto-geradas
└─────────────┘
```

---

## 🎯 RESULTADO FINAL

**Frontend envia:**
```json
{
  "agent_id": "agent_004",
  "project_id": "project_001",
  "agent_type": "tax_calculator",
  "agent_name": "Tax Calculator"
}
```

**Agent criado automaticamente com:**
```json
{
  "agent_id": "agent_004",
  "project_id": "project_001",
  "agent_name": "Tax Calculator",
  "agent_type": "tax_calculator",
  "github_config_url": "https://github.com/Uptax-creator/N8N-Research-Agents/raw/clean-deployment/N8N/agents/agent_004/config.json",
  "github_prompts_url": "https://github.com/Uptax-creator/N8N-Research-Agents/raw/clean-deployment/N8N/prompts/agents/agent_004_prompts.json",
  "status": "active",
  "is_latest": true,
  "version": 1
}
```

✅ **URLs variáveis, gerenciadas centralmente, zero hardcode!**
