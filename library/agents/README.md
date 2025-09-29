# 📚 AGENTS LIBRARY

## Structure:
```
library/agents/
├── agent_001/           # Basic agent template
│   ├── config.json
│   └── prompt.json
├── agent_micro_test/    # Testing agent
│   ├── config.json
│   └── prompt.json
└── enhanced-research/   # Advanced agent
    ├── config.json
    └── prompt.json
```

## Usage:
```javascript
const agentConfig = `${GITHUB_BASE}/library/agents/${agent_id}/config.json`;
const agentPrompt = `${GITHUB_BASE}/library/agents/${agent_id}/prompt.json`;
```