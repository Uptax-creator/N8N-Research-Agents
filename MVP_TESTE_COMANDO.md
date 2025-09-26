# 🧪 MVP - Comando de Teste

## **Testar o fluxo SSV Variables:**

```bash
curl -X POST "https://primary-production-56785.up.railway.app/webhook/work-1001" \
-H "Content-Type: application/json" \
-d '{
  "project_id": "mvp_test",
  "agent_id": "test_agent_001",
  "query": "teste fluxo SSV variables entre 3 nodes"
}'
```

## **Resultado esperado se funcionar:**
```json
{
  "ssv_preserved": {
    "workflow_config": {
      "version": "mvp-v1.0",
      "processor_type": "fixed_code_mvp"
    },
    "request_data": {
      "query": "teste fluxo SSV variables entre 3 nodes",
      "session_id": "mvp_..."
    }
  },
  "processing_result": {
    "success": true,
    "input_query": "teste fluxo SSV variables entre 3 nodes",
    "simulated_response": "Processamento MVP concluído para: ..."
  },
  "processing_metadata": {
    "test_status": "mvp_validation_successful"
  }
}
```

## **Validação:**
✅ Se retornar JSON com `"success": true` = **SSV Variables flow funcionando**
❌ Se retornar erro = verificar logs de cada node

## **Próximo passo após sucesso:**
Migrar lógica para GitHub e integrar AI Agent