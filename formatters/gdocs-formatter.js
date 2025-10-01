// Google Docs Documentation Formatter - GitHub Code
// Este código será buscado dinamicamente do GitHub pelo Response Formatter

function formatResponse(inputData, envelope, aiOutput) {
  console.log('📄 [GitHub Formatter] Google Docs Documentation - Iniciando');

  const agentConfig = envelope.agent_config;
  const promptMetadata = envelope.prompt_metadata;
  const researchType = envelope.agent_context?.research_type || 'gdocs_documentation';

  // Análise específica para documentação
  const docsAnalysis = {
    has_document_created: /document.*created|documento.*criado|docs\.google\.com/i.test(aiOutput),
    has_structured_content: /^#+\s|^##\s|^###\s/gm.test(aiOutput),
    has_procedures: /procedimento|passo|etapa|processo/i.test(aiOutput),
    has_responsibilities: /responsável|responsabilidade|atribuição/i.test(aiOutput),
    has_compliance_elements: /compliance|conformidade|auditoria|controle/i.test(aiOutput),
    document_links: extractDocumentLinks(aiOutput),
    content_quality: assessContentQuality(aiOutput),
    research_depth: aiOutput.length > 2000 ? 'comprehensive' : aiOutput.length > 1000 ? 'standard' : 'basic'
  };

  // Extração de elementos de documentação específicos
  const docsElements = {
    google_docs_links: extractGoogleDocsLinks(aiOutput),
    section_headers: extractSectionHeaders(aiOutput),
    action_items: extractActionItems(aiOutput),
    stakeholders: extractStakeholders(aiOutput),
    timelines: extractTimelines(aiOutput)
  };

  // Qualidade da documentação
  const qualityScore = calculateDocsQualityScore(docsAnalysis, docsElements);

  // Formato específico para gdocs documentation
  const formattedResponse = {
    success: true,
    formatter_source: 'github_gdocs_documentation',
    documentation_metadata: {
      type: researchType,
      depth: docsAnalysis.research_depth,
      quality_score: qualityScore,
      document_created: docsAnalysis.has_document_created,
      structure_score: docsAnalysis.content_quality,
      processing_time: envelope.performance?.total_duration_ms || 0
    },
    session: {
      id: envelope.envelope_metadata.session_id,
      agent: envelope.agent_config?.agent_name || 'gdocs_documentation',
      timestamp: new Date().toISOString()
    },
    request: {
      query: envelope.webhook_data?.query,
      research_type: researchType,
      format_requested: envelope.webhook_data?.format_requested
    },
    documentation_output: {
      content: aiOutput,
      analysis: docsAnalysis,
      elements: docsElements,
      document_structure: assessDocumentStructure(aiOutput)
    },
    actionable_documentation: {
      created_documents: docsElements.google_docs_links,
      implementation_steps: extractImplementationSteps(aiOutput),
      review_schedule: extractReviewSchedule(aiOutput),
      collaboration_setup: assessCollaborationSetup(docsAnalysis)
    },
    github_integration: {
      prompts_used: promptMetadata?.source === 'github_structured',
      formatter_code: 'gdocs-formatter.js',
      config_loaded: !!envelope.agent_config?.config_url,
      version: '2.2.0-github-gdocs'
    },
    quality_metrics: {
      document_completeness: qualityScore.completeness,
      structural_quality: qualityScore.structure,
      collaboration_readiness: qualityScore.collaboration,
      implementation_clarity: qualityScore.implementation
    }
  };

  console.log('✅ [GitHub Formatter] Google Docs Documentation - Concluído');
  console.log('📄 Documentation Quality Score:', qualityScore.overall);

  if (docsElements.google_docs_links.length > 0) {
    console.log('📝 Documents Created:', docsElements.google_docs_links.length);
  }

  return formattedResponse;
}

// Helper functions específicas para documentação
function extractDocumentLinks(text) {
  const links = [];
  const urlPattern = /https?:\/\/[^\s\)]+/g;
  const matches = text.match(urlPattern);

  if (matches) {
    links.push(...matches);
  }

  return links.slice(0, 10);
}

function extractGoogleDocsLinks(text) {
  const docsLinks = [];
  const docsPattern = /https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9_-]+/g;
  const matches = text.match(docsPattern);

  if (matches) {
    docsLinks.push(...matches);
  }

  return docsLinks;
}

function extractSectionHeaders(text) {
  const headers = [];
  const headerPattern = /^#+\s+(.+)$/gm;
  let match;

  while ((match = headerPattern.exec(text)) !== null) {
    headers.push(match[1]);
  }

  return headers.slice(0, 10);
}

