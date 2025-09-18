# 🔧 Código Simplificado - Prompt Processor

## Para o Node 5: Prompt Processor

**REMOVA** todo o código atual e **COLE** este código simplificado:

```javascript
const config = $('Load GitHub Config').item.json.body; const prompts = $('Load GitHub Prompts').item.json.body; const inputData = $('Webhook Enhanced').item.json.body; const researchType = inputData.research_type || 'comprehensive_research'; const systemPrompt = prompts.system_prompts.base_system + '\n\n' + prompts.system_prompts.tool_selection; const taskPrompt = prompts.task_prompts[researchType].replace('{query}', inputData.query).replace('{context}', inputData.context || 'General context'); const sessionId = inputData.session_id || 'session_' + Date.now(); return [{ text: taskPrompt, session_id: sessionId, system_message: systemPrompt, config: config, research_type: researchType, output_format: inputData.output_format || 'research' }];
```

## ⚠️ IMPORTANTE:
- **UMA LINHA SÓ** - não quebrar o código
- **Substituir completamente** o código anterior
- **Salvar** o workflow depois de alterar

## 🎯 Para testar depois:
```bash
curl -X POST https://primary-production-56785.up.railway.app/webhook/enhanced-research-agent \
  -H "Content-Type: application/json" \
  -d '{"query": "Teste simples", "session_id": "test_003"}'
```