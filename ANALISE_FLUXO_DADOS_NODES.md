# 🔍 ANÁLISE DO FLUXO DE DADOS ENTRE NODES

## **PROGRESSÃO ATUAL**
```
✅ Webhook → ✅ Context Builder → ✅ Config Loader → ❌ Agent Initializer
```

## **PROBLEMA IDENTIFICADO**

### **Agent Initializer (linha 16):**
```javascript
// ERRO: prompt_data está undefined
const systemMessage = data.prompt_data.system_message + "\n\n" +
//                          ↑ undefined
```

### **Root Cause:**
Agent Initializer espera dados do **Prompt Loader**, mas workflow pulou direto do Config Loader.

---

## **ANÁLISE DO FLUXO ESPERADO**

### **Sequência Original Planejada:**
```
Context Builder → Config Loader → Prompt Loader → Agent Initializer
```

### **Sequência Atual (Problemática):**
```
Context Builder → Config Loader → [PULA PROMPT LOADER] → Agent Initializer
```

### **Dados que Agent Initializer Precisa:**
```javascript
// Vem do Prompt Loader:
{
  ...context,
  agent_config: {...},  // ← Do Config Loader ✅
  prompt_data: {        // ← Do Prompt Loader ❌ MISSING
    system_message: "...",
    instructions: [...],
    tools_guidance: {...}
  }
}
```

---

## **SOLUÇÕES POSSÍVEIS**

### **Opção A: Corrigir Conexões (Recomendado)**
1. Verificar se Config Loader está conectado ao **Prompt Loader**
2. Prompt Loader → Agent Initializer
3. Manter arquitetura original

### **Opção B: Agent Initializer Adaptativo**
```javascript
// Verificar se prompt_data existe
const promptData = data.prompt_data || {
  system_message: "Default system message",
  instructions: ["Be helpful", "Use tools"],
  tools_guidance: {}
};

const systemMessage = promptData.system_message + "...";
```

### **Opção C: Config Loader Expandido**
Fazer Config Loader também carregar prompt_data junto com agent_config.

---

## **PADRÃO N8N IDENTIFICADO**

### **Estrutura Típica de Dados entre Nodes:**
```javascript
// Cada node recebe e expande dados:
Node1: { base_data }
Node2: { ...base_data, node2_data }
Node3: { ...base_data, node2_data, node3_data }
```

### **Padrão de Erro Comum:**
- Node espera dados do node anterior
- Conexão quebrada ou dados não passados
- TypeError: Cannot read properties of undefined

---

## **RECOMENDAÇÃO ARQUITETURAL**

### **Problema Fundamental:**
Cada correção inline cria **débito técnico**:
- 7 nodes × potenciais bugs = manutenção exponencial
- Cada hotfix inline = mais complexidade
- N8N UI não é IDE - debugging limitado

### **Solução Arquitetural:**
```
1. Finalizar workflow básico funcionando
2. Migrar TUDO para GitHub processors
3. N8N nodes = apenas loaders mínimos
4. Manutenção = commits no GitHub
```

### **Exemplo Loader Mínimo:**
```javascript
// N8N node (3 linhas):
const url = `${$vars.GITHUB_BASE}/processors/${NODE_NAME}.js`;
const processor = await fetch(url).then(r => r.text());
return eval(processor)($, input, $vars);
```

---

## **PRÓXIMA AÇÃO IMEDIATA**

### **Verificar Conexões:**
1. Config Loader → está conectado a qual node?
2. Se conectado diretamente ao Agent Initializer = problema
3. Deve ser: Config Loader → Prompt Loader → Agent Initializer

### **Correção Rápida se Conexões Corretas:**
Agent Initializer com fallback para prompt_data undefined.

---

## **AVALIAÇÃO N8N-MCP**

### **Instabilidade Observada:**
- Timeouts constantes
- Não consegue executar comandos simples
- Ferramenta promissora mas não production-ready

### **Recomendação:**
- Finalizar debugging manual
- Após workflow estável, avaliar n8n-mcp novamente
- Priorizar GitHub-first architecture