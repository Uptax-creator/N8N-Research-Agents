#!/bin/bash

# Sprint 3 - Workflow Diagnosis Script

echo "🔍 DIAGNOSING N8N WORKFLOW"
echo "=========================="

# Test 1: Webhook connectivity
echo "1️⃣ Testing webhook connectivity..."
WEBHOOK_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  "https://primary-production-56785.up.railway.app/webhook/work-1001" \
  -H "Content-Type: application/json" \
  -d '{"project_id": "diag_test", "agent_id": "agent_001", "query": "diagnostic test"}')

echo "   Webhook HTTP status: $WEBHOOK_RESPONSE"

# Test 2: GitHub processors accessibility
echo "2️⃣ Testing GitHub processors..."
PROCESSORS=("context-builder" "config-loader-cache" "prompt-loader" "agent-initializer" "response-formatter")

for processor in "${PROCESSORS[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
      "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/code/processors/${processor}.js")
    echo "   ${processor}.js: HTTP $STATUS"
done

# Test 3: Agent configuration files
echo "3️⃣ Testing agent files..."
CONFIG_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/agents/agent_001/config.json")
echo "   agent_001/config.json: HTTP $CONFIG_STATUS"

PROMPT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/agents/agent_001/prompt.json")
echo "   agent_001/prompt.json: HTTP $PROMPT_STATUS"

# Test 4: Workflow executions log
echo "4️⃣ Testing with full response..."
curl -X POST "https://primary-production-56785.up.railway.app/webhook/work-1001" \
  -H "Content-Type: application/json" \
  -d '{"project_id": "full_diag", "agent_id": "agent_001", "query": "full diagnostic with response"}' \
  --max-time 30 -v 2>&1 | grep -E "(HTTP|error|status)"

echo ""
echo "🏁 DIAGNOSIS COMPLETE"
echo "If webhook returns 200 but empty response, likely issues:"
echo "1. Variables not configured in N8N ($vars.UPTAX_GITHUB_BASE)"
echo "2. Node reference errors (Webhook Enhanced vs Webhook_Work_1001)"
echo "3. Missing agent config files"
echo "4. MCP endpoint connectivity issues"