# 📋 REQUISITOS FUNDAMENTAIS DO PROJETO

## 🔴 REGRAS INVIOLÁVEIS

### 1. **TUDO NO GITHUB**
- ✅ **TODOS** os códigos devem estar no GitHub
- ✅ **TODOS** os prompts devem estar no GitHub
- ✅ **TODAS** as URLs devem estar no CSV
- ❌ **NUNCA** hardcode no N8N
- ❌ **NUNCA** código inline nos nodes

### 2. **ESTRUTURA DE PASTAS OBRIGATÓRIA**
```
N8N-Research-Agents/
├── assembly-logic/
│   └── agents-registry-graph.csv    # CSV mestre com TODAS configurações
├── prompts/
│   └── agents/
│       ├── agent_001_enhanced_research.txt
│       ├── agent_002_fiscal_research.txt
│       └── agent_003_gdocs_documentation.txt
├── code/
│   ├── processors/
│   │   └── graph-processor-dynamic.js    # Processador único e reutilizável
│   └── formatters/
│       ├── response-formatter-production.js
│       ├── response-formatter-fiscal.js
│       └── response-formatter-gdocs.js
└── projects/
    └── project_001/
        ├── agent_001_tools.json
        ├── agent_002_tools.json
        └── agent_003_tools.json
```

### 3. **CSV É A FONTE DA VERDADE**
O CSV deve ter TODAS as URLs necessárias:
- `prompt_url` - URL do prompt no GitHub
- `processor_url` - URL do processador no GitHub
- `formatter_url` - URL do formatador no GitHub
- `mcp_endpoints` - JSON com todos os MCPs
- `tools_config_url` - URL de configuração adicional

### 4. **N8N APENAS ORQUESTRA**
O workflow N8N deve:
1. Carregar CSV do GitHub
2. Carregar processor do GitHub
3. Executar processor
4. Carregar prompt do GitHub
5. Carregar formatter do GitHub
6. Executar AI Agent
7. Executar formatter
8. Responder

### 5. **NOMENCLATURA CONSISTENTE**
- Agents: `agent_XXX_[tipo]`
- Prompts: `agent_XXX_[tipo].txt`
- Formatters: `response-formatter-[tipo].js`
- Sempre usar o mesmo ID em todos os arquivos

## 🎯 O QUE JÁ TEMOS FUNCIONANDO

### ✅ ESTRUTURA ATUAL CORRETA:
- **CSV**: `agents-registry-graph.csv` - JÁ TEM a estrutura certa com MCPs JSON
- **Processor**: `graph-processor-dynamic.js` - JÁ CARREGA prompt do GitHub
- **Prompts**: JÁ ESTÃO no GitHub na pasta correta
- **Workflow**: `uptax-proc-1001-graph-WORKING.json` - Base funcional

## ❌ O QUE NÃO FAZER

1. **NÃO criar versões v2, v3** - Use o que já existe
2. **NÃO duplicar arquivos** - Um processor para todos
3. **NÃO hardcode URLs** - Sempre no CSV
4. **NÃO código inline** - Sempre GitHub
5. **NÃO reinventar** - Já temos a solução!

## 🔧 O QUE VOCÊ PRECISA FAZER AGORA

### 1. **NO WORKFLOW N8N (uptax-proc-1001-graph-WORKING):**

Adicionar apenas 2 nodes HTTP Request:
- **Load Processor from GitHub** após Load CSV
- **Load Formatter from GitHub** após Graph Processor

### 2. **AJUSTAR O CSV** (pequena mudança):

O CSV atual tem `processor_url` na coluna errada. Precisa:
1. Mover MCPs para coluna 5 (após description)
2. Adicionar `formatter_url` como nova coluna

### 3. **COMMIT NO GITHUB:**

Fazer commit de:
- `response-formatter-production.js`
- CSV atualizado
- Manter TUDO que já está funcionando

## 📝 CHECKLIST FINAL

- [ ] CSV tem todas as URLs? ✅
- [ ] Processor carrega do GitHub? ✅
- [ ] Prompt carrega do GitHub? ✅
- [ ] Formatter carrega do GitHub? ⚠️ FALTA
- [ ] N8N só orquestra? ✅
- [ ] Tudo versionado no Git? ✅

## 🚨 LEMBRETE PARA PRÓXIMAS INTERAÇÕES

**SEMPRE** verificar se:
1. A solução já existe antes de criar nova
2. Está seguindo a estrutura de pastas
3. Está parametrizado no CSV
4. Está no GitHub, não no N8N

---

**STATUS ATUAL**: 90% pronto, falta apenas carregar formatter do GitHub!