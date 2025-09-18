#!/usr/bin/env node

/**
 * 🔍 Monitor de Ativação do Workflow
 * Monitora continuamente até que o workflow seja ativado
 */

require('dotenv').config();

const { testReferenceAgent, testFullPipeline } = require('./test-reference-agent.js');

const POLL_INTERVAL = 5000; // 5 segundos
const MAX_ATTEMPTS = 60; // 5 minutos máximo

async function monitorActivation() {
    console.log(`
🔍 MONITOR DE ATIVAÇÃO DO WORKFLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Workflow ID: wPy7vu3fF9RY3HfQ
Verificando a cada ${POLL_INTERVAL/1000}s por até ${MAX_ATTEMPTS * POLL_INTERVAL/1000/60} minutos...

📋 INSTRUÇÕES PARA ATIVAÇÃO:
1. Abra: https://primary-production-56785.up.railway.app
2. Navegue para o workflow: wPy7vu3fF9RY3HfQ
3. Clique no toggle ATIVO (canto superior direito)
4. Aguarde este monitor detectar a ativação

Monitorando...
    `);

    let attempts = 0;

    while (attempts < MAX_ATTEMPTS) {
        attempts++;
        const timestamp = new Date().toLocaleTimeString();

        try {
            console.log(`[${timestamp}] Tentativa ${attempts}/${MAX_ATTEMPTS} - Verificando...`);

            const result = await testReferenceAgent();

            if (result.success) {
                console.log(`
🎉 WORKFLOW ATIVADO COM SUCESSO!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Webhook ativo: ${result.path}
Tempo até ativação: ${attempts * POLL_INTERVAL/1000} segundos

📋 Resposta do agente:
${JSON.stringify(result.response, null, 2)}

🚀 Executando teste completo do pipeline...
                `);

                // Agora testar o pipeline completo
                await testFullPipeline();
                return true;
            }

            // Aguardar antes da próxima tentativa
            await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));

        } catch (error) {
            console.log(`[${timestamp}] Erro na verificação: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
        }
    }

    console.log(`
⏰ TIMEOUT ATINGIDO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
O workflow não foi ativado em ${MAX_ATTEMPTS * POLL_INTERVAL/1000/60} minutos.

Verifique:
1. Se você fez login no N8N
2. Se o workflow wPy7vu3fF9RY3HfQ existe
3. Se clicou no toggle de ativação
4. Se não há erros no workflow

Execute novamente: node scripts/monitor-workflow-activation.js
    `);

    return false;
}

// Função para verificar orquestrador
async function checkOrchestrator() {
    try {
        const response = await fetch('http://localhost:3000/api/health');
        if (response.ok) {
            console.log('✅ Orquestrador: Online');
            return true;
        }
    } catch (error) {
        console.log('❌ Orquestrador: Offline');
        console.log('   Iniciando orquestrador...');

        // Tentar iniciar o orquestrador
        const { spawn } = require('child_process');
        const orchestrator = spawn('node', ['scripts/orchestrator-server.js'], {
            detached: false,
            stdio: 'inherit'
        });

        // Aguardar um pouco para o servidor iniciar
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Verificar novamente
        try {
            const retryResponse = await fetch('http://localhost:3000/api/health');
            if (retryResponse.ok) {
                console.log('✅ Orquestrador: Iniciado com sucesso');
                return true;
            }
        } catch (retryError) {
            console.log('❌ Falha ao iniciar orquestrador automaticamente');
            console.log('   Execute manualmente: node scripts/orchestrator-server.js');
            return false;
        }
    }
    return false;
}

// Fetch polyfill
if (!globalThis.fetch) {
    const fetch = require('node-fetch');
    globalThis.fetch = fetch;
}

// Executar monitor
if (require.main === module) {
    console.log('🔧 Verificando orquestrador...');

    checkOrchestrator().then(orchestratorOk => {
        if (orchestratorOk) {
            monitorActivation().catch(console.error);
        } else {
            console.log('❌ Não é possível continuar sem o orquestrador ativo');
            process.exit(1);
        }
    });
}

module.exports = { monitorActivation, checkOrchestrator };