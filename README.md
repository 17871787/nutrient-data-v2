# High-Resolution Nutrient Budget System

Advanced prototype for high-resolution nutrient budgeting that tracks N, P, K, and S through Key Operational Units (KOUs) on dairy farms.

## Features

### 🎯 Key Operational Units (KOUs)
- **Individual field tracking** - Each field monitored separately
- **Livestock groups** - High/mid/low yielders, dry cows
- **Feed stores** - Silage clamps, concentrate stores
- **Manure management** - Slurry lagoons, FYM heaps

### 📊 Visualizations
- **System Overview** - All KOUs with nutrient balances
- **Nutrient Pathways** - Sankey diagram showing flows
- **Farm Map** - Color-coded fields by nutrient status
- **Scenario Planning** - What-if analysis tool

### 🧪 Advanced Features
- **4 nutrients tracked**: N, P, K, S (not just N & P)
- **Pathway tracking**: Feed → Livestock → Manure → Fields
- **Loss pathways**: Atmospheric, leaching, runoff
- **Financial analysis**: ROI calculations for interventions

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Usage

1. **System Overview** - See all KOUs and click for details
2. **Nutrient Pathways** - Visualize flows between units
3. **Field Map** - Check field-level nutrient status
4. **Scenarios** - Test management interventions

## Scenario Planning Examples

- Export slurry to reduce organic N loading
- Install trailing shoe applicator (-30% NH₃ losses)
- Implement cover crops (-40% N leaching)
- Precision feeding (-20% N excretion)

## Tech Stack

- React 18 with Vite
- Tailwind CSS
- Recharts for visualizations
- Lucide React icons

## Data Model

Uses KOU-based structure where each operational unit tracks:
- Nutrient content (N, P, K, S)
- Physical properties (area, capacity)
- Input/output pathways
- Historical data

## Deployment

Ready for Vercel deployment. No backend required - uses localStorage.