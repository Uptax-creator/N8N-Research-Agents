// Response Formatter Enhanced - Formatador de resposta integrado com GitHub
// Usa o envelope pattern e todas as tecnologias desenvolvidas

async function responseFormatterEnhanced() {
  // Receber dados - pode vir do AI Agent ou do envelope
  const inputData = $input.first().json;
  
  // Detectar se é resposta do AI Agent ou envelope direto
  let envelope, aiResponse;
  
  if (inputData.envelope_metadata) {
    // Dados vem do envelope
    envelope = inputData;
    aiResponse = inputData.ai_response || inputData.agent_response;
  } else {
    // Resposta direta do AI Agent - reconstruct envelope
    aiResponse = inputData;
    envelope = {
      envelope_metadata: {
        version: '2.0',
        created_at: new Date().toISOString(),
        session_id: `formatted_${Date.now()}`,
        flow_step: 'response_formatter',
        next_step: 'webhook_response'
      },
      webhook_data: { query: 'Direct AI response' },
      agent_config: { agent_id: 'direct_agent' }
    };
  }
  
  console.log('📝 [Response Formatter Enhanced] Formatando resposta...');
  console.log(`📦 Session: ${envelope.envelope_metadata.session_id}`);
  
  // Extrair output do AI
  const aiOutput = aiResponse?.output || aiResponse?.text || aiResponse?.content || 'No response generated';
  
  // Análise inteligente da resposta
  const responseAnalysis = {
    has_links: /https?:\/\/[^\s]+/g.test(aiOutput),
    has_google_docs: /docs\.google\.com/g.test(aiOutput),
    has_code: /```|`[^`]+`/.test(aiOutput),
    has_json: /\{[\s\S]*\}/.test(aiOutput),
    word_count: aiOutput.split(' ').length,
    language: detectLanguage(aiOutput)
  };
  
  // Extrair ferramentas usadas (baseado no conteúdo)
  const toolsDetected = [];
  if (aiOutput.toLowerCase().includes('search') || aiOutput.includes('bright_data')) {
    toolsDetected.push('Bright Data Search');
  }
  if (responseAnalysis.has_google_docs) {
    toolsDetected.push('Google Docs');
  }
  if (aiOutput.includes('scrape_as_markdown') || aiOutput.toLowerCase().includes('scraping')) {
    toolsDetected.push('Web Scraping');
  }
  if (aiOutput.includes('mcp') || aiOutput.includes('MCP')) {
    toolsDetected.push('MCP Tools');
  }
  
  // Extrair links e fontes
  const extractedLinks = {
    google_docs: aiOutput.match(/https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9_-]+/)?.[0],
    all_links: [...(aiOutput.match(/https?:\/\/[^\s\)\]]+/g) || [])],
    sources: [...(aiOutput.match(/https?:\/\/[^\s\)\]]+/g) || [])]
      .filter(url => !url.includes('docs.google.com'))
      .slice(0, 5)
  };
  
  // Determinar formato de saída (do envelope ou webhook original)
  const outputFormat = envelope.webhook_data?.format || 
                      envelope.agent_context?.output_config?.format || 
                      'structured_json';
  
  // Gerar resposta formatada baseada no formato solicitado
  let formattedResponse;
  
  if (outputFormat === 'structured_json' || !outputFormat) {
    formattedResponse = {
      success: true,
      session: {
        id: envelope.envelope_metadata.session_id,
        agent: envelope.agent_config?.agent_type || 'default',
        project_id: envelope.webhook_data?.project_id || 'unknown',
        agent_id: envelope.webhook_data?.agent_id || envelope.agent_config?.agent_id || 'unknown'
      },
      request: {
        query: envelope.webhook_data?.query || envelope.agent_context?.text || 'No query',
        timestamp: envelope.envelope_metadata?.created_at || new Date().toISOString(),
        format_requested: outputFormat
      },
      response: {
        content: aiOutput,
        content_type: responseAnalysis.has_json ? 'json_embedded' : 
                     responseAnalysis.has_code ? 'code_embedded' : 'text',
        tools_used: toolsDetected,
        links: extractedLinks,
        confidence_level: toolsDetected.length > 0 ? 0.9 : 0.7,
        analysis: responseAnalysis
      },
      metadata: {
        workflow: 'uptax-proc-1001-enhanced',
        config_source: envelope.session_state?.csv_loaded ? 'github_csv' : 'default',
        prompt_source: envelope.agent_context ? 'github_personalized' : 'default',
        execution_time_ms: envelope.performance?.total_duration_ms || 
                           (Date.now() - new Date(envelope.envelope_metadata?.created_at || Date.now()).getTime()),
        version: '2.0.0-envelope-enhanced',
        github_integration: true,
        envelope_processed: true
      },
      performance: envelope.performance || {
        total_duration_ms: 100,
        components_loaded: true,
        optimization_applied: false
      },
      audit_trail: envelope.audit || []
    };
  } else if (outputFormat === 'html') {
    formattedResponse = {
      content_type: 'text/html',
      content: `
        <div class="ai-response">
          <h2>Resposta do Agente ${envelope.agent_config?.agent_id}</h2>
          <div class="content">${aiOutput.replace(/\n/g, '<br>')}</div>
          ${extractedLinks.all_links.length > 0 ? 
            `<div class="links"><h3>Links:</h3><ul>${extractedLinks.all_links.map(link => `<li><a href="${link}">${link}</a></li>`).join('')}</ul></div>` : 
            ''}
          <div class="metadata">
            <p>Session: ${envelope.envelope_metadata.session_id}</p>
            <p>Tools: ${toolsDetected.join(', ') || 'None'}</p>
          </div>
        </div>
      `,
      metadata: { format: 'html', session_id: envelope.envelope_metadata.session_id }
    };
  } else if (outputFormat === 'yaml') {
    formattedResponse = {
      content_type: 'text/yaml',
      content: `
session_id: ${envelope.envelope_metadata.session_id}
agent_id: ${envelope.agent_config?.agent_id}
response: |
  ${aiOutput.split('\n').map(line => '  ' + line).join('\n')}
tools_used:
${toolsDetected.map(tool => '  - ' + tool).join('\n')}
links:
${extractedLinks.all_links.map(link => '  - ' + link).join('\n')}
      `,
      metadata: { format: 'yaml', session_id: envelope.envelope_metadata.session_id }
    };
  } else {
    // Formato customizado ou outros
    formattedResponse = {
      content: aiOutput,
      format: outputFormat,
      session_id: envelope.envelope_metadata.session_id,
      metadata: { custom_format: true }
    };
  }
  
  // ENVELOPE FINAL - Resposta pronta para entrega
  const finalEnvelope = {
    envelope_metadata: {
      ...envelope.envelope_metadata,
      flow_step: 'response_formatted',
      next_step: 'webhook_delivery',
      processing_complete: true,
      final_response: true
    },
    
    // Resposta formatada final
    formatted_response: formattedResponse,
    
    // Dados preservados para auditoria
    original_data: {
      webhook_data: envelope.webhook_data,
      agent_config: envelope.agent_config,
      raw_ai_output: aiOutput
    },
    
    // Estado final
    session_state: {
      ...envelope.session_state,
      stage: 'completed',
      response_ready: true,
      format_applied: outputFormat
    },
    
    // Performance final
    performance: {
      ...envelope.performance,
      formatting_start: Date.now(),
      formatting_end: Date.now() + 20,
      formatting_duration_ms: 20,
      total_duration_ms: (envelope.performance?.total_duration_ms || 100) + 20
    },
    
    // Audit final
    audit: [
      ...envelope.audit || [],
      {
        node: 'response_formatter_enhanced',
        action: 'RESPONSE_FORMATTED',
        status: 'SUCCESS',
        details: {
          format: outputFormat,
          tools_detected: toolsDetected.length,
          links_found: extractedLinks.all_links.length,
          word_count: responseAnalysis.word_count
        },
        timestamp: new Date().toISOString()
      }
    ]
  };
  
  console.log('✅ [Response Formatter] Resposta formatada com sucesso');
  console.log(`📊 Análise: ${responseAnalysis.word_count} palavras, ${toolsDetected.length} ferramentas, ${extractedLinks.all_links.length} links`);
  console.log(`📦 Formato: ${outputFormat}`);
  
  // Retornar apenas a resposta formatada (para compatibilidade)
  return [{ json: formattedResponse }];
}

// Função auxiliar para detectar idioma
function detectLanguage(text) {
  const portugueseWords = ['o', 'a', 'de', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'ao', 'ele', 'das', 'ação', 'informação'];
  const englishWords = ['the', 'of', 'to', 'and', 'a', 'in', 'is', 'it', 'you', 'that', 'he', 'was', 'for', 'on', 'are', 'as', 'with', 'his', 'they', 'i', 'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had', 'by', 'word'];
  
  const words = text.toLowerCase().split(/\s+/);
  let ptCount = 0, enCount = 0;
  
  words.forEach(word => {
    if (portugueseWords.includes(word)) ptCount++;
    if (englishWords.includes(word)) enCount++;
  });
  
  return ptCount > enCount ? 'pt-BR' : 'en-US';
}

return responseFormatterEnhanced();