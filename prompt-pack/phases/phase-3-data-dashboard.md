# Phase 3: Data & Dashboard Patterns

---

## Prompt 3A - User Dashboard Data

For displaying user-specific data in dashboards.

---

## Requirements

Create user dashboard data system using Supabase PostgreSQL + RLS.

### Data Structure (Customizable)

```sql
-- Example: Document Analyzer Dashboard
-- Create documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analyses table
CREATE TABLE public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  summary TEXT,
  key_points JSONB,
  analysis_result JSONB,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX idx_analyses_document_id ON public.analyses(document_id);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
```

---

## Dashboard Widgets

```
WIDGET 1 - Recent Activity
- Shows last 5 [ENTITIES]
- Links to detail pages
- Status indicators

WIDGET 2 - Quick Stats
- Total [ENTITIES] count
- This week/month activity
- Percentage change indicator

WIDGET 3 - Actions/CTAs
- Primary action button
- Secondary actions
- Empty state with helpful guidance
```

---

## UI Behavior

- Real-time updates using Supabase Realtime
- Empty states with helpful CTAs
- Loading skeletons for better UX
- Pagination for lists (25 items per page)
- Sortable columns
- Search/filter functionality

---

## NO BROWSER PROMPTS

- All actions use in-app modals
- Confirm before destructive actions
- Show toast notifications for feedback

---

## Security

- RLS ensures users see only their own data
- Server-side aggregation for counts
- Client receives only what they own

---

## Deliverables

### 1. Database Migrations

```sql
-- User documents RLS policies
CREATE POLICY "Users can view their own documents"
  ON public.documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON public.documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON public.documents FOR DELETE
  USING (auth.uid() = user_id);

-- User analyses RLS policies (same pattern)
CREATE POLICY "Users can view their own analyses"
  ON public.analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyses"
  ON public.analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.analyses;
```

### 2. Dashboard Page Component

```typescript
// src/pages/app/DashboardPage.tsx
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { Document, Analysis } from '../../types'

export function DashboardPage() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    subscribeToChanges()
  }, [user])

  async function fetchDashboardData() {
    const [docsResult, analysesResult] = await Promise.all([
      supabase
        .from('documents')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('analyses')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5)
    ])

    if (docsResult.data) setDocuments(docsResult.data)
    if (analysesResult.data) setAnalyses(analysesResult.data)
    setLoading(false)
  }

  function subscribeToChanges() {
    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'documents',
        filter: `user_id=eq.${user?.id}`
      }, () => fetchDashboardData())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'analyses',
        filter: `user_id=eq.${user?.id}`
      }, () => fetchDashboardData())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }

  if (loading) return <DashboardSkeleton />

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Welcome back!</h1>
        <button className="primary-action">New [ENTITY]</button>
      </header>

      <div className="dashboard-widgets">
        {/* Quick Stats Widget */}
        <div className="widget stats-widget">
          <h2>Overview</h2>
          <div className="stats-grid">
            <StatCard
              label="Total [ENTITIES]"
              value={documents.length}
              change="+12%"
            />
            <StatCard
              label="[METRIC 2]"
              value={analyses.length}
              change="+5%"
            />
          </div>
        </div>

        {/* Recent Activity Widget */}
        <div className="widget activity-widget">
          <h2>Recent Activity</h2>
          {documents.length === 0 ? (
            <EmptyState
              message="No [ENTITIES] yet"
              cta="Create your first [ENTITY]"
              action={() => {/* navigate to create */}}
            />
          ) : (
            <ActivityList items={documents} />
          )}
        </div>

        {/* Actions Widget */}
        <div className="widget actions-widget">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <ActionButton label="Upload [ENTITY]" icon="upload" />
            <ActionButton label="View Reports" icon="chart" />
            <ActionButton label="Settings" icon="settings" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Supporting components
function StatCard({ label, value, change }: { label: string; value: number; change?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {change && <div className="stat-change positive">{change}</div>}
    </div>
  )
}

function EmptyState({ message, cta, action }: { message: string; cta: string; action: () => void }) {
  return (
    <div className="empty-state">
      <p>{message}</p>
      <button onClick={action} className="primary-action">{cta}</button>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="dashboard-page">
      <div className="skeleton-header" />
      <div className="dashboard-widgets">
        <div className="widget skeleton" />
        <div className="widget skeleton" />
        <div className="widget skeleton" />
      </div>
    </div>
  )
}
```

### 3. Modal Components

```typescript
// src/components/ui/Modal.tsx
import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="modal-close">&times;</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}
```

### 4. Toast Notifications

```typescript
// src/components/ui/Toast.tsx
import { createContext, useContext, useState, ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  function showToast(message: string, type: ToastType = 'info') {
    const id = Math.random().toString(36)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
```

### 5. Real-time Subscriptions

