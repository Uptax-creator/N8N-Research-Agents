// ✅ CSV LOADER DUAL MCP - FUNCIONA COM FRONTEND PARAMETRIZADO E ARQUITETURA DUAL MCP
const inputData = $input.first().json;
const webhookData = inputData.body || inputData;

// ✅ CONFIGURAÇÃO DUAL MCP ENDPOINTS FIXOS
const DUAL_MCP_CONFIG = {
  mcp_endpoint_http_1: 'https://mcp.brightdata.com/mcp?token=ecfc6404fb9eb026a9c802196b8d5caaf131d63c0931f9e888e57077e6b1f8cf', // Bright Data
  mcp_endpoint_http_2: 'https://apollo.composio.dev/mcp', // Composio

  // Mapeamento de agents para endpoints
  agent_endpoint_mapping: {
    'agent_001': 'mcp_endpoint_http_1', // Enhanced Research -> Bright Data
    'agent_002': 'mcp_endpoint_http_1', // Fiscal Research -> Bright Data
    'agent_003': 'mcp_endpoint_http_2'  // GDocs Documentation -> Composio
  },

  // Mapeamento de provider para endpoint
  provider_endpoint_mapping: {
    'bright_data': 'mcp_endpoint_http_1',
    'composio': 'mcp_endpoint_http_2'
  }
};

console.log('📦 [CSV Loader DUAL MCP] HYBRID - Iniciando');
console.log('🎯 Agent ID:', webhookData.agent_id);
console.log('🔍 Query:', webhookData.query);
console.log('⚡ DUAL MCP Architecture: ENABLED');

// ✅ FUNÇÃO PARA DETERMINAR MCP ENDPOINT BASEADO NO AGENT
function getMcpEndpointForAgent(agentId) {
  const endpointKey = DUAL_MCP_CONFIG.agent_endpoint_mapping[agentId];
  if (!endpointKey) {
    console.log(`⚠️ [CSV DUAL MCP] Agent ID ${agentId} não mapeado, usando endpoint padrão`);
    return DUAL_MCP_CONFIG.mcp_endpoint_http_1; // Default para Bright Data
  }
  return DUAL_MCP_CONFIG[endpointKey];
}

// ✅ FUNÇÃO PARA DETECTAR PROVIDER BASEADO NO ENDPOINT
function detectMcpProviderFromEndpoint(endpoint) {
  if (endpoint === DUAL_MCP_CONFIG.mcp_endpoint_http_1) return 'bright_data';
  if (endpoint === DUAL_MCP_CONFIG.mcp_endpoint_http_2) return 'composio';
  return 'unknown';
}

// ✅ PRIORIDADE 1: SE FRONTEND ENVIOU AGENT_CONFIG, ATUALIZAR COM DUAL MCP
if (webhookData.agent_config && Object.keys(webhookData.agent_config).length > 0) {
  console.log('✅ [CSV DUAL MCP] Config recebido do frontend - atualizando com DUAL MCP endpoints');

  // Determinar endpoint correto para o agent
  const assignedEndpoint = getMcpEndpointForAgent(webhookData.agent_config.agent_id);
  const mcpProvider = detectMcpProviderFromEndpoint(assignedEndpoint);

  // Atualizar agent_config com informações DUAL MCP
  const updatedAgentConfig = {
    ...webhookData.agent_config,
    mcp_endpoint: assignedEndpoint, // Para compatibilidade
    mcp_provider: mcpProvider,
    dual_mcp_architecture: true,
    assigned_mcp_endpoint: assignedEndpoint
  };

  const envelope = {
    envelope_metadata: {
      version: '2.6-dual-mcp-hybrid',
      created_at: new Date().toISOString(),
      session_id: 'frontend_dual_mcp_' + Date.now(),
      flow_step: 'csv_bypassed_dual_mcp',
      dual_mcp_architecture: true
    },
    webhook_data: {
      ...webhookData,
      research_type: detectResearchType(webhookData.query || ''),
      format_requested: webhookData.format || 'comprehensive_research'
    },
    agent_config: updatedAgentConfig,

    // ✅ DUAL MCP ENDPOINTS - AMBOS DISPONÍVEIS
    mcp_endpoint_http_1: DUAL_MCP_CONFIG.mcp_endpoint_http_1,
    mcp_endpoint_http_2: DUAL_MCP_CONFIG.mcp_endpoint_http_2,
    mcp_endpoint_http: assignedEndpoint, // Endpoint selecionado

    session_state: {
      stage: 'csv_loaded_dual_mcp',
      csv_loaded: true,
      agent_found: true,
      csv_source: 'frontend_parametrized_dual_mcp',
      agents_available: ['agent_001', 'agent_002', 'agent_003'],
      dual_mcp_architecture: true,
      assigned_endpoint: assignedEndpoint,
      mcp_provider: mcpProvider
    },

    // ✅ CONFIGURAÇÃO DUAL MCP PARA REFERÊNCIA
    dual_mcp_config: {
      architecture: 'DUAL_ENDPOINTS',
      endpoint_1: {
        url: DUAL_MCP_CONFIG.mcp_endpoint_http_1,
        provider: 'bright_data',
        agents: ['agent_001', 'agent_002']
      },
      endpoint_2: {
        url: DUAL_MCP_CONFIG.mcp_endpoint_http_2,
        provider: 'composio',
        agents: ['agent_003']
      },
      current_assignment: {
        agent_id: webhookData.agent_config.agent_id,
        endpoint_url: assignedEndpoint,
        provider: mcpProvider
      }
    }
  };

  console.log('✅ [CSV Loader DUAL MCP] Frontend config usado:', webhookData.agent_config.agent_id);
  console.log('🎯 [CSV Loader DUAL MCP] Endpoint atribuído:', assignedEndpoint);
  console.log('🔧 [CSV Loader DUAL MCP] Provider:', mcpProvider);
  return [{ json: envelope }];
}

