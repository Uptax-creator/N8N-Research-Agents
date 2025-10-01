# 🚀 Deploy Manual - Prompts v2.6 Force-Tools

## 📁 Arquivos para Upload no GitHub

Faça upload dos seguintes arquivos para o repositório `Uptax-creator/N8N-Research-Agents` branch `clean-deployment`:

### 📂 Destino: `/prompts/agents/`

1. **agent_001_enhanced_research_v2.6.json**
   - Enhanced Research com force search_engine()
   - Bright Data MCP integration
   - Mandatory tool execution

2. **agent_002_fiscal_research_v2.6.json**
   - Fiscal Research com force search_engine(site:gov.br)
   - Bright Data MCP integration
   - Government sites focus

3. **agent_003_gdocs_documentation_v2.6.json**
   - GDocs Documentation com force GOOGLEDOCS_CREATE_DOCUMENT()
   - Composio MCP integration
   - Real document creation

## 🔗 URLs Resultantes

Após upload, os arquivos estarão disponíveis em:

```
https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/prompts/agents/agent_001_enhanced_research_v2.6.json
https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/prompts/agents/agent_002_fiscal_research_v2.6.json
https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/prompts/agents/agent_003_gdocs_documentation_v2.6.json
```

## ✅ Commit Message Sugerida

```
feat: Add force-tool-usage prompts v2.6

- Implements mandatory tool execution language
- Forces MCP tool usage for all agents
- Adds execution tracking with session IDs
- Solves tool activation issues in workflows

🚀 Generated with Claude Code
```

## 🧪 Teste Após Deploy

```bash
curl -X POST "https://primary-production-56785.up.railway.app/webhook/work-1001_mvp" \
  -H "Content-Type: application/json" \
  -d '{"query": "teste force-tools v2.6", "agent_id": "agent_001"}'
```

**Resultado esperado:** Agent executa search_engine() obrigatoriamente