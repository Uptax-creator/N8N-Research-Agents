# 🚀 N8N Multi-Agent Orchestrator

Sistema completo de orquestração multi-agente para automação empresarial com N8N.

## 🎯 Características Principais

- **Orquestrador Inteligente**: Coordenação de múltiplos agentes especializados
- **Integração N8N Nativa**: Webhooks e workflows automatizados
- **3 Checkpoints de Aprovação**: Validação humana em pontos críticos
- **Interface Web Completa**: Formulários dinâmicos, chat e upload de arquivos
- **Dynamic Prompt Loading**: Prompts carregados do GitHub em tempo real
- **Fallback Inteligente**: Continua funcionando mesmo sem APIs externas

## 📁 Estrutura do Projeto

```
├── frontend/
│   └── client-interface.html        # Interface web completa
├── scripts/
│   ├── orchestrator-engine.js       # Motor de orquestração principal
│   ├── orchestrator-server.js       # Servidor Express API
│   └── test-*.js                    # Scripts de teste automatizados
├── prompts/
│   ├── agents/                      # Prompts de agentes especializados
│   └── orchestrators/               # Prompts do orquestrador
├── docs/
│   └── *.md                         # Documentação completa
└── workflows/
    └── *.json                       # Workflows N8N exportados
```

## 🚀 Instalação Rápida

1. **Clone o repositório**:
```bash
git clone https://github.com/yourusername/n8n-orchestrator.git
cd n8n-orchestrator
```

2. **Instale as dependências**:
```bash
npm install
```

3. **Configure as credenciais**:
```bash
cp .env.example .env
# Edite .env com suas credenciais
```

4. **Inicie o servidor**:
```bash
node scripts/orchestrator-server.js
```

5. **Acesse a interface**: http://localhost:3000

## 🧪 Testes

```bash
# Testar webhook N8N
node scripts/test-n8n-webhooks.js

# Testar pipeline completo
node scripts/test-pipeline-enhanced.js

# Monitor automático de ativação
node scripts/monitor-workflow-activation.js
```

## 📊 Performance

- **GitHub Loading**: ~200ms médio
- **Resposta Total**: <2s objetivo
- **Pipeline Completo**: <15min para casos simples
- **Cache Strategy**: 300s TTL com fallback

## 🔗 Integração N8N

### Configurar Webhook no N8N:

1. Criar novo workflow no N8N
2. Adicionar node "Webhook"
3. Configurar path (ex: `/webhook/enhanced-v2-final`)
4. Ativar workflow
5. Testar com scripts fornecidos

## 🎯 Casos de Uso

- **Desenvolvimento de Software**: Criação de agentes N8N
- **Planos de Negócio**: Análise financeira e marketing
- **Automação Administrativa**: Processos empresariais
- **Análise de Dados**: Dashboards e relatórios

## 📝 Licença

MIT

---

Built with ❤️ using Claude Code for N8N automation workflows.