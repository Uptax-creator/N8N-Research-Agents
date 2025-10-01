// ✅ CSV LOADER AJUSTADO - FUNCIONA COM FRONTEND PARAMETRIZADO
const inputData = $input.first().json;
const webhookData = inputData.body || inputData;

console.log('📦 [CSV Loader] HYBRID - Iniciando');
console.log('🎯 Agent ID:', webhookData.agent_id);
console.log('🔍 Query:', webhookData.query);

// ✅ PRIORIDADE 1: SE FRONTEND ENVIOU AGENT_CONFIG, USAR DIRETO
if (webhookData.agent_config && Object.keys(webhookData.agent_config).length > 0) {
  console.log('✅ [CSV] Config recebido do frontend - usando direto');

  const envelope = {
    envelope_metadata: {
      version: '2.6-hybrid',
      created_at: new Date().toISOString(),
      session_id: 'frontend_' + Date.now(),
      flow_step: 'csv_bypassed'
    },
    webhook_data: {
      ...webhookData,
      research_type: detectResearchType(webhookData.query || ''),
      format_requested: webhookData.format || 'comprehensive_research'
    },
    agent_config: webhookData.agent_config,
    session_state: {
      stage: 'csv_loaded',
      csv_loaded: true,
      agent_found: true,
      csv_source: 'frontend_parametrized',
      agents_available: ['agent_001', 'agent_002', 'agent_003']
    }
  };

  console.log('✅ [CSV Loader] Frontend config usado:', webhookData.agent_config.agent_id);
  return [{ json: envelope }];
}

// ✅ PRIORIDADE 2: FALLBACK PARA CSV HARDCODED (se não vier do frontend)
console.log('⚠️ [CSV] Sem config do frontend - usando CSV hardcoded');

const csvData = `workflow_id,project_id,agent_id,agent_type,description,prompt_url,processor_url,response_formatter_url,mcp_endpoint,tools_config_url,status,version,created_by,updated_at
uptax-proc-1001-dynamic,project_001,agent_001,enhanced_research,Brazilian market research with Bright Data,https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/prompts/agents/agent_001_enhanced_research.json,https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/processors/enhanced-research-processor.js,https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/formatters/enhanced-research-formatter.js,https://mcp.brightdata.com/mcp?token=ecfc6404fb9eb026a9c802196b8d5caaf131d63c0931f9e888e57077e6b1f8cf,https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/tools-config/bright-data-tools.json,active,2.5,uptax-automation,2024-10-01T12:00:00Z
uptax-proc-1001-dynamic,project_001,agent_002,fiscal_research,Brazilian tax and fiscal legislation research,https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/prompts/agents/agent_002_fiscal_research.json,https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/processors/fiscal-research-processor.js,https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/formatters/fiscal-research-formatter.js,https://mcp.brightdata.com/mcp?token=ecfc6404fb9eb026a9c802196b8d5caaf131d63c0931f9e888e57077e6b1f8cf,https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/tools-config/bright-data-fiscal-tools.json,active,2.5,uptax-automation,2024-10-01T12:00:00Z
uptax-proc-1001-dynamic,project_001,agent_003,gdocs_documentation,Automated Google Docs creation and documentation,https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/prompts/agents/agent_003_gdocs_documentation.json,https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/processors/gdocs-processor.js,https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/formatters/gdocs-formatter.js,https://apollo.composio.dev/mcp,https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/tools-config/composio-gdocs-tools.json,active,2.5,uptax-automation,2024-10-01T12:00:00Z`;

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

      // Corrigir URL do MCP
      if (agentConfig.mcp_endpoint && agentConfig.mcp_endpoint.includes('/sse?')) {
        agentConfig.mcp_endpoint = agentConfig.mcp_endpoint.replace('/sse?', '/mcp?');
      }

      console.log('✅ [CSV] Agent encontrado no CSV:', agentConfig.agent_id);
      break;
    }
  }

  const envelope = {
    envelope_metadata: {
      version: '2.6-hybrid',
      created_at: new Date().toISOString(),
      session_id: 'csv_' + Date.now(),
      flow_step: 'csv_loader'
    },
    webhook_data: {
      ...webhookData,
      research_type: detectResearchType(webhookData.query || ''),
      format_requested: webhookData.format || 'comprehensive_research'
    },
    agent_config: agentConfig || {
      agent_id: webhookData.agent_id,
      agent_name: 'fallback_agent',
      fallback: true
    },
    session_state: {
      stage: 'csv_loaded',
      csv_loaded: !!agentConfig,
      agent_found: !!agentConfig,
      csv_source: 'hardcoded_fallback'
    }
  };

  console.log('✅ [CSV Loader] Hybrid - Agente:', agentConfig ? agentConfig.agent_id : 'fallback');
  return [{ json: envelope }];

} catch (error) {
  console.error('❌ [CSV Loader] ERRO:', error.message);
  return [{
    json: {
      envelope_metadata: {
        version: '2.6-hybrid',
        session_id: 'error_' + Date.now(),
        error: true
      },
      webhook_data: webhookData,
      session_state: {
        stage: 'error',
        csv_loaded: false,
        errors: [error.message]
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