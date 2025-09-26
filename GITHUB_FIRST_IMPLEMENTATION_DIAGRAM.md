# 📊 GITHUB-FIRST ARCHITECTURE - DIAGRAMAS

## **🎯 VISÃO GERAL DO SISTEMA**

```mermaid
graph TB
    subgraph "External Input"
        A[Webhook Request<br/>project_id, agent_id, query]
    end

    subgraph "N8N Workflow (3 Nodes Only)"
        B[Variables Setup<br/>Set Node]
        C[GitHub Processor Loader<br/>Code Node]
        D[Response<br/>HTTP Response]
    end

    subgraph "GitHub Repository"
        E[CSV Registry<br/>agents-registry.csv]
        F[Agent Config<br/>config.json]
        G[Prompts<br/>prompts.json]
        H[Tools<br/>tools.json]
        I[Universal Processor<br/>universal-workflow-processor.js]
    end

    subgraph "External Services"
        J[MCP Bright Data<br/>SSE Endpoint]
        K[Google Docs<br/>HTTP API]
        L[AI Agent<br/>Gemini/OpenRouter]
    end

    A --> B
    B --> C
    C --> D

    C --> E
    C --> F
    C --> G
    C --> H
    C --> I

    I --> J
    I --> K
    I --> L
```

## **🔄 FLUXO DE DADOS DETALHADO**

```mermaid
sequenceDiagram
    participant W as Webhook
    participant N1 as Variables Setup
    participant N2 as GitHub Processor
    participant N3 as Response
    participant GH as GitHub
    participant AI as AI Agent
    participant MCP as MCP Services

    W->>N1: {project_id, agent_id, query}

    Note over N1: Consolidate SSV Variables
    N1->>N1: Create session_id
    N1->>N1: Add workflow_config
    N1->>N1: Add runtime context

    N1->>N2: SSV Variables Object

    Note over N2: Load GitHub Processor
    N2->>GH: Fetch universal-processor.js
    GH-->>N2: Processor code

    Note over N2: Execute Processor with SSV
    N2->>GH: Fetch agents-registry.csv
    GH-->>N2: Agent registry data

    N2->>GH: Fetch config.json
    GH-->>N2: Agent configuration

    N2->>GH: Fetch prompts.json
    GH-->>N2: System prompts

    N2->>GH: Fetch tools.json
    GH-->>N2: MCP tools config

    Note over N2: Initialize AI Agent
    N2->>MCP: Setup MCP connections
    MCP-->>N2: MCP tools ready

    N2->>AI: Call with query + tools
    AI->>MCP: Use tools as needed
    MCP-->>AI: Tool results
    AI-->>N2: Agent response

    Note over N2: Format Response
    N2->>N3: Formatted result

    N3->>W: HTTP 200 + JSON response
```

## **📁 ESTRUTURA DE ARQUIVO GITHUB**

```
N8N-Research-Agents/
├── assembly-logic/
│   ├── agents-registry.csv              # 🎯 Master Agent Registry
│   └── agents-registry-graph.csv        # Graph-specific configs
│
├── processors/
│   ├── universal-workflow-processor.js  # 🚀 Main Processor Logic
│   ├── ai-agent-handler.js              # AI Agent integration
│   └── response-formatter.js            # Response formatting
│
├── N8N/agents/
│   ├── enhanced-research-agent/
│   │   ├── config.json                  # Agent configuration
│   │   ├── prompts.json                 # System messages
│   │   └── tools.json                   # MCP tools
│   ├── fiscal-research-agent/
│   │   ├── config.json
│   │   ├── prompts.json
│   │   └── tools.json
│   └── gdocs-documentation-agent/
│       ├── config.json
│       ├── prompts.json
│       └── tools.json
│
└── N8N/projects/
    ├── project_001/
    │   ├── agent_001_tools.json         # Project-specific tools
    │   ├── agent_002_tools.json
    │   └── agent_003_tools.json
    └── project_002/
        ├── agent_001_tools.json
        └── agent_002_tools.json
```

## **⚙️ DATA TRANSFORMATION FLOW**

```mermaid
graph LR
    subgraph "Input Processing"
        A1[Webhook Input<br/>{project_id, agent_id, query}]
        A2[Variables Setup<br/>Add session_id, config, runtime]
        A3[SSV Object<br/>Complete workflow variables]
    end

    subgraph "Configuration Loading"
        B1[CSV Registry Lookup<br/>agent_id → agent_row]
        B2[Load config.json<br/>Agent configuration]
        B3[Load prompts.json<br/>System messages]
        B4[Load tools.json<br/>MCP endpoints]
    end

    subgraph "AI Processing"
        C1[Initialize MCP<br/>Connect to endpoints]
        C2[Call AI Agent<br/>With tools + prompts]
        C3[Process Response<br/>Format output]
    end

    subgraph "Output Generation"
        D1[Add Metadata<br/>Processing info]
        D2[Final Response<br/>Structured JSON]
        D3[HTTP Response<br/>Return to client]
    end

    A1 --> A2 --> A3
    A3 --> B1 --> B2 --> B3 --> B4
    B4 --> C1 --> C2 --> C3
    C3 --> D1 --> D2 --> D3
```

