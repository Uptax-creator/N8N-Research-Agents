# 🚀 SPRINT - INTEGRAÇÃO DATA TABLES + FRONTEND

**Data:** 07/10/2025
**Objetivo:** Complementar Data Tables com campos GitHub, criar componentes INSERT/GET para projects e agents, preparar integração com Frontend

---

## ✅ ENTREGAS COMPLETAS

### **1. Documentação**

| Arquivo | Descrição |
|---------|-----------|
| [DATA_TABLES_PROJECTS_EXTENDED_SCHEMA.md](DATA_TABLES_PROJECTS_EXTENDED_SCHEMA.md) | Schema expandido da tabela `projects` com campos GitHub |

### **2. Componentes Criados**

| Componente | Path | Função |
|------------|------|--------|
| **project-data-mapper.js** | [N8N/code/processors/project-data-mapper.js](code/processors/project-data-mapper.js) | INSERT de projects com validação de UNIQUE |
| **project-query-helper.js** | [N8N/code/helpers/project-query-helper.js](code/helpers/project-query-helper.js) | GET projects com helpers para construir URLs GitHub |
| **agent-data-mapper.js v3.0** | [N8N/code/processors/agent-data-mapper.js](code/processors/agent-data-mapper.js) | INSERT de agents com auto-geração de URLs GitHub |

### **3. Dados de Referência**

| Arquivo | Descrição |
|---------|-----------|
| [projects/project_001.json](projects/project_001.json) | Configuração completa do project_001 com campos GitHub |

---

## 📊 SCHEMA EXPANDIDO: `projects`

### **Campos Adicionados (6 novos)**

| Campo | Tipo | Obrigatório | Descrição | Exemplo |
|-------|------|-------------|-----------|---------|
| **repository_url** | string | ✅ | URL base do repositório GitHub | `https://github.com/Uptax-creator/N8N-Research-Agents` |
| **branch** | string | ✅ | Branch ativa | `clean-deployment` |
| **code_base_path** | string | ✅ | Caminho dos códigos | `N8N/code/` |
| **prompts_base_path** | string | ✅ | Caminho dos prompts | `N8N/prompts/agents/` |
| **agents_base_path** | string | ✅ | Caminho dos agents | `N8N/agents/` |
| **projects_base_path** | string | ✅ | Caminho dos projects | `N8N/projects/` |

### **Benefícios**

✅ **URLs variáveis por projeto** - Cada projeto pode ter repositório e branch diferentes
✅ **Centralização** - Configuração GitHub em um único lugar
✅ **Auto-geração** - Frontend não precisa saber estrutura do GitHub
✅ **Escalável** - Suporta múltiplos projetos facilmente

---

## 🔧 COMPONENTES CRIADOS

### **1. project-data-mapper.js (INSERT)**

```javascript
// Frontend envia
POST /webhook/create-project
{
  "project_id": "project_002",
  "project_name": "Projeto Teste",
  "repository_url": "https://github.com/...",
  "branch": "development"
}

// Componente valida e insere
✅ Valida UNIQUE constraint (project_id)
✅ Valida URL GitHub
✅ Aplica defaults para paths
✅ INSERT na Data Table
```

