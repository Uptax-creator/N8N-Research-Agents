# 🤖 Enhanced Research Agent v2.0 - Instruções de Uso

## 🎯 **OVERVIEW**

Enhanced AI Agent que combina:
- ✅ **GitHub Dynamic Loading** (nosso sistema validado)
- ✅ **LangChain Integration** (n8n nativo)
- ✅ **Multi-tool Support** (SerpAPI + Perplexity)
- ✅ **Advanced Processing** (prompt + response formatters)
- ✅ **Memory System** (conversational context)

---

## 🏗️ **ESTRUTURA DO WORKFLOW**

### **Nodes (Total: 11):**
```
1. Webhook Enhanced (entrada)
2. Load GitHub Config (HTTP Request - JSON)
3. Load GitHub Prompts (HTTP Request - JSON)
4. Load Prompt Processor (HTTP Request - TEXT)
5. Prompt Processor (Code Node)
6. Enhanced AI Agent (LangChain Agent)
7. OpenAI Model (Language Model)
8. Buffer Memory (Memory)
9. SerpAPI Tool (Search Tool)
10. Load Response Formatter (HTTP Request - TEXT)
11. Response Formatter (Code Node)
12. Respond Enhanced (saída)
```

---

## 🔧 **CONFIGURAÇÃO MANUAL**

### **Importar Workflow:**
1. **Copie** o conteúdo de `enhanced-research-agent-langchain.json`
2. **Import Workflow** no n8n
3. **Configure credentials** necessárias

### **Credentials Necessárias:**
- **OpenAI API** (ou configure OpenRouter)
- **SerpAPI** (para search)
- *Opcional*: **Perplexity API** (via custom tool)

---

## 📊 **CONFIGURAÇÃO DE NODES**

### **Node 5: Prompt Processor**
```javascript
const githubConfig = $('Load GitHub Config').item.json.body || $('Load GitHub Config').item.json; const githubPrompts = $('Load GitHub Prompts').item.json.body || $('Load GitHub Prompts').item.json; const processorCode = $('Load Prompt Processor').item.json.data; const inputData = $('Webhook Enhanced').item.json.body; const executeFunction = new Function('$', 'console', 'Date', processorCode); return executeFunction((nodeName) => ({ item: { json: nodeName === 'Load GitHub Config' ? { body: githubConfig } : nodeName === 'Load GitHub Prompts' ? { body: githubPrompts } : nodeName === 'Webhook Enhanced' ? { body: inputData } : {} } }), console, Date);
```

### **Node 11: Response Formatter**
```javascript
const aiResponse = $('Enhanced AI Agent').item.json; const processorData = $('Prompt Processor').item.json; const formatterCode = $('Load Response Formatter').item.json.data; const executeFunction = new Function('$', 'console', 'Date', formatterCode); return executeFunction((nodeName) => ({ item: { json: nodeName === 'Enhanced AI Agent' ? aiResponse : nodeName === 'Prompt Processor' ? processorData : {} } }), console, Date);
```

---

## 🧪 **EXEMPLOS DE TESTE**

### **Teste 1: Research Básico**
```json
{
  "query": "Como implementar microserviços com Docker e Kubernetes?",
  "research_type": "technical_analysis",
  "output_format": "research",
  "depth": "standard",
  "session_id": "test_session_1"
}
```

### **Teste 2: Executive Summary**
```json
{
  "query": "Tendências de AI em 2025 para empresas",
  "research_type": "executive_summary",
  "output_format": "summary",
  "tone": "executive",
  "session_id": "exec_session_1"
}
```

### **Teste 3: Comparative Analysis**
```json
{
  "query": "Comparar AWS vs Azure vs Google Cloud para startups",
  "research_type": "comparative_analysis",
  "output_format": "analysis",
  "criteria": "cost, scalability, ease of use",
  "session_id": "compare_session_1"
}
```

### **Teste 4: JSON Output**
```json
{
  "query": "Melhores práticas de segurança em APIs REST",
  "research_type": "comprehensive_research",
  "output_format": "json",
  "depth": "deep",
  "session_id": "security_session_1"
}
```

---

## 📈 **RESPOSTA ESPERADA**

### **Formato Research:**
```json
{
  "success": true,
  "agent": "enhanced-research-agent",
  "version": "2.0.0",
  "query": "Como implementar microserviços...",
  "research_type": "technical_analysis",
  "result": "# Research Report: Como implementar microserviços...\n\n## Executive Summary\n...\n\n## Key Findings\n...",
  "metadata": {
    "tools_used": ["langchain_agent", "serpapi"],
    "confidence_score": 0.87,
    "processing_time_ms": 12500,
    "session_id": "test_session_1",
    "quality_metrics": {
      "source_count": 5,
      "confidence_score": 0.87,
      "completeness_score": 0.92
    }
  },
  "github_integration": {
    "status": "SUCCESS",
    "config_version": "2.0.0",
    "template_used": "technical_analysis_format"
  }
}
```

---

## 🔄 **PERSONALIZAÇÃO**

### **Para adicionar OpenRouter:**
1. **Substitua** OpenAI Model node por HTTP Request
2. **Configure** endpoint: `https://openrouter.ai/api/v1/chat/completions`
3. **Use** model: `microsoft/wizardlm-2-8x22b`

### **Para adicionar Perplexity Tool:**
1. **Crie** Custom Tool node
2. **Configure** API: `https://api.perplexity.ai/chat/completions`
3. **Use** model: `llama-3.1-sonar-large-128k-online`

### **Para customizar prompts:**
1. **Edite** arquivos no GitHub
2. **Git push**
3. **Teste** imediatamente (cache 5min)

---

## 🎯 **VANTAGENS**

### **Vs Agente Anterior:**
- ✅ **LangChain integration** - Tools nativos
- ✅ **Memory system** - Contexto conversacional
- ✅ **Advanced processing** - Parsing inteligente
- ✅ **Quality metrics** - Scoring automático
- ✅ **Multiple formats** - JSON, Markdown, Summary

### **Vs Soluções Comerciais:**
- ✅ **GitHub deployment** - Deploy instantâneo
- ✅ **Multi-provider** - OpenAI, OpenRouter, Gemma
- ✅ **Cost control** - Modelo flexível
- ✅ **Full customization** - Prompts sob controle

---

## 🚀 **PRÓXIMOS PASSOS**

### **Após teste validado:**
1. **Configurar OpenRouter** (models 120GB)
2. **Adicionar Perplexity API** integration
3. **Criar outros agentes** (Code Assistant, etc.)
4. **Launch comercial** com pricing tiers

---

## ⚠️ **IMPORTANTE**

- **Código em UMA LINHA** nos Code Nodes
- **Credentials configuradas** antes de testar
- **GitHub URLs corretas** (branch clean-deployment)
- **Session IDs únicos** para memory

---

**Webhook URL:** `https://primary-production-56785.up.railway.app/webhook/enhanced-research-agent`

**Status:** Pronto para teste MVP
**Versão:** 2.0.0
**Data:** 16/09/2025