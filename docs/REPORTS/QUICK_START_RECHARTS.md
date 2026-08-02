# Recharts Integration - Quick Start Guide

## ✨ What's New

You now have **4 production-ready chart components** with full dark/light theme support:

1. **LineChartMetrics** - Time series trends
2. **AreaChartMetrics** - Cumulative metrics
3. **BarChartMetrics** - Category comparisons
4. **PieChartMetrics** - Distribution data

Plus two high-level components:
- **AnalyticsPanel** - Single chart with metrics
- **AnalyticsDashboard** - Full dashboard with tabs

---

## 🚀 Quick Start

### Option 1: Use AnalyticsDashboard (Recommended)
Pre-built with tabs, charts, and metrics:

```typescript
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard"

<AnalyticsDashboard
  title="Platform Analytics"
  description="Real-time metrics"
  showMetrics={true}
/>
```

**Features:**
- 3 tabs: Overview, Performance, Distribution
- Multiple chart types
- Metric summary cards
- Auto-generates sample data

---

### Option 2: Use AnalyticsPanel (Customizable)
Single chart with metrics:

```typescript
import { AnalyticsPanel } from "@/components/dashboard/AnalyticsPanel"

<AnalyticsPanel
  title="User Growth"
  chartType="line"
  chartLabel="Active Users"
  metrics={[
    { id: "1", label: "Total", value: "1.2K", trend: 12 }
  ]}
/>
```

---

### Option 3: Use Chart Components (Full Control)
Individual charts for custom layouts:

```typescript
import { LineChartMetrics } from "@/components/dashboard/ChartComponents"

<LineChartMetrics
  data={myData}
  dataKey="users"
  name="Active Users"
  stroke="#3b82f6"
  height={350}
/>
```

---

## 📊 Basic Examples

### Line Chart - User Trend
```typescript
import { LineChartMetrics } from "@/components/dashboard/ChartComponents"

<LineChartMetrics
  data={[
    { name: "Mon", users: 245 },
    { name: "Tue", users: 312 },
    { name: "Wed", users: 289 },
    { name: "Thu", users: 350 },
    { name: "Fri", users: 395 },
  ]}
  dataKey="users"
  name="Active Users"
  stroke="#3b82f6"  // Blue
  height={300}
/>
```

---

### Area Chart - Revenue
```typescript
import { AreaChartMetrics } from "@/components/dashboard/ChartComponents"

<AreaChartMetrics
  data={[
    { name: "Jan", revenue: 10000 },
    { name: "Feb", revenue: 15000 },
    { name: "Mar", revenue: 18000 },
  ]}
  dataKey="revenue"
  name="Revenue"
  fill="#10b981"  // Green
  height={300}
/>
```

---

### Bar Chart - Job Status
```typescript
import { BarChartMetrics } from "@/components/dashboard/ChartComponents"

<BarChartMetrics
  data={[
    { name: "Completed", value: 450 },
    { name: "Running", value: 120 },
    { name: "Queued", value: 80 },
    { name: "Failed", value: 30 },
  ]}
  dataKeys={[
    { key: "value", name: "Count", fill: "#3b82f6" }
  ]}
  height={300}
/>
```

---

### Pie Chart - Success Rate
```typescript
import { PieChartMetrics } from "@/components/dashboard/ChartComponents"

<PieChartMetrics
  data={[
    { name: "Success", value: 92, fill: "#10b981" },
    { name: "Failed", value: 8, fill: "#ef4444" },
  ]}
  height={300}
/>
```

---

## 🎨 Colors

### Semantic Color Palette
```
Success   → Emerald (#10b981)
Info      → Blue (#3b82f6)
Warning   → Amber (#f59e0b)
Critical  → Red (#ef4444)
Primary   → Primary (#primary)
Secondary → Violet (#8b5cf6)
```

### Using Colors
```typescript
// Success metric
<LineChartMetrics stroke="#10b981" />

// Warning metric
<AreaChartMetrics fill="#f59e0b" />

// Critical metric
<BarChartMetrics dataKeys={[
  { key: "errors", fill: "#ef4444" }
]} />
```

---

## 📱 Responsive Heights

```typescript
// Small (mobile)
<LineChartMetrics data={data} height={200} />

// Medium (tablet) - Default
<LineChartMetrics data={data} height={300} />

// Large (desktop)
<LineChartMetrics data={data} height={400} />

// Or use AnalyticsPanel
<AnalyticsPanel chartHeight="sm" />    // 200px
<AnalyticsPanel chartHeight="md" />    // 300px (default)
<AnalyticsPanel chartHeight="lg" />    // 400px
```

---

## 🔗 Connecting to Your API

### Fetch Data
```typescript
async function fetchAnalyticsData() {
  const res = await fetch('/api/admin/analytics')
  return res.json()
}

// Returns:
// {
//   timeSeries: [ { name: "Mon", users: 245, ... } ],
//   categories: [ { name: "Completed", value: 450 } ],
//   distribution: [ { name: "Success", value: 92 } ]
// }
```

### Use in Component
```typescript
const [data, setData] = React.useState(null)

React.useEffect(() => {
  fetchAnalyticsData().then(setData)
}, [])

<AnalyticsDashboard data={data} />
```

---

## 💾 Sample Data