```typescript
// Hook for real-time data
// src/hooks/useRealtimeData.ts
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useRealtimeData<T>(
  table: string,
  filter: { column: string; value: string }
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel(`realtime-${table}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table,
        filter: `${filter.column}=eq.${filter.value}`
      }, () => fetchData())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [table, filter])

  async function fetchData() {
    const { data } = await supabase
      .from(table)
      .select('*')
      .eq(filter.column, filter.value)
      .order('created_at', { ascending: false })

    if (data) setData(data as T[])
    setLoading(false)
  }

  return { data, loading, refresh: fetchData }
}
```

---

## CSS Styles

```css
/* Dashboard page styles */
.dashboard-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-widgets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.widget {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border);
}

.widget h2 {
  margin: 0 0 1rem;
  font-size: 1.125rem;
  color: var(--text-secondary);
}

/* Stats widget */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-card {
  background: var(--bg-tertiary);
  padding: 1rem;
  border-radius: 8px;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-change {
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.stat-change.positive { color: var(--success); }
.stat-change.negative { color: var(--error); }

/* Empty state */
.empty-state {
  text-align: center;
  padding: 2rem;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

/* Skeleton loading */
.skeleton {
  background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  min-height: 200px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
}

/* Toast notifications */
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toast {
  padding: 1rem 1.5rem;
  border-radius: 8px;
  background: var(--bg-secondary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease-out;
}

.toast-success { border-left: 4px solid var(--success); }
.toast-error { border-left: 4px solid var(--error); }
.toast-info { border-left: 4px solid var(--accent); }

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
```

---

## Prompt 3B - Admin Dashboard Data

For platform-wide analytics and management.

---

## Data Structure

```sql
-- Admin-specific tables
CREATE TABLE public.admin_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  new_signups INTEGER DEFAULT 0
);

CREATE TABLE public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Only admins can view metrics"
  ON public.admin_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can view logs"
  ON public.admin_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

---

## Dashboard Metrics

```
1. Total Users - count from profiles
2. Active Users (last 7 days) - count from last_login
3. Total Revenue - sum from payments
4. New Signups (this week) - count from profiles
5. Conversion Rate - signups / visitors
```

---

## Admin Sections

```
- Users - Manage all users (view, edit, delete)
- Subscriptions - Manage subscriptions and plans
- Content/Entities - Manage platform content
- Analytics/Reports - View metrics and trends
- System Logs - View admin actions
```

---

## Security

- Check `user.role === 'admin'` before allowing access
- RLS: Only admins can read/write admin tables
- Server-side validation for all admin actions
- Audit trail for all admin actions

---

## Deliverables

### 1. Admin Dashboard Component

```typescript
// src/pages/admin/AdminDashboardPage.tsx
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

export function AdminDashboardPage() {
  const { profile } = useAuth()
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    newSignups: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.role !== 'admin') {
      window.location.href = '/dashboard'
      return
    }
    fetchMetrics()
  }, [profile])

  async function fetchMetrics() {
    const [usersCount, activeCount, revenueData, newUsers] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true })
        .gt('last_login', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('payments').select('amount'),
      supabase.from('profiles').select('id', { count: 'exact', head: true })
        .gt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    ])

    setMetrics({
      totalUsers: usersCount.count || 0,
      activeUsers: activeCount.count || 0,
      totalRevenue: revenueData.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
      newSignups: newUsers.count || 0
    })
    setLoading(false)
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="admin-metrics">
        <MetricCard label="Total Users" value={metrics.totalUsers} />
        <MetricCard label="Active Users" value={metrics.activeUsers} />
        <MetricCard label="Total Revenue" value={`€${metrics.totalRevenue}`} />
        <MetricCard label="New Signups" value={metrics.newSignups} />
      </div>
      <div className="admin-sections">
        <AdminUsersList />
        <AdminAnalytics />
      </div>
    </div>
  )
}
```

### 2. Admin Users List

```typescript
// src/components/admin/AdminUsersList.tsx
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export function AdminUsersList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  async function updateUserRole(userId: string, newRole: string) {
    await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
    fetchUsers()
  }

  return (
    <div className="admin-section">
      <h2>Users Management</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{new Date(user.created_at).toLocaleDateString()}</td>
              <td>
                <select
                  value={user.role}
                  onChange={(e) => updateUserRole(user.id, e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### 3. Admin Analytics

```typescript
// src/components/admin/AdminAnalytics.tsx
export function AdminAnalytics() {
  return (
    <div className="admin-section">
      <h2>Analytics & Reports</h2>
      <div className="analytics-grid">
        <AnalyticsChart title="User Growth" type="line" />
        <AnalyticsChart title="Revenue" type="bar" />
      </div>
    </div>
  )
}
```

---

## Next Steps

After implementing dashboards:

1. **Add Payments** → Go to [Phase 4A: Stripe Payments](./phase-4-common-features.md#prompt-4a-stripe-payments)
2. **Add Real-time** → Go to [Phase 4B: Real-time Features](./phase-4-common-features.md#prompt-4b-real-time-features)
