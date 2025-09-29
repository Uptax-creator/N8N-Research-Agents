#!/bin/bash

# 🧪 TESTE MICRO ATIVIDADE - GitHub-First Real

echo "🧪 Iniciando teste da micro atividade..."

# Verificar se os arquivos foram commitados
echo "📋 Verificando arquivos no GitHub..."

echo "1. Config Agent:"
curl -s "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/configs/agents/agent_001_micro_test.json" | head -5

echo ""
echo "2. CSV Registry (última linha):"
curl -s "https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/assembly-logic/agents-registry-updated.csv" | tail -1

echo ""
echo "📋 PAYLOAD DE TESTE:"

# Payload para teste
PAYLOAD='{
  "project_id": "micro_test",
  "agent_id": "agent_micro_test",
  "ID_workflow": "MICRO_TEST_001",
  "query": "teste busca GitHub real"
}'

echo "$PAYLOAD" | jq .

echo ""
echo "🚀 Execute este payload no webhook work-1001v1 para testar:"
echo ""
echo "Webhook URL: https://primary-production-56785.up.railway.app/webhook/scJSDgRWiHTkfNUn"
echo ""
echo "curl -X POST \"https://primary-production-56785.up.railway.app/webhook/scJSDgRWiHTkfNUn\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '$PAYLOAD'"

echo ""
echo "✅ Critérios de sucesso:"
echo "  - Response mostra agent_name: 'Micro Test Agent'"
echo "  - github_integration: true"
echo "  - config_loaded_from_github: true"
echo "  - csv_registry_accessed: true"

echo ""
echo "🎯 Para aplicar no N8N:"
echo "  1. Copie o código de NODE_2_GITHUB_REAL.md"
echo "  2. Cole no Node 2 (Code Node) do workflow work-1001v1"
echo "  3. Teste com o payload acima"