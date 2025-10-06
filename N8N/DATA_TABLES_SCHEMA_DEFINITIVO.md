# 📊 DATA TABLES SCHEMA DEFINITIVO

## ⚠️ IMPORTANTE: Limitações N8N Data Tables

**N8N Data Tables NÃO é PostgreSQL/MySQL:**
- ✅ Tipos: `string`, `number`, `datetime`, `boolean`
- ❌ Sem JSONB (usar `string` + JSON.stringify)
- ❌ Sem Foreign Keys (validar via código)
- ❌ Sem Constraints (validar via código)
- ❌ Sem Índices customizados
- ❌ Tabelas globais (isolamento via filtros)

---

## 📋 TABELA 1: `projects`

### **Schema SQL (Referência)**
```sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  project_id VARCHAR(50) UNIQUE NOT NULL,
  project_name VARCHAR(100) NOT NULL,
  description TEXT,
  owner_email VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Schema N8N Data Tables**
| Campo         | Tipo       | Obrigatório | Descrição                          |
|---------------|------------|-------------|------------------------------------|
| id            | number     | Auto        | Auto-incrementado pelo N8N         |
| project_id    | string     | ✅          | Identificador único (ex: project_001) |
| project_name  | string     | ✅          | Nome do projeto                    |
| description   | string     | ❌          | Descrição do projeto               |
| owner_email   | string     | ❌          | Email do responsável               |
| status        | string     | ✅          | active, inactive, archived         |
| created_at    | datetime   | ✅          | Data de criação                    |
| updated_at    | datetime   | ❌          | Data de atualização                |

### **Dados Iniciais**
```json
[
  {
    "project_id": "project_001",
    "project_name": "UptaxDev Multi-Agent System",
    "description": "Sistema multi-agente para pesquisa e análise fiscal",
    "owner_email": "kleber.ribeiro@uptax.net",
    "status": "active",
    "created_at": "2025-01-15T10:00:00.000Z"
  }
]
```

---

## 📋 TABELA 2: `agents`

### **Schema SQL (Referência)**
```sql
CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  agent_id VARCHAR(50) UNIQUE NOT NULL,
  project_id VARCHAR(50) NOT NULL,
  workflow_id VARCHAR(50),
  webhook_id VARCHAR(50),
  webhook_url TEXT,
  agent_name VARCHAR(100) NOT NULL,
  agent_type VARCHAR(50),
  description TEXT,
  github_config_url TEXT,
  github_prompts_url TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (project_id) REFERENCES projects(project_id)
);
```

### **Schema N8N Data Tables**
| Campo               | Tipo       | Obrigatório | Descrição                               |
|---------------------|------------|-------------|-----------------------------------------|
| id                  | number     | Auto        | Auto-incrementado pelo N8N              |
| agent_id            | string     | ✅          | ID único (ex: agent_001)                |
| project_id          | string     | ✅          | FK para projects (validação manual)     |
| workflow_id         | string     | ✅          | Workflow N8N a executar                 |
| webhook_id          | string     | ✅          | ID do webhook                           |
| webhook_url         | string     | ✅          | URL completa do webhook                 |
| agent_name          | string     | ✅          | Nome do agente                          |
| agent_type          | string     | ✅          | enhanced_research, fiscal_research, etc |
| description         | string     | ❌          | Descrição do agente                     |
| github_config_url   | string     | ✅          | URL do config.json no GitHub            |
| github_prompts_url  | string     | ✅          | URL do prompts.json no GitHub           |
| status              | string     | ✅          | active, inactive, maintenance           |
| created_at          | datetime   | ✅          | Data de criação                         |
| updated_at          | datetime   | ❌          | Data de atualização                     |

### **Dados Iniciais**
```json
[
  {
    "agent_id": "agent_001",
    "project_id": "project_001",
    "workflow_id": "work-1001-bright-data",
    "webhook_id": "webhook_enhanced_research",
    "webhook_url": "https://primary-production-56785.up.railway.app/webhook/work-1001",
    "agent_name": "Enhanced Research Agent",
    "agent_type": "enhanced_research",
    "description": "Brazilian market research with Bright Data MCP",
    "github_config_url": "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/agents/agent_001/config.json",
    "github_prompts_url": "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/prompts/agents/agent_001_enhanced_research.json",
    "status": "active",
    "created_at": "2025-01-15T10:00:00.000Z"
  },
  {
    "agent_id": "agent_002",
    "project_id": "project_001",
    "workflow_id": "work-1002-composio",
    "webhook_id": "webhook_fiscal_research",
    "webhook_url": "https://primary-production-56785.up.railway.app/webhook/work-1002",
    "agent_name": "Fiscal Research Agent",
    "agent_type": "fiscal_research",
    "description": "Brazilian fiscal documentation with Composio MCP",
    "github_config_url": "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/agents/agent_002/config.json",
    "github_prompts_url": "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/prompts/agents/agent_002_fiscal_research.json",
    "status": "active",
    "created_at": "2025-01-15T10:00:00.000Z"
  },
  {
    "agent_id": "agent_003",
    "project_id": "project_001",
    "workflow_id": "work-1003-gdocs",
    "webhook_id": "webhook_gdocs_documentation",
    "webhook_url": "https://primary-production-56785.up.railway.app/webhook/work-1003",
    "agent_name": "GDocs Documentation Agent",
    "agent_type": "gdocs_documentation",
    "description": "Documentation generation with Google Docs",
    "github_config_url": "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/agents/agent_003/config.json",
    "github_prompts_url": "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/prompts/agents/agent_003_gdocs_documentation.json",
    "status": "active",
    "created_at": "2025-01-15T10:00:00.000Z"
  }
]
```

---

## 📋 TABELA 3: `wrk_execution`

### **Schema SQL (Referência)**
```sql
CREATE TABLE wrk_execution (
  id SERIAL PRIMARY KEY,
  execution_id VARCHAR(100) UNIQUE NOT NULL,
  workflow_id VARCHAR(50) NOT NULL,
  project_id VARCHAR(50) NOT NULL,
  webhook_id VARCHAR(50) NOT NULL,
  agent_id VARCHAR(50) NOT NULL,
  session_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'running',
  current_step VARCHAR(100),
  user_query TEXT,
  started_at TIMESTAMP DEFAULT NOW(),
  finished_at TIMESTAMP,
  total_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents(agent_id)
);
```

### **Schema N8N Data Tables**
| Campo          | Tipo       | Obrigatório | Descrição                          |
|----------------|------------|-------------|------------------------------------|
| id             | number     | Auto        | Auto-incrementado pelo N8N         |
| execution_id   | string     | ✅          | ID único da execução               |
| workflow_id    | string     | ✅          | Isolation field                    |
| project_id     | string     | ✅          | Isolation field                    |
| webhook_id     | string     | ✅          | Isolation field                    |
| agent_id       | string     | ✅          | FK para agents (validação manual)  |
| session_id     | string     | ❌          | Sessão do usuário                  |
| status         | string     | ✅          | running, completed, failed         |
| current_step   | string     | ❌          | Nome do step atual                 |
| user_query     | string     | ❌          | Query do usuário                   |
| started_at     | datetime   | ✅          | Início da execução                 |
| finished_at    | datetime   | ❌          | Fim da execução                    |
| total_time_ms  | number     | ❌          | Tempo total em milissegundos       |
| error_message  | string     | ❌          | Mensagem de erro (se houver)       |
| created_at     | datetime   | ✅          | Data de criação do registro        |
| updated_at     | datetime   | ❌          | Data de atualização                |

---

## 📋 TABELA 4: `wrk_state`

### **Schema SQL (Referência)**
```sql
CREATE TABLE wrk_state (
  id SERIAL PRIMARY KEY,
  state_id VARCHAR(100) UNIQUE NOT NULL,
  execution_id VARCHAR(100) NOT NULL,
  workflow_id VARCHAR(50) NOT NULL,
  project_id VARCHAR(50) NOT NULL,
  webhook_id VARCHAR(50) NOT NULL,
  agent_id VARCHAR(50) NOT NULL,
  step_name VARCHAR(100) NOT NULL,
  step_order INTEGER NOT NULL,
  state_data_json TEXT NOT NULL,
  step_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (execution_id) REFERENCES wrk_execution(execution_id),
  CHECK (step_order >= 1)
);
```

### **Schema N8N Data Tables**
| Campo            | Tipo       | Obrigatório | Descrição                              |
|------------------|------------|-------------|----------------------------------------|
| id               | number     | Auto        | Auto-incrementado pelo N8N             |
| state_id         | string     | ✅          | ID único do estado                     |
| execution_id     | string     | ✅          | FK para wrk_execution (manual)         |
| workflow_id      | string     | ✅          | Isolation field                        |
| project_id       | string     | ✅          | Isolation field                        |
| webhook_id       | string     | ✅          | Isolation field                        |
| agent_id         | string     | ✅          | Isolation field                        |
| step_name        | string     | ✅          | Nome do step                           |
| step_order       | number     | ✅          | Ordem do step (>= 1)                   |
| state_data_json  | string     | ✅          | Envelope JSON serializado              |
| step_time_ms     | number     | ❌          | Tempo do step em ms                    |
| created_at       | datetime   | ✅          | Data de criação                        |

---

## 📋 TABELA 5: `wrk_variables` (Opcional)

### **Schema N8N Data Tables**
| Campo               | Tipo       | Obrigatório | Descrição                          |
|---------------------|------------|-------------|------------------------------------|
| id                  | number     | Auto        | Auto-incrementado pelo N8N         |
| variable_id         | string     | ✅          | ID único da variável               |
| variable_name       | string     | ✅          | Nome da variável                   |
| variable_value_json | string     | ✅          | Valor JSON serializado             |
| variable_type       | string     | ✅          | execution, webhook, workflow, project |
| project_id          | string     | ✅          | Isolation field                    |
| workflow_id         | string     | ❌          | Null se type=project               |
| webhook_id          | string     | ❌          | Null se type=project/workflow      |
| execution_id        | string     | ❌          | Null se type!=execution            |
| created_at          | datetime   | ✅          | Data de criação                    |
| updated_at          | datetime   | ❌          | Data de atualização                |

---

## 🎯 GUIA DE CRIAÇÃO NO N8N UI

### **Passo 1: Acessar Data Tables**
1. Abrir N8N → Menu lateral → **Data Tables**
2. Clicar em **+ Create Table**

### **Passo 2: Criar Tabela `projects`**
1. Nome: `projects`
2. Adicionar colunas conforme schema acima
3. Configurar tipos de campos
4. Salvar tabela

### **Passo 3: Inserir Dados Iniciais**
1. Clicar na tabela `projects`
2. **+ Add Row**
3. Preencher com dados do JSON acima
4. Salvar

### **Passo 4: Repetir para Outras Tabelas**
- Criar `agents` (inserir 3 agentes)
- Criar `wrk_execution` (vazia inicialmente)
- Criar `wrk_state` (vazia inicialmente)
- Criar `wrk_variables` (opcional)

---

## ✅ VALIDAÇÃO PÓS-CRIAÇÃO

### **Checklist:**
- [ ] Tabela `projects` criada com 1 registro
- [ ] Tabela `agents` criada com 3 registros
- [ ] Tabela `wrk_execution` criada (vazia)
- [ ] Tabela `wrk_state` criada (vazia)
- [ ] Componentes JavaScript no GitHub
- [ ] Workflow de teste criado
- [ ] Teste de insert/update funcionando

---

## 📚 REFERÊNCIAS

- [PLANEJAMENTO_DATA_TABLES_REVISADO.md](PLANEJAMENTO_DATA_TABLES_REVISADO.md)
- [AGENTS_TABLE_ESTRUTURA_COMPLETA.md](AGENTS_TABLE_ESTRUTURA_COMPLETA.md)
- [AVALIACAO_SUGESTOES_MODELAGEM.md](AVALIACAO_SUGESTOES_MODELAGEM.md)
- [IMPLEMENTACAO_COMPONENTES_DATA_TABLES.md](IMPLEMENTACAO_COMPONENTES_DATA_TABLES.md)
