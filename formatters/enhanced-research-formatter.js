// Enhanced Research Formatter - GitHub Code
// Este código será buscado dinamicamente do GitHub pelo Response Formatter

function formatResponse(inputData, envelope, aiOutput) {
  console.log('🎨 [GitHub Formatter] Enhanced Research - Iniciando');

  const agentConfig = envelope.agent_config;
  const promptMetadata = envelope.prompt_metadata;
  const researchType = envelope.agent_context?.research_type || 'comprehensive_research';

  // Análise avançada específica para research
  const researchAnalysis = {
    has_executive_summary: /## Executive Summary|# Sumário Executivo/i.test(aiOutput),
    has_methodology: /metodologia|methodology/i.test(aiOutput),
    has_recommendations: /recomendações|recommendations/i.test(aiOutput),
    has_sources: /fontes|sources|referências/i.test(aiOutput),
    has_data_points: /\d+%|\d+,\d+|\$\d+|R\$\s*\d+/g.test(aiOutput),
    confidence_indicators: (aiOutput.match(/confiança|confidence|certeza/gi) || []).length,
    research_depth: aiOutput.length > 2000 ? 'comprehensive' : aiOutput.length > 1000 ? 'standard' : 'basic'
  };

  // Extração de insights específicos para research
  const researchInsights = {
    key_findings: extractKeyFindings(aiOutput),
    market_data: extractMarketData(aiOutput),
    competitors: extractCompetitors(aiOutput),
    opportunities: extractOpportunities(aiOutput),
    risks: extractRisks(aiOutput)
  };

  // Qualidade da pesquisa
  const qualityScore = calculateQualityScore(researchAnalysis, researchInsights);

  // Formato específico para enhanced research
  const formattedResponse = {
    success: true,
    formatter_source: 'github_enhanced_research',
    research_metadata: {
      type: researchType,
      depth: researchAnalysis.research_depth,
      quality_score: qualityScore,
      confidence_level: calculateConfidence(researchAnalysis),
      processing_time: envelope.performance?.total_duration_ms || 0
    },
    session: {
      id: envelope.envelope_metadata.session_id,
      agent: envelope.agent_config?.agent_name || 'enhanced_research',
      timestamp: new Date().toISOString()
    },
    request: {
      query: envelope.webhook_data?.query,
      research_type: researchType,
      format_requested: envelope.webhook_data?.format_requested
    },
    research_output: {
      content: aiOutput,
      analysis: researchAnalysis,
      insights: researchInsights,
      structure_quality: assessStructure(aiOutput)
    },
    actionable_insights: {
      immediate_actions: extractImmediateActions(aiOutput),
      strategic_recommendations: extractStrategicRecommendations(aiOutput),
      follow_up_research: suggestFollowUpResearch(aiOutput, researchType)
    },
    github_integration: {
      prompts_used: promptMetadata?.source === 'github_structured',
      formatter_code: 'enhanced-research-formatter.js',
      config_loaded: !!envelope.agent_config?.config_url,
      version: '2.2.0-github-enhanced'
    },
    quality_metrics: {
      research_completeness: qualityScore.completeness,
      source_credibility: qualityScore.credibility,
      insight_value: qualityScore.insights,
      actionability: qualityScore.actionable
    }
  };

  console.log('✅ [GitHub Formatter] Enhanced Research - Concluído');
  console.log('📊 Quality Score:', qualityScore.overall);

  return formattedResponse;
}

// Helper functions
function extractKeyFindings(text) {
  const findings = [];
  const patterns = [
    /principais descobertas?:?\s*([^\.]+)/gi,
    /key findings?:?\s*([^\.]+)/gi,
    /descobrimos que\s*([^\.]+)/gi
  ];

  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) findings.push(...matches);
  });

  return findings.slice(0, 5);
}

function extractMarketData(text) {
  const data = [];
  const patterns = [
    /(\d+(?:,\d+)?%)/g,
    /(R\$\s*\d+(?:,\d+)*(?:\.\d+)?(?:\s*(?:milhão|bilhão|mil))?)/g,
    /(\d+(?:,\d+)*\s*(?:empresas|usuários|clientes))/g
  ];

  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) data.push(...matches);
  });

  return data.slice(0, 10);
}

