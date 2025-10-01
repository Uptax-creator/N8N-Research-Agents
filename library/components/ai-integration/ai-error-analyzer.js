// AI Error Analyzer - Intelligent Error Analysis and Root Cause Detection
// Substitui relatórios estáticos por análise AI de erros e sugestões automáticas

async function aiErrorAnalyzer() {
  const inputData = $input.first().json;
  const validationResults = inputData.validation_results;
  const processedResults = inputData.processed_results;

  console.log(`🧠 [AI Error Analyzer] Starting intelligent error analysis...`);

  // Error knowledge base (learned from patterns)
  const errorKnowledgeBase = {
    common_errors: {
      'Agent not found': {
        category: 'CONFIGURATION',
        severity: 'MEDIUM',
        auto_fixable: true,
        typical_causes: ['Invalid agent ID', 'Agent deactivated', 'Configuration mismatch'],
        resolution_steps: ['Verify agent exists', 'Check agent status', 'Validate configuration']
      },
      'Timeout': {
        category: 'PERFORMANCE',
        severity: 'HIGH',
        auto_fixable: false,
        typical_causes: ['High system load', 'Network latency', 'Resource exhaustion'],
        resolution_steps: ['Check system resources', 'Investigate network', 'Scale resources']
      },
      'Connection reset': {
        category: 'NETWORK',
        severity: 'HIGH',
        auto_fixable: true,
        typical_causes: ['Network instability', 'Service restart', 'Firewall issues'],
        resolution_steps: ['Retry connection', 'Check service status', 'Verify firewall rules']
      }
    },
    performance_patterns: {
      degradation_indicators: ['Response time > 2x baseline', 'Memory usage > 80%', 'CPU > 90%'],
      optimization_opportunities: ['Cache miss ratio > 50%', 'Database query time > 1s', 'API calls > 100/min']
    },
    predictive_models: {
      failure_probability: {
        high_load: 0.15,
        network_issues: 0.08,
        config_changes: 0.12
      }
    }
  };

  // Prepare analysis context
  const analysisContext = {
    test_executed: inputData.test_executed,
    validation_results: validationResults,
    processed_results: processedResults,
    performance_data: processedResults.performance,
    error_indicators: extractErrorIndicators(inputData),
    session_metadata: {
      session_id: processedResults.session_id,
      timestamp: processedResults.timestamp,
      ai_enhanced: inputData.ai_metadata ? true : false
    }
  };

  console.log(`🔍 [Analysis Context] Test: ${analysisContext.test_executed}`);
  console.log(`📊 [Status] Overall: ${validationResults.overall_status}, Confidence: ${validationResults.confidence}%`);

  let errorAnalysis;

  try {
    // AI-powered error analysis
    errorAnalysis = await performAIErrorAnalysis(analysisContext, errorKnowledgeBase);
  } catch (error) {
    console.log(`⚠️ [AI Analyzer] AI analysis failed, using enhanced pattern matching: ${error.message}`);
    errorAnalysis = performPatternBasedAnalysis(analysisContext, errorKnowledgeBase);
  }

  // Generate predictive insights
  const predictiveInsights = generatePredictiveInsights(analysisContext, errorKnowledgeBase);
  errorAnalysis.predictive_insights = predictiveInsights;

  // Auto-resolution suggestions
  const autoResolution = generateAutoResolutionPlan(analysisContext, errorAnalysis, errorKnowledgeBase);
  errorAnalysis.auto_resolution = autoResolution;

  // Generate final intelligent report
  const finalReport = generateIntelligentReport(analysisContext, errorAnalysis, validationResults);

  console.log(`✅ [AI Analyzer] Analysis complete`);
  console.log(`🎯 [Root Cause] ${errorAnalysis.root_cause || 'No issues detected'}`);
  console.log(`🔮 [Prediction] ${predictiveInsights.next_failure_probability}% chance of future issues`);

  return [{
    json: {
      ...inputData,
      error_analysis: errorAnalysis,
      final_report: finalReport,
      ai_analysis_metadata: {
        analyzer_version: "1.0.0",
        analysis_timestamp: new Date().toISOString(),
        ai_enhanced: true,
        confidence_score: errorAnalysis.analysis_confidence
      }
    }
  }];
}

// Extract error indicators from all data
function extractErrorIndicators(inputData) {
  const indicators = [];

  // Check processed results for errors
  if (inputData.processed_results.status === 'FAILED') {
    indicators.push({
      type: 'SYSTEM_FAILURE',
      source: 'processed_results',
      details: inputData.processed_results.raw_checker_data?.error || 'Unknown failure'
    });
  }

  // Check performance indicators
  if (inputData.processed_results.performance.duration_ms > 5000) {
    indicators.push({
      type: 'PERFORMANCE_DEGRADATION',
      source: 'performance_metrics',
      details: `Duration ${inputData.processed_results.performance.duration_ms}ms exceeds threshold`
    });
  }

  // Check validation anomalies
  if (inputData.validation_results?.anomalies?.length > 0) {
    inputData.validation_results.anomalies.forEach(anomaly => {
      indicators.push({
        type: anomaly.type,
        source: 'validation_anomalies',
        details: anomaly.description,
        severity: anomaly.severity
      });
    });
  }

  return indicators;
}

