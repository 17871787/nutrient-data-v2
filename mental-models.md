# Nutrient Data Tool - Mental Models & User Guide

## Core Mental Model: The Farm as a System

```mermaid
graph TB
    subgraph "External Inputs"
        FEED[🌾 Purchased Feed]
        FERT[🧪 Fertilizers]
        IMPORT[🚚 Imported Slurry]
    end
    
    subgraph "The Farm System"
        FIELD[🌱 Fields/Crops]
        COWS[🐄 Livestock]
        STORE[🏪 Feed Store]
        SLURRY[💩 Slurry Store]
        
        FIELD -->|Homegrown Feed| STORE
        STORE -->|Daily Rations| COWS
        COWS -->|Manure| SLURRY
        SLURRY -->|Spreading| FIELD
        FERT -->|Application| FIELD
    end
    
    subgraph "Farm Outputs"
        MILK[🥛 Milk Sales]
        MEAT[🥩 Livestock Sales]
        EXPORT[🚛 Exported Slurry]
        LOSS[💨 Environmental Losses]
    end
    
    FEED --> STORE
    IMPORT --> SLURRY
    COWS --> MILK
    COWS --> MEAT
    SLURRY --> EXPORT
    FIELD --> LOSS
    SLURRY --> LOSS
    
    style COWS fill:#f9f,stroke:#333,stroke-width:3px
    style FIELD fill:#9f9,stroke:#333,stroke-width:3px
```

## User Personas & Their Mental Models

### 1. The Practical Farmer 👨‍🌾

```mermaid
journey
    title Farmer's Daily Reality to Nutrient Management
    section Morning Routine
      Check cows: 5: Farmer
      Mix feed ration: 4: Farmer
      Notice feed costs rising: 2: Farmer
    section Using Simple Mode
      Enter herd size: 5: Farmer
      Enter feed amounts: 4: Farmer
      See efficiency score: 3: Farmer
      Understand NVZ compliance: 5: Farmer
    section Insights
      "I'm feeding 0.3kg per litre": 5: Farmer
      "My NUE is only 25%": 3: Farmer
      "I need to reduce N surplus": 4: Farmer
```

**Mental Model**: "I put stuff in, I get milk out. How efficient am I?"
- Thinks in **physical quantities** (tonnes of feed, litres of milk)
- Wants **simple compliance** (am I under 170 kg N/ha?)
- Values **practical metrics** (feed per litre, cost per cow)

### 2. The Sustainability Consultant 📊

```mermaid
graph LR
    subgraph "Consultant's View"
        DATA[Farm Data] --> ANALYSIS[System Analysis]
        ANALYSIS --> METRICS[Key Metrics<br/>NUE: 28%<br/>PUE: 65%<br/>GHG: 1.2 kg CO2/L]
        METRICS --> BENCH[Benchmarking]
        BENCH --> REC[Recommendations]
        
        REC --> IMP1[Reduce protein in diet]
        REC --> IMP2[Improve slurry management]
        REC --> IMP3[Optimize fertilizer timing]
    end
    
    style METRICS fill:#bbf,stroke:#333,stroke-width:2px
```

**Mental Model**: "How does this farm compare to best practice?"
- Thinks in **efficiency ratios** (NUE, PUE)
- Wants **benchmarking data** (top 25% achieve X)
- Values **environmental metrics** (GHG/litre, N surplus/ha)

### 3. The Veterinary Nutritionist 🔬

```mermaid
flowchart TD
    subgraph "Vet's Calculation Process"
        DIET[Diet Formulation] --> DM[Dry Matter Basis]
        DM --> CP[CP% = 18% DM]
        CP --> INTAKE[DMI = 22 kg/cow/day]
        INTAKE --> CONC[Concentrate Rate<br/>8 kg/cow/day as fed<br/>= 7.04 kg DM]
        
        CONC --> CHECK{Protein Check}
        CHECK -->|Too High| ADJ[Adjust Ration]
        CHECK -->|OK| CALC[Calculate N flow]
        
        ADJ --> DIET
        CALC --> EFF[Feed Efficiency<br/>kg milk/kg concentrate]
    end
    
    style DM fill:#fbb,stroke:#333,stroke-width:2px
    style CHECK fill:#fbf,stroke:#333,stroke-width:2px
```

**Mental Model**: "Optimize nutrition for production while minimizing waste"
- Thinks in **nutritional terms** (CP%, DM%, ME)
- Wants **feed efficiency** (kg milk per kg concentrate)
- Values **precision** (exact protein needed, no excess)

## Workflow Mental Models

### Simple Entry Mode: The 5-Step Journey

```mermaid
stateDiagram-v2
    [*] --> Farm: Who are you?
    Farm --> Inputs: What goes in?
    Inputs --> Outputs: What comes out?
    Outputs --> Manure: What about waste?
    Manure --> Results: How did I do?
    
    state Results {
        [*] --> Compliance
        Compliance --> Efficiency
        Efficiency --> Improvements
    }
    
    Results --> [*]: Save/Export
```

**Mental Model**: "Tell my story step by step"
1. **Identity**: Farm size, cow numbers
2. **Inputs**: Everything I buy/use
3. **Outputs**: What I sell
4. **Cycling**: Internal nutrient flows
5. **Performance**: How efficient am I?

### Pro Mode: The System Builder

