/**
 * N8N Code Node Patterns & Error Prevention
 *
 * Biblioteca de padrões corretos para N8N Code Nodes
 * Previne erros comuns como "fetch is not defined"
 *
 * GitHub: https://github.com/Uptax-creator/N8N-Research-Agents
 * Branch: clean-deployment
 * Path: N8N/code/helpers/n8n-code-patterns.js
 *
 * @version 1.0.0
 */

/**
 * ========================================
 * ERRO #1: fetch is not defined
 * ========================================
 *
 * ❌ ERRADO:
 * const response = await fetch(url);
 *
 * ✅ CORRETO:
 */
async function httpGet(url, options = {}) {
  return await this.helpers.httpRequest({
    method: 'GET',
    url: url,
    headers: options.headers || {},
    timeout: options.timeout || 30000,
    returnFullResponse: false
  });
}

async function httpPost(url, body, options = {}) {
  return await this.helpers.httpRequest({
    method: 'POST',
    url: url,
    body: body,
    headers: options.headers || { 'Content-Type': 'application/json' },
    timeout: options.timeout || 30000,
    returnFullResponse: false
  });
}

/**
 * ========================================
 * ERRO #2: Acessar dados do webhook incorretamente
 * ========================================
 *
 * ❌ ERRADO:
 * const data = $json.body;
 *
 * ✅ CORRETO:
 */
function getWebhookData() {
  // Webhook pode enviar dados em diferentes locais
  return $input.item.json.body || $input.item.json;
}

/**
 * ========================================
 * ERRO #3: Carregar código do GitHub sem tratamento
 * ========================================
 *
 * ✅ PADRÃO SEGURO:
 */
async function loadFromGitHub(path) {
  const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/N8N/code';

  try {
    const code = await this.helpers.httpRequest({
      method: 'GET',
      url: `${GITHUB_RAW_BASE}${path}`,
      timeout: 10000,
      returnFullResponse: false
    });

    return code;
  } catch (error) {
    console.error(`[GITHUB_LOAD_ERROR] Failed to load ${path}:`, error.message);
    throw new Error(`Failed to load component from GitHub: ${path}`);
  }
}

/**
 * ========================================
 * ERRO #4: eval() sem tratamento de erro
 * ========================================
 *
 * ✅ PADRÃO SEGURO:
 */
function safeEval(code, context = {}) {
  try {
    // Cria função a partir do código
    const fn = new Function(...Object.keys(context), code);
    return fn(...Object.values(context));
  } catch (error) {
    console.error('[EVAL_ERROR]', error.message);
    throw new Error(`Failed to execute code: ${error.message}`);
  }
}

/**
 * ========================================
 * ERRO #5: Retornar dados sem estrutura correta
 * ========================================
 *
 * ❌ ERRADO:
 * return data;
 *
 * ✅ CORRETO:
 */
function returnData(data) {
  return {
    json: data
  };
}

/**
 * ========================================
 * ERRO #6: Não fazer log para debug
 * ========================================
 *
 * ✅ PADRÃO:
 */
function logDebug(tag, data) {
  console.log(`[${tag}]`, JSON.stringify(data, null, 2));
}

/**
 * ========================================
 * TEMPLATE COMPLETO: Load & Execute GitHub Code
 * ========================================
 */
async function loadAndExecuteGitHubCode(componentPath, inputData) {
  try {
    // 1. Load do GitHub
    const code = await this.helpers.httpRequest({
      method: 'GET',
      url: `https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/N8N/code${componentPath}`,
      timeout: 10000,
      returnFullResponse: false
    });

    // 2. Executa código
    eval(code);

    // 3. Executa função (assumindo que o código exporta uma função)
    const result = typeof module.exports === 'function'
      ? module.exports(inputData)
      : inputData;

    // 4. Log
    console.log('[COMPONENT_LOADED]', componentPath);
    console.log('[INPUT]', JSON.stringify(inputData, null, 2));
    console.log('[OUTPUT]', JSON.stringify(result, null, 2));

    // 5. Retorna
    return { json: result };

  } catch (error) {
    console.error('[COMPONENT_ERROR]', error.message);
    console.error('[STACK]', error.stack);
    throw error;
  }
}

/**
 * ========================================
 * EXEMPLO DE USO NO N8N CODE NODE
 * ========================================
 */

/*
// Exemplo 1: Load código do GitHub e executar função
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/N8N/code';

const code = await this.helpers.httpRequest({
  method: 'GET',
  url: `${GITHUB_RAW_BASE}/processors/agent-data-mapper.js`,
  returnFullResponse: false
});

eval(code);

const webhookData = $input.item.json.body || $input.item.json;
const result = mapAgentData(webhookData);

console.log('[AGENT_DATA_MAPPER] Mapped:', JSON.stringify(result, null, 2));

return { json: result };
*/

/**
 * ========================================
 * CHECKLIST DE VALIDAÇÃO
 * ========================================
 *
 * Antes de usar Code Node no N8N, verifique:
 *
 * ✅ Usa this.helpers.httpRequest() em vez de fetch()
 * ✅ Acessa webhook data via $input.item.json.body
 * ✅ Retorna { json: data } em vez de só data
 * ✅ Usa try/catch para tratamento de erros
 * ✅ Faz console.log() para debug
 * ✅ Timeout configurado (padrão 30s, GitHub 10s)
 * ✅ Headers corretos (Content-Type: application/json)
 */

// Export para documentação
module.exports = {
  httpGet,
  httpPost,
  getWebhookData,
  loadFromGitHub,
  safeEval,
  returnData,
  logDebug,
  loadAndExecuteGitHubCode
};
