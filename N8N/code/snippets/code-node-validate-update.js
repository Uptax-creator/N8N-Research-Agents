// ========================================
// CODE NODE: VALIDATE UPDATE WITH GET
// ========================================
// Coloque este node DEPOIS do GET All Agents
// ANTES do UPDATE Agents

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/N8N/code';

// Load validator from GitHub
const response = await this.helpers.httpRequest({
  method: 'GET',
  url: `${GITHUB_RAW_BASE}/processors/agent-update-validator.js`,
  returnFullResponse: false
});

eval(response);

// Pega dados mapeados do Code Node anterior (Map Data)
const updateData = $('Code Map Data').first().json;

// Pega lista de agents do GET
const existingAgents = $input.all().map(item => item.json);

console.log('[UPDATE_VALIDATOR] Update data:', JSON.stringify(updateData, null, 2));
console.log('[UPDATE_VALIDATOR] Existing agents count:', existingAgents.length);

// Valida e prepara UPDATE
try {
  const result = validateAndPrepareUpdate(updateData, existingAgents);

  console.log('[UPDATE_VALIDATOR] ✅ Validation passed');
  console.log('[UPDATE_VALIDATOR] Agent found with ID:', result.existing.id);
  console.log('[UPDATE_VALIDATOR] Will UPDATE:', result.message);

  // Retorna dados validados com ID correto
  return {
    json: result.validated
  };

} catch (error) {
  console.error('[UPDATE_VALIDATOR] ❌ Validation failed:', error.message);

  // Retorna erro estruturado
  return {
    json: {
      error: true,
      message: error.message,
      agent_id: updateData.agent_id,
      project_id: updateData.project_id
    }
  };
}