```mermaid
graph TB
    subgraph "Pro User's Mental Canvas"
        KOU1[Field 1<br/>40 ha]
        KOU2[Field 2<br/>35 ha]
        KOU3[Dairy Herd<br/>180 cows]
        KOU4[Youngstock<br/>60 head]
        KOU5[Slurry Lagoon<br/>4000 m³]
        KOU6[Feed Store]
        
        EXT1[Feed Merchant] --> KOU6
        KOU6 --> KOU3
        KOU6 --> KOU4
        KOU3 --> KOU5
        KOU4 --> KOU5
        KOU5 --> KOU1
        KOU5 --> KOU2
        EXT2[Fertilizer Co] --> KOU1
        EXT2 --> KOU2
        KOU3 --> EXT3[Milk Co-op]
        KOU3 --> EXT4[Livestock Market]
    end
    
    style KOU3 fill:#f9f,stroke:#333,stroke-width:3px
    style KOU5 fill:#fa5,stroke:#333,stroke-width:3px
```

**Mental Model**: "Build accurate representation of my specific farm"
- Each **physical location** is a KOU
- Each **nutrient transfer** is a pathway
- Can model **complex scenarios** (what if I expand?)

## Conceptual Frameworks

### 1. The Efficiency Pyramid

```mermaid
graph TB
    subgraph "Hierarchy of Efficiency"
        A[NVZ Compliance<br/>≤170 kg N/ha<br/>⭐ Legal Requirement]
        B[Basic Efficiency<br/>NUE >25%<br/>⭐⭐ Industry Average]
        C[Good Efficiency<br/>NUE >35%<br/>⭐⭐⭐ Top Third]
        D[Excellence<br/>NUE >40%<br/>⭐⭐⭐⭐ Top 10%]
        
        A --> B
        B --> C
        C --> D
    end
    
    style A fill:#fbb,stroke:#333,stroke-width:2px
    style D fill:#9f9,stroke:#333,stroke-width:2px
```

### 2. The Value Framework

```mermaid
mindmap
  root((Farm<br/>Nutrients))
    Environmental
      NVZ Compliance
      Water Quality
      GHG Reduction
      Biodiversity
    Economic
      Feed Costs
      Fertilizer Savings
      Slurry Value
      Milk Premium
    Social
      Neighbor Relations
      Public Perception
      Next Generation
      Policy Compliance
    Operational
      Feed Efficiency
      Workload
      Record Keeping
      Decision Support
```

### 3. The Decision Flow

```mermaid
flowchart TD
    START[Current Performance] --> ASSESS{NUE Status?}
    
    ASSESS -->|<25%| URGENT[Urgent Action Needed]
    ASSESS -->|25-35%| IMPROVE[Room for Improvement]
    ASSESS -->|>35%| GOOD[Optimize Further]
    
    URGENT --> ACT1[Reduce protein in diet]
    URGENT --> ACT2[Export excess slurry]
    URGENT --> ACT3[Cut fertilizer use]
    
    IMPROVE --> OPT1[Fine-tune rations]
    IMPROVE --> OPT2[Better slurry timing]
    IMPROVE --> OPT3[Precision fertilizer]
    
    GOOD --> ADV1[Scenario planning]
    GOOD --> ADV2[Economic optimization]
    GOOD --> ADV3[Share best practice]
    
    style URGENT fill:#f99,stroke:#333,stroke-width:2px
    style GOOD fill:#9f9,stroke:#333,stroke-width:2px
```

## Common Misconceptions vs Reality

```mermaid
graph LR
    subgraph "Misconceptions"
        M1[More fertilizer = More grass]
        M2[High protein = More milk]
        M3[Slurry = Waste product]
        M4[Efficiency = Less production]
    end
    
    subgraph "Reality"
        R1[Optimal N = Best grass]
        R2[Balanced protein = Best milk]
        R3[Slurry = Valuable resource]
        R4[Efficiency = Sustainable profit]
    end
    
    M1 -.->|❌| R1
    M2 -.->|❌| R2
    M3 -.->|❌| R3
    M4 -.->|❌| R4
    
    style M1 fill:#fcc,stroke:#333
    style R1 fill:#cfc,stroke:#333
```

## Getting Started Pathways

```mermaid
journey
    title New User Journey
    section First Visit
      Open tool: 5: New User
      Choose Simple Mode: 5: New User
      See example data: 4: New User
    section First Entry
      Replace with own data: 3: New User
      Get confused by units: 2: New User
      Use tooltips for help: 4: New User
    section First Results
      See NVZ status: 5: New User
      Understand efficiency: 3: New User
      Export data: 4: New User
    section Return Visit
      Try Pro mode: 3: Power User
      Build detailed model: 4: Power User
      Run scenarios: 5: Power User
```

## The Continuous Improvement Cycle

```mermaid
graph LR
    subgraph "Annual Cycle"
        MEASURE[📊 Measure<br/>Current State] --> ANALYZE[🔍 Analyze<br/>Efficiency]
        ANALYZE --> PLAN[📋 Plan<br/>Improvements]
        PLAN --> IMPLEMENT[⚙️ Implement<br/>Changes]
        IMPLEMENT --> MONITOR[📈 Monitor<br/>Progress]
        MONITOR --> MEASURE
    end
    
    ANALYZE --> TOOL{Nutrient Tool}
    TOOL --> SIMPLE[Simple Mode<br/>Quick Assessment]
    TOOL --> PRO[Pro Mode<br/>Detailed Analysis]
    
    style TOOL fill:#bbf,stroke:#333,stroke-width:3px
```

## Key Takeaways

1. **Start Simple**: Use Simple Mode for quick insights
2. **Think Systems**: Nutrients flow in cycles, not straight lines
3. **Focus on Efficiency**: Better use of nutrients = better profits + environment
4. **Measure to Manage**: You can't improve what you don't measure
5. **Iterate**: Small improvements compound over time

This tool bridges the gap between:
- **What you do** (feed cows, spread fertilizer)
- **What happens** (nutrient flows, losses)
- **What it means** (efficiency, compliance, sustainability)