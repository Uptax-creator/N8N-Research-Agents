# 📐 PADRÃO DE CONSTRUÇÃO DE COMPONENTES N8N

**Data:** 07/10/2025
**Objetivo:** Estabelecer padrão único para criação de componentes reutilizáveis no GitHub

---

## 🎯 PRINCÍPIOS FUNDAMENTAIS

### **1. SEPARAÇÃO DE RESPONSABILIDADES**

```
┌─────────────────────────────────────────────┐
│  COMPONENTES GITHUB (Lógica)               │
├─────────────────────────────────────────────┤
│                                             │
│  processors/  → INSERT/UPDATE + Validações  │
│  filters/     → GET + Filtros               │
│  helpers/     → Utilitários                 │
│                                             │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│  N8N WORKFLOWS (Orquestração)              │
├─────────────────────────────────────────────┤
│                                             │
│  Data Table Nodes → CRUD nativo             │
│  Code Nodes       → Carrega componentes     │
│  Webhook Nodes    → Endpoints               │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 📋 TIPOS DE COMPONENTES

### **A. PROCESSORS (INSERT/UPDATE/DELETE)**

**Quando usar:**
- Operações de escrita (INSERT, UPDATE, DELETE)
- Validações complexas (UNIQUE, FK, CHECK)
- Transformação de dados (auto-geração de URLs, defaults)

**Características:**
- ❌ **NÃO acessa Data Tables diretamente**
- ✅ **Recebe contexto `ctx`** do Code Node
- ✅ **Retorna dados mapeados** para INSERT/UPDATE
- ✅ **Valida constraints** via código

**Exemplo:** `agent-data-mapper.js`

---

### **B. FILTERS (GET)**

**Quando usar:**
- Operações de leitura (GET)
- Filtros e formatação de dados
- Transformação para Frontend

**Características:**
- ❌ **NÃO acessa Data Tables diretamente**
- ✅ **Recebe array de dados** do Data Table node
- ✅ **Filtra e formata** dados
- ✅ **Zero dependência** de contexto N8N

**Exemplo:** `project-filter.js`

---

### **C. HELPERS (Utilitários)**

**Quando usar:**
- Funções auxiliares reutilizáveis
- Montagem de URLs
- Formatação de dados

**Características:**
- ❌ **NÃO acessa Data Tables**
- ✅ **Funções puras** quando possível
- ✅ **Zero side effects**

**Exemplo:** URL builders, validators

---

## 🔧 TEMPLATE: PROCESSOR

```javascript
/**
 * [NOME] - [OPERAÇÃO]
 *
 * [DESCRIÇÃO]
 *
 * GitHub: https://github.com/Uptax-creator/N8N-Research-Agents
 * Branch: clean-deployment
 * Path: N8N/code/processors/[nome].js
 *
 * @version 1.0.0
 */

/**
 * Valida [CONSTRAINT]
 * @param {Object} ctx - N8N context (recebe $ do Code Node)
 * @param {string} param - Parâmetro
 * @returns {Object} { valid: boolean, message: string }
 */
async function validateConstraint(ctx, param) {
  try {
    const allRecords = await ctx.getDataTableRows('table_name');

    // Lógica de validação
    const exists = allRecords.find(r => r.field === param);

    if (exists) {
      return {
        valid: false,
        constraint_violation: 'DUPLICATE',
        message: `❌ ${param} already exists`,
        existing_record: exists
      };
    }

    return { valid: true, can_insert: true };

  } catch (error) {
    return {
      valid: false,
      constraint_violation: 'VALIDATION_ERROR',
      message: `❌ Validation failed: ${error.message}`
    };
  }
}

/**
 * Mapeia dados para operação
 * @param {Object} body - Dados do webhook
 * @param {Object} ctx - N8N context (opcional)
 * @returns {Object} Dados mapeados
 */
async function mapData(body, ctx = null) {
  const data = body.data || body;

  // Validações obrigatórias
  if (!data.required_field) {
    throw new Error('Missing required field: required_field');
  }

  // Validação de constraint (se ctx disponível)
  if (ctx) {
    const validation = await validateConstraint(ctx, data.required_field);

    if (!validation.valid) {
      const error = new Error(validation.message);
      error.constraint_violation = validation.constraint_violation;
      error.existing_record = validation.existing_record;
      throw error;
    }
  }

  // Mapear campos
  const mapped = {
    field1: data.field1.trim(),
    field2: data.field2 || 'default',
    created_at: new Date().toISOString()
  };

  console.log(`✅ Data mapped successfully`);

  return mapped;
}

// Export para N8N Code Node
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { mapData, validateConstraint };
}

