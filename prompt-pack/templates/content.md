# Content Platform Template

Ready-to-use template for building user-generated content platforms.

---

## Quick Start Prompt

```
You are building a Content Platform for [CONTENT TYPE - e.g., Blog posts, Videos, Podcasts].

BUSINESS CONTEXT:
- Target Creators: [WHO CREATES - e.g., Writers, YouTubers, Podcasters]
- Target Consumers: [WHO CONSUMES - e.g., Readers, Viewers, Listeners]
- Problem: [THE PROBLEM]
- Solution: [YOUR SOLUTION]
- Business Model: FREEMIUM with optional creator subscriptions/tips
- Primary Goal: Get creators to publish content, consumers to engage

USER ROLES:
- Public: Discover and view content
- Consumers: Like, comment, follow creators, save to playlists
- Creators: Publish content, manage content, view analytics
- Admin: Content moderation, user management

CORE PAGES:
- / - Content discovery feed (algorithmic or chronological)
- /content/[id] - Individual content page
- /creator/[slug] - Creator profile and content
- /category/[slug] - Category browsing
- /search - Search content
- /dashboard/viewer - Saved content, following, activity
- /dashboard/creator - Content management, analytics, settings
- /admin - Content moderation, reports, analytics

DATA STRUCTURE:
- users, profiles (with role: viewer, creator, admin)
- content (posts, videos, podcasts, etc.)
  - id, creator_id, title, description, content_url, thumbnail
  - category_id, tags[], status (draft/published/archived)
  - published_at, created_at
- comments (nested comments)
  - id, content_id, user_id, parent_comment_id, content
  - created_at
- likes (content_id, user_id)
- follows (follower_id, following_id)
- saves/playlists (user_id, name, content_ids[])
- categories (content categories)
- views (content_id, user_id, timestamp)

CONTENT TYPES:
- Main type: [blog posts, videos, podcasts, images]
- Supported formats: [LIST FORMATS]
- Max file size: [SIZE]

DISCOVERY:
- Feed algorithm: [chronological, trending, personalized]
- Search: [full-text, tags, categories]
- Categories: [LIST YOUR CATEGORIES]

SECURITY RULES:
- Public: View published content and creator profiles
- Viewers: Like, comment, follow, create playlists
- Creators: Manage own content, view own analytics
- Admin: Full access, content moderation powers

FEATURES:
- Content creation with rich editor or media upload
- Thumbnail/cover image
- Drafts and scheduling
- Like/comment system
- Follow creators
- Save to playlists/favorites
- Creator analytics (views, engagement, followers)
- Content scheduling
- Search and categories
- Report content for moderation

DELIVERABLES:
1. Complete database schema with nested comments
2. Content creation flow with drafts
3. Content discovery feed
4. Like, comment, follow functionality
5. Playlist/saves feature
6. Creator analytics dashboard
7. Content moderation tools
8. Search and filtering

Please generate the complete content platform.
```

---

## Nested Comments Pattern

```sql
-- Comments table with self-referencing for nesting
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recursive CTE to fetch nested comments
CREATE OR REPLACE FUNCTION public.get_content_comments(content_id UUID)
RETURNS TABLE (
  id UUID,
  content TEXT,
  user_id UUID,
  parent_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  depth INTEGER,
  path TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE comment_tree AS (
    -- Root comments
    SELECT
      c.id,
      c.content,
      c.user_id,
      c.parent_id,
      c.created_at,
      0 as depth,
      ARRAY[c.created_at::TEXT] as path
    FROM public.comments c
    WHERE c.content_id = $1 AND c.parent_id IS NULL

    UNION ALL

    -- Child comments
    SELECT
      c.id,
      c.content,
      c.user_id,
      c.parent_id,
      c.created_at,
      ct.depth + 1,
      ct.path || c.created_at::TEXT
    FROM public.comments c
    INNER JOIN comment_tree ct ON c.parent_id = ct.id
  )
  SELECT * FROM comment_tree
  ORDER BY path;
END;
$$ LANGUAGE plpgsql;
```

---

## Content Feed Algorithm

```typescript
// src/hooks/useContentFeed.ts
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type FeedAlgorithm = 'chronological' | 'trending' | 'following'

export function useContentFeed(algorithm: FeedAlgorithm = 'chronological') {
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeed()
  }, [algorithm])

  async function fetchFeed() {
    let query = supabase
      .from('content')
      .select('*, profiles:creator_id(*), likes(user_id)')
      .eq('status', 'published')

    switch (algorithm) {
      case 'chronological':
        query = query.order('published_at', { ascending: false })
        break

      case 'trending':
        // Calculate trending score (views + likes*2 + comments*3)
        query = supabase.rpc('get_trending_content', {
          days_ago: 7
        })
        break

      case 'following':
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Get followed creators
          const { data: following } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', user.id)

          const followingIds = following?.map(f => f.following_id)
          query = query.in('creator_id', followingIds)
        }
        query = query.order('published_at', { ascending: false })
        break
    }

    const { data } = await query
    setContent(data || [])
    setLoading(false)
  }

  return { content, loading }
}
```

---

## Creator Analytics

