#!/usr/bin/env node

/**
 * 🚀 Teste do Pipeline Completo com Webhook Enhanced
 * Testa o fluxo: Orquestrador → N8N → Resposta
 */

require('dotenv').config();

const N8N_BASE_URL = process.env.N8N_WEBHOOK_URL || 'https://primary-production-56785.up.railway.app';
const WEBHOOK_PATH = '/webhook/enhanced-v2-final';

async function testWebhookDirect() {
    console.log('📡 1. Testando webhook N8N diretamente...');

    const payload = {
        agentType: "research-agent",
        context: {
            userRequest: "Criar um relatório sobre inteligência artificial",
            sessionId: `test-${Date.now()}`,
            timestamp: new Date().toISOString()
        }
    };

    try {
        const response = await fetch(`${N8N_BASE_URL}${WEBHOOK_PATH}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Webhook respondendo:', result);
            return true;
        } else {
            console.log('❌ Webhook erro:', response.status);
            return false;
        }
    } catch (error) {
        console.log('💥 Erro no webhook:', error.message);
        return false;
    }
}

async function testOrchestrator() {
    console.log('\n📍 2. Testando orquestrador local...');

    try {
        const response = await fetch('http://localhost:3000/api/health');
        if (response.ok) {
            const health = await response.json();
            console.log('✅ Orquestrador online:', health.status);
            return true;
        }
    } catch (error) {
        console.log('❌ Orquestrador offline');
        return false;
    }
    return false;
}

async function testPipelineComplete() {
    console.log('\n🔄 3. Testando pipeline completo...');

    // Teste de otimização
    console.log('   a. Testando otimização de requisitos...');

    const optimizePayload = {
        agentType: "research-software",
        originalRequest: {
            objetivo: "Criar um sistema de análise de dados",
            tecnologias: "Python, Machine Learning"
        },
        isMultimodal: false,
        hasFiles: false
    };

    try {
        const optimizeResponse = await fetch('http://localhost:3000/api/orchestrator/optimize-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(optimizePayload)
        });

        if (optimizeResponse.ok) {
            const optimized = await optimizeResponse.json();
            console.log('   ✅ Otimização funcionando');

            // Teste de blueprint
            console.log('   b. Testando criação de blueprint...');

            const blueprintPayload = {
                agentType: "research-software",
                requirements: optimized.optimizedRequest || optimizePayload.originalRequest,
                timestamp: new Date().toISOString()
            };

            const blueprintResponse = await fetch('http://localhost:3000/api/orchestrator/blueprint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(blueprintPayload)
            });

            if (blueprintResponse.ok) {
                const blueprint = await blueprintResponse.json();
                console.log('   ✅ Blueprint criado');

                // Teste de decomposição
                console.log('   c. Testando decomposição com TaskMaster...');

                const decomposeResponse = await fetch('http://localhost:3000/api/orchestrator/decompose', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(blueprint.blueprint)
                });

                if (decomposeResponse.ok) {
                    const taskPlan = await decomposeResponse.json();
                    console.log('   ✅ TaskMaster funcionando');

                    // Teste de execução com subagentes
                    console.log('   d. Testando execução com subagentes (N8N)...');

                    const executeResponse = await fetch('http://localhost:3000/api/orchestrator/execute', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(taskPlan.taskPlan)
                    });

                    if (executeResponse.ok) {
                        const results = await executeResponse.json();
                        console.log('   ✅ Subagentes executados via N8N!');
                        console.log('\n📊 Resultado da execução:');
                        console.log(JSON.stringify(results.results, null, 2));

                        return true;
                    } else {
                        console.log('   ❌ Falha na execução dos subagentes');
                    }
                } else {
                    console.log('   ❌ Falha na decomposição');
                }
            } else {
                console.log('   ❌ Falha na criação do blueprint');
            }
        } else {
            console.log('   ❌ Falha na otimização');
        }
    } catch (error) {
        console.log('   💥 Erro no pipeline:', error.message);
    }

    return false;
}

async function runAllTests() {
    console.log(`
🧪 TESTE COMPLETO DO PIPELINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Webhook: ${WEBHOOK_PATH}
N8N: ${N8N_BASE_URL}
Orquestrador: http://localhost:3000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

    const results = {
        webhook: await testWebhookDirect(),
        orchestrator: await testOrchestrator(),
        pipeline: false
    };

    if (results.webhook && results.orchestrator) {
        results.pipeline = await testPipelineComplete();
    }

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 RESULTADO FINAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${results.webhook ? '✅' : '❌'} Webhook N8N
${results.orchestrator ? '✅' : '❌'} Orquestrador
${results.pipeline ? '✅' : '❌'} Pipeline Completo

${results.pipeline ? '🎉 PIPELINE FUNCIONANDO END-TO-END!' : '⚠️  Pipeline incompleto'}
    `);

    if (!results.pipeline) {
        console.log(`
Próximos passos:
${!results.webhook ? '• Ativar webhook no N8N' : ''}
${!results.orchestrator ? '• Iniciar orquestrador: node scripts/orchestrator-server.js' : ''}
${results.webhook && results.orchestrator ? '• Verificar logs para identificar o problema' : ''}
        `);
    }

    return results;
}

// Fetch polyfill
if (!globalThis.fetch) {
    const fetch = require('node-fetch');
    globalThis.fetch = fetch;
}

// Executar testes
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = { runAllTests };