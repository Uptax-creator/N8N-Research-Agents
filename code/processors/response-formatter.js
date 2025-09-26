/**
 * Response Formatter - GitHub-hosted processor
 * URL: https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/code/processors/response-formatter.js
 */

function execute(aiResponse, sessionContext) {
  console.log('=Ý Response Formatter - Starting...');
  console.log('<¯ Agent ID:', sessionContext.agent_id);

  // Extract AI output
  const aiOutput = aiResponse?.output || aiResponse?.text || aiResponse?.content || 'No response generated';

  // Detect tools used (parsing from AI response)
  const toolsUsed = [];
  if (aiOutput.toLowerCase().includes('search') || aiOutput.includes('bright_data')) {
    toolsUsed.push('Bright Data Search');
  }
  if (aiOutput.includes('GOOGLEDOCS') || aiOutput.includes('docs.google.com')) {
    toolsUsed.push('Google Docs');
  }
  if (aiOutput.includes('scrape_as_markdown') || aiOutput.toLowerCase().includes('scraping')) {
    toolsUsed.push('Web Scraping');
  }

  // Extract links from response
  const links = {
    google_docs: aiOutput.match(/https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9_-]+/)?.[0],
    sources: [...(aiOutput.match(/https?:\/\/[^\s\)]+/g) || [])]
      .filter(url => !url.includes('docs.google.com'))
      .slice(0, 5)
  };

  // Apply output format from prompt data
  const outputFormat = sessionContext.prompt_data?.output_requirements?.format || 'structured_json';

  let formattedResponse;

  if (outputFormat === 'structured_json') {
    formattedResponse = {
      success: true,
      session: {
        id: sessionContext.session_id,
        agent: sessionContext.agent_config?.agent_type || 'unknown',
        project_id: sessionContext.project_id,
        agent_id: sessionContext.agent_id
      },
      request: {
        query: sessionContext.original_input?.query || 'No query',
        timestamp: sessionContext.timestamp
      },
      response: {
        content: aiOutput,
        tools_used: toolsUsed,
        links: links,
        confidence_level: toolsUsed.length > 0 ? 0.9 : 0.7
      },
      metadata: {
        workflow: 'uptax-proc-1001-dynamic',
        config_source: sessionContext.config_source,
        prompt_source: sessionContext.prompt_source,
        execution_time_ms: Date.now() - parseInt(sessionContext.session_id.split('_')[2]),
        version: '1.0.0-variables'
      }
    };
  } else {
    // Other formats (html, yaml, etc.) can be handled here
    formattedResponse = {
      content: aiOutput,
      format: outputFormat,
      metadata: {
        session_id: sessionContext.session_id,
        agent_id: sessionContext.agent_id
      }
    };
  }

  console.log(' Response formatted successfully');
  console.log('=' Tools detected:', toolsUsed.length);
  if (links.google_docs) {
    console.log('=Ä Document created:', links.google_docs);
  }

  return [{ json: formattedResponse }];
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { execute };
}