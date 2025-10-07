// ========================================
// INSERT AGENT - COM VALIDAÇÃO E CÓDIGO EXTERNO
// ========================================
//
// WORKFLOW NECESSÁRIO:
// 1. Webhook (POST insert_agent)
// 2. Data Table GET → "Get_insert_agents" → Table: agents → Get all rows
// 3. Data Table GET → "Get_project-insert" → Table: cad_projects → Get all rows
// 4. Code Node (ESTE CÓDIGO)
// 5. Data Table INSERT → Table: agents
// 6. Respond to Webhook
//
// ========================================

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/N8N/code';

// 1. BUSCAR CÓDIGO DO GITHUB (externo)
const code = await this.helpers.httpRequest({
  method: 'GET',
  url: `${GITHUB_RAW_BASE}/processors/agent-data-mapper-with-validation.js`,
  returnFullResponse: false
});

// 2. EXECUTAR CÓDIGO (cria funções mapAgentData e validateUniqueLatestConstraint)
eval(code);

// 3. BUSCAR DADOS PRÉ-CARREGADOS DOS NODES ANTERIORES
const allAgents = $('Get_insert_agents').all().map(item => item.json);
const allProjects = $('Get_project-insert').all().map(item => item.json);

// 4. PROCESSAR WEBHOOK DATA
const webhookData = $input.item.json.body || $input.item.json;

// 5. MAPEAR DADOS (com validação)
const mappedData = mapAgentData(webhookData, allAgents, allProjects);

// 6. LOG E RETORNO
console.log('[INSERT_AGENT] Success:', mappedData.agent_id);
return { json: mappedData };
