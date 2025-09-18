# 🤖 ENHANCED AI AGENT - PLANO DE PROJETO

## 🎯 **OBJETIVO**

Criar AI Agent LangChain-powered que combina:
- Nossa arquitetura GitHub dynamic loading
- LangChain tools (SerpAPI, Perplexity)
- OpenRouter/Gemma integration
- Estrutura padronizada de resposta
- Memory system para contexto

---

## 📊 **COMPONENTES DO SISTEMA**

### **1. Core Architecture**
```yaml
Webhook Input:
  - Query/research request
  - Session ID for memory
  - Output format preference
  - Tool selection hints

GitHub Dynamic Loading:
  - Agent configuration
  - Prompt templates
  - Response formats
  - Tool routing rules

LangChain Processing:
  - Language Model (OpenRouter/Gemma)
  - Tools (SerpAPI, Perplexity)
  - Memory (conversation context)
  - Agent orchestration

Structured Output:
  - Standardized JSON response
  - Research results
  - Source citations
  - Confidence metrics
```

### **2. Node Structure**
```
1. Webhook (Input)
2. Load GitHub Config (HTTP Request)
3. Load GitHub Prompts (HTTP Request)
4. Prompt Processor (Code Node)
5. LangChain AI Agent
   ├── OpenRouter/Gemma Model
   ├── SerpAPI Tool
   ├── Perplexity Tool (via HTTP)
   └── Memory System
6. Response Formatter (Code Node)
7. Respond to Webhook (Output)
```

---

## 🔧 **COMPONENTE 1: GITHUB CONFIGURATION**

### **Agent Config Structure:**
```json
{
  "agent_name": "enhanced-research-agent",
  "version": "2.0.0",
  "type": "langchain_agent",
  "description": "Enhanced AI research agent with multiple tools and memory",
  "
  "tools_config": {
    "primary_llm": "openrouter",
    "models": {
      "openrouter": {
        "model": "microsoft/wizardlm-2-8x22b",
        "max_tokens": 4000,
        "temperature": 0.7
      },
      "gemma": {
        "model": "gemma-2-27b-it",
        "max_tokens": 3000,
        "temperature": 0.6
      }
    },
    "search_tools": {
      "serpapi": {
        "priority": 1,
        "use_for": ["general_search", "current_events", "facts"]
      },
      "perplexity": {
        "priority": 2,
        "use_for": ["research", "analysis", "technical_queries"]
      }
    }
  },

  "memory_config": {
    "type": "buffer_window",
    "max_messages": 10,
    "context_window": 4000
  },

  "output_formats": {
    "research": "comprehensive_research",
    "summary": "executive_summary",
    "analysis": "detailed_analysis",
    "comparison": "comparative_analysis"
  }
}
```

---

## 🔧 **COMPONENTE 2: PROMPT TEMPLATES**

### **Dynamic Prompt System:**
```json
{
  "agent_name": "enhanced-research-agent",
  "version": "2.0.0",
  "
  "system_prompts": {
    "base_system": "You are an expert AI research assistant with access to multiple search tools and analytical capabilities. You provide comprehensive, well-sourced research with proper citations and actionable insights.",

    "tool_selection": "Select the most appropriate tool for each query: SerpAPI for general searches and current events, Perplexity for deep research and technical analysis.",

    "research_methodology": "Follow this research process: 1) Analyze the query, 2) Select appropriate tools, 3) Gather information, 4) Cross-reference sources, 5) Synthesize findings, 6) Provide recommendations."
  },

  "task_prompts": {
    "comprehensive_research": "Conduct thorough research on: {query}. Use multiple sources, provide detailed analysis, include statistics and examples, cite all sources, and give practical recommendations.",

    "executive_summary": "Create an executive summary for: {query}. Focus on key insights, business implications, and strategic recommendations. Format for decision-makers.",

    "technical_analysis": "Perform technical analysis of: {query}. Include implementation details, best practices, potential challenges, and step-by-step guidance.",

    "comparative_analysis": "Compare and analyze: {query}. Evaluate pros/cons, use cases, performance metrics, and provide recommendation matrix."
  },

  "output_templates": {
    "research_format": "# Research Results: {query}\n\n## Executive Summary\n{executive_summary}\n\n## Key Findings\n{key_findings}\n\n## Detailed Analysis\n{detailed_analysis}\n\n## Sources & Citations\n{sources}\n\n## Recommendations\n{recommendations}\n\n## Confidence Assessment\n{confidence}",

    "json_structure": {
      "query": "string",
      "research_type": "string",
      "executive_summary": "string",
      "key_findings": ["array"],
      "detailed_analysis": "string",
      "sources": ["array"],
      "recommendations": ["array"],
      "metadata": {
        "tools_used": ["array"],
        "confidence_score": "number",
        "research_depth": "string",
        "processing_time_ms": "number"
      }
    }
  }
}
```

---

## 🔧 **COMPONENTE 3: CODE PROCESSORS**

### **Prompt Processor (Node 4):**
```javascript
// Load GitHub configurations
const config = $('Load GitHub Config').item.json.body;
const prompts = $('Load GitHub Prompts').item.json.body;
const inputData = $('Webhook').item.json.body;

// Determine research type and format
const researchType = inputData.research_type || 'comprehensive_research';
const outputFormat = inputData.output_format || 'research';

// Select appropriate prompt template
const systemPrompt = prompts.system_prompts.base_system + '\n\n' +
                   prompts.system_prompts.tool_selection + '\n\n' +
                   prompts.system_prompts.research_methodology;

const taskPrompt = prompts.task_prompts[researchType] ||
                  prompts.task_prompts.comprehensive_research;

// Build final prompt
const finalPrompt = taskPrompt.replace('{query}', inputData.query || inputData.text);

// Prepare data for LangChain
return [{
  system_message: systemPrompt,
  user_query: finalPrompt,
  session_id: inputData.session_id || 'default_session',
  config: config,
  research_type: researchType,
  output_format: outputFormat
}];
```

