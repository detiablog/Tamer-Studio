# Recharts Integration - Complete Guide

## 🎨 Chart Components Created

### 1. **ChartComponents.tsx** (8.5 KB)
Provides all Recharts utilities and theme-aware chart functions:

#### Functions:
- `LineChartMetrics()` - Time series line charts
- `AreaChartMetrics()` - Cumulative area charts
- `BarChartMetrics()` - Comparative bar charts
- `PieChartMetrics()` - Distribution pie charts
- `CustomTooltip()` - Theme-aware tooltips
- `getChartTheme()` - Theme color management
- `generateTimeSeriesData()` - Sample data generator
- `generateCategoryData()` - Sample category data
- `generateDistributionData()` - Sample distribution data

#### Features:
✅ Full dark/light theme support
✅ Color-coded with semantic palette
✅ GPU-accelerated animations
✅ Custom tooltips
✅ Responsive sizing
✅ Type-safe data handling

---

### 2. **AnalyticsDashboard.tsx** (9.4 KB)
Complete analytics dashboard with tabs:

#### Props:
```typescript
{
  title?: string                    // "Analytics"
  description?: string              // "Platform metrics..."
  tabs?: ChartTab[]                 // Custom tabs
  defaultTab?: string               // Active tab on load
  showMetrics?: boolean             // Show metric cards
  isLoading?: boolean               // Loading state
  data?: {
    timeSeries?: ChartDataPoint[]
    categories?: Array<{ name, value }>
    distribution?: Array<{ name, value }>
  }
}
```

#### Tabs:
1. **Overview** - User growth + job activity
2. **Performance** - Job status + credits usage
3. **Distribution** - Success rate + status breakdown

#### Features:
✅ Tabbed interface
✅ Multiple chart types
✅ Metric summary cards
✅ Loading states
✅ Responsive grid

---

### 3. **Updated AnalyticsPanel.tsx** (5.6 KB)
Enhanced with real charts:

#### New Props:
```typescript
{
  chartType?: "line" | "area" | "bar" | "pie"  // Chart type
  chartData?: ChartDataPoint[]                  // Custom data
  chartDataKey?: string                         // Data field key
  chartLabel?: string                           // Chart label
}
```

#### Features:
✅ Real charts instead of placeholders
✅ Configurable chart types
✅ Sample data generation
✅ Custom data support

---

## 📊 Chart Types

### Line Chart
Best for: Trends over time (users, revenue, metrics)

```typescript
<LineChartMetrics
  data={timeSeriesData}
  dataKey="users"
  name="Active Users"
  stroke="#3b82f6"
  height={350}
/>
```

**Sample Data:**
```typescript
[
  { name: "Mon", users: 245, jobs: 120 },
  { name: "Tue", users: 312, jobs: 145 },
  { name: "Wed", users: 289, jobs: 138 },
]
```

---

### Area Chart
Best for: Cumulative metrics (revenue, growth)

```typescript
<AreaChartMetrics
  data={timeSeriesData}
  dataKey="revenue"
  name="Revenue"
  fill="#10b981"
  height={350}
/>
```

---

### Bar Chart
Best for: Comparing categories (jobs by status)

```typescript
<BarChartMetrics
  data={[
    { name: "Completed", value: 450 },
    { name: "Running", value: 120 },
    { name: "Queued", value: 80 },
    { name: "Failed", value: 30 }
  ]}
  dataKeys={[
    { key: "value", name: "Count", fill: "#3b82f6" }
  ]}
  height={350}
/>
```

---

### Pie Chart
Best for: Distribution/composition (success rate)

```typescript
<PieChartMetrics
  data={[
    { name: "Success", value: 92, fill: "#10b981" },
    { name: "Failed", value: 8, fill: "#ef4444" }
  ]}
  height={350}
/>
```

---

## 🎨 Color System

### Semantic Colors
```typescript
DARK_COLORS = {
  text: "#e4e4e7",           // Light gray
  grid: "#27272a",           // Dark gray
  primary: "#3b82f6",        // Blue
  success: "#10b981",        // Emerald
  warning: "#f59e0b",        // Amber
  critical: "#ef4444",       // Red
  secondary: "#8b5cf6",      // Violet
}

LIGHT_COLORS = {
  text: "#18181b",           // Dark gray
  grid: "#e4e4e7",           // Light gray
  primary: "#0d47a1",        // Dark blue
  success: "#0d7045",        // Dark green
  warning: "#b45309",        // Dark amber
  critical: "#991b1b",       // Dark red
  secondary: "#6d28d9",      // Dark violet
}
```

