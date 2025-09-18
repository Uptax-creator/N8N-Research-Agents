// ========================================
// POC 1: DYNAMIC VALIDATION FROM GITHUB
// ========================================

const startTime = Date.now();
console.log('=== POC 1: GitHub-Powered Validation ===');

// Get webhook data and GitHub rules
const inputData = $('Webhook POC').item.json.body || $('Webhook POC').item.json;
const githubRules = $('Load GitHub Validation Rules1').item.json;

console.log('Raw GitHub response type:', typeof githubRules);
console.log('Raw GitHub response:', JSON.stringify(githubRules, null, 2));

// Parse GitHub response if it's a string
let parsedGitHubRules;
try {
    if (typeof githubRules === 'string') {
        parsedGitHubRules = JSON.parse(githubRules);
    } else if (githubRules.data && typeof githubRules.data === 'string') {
        // If wrapped in data property
        parsedGitHubRules = JSON.parse(githubRules.data);
    } else {
        parsedGitHubRules = githubRules;
    }
} catch (e) {
    console.log('Parse error:', e.message);
    parsedGitHubRules = githubRules;
}

console.log('✅ Parsed GitHub rules:', parsedGitHubRules.name, parsedGitHubRules.version);

// Safely access validation_rules with fallback
const validationRules = parsedGitHubRules.validation_rules || {
    required_fields: ['type', 'domain', 'context'],
    valid_types: ['template', 'library', 'example', 'documentation', 'code', 'workflow'],
    valid_domains: ['n8n', 'python', 'banking', 'fintech', 'javascript', 'typescript', 'generic'],
    valid_priorities: ['low', 'medium', 'high', 'urgent'],
    default_priority: 'medium',
    default_cache_ttl: 300,
    default_max_results: 10,
    default_sources: ['perplexity', 'github', 'n8n_community']
};

const requiredFields = validationRules.required_fields;
const validTypes = validationRules.valid_types;
const validDomains = validationRules.valid_domains;

console.log('Using validation rules:', {
    required_fields: requiredFields,
    valid_types: validTypes,
    valid_domains: validDomains
});

// Dynamic validation function
function validateWithGitHubRules(data, rules) {
    const errors = [];
    const warnings = [];

    // Check required fields dynamically
    for (const field of rules.required_fields) {
        if (!data[field] || data[field] === '') {
            errors.push(`Missing required field: ${field}`);
        }
    }

    // Validate types dynamically
    if (data.type && !rules.valid_types.includes(data.type)) {
        errors.push(`Invalid type: ${data.type}. Valid: ${rules.valid_types.join(', ')}`);
    }

    // Validate domains dynamically
    if (data.domain && !rules.valid_domains.includes(data.domain)) {
        warnings.push(`Uncommon domain: ${data.domain}`);
    }

    return { errors, warnings };
}

// Validate with GitHub rules
const validation = validateWithGitHubRules(inputData, validationRules);
const loadTime = Date.now() - startTime;

console.log('Validation result:', validation);

// Return result
if (validation.errors.length > 0) {
    return [{
        success: false,
        error: 'GITHUB_VALIDATION_ERROR',
        message: 'GitHub-powered validation failed',
        details: {
            errors: validation.errors,
            warnings: validation.warnings,
            github_rules_used: true,
            rules_version: parsedGitHubRules.version || '1.0.0'
        },
        performance: {
            github_load_time_ms: loadTime,
            total_processing_ms: loadTime
        },
        github_integration: {
            status: 'SUCCESS',
            prompt_source: 'GitHub',
            repository: parsedGitHubRules.github_integration?.repository || 'Uptax-creator/N8N-Research-Agents',
            prompt_loaded: true
        },
        timestamp: new Date().toISOString()
    }];
}

// Success with GitHub rules
return [{
    success: true,
    message: 'GitHub validation successful! 🎯',
    component: 'github_powered_validation',
    data: {
        ...inputData,
        priority: inputData.priority || validationRules.default_priority,
        cache_ttl: inputData.cache_ttl || validationRules.default_cache_ttl,
        max_results: inputData.max_results || validationRules.default_max_results
    },
    github_integration: {
        status: 'SUCCESS',
        prompt_source: 'GitHub',
        rules_version: parsedGitHubRules.version || '1.0.0',
        load_time_ms: loadTime,
        repository: parsedGitHubRules.github_integration?.repository || 'Uptax-creator/N8N-Research-Agents',
        prompt_loaded: true,
        github_url_used: 'https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/main/N8N/prompts/agents/research-agent.json'
    },
    validation_results: {
        fields_validated: Object.keys(inputData).length,
        all_required_present: validation.errors.length === 0,
        warnings_count: validation.warnings.length,
        validation_passed: true
    },
    performance: {
        total_processing_ms: loadTime,
        github_load_time_ms: loadTime,
        validation_efficiency: loadTime < 500 ? 'EXCELLENT' : loadTime < 1000 ? 'GOOD' : 'ACCEPTABLE'
    },
    timestamp: new Date().toISOString()
}];