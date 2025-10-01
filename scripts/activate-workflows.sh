#!/bin/bash

# Activate N8N Workflows Script
# Ativa workflows no N8N via API

set -e

# Configuration
N8N_API_URL="https://primary-production-56785.up.railway.app"
N8N_API_KEY="n8n_api_f19b0f31c0c7f587e17f09e27501b0ad03bc4ea1a40e56e088f8f3ae04bebe80f16aeaf1"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 Starting N8N Workflow Activation${NC}"
echo "================================"

# Function to activate workflow
activate_workflow() {
    local workflow_id=$1
    local workflow_name=$2
    
    echo -e "\n${YELLOW}📌 Activating: ${workflow_name}${NC}"
    
    response=$(curl -s -X PATCH \
        "${N8N_API_URL}/api/v1/workflows/${workflow_id}" \
        -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
        -H "Content-Type: application/json" \
        -d '{"active": true}' 2>&1)
    
    if echo "$response" | grep -q '"active":true'; then
        echo -e "${GREEN}✅ Successfully activated${NC}"
    else
        echo -e "${RED}❌ Failed to activate${NC}"
        echo "Response: $response"
    fi
}

# Get all workflows
echo -e "\n${YELLOW}📋 Fetching workflows...${NC}"
workflows=$(curl -s -X GET \
    "${N8N_API_URL}/api/v1/workflows" \
    -H "X-N8N-API-KEY: ${N8N_API_KEY}" 2>&1)

# Check if we got workflows
if echo "$workflows" | grep -q '"data"'; then
    # Parse and activate key workflows
    echo "$workflows" | python3 -c "
import json
import sys

data = json.load(sys.stdin)
for workflow in data.get('data', []):
    if 'evaluation' in workflow['name'].lower() or 'ai' in workflow['name'].lower() or 'baseline' in workflow['name'].lower():
        print(f\"{workflow['id']}|{workflow['name']}|{workflow.get('active', False)}\")
" | while IFS='|' read -r id name active; do
        if [ "$active" = "False" ]; then
            activate_workflow "$id" "$name"
        else
            echo -e "${GREEN}✓ Already active: ${name}${NC}"
        fi
    done
else
    echo -e "${RED}❌ Failed to fetch workflows${NC}"
    echo "Response: $workflows"
    exit 1
fi

echo -e "\n${GREEN}✨ Workflow activation complete!${NC}"
echo "================================"