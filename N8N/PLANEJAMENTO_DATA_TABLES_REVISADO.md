# 🔄 Data Tables - Planejamento Revisado com Limitações Reais

## 🚨 LIMITAÇÕES CRÍTICAS IDENTIFICADAS

### **1. Escopo Global (Não Isolado)**
❌ **ERRO NO PLANEJAMENTO ANTERIOR:**
- Assumimos tabelas isoladas por workflow
- Na realidade: **Tabelas são compartilhadas por TODA a instância N8N**

✅ **REALIDADE:**
- Todos os workflows usam as mesmas tabelas
- **OBRIGATÓRIO:** Incluir `workflow_id`, `project_id`, `agent_id`, `webhook_id` em TODAS as queries
- Risco de colisão de dados entre workflows

**Impacto:** 🔴 CRÍTICO - Arquitetura precisa revisão total

---

### **2. Tipos de Campos Limitados**
❌ **ERRO NO PLANEJAMENTO ANTERIOR:**
- Assumimos tipo `JSON` para `state_data`
- Planejamos `Foreign Keys` e relacionamentos

✅ **REALIDADE:**
- **Tipos disponíveis:** `string`, `datetime`, `boolean`, `number`
- **NÃO TEM:** JSON, JSONB, TEXT longo, Arrays
- **NÃO TEM:** Foreign Keys, Constraints, Triggers

**Impacto:** 🔴 CRÍTICO - Não podemos armazenar envelope como JSON

---

### **3. Sem Relacionamentos (No FK)**
❌ **ERRO NO PLANEJAMENTO ANTERIOR:**
- Planejamos FK: `wrk_state.execution_id → wrk_execution.execution_id`
- Assumimos integridade referencial

✅ **REALIDADE:**
- **Tabelas NÃO se relacionam**
- Relacionamentos devem ser gerenciados manualmente no código
- Sem cascade delete, sem joins nativos

**Impacto:** 🟡 ALTO - Aumenta complexidade do código

---

## 📊 IMPACTO DAS LIMITAÇÕES

### **Impacto 1: Envelope JSONB Impossível**

**Planejamento Anterior:**
```javascript
// ❌ NÃO FUNCIONA
state_data: {
  workflow_config: {...},
  agent_config: {...},
  prompt_data: {...}
}
```

**Realidade:**
- Precisamos serializar JSON para `string`
- Ou criar múltiplas colunas (explosion de campos)

**Soluções Possíveis:**

**A. JSON Serializado (String)**
```javascript
// Salvar
state_data_json: JSON.stringify({
  workflow_config: {...},
  agent_config: {...}
})

// Recuperar
const envelope = JSON.parse(state.state_data_json);
```
- ✅ Funciona
- ⚠️ Sem query em campos internos
- ⚠️ Limite de tamanho string (~64KB)

**B. Múltiplas Colunas**
```javascript
// Criar coluna para cada campo principal
workflow_config_json: string  // JSON.stringify(workflow_config)
agent_config_json: string      // JSON.stringify(agent_config)
prompt_data_json: string       // JSON.stringify(prompt_data)
ai_response_json: string       // JSON.stringify(ai_response)
```
- ✅ Mais organizado
- ✅ Pode query por tipo de dado
- ⚠️ Muitas colunas (10-15)

**C. Tabela de Key-Value**
```javascript
// Tabela: wrk_variables
execution_id: string
variable_name: string  // 'workflow_config', 'agent_config', etc
variable_value: string // JSON serializado
variable_type: string  // 'config', 'data', 'response'
```
- ✅ Flexível (adiciona variáveis sem alterar schema)
- ✅ Query por tipo
- ⚠️ Múltiplas queries (uma por variável)

---

### **Impacto 2: Isolamento por Workflow**

**Problema:**
- Mesma tabela para todos workflows
- Dados de `work-1001` misturados com `work-1002`

**Solução Obrigatória:**
```javascript
// SEMPRE filtrar por workflow_id + project_id + webhook_id
WHERE workflow_id = 'work-1001'
  AND project_id = 'project_001'
  AND webhook_id = 'webhook_...'
  AND execution_id = 'exec_...'
```

**Campos Obrigatórios em TODAS as tabelas:**
- `workflow_id` (qual workflow)
- `project_id` (qual projeto/tenant)
- `agent_id` (qual agente)
- `webhook_id` (qual webhook/endpoint)
- `execution_id` (qual execução)

