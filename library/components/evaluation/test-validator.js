// Test Validator - Automated Validation
// GitHub: https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/code/processors/test-validator.js

const testConfigs = $('Set Test Configurations').item.json;
const workflowResults = $('Results Processor').item.json;

// Select test to validate (change this line for different tests)
const selectedTest = 'test_1_basic_connectivity'; // or 'test_2_agent_inexistente' or 'test_3_performance_validation'

const currentTest = testConfigs[selectedTest];
const expectedResults = currentTest.expected_results;

console.log(`🧪 [Test Validator] GitHub Loaded - Running: ${currentTest.name}`);
console.log(`📋 [Test Description] ${currentTest.description}`);

// Validation functions
function validateStructure(actual, expected) {
  const validations = {};
  for (const [key, expectedValue] of Object.entries(expected)) {
    const actualValue = actual[key];
    if (typeof expectedValue === 'boolean') {
      validations[key] = {
        expected: expectedValue,
        actual: actualValue,
        passed: actualValue === expectedValue,
        type: 'boolean_match'
      };
    } else if (typeof expectedValue === 'string') {
      validations[key] = {
        expected: expectedValue,
        actual: actualValue,
        passed: actualValue === expectedValue || (actualValue && actualValue.toString().includes(expectedValue)),
        type: 'string_match'
      };
    }
  }
  return validations;
}

// Performance validation
function validatePerformance(results) {
  const duration = results.performance?.duration_ms || 0;
  return {
    duration_ms: duration,
    under_5s: duration < 5000,
    performance_grade: duration < 2000 ? 'A' : duration < 5000 ? 'B' : 'C',
    target_met: duration < 5000
  };
}

// GitHub connectivity validation
function validateGitHubConnectivity(results) {
  return {
    config_loaded: results.config_loaded,
    github_connectivity: results.github_connectivity,
    overall_connectivity: results.config_loaded && results.github_connectivity
  };
}

// Execute validations
const validationResults = {
  test_info: {
    name: currentTest.name,
    description: currentTest.description,
    test_id: selectedTest,
    timestamp: new Date().toISOString()
  },
  structure_validation: validateStructure(workflowResults, expectedResults),
  specific_validations: {
    performance: validatePerformance(workflowResults),
    github_connectivity: validateGitHubConnectivity(workflowResults)
  }
};

// Calculate success rate
let totalChecks = 0;
let passedChecks = 0;

for (const [key, validation] of Object.entries(validationResults.structure_validation)) {
  totalChecks++;
  if (validation.passed) passedChecks++;
}

for (const [category, validations] of Object.entries(validationResults.specific_validations)) {
  for (const [key, value] of Object.entries(validations)) {
    if (typeof value === 'boolean') {
      totalChecks++;
      if (value) passedChecks++;
    }
  }
}

validationResults.overall_assessment = {
  total_checks: totalChecks,
  passed_checks: passedChecks,
  failed_checks: totalChecks - passedChecks,
  success_rate: totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0,
  overall_status: passedChecks === totalChecks ? 'PASSED' : passedChecks > totalChecks * 0.7 ? 'MOSTLY_PASSED' : 'FAILED',
  github_loaded: true
};

// Enhanced results
const enhancedResults = {
  ...workflowResults,
  test_validation: validationResults,
  test_metadata: {
    test_executed: selectedTest,
    payload_used: currentTest.payload,
    validation_timestamp: new Date().toISOString(),
    validator_version: '1.0.0-github',
    github_source: 'https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/code/processors/test-validator.js'
  }
};

console.log('📊 [Validation Results] GitHub Processor:', validationResults.overall_assessment);
console.log(`✅ [Success Rate] ${validationResults.overall_assessment.success_rate}%`);

return [{ json: enhancedResults }];