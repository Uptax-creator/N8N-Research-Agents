# 🔄 CONTEXTO PARA PRÓXIMA JANELA - SPRINT 3 N8N

## **OBJETIVO PRINCIPAL:**
Implementar arquitetura GitHub-hosted com variáveis N8N para sistema multi-agent

## **STATUS ATUAL:**
- ✅ Arquitetura definida (Variables + Static Data + Cache)
- ✅ Estrutura JSON para prompts criada
- ❌ Erro no workflow: "Referenced node doesn't exist"
- ❌ Webhook retorna 404/timeout

## **ARQUIVOS CRÍTICOS:**
1. `/ARQUITETURA_DEFINITIVA_VARIAVEIS.md` - Solução com variables pattern
2. `/ESTRUTURA_ANTES_DEPOIS_AI_AGENT.md` - 7 nodes detalhados
3. `/MULTI_AGENT_ORCHESTRATOR_FUTURO.md` - Evolução multi-agent
4. `/agents/agent_001/prompt.json` - Prompt JSON estruturado

## **PROBLEMAS IDENTIFICADOS:**
```javascript
// ERRO: Referenced node doesn't exist
$('Webhook Enhanced').item.json  // Nome pode estar errado
$('Context Builder').item.json   // Verificar nome exato no N8N
```

## **SOLUÇÃO ARQUITETURAL:**
```
Variables ($vars) → Static Data Cache → GitHub Processors → AI Agent
```

### **Variables Necessárias:**
```
UPTAX_GITHUB_BASE = "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment"
UPTAX_PROJECT_ID = "project_001"
UPTAX_CACHE_TTL_MS = "300000"
```

## **TAREFAS PENDENTES:**

### 1. **Debugging Detalhado**
- [ ] Identificar nomes corretos dos nodes no workflow
- [ ] Corrigir referências `$('NodeName')`
- [ ] Testar webhook step-by-step
- [ ] Validar MCPs individuais

### 2. **Implementação GitHub-Hosted**
- [ ] Deploy processors no GitHub:
  - `context-builder.js`
  - `config-loader-cache.js`
  - `prompt-loader.js`
  - `agent-initializer.js`
  - `response-formatter.js`
- [ ] Criar loader mínimo para nodes N8N
- [ ] Substituir código inline por loaders
- [ ] Testar hot-reload do GitHub

### 3. **Testes Extensivos**
- [ ] Test single agent completo
- [ ] Validar cache TTL (5 min)
- [ ] Testar fallbacks
- [ ] Performance benchmarks

## **CÓDIGO MÍNIMO PARA NODES:**
```javascript
// Cada node N8N deve ter APENAS isso:
const processorUrl = `${$vars.UPTAX_GITHUB_BASE}/code/processors/${processorName}.js`;
const response = await fetch(processorUrl);
const code = await response.text();
const func = new Function('$', 'input', '$vars', code + '\n; return execute(input, $vars);');
return func($, input, $vars);
```

## **TESTE NECESSÁRIO:**
```bash
curl -X POST "https://primary-production-56785.up.railway.app/webhook/work-1001" \
-H "Content-Type: application/json" \
-d '{"project_id": "project_001", "agent_id": "agent_001", "query": "teste"}'
```

## **LINKS IMPORTANTES:**
- Workflow: https://primary-production-56785.up.railway.app/workflow/scJSDgRWiHTkfNUn
- Webhook: https://primary-production-56785.up.railway.app/webhook/work-1001
- GitHub: https://github.com/Uptax-creator/N8N-Research-Agents/tree/clean-deployment

## **PREMISSAS FUNDAMENTAIS:**
1. **TUDO no GitHub** - Código não deve estar inline no N8N
2. **CSV como índice** - Database de agentes
3. **JSON para configs** - Estruturado e versionado
4. **Variables pattern** - $vars + Static Data + Cache
5. **Context preservation** - Entre nodes e agents

## **PRÓXIMA ETAPA:**
Debugging do erro "Referenced node doesn't exist" e implementação completa GitHub-hosted