---

### **Impacto 3: Sem Relacionamentos**

**Antes (Planejado):**
```sql
-- ❌ NÃO FUNCIONA
SELECT e.*, s.*
FROM wrk_execution e
JOIN wrk_state s ON e.execution_id = s.execution_id
```

**Agora (Realidade):**
```javascript
// Busca manual em 2 steps
const execution = await getFromTable('wrk_execution', {
  execution_id: executionId
});

const states = await getFromTable('wrk_state', {
  execution_id: executionId,
  workflow_id: execution.workflow_id  // ← Precisa incluir
});
```

---

## 🏗️ ARQUITETURA REVISADA

### **Decisão Arquitetural: Hybrid Approach**

**Combinação de:**
1. ✅ Tabelas cadastrais (`agents`, `projects`) - dados mestres
2. ✅ Tabelas operacionais (`executions`, `states`) - dados transacionais
3. ✅ JSON serializado em `string` - envelope flexível
4. ✅ Isolamento manual - filtros obrigatórios

---

### **Schema Revisado (5 Tabelas)**

#### **Tabela 1: projects** (Cadastro - Master Data)

**Propósito:** Registrar projetos/tenants

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `project_id` | String | ✅ | ID do projeto (PK) |
| `project_name` | String | ✅ | Nome do projeto |
| `description` | String | ❌ | Descrição |
| `owner_email` | String | ❌ | Email do owner |
| `status` | String | ✅ | active, inactive |
| `created_at` | DateTime | ✅ | Data de criação |
| `updated_at` | DateTime | ❌ | Última atualização |

**Exemplo de dados:**
```javascript
{
  project_id: 'project_001',
  project_name: 'UptaxDev Meta-Agent',
  description: 'Sistema multi-agente para pesquisa',
  owner_email: 'kleber.ribeiro@uptax.net',
  status: 'active',
  created_at: '2025-10-04T12:00:00Z'
}
```

---

#### **Tabela 2: agents** (Cadastro - Master Data)

**Propósito:** Registrar agentes disponíveis

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `agent_id` | String | ✅ | ID do agente (PK) |
| `project_id` | String | ✅ | Projeto do agente |
| `agent_name` | String | ✅ | Nome do agente |
| `agent_type` | String | ✅ | enhanced_research, fiscal, etc |
| `description` | String | ❌ | Descrição |
| `github_config_url` | String | ❌ | URL do config.json |
| `github_prompts_url` | String | ❌ | URL do prompts.json |
| `status` | String | ✅ | active, inactive, maintenance |
| `created_at` | DateTime | ✅ | Data de criação |
| `updated_at` | DateTime | ❌ | Última atualização |

**Exemplo de dados:**
```javascript
{
  agent_id: 'agent_001',
  project_id: 'project_001',
  agent_name: 'Enhanced Research Agent',
  agent_type: 'enhanced_research',
  description: 'Brazilian market research with Bright Data',
  github_config_url: 'https://raw.githubusercontent.com/.../agent_001/config.json',
  github_prompts_url: 'https://raw.githubusercontent.com/.../agent_001/prompts.json',
  status: 'active',
  created_at: '2025-10-04T12:00:00Z'
}
```

---

#### **Tabela 3: wrk_execution** (Operacional)

**Propósito:** Tracking de execuções

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `execution_id` | String | ✅ | UUID da execução (PK) |
| `workflow_id` | String | ✅ | Qual workflow (work-1001) |
| `project_id` | String | ✅ | Qual projeto |
| `agent_id` | String | ✅ | Qual agente |
| `webhook_id` | String | ✅ | Qual webhook/endpoint |
| `session_id` | String | ❌ | Agrupa execuções |
| `status` | String | ✅ | running, completed, failed |
| `current_step` | String | ✅ | Step atual |
| `user_query` | String | ❌ | Query do usuário |
| `started_at` | DateTime | ✅ | Início |
| `finished_at` | DateTime | ❌ | Fim |
| `total_time_ms` | Number | ❌ | Tempo total |
| `error_message` | String | ❌ | Erro se falhar |

