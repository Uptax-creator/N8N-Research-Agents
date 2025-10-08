# 🏗️ PADRÃO DE ARQUITETURA DOS WORKFLOWS

## 🎯 Princípio Fundamental

**TODO o código de lógica de negócio deve estar no GitHub, NÃO no workflow do N8N.**

O workflow deve ser apenas um **orquestrador** que:
1. Recebe requisições (Webhook)
2. Busca dados necessários (Data Tables)
3. **Carrega código do GitHub** (external code)
4. Executa a lógica
5. Salva resultados (Data Tables)
6. Responde (Respond to Webhook)

---

## ✅ PADRÃO CORRETO: GitHub-First

### Estrutura do Code Node
```javascript
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/N8N/code';

// 1. BUSCAR CÓDIGO DO GITHUB (externo)
const code = await this.helpers.httpRequest({
  method: 'GET',
  url: `${GITHUB_RAW_BASE}/processors/agent-data-mapper-simple-schema.js`,
  returnFullResponse: false
});

// 2. EXECUTAR CÓDIGO
eval(code);

// 3... resto da lógica minimalista
```

### Por que esse padrão?

#### ✅ Vantagens
1. **Versionamento:** Todo código está no Git
2. **Reusabilidade:** Mesmo código em múltiplos workflows
3. **Testabilidade:** Código pode ser testado isoladamente
4. **Manutenção:** Update no GitHub = update automático em todos workflows
5. **Code Review:** PRs no GitHub para mudanças
6. **Rollback:** Fácil voltar para versão anterior

#### ❌ Problemas do código inline
1. **Sem versionamento:** Workflow JSON não é bom para diffs
2. **Duplicação:** Código repetido em múltiplos workflows
3. **Difícil testar:** Não dá para rodar unit tests
4. **Sem rollback:** Perda de histórico
5. **Sem code review:** Mudanças direto no N8N UI

---

## 📊 COMPARAÇÃO: Inline vs GitHub-First

### ❌ ERRADO: Código Inline (Antigo)

```json
{
  "parameters": {
    "jsCode": "const GITHUB_RAW_BASE = 'https://...';\n\n// 1. BUSCAR CÓDIGO...\nconst code = await this.helpers.httpRequest(...);\n\n// 2. EXECUTAR\neval(code);\n\n// 3. BUSCAR DADOS\nconst allProjects = $('Get_insert_projects').all();\n\n// 4. WEBHOOK DATA\nconst webhookNode = $('Webhook-project-insert').first();\n\n// 5. MAPEAR\nconst mappedData = mapProjectData(...);\n\n// 6. RETORNAR\nreturn { json: mappedData };"
  },
  "name": "Code-insert-project"
}
```

**Problema:** Todo o código está embarcado no JSON do workflow.

---

### ✅ CORRETO: GitHub-First (Novo)

#### Workflow (Apenas referência):
```json
{
  "parameters": {
    "jsCode": "const GITHUB_RAW_BASE = 'https://...';\n\nconst code = await this.helpers.httpRequest({\n  method: 'GET',\n  url: `${GITHUB_RAW_BASE}/processors/project-data-mapper-simple-schema.js`,\n  returnFullResponse: false\n});\n\neval(code);"
  },
  "name": "Code-insert-project"
}
```

#### Código Real (GitHub):
`N8N/code/processors/project-data-mapper-simple-schema.js`
```javascript
/**
 * Mapeia dados de projeto do webhook para o schema do Data Table
 */
function mapProjectData(webhookData, allProjects) {
  // Validações
  if (!webhookData.project_name) {
    throw new Error('Missing required field: project_name');
  }

  // Gerar ID sequencial
  const maxId = allProjects.length > 0
    ? Math.max(...allProjects.map(p => parseInt(p.project_id.replace('PROJ-', ''))))
    : 0;
  const newId = `PROJ-${String(maxId + 1).padStart(3, '0')}`;

  // Retornar dados mapeados
  return {
    project_id: newId,
    project_name: webhookData.project_name,
    company_name: webhookData.company_name,
    description: webhookData.description || '',
    created_by: webhookData.created_by,
    is_active: true,
    tags: webhookData.tags || ''
  };
}

// Auto-execução (quando eval() é chamado)
const allProjects = $('Get_insert_projects').all().map(item => item.json);
const webhookNode = $('Webhook-Insert_projects').first().json;
const webhookData = webhookNode.body || webhookNode;

console.log('[INSERT_PROJECT] Processing:', webhookData.project_name);
const mappedData = mapProjectData(webhookData, allProjects);
console.log('[INSERT_PROJECT] Success:', mappedData.project_id);

return { json: mappedData };
```

---

## 🎯 WORKFLOWS CORRIGIDOS

### 1. INSERT AGENT ✅
- **Arquivo:** `N8N/workflows/insert-agent-endpoint.json`
- **Code Node:** Busca `agent-data-mapper-simple-schema.js` do GitHub
- **Status:** Produção (3 agents testados)