**Validações:**
- UNIQUE project_id
- URL GitHub válida (https://github.com/...)
- Email válido (se fornecido)
- Status válido (active/inactive/archived)

### **2. project-query-helper.js (GET)**

```javascript
// Buscar projeto específico
const result = await getProject($, 'project_001');
// { found: true, project: {...} }

// Listar todos os projetos ativos
const result = await listActiveProjects($);
// { success: true, total: 2, projects: [...] }

// Construir URLs automaticamente
const configUrl = buildAgentConfigUrl(project, 'agent_004');
// "https://github.com/.../raw/clean-deployment/N8N/agents/agent_004/config.json"

const promptsUrl = buildAgentPromptsUrl(project, 'agent_004');
// "https://github.com/.../raw/clean-deployment/N8N/prompts/agents/agent_004_prompts.json"
```

**Funções:**
- `getProject($, project_id)` - Busca projeto por ID
- `listProjects($, filters)` - Lista projetos com filtros
- `listActiveProjects($)` - Lista apenas ativos
- `buildGitHubBaseUrl(project)` - Monta URL base
- `buildAgentConfigUrl(project, agent_id)` - URL do config.json
- `buildAgentPromptsUrl(project, agent_id)` - URL do prompts.json
- `buildCodeUrl(project, codePath)` - URL de código
- `validateProjectGitHubConfig(project)` - Valida configuração completa

### **3. agent-data-mapper.js v3.0 (INSERT com Auto-geração)**

```javascript
// Frontend envia apenas campos básicos
POST /webhook/create-agent
{
  "agent_id": "agent_004",
  "project_id": "project_001",
  "agent_type": "tax_calculator",
  "agent_name": "Tax Calculator"
}

// Componente faz:
1. ✅ Busca project_001 na Data Table
2. ✅ Valida configuração GitHub do projeto
3. ✅ Auto-gera github_config_url
4. ✅ Auto-gera github_prompts_url
5. ✅ Valida UNIQUE constraint
6. ✅ INSERT na Data Table agents

// Agent criado com:
{
  "agent_id": "agent_004",
  "github_config_url": "https://github.com/.../N8N/agents/agent_004/config.json",
  "github_prompts_url": "https://github.com/.../N8N/prompts/agents/agent_004_prompts.json",
  ...
}
```

**Melhorias:**
- ✅ Auto-busca configuração do projeto
- ✅ Valida projeto existe
- ✅ Valida configuração GitHub completa
- ✅ Monta URLs automaticamente
- ✅ Logs detalhados de geração de URLs

---

## 📋 PRÓXIMOS PASSOS

### **VOCÊ (N8N UI):**

#### **1. Atualizar Tabela `projects` (30min)**
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

4. Salvar tabela

#### **2. Atualizar Registro `project_001` (10min)**
1. Localizar registro `project_001`
2. Clicar em **Edit**
3. Preencher campos com valores de [projects/project_001.json](projects/project_001.json):
   - **repository_url:** `https://github.com/Uptax-creator/N8N-Research-Agents`
   - **branch:** `clean-deployment`
   - **code_base_path:** `N8N/code/`
   - **prompts_base_path:** `N8N/prompts/agents/`
   - **agents_base_path:** `N8N/agents/`
   - **projects_base_path:** `N8N/projects/`
4. Atualizar `updated_at` com data atual
5. Salvar

---

### **DEPOIS (Workflows):**

#### **3. Criar Workflows N8N (2h)**

**Workflow 1: List Projects**
```
Node 1: Webhook GET /list-projects
Node 2: Code (project-query-helper.js) → listActiveProjects
Node 3: Response JSON
```

**Workflow 2: Get Project**
```
Node 1: Webhook GET /get-project?project_id=xxx
Node 2: Code (project-query-helper.js) → getProject
Node 3: Response JSON
```

**Workflow 3: Create Project**
```
Node 1: Webhook POST /create-project
Node 2: Code (project-data-mapper.js) → validar + mapear
Node 3: Data Tables INSERT → projects
Node 4: Response JSON
```

**Workflow 4: Create Agent (Atualizado)**
```
Node 1: Webhook POST /create-agent
Node 2: Code (project-query-helper.js) → buscar projeto
Node 3: Code (agent-data-mapper.js v3) → auto-gerar URLs
Node 4: Data Tables INSERT → agents
Node 5: Response JSON
```

---

## 🎯 ENDPOINTS FRONTEND

### **Projects**

| Endpoint | Método | Body/Query | Resposta |
|----------|--------|------------|----------|
| `/list-projects` | GET | - | `{ success: true, total: N, projects: [...] }` |
| `/get-project` | GET | `?project_id=xxx` | `{ found: true, project: {...} }` |
| `/create-project` | POST | JSON | `{ success: true, project: {...} }` |

### **Agents**

| Endpoint | Método | Body | Resposta |
|----------|--------|------|----------|
| `/create-agent` | POST | `{ agent_id, project_id, agent_type, agent_name }` | `{ success: true, agent: {...} }` |
| `/list-agents` | GET | `?project_id=xxx` | `{ success: true, total: N, agents: [...] }` |

---

## 🔍 EXEMPLO DE FLUXO COMPLETO

### **Criar Novo Agent via Frontend**

```javascript
// 1. Frontend envia request mínimo
POST /webhook/create-agent
{
  "agent_id": "agent_004",
  "project_id": "project_001",
  "agent_type": "tax_calculator",
  "agent_name": "Tax Calculator Agent"
}

// 2. Workflow N8N executa:
// Node 1: Webhook recebe dados
// Node 2: Busca project_001 em Data Tables
//   → Retorna configuração GitHub completa
// Node 3: agent-data-mapper.js v3.0
//   → Monta URLs automaticamente:
//     github_config_url: "https://github.com/Uptax-creator/N8N-Research-Agents/raw/clean-deployment/N8N/agents/agent_004/config.json"
//     github_prompts_url: "https://github.com/Uptax-creator/N8N-Research-Agents/raw/clean-deployment/N8N/prompts/agents/agent_004_prompts.json"
// Node 4: INSERT na Data Table agents
// Node 5: Response para Frontend

// 3. Frontend recebe:
{
  "success": true,
  "agent": {
    "id": 15,
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
}
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

### **Após Atualizar Data Table**
- [ ] Tabela `projects` possui 6 novos campos
- [ ] Registro `project_001` atualizado com valores corretos
- [ ] Campo `updated_at` de project_001 atualizado

### **Após Criar Workflows**
- [ ] Workflow "List Projects" retorna project_001
- [ ] Workflow "Get Project" retorna configuração GitHub completa
- [ ] Workflow "Create Agent" auto-gera URLs corretamente
- [ ] URLs geradas são acessíveis via browser

### **Testes de Integração**
- [ ] Criar agent_004 via POST
- [ ] Verificar URLs geradas no response
- [ ] Acessar github_config_url no browser (deve retornar 404 ou JSON)
- [ ] Verificar agent_004 na Data Table agents

---

## 📊 RESULTADO ESPERADO

**Antes (Hardcoded):**
```javascript
// Frontend precisava enviar URLs completas
{
  "agent_id": "agent_004",
  "github_config_url": "https://github.com/Uptax-creator/N8N-Research-Agents/raw/clean-deployment/N8N/agents/agent_004/config.json",
  "github_prompts_url": "https://github.com/Uptax-creator/N8N-Research-Agents/raw/clean-deployment/N8N/prompts/agents/agent_004_prompts.json"
}
```

**Depois (Dinâmico):**
```javascript
// Frontend envia apenas campos básicos
{
  "agent_id": "agent_004",
  "project_id": "project_001",
  "agent_type": "tax_calculator"
}
// URLs geradas automaticamente pelo workflow! ✅
```

---

## 🎯 BENEFÍCIOS ALCANÇADOS

1. ✅ **Centralização** - Configuração GitHub em `projects`
2. ✅ **URLs Variáveis** - Cada projeto pode ter repositório/branch diferente
3. ✅ **Frontend Simples** - Não precisa conhecer estrutura GitHub
4. ✅ **Manutenção Fácil** - Mudar branch uma vez afeta todos agents
5. ✅ **Escalável** - Adicionar novos projetos sem alterar código
6. ✅ **Zero Hardcode** - URLs montadas dinamicamente

---

## 📚 ARQUIVOS PARA COMMIT

```
N8N/
├── DATA_TABLES_PROJECTS_EXTENDED_SCHEMA.md          ← Documentação
├── SPRINT_INTEGRACAO_DATA_TABLES_FRONTEND.md        ← Este arquivo
├── code/
│   ├── processors/
│   │   ├── project-data-mapper.js                   ← INSERT projects
│   │   └── agent-data-mapper.js                     ← v3.0 com auto-geração
│   └── helpers/
│       └── project-query-helper.js                  ← GET projects + URL builders
└── projects/
    └── project_001.json                             ← Dados de referência
```

---

## 🚀 PRÓXIMA SESSÃO

**Quando você adicionar os campos na tabela `projects`:**
1. Confirme que está tudo OK
2. Vamos criar os 4 workflows juntos
3. Testar criação de agent com auto-geração de URLs
4. Documentar endpoints para o time Frontend

**Duração estimada:** 2-3 horas para workflows + testes completos

✅ **Sprint concluída com sucesso!**
