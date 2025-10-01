#!/bin/bash

# Protocolo de Validação GitHub Sync
# Verifica sincronização entre local e GitHub

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 PROTOCOLO DE VALIDAÇÃO GITHUB SYNC${NC}"
echo "==========================================="
echo "Verificando sincronização entre local e repositório"
echo ""

# GitHub base URL
GITHUB_BASE="https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment"

# 1. Verificar CSV Registry
echo -e "${YELLOW}📊 VERIFICANDO CSV REGISTRY${NC}"
echo "URL: ${GITHUB_BASE}/assembly-logic/agents-registry-updated.csv"
csv_response=$(curl -s "${GITHUB_BASE}/assembly-logic/agents-registry-updated.csv")
if echo "$csv_response" | grep -q "agent_id"; then
    echo -e "${GREEN}✅ CSV Registry: OK${NC}"
    agent_count=$(echo "$csv_response" | wc -l)
    echo "   Agentes encontrados: $((agent_count - 1))"
else
    echo -e "${RED}❌ CSV Registry: FALHOU${NC}"
fi
echo ""

# 2. Verificar Componentes Locais vs GitHub
echo -e "${YELLOW}📁 VERIFICANDO COMPONENTES${NC}"

# Lista de componentes criados
components=(
    "library/components/evaluation/csv-agent-loader.js"
    "library/components/evaluation/prepare-agent-ai.js"
    "library/components/evaluation/response-formatter-enhanced.js"
    "library/components/ai-integration/ai-dynamic-validator.js"
    "library/components/ai-integration/ai-error-analyzer.js"
    "library/components/ai-integration/ai-performance-optimizer.js"
    "library/components/ai-integration/ai-test-selector.js"
)

local_exists=0
github_exists=0
github_missing=()

for component in "${components[@]}"; do
    echo -n "Verificando: $(basename "$component")... "
    
    # Verificar local
    if [ -f "$component" ]; then
        local_exists=$((local_exists + 1))
        echo -n "${GREEN}Local✅${NC} "
        
        # Verificar GitHub
        github_url="${GITHUB_BASE}/${component}"
        github_response=$(curl -s "$github_url")
        if echo "$github_response" | grep -q "function\|//" && ! echo "$github_response" | grep -q "404"; then
            github_exists=$((github_exists + 1))
            echo -e "${GREEN}GitHub✅${NC}"
        else
            echo -e "${RED}GitHub❌${NC}"
            github_missing+=("$component")
        fi
    else
        echo -e "${RED}Local❌ GitHub❌${NC}"
    fi
done

echo ""
echo -e "${BLUE}📊 RESUMO DE COMPONENTES${NC}"
echo "Local: ${local_exists}/${#components[@]}"
echo "GitHub: ${github_exists}/${#components[@]}"
echo ""

# 3. Verificar Workflows
echo -e "${YELLOW}⚙️ VERIFICANDO WORKFLOWS${NC}"

workflows=(
    "workflows/work_1001_30_09_2025.json"
    "workflows/ai-metrics-system.json"
    "workflows/evaluation-test-suite-ai-enhanced.json"
)

for workflow in "${workflows[@]}"; do
    echo -n "Workflow: $(basename "$workflow")... "
    if [ -f "$workflow" ]; then
        echo -e "${GREEN}Local✅${NC}"
    else
        echo -e "${RED}Local❌${NC}"
    fi
done
echo ""

# 4. Verificar Scripts
echo -e "${YELLOW}📜 VERIFICANDO SCRIPTS${NC}"

scripts=(
    "scripts/test-complete-observability.sh"
    "scripts/test-n8n-api.sh"
    "scripts/activate-workflows.sh"
)

for script in "${scripts[@]}"; do
    echo -n "Script: $(basename "$script")... "
    if [ -f "$script" ] && [ -x "$script" ]; then
        echo -e "${GREEN}Local✅ Executável✅${NC}"
    elif [ -f "$script" ]; then
        echo -e "${YELLOW}Local✅ Não-executável⚠️${NC}"
    else
        echo -e "${RED}Local❌${NC}"
    fi
done
echo ""

# 5. Status Final
echo -e "${BLUE}🎯 STATUS DE SINCRONIZAÇÃO${NC}"
echo "=============================="

if [ ${#github_missing[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ SINCRONIZAÇÃO COMPLETA${NC}"
    echo "Todos os componentes estão sincronizados com GitHub"
else
    echo -e "${RED}⚠️ SINCRONIZAÇÃO PENDENTE${NC}"
    echo "Componentes ausentes no GitHub:"
    for missing in "${github_missing[@]}"; do
        echo "  - $missing"
    done
    echo ""
    echo -e "${YELLOW}📋 AÇÕES NECESSÁRIAS:${NC}"
    echo "1. Fazer commit dos componentes ausentes"
    echo "2. Push para branch clean-deployment"
    echo "3. Re-executar validação"
fi

echo ""
echo -e "${BLUE}📋 PRÓXIMOS PASSOS - PROTOCOLO DE HOMOLOGAÇÃO${NC}"
echo "1. Commit & Push componentes ausentes"
echo "2. Ativar workflow work_1001 no N8N"
echo "3. Executar testes de homologação"
echo "4. Validar performance em produção"
echo "5. Documentar entrega final"
echo ""

echo -e "${GREEN}🔍 Validação GitHub Sync Concluída${NC}"