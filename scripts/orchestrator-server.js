#!/usr/bin/env node

/**
 * 🚀 Orchestrator Server - Bridge between Frontend and Engine
 *
 * Conecta a interface client-interface.html com o orchestrator-engine.js
 * Implementa os endpoints de API para o pipeline completo de orquestração
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

// Import the orchestrator engine
const OrchestratorEngine = require('./orchestrator-engine.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize orchestrator engine
const orchestrator = new OrchestratorEngine();

// Log incoming requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

/**
 * Frontend Routes
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/client-interface.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/client-interface.html'));
});

/**
 * API Routes - Orchestrator Pipeline
 */

// STEP 0: Optimize User Request (Checkpoint Zero)
app.post('/api/orchestrator/optimize-request', async (req, res) => {
    try {
        console.log('✨ Optimizing user request:', req.body);

        const { agentType, originalRequest, isMultimodal, hasFiles } = req.body;

        const optimizedRequest = await orchestrator.optimizeUserRequest({
            agentType,
            originalRequest,
            isMultimodal,
            hasFiles,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            optimizedRequest,
            message: 'Requisitos otimizados com sucesso'
        });

    } catch (error) {
        console.error('❌ Erro na otimização:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Falha na otimização de requisitos'
        });
    }
});

// STEP 1: Create Blueprint
app.post('/api/orchestrator/blueprint', async (req, res) => {
    try {
        console.log('📋 Creating blueprint:', req.body);

        const { agentType, requirements, timestamp } = req.body;

        const blueprint = await orchestrator.createBlueprint({
            agentType,
            userRequest: requirements,
            timestamp,
            sessionId: `session-${Date.now()}`
        });

        res.json({
            success: true,
            blueprint,
            message: 'Blueprint criado com sucesso'
        });

    } catch (error) {
        console.error('❌ Erro no blueprint:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Falha na criação do blueprint'
        });
    }
});

// STEP 2: Decompose with TaskMaster
app.post('/api/orchestrator/decompose', async (req, res) => {
    try {
        console.log('🔄 Decomposing with TaskMaster:', req.body.id);

        const taskPlan = await orchestrator.decomposeWithTaskMaster(req.body);

        res.json({
            success: true,
            taskPlan,
            message: 'Decomposição concluída com TaskMaster'
        });

    } catch (error) {
        console.error('❌ Erro na decomposição:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Falha na decomposição de tarefas'
        });
    }
});

// STEP 3: Execute with Subagents
app.post('/api/orchestrator/execute', async (req, res) => {
    try {
        console.log('⚡ Executing with subagents:', req.body.timeline);

        const results = await orchestrator.executeSubagents(req.body);

        res.json({
            success: true,
            results,
            message: 'Execução com subagentes concluída'
        });

    } catch (error) {
        console.error('❌ Erro na execução:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Falha na execução com subagentes'
        });
    }
});

// STEP 4: Aggregate Results
app.post('/api/orchestrator/aggregate', async (req, res) => {
    try {
        console.log('📊 Aggregating results');

        const finalResult = await orchestrator.aggregateResults(req.body);

        res.json({
            success: true,
            finalResult,
            message: 'Agregação de resultados concluída'
        });

    } catch (error) {
        console.error('❌ Erro na agregação:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Falha na agregação de resultados'
        });
    }
});

/**
 * Checkpoint Routes
 */
app.post('/api/checkpoint/plan', async (req, res) => {
    try {
        const { taskPlan, userFeedback } = req.body;
        const result = await orchestrator.checkpointPlanApproval(taskPlan, userFeedback);

        res.json({
            success: true,
            approved: result,
            message: result ? 'Plano aprovado' : 'Plano rejeitado'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/checkpoint/review', async (req, res) => {
    try {
        const { partialResults, userFeedback } = req.body;
        const result = await orchestrator.checkpointIterativeReview(partialResults, userFeedback);

        res.json({
            success: true,
            approved: result,
            message: result ? 'Revisão aprovada' : 'Revisão rejeitada'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/checkpoint/final', async (req, res) => {
    try {
        const { finalResult, userFeedback } = req.body;
        const result = await orchestrator.checkpointFinalApproval(finalResult, userFeedback);

        res.json({
            success: true,
            approved: result,
            message: result ? 'Entregável aprovado' : 'Entregável rejeitado'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Health Check & Metrics
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        orchestrator: 'ready'
    });
});

app.get('/api/metrics', async (req, res) => {
    try {
        const metricsPath = path.join(__dirname, '../metrics/agents.json');

        if (fs.existsSync(metricsPath)) {
            const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
            res.json(metrics);
        } else {
            res.json({ message: 'Métricas não disponíveis' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Error Handling
 */
app.use((err, req, res, next) => {
    console.error('💥 Server Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.path} not found`
    });
});

/**
 * Start Server
 */
app.listen(PORT, () => {
    console.log(`
🚀 Orchestrator Server Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Frontend: http://localhost:${PORT}
📍 API Base: http://localhost:${PORT}/api
📍 Health:   http://localhost:${PORT}/api/health
📍 Metrics:  http://localhost:${PORT}/api/metrics

🎯 Pipeline Ready:
   1. Blueprint Creation
   2. TaskMaster Decomposition
   3. Subagent Execution
   4. Result Aggregation

✅ Checkpoints Active:
   • Plan Approval
   • Iterative Review
   • Final Approval

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Shutting down orchestrator server...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Shutting down orchestrator server...');
    process.exit(0);
});

module.exports = app;