# 🌐 GUIA DE INTEGRAÇÃO FRONTEND

## 📋 Resumo de Endpoints Disponíveis

| Endpoint | Método | Status | Descrição |
|----------|--------|--------|-----------|
| `/webhook/insert_agent` | POST | ✅ Funcional | Insere novo agent |
| `/webhook/insert_project` | POST | 📦 Pronto | Insere novo project |
| `/webhook/get_project` | GET | ✅ Funcional | Busca project por ID |
| `/webhook/get_agent` | GET | ⏳ Pendente | Busca agent por ID |

**Base URL:** `https://primary-production-56785.up.railway.app`

---

## 🔧 1. INSERT AGENT

### Endpoint
```
POST https://primary-production-56785.up.railway.app/webhook/insert_agent
```

### Request Body
```json
{
  "agent_id": "agent_001",
  "project_id": "project_001",
  "workflow_id": "EJasUbpzoUUFzmzK",
  "webhook_id": "work_1001",
  "webhook_url": "https://primary-production-56785.up.railway.app/webhook/work_1001",
  "agent_name": "Enhanced Research Agent",
  "agent_type": "research",
  "description": "Advanced research agent with Brazilian market focus"
}
```

### Response (Success)
```json
[{
  "id": 19,
  "createdAt": "2025-10-08T11:18:55.411Z",
  "updatedAt": "2025-10-08T11:18:55.411Z",
  "agent_id": "agent_001",
  "project_id": "project_001",
  "workflow_id": "EJasUbpzoUUFzmzK",
  "webhook_id": "work_1001",
  "webhook_url": "https://primary-production-56785.up.railway.app/webhook/work_1001",
  "agent_name": "Enhanced Research Agent",
  "agent_type": "research",
  "description": "Advanced research agent with Brazilian market focus and proactive analysis capabilities",
  "github_config_url": "https://github.com/Uptax-creator/N8N-Research-Agents/raw/clean-deployment/N8N/agents/agent_001/config.json",
  "github_prompts_url": "https://github.com/Uptax-creator/N8N-Research-Agents/raw/clean-deployment/N8N/prompts/agents/agent_001_prompts.json",
  "status": "active"
}]
```

### Exemplo JavaScript (Fetch)
```javascript
async function insertAgent(agentData) {
  const response = await fetch('https://primary-production-56785.up.railway.app/webhook/insert_agent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(agentData)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Uso
const newAgent = {
  agent_id: "agent_004",
  project_id: "project_001",
  workflow_id: "EJasUbpzoUUFzmzK",
  webhook_id: "work_1001",
  webhook_url: "https://primary-production-56785.up.railway.app/webhook/work_1001",
  agent_name: "Custom Agent",
  agent_type: "custom",
  description: "My custom agent description"
};

const result = await insertAgent(newAgent);
console.log('Agent created:', result[0].id);
```

### Exemplo React Hook
```javascript
import { useState } from 'react';

function useInsertAgent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const insertAgent = async (agentData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://primary-production-56785.up.railway.app/webhook/insert_agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData)
      });

      if (!response.ok) {
        throw new Error('Failed to insert agent');
      }

      const data = await response.json();
      return data[0];
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { insertAgent, loading, error };
}

// Uso no componente
function MyComponent() {
  const { insertAgent, loading, error } = useInsertAgent();

  const handleSubmit = async (formData) => {
    const agent = await insertAgent(formData);
    console.log('Created agent:', agent.agent_id);
  };

  return (
    <div>
      {loading && <p>Creating agent...</p>}
      {error && <p>Error: {error}</p>}
      {/* Seu formulário aqui */}
    </div>
  );
}
```

---

## 🔧 2. INSERT PROJECT

### Endpoint
```
POST https://primary-production-56785.up.railway.app/webhook/insert_project
```

### Request Body
```json
{
  "project_name": "UPTAX Meta Agent System",
  "company_name": "UPTAX Soluções Tributárias",
  "description": "Sistema multi-agente para pesquisa fiscal",
  "created_by": "kleber.ribeiro@uptax.com.br",
  "tags": "multi-agent, n8n, fiscal-research"
}
```

### Response (Success)
```json
{
  "success": true,
  "project_id": "PROJ-001",
  "message": "Project created successfully",
  "data": {
    "project_id": "PROJ-001",
    "project_name": "UPTAX Meta Agent System",
    "company_name": "UPTAX Soluções Tributárias",
    "description": "Sistema multi-agente para pesquisa fiscal",
    "created_by": "kleber.ribeiro@uptax.com.br",
    "is_active": true,
    "tags": "multi-agent, n8n, fiscal-research"
  }
}
```