// IMPORTANTE: Sem auto-execução!
// O Code Node chama as funções manualmente
```

---

## 🔧 TEMPLATE: FILTER

```javascript
/**
 * [NOME] Filter - GET operations
 *
 * Filtra e formata [ENTIDADE] vindos do Data Table node
 * IMPORTANTE: Este componente recebe dados JÁ carregados do Data Table
 *
 * GitHub: https://github.com/Uptax-creator/N8N-Research-Agents
 * Branch: clean-deployment
 * Path: N8N/code/filters/[nome]-filter.js
 *
 * @version 1.0.0
 */

/**
 * Filtra por ID
 * @param {Array} allRecords - Todos os registros do Data Table
 * @param {string} id - ID para buscar
 * @returns {Object} Resultado da busca
 */
function filterById(allRecords, id) {
  const record = allRecords.find(r => r.id === id);

  if (!record) {
    return {
      found: false,
      message: `❌ Record ${id} not found`,
      record: null
    };
  }

  console.log(`✅ Record found: ${id}`);

  return {
    found: true,
    message: `✅ Record ${id} found`,
    record: record
  };
}

/**
 * Filtra por status
 * @param {Array} allRecords - Todos os registros
 * @param {string} status - Status para filtrar
 * @returns {Object} Lista filtrada
 */
function filterByStatus(allRecords, status = 'active') {
  const filtered = allRecords.filter(r => r.status === status);

  console.log(`✅ Found ${filtered.length} records with status=${status}`);

  return {
    success: true,
    total: filtered.length,
    records: filtered
  };
}

/**
 * Formata para Frontend
 * @param {Object} record - Registro raw
 * @returns {Object} Registro formatado
 */
function formatForFrontend(record) {
  return {
    id: record.id,
    name: record.name,
    status: record.status,
    created_at: record.created_at
  };
}

/**
 * Filtra e formata registros
 * @param {Array} allRecords - Todos os registros do Data Table
 * @param {Object} filters - Filtros { id, status, format }
 * @returns {Object} Resultado filtrado e formatado
 */
function filterAndFormat(allRecords, filters = {}) {
  const { id, status, format = false } = filters;

  let result;

  if (id) {
    result = filterById(allRecords, id);
    if (format && result.record) {
      result.record = formatForFrontend(result.record);
    }
    return result;
  }

  if (status) {
    result = filterByStatus(allRecords, status);
  } else {
    result = filterByStatus(allRecords, 'active');
  }

  if (format) {
    result.records = result.records.map(formatForFrontend);
  }

  return result;
}

// Export para N8N Code Node
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    filterById,
    filterByStatus,
    formatForFrontend,
    filterAndFormat
  };
}

// IMPORTANTE: Sem auto-execução!
```

---

## 🔧 TEMPLATE: CODE NODE (INSERT)

```javascript
// ========================================
// LOAD & EXECUTE: [nome]-data-mapper.js
// ========================================

const GITHUB_BASE = 'https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/N8N/code';

try {
  // 1. Carregar componente do GitHub
  const code = await this.helpers.httpRequest({
    method: 'GET',
    url: `${GITHUB_BASE}/processors/[nome]-data-mapper.js`,
    returnFullResponse: false
  });

  // 2. Executar código (cria funções)
  eval(code);

  // 3. Extrair dados do webhook
  const webhookData = $input.item.json.body || $input.item.json;

  // 4. Executar função do componente (passar $ para acesso Data Tables)
  const mappedData = await mapData(webhookData, $);

  // 5. Log para debug
  console.log('[INSERT] Success:', mappedData);

  // 6. Retornar resultado
  return { json: mappedData };

} catch (error) {
  // 7. Log de erro
  console.error('[INSERT] ERROR:', error.message);

  // 8. Retornar erro estruturado
  return {
    json: {
      error: true,
      message: error.message,
      constraint_violation: error.constraint_violation,
      suggestion: error.suggestion
    }
  };
}
```

---

## 🔧 TEMPLATE: CODE NODE (GET)

```javascript
// ========================================
// LOAD & EXECUTE: [nome]-filter.js
// ========================================

const GITHUB_BASE = 'https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/N8N/code';

try {
  // 1. Carregar componente do GitHub
  const code = await this.helpers.httpRequest({
    method: 'GET',
    url: `${GITHUB_BASE}/filters/[nome]-filter.js`,
    returnFullResponse: false
  });

  // 2. Executar código (cria funções)
  eval(code);

  // 3. Extrair dados DO NODE ANTERIOR (Data Table GET)
  const allRecords = $input.all().map(item => item.json);

  // 4. Extrair parâmetros de filtro
  const filters = $input.first().json.query || $input.first().json.body || {};

  // 5. Executar filtro
  const result = filterAndFormat(allRecords, filters);

  // 6. Log para debug
  console.log('[GET] Result:', result);

  // 7. Retornar resultado
  return { json: result };

} catch (error) {
  // 8. Log de erro
  console.error('[GET] ERROR:', error.message);

  // 9. Retornar erro
  return {
    json: {
      error: true,
      message: error.message
    }
  };
}
```

---

## 📊 WORKFLOWS PADRÃO

### **INSERT/UPDATE:**
```
Webhook POST
  ↓
