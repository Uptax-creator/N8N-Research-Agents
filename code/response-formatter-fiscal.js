// Fiscal Research Response Formatter - Brazilian Tax Law
// Based on working Business Plan Agent structure

const aiResponse = $('Enhanced AI Agent').item.json;
const processorData = $('Graph Processor').item.json;

const result = {
  success: true,
  agent: 'fiscal_research',
  name: 'Especialista Fiscal Brasileiro',
  version: '1.0.0',
  project_id: processorData.agent_config?.project_id || 'unknown',
  agent_id: processorData.agent_config?.agent_id || 'unknown',
  description: 'Pesquisa e análise de legislação fiscal brasileira',
  query: processorData.text || 'No query',
  result: aiResponse?.output || aiResponse?.text || 'Resposta fiscal processada',
  metadata: {
    session_id: processorData.session_id,
    timestamp: new Date().toISOString(),
    workflow: 'uptax-proc-1001-dynamic',
    mode: 'fiscal-research',
    specialty: 'brazilian-tax-law'
  }
};

return [{ json: result }];