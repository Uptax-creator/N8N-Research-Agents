# 📋 WAVE 2 - Requisitos Detalhados e Critérios de Validação
**Sprint Date**: 16/09/2025
**Status**: Ready for Implementation

## 🎯 Overview
WAVE 2 foca em criar interfaces visuais e automação para escalar a produção de agentes, permitindo composição visual de workflows multi-agente.

---

## T2.1: Frontend Webhook Integrator Design
**Tempo**: 15min implementação + 5min validação humana
**Dependências**: T1.3 ✅ (Agent Templates criados)

### 📌 REQUISITOS FUNCIONAIS

#### Interface Principal
- **Dashboard React** com canvas drag-and-drop
- **Lista de Agentes** disponíveis (sidebar)
- **Canvas Visual** para composição de fluxos
- **Inspector Panel** para configuração de cada agente
- **Log Console** para debug em tempo real

#### Funcionalidades Core
1. **Agent Library**
   - Listar templates de `./templates/agents/`
   - Preview de cada agente (nome, tipo, descrição)
   - Drag para adicionar ao canvas

2. **Canvas de Composição**
   - Grid snap para alinhamento
   - Conexões visuais entre agentes
   - Zoom in/out
   - Pan navegação

3. **Conexões Webhook**
   - Output de Agent A → Input de Agent B
   - Visualizar payload JSON entre conexões
   - Validação de compatibilidade de dados

4. **Monitoramento Real-time**
   ```javascript
   // Estados visuais:
   IDLE: "cinza"       // Aguardando
   RUNNING: "azul"     // Processando
   SUCCESS: "verde"    // Concluído
   ERROR: "vermelho"   // Falha
   ```

### ✅ CRITÉRIOS DE ACEITAÇÃO

```javascript
// Checklist de Validação T2.1
const validationCriteria = {
  functionality: {
    listAgents: true,              // Lista todos os templates
    dragAndDrop: true,             // Arrastar agente para canvas
    connectAgents: true,           // Conectar output→input
    showWebhookConfig: true,       // Ver JSON da conexão
    testWithPayload: true,         // Testar com dados exemplo
    showStatus: true               // Ver status em tempo real
  },

  userExperience: {
    intuitive: true,               // Interface auto-explicativa
    responsive: true,              // Funciona em diferentes telas
    clearIcons: true,              // Ícones representativos
    errorMessages: true            // Mensagens de erro claras
  },

  performance: {
    loadTime: "< 2s",             // Tempo de carregamento
    agentLimit: "10+",            // Suporta 10+ agentes
    smoothDragDrop: true,         // Sem lag no drag
    realtimeUpdates: true         // Atualização < 100ms
  }
};
```

### 🔍 ROTEIRO DE VALIDAÇÃO HUMANA (5min)

1. **Teste de Usabilidade** (2min)
   - [ ] Consegue criar fluxo de 3 agentes sem instrução?
   - [ ] Interface comunica claramente os estados?
   - [ ] Erros são explicativos?

2. **Teste de Funcionalidade** (2min)
   - [ ] Webhook config está correto?
   - [ ] Payload passa corretamente entre agentes?
   - [ ] Status atualiza em tempo real?

3. **Teste de Escalabilidade** (1min)
   - [ ] Performance com 10 agentes no canvas?
   - [ ] Zoom/pan funcionam suavemente?
   - [ ] Salva/carrega configuração?

---

## T2.2: Agent Factory Pipeline
**Tempo**: 20min implementação + 10min validação humana
**Dependências**: T1.3 ✅ (Templates) + T2.1 (Dashboard)

### 📌 REQUISITOS FUNCIONAIS

#### Pipeline Stages
```bash
1. CREATE   → Gerar agente do template
2. DEPLOY   → Deploy para n8n via MCP
3. TEST     → Validação automática
4. MONITOR  → Coletar métricas
5. ROLLBACK → Reverter se falhar
```

#### Implementação Detalhada

1. **Stage: CREATE**
   ```bash
   # Input: template_type, agent_name, custom_config
   # Process:
   - Load template from ./templates/agents/${template_type}.json
   - Merge com custom_config
   - Generate unique webhook path
   - Create workflow JSON
   # Output: agent_config.json
   ```

2. **Stage: DEPLOY**
   ```bash
   # Input: agent_config.json
   # Process:
   - n8n-mcp import-workflow agent_config.json
   - Activate workflow
   - Register no dashboard
   # Output: deployment_id, webhook_url
   ```

