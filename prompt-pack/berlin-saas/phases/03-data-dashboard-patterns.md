---
title: "Phase 3: Data & Dashboard Patterns"
description: "Create user and admin dashboard data systems with Supabase PostgreSQL and RLS"
category: "Data & Dashboards"
tags: ["supabase", "dashboard", "postgresql", "rls", "realtime"]
difficulty: "Intermediate"
timeRequired: "3-4 hours"
dependencies: ["Phase 1: Foundation Framework", "Phase 2: Authentication Patterns"]
order: 3
---

# Phase 3: Data & Dashboard Patterns

---

## Prompt 3A: User Dashboard Data

**For displaying user-specific data**

---

### Data Structure Template

```sql
-- All data under users/{uid}
CREATE TABLE user_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  [FIELD_1] [TYPE],
  [FIELD_2] [TYPE],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own data" ON user_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data" ON user_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data" ON user_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own data" ON user_data
  FOR DELETE USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_user_data_user_id ON user_data(user_id);
```

---

### Dashboard Widgets Pattern

```typescript
// components/Dashboard.tsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Widget {
  title: string
  metric: string | number
  source: string
  loading: boolean
}

export function Dashboard() {
  const [widgets, setWidgets] = useState<Widget[]>([])

  useEffect(() => {
    loadDashboardData()

    // Real-time subscription
    const channel = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_data',
        filter: `user_id=eq.${supabase.auth.getUser().data.user.id}`
      }, () => loadDashboardData())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function loadDashboardData() {
    // Load all widgets in parallel
  }

  return (
    <div className="dashboard">
      {widgets.map(widget => (
        <div key={widget.title} className="widget">
          <h3>{widget.title}</h3>
          {widget.loading ? (
            <Skeleton />
          ) : (
            <p className="metric">{widget.metric}</p>
          )}
        </div>
      ))}
    </div>
  )
}
```

---

### UI Behavior Requirements

- ✅ Real-time updates using Supabase Realtime
- ✅ Empty states with helpful CTAs
- ✅ Loading skeletons for better UX
- ✅ Pagination for lists (25 items per page)

---

### No Browser Prompts

- ❌ No alerts or confirms
- ✅ Use in-app modals for all actions
- ✅ Confirm before destructive actions
- ✅ Toast notifications for feedback

---

### Security Requirements

```yaml
RLS Enforcement:
  - Users see only their own data
  - Server-side aggregation for counts
  - Client receives only what they own
```

---

### Output Deliverables

1. ✅ Database migrations for user data tables
2. ✅ RLS policies
3. ✅ Dashboard page with all widgets
4. ✅ Modal components for actions
5. ✅ Real-time subscriptions

---

## Prompt 3B: Admin Dashboard Data

**For platform-wide analytics and management**

---

### Admin Role Setup

```sql
-- Add role column to profiles
ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';

-- Create admin policy function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
$$ LANGUAGE sql SECURITY DEFINER;

-- Admin-only policy example
CREATE POLICY "Admins can view all" ON [TABLE_NAME]
  FOR SELECT USING (is_admin());
```

---

### Dashboard Metrics Pattern

```typescript
// lib/admin-analytics.ts
export async function getAdminMetrics() {
  const [
    totalUsers,
    totalRevenue,
    activeUsers,
    conversionRate
  ] = await Promise.all([
    // Total users
    supabase.from('profiles').select('id', { count: 'exact', head: true }),

    // Total revenue
    supabase.from('payments').select('amount').then(({ data }) => ({
      sum: data?.reduce((acc, p) => acc + p.amount, 0) || 0
    })),

    // Active users (last 30 days)
    supabase.from('user_sessions')
      .select('user_id', { count: 'exact', head: true })
      .gte('last_active', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),

    // Conversion rate
    supabase.rpc('calculate_conversion_rate')
  ])

  return {
    totalUsers: totalUsers.count || 0,
    totalRevenue: totalRevenue.sum || 0,
    activeUsers: activeUsers.count || 0,
    conversionRate: conversionRate.data || 0
  }
}
```

---

### Admin Sections Template

```yaml
SECTIONS:
  - [SECTION_1]:
      description: Manage [ENTITY]
      actions: [create, read, update, delete]

  - [SECTION_2]:
      description: Manage [ENTITY]
      actions: [create, read, update, delete]

  - [SECTION_3]:
      description: Manage [ENTITY]
      actions: [create, read, update, delete]

  - Analytics/Reports:
      description: Platform-wide insights
      actions: [read only]
```

---

### Security Requirements

```yaml
Admin Access:
  - Check user.role === 'admin' before allowing access
  - RLS: Only admins can read/write admin tables
  - Server-side validation for all admin actions
```

---

### Output Deliverables

1. ✅ Admin-specific migrations and RLS
2. ✅ Admin dashboard page
3. ✅ Management pages for each entity
4. ✅ Analytics/reports page
5. ✅ Admin-only API functions (if needed)

---

## Real-time Subscription Pattern

```typescript
// hooks/useRealtimeData.ts
export function useRealtimeData<T>(
  table: string,
  filter?: string
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial load
    loadData()

    // Subscribe to changes
    const channel = supabase
      .channel(`realtime-${table}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table,
        filter: filter ? `user_id=eq.${filter}` : undefined
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setData(prev => [...prev, payload.new as T])
        } else if (payload.eventType === 'UPDATE') {
          setData(prev => prev.map(item =>
            item.id === payload.new.id ? payload.new as T : item
          ))
        } else if (payload.eventType === 'DELETE') {
          setData(prev => prev.filter(item => item.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter])

  async function loadData() {
    setLoading(true)
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setData(data)
    setLoading(false)
  }

  return { data, loading, refresh: loadData }
}
```

---

## Setup Checklist

- [ ] Create user data tables with RLS
- [ ] Set up admin role and permissions
- [ ] Create dashboard widgets
- [ ] Enable Realtime on relevant tables
- [ ] Add indexes for performance
- [ ] Test RLS policies thoroughly

---

## Next Steps

After completing Phase 3:

1. → Add [Phase 4A: Stripe Payments](./04-common-features.md) for monetization
2. → Add [Phase 4B: Real-time Features](./04-common-features.md) for live updates
3. → Implement [Phase 8: WhatsApp & AI](./08-whatsapp-ai-integration.md) for advanced features

---

*Part of the [Berlin Solopreneur SaaS Prompt Pack](../README.md)*
