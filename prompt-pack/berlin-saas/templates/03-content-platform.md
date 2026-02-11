---
title: "Content Platform Template"
description: "Complete SaaS template for blogs, video platforms, and podcast hosting"
category: "Template"
tags: ["content", "media", "uploads", "s3", "cdn"]
difficulty: "Intermediate"
timeRequired: "20-30 hours"
dependencies: ["Phase 1", "Phase 2", "Phase 3", "Phase 4B"]
---

# Content Platform Template

> For: Blog platforms, video platforms, podcast hosting

---

## Quick Start

Use this template with the [Foundation Framework](../phases/01-foundation-framework.md).

---

## Business Context

```yaml
Target:
  Creators:
    - Writers, video makers, podcasters
    - Want to reach audience
    - Need analytics and monetization

  Consumers:
    - Want to discover content
    - Want to follow favorite creators
    - Want to engage (comments, likes)

Business Model:
  - Free with ads (creator revenue share)
  - OR Subscription for premium content
  - OR Tips/donations

Primary Goal:
  Get creators to upload content and consumers to engage
```

---

## User Roles & Permissions

| Role | Permissions |
|------|-------------|
| Public | Browse content, search, view public content |
| Viewer | All public + Follow creators, like, comment |
| Creator | All viewer + Upload content, manage content, view analytics |
| Moderator | All creator + Review flagged content, manage comments |
| Admin | Full platform access |

---

## Core Pages

### Public Pages
- Home/feed
- Trending content
- Category/browse
- Search
- Creator profiles
- Content detail pages

### Creator Pages
- Dashboard
- Upload content
- My content
- Analytics
- Comments moderation
- Earnings (if monetized)

### Admin Pages
- All content moderation
- User management
- Platform analytics
- Revenue reports (if applicable)

---

## Data Structure

```sql
-- Creators (profile extension)
CREATE TABLE creator_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  handle TEXT UNIQUE NOT NULL, -- @username
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  website_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  follower_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content (posts, videos, podcasts)
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES creator_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL, -- post, video, podcast
  content_url TEXT, -- S3/Cloudflare R2 URL
  thumbnail_url TEXT,
  duration INTEGER, -- For video/podcast (seconds)
  category TEXT,
  tags TEXT[],
  visibility TEXT DEFAULT 'public', -- public, private, unlisted
  status TEXT DEFAULT 'draft', -- draft, published, archived
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For replies
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- Nullable
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one like per user per item
  EXCLUDE (user_id WITH =) USING (
    CASE
      WHEN content_id IS NOT NULL THEN (content_id WITH =)
      WHEN comment_id IS NOT NULL THEN (comment_id WITH =)
    END
  )
);

-- Follows
CREATE TABLE follows (
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES creator_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),

  -- Prevent self-follows
  EXCLUDE (follower_id WITH =) USING (following_id WITH <>)
);

-- Playlists (for organizing content)
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  cover_url TEXT,
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playlist items
CREATE TABLE playlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(playlist_id, position)
);

-- Watch/Read history
CREATE TABLE content_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  progress_position INTEGER DEFAULT 0, -- For video/podcast (seconds)
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- like, comment, follow, mention
  actor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_content_creator ON content(creator_id);
CREATE INDEX idx_content_type_status ON content(content_type, status) WHERE status = 'published';
CREATE INDEX idx_content_published_at ON content(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_content_category ON content(category) WHERE status = 'published';
CREATE INDEX idx_content_tags ON content USING GIN(tags);
CREATE INDEX idx_comments_content ON comments(content_id);
CREATE INDEX idx_likes_user ON likes(user_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;
```

---

## RLS Policies

```sql
-- Enable RLS
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Creator profiles: Public read, owner write
CREATE POLICY "Public can view creator profiles"
ON creator_profiles FOR SELECT USING (true);

CREATE POLICY "Creators can update own profile"
ON creator_profiles FOR UPDATE USING (auth.uid() = id);

-- Content: Public read published, creator CRUD own
CREATE POLICY "Public can view published content"
ON content FOR SELECT USING (status = 'published' AND visibility = 'public');

CREATE POLICY "Creators can manage own content"
ON content FOR ALL USING (auth.uid() = creator_id);

-- Comments: Public read, authenticated create
CREATE POLICY "Public can view comments"
ON comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments"
ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
ON comments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
ON comments FOR DELETE USING (auth.uid() = user_id);

-- Likes: Public read, authenticated create/delete
CREATE POLICY "Public can view likes"
ON likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create likes"
ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
ON likes FOR DELETE USING (auth.uid() = user_id);

-- Follows: Public read, authenticated manage
CREATE POLICY "Public can view follows"
ON follows FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage follows"
ON follows FOR ALL USING (auth.uid() = follower_id);

-- Playlists: Public read public, user CRUD own
CREATE POLICY "Public can view public playlists"
ON playlists FOR SELECT USING (is_public = true);

CREATE POLICY "Users can manage own playlists"
ON playlists FOR ALL USING (auth.uid() = user_id);

-- History: User CRUD own
CREATE POLICY "Users can manage own history"
ON content_history FOR ALL USING (auth.uid() = user_id);

-- Notifications: User CRUD own
CREATE POLICY "Users can manage own notifications"
ON notifications FOR ALL USING (auth.uid() = user_id);
```

