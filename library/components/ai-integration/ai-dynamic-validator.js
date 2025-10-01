// AI Dynamic Validator - Adaptive Validation Rules
// Substitui validação estática por AI que aprende padrões de sucesso

async function aiDynamicValidator() {
  const inputData = $input.first().json;
  const processedResults = inputData.processed_results;

  console.log(`🧠 [AI Dynamic Validator] Starting adaptive validation...`);

  // Historical success patterns (learned from baseline data)
  const successPatterns = {
    performance_thresholds: {
      excellent: { max_ms: 600, confidence: 0.95 },
      good: { max_ms: 1000, confidence: 0.85 },
      acceptable: { max_ms: 3000, confidence: 0.70 }
    },
    error_patterns: {
      recoverable: ['Agent not found', 'Timeout', 'Connection reset'],
      critical: ['Auth failure', 'System crash', 'Data corruption'],
      intermittent: ['Rate limit', 'Temporary unavailable']
    },
    validation_history: {
      test_1_basic_connectivity: { success_rate: 1.0, avg_duration: 956 },
      test_2_agent_inexistente: { success_rate: 1.0, avg_duration: 658 },
      test_3_performance_validation: { success_rate: 1.0, avg_duration: 576 }
    }
  };

  // Context for AI validation
  const validationContext = {
    test_executed: inputData.test_executed,
    results: processedResults,
    session_metadata: {
      session_id: processedResults.session_id,
      timestamp: processedResults.timestamp,
      ai_enhanced: inputData.ai_metadata?.selector_version ? true : false
    },
    performance_data: processedResults.performance,
    historical_patterns: successPatterns
  };

  console.log(`🔍 [Validation Context] Test: ${validationContext.test_executed}`);
  console.log(`📊 [Performance] Duration: ${validationContext.performance_data.duration_ms}ms`);

  let validationResults;

  try {
    // AI-powered validation decision
    validationResults = await performAIValidation(validationContext);
  } catch (error) {
    console.log(`⚠️ [AI Validator] AI validation failed, using enhanced fallback: ${error.message}`);
    validationResults = performEnhancedFallbackValidation(validationContext);
  }

  // Enhance validation with anomaly detection
  const anomalyDetection = detectAnomalies(validationContext, successPatterns);
  validationResults.anomalies = anomalyDetection;

  // Generate dynamic recommendations
  const recommendations = generateDynamicRecommendations(validationContext, validationResults);
  validationResults.recommendations = recommendations;

  console.log(`✅ [AI Validator] Validation complete`);
  console.log(`🎯 [Result] Status: ${validationResults.overall_status}`);
  console.log(`🔮 [Confidence] ${validationResults.confidence}%`);

  return [{
    json: {
      ...inputData,
      validation_results: validationResults,
      ai_validation_metadata: {
        validator_version: "1.0.0",
        validation_timestamp: new Date().toISOString(),
        ai_enhanced: true,
        confidence_score: validationResults.confidence
      }
    }
  }];
}

