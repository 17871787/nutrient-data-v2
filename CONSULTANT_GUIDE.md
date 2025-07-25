# Dairy Farm Nutrient Management Tool - Consultant Guide

## Quick Start Guide for On-Farm Use

### 1. Before the Farm Visit

**Prepare the following information:**
- Field details: names, areas (hectares), current use (grass, maize, etc.)
- Livestock numbers by group (high yielders, mid yielders, dry cows, etc.)
- Feed storage capacities and current stocks
- Manure/slurry storage capacities
- Recent soil analysis results (if available)

**Access the tool:**
- Visit: [Your Vercel URL]
- Works on laptop, tablet, or phone
- No installation required - runs in web browser
- Works offline once loaded

### 2. During the Farm Visit - Step by Step

#### Step 1: Review Current System (5-10 minutes)
1. Open the tool and click **"System Overview"**
2. The tool comes pre-loaded with example data
3. Review the default KOUs (Key Operational Units) with the farmer
4. Click **"Data Management"** button to customize

#### Step 2: Set Up Farm Structure (15-20 minutes)

**In Data Management:**

1. **Fields Tab:**
   - Delete example fields not needed
   - Add actual farm fields using "+ FIELD" button
   - For each field enter:
     - Name (e.g., "Top 10 Acre", "Bottom Field")
     - Area in hectares
     - Current use (grassland, maize, etc.)
   
2. **Livestock Groups:**
   - Modify to match farm's grouping system
   - Enter actual head counts
   - Add milk yield for milking groups

3. **Stores:**
   - Update feed store names and capacities
   - Set current stock levels
   - Update slurry/FYM storage capacities

4. Click **"Export JSON"** to save baseline setup

#### Step 3: Input Nutrient Flows (20-30 minutes)

**In Pathways Tab:**

1. **External Inputs:**
   - Add purchased feed deliveries (tonnes, N/P/K content)
   - Add fertilizer purchases by field
   - Use feed labels or merchant data for nutrient content

2. **Internal Flows:**
   - Set up feeding rates from stores to livestock groups
   - Add grazing pathways (which groups graze which fields)
   - Connect livestock to manure stores
   - Add slurry/FYM spreading to fields

3. **Outputs:**
   - Milk sales (automatic N/P removal)
   - Livestock sales
   - Crop sales (if applicable)

**Quick Entry Tips:**
- Start with major flows only
- Use estimates if exact data unavailable
- Can refine later with better data

#### Step 4: Review Results (10-15 minutes)

1. **Nutrient Pathways View:**
   - Shows flow diagram of nutrients through farm
   - Identifies largest flows
   - Check system efficiency metrics

2. **Field Map View:**
   - Color-coded fields by nutrient status
   - Red = Over 170 kg N/ha (NVZ limit)
   - Amber = Approaching limit (100-170)
   - Green = Optimal (50-100)
   - Blue = Low (<50)

3. **Click on individual fields** to see:
   - Total N applied (kg/ha)
   - Sources of nutrients
   - Compliance margin

#### Step 5: Scenario Planning (15-20 minutes)

1. Click **"Scenarios"** tab
2. Click **"New Scenario"** and name it (e.g., "Reduce purchased feed by 20%")
3. Add modifications:
   - **Adjust Pathway**: Change flow amounts by percentage
   - **Add Pathway**: Test new practices
   - **Remove Pathway**: Eliminate practices

4. **Review Impact:**
   - Compliance status (red/green indicator)
   - Changes in nutrient imports/exports
   - Field-by-field compliance table
   - Which fields are at risk

### 3. Common Scenarios to Test

**For NVZ Compliance Issues:**
- Reduce slurry applications to high-risk fields
- Export slurry to neighboring farms
- Increase crop offtake/yields
- Adjust livestock numbers

**For Cost Reduction:**
- Reduce purchased fertilizer where manure N is high
- Optimize feed efficiency
- Better utilize homegrown feeds

**For Environmental Goals:**
- Reduce overall N imports
- Improve N use efficiency
- Balance applications across fields

### 4. Generating Reports

1. **During the meeting:**
   - Use screenshots of key views
   - Export current data as JSON backup
   
2. **For the farmer:**
   - Export CSV files for spreadsheet users
   - Print field map and compliance table
   - Save scenario comparisons

3. **Follow-up:**
   - Farmer can access tool anytime
   - Update throughout season
   - Track improvements

### 5. Tips for Effective Consultations

**Do:**
- Start simple - can add detail later
- Focus on largest nutrient flows first
- Use farmer's terminology for fields/groups
- Save regularly using Export function
- Test 2-3 realistic scenarios

**Don't:**
- Spend too long on precise numbers initially
- Create more than 5-6 livestock groups
- Forget to include all N sources (bedding, rainfall)
- Overlook contractor-spread materials

**Time-Saving Shortcuts:**
- Use "Copy" button to duplicate similar scenarios
- Group similar fields if numerous small paddocks
- Use typical nutrient contents if analysis unavailable:
  - Cattle slurry: 3 kg N/m³
  - FYM: 6 kg N/tonne
  - Grass silage: 4 kg N/tonne fresh

### 6. Troubleshooting

**"No Flow Data Available"**
- Check all pathways have valid From/To KOUs
- Ensure nutrient values are entered
- Refresh page if needed

**Numbers seem wrong:**
- Verify units (tonnes vs kg, m³ vs tonnes)
- Check all inputs included
- Remember losses (ammonia) are not explicitly shown

**Can't see my changes:**
- Changes auto-save to browser
- Use Export/Import for permanent saves
- Clear browser cache if issues persist

### 7. Next Steps After Visit

1. **Leave farmer with:**
   - Link to access tool
   - Exported JSON file of their setup
   - Key scenarios tested
   - Simple action plan

2. **Follow up:**
   - Revisit after slurry spreading
   - Update after soil testing
   - Annual review of progress

3. **Build database:**
   - Export anonymized data
   - Compare between farms
   - Identify best practices

## Contact & Support

- Tool issues: [GitHub Issues URL]
- Nutrient content data: Use RB209 or feed merchant data
- Training requests: [Contact details]

---

*This tool is a proof of concept for pilot farms. Feedback welcome to improve usability.*