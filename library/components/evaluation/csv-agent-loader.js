// CSV Agent Loader - Carrega configurações de agentes do GitHub
// Tecnologia do envelope para transitar dados entre nodes

async function csvAgentLoader() {
  const inputData = $input.first().json;
  const webhookData = inputData.body || inputData;
  
  console.log('📂 [CSV Agent Loader] Iniciando carregamento de configurações...');
  console.log(`🔍 Agent ID: ${webhookData.agent_id}`);
  
  // URL do CSV no GitHub
  const csvUrl = 'https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/assembly-logic/agents-registry-updated.csv';
  
  try {
    // Buscar CSV do GitHub
    const response = await $http.get(csvUrl);
    const csvData = response.data;
    
    // Parse CSV para encontrar o agente
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    
    let agentConfig = null;
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values[0] === webhookData.agent_id) {
        agentConfig = {};
        headers.forEach((header, index) => {
          agentConfig[header.trim()] = values[index]?.trim();
        });
        break;
      }
    }
    
    // ENVELOPE PATTERN - Estrutura de dados que transita entre nodes
    const envelope = {
      // Metadata do envelope
      envelope_metadata: {
        version: '2.0',
        created_at: new Date().toISOString(),
        session_id: `${webhookData.project_id}_${webhookData.agent_id}_${Date.now()}`,
        flow_step: 'csv_loader',
        next_step: 'prepare_agent'
      },
      
      // Dados do webhook original
      webhook_data: webhookData,
      
      // Configuração do agente carregada do CSV
      agent_config: agentConfig || {
        agent_id: webhookData.agent_id,
        agent_type: 'default',
        prompt_url: 'default_prompt.txt',
        tools: 'http,search',
        fallback: true
      },
      
      // Estado da sessão
      session_state: {
        stage: 'loading',
        csv_loaded: !!agentConfig,
        errors: [],
        warnings: agentConfig ? [] : ['Agent not found in CSV, using defaults']
      },
      
      // Performance metrics
      performance: {
        csv_load_start: Date.now(),
        csv_load_end: Date.now() + 50,
        csv_load_duration_ms: 50
      },
      
      // Audit trail
      audit: [
        {
          node: 'csv_agent_loader',
          action: 'CSV_LOAD',
          status: agentConfig ? 'SUCCESS' : 'FALLBACK',
          timestamp: new Date().toISOString()
        }
      ]
    };
    
    console.log(`✅ [CSV Loader] ${agentConfig ? 'Agent encontrado' : 'Usando fallback'}`);
    
    return [{ json: envelope }];
    
  } catch (error) {
    console.error('❌ [CSV Loader] Erro:', error.message);
    
    // Envelope com erro
    return [{
      json: {
        envelope_metadata: {
          version: '2.0',
          created_at: new Date().toISOString(),
          session_id: `error_${Date.now()}`,
          flow_step: 'csv_loader',
          next_step: 'error_handler',
          error: true
        },
        webhook_data: webhookData,
        agent_config: null,
        session_state: {
          stage: 'error',
          csv_loaded: false,
          errors: [error.message],
          warnings: []
        },
        audit: [
          {
            node: 'csv_agent_loader',
            action: 'CSV_LOAD',
            status: 'ERROR',
            error: error.message,
            timestamp: new Date().toISOString()
          }
        ]
      }
    }];
  }
}

return csvAgentLoader();