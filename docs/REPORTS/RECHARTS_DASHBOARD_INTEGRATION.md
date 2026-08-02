# Recharts Integration - Dashboard Page Setup

## How to Add Charts to Your Dashboard

### Current Dashboard Structure
```
DashboardHero
     ↓
StatisticsCards (4 KPI cards)
     ↓
Three-Column Grid:
  ├─ HealthPanel
  ├─ AnalyticsPanel (placeholder)
  └─ AuditLogs
```

---

## Option A: Add Full Analytics Dashboard (Recommended)

### Step 1: Import Component
```typescript
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard"
```

### Step 2: Create New Page/Route
Create `src/app/admin/(protected)/analytics/page.tsx`:

```typescript
"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";
import { useLocalizationContext } from "@/providers/localization";

export default function AnalyticsPage() {
  const { t } = useLocalizationContext();

  return (
    <AdminShell>
      <PageLayout
        title={t("admin.analytics", "Analytics")}
        breadcrumb={[{ label: t("admin.analytics", "Analytics") }]}
      >
        <AnalyticsDashboard
          title={t("admin.analytics", "Platform Analytics")}
          description="Real-time metrics and performance data"
          showMetrics={true}
        />
      </PageLayout>
    </AdminShell>
  );
}
```

### Step 3: Add Sidebar Link
In `src/components/admin/AdminSidebar.tsx`, add:

```typescript
{
  href: "/admin/(protected)/analytics",
  label: "Analytics",
  icon: BarChart3,
}
```

---

## Option B: Replace Placeholder in Current Dashboard

### Step 1: Update Dashboard Page
In `src/app/admin/page.tsx`, replace the AnalyticsPanel with AnalyticsDashboard:

```typescript
// Before:
<AnalyticsPanel
  title={t("admin.analytics.label", "Analytics")}
  metrics={analyticsMetrics}
  hasChart={true}
  chartHeight="md"
/>

// After:
<AnalyticsDashboard
  showMetrics={false}  // Hide metrics to fit grid
/>
```

---

## Option C: Use AnalyticsPanel with Real Charts

### Step 1: Update Dashboard Page
```typescript
import { generateTimeSeriesData } from "@/components/dashboard/ChartComponents"

// In component
const chartData = generateTimeSeriesData(14)

<AnalyticsPanel
  title={t("admin.analytics.label", "Analytics")}
  chartType="line"
  chartData={chartData}
  chartDataKey="users"
  chartLabel="Active Users"
  metrics={analyticsMetrics}
  hasChart={true}
  chartHeight="md"
/>
```

---

## Integration with Real API Data

### Step 1: Create API Endpoint
In `src/app/api/admin/analytics/route.ts`:

```typescript
export async function GET() {
  // Fetch your analytics data
  const timeSeries = await db.query('SELECT ...')
  const categories = await db.query('SELECT ...')
  const distribution = await db.query('SELECT ...')

  return Response.json({
    timeSeries,
    categories,
    distribution
  })
}
```

### Step 2: Fetch Data in Component
```typescript
import { useEffect, useState } from 'react'
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard"

export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(r => r.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
  }, [])

  return (
    <AnalyticsDashboard
      data={data}
      isLoading={loading}
    />
  )
}
```

### Step 3: Auto-Refresh Data
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    fetch('/api/admin/analytics')
      .then(r => r.json())
      .then(setData)
  }, 30000)  // Every 30 seconds

  return () => clearInterval(interval)
}, [])
```

---

## Data Mapping Examples

### From Your Database to Chart Format

#### Time Series (User Growth)
```typescript
// Database query
const users = await db
  .select()
  .from(userActivity)
  .where(sql`date >= NOW() - INTERVAL '30 days'`)

// Transform to chart format
const timeSeriesData = users.map(row => ({
  name: row.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  users: row.activeUsers,
  jobs: row.jobsProcessed,
  credits: row.creditsUsed
}))
```

#### Categories (Job Status)
```typescript
// Database query
const jobStats = await db
  .select({
    status: sql`CAST(status AS TEXT)`,
    count: sql`COUNT(*)`
  })
  .from(jobs)
  .groupBy(sql`status`)

// Transform to chart format
const categoryData = jobStats.map(row => ({
  name: row.status.charAt(0).toUpperCase() + row.status.slice(1),
  value: parseInt(row.count)
}))
```

#### Distribution (Success Rate)
```typescript
// Database query
const results = await db
  .select({
    status: sql`CAST(result AS TEXT)`,
    count: sql`COUNT(*)`
  })
  .from(jobResults)
  .groupBy(sql`result`)

// Transform to chart format
const distributionData = results.map(row => ({
  name: row.status === 'success' ? 'Success' : 'Failed',
  value: parseInt(row.count),
  fill: row.status === 'success' ? '#10b981' : '#ef4444'
}))
```

---

## Real-Time Updates with WebSocket

### Setup Real-Time Data
```typescript
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