## **🔧 NODE CONFIGURATION MATRIX**

| Node | Type | Inputs | Processing | Outputs |
|------|------|--------|------------|---------|
| **Variables Setup** | Set Node | `$input.item.json.body` | Consolidate SSV | `ssv_variables` |
| **GitHub Processor** | Code Node | `$('Variables Setup').item.json` | Load & Execute GitHub processor | `processed_result` |
| **Response** | HTTP Response | `$json` | Return HTTP response | Client response |

## **🌐 EXTERNAL DEPENDENCIES MAP**

```mermaid
graph TB
    subgraph "N8N Infrastructure"
        N[N8N Workflow Engine<br/>Railway.app]
    end

    subgraph "GitHub Repository"
        G[GitHub Raw Content<br/>raw.githubusercontent.com]
    end

    subgraph "MCP Services"
        M1[Bright Data<br/>mcp.brightdata.com]
        M2[Google Docs<br/>apollo-3irns8zl6-composio.vercel.app]
        M3[Perplexity<br/>api.perplexity.ai]
    end

    subgraph "AI Services"
        A1[OpenRouter<br/>openrouter.ai]
        A2[Gemini<br/>gemini.google.com]
    end

    N --> G
    N --> M1
    N --> M2
    N --> M3
    N --> A1
    N --> A2

    style G fill:#e1f5fe
    style M1 fill:#f3e5f5
    style M2 fill:#f3e5f5
    style M3 fill:#f3e5f5
    style A1 fill:#fff3e0
    style A2 fill:#fff3e0
```

## **📊 PERFORMANCE & SCALING**

```mermaid
graph LR
    subgraph "Performance Targets"
        P1[Response Time<br/>< 10 seconds]
        P2[Cache Hit Rate<br/>> 80%]
        P3[Error Rate<br/>< 1%]
        P4[Throughput<br/>100 req/min]
    end

    subgraph "Caching Strategy"
        C1[Agent Configs<br/>5min TTL]
        C2[MCP Connections<br/>Session-based]
        C3[AI Responses<br/>Optional]
    end

    subgraph "Scaling Points"
        S1[Add Agents<br/>via CSV]
        S2[Add Projects<br/>via directories]
        S3[Add MCPs<br/>via tools.json]
        S4[Add Workflows<br/>via processors]
    end

    P1 --> C1
    P2 --> C2
    P3 --> C3
    P4 --> S1

    C1 --> S2
    C2 --> S3
    C3 --> S4
```

## **🚨 ERROR HANDLING FLOW**

```mermaid
graph TB
    A[Request Received] --> B{Variables Setup OK?}
    B -->|No| E1[Return Variables Error]
    B -->|Yes| C{GitHub Processor Load OK?}

    C -->|No| E2[Return Processor Error + Fallback]
    C -->|Yes| D{CSV Registry Load OK?}

    D -->|No| E3[Return Registry Error + Default Config]
    D -->|Yes| F{Agent Config Load OK?}

    F -->|No| E4[Return Config Error + Fallback Config]
    F -->|Yes| G{MCP Connection OK?}

    G -->|No| E5[Return MCP Error + Limited Tools]
    G -->|Yes| H{AI Agent Call OK?}

    H -->|No| E6[Return AI Error + Default Response]
    H -->|Yes| I[Return Success Response]

    style E1 fill:#ffebee
    style E2 fill:#ffebee
    style E3 fill:#ffebee
    style E4 fill:#ffebee
    style E5 fill:#ffebee
    style E6 fill:#ffebee
    style I fill:#e8f5e8
```

## **🔄 DEPLOYMENT PIPELINE**

```mermaid
graph LR
    subgraph "Development"
        D1[Local Testing<br/>Processors]
        D2[Unit Tests<br/>Functions]
        D3[Integration Tests<br/>GitHub loading]
    end

    subgraph "GitHub"
        G1[Git Push<br/>to Repository]
        G2[Raw URLs<br/>Updated]
        G3[Hot Deployment<br/>Automatic]
    end

    subgraph "Production"
        P1[N8N Workflow<br/>Loads new code]
        P2[Agent Testing<br/>Validation]
        P3[Monitor<br/>Performance]
    end

    D1 --> D2 --> D3
    D3 --> G1 --> G2 --> G3
    G3 --> P1 --> P2 --> P3
```

---

**📋 DIAGRAMAS GITHUB-FIRST ARCHITECTURE v2.0**
**Status**: ✅ Ready for Implementation
**Next**: Create universal-workflow-processor.js