3. **Stage: TEST**
   ```bash
   # Input: webhook_url, test_payload
   # Process:
   - curl -X POST ${webhook_url} -d ${test_payload}
   - Validate response structure
   - Check response time < 3s
   - Verify no errors
   # Output: test_report.json
   ```

4. **Stage: MONITOR**
   ```javascript
   // Métricas coletadas:
   {
     "agent_id": "research-agent-v2",
     "metrics": {
       "response_time_avg": 1250,    // ms
       "success_rate": 98.5,         // %
       "tokens_used": 1500,          // average
       "cost_per_request": 0.002,    // USD
       "requests_today": 145
     }
   }
   ```

5. **Stage: ROLLBACK**
   ```bash
   # Trigger: test failure ou erro crítico
   # Process:
   - Deactivate failed workflow
   - Restore previous version
   - Alert dashboard
   - Log incident
   ```

### ✅ CRITÉRIOS DE ACEITAÇÃO

```bash
# Pipeline Validation Checklist

## Performance Metrics
- [ ] Deploy time < 2min (template → production)
- [ ] Test execution < 30s
- [ ] Rollback time < 10s
- [ ] Zero downtime durante deploy

## Quality Gates
- [ ] Response time < 3000ms ✓
- [ ] Valid JSON response ✓
- [ ] No errors in logs ✓
- [ ] Schema validation passes ✓

## Automation Level
- [ ] No manual steps required
- [ ] Auto-rollback on failure
- [ ] Auto-register in dashboard
- [ ] Auto-collect metrics

## Observability
- [ ] Clear logs per stage
- [ ] Success/failure notifications
- [ ] Metrics dashboard updated
- [ ] Version history maintained
```

### 🔍 ROTEIRO DE VALIDAÇÃO HUMANA (10min)

#### Fase 1: Deploy Success Path (3min)
```bash
# Executar:
./pipeline.sh deploy research-agent-test research_specialist

# Validar:
✓ Agent criado em < 2min
✓ Webhook respondendo
✓ Dashboard mostra novo agente
✓ Métricas sendo coletadas
```

#### Fase 2: Test Failure Path (3min)
```bash
# Simular falha:
./pipeline.sh deploy broken-agent invalid_template

# Validar:
✓ Erro detectado em < 30s
✓ Rollback automático executado
✓ Notificação de falha clara
✓ Sistema continua operacional
```

#### Fase 3: Load Test (2min)
```bash
# Deploy múltiplos agentes:
for i in {1..5}; do
  ./pipeline.sh deploy agent-$i research_specialist &
done

# Validar:
✓ Todos deploy em paralelo
✓ Sem conflitos de recursos
✓ Dashboard atualiza corretamente
✓ Performance mantida
```

#### Fase 4: Observability Check (2min)
```bash
# Verificar métricas:
curl http://localhost:3000/api/metrics/agent-test

# Validar dashboard:
✓ Latência por agente visível
✓ Success rate calculado
✓ Token usage tracked
✓ Cost breakdown disponível
```

---

## 📊 MÉTRICAS DE SUCESSO CONSOLIDADAS

### Quantitativas
| Métrica | Target | Como Medir |
|---------|--------|------------|
| Deploy Speed | < 2min | Timer do pipeline |
| Success Rate | > 95% | Deploys bem-sucedidos/total |
| Agent Throughput | 10+/dia | Counter no dashboard |
| Rollback Speed | < 10s | Timer de recuperação |
| Test Coverage | 100% | Todos agents testados |

### Qualitativas
| Aspecto | Critério | Validação |
|---------|----------|-----------|
| UX | "Intuitivo como Zapier" | User test 5min |
| Debug | "Sei onde falhou" | Error messages claros |
| Speed | "Minutes not hours" | End-to-end timing |
| Visual | "Entendo o fluxo" | Diagram clarity |

---

## 🚀 PRÓXIMOS PASSOS

1. **Implementar T2.1** (15min)
   - Criar React dashboard base
   - Implementar drag-and-drop
   - Conectar com agent templates

2. **Implementar T2.2** (20min)
   - Criar pipeline.sh script
   - Implementar stages 1-5
   - Adicionar quality gates

3. **Executar Validação** (15min)
   - 5min validação T2.1 (UX/funcionalidade)
   - 10min validação T2.2 (pipeline/metrics)

4. **Documentar Resultados**
   - Screenshot do dashboard
   - Logs do pipeline
   - Métricas coletadas

---

**Status**: ✅ Documentado e pronto para implementação e testes