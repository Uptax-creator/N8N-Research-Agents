# 📤 MVP - Node 3: Response

## **Tipo de Node**: HTTP Response (Respond to Webhook)

## **Nome do Node**: `Response MVP`

## **Configuração:**
- **Response Code**: 200
- **Response Headers**:
  ```
  Content-Type: application/json
  ```
- **Response Body**: `{{ $json }}`

## **Conexões:**
- **Input**: Fixed Processor MVP
- **Output**: (Final node)

## **Observações:**
- Este é um node padrão do N8N
- Não precisa de código customizado
- Automaticamente retorna o JSON do node anterior
- Deve estar conectado como último node do workflow