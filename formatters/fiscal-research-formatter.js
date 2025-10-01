// Fiscal Research Formatter - GitHub Code
// Este código será buscado dinamicamente do GitHub pelo Response Formatter

function formatResponse(inputData, envelope, aiOutput) {
  console.log('⚖️ [GitHub Formatter] Fiscal Research - Iniciando');

  const agentConfig = envelope.agent_config;
  const promptMetadata = envelope.prompt_metadata;
  const researchType = envelope.agent_context?.research_type || 'fiscal_research';

  // Análise específica para pesquisa fiscal
  const fiscalAnalysis = {
    has_legal_basis: /base legal|lei n|decreto|portaria|instrução normativa/i.test(aiOutput),
    has_regulatory_changes: /mudança|alteração|nova|revogação|vigência/i.test(aiOutput),
    has_compliance_requirements: /obrigação|compliance|prazo|cronograma/i.test(aiOutput),
    has_penalties: /multa|penalidade|infração|sanção/i.test(aiOutput),
    has_tax_implications: /imposto|tributação|alíquota|base de cálculo/i.test(aiOutput),
    confidence_indicators: (aiOutput.match(/receita federal|stf|stj|tribunal|oficial/gi) || []).length,
    research_depth: aiOutput.length > 2000 ? 'comprehensive' : aiOutput.length > 1000 ? 'standard' : 'basic'
  };

  // Extração de elementos fiscais específicos
  const fiscalElements = {
    legal_references: extractLegalReferences(aiOutput),
    tax_rates: extractTaxRates(aiOutput),
    deadlines: extractDeadlines(aiOutput),
    obligations: extractObligations(aiOutput),
    penalties: extractPenalties(aiOutput)
  };

  // Qualidade da análise fiscal
  const qualityScore = calculateFiscalQualityScore(fiscalAnalysis, fiscalElements);

  // Formato específico para fiscal research
  const formattedResponse = {
    success: true,
    formatter_source: 'github_fiscal_research',
    fiscal_metadata: {
      type: researchType,
      depth: fiscalAnalysis.research_depth,
      quality_score: qualityScore,
      confidence_level: calculateFiscalConfidence(fiscalAnalysis),
      legal_compliance_score: calculateComplianceScore(fiscalAnalysis),
      processing_time: envelope.performance?.total_duration_ms || 0
    },
    session: {
      id: envelope.envelope_metadata.session_id,
      agent: envelope.agent_config?.agent_name || 'fiscal_research',
      timestamp: new Date().toISOString()
    },
    request: {
      query: envelope.webhook_data?.query,
      research_type: researchType,
      format_requested: envelope.webhook_data?.format_requested
    },
    fiscal_output: {
      content: aiOutput,
      analysis: fiscalAnalysis,
      elements: fiscalElements,
      legal_structure: assessLegalStructure(aiOutput)
    },
    compliance_insights: {
      immediate_obligations: extractImmediateObligations(aiOutput),
      regulatory_recommendations: extractRegulatoryRecommendations(aiOutput),
      risk_assessment: assessFiscalRisks(aiOutput, fiscalAnalysis)
    },
    github_integration: {
      prompts_used: promptMetadata?.source === 'github_structured',
      formatter_code: 'fiscal-research-formatter.js',
      config_loaded: !!envelope.agent_config?.config_url,
      version: '2.2.0-github-fiscal'
    },
    quality_metrics: {
      legal_completeness: qualityScore.completeness,
      source_authority: qualityScore.authority,
      practical_value: qualityScore.practical,
      compliance_clarity: qualityScore.compliance
    }
  };

  console.log('✅ [GitHub Formatter] Fiscal Research - Concluído');
  console.log('⚖️ Legal Quality Score:', qualityScore.overall);

  return formattedResponse;
}

// Helper functions específicas para fiscal
function extractLegalReferences(text) {
  const references = [];
  const patterns = [
    /lei n[ºo]?\s*[\d\.]+\/\d{4}/gi,
    /decreto n[ºo]?\s*[\d\.]+\/\d{4}/gi,
    /portaria n[ºo]?\s*[\d\.]+\/\d{4}/gi,
    /instrução normativa n[ºo]?\s*[\d\.]+\/\d{4}/gi,
    /resolução n[ºo]?\s*[\d\.]+\/\d{4}/gi
  ];

  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) references.push(...matches);
  });

  return references.slice(0, 10);
}