**Queries Obrigatórias:**
```javascript
// SEMPRE incluir workflow_id + project_id + webhook_id
WHERE workflow_id = 'work-1001'
  AND project_id = 'project_001'
  AND webhook_id = 'webhook_...'
  AND execution_id = '...'
```

---

#### **Tabela 4: wrk_state** (Operacional - Approach A: JSON Único)

**Propósito:** Estado completo serializado

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `state_id` | String | ✅ | UUID do estado (PK) |
| `execution_id` | String | ✅ | FK manual para executions |
| `workflow_id` | String | ✅ | Isolamento |
| `project_id` | String | ✅ | Isolamento |
| `webhook_id` | String | ✅ | Isolamento |
| `step_name` | String | ✅ | Nome do step |
| `step_order` | Number | ✅ | Ordem (1, 2, 3...) |
| `state_data_json` | String | ✅ | **Envelope completo serializado** |
| `step_time_ms` | Number | ❌ | Tempo do step |
| `created_at` | DateTime | ✅ | Timestamp |

**Como usar:**
```javascript
// Salvar
state_data_json: JSON.stringify({
  workflow_config: {...},
  request_data: {...},
  agent_config: {...},
  prompt_data: {...},
  runtime: {...}
})

// Recuperar
const envelope = JSON.parse(state.state_data_json);
```

**OU Tabela 4 (Approach B: Múltiplas Colunas)**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `state_id` | String | ✅ | UUID (PK) |
| `execution_id` | String | ✅ | FK manual |
| `workflow_id` | String | ✅ | Isolamento |
| `project_id` | String | ✅ | Isolamento |
| `webhook_id` | String | ✅ | Isolamento |
| `step_name` | String | ✅ | Step |
| `step_order` | Number | ✅ | Ordem |
| `workflow_config_json` | String | ❌ | JSON serializado |
| `request_data_json` | String | ❌ | JSON serializado |
| `agent_config_json` | String | ❌ | JSON serializado |
| `prompt_data_json` | String | ❌ | JSON serializado |
| `ai_input_json` | String | ❌ | JSON serializado |
| `ai_response_json` | String | ❌ | JSON serializado |
| `formatted_response_json` | String | ❌ | JSON serializado |
| `runtime_json` | String | ❌ | JSON serializado |
| `step_time_ms` | Number | ❌ | Tempo |
| `created_at` | DateTime | ✅ | Timestamp |

---

#### **Tabela 5: wrk_variables** (Alternativa - Key-Value)

**Propósito:** Variáveis flexíveis (se escolher Approach C)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `variable_id` | String | ✅ | UUID (PK) |
| `execution_id` | String | ✅ | FK manual |
| `workflow_id` | String | ✅ | Isolamento |
| `project_id` | String | ✅ | Isolamento |
| `webhook_id` | String | ✅ | Isolamento |
| `variable_name` | String | ✅ | workflow_config, agent_config, etc |
| `variable_value` | String | ✅ | JSON serializado |
| `variable_type` | String | ✅ | config, data, response |
| `created_at` | DateTime | ✅ | Timestamp |
| `updated_at` | DateTime | ❌ | Atualização |

---

## 🎯 DECISÃO: QUAL APPROACH USAR?

### **Comparação:**

| Aspecto | A: JSON Único | B: Múltiplas Colunas | C: Key-Value |
|---------|---------------|----------------------|--------------|
| **Simplicidade** | ✅✅ 1 campo | ⚠️ 8-10 campos | ✅ 1 tabela flexível |
| **Performance** | ✅✅ 1 query | ✅ 1 query | ⚠️ N queries |
| **Flexibilidade** | ✅✅ Adiciona campos sem schema | ❌ Schema change | ✅✅ Sem schema change |
| **Query Granular** | ❌ Não | ✅ Sim (por campo) | ✅ Sim (por nome) |
| **Tamanho** | ⚠️ Limite string | ✅ Distribuído | ✅ Distribuído |
| **Manutenção** | ✅✅ Fácil | ⚠️ Média | ✅ Fácil |

### **Recomendação: HYBRID (A + Cadastros)**

**Tabelas Finais:**
1. ✅ `projects` (cadastro)
2. ✅ `agents` (cadastro)
3. ✅ `wrk_execution` (operacional)
4. ✅ `wrk_state` (operacional - JSON único em string)