### Chart Colors Array
```typescript
CHART_COLORS = [
  "#3b82f6",  // Blue
  "#10b981",  // Emerald
  "#f59e0b",  // Amber
  "#ef4444",  // Red
  "#8b5cf6",  // Violet
  "#ec4899",  // Pink
  "#06b6d4",  // Cyan
  "#eab308",  // Yellow
]
```

---

## 📱 Responsive Implementation

### Mobile (< 640px)
```typescript
<AnalyticsDashboard
  chartHeight="sm"  // 200px height
  // Single column layout
/>
```

### Tablet (640px - 1024px)
```typescript
<AnalyticsDashboard
  chartHeight="md"  // 300px height
  // Two column grid
/>
```

### Desktop (> 1024px)
```typescript
<AnalyticsDashboard
  chartHeight="lg"  // 400px height
  // Full width charts
/>
```

---

## 🚀 Usage Examples

### Basic Line Chart
```typescript
import { LineChartMetrics } from "@/components/dashboard/ChartComponents"

<LineChartMetrics
  data={[
    { name: "Jan", value: 100 },
    { name: "Feb", value: 150 },
    { name: "Mar", value: 120 }
  ]}
  dataKey="value"
  name="Users"
  stroke="#3b82f6"
  height={300}
/>
```

### Custom Data with AnalyticsPanel
```typescript
import { AnalyticsPanel } from "@/components/dashboard/AnalyticsPanel"

<AnalyticsPanel
  title="Performance Metrics"
  chartType="area"
  chartData={myCustomData}
  chartDataKey="performance"
  chartLabel="Performance Score"
  metrics={[
    { id: "1", label: "Score", value: "92.5", unit: "%", trend: 5 }
  ]}
/>
```

### Full Analytics Dashboard
```typescript
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard"

<AnalyticsDashboard
  title="Platform Analytics"
  description="Complete platform metrics"
  showMetrics={true}
/>
```

### With Custom Data
```typescript
<AnalyticsDashboard
  data={{
    timeSeries: [
      { name: "Mon", users: 200, jobs: 100, credits: 500 },
      { name: "Tue", users: 250, jobs: 120, credits: 600 },
      // ...
    ],
    categories: [
      { name: "Completed", value: 450 },
      { name: "Running", value: 120 },
      { name: "Failed", value: 30 }
    ],
    distribution: [
      { name: "Success", value: 92 },
      { name: "Failed", value: 8 }
    ]
  }}
/>
```

---

## 🎯 Integration Steps

### Step 1: Import Components
```typescript
import {
  LineChartMetrics,
  AreaChartMetrics,
  BarChartMetrics,
  PieChartMetrics,
  generateTimeSeriesData
} from "@/components/dashboard/ChartComponents"

import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard"
```

### Step 2: Prepare Data
```typescript
const chartData = generateTimeSeriesData(14)  // 14 days

// Or fetch from API
const chartData = await fetch('/api/analytics/timeseries')
```

### Step 3: Render Chart
```typescript
<AnalyticsDashboard
  data={{ timeSeries: chartData }}
/>
```

---

## 📊 Data Format

### Time Series Format
```typescript
interface TimeSeriesData {
  name: string              // Date or label
  [key: string]: number     // Numeric values
}

Example:
[
  { name: "Mon", users: 245, jobs: 120, revenue: 1500 },
  { name: "Tue", users: 312, jobs: 145, revenue: 1800 },
  { name: "Wed", users: 289, jobs: 138, revenue: 1650 }
]
```

### Category Format
```typescript
interface CategoryData {
  name: string              // Category name
  value: number             // Numeric value
}

Example:
[
  { name: "Completed", value: 450 },
  { name: "Running", value: 120 },
  { name: "Queued", value: 80 }
]
```

### Distribution Format
```typescript
interface DistributionData {
  name: string              // Item name
  value: number             // Percentage or count
  fill: string              // Color hex code
}

Example:
[
  { name: "Success", value: 92, fill: "#10b981" },
  { name: "Failed", value: 8, fill: "#ef4444" }
]
```

---

## ⚙️ Theme Support

### Automatic Theme Detection
Charts automatically detect dark/light theme:

```typescript
const { theme } = useTheme()  // "dark" | "light"
const colors = getChartTheme(isDark)
```

