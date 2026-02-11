# Phase 5: RLS Policy Templates

Row Level Security templates for common access patterns in Supabase/PostgreSQL.

---

## Template 1 - User-Only Data

Basic pattern where users can only access their own data.

---

### Schema

```sql
-- Example: User profiles, documents, settings
CREATE TABLE public.user_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  data TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;
```

### RLS Policies

```sql
-- Users can view their own data
CREATE POLICY "Users can view own data"
  ON public.user_data FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own data
CREATE POLICY "Users can insert own data"
  ON public.user_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON public.user_data FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own data
CREATE POLICY "Users can delete own data"
  ON public.user_data FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Template 2 - Multi-Role (User + Admin)

Pattern with regular users and admins who have full access.

---

### Helper Function

```sql
-- Create helper function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;
```

### RLS Policies

```sql
-- Public read access for public resources
CREATE POLICY "Public can view public resources"
  ON public.public_resources FOR SELECT
  USING (true);

-- Users can manage own data, admins can manage all
CREATE POLICY "Users and admins can view data"
  ON public.user_data FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users and admins can insert data"
  ON public.user_data FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users and admins can update data"
  ON public.user_data FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users and admins can delete data"
  ON public.user_data FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- Admin-only resources
CREATE POLICY "Only admins can view admin data"
  ON public.admin_data FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Only admins can modify admin data"
  ON public.admin_data FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
```

---

## Template 3 - Multi-Tenant Architecture

Pattern for SaaS applications where each tenant has isolated data.

---

### Schema

```sql
-- Tenants table
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenant memberships
CREATE TABLE public.tenant_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  UNIQUE(tenant_id, user_id)
);

-- Tenant data (isolated per tenant)
CREATE TABLE public.tenant_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_data ENABLE ROW LEVEL SECURITY;
```

### RLS Policies

```sql
-- Helper function to get user's tenant role
CREATE OR REPLACE FUNCTION public.get_tenant_role(tenant_id UUID)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.tenant_members
  WHERE tenant_members.tenant_id = $1
    AND tenant_members.user_id = auth.uid();
$$;

-- Helper function to check if user is tenant member
CREATE OR REPLACE FUNCTION public.is_tenant_member(tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE tenant_members.tenant_id = $1
      AND tenant_members.user_id = auth.uid()
  );
$$;

-- Tenant members can view their membership
CREATE POLICY "Users can view own tenant memberships"
  ON public.tenant_members FOR SELECT
  USING (user_id = auth.uid());

-- Tenant data policies
CREATE POLICY "Tenant members can view tenant data"
  ON public.tenant_data FOR SELECT
  USING (public.is_tenant_member(tenant_id));

CREATE POLICY "Tenant admins can insert tenant data"
  ON public.tenant_data FOR INSERT
  WITH CHECK (
    public.is_tenant_member(tenant_id) AND
    public.get_tenant_role(tenant_id) IN ('owner', 'admin')
  );

CREATE POLICY "Tenant admins can update tenant data"
  ON public.tenant_data FOR UPDATE
  USING (
    public.is_tenant_member(tenant_id) AND
    public.get_tenant_role(tenant_id) IN ('owner', 'admin')
  );

CREATE POLICY "Tenant owners can delete tenant data"
  ON public.tenant_data FOR DELETE
  USING (
    public.is_tenant_member(tenant_id) AND
    public.get_tenant_role(tenant_id) = 'owner'
  );
```

---

## Template 4 - Public Read, User Write

Pattern for content platforms where content is publicly readable but only creators can modify.

---

### Schema

```sql
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
```

### RLS Policies

```sql
-- Public can view published posts
CREATE POLICY "Public can view published posts"
  ON public.posts FOR SELECT
  USING (published = true);

-- Users can view all their own posts (including drafts)
CREATE POLICY "Users can view own posts"
  ON public.posts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create posts
CREATE POLICY "Users can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Template 5 - Follow/Relationship System

Pattern for social features with following/followers.

---

### Schema

```sql
-- Follows table (self-referencing relationship)
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES auth.users NOT NULL,
  following_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- User profiles with follower counts
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  username TEXT UNIQUE,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### RLS Policies

```sql
-- Anyone can see who follows whom
CREATE POLICY "Public can view follows"
  ON public.follows FOR SELECT
  USING (true);

-- Users can manage their own follows
CREATE POLICY "Users can create follows"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete own follows"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Public profiles
CREATE POLICY "Public can view profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

### Auto-update Counters