### Generate Test Data
```typescript
import { 
  generateTimeSeriesData,
  generateCategoryData,
  generateDistributionData 
} from "@/components/dashboard/ChartComponents"

// 14 days of data
const timeSeriesData = generateTimeSeriesData(14)

// Status categories
const categoryData = generateCategoryData()

// Success/failure distribution
const distributionData = generateDistributionData()
```

---

## 🎯 Common Patterns

### Dashboard with Multiple Metrics
```typescript
<div className="grid gap-6">
  <AnalyticsPanel
    title="Users"
    chartType="line"
    chartData={userData}
    chartLabel="Active Users"
  />
  <AnalyticsPanel
    title="Revenue"
    chartType="area"
    chartData={revenueData}
    chartLabel="Daily Revenue"
  />
</div>
```

---

### Tabbed Analytics (with AnalyticsDashboard)
```typescript
<AnalyticsDashboard
  tabs={[
    { id: "overview", label: "Overview" },
    { id: "performance", label: "Performance" },
    { id: "distribution", label: "Distribution" }
  ]}
/>
```

---

### Custom Time Range
```typescript
// Last 7 days
const data7 = generateTimeSeriesData(7)

// Last 30 days
const data30 = generateTimeSeriesData(30)

// Custom data from API
const data = await fetch('/api/analytics?days=30')
```

---

## 🌙 Dark/Light Theme

Charts automatically adapt to theme:

```typescript
// Automatic (no config needed)
<LineChartMetrics data={data} dataKey="users" />

// Dark theme colors applied automatically
// Light theme colors applied automatically
```

---

## 📊 Data Format Reference

### Time Series
```typescript
[
  { 
    name: "Monday",           // x-axis label
    users: 245,               // numeric value
    jobs: 120,                // additional metrics
    revenue: 1500
  },
  { 
    name: "Tuesday", 
    users: 312, 
    jobs: 145,
    revenue: 1800 
  }
]
```

### Categories
```typescript
[
  { name: "Completed", value: 450 },
  { name: "Running", value: 120 },
  { name: "Failed", value: 30 }
]
```

### Distribution
```typescript
[
  { name: "Success", value: 92, fill: "#10b981" },
  { name: "Failed", value: 8, fill: "#ef4444" }
]
```

---

## 🧩 Combining with Dashboard

### In Admin Dashboard
```typescript
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard"

// In your dashboard page
<div className="space-y-6">
  <DashboardHero ... />
  <StatisticsCards ... />
  <div className="grid lg:grid-cols-3 gap-6">
    <HealthPanel ... />
    <AnalyticsDashboard showMetrics={false} />  // Chart only
    <AuditLogs ... />
  </div>
</div>
```

---

## ⚙️ Configuration

### AnalyticsPanel Props
```typescript
{
  title?: string                    // "Analytics"
  description?: string              // Chart description
  metrics: AnalyticsMetric[]        // Metric cards
  hasChart?: boolean                // Show chart
  chartHeight?: "sm" | "md" | "lg"  // Height
  chartType?: "line"|"area"|"bar"|"pie"
  chartData?: ChartDataPoint[]       // Custom data
  chartDataKey?: string             // Data field key
  chartLabel?: string               // Chart label
  isLoading?: boolean               // Loading state
}
```

### AnalyticsDashboard Props
```typescript
{
  title?: string                    // "Analytics"
  description?: string              // Dashboard description
  tabs?: ChartTab[]                 // Custom tabs
  defaultTab?: string               // Active tab
  showMetrics?: boolean             // Show metric cards
  isLoading?: boolean               // Loading state
  data?: {                          // Custom data
    timeSeries?: ChartDataPoint[]
    categories?: Array<{name, value}>
    distribution?: Array<{name, value}>
  }
}
```

---

## 🚨 Troubleshooting

### Charts Not Appearing
✓ Check data format matches expected structure
✓ Ensure ResponsiveContainer parent has width/height
✓ Verify Recharts is installed: `npm ls recharts`

### Wrong Colors
✓ Verify color hex codes are valid
✓ Check theme is properly applied (next-themes)
✓ Use CHART_COLORS array for consistency

### Performance Issues
✓ Reduce data points (resample)
✓ Use lazy loading for dashboard
✓ Memoize chart components

### Theme Not Updating
✓ Ensure ThemeProvider is in layout
✓ Check `useTheme()` hook is available
✓ Verify dark/light mode toggle works

---

## 📚 Files Created

```
src/components/dashboard/
├── ChartComponents.tsx        (8.5 KB) - Core charts
├── AnalyticsDashboard.tsx     (9.4 KB) - Full dashboard
└── AnalyticsPanel.tsx         (5.6 KB) - Updated with charts

Documentation:
├── RECHARTS_INTEGRATION_GUIDE.md
└── QUICK_START_RECHARTS.md (this file)
```

---

## ✅ Checklist

- [x] Recharts installed
- [x] Chart components created
- [x] Theme support implemented
- [x] Dark/light mode working
- [x] Sample data generators included
- [x] Fully responsive
- [x] TypeScript support
- [x] Documentation complete
- [x] No new dependencies
- [x] Production ready

---

## 🎯 Next Steps

1. **Import components** into your pages
2. **Connect to your API** for real data
3. **Customize colors** for your brand
4. **Add date filters** for time range selection
5. **Implement exports** (PNG/CSV)
6. **Add comparisons** (vs last month)

---

## 📖 Example Integration

See `EXAMPLE_ANALYTICS_PAGE.tsx` for a complete example.

---

**Status:** ✅ **Ready to Use**
