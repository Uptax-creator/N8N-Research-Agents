# 🤖 Meta Single Agent v2.0 - Documentação Completa

## 🎯 **Visão Geral**

O Meta Single Agent v2.0 é uma arquitetura modular de automação IA que unifica múltiplos agentes especializados em um único workflow N8N, utilizando o padrão envelope para transferência de dados e componentes GitHub para máxima flexibilidade.

## 🏗️ **Arquitetura v2.0**

### 📦 **Padrão Envelope Unificado**
```javascript
const envelope_v2 = {
  envelope_metadata: {
    version: '2.0-modular',
    pipeline_components: ['pre-obs', 'csv-loader', 'post-obs', 'prepare-agent', 'optimizer'],
    tracking_ids: {
      session_id: 'session_1234567890',
      execution_id: 'exec_agent_001_20251001_143022',
      trace_id: 'trace_project_001_1234567890',
      agent_id: 'agent_001',
      project_id: 'project_001',
      workflow_id: 'work-1001_mvp'
    }
  },
  webhook_data: {
    query: 'user input query',
    agent_id: 'agent_001',
    project_id: 'project_001',
    format: 'comprehensive_research',
    metadata: { version: '2.0', source: 'frontend' }
  },
  agent_config: {
    agent_id: 'agent_001',
    agent_type: 'enhanced_research',
    mcp_provider: 'bright_data',
    tools: ['search_engine', 'scrape_as_markdown'],
    prompt_url: 'https://raw.githubusercontent.com/...',
    webhook_endpoint: 'work-1001_mvp'
  },
  observability_data: {
    metrics: { start_time: '2025-10-01T14:30:22Z', performance: {} },
    logs: [],
    errors: [],
    tracking_stack: []
  },
  optimization_data: {
    pre: { query_analysis: {}, agent_selection_score: 0.95 },
    runtime: { timeout_adjustment: 120, fallback_strategy: 'agent_fallback' },
    post: { quality_score: 0.89, performance_metrics: {} }
  },
  session_state: {
    stage: 'initialized',
    csv_loaded: false,
    agent_found: false,
    mcp_status: 'unknown',
    components_executed: []
  }
}
```

### 🔄 **Pipeline de Execução**
```
Webhook Input
    ↓
[1. Pre-Observability] → Gera tracking IDs, captura input, inicializa envelope
    ↓
[2. CSV Loader] → Carrega config do GitHub ou usa frontend parametrizado
    ↓
[3. Post-Load Observability] → Captura config carregado, valida MCP endpoints
    ↓
[4. Prepare Agent] → Monta prompts com force-tools, configura MCP
    ↓
[5. Pre-LLM Observability] → Captura prompts finais, predição de performance
    ↓
[6. Optimization Engine] → Query optimization, agent tuning, timeout adjustment
    ↓
[7. AI Agent (LLM)] → Execução do modelo com MCP tools
    ↓
[8. Post-LLM Observability] → Métricas finais, quality scoring
    ↓
[9. Response Formatter] → Formatação final da resposta
    ↓
Output JSON
```

## 🧩 **Componentes Modulares**

### 📁 **Estrutura GitHub**
```
/components/
├── observability/
│   ├── pre-observability-v2.0.js
│   ├── post-load-observability-v2.0.js
│   ├── pre-llm-observability-v2.0.js
│   └── post-llm-observability-v2.0.js
├── optimization/
│   ├── optimization-engine-v2.0.js
│   ├── query-optimizer-v2.0.js
│   └── performance-tuner-v2.0.js
├── core/
│   ├── csv-loader-v2.6.js
│   ├── prepare-agent-v2.6.js
│   └── response-formatter-v2.0.js
└── prompts/
    ├── agent_001_enhanced_research_v2.6.json
    ├── agent_002_fiscal_research_v2.6.json
    └── agent_003_gdocs_documentation_v2.6.json
```

### ⚙️ **Configuração CSV/JSON**
```csv
workflow_id,project_id,agent_id,components_chain,observability_config,optimization_config
work-1001_mvp,project_001,agent_001,"pre-obs-v2.0.js|csv-loader-v2.6.js|post-obs-v2.0.js|prepare-agent-v2.6.js|optimization-v2.0.js","console+redis+looker","pre+runtime+post"
work-1001_mvp,project_001,agent_002,"pre-obs-v2.0.js|csv-loader-v2.6.js|post-obs-v2.0.js|prepare-agent-v2.6.js|optimization-v2.0.js","console+redis","pre+post"
evaluation-mvp,project_obs,agent_obs,"pre-obs-v2.0.js|evaluation-processor-v2.0.js|post-obs-v2.0.js","console+redis+looker","full"
```

## 🎯 **Agentes Disponíveis**

