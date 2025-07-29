# Nutrient Data Management System - Architecture Diagrams

## Component Hierarchy & Data Flow

```mermaid
graph TB
    subgraph "Entry Points"
        App[App.jsx<br/>Mode Manager]
    end

    subgraph "Simple Entry Mode"
        SEM[SimpleEntryMode.jsx<br/>5-Step Wizard]
        IR[InputRow.jsx<br/>Form Inputs]
        IIR[InlineInputRow.jsx<br/>Compact Inputs]
        
        SEM --> IR
        SEM --> IIR
    end

    subgraph "Pro Mode Components"
        HRNB[HighResolutionNutrientBudget.jsx<br/>Dashboard]
        KM[KOUManager.jsx<br/>KOU Editor]
        PM[PathwayManager.jsx<br/>Flow Editor]
        BO[BalanceOverview.jsx<br/>System Overview]
        NPV[NutrientPathwaysView.jsx<br/>Pathway List]
        FNM[FarmNutrientMap.jsx<br/>Visual Map]
        SP[ScenarioPlanning.jsx<br/>What-if Analysis]
        DM[DataManagement.jsx<br/>Import/Export]
        
        HRNB --> KM
        HRNB --> PM
        HRNB --> BO
        HRNB --> NPV
        HRNB --> FNM
        HRNB --> SP
        HRNB --> DM
    end

    subgraph "Shared Components"
        GHG[GHGIndicator.jsx<br/>Emissions Display]
        SVC[SlurryValueCard.jsx<br/>Economic Value]
        NFS[NutrientFlowSankey.jsx<br/>Sankey Diagram]
        
        BO --> GHG
        BO --> SVC
        NPV --> NFS
    end

    subgraph "Data Layer"
        SES[simpleEntrySchema.js<br/>Validation]
        KS[kouStructure.js<br/>Data Models]
        DT[dataTransformers.js<br/>Mode Conversion]
        
        SEM --> SES
        HRNB --> KS
        SEM --> DT
        DT --> KS
    end

    subgraph "Calculation Engine"
        SC[simpleCalculations.js<br/>Simple Mode Math]
        SYC[systemCalculations.js<br/>Pro Mode Math]
        GE[ghgEstimation.js<br/>GHG Regression]
        
        SEM --> SC
        HRNB --> SYC
        SC --> GE
        SYC --> GE
    end

    App --> SEM
    App --> HRNB
    SEM -.->|Transform| HRNB
    
    style App fill:#f9f,stroke:#333,stroke-width:4px
    style SEM fill:#bbf,stroke:#333,stroke-width:2px
    style HRNB fill:#bbf,stroke:#333,stroke-width:2px
    style SC fill:#bfb,stroke:#333,stroke-width:2px
    style SYC fill:#bfb,stroke:#333,stroke-width:2px
```

## Data Flow Sequence

```mermaid
sequenceDiagram
    participant User
    participant SimpleEntry
    participant Schema
    participant Calculations
    participant Transformer
    participant ProMode
    participant SystemCalc

    User->>SimpleEntry: Enter farm data
    SimpleEntry->>Schema: Validate with Zod
    Schema-->>SimpleEntry: Validation result
    SimpleEntry->>Calculations: Calculate balance
    Calculations-->>SimpleEntry: Returns NUE, PUE, balance
    
    alt Switch to Pro Mode
        SimpleEntry->>Transformer: transformToKOUs()
        Transformer-->>ProMode: KOUs + Pathways
        ProMode->>SystemCalc: calculateSystemBalance()
        SystemCalc-->>ProMode: System-wide metrics
    end
```

## State Management Flow

```mermaid
stateDiagram-v2
    [*] --> SimpleMode: Default
    
    SimpleMode --> FarmBasics: Step 1
    FarmBasics --> Inputs: Step 2
    Inputs --> Outputs: Step 3
    Outputs --> Manure: Step 4
    Manure --> Review: Step 5
    
    Review --> ProMode: Switch Mode
    ProMode --> Review: Switch Back
    
    state ProMode {
        [*] --> Overview
        Overview --> Pathways: Tab
        Overview --> FieldMap: Tab
        Overview --> Scenarios: Tab
        
        Pathways --> KOUEdit: Edit
        FieldMap --> KOUEdit: Edit
        KOUEdit --> Pathways: Save
        KOUEdit --> FieldMap: Save
    }
```

## Nutrient Calculation Pipeline

