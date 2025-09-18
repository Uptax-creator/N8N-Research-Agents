#!/usr/bin/env node

/**
 * 🧪 Teste de Conectividade N8N Webhooks
 * Valida se todos os webhooks necessários estão funcionando
 */

require('dotenv').config();

const N8N_BASE_URL = process.env.N8N_WEBHOOK_URL || 'https://primary-production-56785.up.railway.app';

const webhooks = [
    'general-agent',
    'research-agent',
    'business-agent',
    'technical-agent'
];

async function testWebhook(webhookName) {
    const url = `${N8N_BASE_URL}/webhook/${webhookName}`;
    const testPayload = {
        agentType: webhookName,
        context: {
            userRequest: `Teste de conectividade para ${webhookName}`,
            sessionId: `test-${Date.now()}`,
            timestamp: new Date().toISOString()
        }
    };

    try {
        console.log(`📡 Testando: ${webhookName}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testPayload),
            timeout: 10000
        });

        if (response.ok) {
            const result = await response.json();
            console.log(`✅ ${webhookName}: OK`);
            console.log(`   Response:`, result);
            return { webhook: webhookName, status: 'success', response: result };
        } else {
            console.log(`❌ ${webhookName}: ${response.status} - ${response.statusText}`);
            return { webhook: webhookName, status: 'error', error: `${response.status}` };
        }

    } catch (error) {
        console.log(`💥 ${webhookName}: ${error.message}`);
        return { webhook: webhookName, status: 'failed', error: error.message };
    }
}

async function runTests() {
    console.log(`
🧪 Testando Webhooks N8N
━━━━━━━━━━━━━━━━━━━━━━━━━━
Base URL: ${N8N_BASE_URL}
    `);

    const results = [];

    for (const webhook of webhooks) {
        const result = await testWebhook(webhook);
        results.push(result);
        console.log(''); // linha em branco
    }

    // Summary
    console.log(`
📊 RESULTADO DOS TESTES
━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

    const successful = results.filter(r => r.status === 'success');
    const failed = results.filter(r => r.status !== 'success');

    console.log(`✅ Sucessos: ${successful.length}/${results.length}`);
    if (successful.length > 0) {
        successful.forEach(r => console.log(`   • ${r.webhook}`));
    }

    console.log(`❌ Falhas: ${failed.length}/${results.length}`);
    if (failed.length > 0) {
        failed.forEach(r => console.log(`   • ${r.webhook}: ${r.error}`));
    }

    if (failed.length === 0) {
        console.log(`
🎉 TODOS OS WEBHOOKS FUNCIONANDO!
Você pode testar o orquestrador completo agora.
        `);
    } else {
        console.log(`
🔧 AÇÃO NECESSÁRIA:
1. Entre no N8N: ${N8N_BASE_URL}
2. Crie workflows para os webhooks com falha
3. Ative os workflows
4. Execute este teste novamente

Guia completo: docs/N8N_WEBHOOK_SETUP_GUIDE.md
        `);
    }

    return results;
}

// Fetch polyfill para Node.js mais antigo
if (!globalThis.fetch) {
    const fetch = require('node-fetch');
    globalThis.fetch = fetch;
}

// Executar testes
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { testWebhook, runTests };