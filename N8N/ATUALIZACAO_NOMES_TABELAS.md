# 🔄 ATUALIZAÇÃO DE NOMES DE TABELAS

## 📋 MAPEAMENTO DE NOMENCLATURA

### **Tabelas Renomeadas:**
```javascript
// ANTES (Documentação) → DEPOIS (N8N Real)
'workflow_executions'  → 'wrk_execution'
'workflow_state'       → 'wrk_state'
'workflow_variables'   → 'wrk_variables'
'agents'               → 'agents'        (sem mudança)
'projects'             → 'projects'      (sem mudança)
```

### **Campos Timestamp:**
```javascript
// ANTES (Documentação) → DEPOIS (N8N Real)
'created_at' → 'createdAt'   (camelCase automático do N8N)
'updated_at' → 'updatedAt'   (camelCase automático do N8N)
```

---

## 🔧 ARQUIVOS QUE PRECISAM ATUALIZAÇÃO

### **1. Componentes JavaScript (4 arquivos)**

#### **data-table-validator.js**
- ❌ Não precisa mudança (usa parâmetro `tableName` dinâmico)

#### **data-table-helper-enhanced.js**
**Localização dos nomes hardcoded:**
- Linha ~250: `'workflow_state'` → `'wrk_state'`
- Linha ~270: `'workflow_state'` → `'wrk_state'`
- Linha ~35: `'workflow_executions'` (referência em comentário)

#### **cleanup-job.js**
**Localização dos nomes hardcoded:**
- Linha ~20: `'workflow_executions'` → `'wrk_execution'`
- Linha ~50: `'workflow_state'` → `'wrk_state'`
- Linha ~80: `'workflow_variables'` → `'wrk_variables'`

#### **variable-precedence-resolver.js**
**Localização dos nomes hardcoded:**
- Linha ~25: `'workflow_variables'` → `'wrk_variables'`
- Linha ~40: `'workflow_variables'` → `'wrk_variables'`
- Linha ~60: `'workflow_variables'` → `'wrk_variables'`
- Linha ~80: `'workflow_variables'` → `'wrk_variables'`
- Linha ~120: `'workflow_variables'` → `'wrk_variables'`

---

### **2. Documentação (7 arquivos)**

#### **DATA_TABLES_SCHEMA_DEFINITIVO.md**
- Todas as referências a `workflow_executions`, `workflow_state`, `workflow_variables`
- Atualizar títulos de seções
- Atualizar exemplos SQL

#### **IMPLEMENTACAO_COMPONENTES_DATA_TABLES.md**
- Exemplos de código com nomes de tabelas
- Seção "ESTRUTURA DE DADOS COMPLETA"

#### **RESUMO_EXECUTIVO_DATA_TABLES.md**
- Referências a nomes de tabelas
- Diagramas de estrutura

#### **INDEX_DATA_TABLES_DOCUMENTATION.md**
- Referências em exemplos
- Diagramas ASCII

#### **PLANEJAMENTO_DATA_TABLES_REVISADO.md**
- Schemas de tabelas

#### **AGENTS_TABLE_ESTRUTURA_COMPLETA.md**
- Referências a FK (`workflow_executions`)

#### **AVALIACAO_SUGESTOES_MODELAGEM.md**
- Exemplos de código com nomes de tabelas

---

## 🎯 DECISÃO: Padrão de `workflow_id`

**Observado nos dados:**
```json
"workflow_id": "work_1001"  // ← SEM HÍFEN
```

**Confirmar padrão:**
- [ ] `work_1001` (underscore) ← **ATUAL**
- [ ] `work-1001` (hífen)

**Recomendação:** Manter `work_1001` (sem hífen) para consistência com `agent_id`, `project_id`.

---

## ✅ CONFIRMAÇÃO PARA PROSSEGUIR

**Antes de atualizar, confirme:**

1. **Padrão de `workflow_id`:**
   - `work_1001` ✅ (sem hífen)

2. **Deletar registros de teste vazios:**
   - `wrk_execution` id=2 (todos campos null)
   - `wrk_state` id=1 (todos campos null)
   - `wrk_variables` id=1 (todos campos null)

3. **Manter `agents` e `projects`:**
   - ✅ Dados corretos, manter como estão

**Após confirmação, vou:**
1. Atualizar todos os 4 componentes JavaScript
2. Atualizar todos os 7 documentos
3. Criar script de cleanup para deletar registros de teste
4. Preparar commit para GitHub

---

## 📝 CHANGELOG (Para GitHub Commit)

```
feat: Update table names to match N8N implementation

BREAKING CHANGES:
- Renamed workflow_executions → wrk_execution
- Renamed workflow_state → wrk_state
- Renamed workflow_variables → wrk_variables
- Changed timestamp fields: created_at → createdAt, updated_at → updatedAt

Updated files:
- All 4 JavaScript components
- All 7 documentation files
- Added validation report (VALIDACAO_TABELAS_CRIADAS.md)

Confirmed working:
- 5 tables created in N8N
- 1 agent registered (agent_001)
- 1 project registered (project_001)
- All isolation fields present
- Service discovery implemented
```

---

**Aguardando confirmação para prosseguir com atualização em massa.**
