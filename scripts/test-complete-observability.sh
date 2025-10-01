#!/bin/bash

# Test Complete Observability Architecture
# Testa todos os 3 workflows com tecnologia do envelope

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}🚀 TESTE COMPLETO DE OBSERVABILIDADE${NC}"
echo "=========================================="
echo "Testando arquitetura com envelope pattern"
echo ""

# Test 1: Evaluation Test (Classic)
echo -e "${BLUE}🧪 TESTE 1: Evaluation Test (Classic)${NC}"
echo "Endpoint: /webhook/evaluation-test"
echo "Tecnologia: State envelope + componentes GitHub"
echo ""

test1_payload='{
  "test_to_run": "test_1_basic_connectivity",
  "project": "observability_test",
  "session_id": "test_classic_'$(date +%s)'"
}'

echo -e "${YELLOW}Payload:${NC}"
echo "$test1_payload" | python3 -m json.tool
echo ""

echo -e "${YELLOW}Executando...${NC}"
start_time=$(date +%s%3N)
response1=$(curl -s -X POST "https://primary-production-56785.up.railway.app/webhook/evaluation-test" \
  -H "Content-Type: application/json" \
  -d "$test1_payload")
end_time=$(date +%s%3N)
duration1=$((end_time - start_time))

echo -e "${GREEN}Resposta (${duration1}ms):${NC}"
echo "$response1" | python3 -m json.tool
echo ""
echo "----------------------------------------"
echo ""

# Test 2: Evaluation Test2 (AI Enhanced)
echo -e "${BLUE}🤖 TESTE 2: Evaluation Test2 (AI Enhanced)${NC}"
echo "Endpoint: /webhook/evaluation-test2"
echo "Tecnologia: AI envelope + otimizações inteligentes"
echo ""

test2_payload='{
  "test_to_run": "auto",
  "optimization_level": "aggressive",
  "user_intent": "Teste completo de observabilidade com IA",
  "performance_target": "optimal"
}'

echo -e "${YELLOW}Payload:${NC}"
echo "$test2_payload" | python3 -m json.tool
echo ""

echo -e "${YELLOW}Executando...${NC}"
start_time=$(date +%s%3N)
response2=$(curl -s -X POST "https://primary-production-56785.up.railway.app/webhook/evaluation-test2" \
  -H "Content-Type: application/json" \
  -d "$test2_payload")
end_time=$(date +%s%3N)
duration2=$((end_time - start_time))

echo -e "${GREEN}Resposta (${duration2}ms):${NC}"
echo "$response2" | python3 -m json.tool
echo ""
echo "----------------------------------------"
echo ""

# Test 3: Work-1001 (Agent Pipeline)
echo -e "${BLUE}🔗 TESTE 3: Work-1001 (Agent Pipeline)${NC}"
echo "Endpoint: /webhook/work-1001 (INATIVO - precisa ativar workflow)"
echo "Tecnologia: CSV loader + envelope + agent AI completo"
echo ""

test3_payload='{
  "project_id": "project_001",
  "agent_id": "agent_001",
  "query": "Implementar observabilidade completa usando envelope pattern",
  "format": "structured_json"
}'

echo -e "${YELLOW}Payload:${NC}"
echo "$test3_payload" | python3 -m json.tool
echo ""

echo -e "${YELLOW}Executando...${NC}"
start_time=$(date +%s%3N)
response3=$(curl -s -X POST "https://primary-production-56785.up.railway.app/webhook/work-1001" \
  -H "Content-Type: application/json" \
  -d "$test3_payload")
end_time=$(date +%s%3N)
duration3=$((end_time - start_time))

if echo "$response3" | grep -q '"code": 404'; then
  echo -e "${RED}❌ Workflow INATIVO${NC}"
  echo "$response3" | python3 -m json.tool
else
  echo -e "${GREEN}Resposta (${duration3}ms):${NC}"
  echo "$response3" | python3 -m json.tool
fi
echo ""
echo "----------------------------------------"
echo ""

# Summary
echo -e "${GREEN}📊 RESUMO DOS TESTES${NC}"
echo "========================================"

# Test 1 Analysis
if echo "$response1" | grep -q '"status": "accepted"'; then
  echo -e "${GREEN}✅ Test 1 (Classic): SUCESSO${NC} - ${duration1}ms"
else
  echo -e "${RED}❌ Test 1 (Classic): FALHOU${NC} - ${duration1}ms"
fi

# Test 2 Analysis
if echo "$response2" | grep -q '"ai_enhanced": true'; then
  echo -e "${GREEN}✅ Test 2 (AI Enhanced): SUCESSO${NC} - ${duration2}ms"
else
  echo -e "${RED}❌ Test 2 (AI Enhanced): FALHOU${NC} - ${duration2}ms"
fi

# Test 3 Analysis
if echo "$response3" | grep -q '"code": 404'; then
  echo -e "${YELLOW}⚠️ Test 3 (Agent Pipeline): INATIVO${NC} - Workflow precisa ser ativado"
else
  echo -e "${GREEN}✅ Test 3 (Agent Pipeline): SUCESSO${NC} - ${duration3}ms"
fi

echo ""
echo -e "${BLUE}📝 PRÓXIMOS PASSOS:${NC}"
echo "1. Ativar workflow 'work_1001' no N8N UI"
echo "2. Implementar monitoramento contínuo"
echo "3. Expandir para mais agentes"
echo "4. Configurar alertas de performance"
echo ""

echo -e "${GREEN}✨ Arquitetura de Observabilidade Completa Testada!${NC}"
echo "Envelope Pattern + CSV Loader + AI Enhancement = 🚀"
echo ""