#!/usr/bin/env node

/**
 * 🧪 Teste do Agente de Referência
 * Testa o workflow criado no N8N: wPy7vu3fF9RY3HfQ
 */

require('dotenv').config();

const N8N_BASE_URL = process.env.N8N_WEBHOOK_URL || 'https://primary-production-56785.up.railway.app';

async function testReferenceAgent() {
    console.log(`
🧪 Testando Agente de Referência
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Base URL: ${N8N_BASE_URL}
Workflow ID: wPy7vu3fF9RY3HfQ
    `);

    // Lista de possíveis paths para testar
    const possiblePaths = [
        '/webhook/general-agent',
        '/webhook/reference-agent',
        '/webhook/test',
        '/webhook/agent',
        '/webhook/wPy7vu3fF9RY3HfQ'
    ];

    const testPayload = {
        agentType: "reference-agent",
        context: {
            userRequest: "Teste do agente de referência - verificar funcionalidade básica",
            sessionId: `test-${Date.now()}`,
            timestamp: new Date().toISOString(),
            testMode: true
        }
    };

    console.log('📊 Payload de teste:');
    console.log(JSON.stringify(testPayload, null, 2));
    console.log('');

    for (const path of possiblePaths) {
        const url = `${N8N_BASE_URL}${path}`;

        try {
            console.log(`📡 Testando: ${path}`);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testPayload),
                timeout: 30000
            });

            if (response.ok) {
                const result = await response.json();
                console.log(`✅ ${path}: SUCESSO!`);
                console.log('📋 Resposta:');
                console.log(JSON.stringify(result, null, 2));
                console.log('');

                return { success: true, path, response: result };
            } else {
                const errorText = await response.text();
                console.log(`❌ ${path}: ${response.status} - ${response.statusText}`);
                if (errorText.length < 200) {
                    console.log(`   Error: ${errorText}`);
                }
            }

        } catch (error) {
            console.log(`💥 ${path}: ${error.message}`);
        }

        console.log('');
    }

    console.log(`
🔍 NENHUM WEBHOOK ATIVO ENCONTRADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Próximos passos:
1. Entre no N8N: ${N8N_BASE_URL}
2. Abra o workflow: wPy7vu3fF9RY3HfQ
3. ATIVE o workflow (toggle no canto superior direito)
4. Execute este teste novamente

Comando: node scripts/test-reference-agent.js
    `);

    return { success: false, message: "Workflow não ativado" };
}

// Função para testar o pipeline completo
async function testFullPipeline() {
    console.log(`
🚀 TESTE DO PIPELINE COMPLETO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

    // 1. Teste do orquestrador local
    console.log('1️⃣ Testando Orquestrador Local...');

    try {
        const orchestratorResponse = await fetch('http://localhost:3000/api/health');
        if (orchestratorResponse.ok) {
            console.log('✅ Orquestrador: Online');
        } else {
            console.log('❌ Orquestrador: Offline');
            console.log('   Execute: node scripts/orchestrator-server.js');
            return;
        }
    } catch (error) {
        console.log('❌ Orquestrador: Não encontrado');
        console.log('   Execute: node scripts/orchestrator-server.js');
        return;
    }

    // 2. Teste do agente de referência
    console.log('\n2️⃣ Testando Agente de Referência...');
    const agentResult = await testReferenceAgent();

    if (!agentResult.success) {
        console.log('❌ Pipeline incompleto: Agente não ativo');
        return;
    }

    // 3. Teste integrado via orquestrador
    console.log('\n3️⃣ Testando Pipeline Integrado...');

    const pipelinePayload = {
        agentType: "general-agent",
        requirements: "Teste do pipeline completo - orquestrador → N8N → resposta",
        timestamp: new Date().toISOString()
    };

    try {
        const pipelineResponse = await fetch('http://localhost:3000/api/orchestrator/blueprint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pipelinePayload)
        });

        if (pipelineResponse.ok) {
            const result = await pipelineResponse.json();
            console.log('✅ Pipeline Integrado: FUNCIONANDO!');
            console.log('📋 Resultado:');
            console.log(JSON.stringify(result, null, 2));
        } else {
            console.log('❌ Pipeline Integrado: Erro na execução');
        }

    } catch (error) {
        console.log('💥 Pipeline Integrado: Falha na conexão');
        console.log(`   Error: ${error.message}`);
    }
}

// Fetch polyfill para Node.js mais antigo
if (!globalThis.fetch) {
    const fetch = require('node-fetch');
    globalThis.fetch = fetch;
}

// Executar testes
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.includes('--full') || args.includes('-f')) {
        testFullPipeline().catch(console.error);
    } else {
        testReferenceAgent().catch(console.error);
    }
}

module.exports = { testReferenceAgent, testFullPipeline };