function extractTaxRates(text) {
  const rates = [];
  const patterns = [
    /(\d+(?:,\d+)?%)/g,
    /alíquota\s+de\s+(\d+(?:,\d+)?%)/gi,
    /(\d+(?:,\d+)?)\s*por\s*cento/gi
  ];

  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) rates.push(...matches);
  });

  return rates.slice(0, 5);
}

function extractDeadlines(text) {
  const deadlines = [];
  const patterns = [
    /até\s+(\d{1,2}\/\d{1,2}\/\d{4})/gi,
    /prazo\s+de\s+(\d+\s+dias)/gi,
    /vencimento\s+em\s+(\d{1,2}\/\d{1,2}\/\d{4})/gi
  ];

  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) deadlines.push(...matches);
  });

  return deadlines.slice(0, 5);
}

function extractObligations(text) {
  const obligations = [];
  const patterns = [
    /obrigação\s+de\s+([^\.]+)/gi,
    /dever\s+de\s+([^\.]+)/gi,
    /necessário\s+([^\.]+)/gi
  ];

  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) obligations.push(...matches);
  });

  return obligations.slice(0, 5);
}

function extractPenalties(text) {
  const penalties = [];
  const patterns = [
    /multa\s+de\s+([^\.]+)/gi,
    /penalidade\s+de\s+([^\.]+)/gi,
    /sanção\s+de\s+([^\.]+)/gi
  ];

  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) penalties.push(...matches);
  });

  return penalties.slice(0, 3);
}

function calculateFiscalQualityScore(analysis, elements) {
  const completeness = (
    (analysis.has_legal_basis ? 30 : 0) +
    (analysis.has_regulatory_changes ? 20 : 0) +
    (analysis.has_compliance_requirements ? 25 : 0) +
    (analysis.has_tax_implications ? 25 : 0)
  ) / 100;

  const authority = Math.min(analysis.confidence_indicators * 0.15, 1);
  const practical = Object.values(elements).filter(e => e.length > 0).length * 0.2;
  const compliance = (elements.obligations.length + elements.deadlines.length) * 0.1;

  const overall = (completeness + authority + practical + compliance) / 4;

  return {
    overall: Math.round(overall * 100) / 100,
    completeness,
    authority,
    practical,
    compliance
  };
}

function calculateFiscalConfidence(analysis) {
  let confidence = 0.5; // base

  if (analysis.has_legal_basis) confidence += 0.3;
  if (analysis.confidence_indicators > 2) confidence += 0.2;
  if (analysis.has_compliance_requirements) confidence += 0.1;

  return Math.min(confidence, 1.0);
}

function calculateComplianceScore(analysis) {
  let score = 0;

  if (analysis.has_compliance_requirements) score += 30;
  if (analysis.has_penalties) score += 20;
  if (analysis.has_regulatory_changes) score += 25;
  if (analysis.has_tax_implications) score += 25;

  return score;
}

function assessLegalStructure(text) {
  const hasHeaders = /^#+\s/gm.test(text);
  const hasBullets = /^[\*\-]?\s/gm.test(text);
  const hasNumbers = /^\d+\.\s/gm.test(text);

  return {
    has_headings: hasHeaders,
    has_bullets: hasBullets,
    has_numbered_lists: hasNumbers,
    structure_score: (hasHeaders ? 1 : 0) + (hasBullets ? 1 : 0) + (hasNumbers ? 1 : 0)
  };
}

function extractImmediateObligations(text) {
  const obligations = [];
  const patterns = [
    /imediato\s+([^\.]+)/gi,
    /urgente\s+([^\.]+)/gi,
    /prazo\s+de\s+\d+\s+dias?\s+([^\.]+)/gi
  ];

  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) obligations.push(...matches);
  });

  return obligations.slice(0, 3);
}

function extractRegulatoryRecommendations(text) {
  const recommendations = [];
  const patterns = [
    /recomenda-se\s+([^\.]+)/gi,
    /sugere-se\s+([^\.]+)/gi,
    /orientação\s+([^\.]+)/gi
  ];

  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) recommendations.push(...matches);
  });

  return recommendations.slice(0, 3);
}

function assessFiscalRisks(text, analysis) {
  const risks = [];

  if (!analysis.has_compliance_requirements) {
    risks.push("Falta de clareza sobre obrigações de compliance");
  }

  if (!analysis.has_legal_basis) {
    risks.push("Base legal não identificada claramente");
  }

  if (analysis.has_penalties) {
    risks.push("Penalidades identificadas - atenção ao cumprimento");
  }

  return risks;
}

// Export para uso no N8N
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { formatResponse };
}