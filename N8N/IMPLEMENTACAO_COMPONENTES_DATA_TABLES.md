# 🔧 IMPLEMENTAÇÃO DOS COMPONENTES DATA TABLES

## ✅ COMPONENTES CRIADOS

### **1. DataTableValidator** ([data-table-validator.js](code/validators/data-table-validator.js))
Simula constraints SQL (UNIQUE, FK, CHECK) via código JavaScript.

### **2. DataTableHelper** ([data-table-helper-enhanced.js](code/loaders/data-table-helper-enhanced.js))
CRUD operations com validações automáticas e suporte a envelope pattern.

### **3. CleanupJob** ([cleanup-job.js](code/processors/cleanup-job.js))
Retenção de dados (simula particionamento automático).

### **4. VariablePrecedenceResolver** ([variable-precedence-resolver.js](code/processors/variable-precedence-resolver.js))
Resolve variáveis seguindo precedência (simula SQL VIEW).

---

## 📋 COMO USAR OS COMPONENTES

### **Exemplo 1: Criar Execução com Validações**

```javascript
// Node: Context Builder (Code Node)
const DataTableValidator = require('./code/validators/data-table-validator.js');
const DataTableHelper = require('./code/loaders/data-table-helper-enhanced.js');

const validator = new DataTableValidator($);
const helper = new DataTableHelper($, validator);

// Dados do webhook
const webhookData = $input.first().json.body;

// Criar execution_id
const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Dados da execução
const executionData = {
  execution_id: executionId,
  workflow_id: webhookData.workflow_id || 'work-1001',
  project_id: webhookData.project_id || 'project_001',
  webhook_id: webhookData.webhook_id || 'webhook_001',
  agent_id: webhookData.agent_id || 'agent_001',
  session_id: webhookData.session_id || `session_${Date.now()}`,
  status: 'running',
  current_step: 'context_builder',
  user_query: webhookData.query || '',
  started_at: new Date().toISOString()
};

// Insert com validações automáticas
const result = await helper.insert('wrk_execution', executionData, {
  validateUnique: true,
  uniqueFields: ['execution_id'],
  skipIsolationCheck: false // Valida workflow_id, project_id, webhook_id
});

// Retornar envelope inicial
return [{
  json: {
    execution_id: executionId,
    workflow_config: {
      workflow_id: executionData.workflow_id,
      project_id: executionData.project_id,
      webhook_id: executionData.webhook_id,
      agent_id: executionData.agent_id
    },
    request_data: {
      query: executionData.user_query,
      session_id: executionData.session_id
    },
    runtime: {
      step: 'context_builder_completed',
      step_order: 1,
      timestamp: new Date().toISOString()
    },
    validation_result: result
  }
}];
```

---

### **Exemplo 2: Salvar Estado com Envelope Evolutivo**

```javascript
// Node: Config Loader (Code Node após HTTP Request)
const DataTableHelper = require('./code/loaders/data-table-helper-enhanced.js');
const DataTableValidator = require('./code/validators/data-table-validator.js');

const validator = new DataTableValidator($);
const helper = new DataTableHelper($, validator);

// Recuperar envelope anterior
const previousEnvelope = $('Context Builder').first().json;

// Dados do HTTP Request (config carregada)
const configData = $input.first().json;

// Envelope evolutivo (spread pattern)
const newEnvelope = {
  ...previousEnvelope,
  agent_config: configData,
  runtime: {
    ...previousEnvelope.runtime,
    step: 'config_loaded',
    step_order: previousEnvelope.runtime.step_order + 1,
    timestamp: new Date().toISOString()
  }
};

// Salvar estado no Data Table
const saveResult = await helper.saveStateWithEnvelope(
  previousEnvelope.execution_id,
  'config_loader',
  newEnvelope,
  {
    workflow_id: previousEnvelope.workflow_config.workflow_id,
    project_id: previousEnvelope.workflow_config.project_id,
    webhook_id: previousEnvelope.workflow_config.webhook_id,
    agent_id: previousEnvelope.workflow_config.agent_id
  }
);

// Retornar envelope atualizado
return [{
  json: {
    ...newEnvelope,
    state_save_result: saveResult
  }
}];
```

---

### **Exemplo 3: Resolver Variável com Precedência**

