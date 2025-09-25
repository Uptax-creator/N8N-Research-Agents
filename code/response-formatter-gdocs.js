// Google Docs Documentation Response Formatter - Brazilian Compliance
// Based on working Business Plan Agent structure

const aiResponse = $('Enhanced AI Agent').item.json;
const processorData = $('Graph Processor').item.json;

const result = {
  success: true,
  agent: 'gdocs_documentation',
  name: 'Especialista em Documentação Google Docs',
  version: '1.0.0',
  project_id: processorData.agent_config?.project_id || 'unknown',
  agent_id: processorData.agent_config?.agent_id || 'unknown',
  description: 'Criação de documentação de compliance no Google Docs',
  query: processorData.text || 'No query',
  result: aiResponse?.output || aiResponse?.text || 'Documento criado/processado',
  metadata: {
    session_id: processorData.session_id,
    timestamp: new Date().toISOString(),
    workflow: 'uptax-proc-1001-dynamic',
    mode: 'gdocs-documentation',
    specialty: 'brazilian-compliance-docs'
  }
};

return [{ json: result }];