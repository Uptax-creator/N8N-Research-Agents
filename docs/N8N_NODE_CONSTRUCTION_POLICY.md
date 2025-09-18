# 📋 POLÍTICA DE CONSTRUÇÃO DE NÓS N8N

## ⚠️ **PROBLEMA IDENTIFICADO**
**Erro recorrente**: "Webhook node not correctly configured" - Parâmetro "Respond" sempre precisa ser ajustado manualmente.

---

## 🏗️ **REGRAS OBRIGATÓRIAS**

### **1. WEBHOOK NODES**
```json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "/webhook/[nome-descritivo]",
    "options": {
      "rawBody": false
    },
    "respond": "usingRespondNode"  // ⚠️ CRÍTICO: SEMPRE usar "usingRespondNode"
  }
}
```

### **2. HTTP REQUEST NODES**
```json
{
  "parameters": {
    "url": "https://raw.githubusercontent.com/[org]/[repo]/main/[path]",
    "options": {
      "response": {
        "response": {
          "fullResponse": false,
          "neverError": false
        }
      },
      "timeout": 10000  // 10s timeout padrão
    }
  }
}
```

### **3. CODE NODES**
```javascript
// TEMPLATE PADRÃO - SEMPRE USAR
const startTime = Date.now();
console.log('=== [NODE_NAME] ===');

try {
    // Validação de entrada
    const inputData = $('[INPUT_NODE]').item.json.body || $('[INPUT_NODE]').item.json;

    // Lógica principal
    // ... seu código aqui ...

    // Log de performance
    const processTime = Date.now() - startTime;
    console.log(`✅ Processamento concluído em ${processTime}ms`);

    // Return padronizado
    return [{
        success: true,
        data: result,
        performance: {
            processing_time_ms: processTime
        },
        timestamp: new Date().toISOString()
    }];

} catch (error) {
    console.error('❌ Erro:', error.message);
    return [{
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
    }];
}
```

### **4. RESPOND TO WEBHOOK NODES**
```json
{
  "parameters": {
    "respondWith": "json",
    "options": {}
  }
}
```

---

## 🎯 **TEMPLATES PADRONIZADOS**

### **A. Workflow com GitHub Integration**
```
1. Webhook (respond: "usingRespondNode")
2. HTTP Request (GitHub URL)
3. Code (template padrão)
4. Respond to Webhook
```

### **B. Workflow AI Agent**
```
1. Webhook (respond: "usingRespondNode")
2. HTTP Request (GitHub prompt)
3. AI Model Node (Gemini/Claude)
4. Code (response formatter)
5. Respond to Webhook
```

### **C. Workflow Validator**
```
1. Webhook (respond: "usingRespondNode")
2. HTTP Request (GitHub rules)
3. Code (validator logic)
4. Respond to Webhook
```

---

## 🔧 **CHECKLIST OBRIGATÓRIO**

### **Antes de Ativar Workflow:**
- [ ] Webhook: `respond: "usingRespondNode"`
- [ ] HTTP Request: Timeout configurado
- [ ] Code: Try-catch implementado
- [ ] Code: Logs de performance
- [ ] Respond: `respondWith: "json"`
- [ ] Conexões: Todas ligadas corretamente
- [ ] Teste: Executar teste manual primeiro

### **Depois de Ativar:**
- [ ] Webhook registrado (não dá 404)
- [ ] Teste com payload simples
- [ ] Verificar logs de execução
- [ ] Confirmar resposta JSON válida

---

## 🚀 **AUTOMAÇÃO FUTURA**

### **Script de Geração:**
```bash
./scripts/create-workflow.sh --type="github-validator" --name="poc3"
# Gera workflow completo com todas as regras aplicadas
```

### **Templates JSON:**
- `templates/workflows/github-integration.json`
- `templates/workflows/ai-agent.json`
- `templates/workflows/validator.json`

---

## 📊 **BENEFÍCIOS**

✅ **Zero erros** de configuração
✅ **Desenvolvimento 10x mais rápido**
✅ **Consistência** em todos workflows
✅ **Facilita manutenção**
✅ **Onboarding** de novos devs
✅ **Qualidade garantida**

---

## ⚡ **AÇÃO IMEDIATA**

1. **Aplicar política** nos workflows atuais
2. **Criar templates** reutilizáveis
3. **Documentar padrões** específicos
4. **Automatizar geração** de workflows

**Resultado**: Nunca mais perder tempo com configurações básicas! 🎯