/**
 * Response Formatter - Production Version
 * GitHub-hosted formatter for N8N Graph System
 * Auto-deploy via URL: https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/code/response-formatter-production.js
 */

// Response Formatter - Formata resposta do AI Agent
const aiResponse = $('Enhanced AI Agent').item.json;
const processorData = $('Prepare for AI Agent').item.json;

// Extrai a resposta do AI Agent
const aiOutput = aiResponse?.output || aiResponse?.text || aiResponse?.response || 'Nenhuma resposta gerada';

// Detecta quais ferramentas foram usadas
const toolsUsed = [];
if (aiOutput.includes('search_engine') || aiOutput.includes('Bright Data')) {
  toolsUsed.push('Bright Data Search');
}
if (aiOutput.includes('scrape_as_markdown')) {
  toolsUsed.push('Web Scraping');
}
if (aiOutput.includes('GOOGLEDOCS_CREATE_DOCUMENT')) {
  toolsUsed.push('Google Docs');
}

// Extrai link do Google Docs se existir
let googleDocsLink = null;
const docsLinkMatch = aiOutput.match(/https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9_-]+/);
if (docsLinkMatch) {
  googleDocsLink = docsLinkMatch[0];
}

const result = {
  success: true,
  agent: processorData.agent_config?.agent_type || 'enhanced_research',
  project_id: processorData.agent_config?.project_id || 'unknown',
  agent_id: processorData.agent_config?.agent_id || 'unknown',
  description: processorData.agent_config?.description || 'Research Agent',

  // Query e resposta
  query: processorData.text || 'No query',
  result: aiOutput,

  // Links extraídos
  google_docs_link: googleDocsLink,

  // Metadados
  metadata: {
    session_id: processorData.session_id,
    prompt_loaded: processorData.prompt_loaded || false,
    tools_used: toolsUsed,
    mcps_available: ['bright_data', 'google_docs'],
    timestamp: new Date().toISOString(),
    workflow: 'uptax-proc-1001-graph',
    version: '2.0.0-production'
  },

  // Status da execução
  execution: {
    duration_ms: Date.now() - parseInt(processorData.session_id?.split('_')[2] || Date.now()),
    nodes_executed: 7,
    status: 'completed'
  }
};

console.log('✅ Response formatted successfully');
console.log('📊 Tools used:', toolsUsed.join(', ') || 'None detected');
if (googleDocsLink) {
  console.log('📄 Google Docs created:', googleDocsLink);
}

return [{ json: result }];