#!/bin/bash

# 🧪 TESTE BASELINE OBSERVABLE - SPRINT 1
# Script para validar workflow baseline com observabilidade

echo "🚀 INICIANDO TESTE BASELINE OBSERVABLE..."

# Configuração
N8N_URL="https://primary-production-56785.up.railway.app"
WEBHOOK_ENDPOINT="/webhook/baseline-test"
FULL_URL="${N8N_URL}${WEBHOOK_ENDPOINT}"

echo "📡 Endpoint: $FULL_URL"
echo ""

# Teste 1: Baseline com agent_micro_test
echo "🧪 TESTE 1: Agent Micro Test"
echo "----------------------------------------"

TEST_1_PAYLOAD='{
  "agent_id": "agent_micro_test",
  "query": "Teste baseline observabilidade Sprint 1",
  "format": "json",
  "test_mode": true
}'

echo "📤 Payload:"
echo "$TEST_1_PAYLOAD" | jq .
echo ""

echo "⏱️ Executando request..."
RESPONSE_1=$(curl -s -X POST "$FULL_URL" \
  -H "Content-Type: application/json" \
  -d "$TEST_1_PAYLOAD" \
  -w "\n🕐 Response Time: %{time_total}s\n📊 HTTP Status: %{http_code}\n")

echo "📥 Response:"
echo "$RESPONSE_1" | head -n -2 | jq .
echo ""
echo "$RESPONSE_1" | tail -n 2
echo ""
echo "----------------------------------------"

# Teste 2: Baseline com agent_001
echo "🧪 TESTE 2: Agent 001"
echo "----------------------------------------"

TEST_2_PAYLOAD='{
  "agent_id": "agent_001",
  "query": "Pesquisa sobre IA no contexto brasileiro",
  "format": "json",
  "test_mode": true
}'

echo "📤 Payload:"
echo "$TEST_2_PAYLOAD" | jq .
echo ""

echo "⏱️ Executando request..."
RESPONSE_2=$(curl -s -X POST "$FULL_URL" \
  -H "Content-Type: application/json" \
  -d "$TEST_2_PAYLOAD" \
  -w "\n🕐 Response Time: %{time_total}s\n📊 HTTP Status: %{http_code}\n")

echo "📥 Response:"
echo "$RESPONSE_2" | head -n -2 | jq .
echo ""
echo "$RESPONSE_2" | tail -n 2
echo ""
echo "----------------------------------------"

# Análise de resultados
echo "📊 ANÁLISE DE RESULTADOS:"
echo "----------------------------------------"

# Extrair dados dos responses para análise
SUCCESS_1=$(echo "$RESPONSE_1" | head -n -2 | jq -r '.success // false')
SUCCESS_2=$(echo "$RESPONSE_2" | head -n -2 | jq -r '.success // false')

DURATION_1=$(echo "$RESPONSE_1" | head -n -2 | jq -r '.performance.duration_ms // 0')
DURATION_2=$(echo "$RESPONSE_2" | head -n -2 | jq -r '.performance.duration_ms // 0')

echo "✅ Teste 1 (agent_micro_test): $SUCCESS_1 | Duração: ${DURATION_1}ms"
echo "✅ Teste 2 (agent_001): $SUCCESS_2 | Duração: ${DURATION_2}ms"
echo ""

# Critérios de sucesso Sprint 1
echo "🎯 CRITÉRIOS DE SUCESSO SPRINT 1:"
echo "----------------------------------------"

# 1. Webhook receiving data
if [[ "$SUCCESS_1" == "true" && "$SUCCESS_2" == "true" ]]; then
  echo "✅ Webhook receiving data: PASS"
else
  echo "❌ Webhook receiving data: FAIL"
fi

# 2. SSV structure created
SSV_1=$(echo "$RESPONSE_1" | head -n -2 | jq -r '.node_validations.node_1_agent_info.ssv_created // false')
SSV_2=$(echo "$RESPONSE_2" | head -n -2 | jq -r '.node_validations.node_1_agent_info.ssv_created // false')

if [[ "$SSV_1" == "true" && "$SSV_2" == "true" ]]; then
  echo "✅ SSV structure created: PASS"
else
  echo "❌ SSV structure created: FAIL"
fi

# 3. GitHub integration
GITHUB_1=$(echo "$RESPONSE_1" | head -n -2 | jq -r '.data_flow.github_integration // false')
GITHUB_2=$(echo "$RESPONSE_2" | head -n -2 | jq -r '.data_flow.github_integration // false')

if [[ "$GITHUB_1" == "true" && "$GITHUB_2" == "true" ]]; then
  echo "✅ GitHub integration: PASS"
else
  echo "❌ GitHub integration: FAIL (esperado para agent_001)"
fi

# 4. Performance < 5s
if [[ "$DURATION_1" -lt 5000 && "$DURATION_2" -lt 5000 ]]; then
  echo "✅ Performance < 5s: PASS"
else
  echo "❌ Performance < 5s: FAIL"
fi

# 5. Observabilidade completa
OBSERVABILITY_1=$(echo "$RESPONSE_1" | head -n -2 | jq -r '.node_validations // empty' | wc -l)
OBSERVABILITY_2=$(echo "$RESPONSE_2" | head -n -2 | jq -r '.node_validations // empty' | wc -l)

if [[ "$OBSERVABILITY_1" -gt 0 && "$OBSERVABILITY_2" -gt 0 ]]; then
  echo "✅ 100% observabilidade: PASS"
else
  echo "❌ 100% observabilidade: FAIL"
fi

echo ""
echo "🏁 TESTE BASELINE OBSERVABLE FINALIZADO!"
echo "📋 Próximo: Implementar Nodes 3 (Cache) para Sprint 2"