### **Response Formatter (Node 6):**
```javascript
// Get AI Agent response and configuration
const aiResponse = $('AI Agent').item.json;
const config = $('Prompt Processor').item.json.config;
const researchType = $('Prompt Processor').item.json.research_type;

// Parse AI response
const responseText = aiResponse.output || aiResponse.text || aiResponse;

// Extract structured information
const extractStructuredData = (text) => {
  // Simple extraction logic - can be enhanced with regex/parsing
  const lines = text.split('\n');
  let summary = '';
  let findings = [];
  let sources = [];

  let currentSection = '';
  for (const line of lines) {
    if (line.includes('Executive Summary') || line.includes('Summary')) {
      currentSection = 'summary';
    } else if (line.includes('Key Findings') || line.includes('Findings')) {
      currentSection = 'findings';
    } else if (line.includes('Sources') || line.includes('References')) {
      currentSection = 'sources';
    } else if (currentSection === 'summary' && line.trim()) {
      summary += line + ' ';
    } else if (currentSection === 'findings' && line.trim().match(/^\d+\.|^-|^\*/)) {
      findings.push(line.trim());
    } else if (currentSection === 'sources' && line.trim().match(/^-|^\*/)) {
      sources.push(line.trim());
    }
  }

  return { summary: summary.trim(), findings, sources };
};

const structured = extractStructuredData(responseText);

// Build standardized response
const standardizedResponse = {
  success: true,
  agent: config.agent_name,
  query: $('Prompt Processor').item.json.user_query,
  research_type: researchType,

  results: {
    executive_summary: structured.summary,
    key_findings: structured.findings,
    detailed_analysis: responseText,
    sources: structured.sources,
    recommendations: [] // Can be extracted similarly
  },

  metadata: {
    tools_used: ['langchain_agent', 'serpapi', 'perplexity'],
    confidence_score: 0.85, // Can be calculated based on sources
    research_depth: researchType,
    processing_time_ms: Date.now() - parseInt(aiResponse.timestamp || Date.now()),
    session_id: $('Prompt Processor').item.json.session_id
  },

  github_integration: {
    status: 'SUCCESS',
    config_version: config.version,
    prompts_loaded: Object.keys(config.tools_config || {}).length
  },

  timestamp: new Date().toISOString()
};

return [standardizedResponse];
```

---

## 🔧 **COMPONENTE 4: OPENROUTER INTEGRATION**

### **OpenRouter Configuration:**
```json
{
  "provider": "openrouter",
  "api_endpoint": "https://openrouter.ai/api/v1/chat/completions",
  "models": {
    "primary": "microsoft/wizardlm-2-8x22b",
    "fallback": "google/gemma-2-27b-it",
    "fast": "meta-llama/llama-3.1-8b-instruct"
  },
  "parameters": {
    "temperature": 0.7,
    "max_tokens": 4000,
    "top_p": 0.9,
    "frequency_penalty": 0.1
  }
}
```

---

## 🔧 **COMPONENTE 5: PERPLEXITY TOOL**

### **Custom Perplexity Integration:**
```javascript
// Custom tool for Perplexity API
const perplexityTool = {
  name: "perplexity_search",
  description: "Advanced research tool for deep analysis and technical queries",

  async execute(query, config) {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.perplexity_api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'user',
            content: `Research and provide detailed analysis on: ${query}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }
};
```

---

## 📊 **ETAPAS DE IMPLEMENTAÇÃO**

### **Sprint 1: Core Setup (Esta semana)**
1. ✅ Criar estrutura GitHub (config + prompts)
2. ✅ Implementar prompt processor
3. ✅ Configurar OpenRouter integration
4. ✅ Testar workflow básico

### **Sprint 2: Tools Integration (Próxima semana)**
1. ✅ Adicionar Perplexity custom tool
2. ✅ Implementar response formatter
3. ✅ Configurar memory system
4. ✅ Testes end-to-end

### **Sprint 3: Enhancement (Semana 3)**
1. ✅ Otimizar performance
2. ✅ Adicionar error handling
3. ✅ Criar múltiplos agentes
4. ✅ Documentação comercial

---

## 🎯 **RESULTADO ESPERADO**

### **Input Example:**
```json
{
  "query": "Como implementar autenticação OAuth2 em microserviços com Node.js?",
  "research_type": "technical_analysis",
  "output_format": "research",
  "session_id": "user_123"
}
```

### **Output Example:**
```json
{
  "success": true,
  "agent": "enhanced-research-agent",
  "query": "Como implementar autenticação OAuth2...",
  "research_type": "technical_analysis",
  "results": {
    "executive_summary": "OAuth2 implementation in Node.js microservices requires...",
    "key_findings": [
      "JWT tokens provide stateless authentication",
      "API Gateway centralizes auth logic",
      "Refresh token rotation enhances security"
    ],
    "detailed_analysis": "# Complete technical implementation guide...",
    "sources": [
      "OAuth2 RFC 6749 specification",
      "Node.js security best practices",
      "Microservices authentication patterns"
    ],
    "recommendations": [
      "Use established libraries like passport-oauth2",
      "Implement proper token validation",
      "Consider API rate limiting"
    ]
  },
  "metadata": {
    "tools_used": ["serpapi", "perplexity", "openrouter"],
    "confidence_score": 0.92,
    "processing_time_ms": 2340
  }
}
```

---

**Status**: Pronto para implementação
**Estimativa**: 1 semana para MVP funcional
**ROI**: Sistema comercial escalável