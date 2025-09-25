#!/bin/bash
# 🧪 Teste Sistema Multi-Agente com Graph Structure (project_id + agent_id)
# Workflow Graph com project_id como agrupador

echo "🚀 TESTE SISTEMA GRAPH MULTI-AGENTE"
echo "=================================="

# Endpoint do workflow
ENDPOINT="https://primary-production-56785.up.railway.app/webhook/uptax-proc-1001-dynamic"

echo ""
echo "📊 TESTANDO WORKFLOW uptax-proc-1001-dynamic"
echo "============================================="
echo "PROJECT_001 - Brazilian Tax Compliance"

echo ""
echo "🔍 PROJECT_001 + AGENT_001 - Enhanced Research (Brazilian Market)"
echo "----------------------------------------------------------------"

P001_A001_RESULT=$(curl -s -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "project_001",
    "agent_id": "agent_001",
    "query": "Analise o mercado brasileiro de tecnologia em 2024"
  }')

echo "Project_001 + Agent_001 Response:"
echo "$P001_A001_RESULT" | jq '.'
echo ""

SUCCESS_P001_A001=$(echo "$P001_A001_RESULT" | jq -r '.success // false')
GRAPH_KEY_P001_A001=$(echo "$P001_A001_RESULT" | jq -r '.graph_key // "unknown"')
PROJECT_CONTEXT_P001_A001=$(echo "$P001_A001_RESULT" | jq -r '.project_context.project_name // "unknown"')

if [ "$SUCCESS_P001_A001" = "true" ]; then
    echo "✅ Graph Key $GRAPH_KEY_P001_A001 - SUCCESS"
    echo "   Project Context: $PROJECT_CONTEXT_P001_A001"
else
    echo "❌ Graph Key $GRAPH_KEY_P001_A001 - FAILED"
fi

echo ""
echo "🏛️ PROJECT_001 + AGENT_002 - Fiscal Research (Tax Law)"
echo "-----------------------------------------------------"

P001_A002_RESULT=$(curl -s -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "project_001",
    "agent_id": "agent_002",
    "query": "Explique as mudanças no ICMS para 2024"
  }')

echo "Project_001 + Agent_002 Response:"
echo "$P001_A002_RESULT" | jq '.'
echo ""

SUCCESS_P001_A002=$(echo "$P001_A002_RESULT" | jq -r '.success // false')
GRAPH_KEY_P001_A002=$(echo "$P001_A002_RESULT" | jq -r '.graph_key // "unknown"')
MCP_TYPE_P001_A002=$(echo "$P001_A002_RESULT" | jq -r '.agent_config.mcp_type // "unknown"')

if [ "$SUCCESS_P001_A002" = "true" ]; then
    echo "✅ Graph Key $GRAPH_KEY_P001_A002 ($MCP_TYPE_P001_A002) - SUCCESS"
else
    echo "❌ Graph Key $GRAPH_KEY_P001_A002 - FAILED"
fi

echo ""
echo "📄 PROJECT_001 + AGENT_003 - GDocs Documentation"
echo "-----------------------------------------------"

P001_A003_RESULT=$(curl -s -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "project_001",
    "agent_id": "agent_003",
    "query": "Crie um relatório de compliance fiscal para ICMS"
  }')

echo "Project_001 + Agent_003 Response:"
echo "$P001_A003_RESULT" | jq '.'
echo ""

SUCCESS_P001_A003=$(echo "$P001_A003_RESULT" | jq -r '.success // false')
GRAPH_KEY_P001_A003=$(echo "$P001_A003_RESULT" | jq -r '.graph_key // "unknown"')

if [ "$SUCCESS_P001_A003" = "true" ]; then
    echo "✅ Graph Key $GRAPH_KEY_P001_A003 - SUCCESS"
else
    echo "❌ Graph Key $GRAPH_KEY_P001_A003 - FAILED"
fi

echo ""
echo "📈 VERIFICAÇÃO WORKFLOW MVP"
echo "=========================="

echo "🔑 Graph Keys geradas no workflow uptax-proc-1001-dynamic:"
echo "  - $GRAPH_KEY_P001_A001 (Enhanced Research)"
echo "  - $GRAPH_KEY_P001_A002 (Fiscal Research)"
echo "  - $GRAPH_KEY_P001_A003 (GDocs Documentation)"

# Verificar project context
P001_CONTEXT=$(echo "$P001_A001_RESULT" | jq -r '.project_context.project_name // "not found"')

echo ""
echo "📋 Project Context:"
echo "  - Project_001: $P001_CONTEXT"
echo "  - Workflow: uptax-proc-1001-dynamic"

echo ""
echo "📊 RESUMO MVP WORKFLOW uptax-proc-1001-dynamic"
echo "=============================================="

TOTAL_SUCCESS=0
if [ "$SUCCESS_P001_A001" = "true" ]; then ((TOTAL_SUCCESS++)); fi
if [ "$SUCCESS_P001_A002" = "true" ]; then ((TOTAL_SUCCESS++)); fi
if [ "$SUCCESS_P001_A003" = "true" ]; then ((TOTAL_SUCCESS++)); fi

echo "UPTAX-PROC-1001-DYNAMIC Results:"
echo "  Agent_001 (Enhanced Research):   $([ "$SUCCESS_P001_A001" = "true" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "  Agent_002 (Fiscal Research):     $([ "$SUCCESS_P001_A002" = "true" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "  Agent_003 (GDocs Documentation): $([ "$SUCCESS_P001_A003" = "true" ] && echo "✅ PASS" || echo "❌ FAIL")"

echo ""
echo "🎯 RESULTADO MVP: $TOTAL_SUCCESS/3 agents funcionando"
echo "📊 Graph Structure: CSV com workflow_id + project_id + agent_id"
echo "🔧 Workflow Isolation: Preparado para uptax-proc-1002-dynamic"
echo "🎯 Dynamic Loading: MCP endpoints e tools por projeto"

if [ $TOTAL_SUCCESS -eq 3 ]; then
    echo "🎉 MVP WORKFLOW FUNCIONANDO PERFEITAMENTE!"
    echo "✅ Sistema Graph implementado"
    echo "✅ Todos os 3 agents funcionais"
    echo "✅ Pronto para duplicação em uptax-proc-1002-dynamic"
    exit 0
elif [ $TOTAL_SUCCESS -ge 2 ]; then
    echo "⚠️  MVP parcialmente funcional ($TOTAL_SUCCESS/3)"
    echo "🔧 Alguns agents precisam de ajuste antes da duplicação"
    exit 1
else
    echo "❌ MVP COM PROBLEMAS"
    echo "🚨 Debug necessário antes de prosseguir"
    exit 2
fi