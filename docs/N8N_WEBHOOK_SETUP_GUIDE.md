# 🔗 Guia de Setup dos Webhooks N8N

## 🎯 Objetivo
Criar workflows no N8N para receber requisições do orquestrador.

## 📋 Webhooks Necessários

### **1. General Agent**
- **Path**: `/webhook/general-agent`
- **Uso**: Agente geral para tarefas simples

### **2. Research Agent**
- **Path**: `/webhook/research-agent`
- **Uso**: Pesquisa e análise de dados

### **3. Business Agent**
- **Path**: `/webhook/business-agent`
- **Uso**: Processos de negócio e administrativos

### **4. Technical Agent**
- **Path**: `/webhook/technical-agent`
- **Uso**: Desenvolvimento técnico e código

---

## 🛠️ Passos no N8N

### **Passo 1: Criar Workflow**
1. Entre no N8N: https://primary-production-56785.up.railway.app
2. Clique em **"New Workflow"**
3. Nome: `General Agent Pipeline`

### **Passo 2: Adicionar Webhook Node**
1. Adicione node **"Webhook"**
2. Configure:
   - **HTTP Method**: `POST`
   - **Path**: `general-agent`
   - **Response Mode**: `Respond to Webhook`

### **Passo 3: Adicionar Processing Node**
1. Adicione node **"Code"** ou **"HTTP Request"**
2. Configure para processar dados recebidos
3. Exemplo básico:
```javascript
// Processar input do orquestrador
const input = $json;
const agentType = input.agentType;
const context = input.context;

// Lógica de processamento
const result = {
  success: true,
  agentType: agentType,
  result: `Processado: ${context.userRequest}`,
  timestamp: new Date().toISOString()
};

return { json: result };
```

### **Passo 4: Ativar Workflow**
1. Clique em **"Save"**
2. Clique em **"Activate"** (toggle azul)
3. Confirme que está **ativo**

### **Passo 5: Testar**
Execute este comando para testar:
```bash
curl -X POST https://primary-production-56785.up.railway.app/webhook/general-agent \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "general-agent",
    "context": {
      "userRequest": "Teste de conectividade",
      "sessionId": "test-123"
    }
  }'
```

---

## 🔄 Template Workflow

Você pode duplicar este workflow base para os outros agentes, apenas mudando:
- **Nome do workflow**
- **Path do webhook**
- **Lógica específica** do agente

---

## ✅ Checklist de Validação

- [ ] Workflow criado
- [ ] Webhook node configurado
- [ ] Path correto definido
- [ ] Workflow ativado
- [ ] Teste de conectividade OK

---

## 🚨 Troubleshooting

**Erro 404**: Workflow não ativado ou path incorreto
**Erro 500**: Problema na lógica de processamento
**Timeout**: Node processamento muito lento

**Solução**: Verificar logs do N8N e testar com payload simples primeiro.