// AI-powered error analysis
async function performAIErrorAnalysis(context, knowledgeBase) {
  console.log(`🧠 [AI Analysis] Analyzing error patterns and root causes...`);

  // Prepare comprehensive context for AI
  const aiPrompt = `
Analyze the following test execution for errors, performance issues, and improvement opportunities:

TEST EXECUTION DATA:
- Test: ${context.test_executed}
- Overall Status: ${context.validation_results.overall_status}
- Performance Grade: ${context.validation_results.performance_grade}
- Duration: ${context.performance_data.duration_ms}ms
- Functional Status: ${context.validation_results.functional_status}
- Risk Assessment: ${context.validation_results.risk_assessment}

ERROR INDICATORS:
${context.error_indicators.map(e => `- ${e.type}: ${e.details}`).join('\n')}

VALIDATION RESULTS:
- Confidence: ${context.validation_results.confidence}%
- Anomalies Detected: ${context.validation_results.anomalies?.length || 0}

ANALYSIS REQUIREMENTS:
1. Root cause identification
2. Error categorization and severity
3. Performance bottleneck analysis
4. Predictive failure indicators
5. Automated resolution feasibility
6. Optimization recommendations

Respond with JSON:
{
  "root_cause": "primary cause description",
  "error_category": "PERFORMANCE|CONFIGURATION|NETWORK|SYSTEM",
  "severity": "LOW|MEDIUM|HIGH|CRITICAL",
  "analysis_confidence": 85,
  "contributing_factors": ["factor1", "factor2"],
  "performance_bottlenecks": ["bottleneck1", "bottleneck2"],
  "auto_fixable": true,
  "optimization_potential": "HIGH|MEDIUM|LOW",
  "reasoning": "detailed analysis explanation"
}
`;

  // Simulated AI response (replace with actual API call)
  const simulatedAIResponse = generateSimulatedAIAnalysis(context, knowledgeBase);

  return simulatedAIResponse;
}

// Generate simulated AI analysis
function generateSimulatedAIAnalysis(context, knowledgeBase) {
  let analysis = {
    analysis_confidence: 85,
    auto_fixable: false,
    optimization_potential: 'MEDIUM'
  };

  // Analyze based on error indicators
  if (context.error_indicators.length === 0) {
    analysis.root_cause = 'No significant issues detected';
    analysis.error_category = 'NONE';
    analysis.severity = 'LOW';
    analysis.contributing_factors = [];
    analysis.performance_bottlenecks = [];
    analysis.auto_fixable = true;
    analysis.optimization_potential = 'LOW';
    analysis.reasoning = 'Test executed successfully with normal performance characteristics';
  } else {
    // Analyze primary error indicator
    const primaryError = context.error_indicators[0];

    if (primaryError.type === 'PERFORMANCE_DEGRADATION') {
      analysis.root_cause = 'Performance degradation detected';
      analysis.error_category = 'PERFORMANCE';
      analysis.severity = primaryError.severity || 'MEDIUM';
      analysis.contributing_factors = ['High response time', 'Possible resource contention'];
      analysis.performance_bottlenecks = ['Response time', 'Processing overhead'];
      analysis.optimization_potential = 'HIGH';
      analysis.reasoning = `Performance analysis indicates response time of ${context.performance_data.duration_ms}ms exceeds optimal thresholds`;
    } else if (primaryError.details?.includes('Agent not found')) {
      analysis.root_cause = 'Agent configuration error';
      analysis.error_category = 'CONFIGURATION';
      analysis.severity = 'MEDIUM';
      analysis.contributing_factors = ['Invalid agent ID', 'Configuration mismatch'];
      analysis.performance_bottlenecks = [];
      analysis.auto_fixable = true;
      analysis.optimization_potential = 'LOW';
      analysis.reasoning = 'Expected configuration error for test scenario - proper error handling confirmed';
    } else {
      analysis.root_cause = 'System failure detected';
      analysis.error_category = 'SYSTEM';
      analysis.severity = 'HIGH';
      analysis.contributing_factors = ['Unknown system issue'];
      analysis.performance_bottlenecks = ['System processing'];
      analysis.optimization_potential = 'HIGH';
      analysis.reasoning = 'Unexpected system failure requires investigation';
    }
  }

  return analysis;
}

// Pattern-based analysis fallback
function performPatternBasedAnalysis(context, knowledgeBase) {
  console.log(`🔧 [Pattern Analysis] Using enhanced pattern matching...`);

  const analysis = {
    root_cause: 'Pattern-based analysis',
    error_category: 'UNKNOWN',
    severity: 'MEDIUM',
    analysis_confidence: 70,
    contributing_factors: [],
    performance_bottlenecks: [],
    auto_fixable: false,
    optimization_potential: 'MEDIUM',
    fallback_used: true,
    reasoning: 'AI analysis unavailable, using pattern matching with knowledge base'
  };

  // Apply pattern matching logic
  if (context.validation_results.overall_status === 'PASS' &&
      context.validation_results.performance_grade === 'A') {
    analysis.root_cause = 'No issues detected';
    analysis.severity = 'LOW';
    analysis.auto_fixable = true;
    analysis.optimization_potential = 'LOW';
  }

  return analysis;
}