```typescript
// src/pages/creator/CreatorAnalyticsPage.tsx
export function CreatorAnalyticsPage() {
  const [stats, setStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalFollowers: 0,
    topContent: [],
    viewsOverTime: []
  })

  useEffect(() => {
    fetchAnalytics()
  }, [])

  return (
    <div className="creator-analytics">
      <h1>Creator Analytics</h1>

      <div className="stats-grid">
        <StatCard label="Total Views" value={stats.totalViews} icon="eye" />
        <StatCard label="Total Likes" value={stats.totalLikes} icon="heart" />
        <StatCard label="Comments" value={stats.totalComments} icon="comment" />
        <StatCard label="Followers" value={stats.totalFollowers} icon="users" />
      </div>

      <div className="analytics-section">
        <h2>Top Performing Content</h2>
        <TopContentList content={stats.topContent} />
      </div>

      <div className="analytics-section">
        <h2>Views Over Time</h2>
        <ViewsChart data={stats.viewsOverTime} />
      </div>
    </div>
  )
}

// Helper to calculate analytics
async function fetchCreatorAnalytics(creatorId: string) {
  const [views, likes, comments, followers] = await Promise.all([
    supabase
      .from('views')
      .select('*', { count: 'exact', head: true })
      .in('content_id',
        supabase.from('content').select('id').eq('creator_id', creatorId)
      ),
    supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .in('content_id',
        supabase.from('content').select('id').eq('creator_id', creatorId)
      ),
    supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .in('content_id',
        supabase.from('content').select('id').eq('creator_id', creatorId)
      ),
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', creatorId)
  ])

  // Get top content
  const { data: topContent } = await supabase
    .from('content')
    .select('*, views(count)')
    .eq('creator_id', creatorId)
    .order('views', { ascending: false })
    .limit(10)

  return {
    totalViews: views,
    totalLikes: likes,
    totalComments: comments,
    totalFollowers: followers,
    topContent
  }
}
```

---

## Content Scheduling

```typescript
// Schedule content for future publication
async function scheduleContent(contentData: any, publishAt: Date) {
  const { data: { user } } = await supabase.auth.getUser()

  // Create content as draft
  const { data: content } = await supabase
    .from('content')
    .insert({
      creator_id: user.id,
      ...contentData,
      status: 'draft',
      scheduled_for: publishAt.toISOString()
    })
    .select()
    .single()

  // Schedule publication (requires external cron or scheduled Edge Function)
  await scheduleTask({
    task: 'publish_content',
    content_id: content.id,
    run_at: publishAt
  })

  return content
}

// Scheduled task handler (cron job)
async function publishScheduledContent() {
  const dueContent = await supabase
    .from('content')
    .select('*')
    .eq('status', 'draft')
    .lte('scheduled_for', new Date().toISOString())

  for (const content of dueContent) {
    await supabase
      .from('content')
      .update({
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', content.id)

    // Notify followers
    await notifyFollowers(content.creator_id, content.id)
  }
}
```

---

## Database Schema

```sql
-- Content table
CREATE TABLE public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_url TEXT, -- For videos, audio, documents
  thumbnail TEXT,
  category_id UUID REFERENCES public.categories(id),
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments (self-referencing for nesting)
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_id, user_id)
);

-- Follows
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Views tracking
CREATE TABLE public.views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL for anonymous
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlists/Saves
CREATE TABLE public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.playlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playlist_id, content_id)
);

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id),
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_content_creator ON public.content(creator_id);
CREATE INDEX idx_content_status ON public.content(status);
CREATE INDEX idx_content_category ON public.content(category_id);
CREATE INDEX idx_comments_content ON public.comments(content_id);
CREATE INDEX idx_likes_content ON public.likes(content_id);
CREATE INDEX idx_views_content ON public.views(content_id);
CREATE INDEX idx_follows_following ON public.follows(following_id);

-- Enable full-text search
CREATE INDEX idx_content_search ON public.content USING gin(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
);

-- Enable RLS
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view published content"
  ON public.content FOR SELECT
  USING (status = 'published');

CREATE POLICY "Creators can manage own content"
  ON public.content FOR ALL
  USING (auth.uid() = creator_id);

CREATE POLICY "Public can view comments"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view likes"
  ON public.likes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage likes"
  ON public.likes FOR ALL
  USING (auth.uid() = user_id);
```

---

## Content Platform Types

| Type | Description | Key Features |
|------|-------------|--------------|
| **Blog** | Written articles | Rich text editor, markdown |
| **Video** | Video hosting | Video upload, transcoding, streaming |
| **Podcast** | Audio content | RSS feeds, episode management |
| **Image** | Photo sharing | Galleries, albums, filters |
| **Music** | Music streaming | Playlists, albums, artists |
| **Documents** | Document sharing | PDFs, slides, spreadsheets |

---

## Next Steps

1. **Customize with your content type**
2. **Implement Phase 1-3** for foundation
3. **Build content creation flow**
4. **Implement engagement features** (likes, comments, follows)
5. **Add discovery features** (search, categories, algorithmic feed)

---

## See Also

- [SaaS Template](./saas.md) - For subscription-based platforms
- [Marketplace Template](./marketplace.md) - For selling content
- [Community Template](../phases/phase-6-project-templates.md#template-5---communitysocial-platform) - For social features