### Exemplo JavaScript
```javascript
async function insertProject(projectData) {
  const response = await fetch('https://primary-production-56785.up.railway.app/webhook/insert_project', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}
```

---

## 🔧 3. GET PROJECT

### Endpoint
```
GET https://primary-production-56785.up.railway.app/webhook/get_project?project_id=PROJ-001
```

### Response (Success)
```json
{
  "success": true,
  "project": {
    "project_id": "PROJ-001",
    "project_name": "UPTAX Meta Agent System",
    "company_name": "UPTAX Soluções Tributárias",
    "description": "Sistema multi-agente",
    "created_by": "kleber.ribeiro@uptax.com.br",
    "is_active": true,
    "tags": "multi-agent, n8n"
  }
}
```

### Exemplo JavaScript
```javascript
async function getProject(projectId) {
  const response = await fetch(`https://primary-production-56785.up.railway.app/webhook/get_project?project_id=${projectId}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result.project;
}
```

---

## 🔧 4. GET AGENT (⏳ Pendente)

### Endpoint Planejado
```
GET https://primary-production-56785.up.railway.app/webhook/get_agent?agent_id=agent_001
```

### Response Esperada
```json
{
  "success": true,
  "agent": {
    "agent_id": "agent_001",
    "project_id": "project_001",
    "agent_name": "Enhanced Research Agent",
    "agent_type": "research",
    "description": "Advanced research agent",
    "status": "active",
    "github_config_url": "https://github.com/.../config.json",
    "github_prompts_url": "https://github.com/.../prompts.json"
  }
}
```

---

## 📊 Estado Atual do Banco de Dados

### Tabela: `agents`
| ID | agent_id | agent_name | agent_type | status |
|----|----------|------------|------------|--------|
| 19 | agent_001 | Enhanced Research Agent | research | active |
| 20 | agent_002 | Fiscal Research Agent | fiscal_research | active |
| 21 | agent_003 | GDocs Documentation Agent | documentation | active |

### Tabela: `cad_projects`
*Aguardando primeiro INSERT PROJECT*

---

## 🎯 Roadmap Frontend

### ✅ Fase 1: CRUD Básico (Atual)
- [x] INSERT AGENT
- [x] INSERT PROJECT (código pronto)
- [x] GET PROJECT
- [ ] GET AGENT (próximo)

### 📋 Fase 2: Listagens
- [ ] GET ALL AGENTS
- [ ] GET ALL PROJECTS
- [ ] Filtros e busca

### 🔄 Fase 3: Updates
- [ ] UPDATE AGENT
- [ ] UPDATE PROJECT
- [ ] Soft delete

### 🎨 Fase 4: Interface
- [ ] Dashboard com cards
- [ ] Formulários de criação
- [ ] Tabelas de listagem
- [ ] Integração com workflow execution

---

## 🛠️ Exemplo de Componente React Completo

```javascript
import React, { useState, useEffect } from 'react';

const API_BASE = 'https://primary-production-56785.up.railway.app/webhook';

function AgentManager() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Criar novo agent
  const createAgent = async (agentData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/insert_agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData)
      });
      const result = await response.json();
      setAgents([...agents, result[0]]);
      return result[0];
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Buscar project
  const fetchProject = async (projectId) => {
    try {
      const response = await fetch(`${API_BASE}/get_project?project_id=${projectId}`);
      const result = await response.json();
      return result.project;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  };

  return (
    <div>
      <h1>Agent Manager</h1>
      {loading && <p>Loading...</p>}
      <ul>
        {agents.map(agent => (
          <li key={agent.id}>
            {agent.agent_name} ({agent.agent_type})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AgentManager;
```

---

## 🔍 Troubleshooting

### CORS Issues
Se encontrar problemas de CORS, verifique se o N8N está configurado para aceitar requisições do seu domínio.

### Timeout
Algumas operações podem demorar. Configure timeout adequado:
```javascript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s

fetch(url, { signal: controller.signal })
  .finally(() => clearTimeout(timeoutId));
```

### Error Handling
Sempre implemente tratamento de erros robusto:
```javascript
try {
  const result = await insertAgent(data);
} catch (error) {
  if (error.name === 'AbortError') {
    console.error('Request timeout');
  } else if (error.message.includes('HTTP')) {
    console.error('Server error:', error.message);
  } else {
    console.error('Network error:', error);
  }
}
```

---

## 📞 Suporte

- **Documentação N8N:** https://docs.n8n.io
- **GitHub:** https://github.com/Uptax-creator/N8N-Research-Agents
- **Branch:** clean-deployment