Code Node (Carrega processor/ do GitHub)
  → Passa $ para acesso Data Tables
  → Valida constraints
  → Mapeia dados
  ↓
Data Table INSERT/UPDATE
  ↓
Data Table GET (confirmação)
  ↓
Respond
```

### **GET:**
```
Webhook GET/POST
  ↓
Data Table GET (busca TODOS nativamente)
  ↓
Code Node (Carrega filter/ do GitHub)
  → Recebe array de dados
  → Filtra por parâmetros
  → Formata para Frontend
  ↓
Respond
```

---

## ✅ CHECKLIST DE QUALIDADE

### **Componente:**
- [ ] Header com descrição, GitHub path, versão
- [ ] JSDoc em todas as funções
- [ ] Validação de parâmetros obrigatórios
- [ ] Try/catch em operações assíncronas
- [ ] Console.log para debug
- [ ] Export correto (`module.exports`)
- [ ] SEM auto-execução (sem `return` solto)
- [ ] Testes manuais antes do commit

### **Code Node:**
- [ ] URL GitHub correta
- [ ] `eval(code)` após carregar
- [ ] Extração correta de dados (`$input`)
- [ ] Passagem correta de contexto (`$` para processors)
- [ ] Try/catch completo
- [ ] Return estruturado (`{ json: ... }`)
- [ ] Logs de erro e sucesso

---

## 🚀 FLUXO DE DESENVOLVIMENTO

```bash
# 1. Criar componente localmente
vim N8N/code/processors/new-component.js

# 2. Testar localmente (opcional)
node N8N/code/processors/new-component.js

# 3. Commit
git add N8N/code/processors/new-component.js
git commit -m "feat: Add new-component processor"

# 4. Push
git push origin clean-deployment

# 5. Aguardar ~30s (cache GitHub)

# 6. Criar workflow no N8N
# 7. Testar endpoint
# 8. Ajustar se necessário
```

---

## 📚 COMPONENTES EXISTENTES

| Componente | Tipo | Função | Status |
|------------|------|--------|--------|
| `agent-data-mapper.js` | Processor | INSERT agents | ✅ Testado |
| `project-data-mapper.js` | Processor | INSERT projects | ✅ Testado |
| `agent-filter.js` | Filter | GET agents | ✅ Testado |
| `project-filter.js` | Filter | GET projects | ✅ Testado |

---

## 🎯 BENEFÍCIOS DO PADRÃO

1. ✅ **Consistência** - Todos componentes seguem mesma estrutura
2. ✅ **Manutenibilidade** - Fácil entender e modificar
3. ✅ **Reusabilidade** - Componentes reutilizáveis entre workflows
4. ✅ **Testabilidade** - Componentes podem ser testados isoladamente
5. ✅ **Versionamento** - Git history completo
6. ✅ **Escalabilidade** - Fácil adicionar novos componentes

---

## ⚠️ ANTI-PATTERNS (EVITAR)

❌ **Auto-execução em componentes:**
```javascript
// ERRADO
if (typeof $ !== 'undefined') {
  return myFunction($); // ← Causa "Illegal return statement"
}
```

❌ **Acessar Data Tables em filters:**
```javascript
// ERRADO
async function filterData($) {
  const data = await $.getDataTableRows('table'); // ← Filter não acessa DB
}
```

❌ **Passar `this` em vez de `$`:**
```javascript
// ERRADO
const result = await mapData(data, this); // ← Passar $, não this
```

❌ **Hardcode de valores:**
```javascript
// ERRADO
const baseUrl = 'https://github.com/...'; // ← Buscar de config
```

---

## 🎓 REFERÊNCIAS

- [N8N_CODE_NODE_BEST_PRACTICES.md](N8N_CODE_NODE_BEST_PRACTICES.md)
- [WORKFLOWS_GITHUB_INTEGRATION_GUIDE.md](WORKFLOWS_GITHUB_INTEGRATION_GUIDE.md)

---

**Seguindo este padrão, todos os componentes são:**
- ✅ Consistentes
- ✅ Testáveis
- ✅ Reutilizáveis
- ✅ Manuteníveis
- ✅ Escaláveis

🎯 **Use este documento como referência para TODOS os novos componentes!**
