#!/bin/bash

# 🔧 Script para configurar n8n-mcp com sua instância N8N

echo "🚀 Configurando n8n-mcp..."

# Variáveis da sua instância N8N
export N8N_API_URL="https://primary-production-56785.up.railway.app"
export N8N_API_KEY="YOUR_API_KEY"  # Você precisa gerar uma API key no N8N

# Configurar n8n-mcp
npx n8n-mcp configure \
  --url "$N8N_API_URL" \
  --apiKey "$N8N_API_KEY" \
  --verbose

echo "✅ n8n-mcp configurado!"

# Testar conexão
echo "🧪 Testando conexão..."
npx n8n-mcp test-connection

echo "📊 Para usar n8n-mcp:"
echo "npx n8n-mcp workflows list"
echo "npx n8n-mcp workflow get --id work-1001v1"
echo "npx n8n-mcp workflow execute --id work-1001v1"