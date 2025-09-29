#!/usr/bin/env node

// 🔧 SCRIPT PARA ATUALIZAR NODE 2 COM CÓDIGO GITHUB REAL
// Uso: node update-node2-github-real.js

const fs = require('fs');
const https = require('https');

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYzFjNDQxNy00NWQwLTRhODktYTZiMy01Y2JhMjdhY2Q0MzkiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4OTI0ODg3LCJleHAiOjE3NjY2Mzg4MDB9.OJiDGs9W0LGPOHxJYnBC6_HUSGtsGMzP4YWcP2DJoVc';
const API_URL = 'https://primary-production-56785.up.railway.app/api/v1';
const WORKFLOW_ID = 'scJSDgRWiHTkfNUn';

// Código GitHub Real para Node 2
const GITHUB_REAL_CODE = `// 🔍 GITHUB LOADER REAL - Micro Test
// Apenas busca GitHub, zero hardcode

const ssv = $input.item.json;

console.log('🔍 GitHub Loader Real - Starting...');
console.log('📥 SSV Input:', JSON.stringify(ssv, null, 2));

try {
  // === FUNÇÃO FETCH PARA GITHUB ===
  async function fetchFromGitHub(url) {
    console.log(\`📡 Fetching from: \${url}\`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'N8N-GitHub-Processor'
      },
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(\`GitHub fetch failed: \${response.status} - \${response.statusText}\`);
    }

    return await response.text();
  }

  // === FUNÇÃO PARSE CSV ===
  function findAgentInCSV(csvText, agentId) {
    console.log(\`🔍 Looking for agent_id: \${agentId}\`);

    const lines = csvText.split('\\n');
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values[0] === agentId) {
        const agent = {};
        headers.forEach((header, index) => {
          agent[header.trim()] = values[index] ? values[index].trim() : '';
        });
        console.log('✅ Agent found:', JSON.stringify(agent, null, 2));
        return agent;
      }
    }

    throw new Error(\`Agent not found: \${agentId}\`);
  }

  // === FUNÇÃO BUILD RESPONSE ===
  function buildRealResponse(ssv, agentRow, configData) {
    const config = JSON.parse(configData);

    return {
      success: true,
      output: "✅ Response carregado do GitHub!",
      query_received: ssv.request_data.query,
      agent_id_received: ssv.request_data.agent_id,
      project_id_received: ssv.request_data.project_id,
      workflow_id_received: ssv.request_data.ID_workflow,
      session_id_generated: ssv.request_data.session_id,

      // === DADOS DO GITHUB ===
      agent_info: {
        agent_name: config.agent_name,
        description: config.description,
        specialization: agentRow.specialization,
        agent_type: config.agent_type
      },

      // === METADATA GITHUB ===
      metadata: {
        github_integration: true,
        config_loaded_from_github: true,
        csv_registry_accessed: true,
        processor_version: "github-real-v3.0",
        github_config_url: agentRow.config_url,
        csv_agent_row: agentRow
      },

      // === DEBUG INFO ===
      debug_info: {
        node_type: "code_node_github_real",
        fetch_available: typeof fetch !== 'undefined',
        ssv_data_flow: {
          workflow_config: !!ssv.workflow_config,
          request_data: !!ssv.request_data,
          runtime: !!ssv.runtime
        }
      }
    };
  }

  // === FUNÇÃO FALLBACK ===
  function fallbackResponse(ssv, error) {
    console.log('⚠️ GitHub fallback activated:', error.message);

    return {
      success: false,
      output: "⚠️ GitHub indisponível - usando fallback",
      error: error.message,
      query_received: ssv.request_data.query,
      agent_id_received: ssv.request_data.agent_id,

      // === FALLBACK DATA ===
      agent_info: {
        agent_name: "Fallback Agent",
        description: "Fallback response when GitHub is unavailable"
      },

      metadata: {
        github_integration: false,
        fallback_mode: true,
        error_type: error.name
      }
    };
  }

  // === EXECUÇÃO PRINCIPAL ===

  // 1. Buscar CSV registry do GitHub
  const csvUrl = ssv.workflow_config.registry_csv_url;
  console.log(\`📋 Loading CSV from: \${csvUrl}\`);
  const csvResponse = await fetchFromGitHub(csvUrl);

  // 2. Parse CSV e fazer lookup
  const agentRow = findAgentInCSV(csvResponse, ssv.request_data.agent_id);

  // 3. Carregar config específico
  console.log(\`⚙️ Loading config from: \${agentRow.config_url}\`);
  const configResponse = await fetchFromGitHub(agentRow.config_url);

  // 4. Montar response com dados reais
  const realResponse = buildRealResponse(ssv, agentRow, configResponse);

  console.log('✅ GitHub integration successful!');
  return [{ json: realResponse }];

} catch (error) {
  console.log('❌ GitHub integration failed:', error.message);

  // Fallback caso GitHub indisponível
  const fallbackResp = fallbackResponse(ssv, error);
  return [{ json: fallbackResp }];
}`;

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function main() {
  console.log('🔧 Atualizando Node 2 com código GitHub real...');

  try {
    // 1. Buscar workflow atual
    console.log('📥 Buscando workflow atual...');
    const getOptions = {
      hostname: 'primary-production-56785.up.railway.app',
      path: \`/api/v1/workflows/\${WORKFLOW_ID}\`,
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': API_KEY,
        'Content-Type': 'application/json'
      }
    };

    const workflow = await makeRequest(getOptions);

    if (workflow.error) {
      throw new Error(\`Erro ao buscar workflow: \${workflow.error}\`);
    }

    console.log(\`✅ Workflow encontrado: \${workflow.name}\`);

    // 2. Encontrar e atualizar Node 2
    const targetNodeId = 'f3982896-2d4c-4006-9dfa-a950683729bc'; // Fixed Processor MVP
    const nodeIndex = workflow.nodes.findIndex(node => node.id === targetNodeId);

    if (nodeIndex === -1) {
      throw new Error('Node 2 não encontrado');
    }

    console.log(\`🎯 Node encontrado: \${workflow.nodes[nodeIndex].name}\`);

    // Atualizar código do node
    workflow.nodes[nodeIndex].parameters = {
      ...workflow.nodes[nodeIndex].parameters,
      jsCode: GITHUB_REAL_CODE
    };

    console.log('🔄 Código GitHub real aplicado');

    // 3. Salvar workflow atualizado
    console.log('💾 Salvando workflow...');
    const putOptions = {
      hostname: 'primary-production-56785.up.railway.app',
      path: \`/api/v1/workflows/\${WORKFLOW_ID}\`,
      method: 'PUT',
      headers: {
        'X-N8N-API-KEY': API_KEY,
        'Content-Type': 'application/json'
      }
    };

    const result = await makeRequest(putOptions, workflow);

    if (result.error) {
      throw new Error(\`Erro ao salvar workflow: \${result.error}\`);
    }

    console.log('✅ Workflow atualizado com sucesso!');
    console.log('🧪 Execute o teste agora:');
    console.log('curl -X POST https://primary-production-56785.up.railway.app/webhook/work-1001v1 \\\\');
    console.log('  -H "Content-Type: application/json" \\\\');
    console.log('  -d \'{"project_id":"micro_test","agent_id":"agent_micro_test","ID_workflow":"MICRO_TEST_001","query":"teste busca GitHub real"}\'');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

main();