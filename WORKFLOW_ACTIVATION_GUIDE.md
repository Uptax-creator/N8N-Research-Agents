# N8N Workflow Activation Guide

## Current Status
- N8N Instance: Running at https://primary-production-56785.up.railway.app
- Health Check: OK
- API Access: Authentication issue with current API key
- Webhooks: All inactive (workflows not activated)

## Required Manual Steps

Since API authentication is failing, you need to manually activate the workflows:

### 1. Access N8N Interface
1. Open https://primary-production-56785.up.railway.app
2. Login with your credentials

### 2. Activate Key Workflows

Locate and activate these workflows in the N8N interface:

#### Essential Workflows
- **Baseline Observable Test** - For basic connectivity testing
- **AI Metrics Collection System** - For metrics gathering
- **Evaluation Test Suite (AI Enhanced)** - For AI-powered testing
- **Evaluation Test Suite Complete** - For comprehensive testing

#### For each workflow:
1. Click on the workflow name to open it
2. Toggle the "Active" switch in the top-right corner
3. Save the workflow
4. Note the webhook URL displayed

### 3. Update API Key (if needed)

If you have access to N8N settings:
1. Go to Settings → API
2. Generate a new API key
3. Update the key in our scripts:
   - `scripts/activate-workflows.sh`
   - `scripts/test-n8n-api.sh`

### 4. Verify Activation

After activation, test the webhooks:

```bash
# Test baseline webhook
curl -X POST "https://primary-production-56785.up.railway.app/webhook/baseline-test" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Test evaluation webhook  
curl -X POST "https://primary-production-56785.up.railway.app/webhook/evaluation/test" \
  -H "Content-Type: application/json" \
  -d '{"test_id": "manual-test"}'
```

## Available Test Scripts

Once workflows are active:

```bash
# Run baseline tests
./scripts/test-baseline-observable.sh

# Test micro activity
./scripts/test-micro-activity.sh

# Test optimized workflow
./scripts/test-optimized-workflow.sh
```

## AI Integration Components Status

### Completed Components
- ✅ `library/components/ai-integration/ai-dynamic-validator.js`
- ✅ `library/components/ai-integration/ai-error-analyzer.js`
- ✅ `library/components/ai-integration/ai-performance-optimizer.js`
- ✅ `library/components/ai-integration/ai-test-selector.js`

### Evaluation Components
- ✅ `library/components/evaluation/results-processor.js`
- ✅ `library/components/evaluation/test-validator.js`
- ✅ `library/components/evaluation/state-loader.js`
- ✅ `library/components/evaluation/state-saver.js`
- ✅ `library/components/evaluation/webhook-early-response.js`
- ✅ `library/components/evaluation/gsheet-config-loader.js`

## Next Steps

1. **Manual Activation**: Follow steps above to activate workflows
2. **Test Execution**: Run test scripts to validate system
3. **Monitor Results**: Check N8N execution logs
4. **Performance Analysis**: Review AI-enhanced metrics

## Troubleshooting

### Webhook Returns 404
- Workflow is not active
- URL path is incorrect
- Workflow was deleted

### API Authentication Fails
- API key expired or invalid
- Wrong header format (use `X-N8N-API-KEY`)
- API access not enabled in N8N

### Test Scripts Fail
- Ensure workflows are active
- Check network connectivity
- Verify webhook URLs match workflow configuration