export function useAnalyticsData() {
  const [data, setData] = useState(null)

  useEffect(() => {
    const socket = io('/analytics')

    socket.on('update', (newData) => {
      setData(newData)
    })

    return () => socket.disconnect()
  }, [])

  return data
}

// Use in component
const data = useAnalyticsData()
<AnalyticsDashboard data={data} />
```

---

## Custom Chart Layout

### Combine Multiple Charts
```typescript
import { LineChartMetrics, AreaChartMetrics } from "@/components/dashboard/ChartComponents"

<div className="grid gap-6 lg:grid-cols-2">
  <div>
    <h3>User Growth</h3>
    <LineChartMetrics 
      data={userData} 
      dataKey="users"
      name="Active Users"
    />
  </div>

  <div>
    <h3>Revenue</h3>
    <AreaChartMetrics 
      data={revenueData} 
      dataKey="revenue"
      name="Daily Revenue"
    />
  </div>
</div>
```

---

## Date Range Filtering

### Add Date Filter UI
```typescript
import { useState } from 'react'

export function AnalyticsWithFilter() {
  const [dateRange, setDateRange] = useState('7d')
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch(`/api/admin/analytics?range=${dateRange}`)
      .then(r => r.json())
      .then(setData)
  }, [dateRange])

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {['7d', '30d', '90d'].map(range => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={dateRange === range ? 'active' : ''}
          >
            {range === '7d' ? 'Week' : range === '30d' ? 'Month' : 'Quarter'}
          </button>
        ))}
      </div>

      <AnalyticsDashboard data={data} />
    </div>
  )
}
```

---

## Export Charts as Images

### Add Export Button
```typescript
import { BarChart3, Download } from 'lucide-react'
import html2canvas from 'html2canvas'

export function ChartExport({ chartRef }) {
  const handleExport = async () => {
    const canvas = await html2canvas(chartRef.current)
    const image = canvas.toDataURL('image/png')
    
    // Download
    const link = document.createElement('a')
    link.href = image
    link.download = `analytics-${new Date().toISOString()}.png`
    link.click()
  }

  return (
    <button onClick={handleExport} className="flex gap-2">
      <Download className="size-4" />
      Export
    </button>
  )
}
```

---

## Performance Tips

### 1. Lazy Load Charts
```typescript
import dynamic from 'next/dynamic'

const AnalyticsDashboard = dynamic(
  () => import('@/components/dashboard/AnalyticsDashboard'),
  { 
    loading: () => <DashboardSkeleton />,
    ssr: false  // Client-side only
  }
)
```

### 2. Memoize Data
```typescript
import { useMemo } from 'react'

const chartData = useMemo(() => {
  return data?.timeSeries?.map(row => ({
    ...row,
    users: parseInt(row.users)
  }))
}, [data])
```

### 3. Debounce Updates
```typescript
import { useDebouncedCallback } from 'use-debounce'

const debouncedUpdate = useDebouncedCallback((newData) => {
  setChartData(newData)
}, 300)
```

---

## Styling & Customization

### Custom Colors
```typescript
const CUSTOM_COLORS = {
  primary: '#0066ff',    // Your brand blue
  success: '#00b366',    // Your brand green
  warning: '#ff9900',    // Your brand amber
  critical: '#ff3333',   // Your brand red
}

<BarChartMetrics
  data={data}
  dataKeys={[
    { key: 'completed', fill: CUSTOM_COLORS.success },
    { key: 'failed', fill: CUSTOM_COLORS.critical }
  ]}
/>
```

### Dark Mode Override
```typescript
// In dashboard.css
.dark .recharts-cartesian-axis-tick {
  color: #e4e4e7;
}

.dark .recharts-legend-wrapper {
  color: #e4e4e7;
}
```

---

## Testing

### Mock Chart Data
```typescript
import { render } from '@testing-library/react'
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsDashboard'

const mockData = {
  timeSeries: [
    { name: 'Mon', users: 100, jobs: 50 },
    { name: 'Tue', users: 120, jobs: 60 }
  ],
  categories: [
    { name: 'Success', value: 90 },
    { name: 'Failed', value: 10 }
  ]
}

test('renders dashboard with data', () => {
  const { getByText } = render(
    <AnalyticsDashboard data={mockData} />
  )
  expect(getByText('Platform Analytics')).toBeInTheDocument()
})
```

---

## Deployment Checklist

- [ ] API endpoints configured
- [ ] Data fetching working
- [ ] Charts rendering correctly
- [ ] Theme switching works
- [ ] Mobile responsive
- [ ] Performance optimized
- [ ] Accessibility checked
- [ ] Error states handled
- [ ] Loading states working
- [ ] Real-time updates (if applicable)

---

## Troubleshooting

### Charts Not Rendering
```
Check:
1. Data format is correct
2. Recharts is installed
3. Component is mounted
4. No console errors
```

### Wrong Colors
```
Check:
1. Color hex codes are valid
2. Theme provider is set up
3. Dark/light mode is working
```

### Performance Issues
```
Solutions:
1. Reduce data points
2. Use lazy loading
3. Memoize components
4. Debounce updates
```

---

**Ready to go!** 🚀
