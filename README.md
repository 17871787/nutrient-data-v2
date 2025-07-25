# Nutrient Budget Calculator - Pilot Program

A simplified MVP for nutrient budgeting across 10 pilot dairy farms. This tool helps farm advisors calculate nitrogen and phosphorus balances and check NVZ compliance.

## Features

- **Simple 3-step workflow**: Select farm → Enter data → View report
- **Nutrient balance calculations** for N and P
- **NVZ compliance checking** with visual indicators
- **Print-ready reports** for advisor meetings
- **Local data storage** (no backend required)
- **JSON export** for data backup

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Usage

1. **Select a farm** from the 10 pilot farms
2. **Update input values** (pre-populated with defaults)
3. **View results** including efficiency metrics and compliance status
4. **Print report** for farm records

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Recharts for visualizations
- Lucide React for icons

## Deployment

This project is configured for easy deployment to Vercel.

## Data Storage

All data is stored locally in the browser's localStorage. Use the "Export Data" button to download a JSON backup.