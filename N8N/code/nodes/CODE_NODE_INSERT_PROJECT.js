// ========================================
// INSERT PROJECT - COM VALIDAÇÃO E CÓDIGO EXTERNO
// ========================================
//
// WORKFLOW NECESSÁRIO:
// 1. Webhook (POST insert_project)
// 2. Data Table GET → "Get_insert_projects" → Table: cad_projects → Get all rows
// 3. Code Node (ESTE CÓDIGO)
// 4. Data Table INSERT → Table: cad_projects
// 5. Respond to Webhook
//
// ========================================

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/N8N/code';

// 1. BUSCAR CÓDIGO DO GITHUB (externo)
const code = await this.helpers.httpRequest({
  method: 'GET',
  url: `${GITHUB_RAW_BASE}/processors/project-data-mapper-simple-schema.js`,
  returnFullResponse: false
});

// 2. EXECUTAR CÓDIGO
eval(code);

// 3. BUSCAR DADOS PRÉ-CARREGADOS DO NODE ANTERIOR
const allProjects = $('Get_insert_projects').all().map(item => item.json);

// 4. BUSCAR DADOS DO WEBHOOK (explicitamente)
const webhookNode = $('Webhook-project-insert').first().json;
const webhookData = webhookNode.body || webhookNode;

console.log('[DEBUG] Webhook data:', JSON.stringify(webhookData));
console.log('[DEBUG] All projects count:', allProjects.length);

// 5. MAPEAR E VALIDAR
const mappedData = mapProjectData(webhookData, allProjects);

// 6. RETORNAR
console.log('[INSERT_PROJECT] Success:', mappedData.project_id);
return { json: mappedData };
