#!/bin/bash

# Script de teste otimizado para o workflow corrigido

echo "🧪 TESTE WORKFLOW OTIMIZADO - SPRINT 3"
echo "====================================="

# Test 1: Teste básico com logs detalhados
echo "1️⃣ Teste básico de conectividade..."
curl -X POST "https://primary-production-56785.up.railway.app/webhook/work-1001" \
  -H "Content-Type: application/json" \
  -d '{"project_id": "test_otimizado", "agent_id": "agent_001", "query": "teste workflow corrigido"}' \
  --max-time 45 -s | jq -r '.'

echo ""
echo "2️⃣ Teste com agent diferente..."
curl -X POST "https://primary-production-56785.up.railway.app/webhook/work-1001" \
  -H "Content-Type: application/json" \
  -d '{"project_id": "test_agent2", "agent_id": "agent_002", "query": "teste agent 002"}' \
  --max-time 45 -s | jq -r '.'

echo ""
echo "3️⃣ Teste cache (segunda chamada)..."
curl -X POST "https://primary-production-56785.up.railway.app/webhook/work-1001" \
  -H "Content-Type: application/json" \
  -d '{"project_id": "test_otimizado", "agent_id": "agent_001", "query": "teste cache hit"}' \
  --max-time 45 -s | jq -r '.'

echo ""
echo "4️⃣ Teste payload complexo..."
curl -X POST "https://primary-production-56785.up.railway.app/webhook/work-1001" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "projeto_complexo",
    "agent_id": "agent_research",
    "query": "Faça uma pesquisa sobre IA generativa no Brasil e crie um documento detalhado",
    "context": {
      "user": "teste_usuario",
      "priority": "high"
    }
  }' \
  --max-time 60 -s

echo ""
echo "🎯 ANÁLISE DOS RESULTADOS:"
echo "- Se retornar JSON estruturado = ✅ Workflow funcionando"
echo "- Se retornar vazio = ❌ Ainda há problemas"
echo "- Se timeout = ❌ AI Agent travado ou MCP issues"
echo ""
echo "📝 PRÓXIMOS PASSOS SE FALHAR:"
echo "1. Verificar logs do N8N para Context Builder"
echo "2. Confirmar se Variables foram configuradas"
echo "3. Validar se Response Formatter está executando"