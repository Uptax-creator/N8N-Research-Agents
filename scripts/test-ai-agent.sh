#!/bin/bash

# Test AI Research Agent
# Usage: ./test-ai-agent.sh

echo "🤖 ========================================="
echo "   AI RESEARCH AGENT - TEST SUITE"
echo "========================================="
echo ""

# Configuration
WEBHOOK_URL="https://primary-production-56785.up.railway.app/webhook/webhook/ai-research-agent"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Basic Research Query
echo -e "${YELLOW}📝 Test 1: Basic Research Query${NC}"
echo "Testing basic research functionality..."

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Como implementar autenticação JWT em n8n workflows?",
    "context": "Desenvolvimento de API segura para aplicação web",
    "provider": "claude",
    "format": "structured",
    "tone": "technical"
  }' | jq '.'

echo ""
echo -e "${GREEN}✅ Test 1 completed${NC}"
echo ""

# Test 2: Code Review Request
echo -e "${YELLOW}📝 Test 2: Code Review Request${NC}"
echo "Testing code review functionality..."

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Review this JavaScript code for best practices",
    "context": "const getData = async () => { let data = await fetch(url); return data.json() }",
    "prompt_type": "code_review_prompt",
    "provider": "claude",
    "format": "bullet_points",
    "tone": "professional"
  }' | jq '.'

echo ""
echo -e "${GREEN}✅ Test 2 completed${NC}"
echo ""

# Test 3: Documentation Generation
echo -e "${YELLOW}📝 Test 3: Documentation Generation${NC}"
echo "Testing documentation generation..."

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Create documentation for a webhook validation system",
    "context": "System that validates incoming webhooks and processes them dynamically",
    "prompt_type": "documentation_prompt",
    "format": "markdown",
    "tone": "technical",
    "audience": "developers"
  }' | jq '.'

echo ""
echo -e "${GREEN}✅ Test 3 completed${NC}"
echo ""

# Test 4: Summarization Request
echo -e "${YELLOW}📝 Test 4: Summarization Request${NC}"
echo "Testing summarization functionality..."

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Summarize the key benefits of using GitHub for dynamic configuration loading",
    "context": "We implemented a system that loads configurations, prompts, and code from GitHub dynamically in n8n workflows",
    "prompt_type": "summarization_prompt",
    "format": "bullet_points",
    "length": "brief"
  }' | jq '.'

echo ""
echo -e "${GREEN}✅ Test 4 completed${NC}"
echo ""

# Test 5: Error Handling (Missing Required Fields)
echo -e "${YELLOW}📝 Test 5: Error Handling Test${NC}"
echo "Testing error handling with missing fields..."

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "claude"
  }' | jq '.'

echo ""
echo -e "${GREEN}✅ Test 5 completed${NC}"
echo ""

echo "========================================="
echo -e "${GREEN}🎉 ALL TESTS COMPLETED!${NC}"
echo "========================================="
echo ""
echo "Test execution completed at: $(date)"
echo "Test ID: $TIMESTAMP"