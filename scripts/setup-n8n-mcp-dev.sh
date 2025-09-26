#!/bin/bash

# 🔧 Setup N8N-MCP-DEV

echo "🚀 Configurando n8n-mcp-dev..."

# Configurar variáveis de ambiente
export N8N_API_URL="https://primary-production-56785.up.railway.app"
export N8N_API_KEY="${1:-YOUR_API_KEY_HERE}"  # Passar API key como argumento

# Verificar se n8n-mcp-server está instalado
if ! command -v n8n-mcp-server &> /dev/null; then
    echo "❌ n8n-mcp-server não instalado. Instalando..."
    npm install -g @leonardsellem/n8n-mcp-server
else
    echo "✅ n8n-mcp-server já instalado"
fi

# Criar arquivo de configuração
cat > ~/.n8n-mcp-config.json << EOF
{
  "apiUrl": "${N8N_API_URL}",
  "apiKey": "${N8N_API_KEY}",
  "timeout": 30000,
  "debug": true
}
EOF

echo "✅ Configuração salva em ~/.n8n-mcp-config.json"

# Testar conexão
echo "🧪 Testando conexão com N8N..."
curl -s -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
     "${N8N_API_URL}/api/v1/workflows" \
     -o /dev/null -w "HTTP Status: %{http_code}\n"

echo ""
echo "📋 Comandos disponíveis:"
echo "  n8n-mcp-server list-workflows"
echo "  n8n-mcp-server get-workflow --id work-1001v1"
echo "  n8n-mcp-server execute --id work-1001v1 --data '{\"project_id\":\"test\"}'"
echo "  n8n-mcp-server get-executions --workflow work-1001v1"
echo ""
echo "🔑 Para usar com API Key diferente:"
echo "  export N8N_API_KEY='sua-api-key'"
echo "  n8n-mcp-server [comando]"