---

## Key Features

### 1. File Upload to S3/Cloudflare R2

```typescript
// lib/upload.ts
import { generateUploadButtonProps } from '@uploadthing/react'
import { createUploadthing } from 'uploadthing/server'

const f = createUploadthing()

export const uploadRouter = {
  contentUploader: f({
    image: { maxFileSize: '4MB', maxFileCount: 10 },
    video: { maxFileSize: '500MB', maxFileCount: 1 },
    audio: { maxFileSize: '200MB', maxFileCount: 1 }
  })
  .middleware(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
    return { userId: user.id }
  })
  .onUploadComplete(async ({ metadata, file }) => {
    // Store reference in database
    await supabase.from('content').insert({
      creator_id: metadata.userId,
      title: file.name,
      content_url: file.url,
      content_type: file.type.startsWith('video') ? 'video' :
                   file.type.startsWith('audio') ? 'podcast' : 'post',
      status: 'draft'
    })
  })
})
```

### 2. Feed Algorithm

```typescript
// hooks/useFeed.ts
export function useFeed(type: 'trending' | 'following' | 'latest') {
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeed()
  }, [type])

  async function loadFeed() {
    const { data: { user } } = await supabase.auth.getUser()
    let query

    if (type === 'trending') {
      // By views, likes, comments in last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      query = supabase
        .from('content')
        .select('*, creator:creator_id(display_name, avatar_url, handle)')
        .eq('status', 'published')
        .gte('published_at', sevenDaysAgo.toISOString())
        .order('view_count', { ascending: false })
        .limit(50)

    } else if (type === 'following') {
      // Content from followed creators
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)

      const followingIds = following?.map(f => f.following_id) || []

      query = supabase
        .from('content')
        .select('*, creator:creator_id(display_name, avatar_url, handle)')
        .eq('status', 'published')
        .in('creator_id', followingIds)
        .order('published_at', { ascending: false })

    } else {
      // Latest
      query = supabase
        .from('content')
        .select('*, creator:creator_id(display_name, avatar_url, handle)')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(50)
    }

    const { data } = await query
    setContent(data || [])
    setLoading(false)
  }

  return { content, loading }
}
```

### 3. Real-time Engagement

