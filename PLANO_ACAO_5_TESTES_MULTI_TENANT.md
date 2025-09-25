# 🎯 Plano de Ação: 5 Testes Multi-Tenant Architecture

## ✅ **Status Atual - Conquistas**
- **Lógica Multi-Tenant**: FUNCIONANDO
- **2 Agentes Testados**: Agent 001 e 002 validados
- **Mudança de Prompts**: Via CSV dinâmico funcionando
- **Base de Referência**: Business Plan Agent V4 como estrutura sólida

---

## 🧪 **TESTE 2: Alteração de Código Dinâmica**

### **Objetivo**
Permitir que agentes retornem diferentes formatos de saída conforme necessário:
- **MD**: Documentação e relatórios
- **JSON**: Dados estruturados para APIs
- **HTML**: Interfaces e dashboards

### **Implementação Proposta**
```javascript
// Response Formatter Dinâmico
const outputFormat = processorData.agent_config?.output_format || 'json';

switch(outputFormat) {
  case 'markdown':
    return formatAsMarkdown(result);
  case 'html':
    return formatAsHTML(result);
  case 'json':
  default:
    return formatAsJSON(result);
}
```

### **CSV Extension**
```csv
workflow_id,project_id,agent_id,agent_type,description,prompt_url,processor_url,mcp_endpoint,tools_config_url,output_format
uptax-proc-1001-dynamic,project_001,agent_001,enhanced_research,Brazilian market research,(...),(...),(...),(...),markdown
```

---

## 🔧 **TESTE 3: MCPs Dinâmicos**

### **Desafio Identificado**
N8N MCP Client Tool requer endpoint **estático** na configuração, não dinâmico durante execução.

### **Estratégias a Pesquisar**
1. **Multiple MCP Nodes**: Um MCP Client por tipo de servidor
2. **Conditional MCP Selection**: Usar Switch node para selecionar MCP
3. **HTTP Request Fallback**: Para MCPs que suportam HTTP direto
4. **Dynamic Tool Loading**: Investigar se possível via LangChain

### **Pesquisa Necessária**
- N8N LangChain Agent dynamic tool selection
- MCP protocol HTTP vs SSE compatibility
- Conditional tool activation patterns

---

## 🔗 **TESTE 4: Sub-Agentes (Pipeline)**

### **Conceito**
Encadear agentes para pipelines complexos:
```
Agent_001 (Research) → Agent_002 (Analysis) → Agent_003 (Documentation)
```

### **Implementação Via CSV**
```csv
workflow_id,project_id,agent_id,agent_type,description,pipeline_next,pipeline_trigger
uptax-proc-1001-dynamic,project_001,agent_001,research,Market Research,agent_002,auto
uptax-proc-1001-dynamic,project_001,agent_002,analysis,Data Analysis,agent_003,conditional
uptax-proc-1001-dynamic,project_001,agent_003,documentation,Final Report,null,manual
```

### **Flow Control**
- **Auto**: Executa próximo agente automaticamente
- **Conditional**: Baseado em critérios (ex: confidence > 0.8)
- **Manual**: Requer confirmação do usuário

---

## 🤖 **TESTE 5: Seleção de LLM Dinâmica**

### **Objetivos**
- Gemini 2.0 Flash: Velocidade e cost-efficiency
- GPT-4: Tarefas complexas de raciocínio
- Claude: Análise de código e documentação
- Ollama: Processamento local/privado

### **CSV Extension**
```csv
workflow_id,project_id,agent_id,llm_provider,llm_model,llm_config
uptax-proc-1001-dynamic,project_001,agent_001,google,gemini-2.0-flash,{"temperature":0.3}
uptax-proc-1001-dynamic,project_001,agent_002,openai,gpt-4-turbo,{"temperature":0.1}
```

### **N8N Implementation Challenge**
LangChain nodes também precisam de configuração estática de LLM. Pesquisa necessária sobre dynamic model selection.

---

## 📊 **ETAPA 2: Arquitetura de 8 Workflows**

### **Estrutura Proposta**

#### **Tier 1: Core Workflows (4)**
1. `uptax-proc-1001-bright-data` - Brazilian Research (Bright Data MCP)
2. `uptax-proc-1001-composio` - Brazilian Docs (Composio MCP)
3. `uptax-proc-1002-perplexity` - Global Research (Perplexity API)
4. `uptax-proc-1002-github` - Code Analysis (GitHub MCP)

#### **Tier 2: Specialized Workflows (4)**
5. `uptax-proc-2001-financial` - Financial Analysis
6. `uptax-proc-2002-legal` - Legal Compliance
7. `uptax-proc-2003-marketing` - Marketing Intelligence
8. `uptax-proc-2004-operations` - Operations Automation

### **Escalabilidade**
- Cada workflow: 1-3 agentes especializados
- Total: 8-24 agentes distintos
- CSV registry: Single source of truth para todos

---

## 🎯 **Próximos Passos**

### **Imediato (Esta Semana)**
1. **Teste 2**: Implementar output formats (MD/JSON/HTML)
2. **Teste 3**: Pesquisar MCP dinâmico + consultar especialistas
3. **Validar Agent 003**: Resolver timeout do Composio

### **Próxima Semana**
1. **Teste 4**: Sub-agentes e pipeline
2. **Teste 5**: LLM selection research
3. **Etapa 2**: Arquitetura de 8 workflows

---

## ❓ **Perguntas para Especialistas**

### **Equipe N8N**
1. É possível dynamic MCP Client Tool selection durante runtime?
2. Como implementar conditional LangChain model selection?
3. Padrões recomendados para sub-agent pipelines?
4. Performance implications de 8+ workflows simultâneos?

### **Equipe VibeCode**
1. Arquitetura multi-tenant escalável recomendada?
2. Strategy pattern para dynamic output formatting?
3. Pipeline orchestration best practices?
4. Monitoring e observability para sistema distribuído?

**Status:** Pronto para consultas e pesquisa com MCP Gemini 🚀