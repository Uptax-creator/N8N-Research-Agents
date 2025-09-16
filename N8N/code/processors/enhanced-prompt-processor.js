// Enhanced Prompt Processor v2.0
// Processes GitHub config + prompts for LangChain AI Agent

const startTime = Date.now();
console.log('=== Enhanced Prompt Processor v2.0 - Starting ===');

// Load GitHub configurations
const config = $('Load GitHub Config').item.json.body || $('Load GitHub Config').item.json;
const prompts = $('Load GitHub Prompts').item.json.body || $('Load GitHub Prompts').item.json;
const inputData = $('Webhook').item.json.body;

console.log('✅ Config loaded:', config.agent_name, config.version);
console.log('✅ Prompts loaded:', Object.keys(prompts.task_prompts).length, 'task templates');

// Validate input
const errors = [];
const warnings = [];

// Check required fields
for (const field of config.input_validation.required_fields) {
    if (!inputData[field] || inputData[field] === '') {
        errors.push(`Missing required field: ${field}`);
    }
}

// Validate research type
const researchType = inputData.research_type || 'comprehensive_research';
if (!config.input_validation.supported_research_types.includes(researchType)) {
    warnings.push(`Research type '${researchType}' not in supported list, using comprehensive_research`);
}

// Validate output format
const outputFormat = inputData.output_format || 'research';
if (!config.input_validation.supported_output_formats.includes(outputFormat)) {
    warnings.push(`Output format '${outputFormat}' not supported, using research format`);
}

// Check query length
if (inputData.query && inputData.query.length > config.input_validation.max_query_length) {
    errors.push(`Query length (${inputData.query.length}) exceeds maximum (${config.input_validation.max_query_length})`);
}

// Return validation errors if any
if (errors.length > 0) {
    const processTime = Date.now() - startTime;
    return [{
        error: true,
        message: 'Input validation failed',
        details: { errors, warnings },
        processing_time_ms: processTime,
        timestamp: new Date().toISOString()
    }];
}

// Determine research parameters
const finalResearchType = config.input_validation.supported_research_types.includes(researchType)
    ? researchType : 'comprehensive_research';
const finalOutputFormat = config.input_validation.supported_output_formats.includes(outputFormat)
    ? outputFormat : 'research';

// Build system prompt
const systemComponents = [
    prompts.system_prompts.base_system,
    prompts.system_prompts.tool_selection,
    prompts.system_prompts.research_methodology,
    prompts.system_prompts.quality_standards
];

// Add tone and format modifiers if specified
if (inputData.tone && prompts.response_modifiers.tone[inputData.tone]) {
    systemComponents.push(prompts.response_modifiers.tone[inputData.tone]);
}

if (inputData.format_style && prompts.response_modifiers.format[inputData.format_style]) {
    systemComponents.push(prompts.response_modifiers.format[inputData.format_style]);
}

if (inputData.depth && prompts.response_modifiers.depth[inputData.depth]) {
    systemComponents.push(prompts.response_modifiers.depth[inputData.depth]);
}

const systemPrompt = systemComponents.join('\n\n');

// Select and customize task prompt
const taskPromptTemplate = prompts.task_prompts[finalResearchType] || prompts.task_prompts.comprehensive_research;

// Replace placeholders in task prompt
const taskPrompt = taskPromptTemplate
    .replace('{query}', inputData.query)
    .replace('{context}', inputData.context || 'General research context')
    .replace('{depth}', inputData.depth || 'standard')
    .replace('{scope}', inputData.scope || 'comprehensive')
    .replace('{criteria}', inputData.criteria || 'standard evaluation criteria');

// Prepare session configuration
const sessionId = inputData.session_id || `session_${Date.now()}`;

// Build tool preferences
const toolPreferences = {
    serpapi_priority: config.tools_config.search_tools.serpapi.priority,
    perplexity_priority: config.tools_config.search_tools.perplexity.priority,
    preferred_model: inputData.model || config.tools_config.primary_llm,
    max_tokens: inputData.max_tokens || config.tools_config.models[config.tools_config.primary_llm].max_tokens
};

const processTime = Date.now() - startTime;

console.log('✅ Prompt processing completed in', processTime, 'ms');
console.log('✅ Research type:', finalResearchType);
console.log('✅ Output format:', finalOutputFormat);
console.log('✅ Session ID:', sessionId);

// Return processed data for LangChain AI Agent
return [{
    // For LangChain AI Agent node
    text: taskPrompt,
    session_id: sessionId,

    // Configuration data for response formatter
    config: config,
    prompts: prompts,
    research_type: finalResearchType,
    output_format: finalOutputFormat,
    tool_preferences: toolPreferences,

    // Processing metadata
    processing_metadata: {
        input_validation: {
            errors_count: errors.length,
            warnings_count: warnings.length,
            warnings: warnings
        },
        prompt_components: systemComponents.length,
        placeholders_replaced: 5,
        processing_time_ms: processTime
    },

    // For system message in AI Agent
    system_message: systemPrompt,

    // Quality tracking
    quality_requirements: {
        min_sources: config.quality_metrics.min_sources,
        confidence_threshold: config.quality_metrics.confidence_threshold,
        source_diversity_required: config.quality_metrics.source_diversity_required
    },

    timestamp: new Date().toISOString()
}];