```sql
-- Function to update follower counts
CREATE OR REPLACE FUNCTION public.update_follower_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment following count for follower
    UPDATE public.profiles
    SET following_count = following_count + 1
    WHERE id = NEW.follower_id;

    -- Increment followers count for following
    UPDATE public.profiles
    SET followers_count = followers_count + 1
    WHERE id = NEW.following_id;

    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement following count for follower
    UPDATE public.profiles
    SET following_count = GREATEST(0, following_count - 1)
    WHERE id = OLD.follower_id;

    -- Decrement followers count for following
    UPDATE public.profiles
    SET followers_count = GREATEST(0, followers_count - 1)
    WHERE id = OLD.following_id;

    RETURN OLD;
  END IF;
END;
$$;

-- Create trigger
CREATE TRIGGER update_follower_counts_trigger
  AFTER INSERT OR DELETE ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_follower_counts();
```

---

## Template 6 - Time-Based Access

Pattern for subscription-based access or expiring content.

---

### Schema

```sql
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  plan_id TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.premium_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  requires_subscription BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_content ENABLE ROW LEVEL SECURITY;
```

### RLS Policies

```sql
-- Helper to check active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = auth.uid()
      AND status = 'active'
      AND expires_at > NOW()
  );
$$;

-- Users can view own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Public can view free content
CREATE POLICY "Public can view free content"
  ON public.premium_content FOR SELECT
  USING (NOT requires_subscription);

-- Users with active subscription can view premium content
CREATE POLICY "Subscribers can view premium content"
  ON public.premium_content FOR SELECT
  USING (NOT requires_subscription OR public.has_active_subscription());
```

---

## Template 7 - Workspace/Team Sharing

Pattern for collaborative workspaces with sharing permissions.

---

### Schema

```sql
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users NOT NULL
);

CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  UNIQUE(workspace_id, user_id)
);

CREATE TABLE public.workspace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users,
  title TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_items ENABLE ROW LEVEL SECURITY;
```

### RLS Policies

```sql
-- Users can see their workspace memberships
CREATE POLICY "Users can view workspace memberships"
  ON public.workspace_members FOR SELECT
  USING (user_id = auth.uid());

-- Helper to check workspace role
CREATE OR REPLACE FUNCTION public.get_workspace_role(workspace_id UUID)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.workspace_members
  WHERE workspace_members.workspace_id = $1
    AND workspace_members.user_id = auth.uid();
$$;

-- Workspace items based on role
CREATE POLICY "Workspace members can view items"
  ON public.workspace_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = workspace_items.workspace_id
        AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace editors can create items"
  ON public.workspace_items FOR INSERT
  WITH CHECK (
    public.get_workspace_role(workspace_id) IN ('owner', 'editor')
  );

CREATE POLICY "Workspace editors can update items"
  ON public.workspace_items FOR UPDATE
  USING (
    public.get_workspace_role(workspace_id) IN ('owner', 'editor')
  );

CREATE POLICY "Workspace owners can delete items"
  ON public.workspace_items FOR DELETE
  USING (
    public.get_workspace_role(workspace_id) = 'owner'
  );
```

---

## Best Practices

### 1. Always use Security Definer for helper functions

```sql
CREATE OR REPLACE FUNCTION public.helper_function()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER  -- Run with function owner's permissions
SET search_path = public  -- Isolate from search_path attacks
AS $$
  -- Your logic here
$$;
```

### 2. Use proper indexes for RLS performance

```sql
-- Index foreign keys used in RLS policies
CREATE INDEX idx_user_data_user_id ON public.user_data(user_id);
CREATE INDEX idx_tenant_data_tenant_id ON public.tenant_data(tenant_id);
```

### 3. Test RLS policies

```sql
-- Set role to test as specific user
SET LOCAL role = postgres;  -- Reset to admin
SET LOCAL role = 'auth.uid() placeholder';  -- Test with user context

-- View effective policies for a table
SELECT * FROM pg_policies WHERE tablename = 'user_data';
```

### 4. Use policy names that document their purpose

```sql
-- Good: Descriptive name
CREATE POLICY "Users can view own data when published"
  ON public.data FOR SELECT
  USING (user_id = auth.uid() AND published = true);

-- Bad: Vague name
CREATE POLICY "policy_1"
  ON public.data FOR SELECT
  USING (user_id = auth.uid());
```

---

## Next Steps

After implementing RLS policies:

1. **Use Project Templates** → Go to [Phase 6: Project Templates](./phase-6-project-templates.md)
2. **Audit Security** → Go to [Phase 7: Security Audit](./phase-7-troubleshooting.md#security-audit)