**Justificativa:**
- Cadastros (`projects`, `agents`) → dados mestres, estruturados
- State (`wrk_state`) → JSON único, máxima flexibilidade
- Executions → metadados, tracking

---

## 🔧 COMPONENTES REVISADOS

### **Componente 1: State Manager (Ajustado)**

**Mudanças necessárias:**

```javascript
// ANTES (planejamento errado)
state_data: { workflow_config: {...} }  // ❌ Tipo JSON não existe

// AGORA (correto)
state_data_json: JSON.stringify({ workflow_config: {...} })  // ✅ String

// Recuperar
const envelope = JSON.parse(state.state_data_json);
```

**Filtros obrigatórios:**
```javascript
// SEMPRE incluir workflow_id + project_id + webhook_id
WHERE workflow_id = this.workflowId
  AND project_id = this.projectId
  AND webhook_id = this.webhookId
  AND execution_id = this.executionId
```

### **Componente 2: Data Table Helper (Ajustado)**

**Adicionar isolamento:**
```javascript
async get(tableName, filters) {
  // Adiciona automaticamente workflow_id, project_id e webhook_id
  const fullFilters = {
    ...filters,
    workflow_id: this.workflowId,
    project_id: this.projectId,
    webhook_id: this.webhookId
  };

  return await dataTableGet(tableName, fullFilters);
}
```

### **Componente 3: Envelope Builder (Sem mudanças)**

Continua igual, pois trabalha com objetos JavaScript, independente de como são armazenados.

### **Componente 4: Agents Manager (NOVO)**

**Propósito:** Gerenciar cadastro de agentes

```javascript
class AgentsManager {
  async createAgent(agentData) {
    return await dataTable.upsert('agents', {
      agent_id: agentData.agent_id,
      project_id: agentData.project_id,
      agent_name: agentData.agent_name,
      agent_type: agentData.agent_type,
      github_config_url: agentData.github_config_url,
      status: 'active',
      created_at: new Date().toISOString()
    });
  }

  async getAgent(agentId, projectId) {
    return await dataTable.get('agents', {
      agent_id: agentId,
      project_id: projectId,
      status: 'active'
    });
  }

  async listAgents(projectId) {
    return await dataTable.get('agents', {
      project_id: projectId,
      status: 'active'
    });
  }
}
```

---

## 📅 ROADMAP REVISADO

### **Sprint 0: Setup Cadastral (NOVO - 1-2h)**

**Objetivo:** Estruturar dados mestres antes de workflows

#### **Etapa 0.1: Criar Tabelas Cadastrais (30min)**
- [ ] Criar tabela `projects` no N8N
- [ ] Criar tabela `agents` no N8N
- [ ] Inserir dados iniciais

**Dados Iniciais:**
```javascript
// Project
{
  project_id: 'project_001',
  project_name: 'UptaxDev Meta-Agent',
  owner_email: 'kleber.ribeiro@uptax.net',
  status: 'active'
}

// Agents
[
  {
    agent_id: 'agent_001',
    project_id: 'project_001',
    agent_name: 'Enhanced Research',
    agent_type: 'enhanced_research',
    github_config_url: 'https://raw.../agent_001/config.json',
    status: 'active'
  },
  {
    agent_id: 'agent_002',
    project_id: 'project_001',
    agent_name: 'Fiscal Research',
    agent_type: 'fiscal_research',
    github_config_url: 'https://raw.../agent_002/config.json',
    status: 'active'
  }
]
```

#### **Etapa 0.2: Criar Componente Agents Manager (30min)**
- [ ] `code/loaders/agents-manager.js`
- [ ] Métodos: createAgent, getAgent, listAgents
- [ ] Testar CRUD de agents

#### **Etapa 0.3: Validar Cadastros (30min)**
- [ ] Workflow simples: listar agents
- [ ] Webhook → Get Agents → Respond
- [ ] Validar dados retornados

---

### **Sprint 1: Setup Operacional (Revisado - 2-3h)**

#### **Etapa 1.1: Criar Tabelas Operacionais (30min)**
- [ ] Criar tabela `wrk_execution`
- [ ] Criar tabela `wrk_state`
- [ ] Validar tipos de campos

#### **Etapa 1.2: Ajustar Componentes (1h)**
- [ ] Ajustar `data-table-state-manager.js`
  - Adicionar serialização JSON → string
  - Adicionar filtros workflow_id + project_id + webhook_id
