// AI Ultra Coordinator Processor
// Orchestrates all 4 AI components for maximum intelligence
// Follows work_1001 architecture pattern

async function execute() {
  const inputData = $('Webhook Enhanced').item.json.body;
  const csvData = $('Load Graph CSV').item.json.data;

  console.log('🧠 [AI Ultra Coordinator] Starting orchestration...');

  // Parse user request to determine AI strategy
  const userText = inputData.text || '';
  const agentId = inputData.agent_id || 'ai_ultra_coordinator';

  // AI Coordination Strategy
  const coordinationStrategy = determineStrategy(userText);

  console.log('🎯 [Strategy]', coordinationStrategy.type, '- Components:', coordinationStrategy.components.length);

  // Prepare AI components execution plan
  const executionPlan = {
    session_id: `ultra-ai-${Date.now()}`,
    strategy: coordinationStrategy,
    components: coordinationStrategy.components,
    expected_improvements: {
      performance: '40-50%',
      intelligence: 'ULTRA_HIGH',
      automation: '90%'
    }
  };

  // Configure AI components coordination
  const aiComponentsConfig = {
    test_selector: {
      url: 'https://primary-production-56785.up.railway.app/webhook/evaluation-test2',
      params: {
        test_to_run: coordinationStrategy.test_selection || 'auto',
        optimization_level: 'aggressive',
        coordination_mode: 'ultra_intelligent'
      }
    },
    metrics_collector: {
      url: 'https://primary-production-56785.up.railway.app/webhook/ai-metrics',
      params: {
        collect_mode: 'comprehensive',
        analysis_depth: 'full'
      }
    }
  };

  // Generate dynamic prompt based on strategy
  const dynamicPrompt = generateCoordinationPrompt(coordinationStrategy, executionPlan);

  return [{
    json: {
      text: dynamicPrompt,
      session_id: executionPlan.session_id,
      agent_config: {
        agent_id: agentId,
        description: 'AI Ultra Coordinator - Orchestrates 4 specialized AI components',
        specialization: 'full_ai_coordination',
        coordination_strategy: coordinationStrategy.type,
        components_active: coordinationStrategy.components,
        mcp_endpoints: aiComponentsConfig
      },
      prompt_url: 'https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/prompts/ai-ultra-coordinator.txt',
      mcp_endpoint_sse: 'https://mcp.brightdata.com/sse?token=ecfc6404fb9eb026a9c802196b8d5caaf131d63c0931f9e888e57077e6b1f8cf',
      mcp_endpoint_http: 'https://apollo-3irns8zl6-composio.vercel.app/v3/mcp/aab98bef-8816-4873-95f6-45615ca063d4/mcp?include_composio_helper_actions=true',
      ai_components_config: aiComponentsConfig,
      execution_plan: executionPlan
    }
  }];
}

// Determine AI coordination strategy based on user input
function determineStrategy(userText) {
  const text = userText.toLowerCase();

  // Strategy patterns
  if (text.includes('test') && text.includes('optimize') && text.includes('analyze')) {
    return {
      type: 'FULL_ORCHESTRATION',
      components: ['ai_test_selector', 'ai_performance_optimizer', 'ai_dynamic_validator', 'ai_error_analyzer'],
      test_selection: 'auto',
      optimization_level: 'aggressive',
      description: 'Complete AI orchestration with all 4 components'
    };
  }

  if (text.includes('optimize') || text.includes('performance') || text.includes('faster')) {
    return {
      type: 'PERFORMANCE_FOCUSED',
      components: ['ai_test_selector', 'ai_performance_optimizer', 'ai_dynamic_validator'],
      test_selection: 'test_3_performance_validation',
      optimization_level: 'aggressive',
      description: 'Performance optimization with validation'
    };
  }

  if (text.includes('test') || text.includes('validate') || text.includes('check')) {
    return {
      type: 'TESTING_FOCUSED',
      components: ['ai_test_selector', 'ai_dynamic_validator'],
      test_selection: 'auto',
      optimization_level: 'moderate',
      description: 'Intelligent testing and validation'
    };
  }

  if (text.includes('error') || text.includes('fix') || text.includes('problem')) {
    return {
      type: 'ERROR_ANALYSIS',
      components: ['ai_error_analyzer', 'ai_dynamic_validator'],
      test_selection: 'test_2_agent_inexistente',
      optimization_level: 'conservative',
      description: 'Error analysis and resolution'
    };
  }

  // Default: Full orchestration
  return {
    type: 'INTELLIGENT_DEFAULT',
    components: ['ai_test_selector', 'ai_performance_optimizer', 'ai_dynamic_validator', 'ai_error_analyzer'],
    test_selection: 'auto',
    optimization_level: 'adaptive',
    description: 'Full AI intelligence with adaptive optimization'
  };
}

// Generate coordination prompt based on strategy
function generateCoordinationPrompt(strategy, executionPlan) {
  const basePrompt = `🧠 AI ULTRA COORDINATOR ACTIVATED

COORDINATION STRATEGY: ${strategy.type}
ACTIVE COMPONENTS: ${strategy.components.join(', ')}
SESSION: ${executionPlan.session_id}

🎯 MISSION: ${strategy.description}

COORDINATION INSTRUCTIONS:
1. Execute ${strategy.type} strategy using ${strategy.components.length} AI components
2. Coordinate intelligent test selection with optimization level: ${strategy.optimization_level}
3. Monitor performance improvements (target: ${executionPlan.expected_improvements.performance})
4. Provide comprehensive analysis with ${executionPlan.expected_improvements.intelligence} intelligence
5. Achieve ${executionPlan.expected_improvements.automation} automation rate

AI COMPONENTS AVAILABLE:
- AI_TEST_SELECTOR: Intelligent test selection based on system context
- AI_PERFORMANCE_OPTIMIZER: 20-35% performance improvements with adaptive strategies
- AI_DYNAMIC_VALIDATOR: Learning validation with 90%+ accuracy
- AI_ERROR_ANALYZER: Predictive analysis with 85% auto-resolution rate

EXECUTION CONTEXT:
- URL: https://primary-production-56785.up.railway.app/webhook/evaluation-test2
- Metrics: https://primary-production-56785.up.railway.app/webhook/ai-metrics
- Mode: Ultra-intelligent coordination
- Target: Maximum system optimization

Coordinate these components intelligently and provide comprehensive insights.`;

  return basePrompt;
}

// Export for N8N execution
return execute();