```mermaid
graph LR
    subgraph "Input Processing"
        FI[Feed Inputs]
        FRT[Fertilizer]
        MI[Manure Import]
        
        FI --> |CP to N| CONV1[CP ÷ 6.25]
        FRT --> |N-availability| AVL[N × availability]
        MI --> |N-availability| AVL2[N × 0.45]
    end
    
    subgraph "Output Processing"
        MO[Milk Output]
        LS[Livestock Sales]
        ME[Manure Export]
        
        MO --> |Protein to N| CONV2[Protein × 0.16]
    end
    
    subgraph "Balance Calculation"
        CONV1 --> TI[Total Inputs]
        AVL --> EI[Effective Inputs]
        AVL2 --> EI
        
        CONV2 --> TO[Total Outputs]
        LS --> TO
        ME --> TO
        
        EI --> NUE[NUE = Outputs/Effective Inputs]
        TI --> PUE[PUE = Outputs/Total Inputs]
        
        NUE --> GHG[GHG Estimation]
    end
    
    style FI fill:#fbb,stroke:#333
    style MO fill:#bbf,stroke:#333
    style NUE fill:#bfb,stroke:#333
    style GHG fill:#fbf,stroke:#333
```

## KOU (Key Operational Unit) Structure

```mermaid
classDiagram
    class KOU {
        +string id
        +string type
        +string name
        +object properties
    }
    
    class Field {
        +number area
        +string use
    }
    
    class LivestockGroup {
        +number animalCount
        +number milkYield
        +string group
    }
    
    class FeedStore {
        +number capacity
        +number currentStock
    }
    
    class ManureStore {
        +number capacity
        +number currentStock
        +object nutrientContent
    }
    
    class External {
        +string role
    }
    
    class Output {
        +string destination
    }
    
    KOU <|-- Field
    KOU <|-- LivestockGroup
    KOU <|-- FeedStore
    KOU <|-- ManureStore
    KOU <|-- External
    KOU <|-- Output
    
    class Pathway {
        +string id
        +string from
        +string to
        +string type
        +object nutrients
    }
    
    KOU "1" --> "*" Pathway : from
    KOU "1" --> "*" Pathway : to
```

## Feed Rate Calculation Flow

```mermaid
graph TD
    subgraph "User Input"
        MODE{Feed Mode?}
        MODE -->|kg/L milk| PL[Per Litre Input]
        MODE -->|kg/cow/day| PCD[Per Cow Day Input]
        MODE -->|t/year| ANN[Annual Input]
    end
    
    subgraph "Conversion Logic"
        PL --> |rate × milk L ÷ 1000| AT[Annual Tonnes]
        PCD --> |rate × cows × 365 ÷ 1000| AT
        ANN --> AT
    end
    
    subgraph "Display Values"
        AT --> |Show all 3| DISP[Helper Text:<br/>X t/yr • Y kg/cow/day • Z kg/L]
    end
    
    subgraph "CP Calculation for Concentrates"
        DM[DM% Input<br/>Default: 88%]
        CPAF[CP% as fed]
        
        CPAF --> |CP ÷ DM/100| CPDM[CP% on DM]
        DM --> CPDM
        CPDM --> |CP ÷ 6.25| N[N%]
    end
    
    AT --> |Store internally| DB[(Annual Amount)]
    N --> |Store internally| DB
```

## File Relationships

```mermaid
graph LR
    subgraph "Entry Points"
        A[App.jsx]
        I[index.jsx]
    end
    
    subgraph "Simple Mode Files"
        SEM[SimpleEntryMode.jsx]
        IR[InputRow.jsx]
        SC[simpleCalculations.js]
        SS[simpleEntrySchema.js]
    end
    
    subgraph "Pro Mode Files"
        HR[HighResolutionNutrientBudget.jsx]
        KM[KOUManager.jsx]
        PM[PathwayManager.jsx]
        SYC[systemCalculations.js]
    end
    
    subgraph "Shared Utilities"
        KS[kouStructure.js]
        DT[dataTransformers.js]
        GE[ghgEstimation.js]
        PR[prices.js]
    end
    
    I --> A
    A --> SEM
    A --> HR
    
    SEM --> IR
    SEM --> SC
    SEM --> SS
    SEM --> DT
    
    HR --> KM
    HR --> PM
    HR --> SYC
    HR --> KS
    
    DT --> KS
    SC --> GE
    SYC --> GE
    
    style A fill:#f96,stroke:#333,stroke-width:3px
    style SEM fill:#69f,stroke:#333,stroke-width:2px
    style HR fill:#69f,stroke:#333,stroke-width:2px
```

## Save to view in any Mermaid viewer or GitHub README