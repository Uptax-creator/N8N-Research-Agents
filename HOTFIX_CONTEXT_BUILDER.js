// ✅ HOTFIX - Context Builder (Node bb7cbc09-7340-4d0b-a2df-16b4656b1868)
// Corrigido: Variables fallback + logs detalhados

const input = $('Webhook_Work_1001').item.json.body;

// Variables com fallbacks
const GITHUB_BASE = $vars?.UPTAX_GITHUB_BASE || 'https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment';
const PROJECT_ID = $vars?.UPTAX_PROJECT_ID || 'project_001';

console.log('🎯 Context Builder - Starting...');
console.log('📥 Input received:', JSON.stringify(input, null, 2));
console.log('🔧 Variables status:');
console.log('   - GITHUB_BASE:', GITHUB_BASE === 'undefined' ? 'MISSING' : 'OK');
console.log('   - PROJECT_ID:', PROJECT_ID);

const context = {
  // Dados da requisição
  session_id: `${input.project_id}_${input.agent_id}_${Date.now()}`,
  project_id: input.project_id || PROJECT_ID,
  agent_id: input.agent_id || 'agent_001',
  query: input.query || 'Default query',

  // URLs dinâmicas com fallback correto
  config_url: `${GITHUB_BASE}/agents/${input.agent_id || 'agent_001'}/config.json`,
  prompt_url: `${GITHUB_BASE}/agents/${input.agent_id || 'agent_001'}/prompt.json`,

  // Metadata
  timestamp: new Date().toISOString(),
  workflow_id: 'uptax-proc-1001-dynamic',
  original_input: input,

  // Debug info
  debug: {
    variables_configured: GITHUB_BASE !== 'undefined',
    github_base: GITHUB_BASE,
    node_name: 'Context Builder'
  }
};

console.log('✅ Context built for session:', context.session_id);
console.log('🔗 Config URL:', context.config_url);
console.log('📄 Prompt URL:', context.prompt_url);

return [{ json: context }];