```typescript
// hooks/useContentEngagement.ts
export function useContentEngagement(contentId: string) {
  const [likes, setLikes] = useState(0)
  const [comments, setComments] = useState(0)
  const [liked, setLiked] = useState(false)
  const { data: { user } } = useAuth()

  useEffect(() => {
    // Load initial counts
    loadEngagement()

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`content-${contentId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'content',
        filter: `id=eq.${contentId}`
      }, (payload) => {
        if (payload.new) {
          setLikes(payload.new.like_count)
          setComments(payload.new.comment_count)
        }
      })
      .subscribe()

    // Check if user liked
    if (user) checkLiked()

    return () => supabase.removeChannel(channel)
  }, [contentId, user])

  async function loadEngagement() {
    const { data } = await supabase
      .from('content')
      .select('like_count, comment_count')
      .eq('id', contentId)
      .single()

    if (data) {
      setLikes(data.like_count)
      setComments(data.comment_count)
    }
  }

  async function checkLiked() {
    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('content_id', contentId)
      .single()

    setLiked(!!data)
  }

  async function toggleLike() {
    if (!user) return

    if (liked) {
      await supabase.from('likes').delete().match({
        user_id: user.id,
        content_id: contentId
      })
    } else {
      await supabase.from('likes').insert({
        user_id: user.id,
        content_id: contentId
      })
    }

    setLiked(!liked)
  }

  return { likes, comments, liked, toggleLike }
}
```

### 4. Creator Analytics Dashboard

```typescript
// components/CreatorDashboard.tsx
export function CreatorDashboard() {
  const [stats, setStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalContent: 0,
    totalFollowers: 0,
    topContent: []
  })

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const { data: { user } } = await supabase.auth.getUser()

    const [contentRes, followersRes] = await Promise.all([
      supabase
        .from('content')
        .select('view_count, like_count')
        .eq('creator_id', user.id)
        .eq('status', 'published'),

      supabase
        .from('creator_profiles')
        .select('follower_count')
        .eq('id', user.id)
        .single()
    ])

    const totalViews = contentRes.data?.reduce((sum, c) => sum + c.view_count, 0) || 0
    const totalLikes = contentRes.data?.reduce((sum, c) => sum + c.like_count, 0) || 0

    setStats({
      totalViews,
      totalLikes,
      totalContent: contentRes.data?.length || 0,
      totalFollowers: followersRes.data?.follower_count || 0
    })
  }

  return (
    <div className="dashboard">
      <div className="stat-card">
        <label>Total Views</label>
        <value>{stats.totalViews.toLocaleString()}</value>
      </div>
      <div className="stat-card">
        <label>Total Likes</label>
        <value>{stats.totalLikes.toLocaleString()}</value>
      </div>
      <div className="stat-card">
        <label>Content</label>
        <value>{stats.totalContent}</value>
      </div>
      <div className="stat-card">
        <label>Followers</label>
        <value>{stats.totalFollowers.toLocaleString()}</value>
      </div>
    </div>
  )
}
```

---

## Content Player/Viewer

```typescript
// components/ContentPlayer.tsx
export function ContentPlayer({ content }: { content: any }) {
  const [progress, setProgress] = useState(0)
  const { data: { user } } = useAuth()
  const playerRef = useRef<HTMLVideoElement>(null)

  // Save progress periodically
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      if (playerRef.current) {
        const currentTime = Math.floor(playerRef.current.currentTime)
        saveProgress(currentTime)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [user, content.id])

  // Load saved progress
  useEffect(() => {
    loadProgress()
  }, [content.id, user])

  async function loadProgress() {
    if (!user) return

    const { data } = await supabase
      .from('content_history')
      .select('progress_position')
      .eq('user_id', user.id)
      .eq('content_id', content.id)
      .single()

    if (data && playerRef.current) {
      playerRef.current.currentTime = data.progress_position
    }
  }

  async function saveProgress(position: number) {
    await supabase.from('content_history').upsert({
      user_id: user.id,
      content_id: content.id,
      progress_position: position,
      completed: position >= content.duration - 10
    })
  }

  // Increment view count on mount
  useEffect(() => {
    incrementViewCount()
  }, [content.id])

  async function incrementViewCount() {
    await supabase.rpc('increment_view_count', { content_id: content.id })
  }

  if (content.content_type === 'video') {
    return (
      <div className="content-player">
        <video
          ref={playerRef}
          src={content.content_url}
          controls
          poster={content.thumbnail_url}
        />
      </div>
    )
  }

  // ... handle other content types
}
```

---

## Notifications System

```typescript
// hooks/useNotifications.ts
export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { data: { user } } = useAuth()

  useEffect(() => {
    if (!user) return

    loadNotifications()

    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, async (payload) => {
        setNotifications(prev => [payload.new, ...prev])
        setUnreadCount(prev => prev + 1)

        // Show toast
        toast.show(getNotificationText(payload.new), {
          type: 'info',
          duration: 5000
        })
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  async function loadNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*, actor:actor_id(display_name, avatar_url)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    setNotifications(data || [])
    setUnreadCount(data?.filter(n => !n.read).length || 0)
  }

  async function markAsRead(notificationId: string) {
    await supabase.from('notifications')
      .update({ read: true })
      .eq('id', notificationId)

    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  async function markAllAsRead() {
    await supabase.from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)

    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
    setUnreadCount(0)
  }

  return { notifications, unreadCount, markAsRead, markAllAsRead }
}

function getNotificationText(notification: any) {
  switch (notification.type) {
    case 'like':
      return `${notification.actor.display_name} liked your content`
    case 'comment':
      return `${notification.actor.display_name} commented on your content`
    case 'follow':
      return `${notification.actor.display_name} started following you`
    case 'mention':
      return `${notification.actor.display_name} mentioned you`
    default:
      return 'New notification'
  }
}
```

---

## Monetization Options

| Model | Description | Split |
|-------|-------------|-------|
| Ad revenue | Platform shows ads, creators get share | 70% creator / 30% platform |
| Subscription | Users pay for premium content | 70% creator / 30% platform |
| Tips/donations | Users can tip creators directly | 95% creator / 5% platform |
| Sponsorships | Brands pay creators for sponsored content | 100% creator (platform listing fee) |

---

## What's Next

1. Set up file storage (S3, Cloudflare R2)
2. Implement upload functionality
3. Build content player/viewer
4. Add search and recommendations
5. Implement moderation tools

---

*Part of the [Berlin Solopreneur SaaS Prompt Pack](../README.md)*
