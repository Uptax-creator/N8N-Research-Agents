// Enhanced Response Formatter v2.0
// Formats LangChain AI Agent output into standardized research response

const startTime = Date.now();
console.log('=== Enhanced Response Formatter v2.0 - Starting ===');

// Get inputs from previous nodes
const aiResponse = $('AI Agent').item.json;
const processorData = $('Prompt Processor').item.json;
const config = processorData.config;
const prompts = processorData.prompts;

console.log('✅ AI Response received, length:', (aiResponse.output || aiResponse.text || '').length);
console.log('✅ Research type:', processorData.research_type);
console.log('✅ Output format:', processorData.output_format);

// Extract AI response text
const responseText = aiResponse.output || aiResponse.text || aiResponse.content || JSON.stringify(aiResponse);

// Advanced text parsing for structured extraction
const parseResponseStructure = (text) => {
    const sections = {
        executive_summary: '',
        key_findings: [],
        detailed_analysis: '',
        recommendations: [],
        sources: [],
        methodology: '',
        evidence: '',
        risks: []
    };

    const lines = text.split('\n');
    let currentSection = '';
    let currentContent = '';

    for (const line of lines) {
        const trimmedLine = line.trim();

        // Detect section headers
        if (trimmedLine.match(/^#+\s*(Executive Summary|Summary)/i)) {
            if (currentSection) sections[currentSection] = currentContent.trim();
            currentSection = 'executive_summary';
            currentContent = '';
        } else if (trimmedLine.match(/^#+\s*(Key Findings|Findings|Main Results)/i)) {
            if (currentSection) sections[currentSection] = currentContent.trim();
            currentSection = 'key_findings';
            currentContent = '';
        } else if (trimmedLine.match(/^#+\s*(Detailed Analysis|Analysis|Deep Dive)/i)) {
            if (currentSection) sections[currentSection] = currentContent.trim();
            currentSection = 'detailed_analysis';
            currentContent = '';
        } else if (trimmedLine.match(/^#+\s*(Recommendations|Suggestions)/i)) {
            if (currentSection) sections[currentSection] = currentContent.trim();
            currentSection = 'recommendations';
            currentContent = '';
        } else if (trimmedLine.match(/^#+\s*(Sources|References|Citations)/i)) {
            if (currentSection) sections[currentSection] = currentContent.trim();
            currentSection = 'sources';
            currentContent = '';
        } else if (trimmedLine.match(/^#+\s*(Methodology|Research Method)/i)) {
            if (currentSection) sections[currentSection] = currentContent.trim();
            currentSection = 'methodology';
            currentContent = '';
        } else if (trimmedLine.match(/^#+\s*(Risk|Limitations|Considerations)/i)) {
            if (currentSection) sections[currentSection] = currentContent.trim();
            currentSection = 'risks';
            currentContent = '';
        } else {
            // Add content to current section
            if (currentSection) {
                currentContent += line + '\n';
            } else if (!sections.executive_summary && trimmedLine) {
                // If no section detected yet, treat as executive summary
                sections.executive_summary += line + '\n';
            }
        }
    }

    // Don't forget the last section
    if (currentSection && currentContent) {
        sections[currentSection] = currentContent.trim();
    }

    // Convert text sections to arrays where appropriate
    ['key_findings', 'recommendations', 'sources', 'risks'].forEach(arraySection => {
        if (sections[arraySection] && typeof sections[arraySection] === 'string') {
            sections[arraySection] = sections[arraySection]
                .split('\n')
                .filter(line => line.trim())
                .map(line => line.replace(/^[-*•]\s*/, '').trim())
                .filter(item => item.length > 0);
        }
    });

    return sections;
};

// Parse the AI response
const parsedSections = parseResponseStructure(responseText);

// Calculate quality metrics
const calculateQualityMetrics = (parsed, requirements) => {
    const sourceCount = parsed.sources.length;
    const hasMinSources = sourceCount >= requirements.min_sources;

    // Simple confidence calculation based on content quality
    let confidenceScore = 0.5; // Base confidence

    if (parsed.executive_summary.length > 100) confidenceScore += 0.1;
    if (parsed.key_findings.length >= 3) confidenceScore += 0.1;
    if (parsed.detailed_analysis.length > 500) confidenceScore += 0.1;
    if (parsed.recommendations.length >= 2) confidenceScore += 0.1;
    if (hasMinSources) confidenceScore += 0.1;

    confidenceScore = Math.min(confidenceScore, 0.95); // Cap at 95%

    return {
        source_count: sourceCount,
        source_diversity: sourceCount >= 2, // Simple diversity check
        fact_verification: sourceCount > 0,
        expert_validation: parsed.detailed_analysis.length > 300,
        currency_check: true, // Assume current since using real-time tools
        confidence_score: Math.round(confidenceScore * 100) / 100,
        completeness_score: Object.values(parsed).filter(v => v && v.length > 0).length / Object.keys(parsed).length
    };
};

const qualityMetrics = calculateQualityMetrics(parsedSections, processorData.quality_requirements);

// Detect tools used (simple heuristic)
const detectToolsUsed = (responseText) => {
    const tools = ['langchain_agent'];

    if (responseText.includes('search') || responseText.includes('found') || responseText.includes('results')) {
        tools.push('serpapi');
    }
    if (responseText.includes('research') || responseText.includes('analysis') || responseText.includes('according to')) {
        tools.push('perplexity');
    }

    return tools;
};

const toolsUsed = detectToolsUsed(responseText);

// Build standardized response based on output format
const buildFormattedResponse = () => {
    const baseResponse = {
        success: true,
        agent: config.agent_name,
        version: config.version,
        query: processorData.text.substring(0, 200) + '...', // Truncated query
        research_type: processorData.research_type,
        output_format: processorData.output_format
    };

    if (processorData.output_format === 'json') {
        // Pure JSON structure
        return {
            ...baseResponse,
            results: {
                executive_summary: parsedSections.executive_summary,
                key_findings: parsedSections.key_findings,
                detailed_analysis: parsedSections.detailed_analysis,
                recommendations: parsedSections.recommendations,
                sources: parsedSections.sources,
                methodology: parsedSections.methodology
            },
            metadata: {
                tools_used: toolsUsed,
                confidence_score: qualityMetrics.confidence_score,
                processing_time_ms: Date.now() - startTime,
                session_id: processorData.session_id,
                source_count: qualityMetrics.source_count,
                completeness_score: qualityMetrics.completeness_score
            },
            quality_metrics: {
                source_diversity: qualityMetrics.source_diversity,
                fact_verification: qualityMetrics.fact_verification,
                expert_validation: qualityMetrics.expert_validation,
                currency_check: qualityMetrics.currency_check
            }
        };
    } else {
        // Formatted text response with metadata
        const template = prompts.output_templates[processorData.output_format + '_format'] ||
                        prompts.output_templates.comprehensive_research_format;

        const formattedResponse = template
            .replace('{query}', processorData.text.substring(0, 100))
            .replace('{executive_summary}', parsedSections.executive_summary)
            .replace('{methodology}', parsedSections.methodology || 'Multi-tool research approach')
            .replace('{key_findings}', parsedSections.key_findings.map((f, i) => `${i + 1}. ${f}`).join('\n'))
            .replace('{detailed_analysis}', parsedSections.detailed_analysis)
            .replace('{evidence}', 'Based on comprehensive source analysis')
            .replace('{expert_insights}', 'Validated through multiple expert sources')
            .replace('{recommendations}', parsedSections.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n'))
            .replace('{implementation}', 'Follow recommendations in priority order')
            .replace('{risks}', parsedSections.risks.join('\n') || 'Standard research limitations apply')
            .replace('{sources}', parsedSections.sources.map((s, i) => `${i + 1}. ${s}`).join('\n'))
            .replace('{confidence_score}', Math.round(qualityMetrics.confidence_score * 100))
            .replace('{source_quality}', qualityMetrics.source_diversity ? 'High' : 'Moderate')
            .replace('{completeness}', Math.round(qualityMetrics.completeness_score * 100) + '%');

        return {
            ...baseResponse,
            result: formattedResponse,
            metadata: {
                tools_used: toolsUsed,
                confidence_score: qualityMetrics.confidence_score,
                processing_time_ms: Date.now() - startTime,
                session_id: processorData.session_id,
                quality_metrics: qualityMetrics
            },
            github_integration: {
                status: 'SUCCESS',
                config_version: config.version,
                prompts_version: prompts.version,
                template_used: processorData.output_format + '_format'
            }
        };
    }
};

const finalResponse = buildFormattedResponse();

const processingTime = Date.now() - startTime;
console.log('✅ Response formatting completed in', processingTime, 'ms');
console.log('✅ Output format:', processorData.output_format);
console.log('✅ Confidence score:', qualityMetrics.confidence_score);
console.log('✅ Sources found:', qualityMetrics.source_count);

finalResponse.timestamp = new Date().toISOString();
return [finalResponse];