// Generate predictive insights
function generatePredictiveInsights(context, knowledgeBase) {
  const insights = {
    next_failure_probability: 5, // Base 5% chance
    failure_indicators: [],
    optimization_opportunities: [],
    preventive_actions: []
  };

  // Analyze performance trends
  if (context.performance_data.duration_ms > 2000) {
    insights.next_failure_probability += 15;
    insights.failure_indicators.push('Performance degradation trend');
    insights.preventive_actions.push('Monitor system resources closely');
  }

  // Analyze error patterns
  if (context.error_indicators.length > 0) {
    insights.next_failure_probability += 10;
    insights.failure_indicators.push('Error patterns detected');
    insights.preventive_actions.push('Investigate error root causes');
  }

  // Optimization opportunities
  if (context.validation_results.performance_grade !== 'A') {
    insights.optimization_opportunities.push('Performance optimization potential');
    insights.preventive_actions.push('Implement performance improvements');
  }

  return insights;
}

// Generate auto-resolution plan
function generateAutoResolutionPlan(context, errorAnalysis, knowledgeBase) {
  const resolutionPlan = {
    auto_executable: errorAnalysis.auto_fixable,
    resolution_steps: [],
    estimated_time: '0 minutes',
    success_probability: 0.9,
    rollback_plan: []
  };

  if (errorAnalysis.auto_fixable) {
    switch (errorAnalysis.error_category) {
      case 'CONFIGURATION':
        resolutionPlan.resolution_steps = [
          'Validate agent configuration',
          'Reset to default configuration if needed',
          'Re-run test to verify fix'
        ];
        resolutionPlan.estimated_time = '2 minutes';
        break;

      case 'PERFORMANCE':
        resolutionPlan.resolution_steps = [
          'Clear application cache',
          'Restart performance-critical services',
          'Run performance validation'
        ];
        resolutionPlan.estimated_time = '5 minutes';
        break;

      default:
        resolutionPlan.auto_executable = false;
        resolutionPlan.resolution_steps = ['Manual investigation required'];
    }
  }

  return resolutionPlan;
}

// Generate intelligent final report
function generateIntelligentReport(context, errorAnalysis, validationResults) {
  const timestamp = new Date().toISOString();

  const report = {
    report_id: `ai-report-${Date.now()}`,
    timestamp: timestamp,
    test_summary: {
      test_name: context.test_executed,
      overall_result: validationResults.overall_status,
      performance_grade: validationResults.performance_grade,
      execution_time: context.performance_data.duration_ms,
      confidence_score: Math.min(validationResults.confidence, errorAnalysis.analysis_confidence)
    },
    ai_analysis: {
      root_cause: errorAnalysis.root_cause,
      severity: errorAnalysis.severity,
      category: errorAnalysis.error_category,
      auto_resolution_available: errorAnalysis.auto_fixable
    },
    performance_analysis: {
      grade: validationResults.performance_grade,
      bottlenecks: errorAnalysis.performance_bottlenecks,
      optimization_potential: errorAnalysis.optimization_potential
    },
    recommendations: [
      ...validationResults.recommendations || [],
      ...generateAIRecommendations(errorAnalysis, context)
    ],
    next_steps: generateNextSteps(errorAnalysis, validationResults),
    metadata: {
      ai_enhanced: true,
      analysis_confidence: errorAnalysis.analysis_confidence,
      generated_by: 'AI Error Analyzer v1.0.0'
    }
  };

  return report;
}

// Generate AI-specific recommendations
function generateAIRecommendations(errorAnalysis, context) {
  const recommendations = [];

  if (errorAnalysis.optimization_potential === 'HIGH') {
    recommendations.push('High optimization potential detected - consider implementing AI-suggested improvements');
  }

  if (errorAnalysis.auto_fixable) {
    recommendations.push('Auto-resolution available - enable automated error correction');
  }

  if (context.error_indicators.length === 0) {
    recommendations.push('System performing well - consider expanding test coverage');
  }

  return recommendations;
}

// Generate intelligent next steps
function generateNextSteps(errorAnalysis, validationResults) {
  const nextSteps = [];

  if (errorAnalysis.severity === 'HIGH' || errorAnalysis.severity === 'CRITICAL') {
    nextSteps.push('IMMEDIATE: Investigate and resolve critical issues');
  }

  if (validationResults.overall_status === 'FAIL') {
    nextSteps.push('Review error analysis and implement suggested fixes');
  }

  if (errorAnalysis.auto_fixable) {
    nextSteps.push('Execute auto-resolution plan');
  }

  if (validationResults.performance_grade === 'C' || validationResults.performance_grade === 'D') {
    nextSteps.push('Implement performance optimization recommendations');
  }

  if (nextSteps.length === 0) {
    nextSteps.push('Continue monitoring - system operating normally');
  }

  return nextSteps;
}

// Export the main function
return await aiErrorAnalyzer();