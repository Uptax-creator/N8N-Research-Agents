# 🚀 QUICK START: INSERT PROJECT Endpoint

## 📋 Pré-requisitos
- ✅ N8N rodando (Railway)
- ✅ Data Table `cad_projects` criada
- ✅ Código `project-data-mapper-simple-schema.js` no GitHub

## 🔧 Passo 1: Importar Workflow no N8N

1. Abra o N8N: https://primary-production-56785.up.railway.app
2. Vá em **Workflows** → **Import from File**
3. Selecione: `N8N/workflows/insert-project-endpoint.json`
4. Clique em **Save** e depois **Activate**

## ✅ Passo 2: Testar o Endpoint

### URL do Webhook:
```
https://primary-production-56785.up.railway.app/webhook/insert_project
```

### Teste com cURL:
```bash
curl -X POST https://primary-production-56785.up.railway.app/webhook/insert_project \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "UPTAX Meta Agent System",
    "company_name": "UPTAX Soluções Tributárias",
    "description": "Sistema multi-agente para pesquisa e documentação fiscal brasileira",
    "created_by": "kleber.ribeiro@uptax.com.br",
    "tags": "multi-agent, n8n, fiscal-research"
  }'
```

### Resposta Esperada:
```json
{
  "success": true,
  "project_id": "PROJ-001",
  "message": "Project created successfully",
  "data": {
    "project_id": "PROJ-001",
    "project_name": "UPTAX Meta Agent System",
    "company_name": "UPTAX Soluções Tributárias",
    "description": "Sistema multi-agente para pesquisa e documentação fiscal brasileira",
    "created_by": "kleber.ribeiro@uptax.com.br",
    "is_active": true,
    "tags": "multi-agent, n8n, fiscal-research"
  }
}
```

## 🎯 Payload de Teste Pronto
Use o arquivo: `N8N/workflows/test-payloads/project_001_payload.json`

## 🔍 Troubleshooting

### Erro: "Data Table not found"
- Verifique se a tabela `cad_projects` existe no N8N
- Vá em **Data Tables** e confirme o nome exato

### Erro: "Failed to load mapper from GitHub"
- Verifique se o arquivo está no GitHub:
  ```
  https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/N8N/code/processors/project-data-mapper-simple-schema.js
  ```

### Erro: "Duplicate project_id"
- O sistema gera IDs sequenciais (PROJ-001, PROJ-002...)
- Se houver duplicata, o mapper incrementará automaticamente

## 📊 Estrutura da Tabela cad_projects

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `project_id` | String | ✅ | ID único (PROJ-001, PROJ-002...) |
| `project_name` | String | ✅ | Nome do projeto |
| `company_name` | String | ✅ | Nome da empresa |
| `description` | String | ❌ | Descrição do projeto |
| `created_by` | String | ✅ | Email do criador |
| `is_active` | Boolean | ✅ | Status (default: true) |
| `tags` | String | ❌ | Tags separadas por vírgula |

## ✨ Próximos Passos
1. ✅ Testar INSERT PROJECT
2. 📋 Popular tabela agents (3 agents)
3. 🌐 Configurar frontend
4. 🎉 Sistema completo funcionando!