// ✅ PRIORIDADE 2: FALLBACK PARA CSV HARDCODED COM DUAL MCP (se não vier do frontend)
console.log('⚠️ [CSV DUAL MCP] Sem config do frontend - usando CSV hardcoded com DUAL MCP');

const csvData = `workflow_id,project_id,agent_id,agent_type,description,prompt_url,processor_url,response_formatter_url,mcp_endpoint,tools_config_url,status,version,created_by,updated_at
uptax-proc-1001-dual-mcp,project_001,agent_001,enhanced_research,Brazilian market research with Bright Data,https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/prompts/agents/agent_001_enhanced_research.json,https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/processors/enhanced-research-processor.js,https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/formatters/enhanced-research-formatter.js,${DUAL_MCP_CONFIG.mcp_endpoint_http_1},https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/tools-config/bright-data-tools.json,active,2.6-dual-mcp,uptax-automation,2024-10-01T12:00:00Z
uptax-proc-1001-dual-mcp,project_001,agent_002,fiscal_research,Brazilian tax and fiscal legislation research,https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/prompts/agents/agent_002_fiscal_research.json,https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/processors/fiscal-research-processor.js,https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/formatters/fiscal-research-formatter.js,${DUAL_MCP_CONFIG.mcp_endpoint_http_1},https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/tools-config/bright-data-fiscal-tools.json,active,2.6-dual-mcp,uptax-automation,2024-10-01T12:00:00Z
uptax-proc-1001-dual-mcp,project_001,agent_003,gdocs_documentation,Automated Google Docs creation and documentation,https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/prompts/agents/agent_003_gdocs_documentation.json,https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/processors/gdocs-processor.js,https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/formatters/gdocs-formatter.js,${DUAL_MCP_CONFIG.mcp_endpoint_http_2},https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/tools-config/composio-gdocs-tools.json,active,2.6-dual-mcp,uptax-automation,2024-10-01T12:00:00Z`;

