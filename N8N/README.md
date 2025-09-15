# GitHub + n8n Integration - Research Agents

Dynamic prompt loading system for n8n workflows using GitHub as prompt storage.

## 🎯 Purpose

This repository demonstrates GitHub-based prompt storage integration with n8n workflows, enabling:

- **Dynamic Prompt Loading**: Load prompts from GitHub Raw URLs at runtime
- **Centralized Management**: Store and version control prompts in GitHub
- **Performance Optimized**: Caching strategies for sub-500ms loading
- **POC Validation**: Complete proof-of-concept workflows

## 📁 Structure

```
├── prompts/agents/
│   └── research-agent.json          # Core validation & system prompts
└── workflows/
    ├── poc1-component-github-validation.json
    └── poc2-agent-github-prompt.json
```

## 🚀 Quick Start

1. **Import workflows** into your n8n instance
2. **Activate** both POC workflows
3. **Test** the integration:

```bash
# Test component validation
curl -X POST "your-n8n-url/webhook/poc1-validation" \
  -H "Content-Type: application/json" \
  -d '{"type":"template","domain":"n8n","context":"Test"}'

# Test AI agent
curl -X POST "your-n8n-url/webhook/poc2-agent" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello! Confirm GitHub prompt loading."}'
```

## 📊 Performance

- **GitHub Loading**: ~200ms average
- **Total Response**: <2s target
- **Cache Strategy**: 300s TTL with fallback

## 🎯 Integration Points

- **n8n HTTP Request** → GitHub Raw URL
- **Dynamic Validation** → JSON-based rules
- **AI Agent Prompts** → System instructions from GitHub
- **Performance Monitoring** → Built-in metrics

Built with Claude Code for n8n automation workflows.