### 2. INSERT PROJECT ✅
- **Arquivo:** `N8N/workflows/insert-project-endpoint.json`
- **Code Node:** Busca `project-data-mapper-simple-schema.js` do GitHub
- **Status:** Pronto para deploy

---

## 📁 ESTRUTURA DE ARQUIVOS

```
N8N/
├── workflows/                          # Workflows (orquestradores)
│   ├── insert-agent-endpoint.json      ✅ GitHub-First
│   ├── insert-project-endpoint.json    ✅ GitHub-First
│   └── data-table-manager.json         ✅ GitHub-First
│
├── code/
│   ├── processors/                     # Lógica de negócio
│   │   ├── agent-data-mapper-simple-schema.js       ✅
│   │   └── project-data-mapper-simple-schema.js     ✅
│   │
│   └── nodes/                          # Templates (referência)
│       ├── CODE_NODE_INSERT_AGENT_FIXED_WEBHOOK.js
│       └── CODE_NODE_INSERT_PROJECT.js
```

---

## 🔄 FLUXO COMPLETO

### INSERT AGENT / PROJECT

```
1. [Webhook] Recebe POST com dados
        ↓
2. [Data Table GET] Busca registros existentes
        ↓
3. [Code Node]
   3.1. Fetch código do GitHub
   3.2. eval(code)  ← Código executa aqui
   3.3. Retorna dados mapeados
        ↓
4. [Data Table INSERT] Salva registro
        ↓
5. [Respond to Webhook] Retorna sucesso
```

### Detalhamento do Code Node

```javascript
// ========================================
// PASSO 1: CONFIGURAÇÃO
// ========================================
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/.../clean-deployment/N8N/code';

// ========================================
// PASSO 2: BUSCAR CÓDIGO EXTERNO
// ========================================
const code = await this.helpers.httpRequest({
  method: 'GET',
  url: `${GITHUB_RAW_BASE}/processors/XXX-data-mapper.js`,
  returnFullResponse: false
});

// ========================================
// PASSO 3: EXECUTAR CÓDIGO DO GITHUB
// ========================================
eval(code);
// O código do GitHub:
// 1. Busca dados dos nodes anteriores
// 2. Valida dados do webhook
// 3. Mapeia para schema do Data Table
// 4. Retorna { json: mappedData }

// FIM - O eval() já executou tudo!
```

---

## 🎓 LIÇÕES APRENDIDAS

### ❌ Erro Anterior
Colocar código inline no workflow, tornando difícil:
- Versionar mudanças
- Reusar código
- Fazer code review
- Testar isoladamente

### ✅ Solução
Código no GitHub + Workflow apenas orquestra:
- Versionamento automático
- Reuso entre workflows
- Code review via PR
- Unit tests possíveis
- Rollback fácil

---

## 🔧 COMO CRIAR NOVO ENDPOINT

### 1. Criar código no GitHub
```bash
# Arquivo: N8N/code/processors/my-new-mapper.js
function mapMyData(webhookData, existingData) {
  // Sua lógica aqui
  return { json: mappedData };
}

// Auto-execução
const existing = $('Get_my_data').all().map(item => item.json);
const webhook = $('Webhook-my-endpoint').first().json;
const data = webhook.body || webhook;
const mapped = mapMyData(data, existing);
return { json: mapped };
```

### 2. Criar workflow
```json
{
  "nodes": [
    {"name": "Webhook", "path": "my_endpoint"},
    {"name": "Get Data Table", "operation": "get"},
    {
      "name": "Code Node",
      "jsCode": "const code = await fetch('GitHub/my-new-mapper.js'); eval(code);"
    },
    {"name": "Insert Data Table"},
    {"name": "Respond to Webhook"}
  ]
}
```

### 3. Commit e Push
```bash
git add N8N/code/processors/my-new-mapper.js
git add N8N/workflows/my-new-endpoint.json
git commit -m "feat: Add MY_NEW endpoint"
git push
```

### 4. Importar no N8N
1. Acesse N8N
2. Import workflow JSON
3. Activate
4. Testar!

---

## 📊 MÉTRICAS DE QUALIDADE

### ✅ Checklist para Novos Endpoints

- [ ] Código está no GitHub (`N8N/code/processors/`)
- [ ] Workflow apenas faz fetch + eval
- [ ] Template documentado (`N8N/code/nodes/`)
- [ ] Payload de teste criado (`N8N/workflows/test-payloads/`)
- [ ] README atualizado
- [ ] Commit + Push realizado
- [ ] Testado em produção

---

## 🎯 CONCLUSÃO

**Sempre seguir o padrão GitHub-First:**

1. **Workflow = Orquestrador** (minimal code)
2. **GitHub = Lógica de negócio** (versionado)
3. **Code Node = Fetch + Eval** (apenas)

**Resultado:**
- ✅ Código versionado
- ✅ Fácil manutenção
- ✅ Reusabilidade
- ✅ Testabilidade
- ✅ Code review
- ✅ Rollback simples

---

**Última atualização:** 08/10/2025
**Autor:** Kleber Ribeiro + Claude
**Status:** ✅ Padrão definido e implementado
