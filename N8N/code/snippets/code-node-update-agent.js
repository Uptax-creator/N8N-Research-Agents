// ========================================
// CODE NODE: UPDATE AGENT WITH ID VALIDATION
// ========================================
// Use este código no workflow UPDATE
// Carrega agent-update-mapper.js do GitHub

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/N8N/code';

// Load UPDATE mapper from GitHub
const response = await this.helpers.httpRequest({
  method: 'GET',
  url: `${GITHUB_RAW_BASE}/processors/agent-update-mapper.js`,
  returnFullResponse: false
});

const code = response;

// Executa o código para criar a função mapAgentUpdateData
eval(code);

// Mapeia dados do webhook body (inclui ID obrigatório)
const webhookData = $input.item.json.body || $input.item.json;
const mappedData = mapAgentUpdateData(webhookData);

// Log para debug
console.log('[AGENT_UPDATE_MAPPER] Input:', JSON.stringify(webhookData, null, 2));
console.log('[AGENT_UPDATE_MAPPER] Mapped:', JSON.stringify(mappedData, null, 2));
console.log('[AGENT_UPDATE_MAPPER] ID for UPDATE:', mappedData.id);

// Retorna dados mapeados para próximo node
return {
  json: mappedData
};
