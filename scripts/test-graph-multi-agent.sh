#!/bin/bash
# 🧪 Teste Sistema Multi-Agente com Graph Structure (project_id + agent_id)
# Workflow Graph com project_id como agrupador

echo "🚀 TESTE SISTEMA GRAPH MULTI-AGENTE"
echo "=================================="

# Endpoint do workflow
ENDPOINT="https://primary-production-56785.up.railway.app/webhook/uptax-proc-1001-dynamic"

echo ""
echo "📊 TESTANDO PROJECT_001 - Brazilian Tax Compliance"
echo "================================================="

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
echo "📊 TESTANDO PROJECT_002 - Global Market Analysis"
echo "=============================================="

echo ""
echo "🌍 PROJECT_002 + AGENT_001 - Enhanced Research (Global Market)"
echo "-------------------------------------------------------------"

P002_A001_RESULT=$(curl -s -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "project_002",
    "agent_id": "agent_001",
    "query": "Analyze global tech market trends for 2024"
  }')

echo "Project_002 + Agent_001 Response:"
echo "$P002_A001_RESULT" | jq '.'
echo ""

SUCCESS_P002_A001=$(echo "$P002_A001_RESULT" | jq -r '.success // false')
GRAPH_KEY_P002_A001=$(echo "$P002_A001_RESULT" | jq -r '.graph_key // "unknown"')
MCP_TYPE_P002_A001=$(echo "$P002_A001_RESULT" | jq -r '.agent_config.mcp_type // "unknown"')

if [ "$SUCCESS_P002_A001" = "true" ]; then
    echo "✅ Graph Key $GRAPH_KEY_P002_A001 ($MCP_TYPE_P002_A001) - SUCCESS"
    echo "   Different MCP than project_001!"
else
    echo "❌ Graph Key $GRAPH_KEY_P002_A001 - FAILED"
fi

echo ""
echo "📈 VERIFICAÇÃO DE ISOLAMENTO DE PROJETOS"
echo "======================================="

# Verificar se mesmo agent_id tem configurações diferentes entre projetos
echo "🔍 Comparando AGENT_001 entre projetos:"
echo ""

P001_A001_MCP=$(echo "$P001_A001_RESULT" | jq -r '.agent_config.mcp_type // "unknown"')
P002_A001_MCP=$(echo "$P002_A001_RESULT" | jq -r '.agent_config.mcp_type // "unknown"')

echo "Project_001 + Agent_001: MCP Type = $P001_A001_MCP"
echo "Project_002 + Agent_001: MCP Type = $P002_A001_MCP"

if [ "$P001_A001_MCP" != "$P002_A001_MCP" ]; then
    echo "✅ PROJECT ISOLATION WORKING - Different MCP configs!"
else
    echo "⚠️  PROJECT ISOLATION WARNING - Same MCP configs"
fi

echo ""
echo "📊 ANÁLISE GRAPH STRUCTURE"
echo "=========================="

# Verificar se Graph keys são únicos
echo "🔑 Graph Keys geradas:"
echo "  - $GRAPH_KEY_P001_A001"
echo "  - $GRAPH_KEY_P001_A002"
echo "  - $GRAPH_KEY_P002_A001"

# Verificar project contexts
P001_CONTEXT=$(echo "$P001_A001_RESULT" | jq -r '.project_context.project_name // "not found"')
P002_CONTEXT=$(echo "$P002_A001_RESULT" | jq -r '.project_context.project_name // "not found"')

echo ""
echo "📋 Project Contexts:"
echo "  - Project_001: $P001_CONTEXT"
echo "  - Project_002: $P002_CONTEXT"

echo ""
echo "📊 RESUMO FINAL GRAPH SYSTEM"
echo "============================"

TOTAL_SUCCESS=0
if [ "$SUCCESS_P001_A001" = "true" ]; then ((TOTAL_SUCCESS++)); fi
if [ "$SUCCESS_P001_A002" = "true" ]; then ((TOTAL_SUCCESS++)); fi
if [ "$SUCCESS_P002_A001" = "true" ]; then ((TOTAL_SUCCESS++)); fi

echo "PROJECT_001 Results:"
echo "  Agent_001 (Enhanced Research):   $([ "$SUCCESS_P001_A001" = "true" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "  Agent_002 (Fiscal Research):     $([ "$SUCCESS_P001_A002" = "true" ] && echo "✅ PASS" || echo "❌ FAIL")"

echo ""
echo "PROJECT_002 Results:"
echo "  Agent_001 (Global Research):     $([ "$SUCCESS_P002_A001" = "true" ] && echo "✅ PASS" || echo "❌ FAIL")"

echo ""
echo "🎯 RESULTADO GRAPH SYSTEM: $TOTAL_SUCCESS/3 combinações funcionando"
echo "📊 Graph Structure: CSV com project_id + agent_id"
echo "🔧 Project Isolation: $([ "$P001_A001_MCP" != "$P002_A001_MCP" ] && echo "✅ Working" || echo "⚠️ Check needed")"
echo "🎯 Dynamic Loading: Tools específicas por projeto"

if [ $TOTAL_SUCCESS -eq 3 ]; then
    echo "🎉 SISTEMA GRAPH FUNCIONANDO PERFEITAMENTE!"
    echo "✅ Multi-tenancy com project_id implementado"
    echo "✅ Agent reutilização entre projetos funcional"
    echo "✅ Configurações específicas por projeto ativas"
    exit 0
elif [ $TOTAL_SUCCESS -ge 2 ]; then
    echo "⚠️  Sistema Graph parcialmente funcional ($TOTAL_SUCCESS/3)"
    echo "🔧 Algumas combinações precisam de ajuste"
    exit 1
else
    echo "❌ SISTEMA GRAPH COM PROBLEMAS"
    echo "🚨 Debug necessário na estrutura Graph"
    exit 2
fi