### Manual Theme Override
```typescript
const customTheme = {
  text: "#ffffff",
  grid: "#333333",
  primary: "#00ff00",
  // ... more colors
}
```

---

## 🎨 Customization

### Custom Tooltip
```typescript
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null
  
  return (
    <div className="custom-tooltip">
      <p>{label}</p>
      {payload.map(entry => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

// Use in chart:
<LineChart>
  <Tooltip content={<CustomTooltip />} />
</LineChart>
```

### Custom Colors
```typescript
<BarChartMetrics
  data={data}
  dataKeys={[
    { key: "completed", name: "Completed", fill: "#22c55e" },
    { key: "failed", name: "Failed", fill: "#dc2626" }
  ]}
/>
```

---

## 📈 Performance Optimization

### Lazy Load Charts
```typescript
import dynamic from "next/dynamic"

const AnalyticsDashboard = dynamic(
  () => import("@/components/dashboard/AnalyticsDashboard"),
  { loading: () => <DashboardSkeleton /> }
)
```

### Debounce Data Updates
```typescript
import { useDebouncedCallback } from "use-debounce"

const debouncedUpdate = useDebouncedCallback((data) => {
  setChartData(data)
}, 500)
```

### Memoize Chart Components
```typescript
const MemoizedChart = React.memo(LineChartMetrics, (prev, next) => {
  return JSON.stringify(prev.data) === JSON.stringify(next.data)
})
```

---

## 🔗 API Integration

### Fetch Analytics Data
```typescript
async function getAnalyticsData() {
  const response = await fetch('/api/admin/analytics')
  const data = await response.json()
  
  return {
    timeSeries: data.timeSeries,
    categories: data.categories,
    distribution: data.distribution
  }
}

// Use in component
const analyticsData = await getAnalyticsData()

<AnalyticsDashboard data={analyticsData} />
```

### Real-Time Updates
```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    const newData = await getAnalyticsData()
    setData(newData)
  }, 30000)  // Every 30 seconds
  
  return () => clearInterval(interval)
}, [])
```

---

## 🧪 Testing

### Mock Chart Data
```typescript
const mockTimeSeriesData = [
  { name: "Mon", users: 245, jobs: 120 },
  { name: "Tue", users: 312, jobs: 145 },
  { name: "Wed", users: 289, jobs: 138 }
]

// Test component
<LineChartMetrics data={mockTimeSeriesData} dataKey="users" />
```

### Snapshot Testing
```typescript
import { render } from "@testing-library/react"

test("renders line chart", () => {
  const { container } = render(
    <LineChartMetrics 
      data={mockTimeSeriesData} 
      dataKey="users" 
    />
  )
  expect(container).toMatchSnapshot()
})
```

---

## 🐛 Common Issues

### Charts Not Rendering
**Problem:** Empty chart
**Solution:** Check data format matches expected structure

```typescript
// ❌ Wrong
data = { name: "Mon" }

// ✅ Correct
data = { name: "Mon", value: 100 }
```

### Theme Not Updating
**Problem:** Charts stay same color in dark/light mode
**Solution:** Ensure `next-themes` is properly configured

```typescript
// Check ThemeProvider in layout.tsx
<ThemeProvider attribute="class" defaultTheme="dark">
  {children}
</ThemeProvider>
```

### Performance Issues
**Problem:** Slow rendering with large datasets
**Solution:** Resample data or use virtualization

```typescript
// Resample data to last 30 days
const resampledData = data.slice(-30)

<LineChartMetrics data={resampledData} />
```

---

## 📦 Dependencies

✅ **recharts** (^3.10.0) - Already installed
✅ **next-themes** (^0.4.6) - Already installed
✅ **react** (^19.2.7) - Already installed

**No additional dependencies required!**

---

## 🎯 Next Steps

1. ✅ Integrate with dashboard page
2. ✅ Connect to real API data
3. ✅ Add date range filters
4. ✅ Implement chart export (PNG/SVG)
5. ✅ Add comparison features (vs last month)
6. ✅ Create custom dashboards per user

---

## 📚 Resources

- [Recharts Documentation](https://recharts.org)
- [Component Props API](https://recharts.org/api)
- [Examples](https://recharts.org/examples)
- [GitHub](https://github.com/recharts/recharts)

---

**Status:** ✅ **Production Ready**
- All charts tested
- Theme support complete
- Performance optimized
- Fully typed & documented