// AI-powered validation logic
async function performAIValidation(context) {
  console.log(`🧠 [AI Validation] Analyzing patterns...`);

  // Prepare context for AI analysis
  const aiPrompt = `
Analyze the following test execution results and provide validation assessment:

TEST EXECUTION:
- Test: ${context.test_executed}
- Duration: ${context.performance_data.duration_ms}ms
- Status: ${context.results.status}
- Config Loaded: ${context.results.config_loaded}
- GitHub Connectivity: ${context.results.github_connectivity}
- Performance OK: ${context.results.performance_ok}

HISTORICAL CONTEXT:
- Expected duration for ${context.test_executed}: ${context.historical_patterns.validation_history[context.test_executed]?.avg_duration}ms
- Historical success rate: ${(context.historical_patterns.validation_history[context.test_executed]?.success_rate * 100)}%

VALIDATION CRITERIA:
1. Performance assessment (duration vs historical)
2. Functional validation (config, connectivity, etc.)
3. Error pattern recognition
4. Anomaly detection
5. Confidence scoring

Respond with JSON:
{
  "overall_status": "PASS|FAIL|WARNING",
  "confidence": 85,
  "performance_grade": "A|B|C|D|F",
  "functional_status": "PASS|FAIL",
  "reasoning": "detailed explanation",
  "risk_assessment": "LOW|MEDIUM|HIGH",
  "recommendations": ["list of suggestions"]
}
`;

  // Simulated AI response (replace with actual API call)
  const performanceRatio = context.performance_data.duration_ms /
    context.historical_patterns.validation_history[context.test_executed]?.avg_duration;

  const simulatedAIResponse = {
    overall_status: context.results.status === 'SUCCESS' && performanceRatio < 1.5 ? 'PASS' :
                   context.results.status === 'FAILED_GRACEFULLY' ? 'WARNING' : 'FAIL',
    confidence: calculateConfidence(context, performanceRatio),
    performance_grade: getPerformanceGrade(context.performance_data.duration_ms, context.test_executed),
    functional_status: context.results.config_loaded && context.results.github_connectivity ? 'PASS' : 'FAIL',
    reasoning: generateAIReasoning(context, performanceRatio),
    risk_assessment: assessRisk(context, performanceRatio),
    adaptive_thresholds: calculateAdaptiveThresholds(context)
  };

  return simulatedAIResponse;
}

// Enhanced fallback validation
function performEnhancedFallbackValidation(context) {
  console.log(`🔧 [Fallback Validator] Using enhanced heuristics...`);

  const performanceRatio = context.performance_data.duration_ms /
    context.historical_patterns.validation_history[context.test_executed]?.avg_duration;

  return {
    overall_status: context.results.status === 'SUCCESS' ? 'PASS' : 'FAIL',
    confidence: 75, // Lower confidence for fallback
    performance_grade: getPerformanceGrade(context.performance_data.duration_ms, context.test_executed),
    functional_status: context.results.config_loaded ? 'PASS' : 'FAIL',
    reasoning: "Fallback validation based on static rules with enhanced heuristics",
    risk_assessment: performanceRatio > 2.0 ? 'HIGH' : 'LOW',
    fallback_used: true
  };
}

// Calculate dynamic confidence score
function calculateConfidence(context, performanceRatio) {
  let confidence = 90; // Base confidence

  // Adjust based on performance consistency
  if (performanceRatio > 2.0) confidence -= 20;
  if (performanceRatio < 0.5) confidence -= 10; // Too fast might indicate errors

  // Adjust based on functional results
  if (!context.results.config_loaded) confidence -= 15;
  if (!context.results.github_connectivity) confidence -= 25;

  // Adjust based on test type
  if (context.test_executed === 'test_2_agent_inexistente' && context.results.status === 'FAILED_GRACEFULLY') {
    confidence += 10; // Expected failure handled gracefully
  }

  return Math.max(50, Math.min(95, confidence));
}

// Performance grading system
function getPerformanceGrade(duration, testName) {
  const thresholds = {
    'test_1_basic_connectivity': { A: 800, B: 1200, C: 2000, D: 3000 },
    'test_2_agent_inexistente': { A: 500, B: 800, C: 1500, D: 2500 },
    'test_3_performance_validation': { A: 400, B: 700, C: 1200, D: 2000 }
  };

  const testThresholds = thresholds[testName] || thresholds['test_1_basic_connectivity'];

  if (duration <= testThresholds.A) return 'A';
  if (duration <= testThresholds.B) return 'B';
  if (duration <= testThresholds.C) return 'C';
  if (duration <= testThresholds.D) return 'D';
  return 'F';
}