function extractActionItems(text) {
  const actionItems = [];
  const patterns = [
    /action\s+item:?\s*([^\.]+)/gi,
    /to\s+do:?\s*([^\.]+)/gi,
    /próximo\s+passo:?\s*([^\.]+)/gi,
    /ação\s+necessária:?\s*([^\.]+)/gi
  ];

  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) actionItems.push(...matches);
  });

  return actionItems.slice(0, 5);
}

function extractStakeholders(text) {
  const stakeholders = [];
  const patterns = [
    /responsável:?\s*([^\.]+)/gi,
    /stakeholder:?\s*([^\.]+)/gi,
    /equipe:?\s*([^\.]+)/gi,
    /departamento:?\s*([^\.]+)/gi
  ];

  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) stakeholders.push(...matches);
  });

  return stakeholders.slice(0, 5);
}

function extractTimelines(text) {
  const timelines = [];
  const patterns = [
    /prazo:?\s*([^\.]+)/gi,
    /deadline:?\s*([^\.]+)/gi,
    /cronograma:?\s*([^\.]+)/gi,
    /\d{1,2}\/\d{1,2}\/\d{4}/g
  ];

  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) timelines.push(...matches);
  });

  return timelines.slice(0, 5);
}

function assessContentQuality(text) {
  let score = 0;

  // Estrutura
  if (/^#+\s/gm.test(text)) score += 25;
  if (/^[\*\-]\s/gm.test(text)) score += 15;
  if (/^\d+\.\s/gm.test(text)) score += 15;

  // Conteúdo
  if (text.length > 1000) score += 20;
  if (/procedimento|processo|passo/i.test(text)) score += 15;
  if (/responsável|deadline|prazo/i.test(text)) score += 10;

  return score;
}

function calculateDocsQualityScore(analysis, elements) {
  const completeness = (
    (analysis.has_document_created ? 25 : 0) +
    (analysis.has_structured_content ? 25 : 0) +
    (analysis.has_procedures ? 25 : 0) +
    (analysis.has_responsibilities ? 25 : 0)
  ) / 100;

  const structure = analysis.content_quality / 100;
  const collaboration = (analysis.has_compliance_elements ? 0.5 : 0) +
                       (elements.stakeholders.length > 0 ? 0.5 : 0);
  const implementation = (elements.action_items.length + elements.timelines.length) * 0.2;

  const overall = (completeness + structure + collaboration + implementation) / 4;

  return {
    overall: Math.round(overall * 100) / 100,
    completeness,
    structure,
    collaboration: Math.min(collaboration, 1),
    implementation: Math.min(implementation, 1)
  };
}

function assessDocumentStructure(text) {
  const hasTitle = /^#\s+[^#]/m.test(text);
  const hasSubSections = /^##\s+/gm.test(text);
  const hasLists = /^[\*\-]\s/gm.test(text);
  const hasNumbers = /^\d+\.\s/gm.test(text);

  return {
    has_title: hasTitle,
    has_subsections: hasSubSections,
    has_lists: hasLists,
    has_numbered_procedures: hasNumbers,
    structure_score: (hasTitle ? 1 : 0) + (hasSubSections ? 1 : 0) + (hasLists ? 1 : 0) + (hasNumbers ? 1 : 0)
  };
}

function extractImplementationSteps(text) {
  const steps = [];
  const patterns = [
    /passo\s+\d+:?\s*([^\.]+)/gi,
    /etapa\s+\d+:?\s*([^\.]+)/gi,
    /step\s+\d+:?\s*([^\.]+)/gi,
    /^\d+\.\s+([^\.]+)/gm
  ];

  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) steps.push(...matches);
  });

  return steps.slice(0, 10);
}

function extractReviewSchedule(text) {
  const schedule = [];
  const patterns = [
    /revisão\s+([^\.]+)/gi,
    /review\s+([^\.]+)/gi,
    /atualização\s+([^\.]+)/gi,
    /periodicidade\s+([^\.]+)/gi
  ];

  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) schedule.push(...matches);
  });

  return schedule.slice(0, 3);
}

function assessCollaborationSetup(analysis) {
  const setup = {
    document_sharing_configured: analysis.has_document_created,
    stakeholders_identified: analysis.has_responsibilities,
    review_process_defined: analysis.has_compliance_elements,
    collaborative_editing_ready: analysis.has_document_created
  };

  const readiness_score = Object.values(setup).filter(Boolean).length / Object.keys(setup).length;

  return {
    ...setup,
    readiness_score: Math.round(readiness_score * 100) / 100
  };
}

// Export para uso no N8N
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { formatResponse };
}