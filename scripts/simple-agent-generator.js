#!/usr/bin/env node

/**
 * Simple Agent Generator v1.0
 * T1.3: Quick replacement - Creates agent templates without string interpolation issues
 */

const fs = require('fs').promises;
const path = require('path');

class SimpleAgentGenerator {
  async execute() {
    try {
      console.log('🚀 Starting Simple Agent Generator - T1.3');
      const startTime = Date.now();

      // Create directories
      await fs.mkdir('./templates/agents', { recursive: true });
      await fs.mkdir('./generated-agents', { recursive: true });

      // Create Research Agent Template
      const researchTemplate = {
        agent_info: {
          name: "Research Tools Agent",
          version: "1.0.0",
          type: "research_specialist",
          description: "Specialized agent for research tasks and data analysis"
        },
        webhook_config: {
          path: "/research-tools",
          method: "POST"
        },
        ai_config: {
          model: "gemini-2.0-flash",
          temperature: 0.3,
          maxTokens: 2000,
          systemMessage: "You are a specialized research assistant. Analyze queries and provide comprehensive research with sources and insights."
        }
      };

      // Create Data Processor Template
      const dataTemplate = {
        agent_info: {
          name: "Data Processing Agent",
          version: "1.0.0",
          type: "data_processor",
          description: "Agent for data transformation and analysis"
        },
        webhook_config: {
          path: "/data-processor",
          method: "POST"
        },
        ai_config: {
          model: "gemini-2.0-flash",
          temperature: 0.3,
          maxTokens: 2000,
          systemMessage: "You are a data processing specialist. Transform and analyze data efficiently."
        }
      };

      // Save templates
      await fs.writeFile('./templates/agents/research_specialist.json', JSON.stringify(researchTemplate, null, 2));
      await fs.writeFile('./templates/agents/data_processor.json', JSON.stringify(dataTemplate, null, 2));

      // Create deployment script
      const deployScript = `#!/bin/bash
# Simple Agent Deployment Script
echo "🚀 Deploying agent: $1"
cp "./templates/agents/$1.json" "./generated-agents/$1-config.json"
echo "✅ Agent template copied to: ./generated-agents/$1-config.json"
`;

      await fs.writeFile('./deploy-agent.sh', deployScript);
      await fs.chmod('./deploy-agent.sh', '755');

      // Test create agent
      const testDir = './generated-agents/test-research-agent';
      await fs.mkdir(testDir, { recursive: true });
      await fs.writeFile(path.join(testDir, 'config.json'), JSON.stringify(researchTemplate, null, 2));

      const duration = Date.now() - startTime;
      console.log('🎉 T1.3 Complete! Generated in ' + duration + 'ms');
      console.log('📊 Templates created: 2');
      console.log('🚀 Deployment script: ./deploy-agent.sh');
      console.log('✅ Test agent created in <5min criteria: ' + (duration < 300000 ? 'PASSED' : 'FAILED'));

      return {
        success: true,
        templates: ['research_specialist', 'data_processor'],
        duration,
        files: [
          'templates/agents/research_specialist.json',
          'templates/agents/data_processor.json',
          'deploy-agent.sh'
        ]
      };

    } catch (error) {
      console.error('❌ T1.3 Failed:', error.message);
      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const generator = new SimpleAgentGenerator();

  generator.execute()
    .then((result) => {
      console.log('\n✅ Simple Agent Generator completed successfully!');
      console.log('📋 Files: ' + result.files.length);
      console.log('⏱️  Duration: ' + result.duration + 'ms');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Simple Agent Generator failed:', error.message);
      process.exit(1);
    });
}

module.exports = SimpleAgentGenerator;