```javascript
// Node: Variable Resolver (Code Node)
const VariablePrecedenceResolver = require('./code/processors/variable-precedence-resolver.js');

const envelope = $('Config Loader').first().json;

const context = {
  execution_id: envelope.execution_id,
  webhook_id: envelope.workflow_config.webhook_id,
  workflow_id: envelope.workflow_config.workflow_id,
  project_id: envelope.workflow_config.project_id
};

// Resolver variável 'api_key' seguindo precedência
const apiKey = await VariablePrecedenceResolver.getVariableWithPrecedence(
  $,
  'api_key',
  context
);

// Resolver múltiplas variáveis
const variables = await VariablePrecedenceResolver.resolveVariables(
  $,
  ['api_key', 'model_name', 'temperature'],
  context
);

return [{
  json: {
    ...envelope,
    resolved_variables: variables,
    api_key_found: apiKey !== null,
    api_key_from: apiKey?.resolved_from
  }
}];
```

---

### **Exemplo 4: Cleanup Job (Scheduled Workflow)**

```javascript
// Node: Cleanup Scheduler (Code Node em workflow separado)
const CleanupJob = require('./code/processors/cleanup-job.js');

// Configuração de retenção
const config = {
  executions_retention_days: 180,  // 6 meses
  variables_retention_days: 90,    // 3 meses
  dry_run: false                   // false = executa, true = preview
};

// Executar cleanup completo
const result = await CleanupJob.cleanupAll($, config);

// Log e notificação
console.log('🧹 Cleanup Results:', JSON.stringify(result, null, 2));

return [{
  json: {
    cleanup_executed: true,
    timestamp: new Date().toISOString(),
    results: result,
    total_deleted: result.total_deleted,
    success: result.success
  }
}];
```

---

### **Exemplo 5: Atualizar Status de Execução**

```javascript
// Node: Finalizer (Code Node final do workflow)
const DataTableHelper = require('./code/loaders/data-table-helper-enhanced.js');
const DataTableValidator = require('./code/validators/data-table-validator.js');

const validator = new DataTableValidator($);
const helper = new DataTableHelper($, validator);

const envelope = $('Agent Initializer').first().json;

// Calcular tempo total
const execution = await helper.get('wrk_execution', {
  execution_id: envelope.execution_id
});

const startTime = new Date(execution[0].started_at);
const endTime = new Date();
const totalTime = endTime - startTime;

// Atualizar execução
const updateResult = await helper.update(
  'wrk_execution',
  execution[0].id,
  {
    status: 'completed',
    current_step: 'finished',
    finished_at: endTime.toISOString(),
    total_time_ms: totalTime
  }
);

return [{
  json: {
    ...envelope,
    execution_completed: true,
    total_time_ms: totalTime,
    update_result: updateResult
  }
}];
```

---

## 🎯 TESTES RECOMENDADOS

### **Teste 1: Validação de Unicidade**

```javascript
// Tentar inserir execution_id duplicado
const executionData = {
  execution_id: 'exec_duplicate_test',
  workflow_id: 'work-1001',
  project_id: 'project_001',
  webhook_id: 'webhook_001',
  status: 'running'
};

// Primeiro insert: sucesso
const result1 = await helper.insert('wrk_execution', executionData, {
  validateUnique: true,
  uniqueFields: ['execution_id']
});
console.log('✅ First insert:', result1.success); // true

// Segundo insert: deve falhar
const result2 = await helper.insert('wrk_execution', executionData, {
  validateUnique: true,
  uniqueFields: ['execution_id']
});
console.log('❌ Second insert:', result2.success); // false
console.log('Error:', result2.error); // "Duplicate entry..."
```

---

### **Teste 2: Validação de Foreign Key**

```javascript
// Tentar criar estado sem execução existente
const stateData = {
  state_id: 'state_orphan',
  execution_id: 'exec_nonexistent',
  workflow_id: 'work-1001',
  project_id: 'project_001',
  webhook_id: 'webhook_001',
  step_name: 'test',
  step_order: 1,
  state_data_json: JSON.stringify({ test: 'data' })
};

const result = await helper.insert('wrk_state', stateData, {
  validateFK: true,
  fkChecks: [
    {
      table: 'wrk_execution',
      field: 'execution_id',
      value: stateData.execution_id
    }
  ]
});

console.log('❌ FK validation:', result.success); // false
console.log('Error:', result.error); // "FK violation: execution_id=exec_nonexistent not found..."
```

---

### **Teste 3: Precedência de Variáveis**

