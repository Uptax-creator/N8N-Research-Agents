// GitHub-Powered Validator v2.0
// Deploy: git push → n8n loads automatically

function validateWithGitHubRules(inputData, githubRules) {
    const startTime = Date.now();
    console.log('=== GitHub-Powered Validator v2.0 ===');

    // Parse GitHub rules if needed
    let parsedRules = githubRules;
    if (typeof githubRules === 'string') {
        parsedRules = JSON.parse(githubRules);
    }

    console.log('✅ GitHub rules loaded:', parsedRules.name, parsedRules.version);

    // Get validation rules with fallback
    const validationRules = parsedRules.validation_rules || {
        required_fields: ['type', 'domain', 'context'],
        valid_types: ['template', 'library', 'example', 'documentation', 'code', 'workflow'],
        valid_domains: ['n8n', 'python', 'banking', 'fintech', 'javascript', 'typescript', 'generic']
    };

    // Validate input
    const errors = [];
    const warnings = [];

    // Check required fields
    for (const field of validationRules.required_fields) {
        if (!inputData[field] || inputData[field] === '') {
            errors.push(`Missing required field: ${field}`);
        }
    }

    // Validate type
    if (inputData.type && !validationRules.valid_types.includes(inputData.type)) {
        errors.push(`Invalid type: ${inputData.type}. Valid: ${validationRules.valid_types.join(', ')}`);
    }

    // Validate domain
    if (inputData.domain && !validationRules.valid_domains.includes(inputData.domain)) {
        warnings.push(`Uncommon domain: ${inputData.domain}`);
    }

    const processTime = Date.now() - startTime;

    // Return result
    if (errors.length > 0) {
        return [{
            success: false,
            error: 'VALIDATION_FAILED',
            message: 'Input validation failed',
            details: {
                errors: errors,
                warnings: warnings
            },
            github_integration: {
                status: 'SUCCESS',
                prompt_source: 'GitHub',
                rules_version: parsedRules.version || '1.0.0',
                load_time_ms: processTime
            },
            timestamp: new Date().toISOString()
        }];
    }

    // Success
    return [{
        success: true,
        message: '🎯 Validation successful - GitHub powered!',
        data: {
            ...inputData,
            priority: inputData.priority || validationRules.default_priority || 'medium',
            validated: true
        },
        github_integration: {
            status: 'SUCCESS',
            prompt_source: 'GitHub',
            rules_version: parsedRules.version || '1.0.0',
            load_time_ms: processTime,
            deploy_method: 'git_push'
        },
        validation_summary: {
            fields_checked: Object.keys(inputData).length,
            errors_found: errors.length,
            warnings_found: warnings.length,
            validation_passed: true
        },
        performance: {
            processing_time_ms: processTime,
            efficiency: processTime < 100 ? 'EXCELLENT' : 'GOOD'
        },
        timestamp: new Date().toISOString()
    }];
}

// Export for external use (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { validateWithGitHubRules };
}

// For n8n execution, return the function code as string
return validateWithGitHubRules.toString();