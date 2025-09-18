#!/bin/bash
# Simple Agent Deployment Script
echo "🚀 Deploying agent: $1"
cp "./templates/agents/$1.json" "./generated-agents/$1-config.json"
echo "✅ Agent template copied to: ./generated-agents/$1-config.json"