```javascript
// Criar variáveis em diferentes escopos
await VariablePrecedenceResolver.setVariable(
  $,
  'model_name',
  'gemini-1.5-pro',
  'project',
  { project_id: 'project_001' }
);

await VariablePrecedenceResolver.setVariable(
  $,
  'model_name',
  'gemini-2.0-flash',
  'workflow',
  { project_id: 'project_001', workflow_id: 'work-1001' }
);

await VariablePrecedenceResolver.setVariable(
  $,
  'model_name',
  'gpt-4-turbo',
  'execution',
  {
    project_id: 'project_001',
    workflow_id: 'work-1001',
    webhook_id: 'webhook_001',
    execution_id: 'exec_123'
  }
);

// Resolver: deve retornar 'gpt-4-turbo' (execution tem precedência)
const resolved = await VariablePrecedenceResolver.getVariableWithPrecedence(
  $,
  'model_name',
  {
    execution_id: 'exec_123',
    webhook_id: 'webhook_001',
    workflow_id: 'work-1001',
    project_id: 'project_001'
  }
);

console.log('✅ Resolved value:', JSON.parse(resolved.variable_value_json)); // 'gpt-4-turbo'
console.log('✅ Resolved from:', resolved.resolved_from); // 'execution'
console.log('✅ Precedence level:', resolved.precedence_level); // 1
```

---

## 📊 ESTRUTURA DE DADOS COMPLETA

### **wrk_execution**
```javascript
{
  id: "auto_generated",           // N8N auto-incrementa
  execution_id: "exec_123",       // PK lógica (string)
  workflow_id: "work-1001",       // Isolation
  project_id: "project_001",      // Isolation
  webhook_id: "webhook_001",      // Isolation
  agent_id: "agent_001",          // Isolation
  session_id: "session_456",
  status: "running",              // running|completed|failed
  current_step: "config_loader",
  user_query: "Analyze market...",
  started_at: "2025-01-15T10:00:00.000Z",
  finished_at: "2025-01-15T10:05:30.000Z",
  total_time_ms: 330000,
  error_message: null,
  created_at: "2025-01-15T10:00:00.000Z",
  updated_at: "2025-01-15T10:05:30.000Z"
}
```

### **wrk_state**
```javascript
{
  id: "auto_generated",
  state_id: "state_exec_123_1",
  execution_id: "exec_123",      // FK para wrk_execution
  workflow_id: "work-1001",
  project_id: "project_001",
  webhook_id: "webhook_001",
  step_name: "config_loader",
  step_order: 1,
  state_data_json: "{\"workflow_config\":{...},\"agent_config\":{...}}",
  step_time_ms: 250,
  created_at: "2025-01-15T10:00:00.250Z"
}
```

### **wrk_variables**
```javascript
{
  id: "auto_generated",
  variable_id: "var_123",
  variable_name: "api_key",
  variable_value_json: "\"sk-proj-...\"",
  variable_type: "execution",    // execution|webhook|workflow|project
  project_id: "project_001",
  workflow_id: "work-1001",
  webhook_id: "webhook_001",
  execution_id: "exec_123",
  created_at: "2025-01-15T10:00:00.000Z",
  updated_at: "2025-01-15T10:00:00.000Z"
}
```

---

## 🚀 PRÓXIMOS PASSOS

### **1. Criar Tabelas no N8N UI**
- Acessar N8N → Data Tables
- Criar tabelas conforme schemas acima
- Validar tipos de campos (string, datetime, number, boolean)

### **2. Subir Componentes no GitHub**
- Commit dos 4 arquivos JavaScript
- URL base: `https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/code/...`

### **3. Criar Workflow de Teste**
- 5 nodes: Webhook → Context Builder → Config Loader → State Saver → Finalizer
- Validar envelope evolutivo
- Testar validações automáticas

### **4. Implementar Cleanup Job**
- Criar workflow scheduled (daily/weekly)
- Configurar retention policies
- Monitorar crescimento das tabelas

---

## ✅ CONCLUSÃO

**Componentes criados:**
- ✅ DataTableValidator - Constraints via código
- ✅ DataTableHelper - CRUD com validações
- ✅ CleanupJob - Retenção automática
- ✅ VariablePrecedenceResolver - Precedência de variáveis

**Próximo passo:** Criar tabelas no N8N UI e testar componentes em workflow real.