- [ ] Criar `data-table-helper.js`
  - Isolamento automático
- [ ] Criar `envelope-builder.js`
  - Sem mudanças

#### **Etapa 1.3: Testes Unitários (1h)**
- [ ] Teste: Init execution com isolamento
- [ ] Teste: Save state com JSON serializado
- [ ] Teste: Get last state com deserialização
- [ ] Validar: envelope completo recuperado

---

### **Sprint 2: Integração (Revisado - 3-4h)**

**Sem mudanças significativas, apenas adicionar:**
- Buscar agent de `agents` table antes de processar
- Validar agent exists e está active
- Incluir workflow_id + project_id + webhook_id em TODAS as operações

---

### **Sprint 3: Finalização (Sem mudanças - 2-3h)**

---

### **Sprint 4: Observabilidade (Revisado - 2h)**

**Dashboards ajustados:**
- Execuções por projeto
- Execuções por agente
- Taxa de sucesso por agent_type
- Tempo médio por step + agent

---

## ✅ NOVO PLANO DE AÇÃO

### **Fase Preparatória (HOJE - 2h):**

1. **Criar Cadastros (1h)**
   - [ ] Tabela `projects` no N8N
   - [ ] Tabela `agents` no N8N
   - [ ] Inserir project_001 + 3 agents (001, 002, 003)
   - [ ] Testar: Listar agents via workflow

2. **Ajustar Componentes (1h)**
   - [ ] Revisar `data-table-state-manager.js`
     - JSON.stringify/parse
     - Filtros obrigatórios
   - [ ] Criar `agents-manager.js`
   - [ ] Criar `data-table-helper.js` com isolamento

### **Fase Implementação (AMANHÃ - 6-8h):**

**Sprint 1:** Setup + Testes (2h)
**Sprint 2:** Integração (3h)
**Sprint 3:** Finalização (2h)

### **Validação Final:**
- [ ] Cadastros: projects + agents funcionando
- [ ] Workflow executa com isolamento correto
- [ ] Envelope salvo/recuperado (JSON string)
- [ ] Dashboard mostra execuções por projeto/agente

---

## 🚨 RISCOS REVISADOS

### **Risco 1: Limite de Tamanho String** 🟡
**Problema:** Envelope grande pode exceder limite
**Mitigação:** Monitorar tamanho, split em múltiplas variáveis se necessário

### **Risco 2: Isolamento Manual** 🟡
**Problema:** Esquecer filtro = mistura dados
**Mitigação:** Helper sempre adiciona filtros automaticamente

### **Risco 3: Performance JSON Parse** 🟢
**Problema:** Serializar/deserializar a cada query
**Mitigação:** Acceptable (<10ms), cachear se necessário

---

## 📋 CHECKLIST ATUALIZADO

### **Antes de Começar:**
- [x] Entender limitações reais (string, no JSON, no FK)
- [x] Revisar arquitetura (cadastros + operacional)
- [x] Planejar isolamento (workflow_id + project_id + webhook_id)

### **Cadastros (Sprint 0):**
- [ ] Criar `projects` table
- [ ] Criar `agents` table
- [ ] Inserir dados mestres
- [ ] Componente `agents-manager.js`
- [ ] Validar: Listar agents funciona

### **Operacional (Sprint 1-3):**
- [ ] Criar `wrk_execution` table
- [ ] Criar `wrk_state` table (string para JSON)
- [ ] Ajustar componentes (serialização + filtros)
- [ ] Integrar ao workflow v3
- [ ] Testar end-to-end

### **Observabilidade (Sprint 4):**
- [ ] Dashboard por projeto
- [ ] Dashboard por agente
- [ ] Métricas de performance

---

## 🎯 DECISÃO FINAL

**Nova Arquitetura:**
1. ✅ 4 Tabelas (projects, agents, executions, state)
2. ✅ JSON serializado em string (não JSONB)
3. ✅ Isolamento manual (workflow_id + project_id + webhook_id sempre)
4. ✅ Relacionamentos gerenciados em código (não FK)
5. ✅ Cadastros primeiro, operacional depois

**Ação Imediata:**
Criar Sprint 0 (Cadastros) ANTES de continuar!

**Quer começar criando as tabelas `projects` e `agents` agora?** 🚀