function extractCompetitors(text) {
  const competitors = [];
  const patterns = [
    /concorrentes?:?\s*([^\.]+)/gi,
    /competitors?:?\s*([^\.]+)/gi,
    /principais players?:?\s*([^\.]+)/gi
  ];

  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) competitors.push(...matches);
  });

  return competitors.slice(0, 5);
}

function extractOpportunities(text) {
  const opportunities = [];
  const patterns = [
    /oportunidades?:?\s*([^\.]+)/gi,
    /opportunities?:?\s*([^\.]+)/gi,
    /potencial para\s*([^\.]+)/gi
  ];

  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) opportunities.push(...matches);
  });

  return opportunities.slice(0, 5);
}

function extractRisks(text) {
  const risks = [];
  const patterns = [
    /riscos?:?\s*([^\.]+)/gi,
    /risks?:?\s*([^\.]+)/gi,
    /desafios?:?\s*([^\.]+)/gi,
    /challenges?:?\s*([^\.]+)/gi
  ];

  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) risks.push(...matches);
  });

  return risks.slice(0, 5);
}

function calculateQualityScore(analysis, insights) {
  const completeness = (
    (analysis.has_executive_summary ? 25 : 0) +
    (analysis.has_methodology ? 20 : 0) +
    (analysis.has_recommendations ? 25 : 0) +
    (analysis.has_sources ? 20 : 0) +
    (analysis.has_data_points ? 10 : 0)
  ) / 100;

  const credibility = Math.min(analysis.confidence_indicators * 0.1, 1);
  const insightValue = Object.values(insights).filter(i => i.length > 0).length * 0.2;
  const actionable = (insights.key_findings.length + insights.opportunities.length) * 0.1;

  const overall = (completeness + credibility + insightValue + actionable) / 4;

  return {
    overall: Math.round(overall * 100) / 100,
    completeness,
    credibility,
    insights: insightValue,
    actionable
  };
}

function calculateConfidence(analysis) {
  let confidence = 0.5; // base

  if (analysis.has_sources) confidence += 0.2;
  if (analysis.has_data_points) confidence += 0.2;
  if (analysis.has_methodology) confidence += 0.1;

  return Math.min(confidence, 1.0);
}

function assessStructure(text) {
  const hasHeadings = /^#+\s/gm.test(text);
  const hasBullets = /^[\*\-]\s/gm.test(text);
  const hasNumbers = /^\d+\.\s/gm.test(text);

  return {
    has_headings: hasHeadings,
    has_bullets: hasBullets,
    has_numbered_lists: hasNumbers,
    structure_score: (hasHeadings ? 1 : 0) + (hasBullets ? 1 : 0) + (hasNumbers ? 1 : 0)
  };
}

function extractImmediateActions(text) {
  const actions = [];
  const patterns = [
    /ações imediatas?:?\s*([^\.]+)/gi,
    /immediate actions?:?\s*([^\.]+)/gi,
    /próximos passos?:?\s*([^\.]+)/gi
  ];

  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) actions.push(...matches);
  });

  return actions.slice(0, 3);
}

function extractStrategicRecommendations(text) {
  const recommendations = [];
  const patterns = [
    /recomendações? estratégicas?:?\s*([^\.]+)/gi,
    /strategic recommendations?:?\s*([^\.]+)/gi,
    /recomendamos que\s*([^\.]+)/gi
  ];

  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) recommendations.push(...matches);
  });

  return recommendations.slice(0, 3);
}

function suggestFollowUpResearch(text, researchType) {
  const suggestions = [];

  // Base suggestions by research type
  switch(researchType) {
    case 'market_research':
      suggestions.push('Análise de segmentação de mercado');
      suggestions.push('Pesquisa de pricing competitivo');
      break;
    case 'technical_analysis':
      suggestions.push('Análise de arquitetura detalhada');
      suggestions.push('Estudo de performance e escalabilidade');
      break;
    case 'comparative_analysis':
      suggestions.push('Análise de ROI comparativo');
      suggestions.push('Estudo de casos de implementação');
      break;
    default:
      suggestions.push('Pesquisa de validação com stakeholders');
      suggestions.push('Análise de viabilidade técnica');
  }

  return suggestions;
}

// Export para uso no N8N
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { formatResponse };
}