try {
  const lines = csvData.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());

  let agentConfig = null;
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());

    if (values[2] === webhookData.agent_id) {
      agentConfig = {};
      headers.forEach((header, index) => {
        agentConfig[header] = values[index] || '';
      });

      // ✅ APLICAR CONFIGURAÇÃO DUAL MCP
      const assignedEndpoint = getMcpEndpointForAgent(agentConfig.agent_id);
      const mcpProvider = detectMcpProviderFromEndpoint(assignedEndpoint);

      // Atualizar configuração
      agentConfig.mcp_endpoint = assignedEndpoint;
      agentConfig.mcp_provider = mcpProvider;
      agentConfig.dual_mcp_architecture = true;
      agentConfig.assigned_mcp_endpoint = assignedEndpoint;

      console.log('✅ [CSV DUAL MCP] Agent encontrado no CSV:', agentConfig.agent_id);
      console.log('🎯 [CSV DUAL MCP] Endpoint atribuído:', assignedEndpoint);
      console.log('🔧 [CSV DUAL MCP] Provider:', mcpProvider);
      break;
    }
  }

  // Se agentConfig não foi encontrado, criar um com DUAL MCP
  if (!agentConfig) {
    const assignedEndpoint = getMcpEndpointForAgent(webhookData.agent_id);
    const mcpProvider = detectMcpProviderFromEndpoint(assignedEndpoint);

    agentConfig = {
      agent_id: webhookData.agent_id,
      agent_name: 'fallback_agent_dual_mcp',
      fallback: true,
      mcp_endpoint: assignedEndpoint,
      mcp_provider: mcpProvider,
      dual_mcp_architecture: true,
      assigned_mcp_endpoint: assignedEndpoint
    };

    console.log('⚠️ [CSV DUAL MCP] Agent não encontrado, criando fallback com endpoint:', assignedEndpoint);
  }

  const envelope = {
    envelope_metadata: {
      version: '2.6-dual-mcp-hybrid',
      created_at: new Date().toISOString(),
      session_id: 'csv_dual_mcp_' + Date.now(),
      flow_step: 'csv_loader_dual_mcp',
      dual_mcp_architecture: true
    },
    webhook_data: {
      ...webhookData,
      research_type: detectResearchType(webhookData.query || ''),
      format_requested: webhookData.format || 'comprehensive_research'
    },
    agent_config: agentConfig,

    // ✅ DUAL MCP ENDPOINTS - AMBOS DISPONÍVEIS
    mcp_endpoint_http_1: DUAL_MCP_CONFIG.mcp_endpoint_http_1,
    mcp_endpoint_http_2: DUAL_MCP_CONFIG.mcp_endpoint_http_2,
    mcp_endpoint_http: agentConfig.assigned_mcp_endpoint, // Endpoint selecionado

    session_state: {
      stage: 'csv_loaded_dual_mcp',
      csv_loaded: !!agentConfig,
      agent_found: !!agentConfig && !agentConfig.fallback,
      csv_source: 'hardcoded_fallback_dual_mcp',
      dual_mcp_architecture: true,
      assigned_endpoint: agentConfig.assigned_mcp_endpoint,
      mcp_provider: agentConfig.mcp_provider
    },

    // ✅ CONFIGURAÇÃO DUAL MCP PARA REFERÊNCIA
    dual_mcp_config: {
      architecture: 'DUAL_ENDPOINTS',
      endpoint_1: {
        url: DUAL_MCP_CONFIG.mcp_endpoint_http_1,
        provider: 'bright_data',
        agents: ['agent_001', 'agent_002']
      },
      endpoint_2: {
        url: DUAL_MCP_CONFIG.mcp_endpoint_http_2,
        provider: 'composio',
        agents: ['agent_003']
      },
      current_assignment: {
        agent_id: agentConfig.agent_id,
        endpoint_url: agentConfig.assigned_mcp_endpoint,
        provider: agentConfig.mcp_provider
      }
    }
  };

  console.log('✅ [CSV Loader DUAL MCP] Hybrid - Agente:', agentConfig ? agentConfig.agent_id : 'fallback');
  console.log('🎯 [CSV Loader DUAL MCP] Endpoint final:', agentConfig.assigned_mcp_endpoint);
  console.log('🔧 [CSV Loader DUAL MCP] Provider final:', agentConfig.mcp_provider);
  return [{ json: envelope }];

} catch (error) {
  console.error('❌ [CSV Loader DUAL MCP] ERRO:', error.message);
  return [{
    json: {
      envelope_metadata: {
        version: '2.6-dual-mcp-hybrid',
        session_id: 'error_dual_mcp_' + Date.now(),
        error: true,
        dual_mcp_architecture: true
      },
      webhook_data: webhookData,
      session_state: {
        stage: 'error',
        csv_loaded: false,
        errors: [error.message],
        dual_mcp_architecture: true
      }
    }
  }];
}

function detectResearchType(query) {
  const q = (query || '').toLowerCase();
  if (q.includes('comparar')) return 'comparative_analysis';
  if (q.includes('mercado')) return 'market_research';
  if (q.includes('fiscal') || q.includes('imposto')) return 'fiscal_research';
  if (q.includes('documento') || q.includes('gdocs')) return 'gdocs_documentation';
  return 'comprehensive_research';
}