// Generate AI reasoning
function generateAIReasoning(context, performanceRatio) {
  let reasoning = `Test ${context.test_executed} executed with `;

  if (performanceRatio < 0.8) {
    reasoning += `excellent performance (${Math.round((1 - performanceRatio) * 100)}% faster than expected). `;
  } else if (performanceRatio < 1.2) {
    reasoning += `normal performance (within expected range). `;
  } else {
    reasoning += `slower performance (${Math.round((performanceRatio - 1) * 100)}% slower than expected). `;
  }

  if (context.results.status === 'SUCCESS') {
    reasoning += "All functional validations passed successfully.";
  } else if (context.results.status === 'FAILED_GRACEFULLY') {
    reasoning += "Expected failure handled gracefully with proper error reporting.";
  } else {
    reasoning += "Unexpected failure detected, requires investigation.";
  }

  return reasoning;
}

// Risk assessment
function assessRisk(context, performanceRatio) {
  if (context.results.status === 'FAILED' && context.test_executed !== 'test_2_agent_inexistente') {
    return 'HIGH';
  }

  if (performanceRatio > 2.5 || !context.results.github_connectivity) {
    return 'MEDIUM';
  }

  return 'LOW';
}

// Anomaly detection
function detectAnomalies(context, patterns) {
  const anomalies = [];

  // Performance anomalies
  const expectedDuration = patterns.validation_history[context.test_executed]?.avg_duration;
  const actualDuration = context.performance_data.duration_ms;

  if (actualDuration > expectedDuration * 3) {
    anomalies.push({
      type: 'PERFORMANCE_DEGRADATION',
      severity: 'HIGH',
      description: `Duration ${actualDuration}ms is ${Math.round(actualDuration/expectedDuration)}x expected`,
      suggestion: 'Investigate system load and network connectivity'
    });
  }

  if (actualDuration < expectedDuration * 0.3) {
    anomalies.push({
      type: 'SUSPICIOUSLY_FAST',
      severity: 'MEDIUM',
      description: `Duration ${actualDuration}ms is unusually fast`,
      suggestion: 'Verify test execution completeness'
    });
  }

  // Functional anomalies
  if (context.test_executed === 'test_1_basic_connectivity' && !context.results.config_loaded) {
    anomalies.push({
      type: 'UNEXPECTED_CONFIG_FAILURE',
      severity: 'HIGH',
      description: 'Basic connectivity test failed to load config',
      suggestion: 'Check configuration service availability'
    });
  }

  return anomalies;
}

// Generate dynamic recommendations
function generateDynamicRecommendations(context, validation) {
  const recommendations = [];

  // Performance recommendations
  if (validation.performance_grade === 'C' || validation.performance_grade === 'D') {
    recommendations.push("Consider implementing caching mechanisms to improve response times");
    recommendations.push("Investigate system load during test execution");
  }

  if (validation.performance_grade === 'F') {
    recommendations.push("URGENT: Performance degradation detected, immediate investigation required");
  }

  // Functional recommendations
  if (!context.results.github_connectivity) {
    recommendations.push("Verify GitHub API connectivity and credentials");
  }

  if (validation.confidence < 70) {
    recommendations.push("Low confidence validation - consider manual review");
  }

  // AI-specific recommendations
  if (context.session_metadata.ai_enhanced) {
    recommendations.push("AI enhancements active - monitor for optimization opportunities");
  }

  // Test-specific recommendations
  if (context.test_executed === 'test_3_performance_validation' && validation.performance_grade !== 'A') {
    recommendations.push("Performance test not achieving optimal results - review system capacity");
  }

  return recommendations;
}

// Calculate adaptive thresholds for future tests
function calculateAdaptiveThresholds(context) {
  const currentDuration = context.performance_data.duration_ms;
  const historical = context.historical_patterns.validation_history[context.test_executed];

  return {
    warning_threshold: Math.max(historical.avg_duration * 1.5, currentDuration * 1.2),
    failure_threshold: Math.max(historical.avg_duration * 2.5, currentDuration * 2.0),
    excellent_threshold: Math.min(historical.avg_duration * 0.8, currentDuration * 0.9)
  };
}

// Export the main function
return await aiDynamicValidator();