### 🔍 **Agent 001 - Enhanced Research**
- **Especialidade**: Pesquisa de mercado brasileiro
- **MCP Provider**: Bright Data
- **Tools**: search_engine, scrape_as_markdown
- **Endpoint**: work-1001_mvp
- **Prompt URL**: agent_001_enhanced_research_v2.6.json

### ⚖️ **Agent 002 - Fiscal Research**
- **Especialidade**: Legislação fiscal e tributária
- **MCP Provider**: Bright Data
- **Tools**: search_engine (site:gov.br), scrape_as_markdown
- **Endpoint**: work-1001_mvp
- **Prompt URL**: agent_002_fiscal_research_v2.6.json

### 📄 **Agent 003 - GDocs Documentation**
- **Especialidade**: Criação de documentos Google Docs
- **MCP Provider**: Composio
- **Tools**: GOOGLEDOCS_CREATE_DOCUMENT_MARKDOWN, GOOGLEDOCS_INSERT_TABLE_ACTION
- **Endpoint**: work-1001_mvp
- **Prompt URL**: agent_003_gdocs_documentation_v2.6.json

## 📊 **Sistema de Observabilidade**

### 🎯 **Tracking IDs**
```javascript
const trackingIds = {
  agent_id: 'agent_001',
  project_id: 'project_001',
  workflow_id: 'work-1001_mvp',
  session_id: 'session_1234567890',
  execution_id: 'exec_agent_001_20251001_143022',
  trace_id: 'trace_project_001_1234567890'
}
```

### 📈 **Storage Híbrido**
1. **Console Logs**: Sempre ativo para debugging
2. **Redis/Upstash**: Métricas tempo real, cache de performance
3. **MCP Looker**: Dashboards visuais automáticos

### 🔍 **Métricas Capturadas**
- Performance por agent_id e project_id
- Success/failure rates
- Tool execution timing
- Query processing metrics
- MCP endpoint health
- Quality scoring

## ⚡ **Sistema de Otimização**

### 🎯 **Pre-Agent Optimization**
- Query analysis e enhancement
- Agent selection scoring
- MCP endpoint health check
- Performance prediction

### 🔄 **Runtime Optimization**
- Force-tools injection
- Timeout adjustment baseado na query
- Fallback strategy definition
- Error handling enhancement

### 📊 **Post-Agent Optimization**
- Result quality scoring
- Performance metrics analysis
- Next execution hints
- Continuous improvement feedback

## 🚀 **Endpoints de Teste**

### 🔗 **Produção**
- **work-1001_mvp**: https://primary-production-56785.up.railway.app/webhook/work-1001_mvp
- **evaluation-mvp**: https://primary-production-56785.up.railway.app/webhook/evaluation-mvp

### 🧪 **Payload de Teste**
```json
{
  "query": "análise do mercado brasileiro de tecnologia 2025",
  "agent_id": "agent_001",
  "project_id": "project_001",
  "format": "comprehensive_research",
  "metadata": {
    "version": "2.0",
    "source": "frontend"
  }
}
```

## 💻 **Interface Frontend**

### 📱 **Páginas Disponíveis**
- **Menu Principal**: /tmp/claude/frontend-menu-index.html
- **Agent Tester**: /tmp/claude/frontend-agent-tester.html
- **Dual Workflow**: /tmp/claude/frontend-dual-workflow-v2.6.html

### 🎮 **Funcionalidades**
- Teste individual de agentes
- Comparação lado a lado de workflows
- Configuração parametrizada via frontend
- Eliminação da dependência de CSV

## 🔧 **Configuração e Deploy**

### 📋 **Requisitos**
- N8N workflow engine
- MCP Bright Data configurado
- MCP Composio configurado
- Redis/Upstash para métricas
- GitHub para componentes

### 🚀 **Deploy Steps**
1. Upload componentes v2.0 para GitHub
2. Atualizar CSV com components_chain
3. Configurar MCP endpoints
4. Testar pipeline completo
5. Ativar observabilidade híbrida

## 📈 **Métricas de Sucesso**

### ✅ **KPIs**
- **Tool Activation Rate**: > 95%
- **Query Success Rate**: > 90%
- **Average Response Time**: < 30s
- **Quality Score**: > 0.85
- **MCP Uptime**: > 99%

### 🎯 **Troubleshooting**
- Logs estruturados por tracking_id
- Error isolation por componente
- Performance bottleneck identification
- MCP health monitoring

## 🔄 **Roadmap v3.0**

### 📋 **Próximas Features**
- Agent Creator visual interface
- Project Manager dashboard
- MCP Tools Manager
- Auto-scaling baseado em demanda
- Machine learning para otimização

---

## 📞 **Support & Docs**

**Version**: 2.0-modular
**Created**: 2025-10-01
**Updated**: 2025-10-01
**Status**: Ready for Homologation

🚀 Generated with Claude Code