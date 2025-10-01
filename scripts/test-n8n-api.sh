#!/bin/bash

# Test N8N API Connection

N8N_URL="https://primary-production-56785.up.railway.app"
API_KEY="n8n_api_f19b0f31c0c7f587e17f09e27501b0ad03bc4ea1a40e56e088f8f3ae04bebe80f16aeaf1"

echo "🔍 Testing N8N API Connection..."
echo "================================"

# Test 1: Basic API connectivity
echo -e "\n🧪 Test 1: API Health Check"
curl -s -X GET "${N8N_URL}/healthz" | python3 -m json.tool || echo "No healthz endpoint"

# Test 2: Workflows endpoint with proper header
echo -e "\n📋 Test 2: List Workflows"
response=$(curl -s -X GET "${N8N_URL}/api/v1/workflows" \
    -H "X-N8N-API-KEY: ${API_KEY}" 2>&1)

if echo "$response" | grep -q '"data"'; then
    echo "✅ API connection successful!"
    echo "$response" | python3 -c "
import json
import sys
data = json.load(sys.stdin)
print(f\"Found {len(data.get('data', []))} workflows\")
for wf in data.get('data', [])[:5]:
    print(f\"  - {wf['name']} (ID: {wf['id']}, Active: {wf.get('active', False)})\")
"
else
    echo "❌ API connection failed"
    echo "Response: $response"
fi

# Test 3: Check webhook endpoints
echo -e "\n🌐 Test 3: Webhook Endpoints"
for endpoint in "baseline-test" "evaluation/test" "ai-metrics"; do
    echo -n "  Testing /webhook/${endpoint}: "
    status=$(curl -s -o /dev/null -w "%{http_code}" "${N8N_URL}/webhook/${endpoint}")
    if [ "$status" = "404" ]; then
        echo "🔴 Not found (workflow inactive?)"
    elif [ "$status" = "200" ] || [ "$status" = "201" ]; then
        echo "🟢 Active"
    else
        echo "🟡 Status: $status"
    fi
done

echo -e "\n✨ API test complete!"