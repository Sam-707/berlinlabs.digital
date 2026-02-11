---
title: "Community & Social Platform Template"
description: "Complete SaaS template for forums, groups, and social networks"
category: "Template"
tags: ["community", "social", "forum", "groups"]
difficulty: "Intermediate"
timeRequired: "20-30 hours"
dependencies: ["Phase 1", "Phase 2", "Phase 3", "Phase 4B"]
---

# Community & Social Platform Template

> For: Forums, groups, social networks

---

## Quick Start

Use this template with the [Foundation Framework](../phases/01-foundation-framework.md).

---

## Business Context

```yaml
Target:
  People with shared interests who want to connect, share, and engage with each other

Business Model:
  - Free with optional premium memberships
  - OR Ad-supported
  - OR Paid groups

Primary Goal:
  Get users to join, engage, and build active communities
```

---

## User Roles & Permissions

| Role | Permissions |
|------|-------------|
| Public | Browse public posts, view public groups, limited search |
| Member | All public + Create posts, comment, like, join groups, follow users |
| Moderator | All member + Review flagged content, manage group membership, access moderation tools |
| Admin | Full platform access |

---

## Core Pages

### Public Pages
- Home/feed
- Trending posts
- Explore/discover
- Group directory
- Public group pages

### Member Pages
- Personalized feed (following)
- My posts
- My groups
- Saved posts
- Messages/notifications
- Profile
- Settings

### Moderator Pages
- Moderation queue
- Flagged content review
- User management
- Group membership management

### Admin Pages
- All users
- All groups
- All posts (including deleted)
- Platform analytics
- System settings

---

## Data Structure

```sql
-- User profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  website_url TEXT,
  location TEXT,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groups/Communities
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  type TEXT DEFAULT 'public', -- public, private, restricted
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group membership
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- member, moderator, admin
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL, -- Null for personal posts
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'text', -- text, image, link, poll, video
  images TEXT[],
  link_url TEXT,
  link_preview JSONB, -- Store OpenGraph data
  poll_options JSONB, -- {options: [{text, votes}]}
  poll_expires_at TIMESTAMPTZ,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE, -- Disable comments
  visibility TEXT DEFAULT 'public', -- public, followers, group
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For nested replies
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes (posts and comments)
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one like per item
  EXCLUDE (user_id WITH =) USING (
    CASE
      WHEN post_id IS NOT NULL THEN (post_id WITH =)
      WHEN comment_id IS NOT NULL THEN (comment_id WITH =)
    END
  )
);

-- Follows
CREATE TABLE follows (
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),

  -- Prevent self-follows and duplicate follows
  EXCLUDE (follower_id WITH =) USING (following_id WITH <>)
);

-- Hashtags
CREATE TABLE hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  post_count INTEGER DEFAULT 0
);

-- Post-hashtag relationship
CREATE TABLE post_hashtags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  hashtag_id UUID REFERENCES hashtags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, hashtag_id)
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_start TIMESTAMPTZ NOT NULL,
  event_end TIMESTAMPTZ NOT NULL,
  location TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  max_attendees INTEGER,
  attendee_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event RSVPs
CREATE TABLE event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'going', -- going, maybe, not_going
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- like, comment, follow, mention, group_invite, event_rsvp
  actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved posts (bookmarks)
CREATE TABLE saved_posts (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- Blocked users
CREATE TABLE blocked_users (
  blocker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id)
);

-- Reports (flagged content)
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  comment_id UUID REFERENCES comments(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- pending, reviewed, resolved, dismissed
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_group ON posts(group_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_trending ON posts((likes_count + comments_count) DESC) WHERE created_at > NOW() - INTERVAL '7 days';
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_likes_user ON likes(user_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, created_at DESC) WHERE read = FALSE;
CREATE INDEX idx_reports_status ON reports(status, created_at);
```

---

## RLS Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, owner write
CREATE POLICY "Public can view profiles"
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Groups: Public read public groups, members read private groups
CREATE POLICY "Public can view public groups"
ON groups FOR SELECT USING (type = 'public');

CREATE POLICY "Group members can view group"
ON groups FOR SELECT USING (
  type != 'private' OR
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = groups.id
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create groups"
ON groups FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update group"
ON groups FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = groups.id
    AND group_members.user_id = auth.uid()
    AND group_members.role IN ('admin', 'moderator')
  )
);

-- Group membership
CREATE POLICY "Users can manage own group memberships"
ON group_members FOR ALL USING (auth.uid() = user_id);

-- Posts: Complex visibility rules
CREATE POLICY "Public can view public posts"
ON posts FOR SELECT USING (
  visibility = 'public' OR
  auth.uid() = author_id OR
  (visibility = 'followers' AND EXISTS (
    SELECT 1 FROM follows
    WHERE follows.following_id = posts.author_id
    AND follows.follower_id = auth.uid()
  )) OR
  (visibility = 'group' AND EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = posts.group_id
    AND group_members.user_id = auth.uid()
  ))
);

CREATE POLICY "Users can create posts"
ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own posts"
ON posts FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own posts"
ON posts FOR DELETE USING (auth.uid() = author_id);

-- Comments
CREATE POLICY "Public can view comments"
ON comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments"
ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own comments"
ON comments FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments"
ON comments FOR DELETE USING (auth.uid() = author_id);

-- Likes
CREATE POLICY "Public can view likes"
ON likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create likes"
ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
ON likes FOR DELETE USING (auth.uid() = user_id);

-- Follows
CREATE POLICY "Public can view follows"
ON follows FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage follows"
ON follows FOR ALL USING (auth.uid() = follower_id);

-- Notifications
CREATE POLICY "Users can manage own notifications"
ON notifications FOR ALL USING (auth.uid() = user_id);

-- Saved posts
CREATE POLICY "Users can manage saved posts"
ON saved_posts FOR ALL USING (auth.uid() = user_id);

-- Blocked users
CREATE POLICY "Users can manage blocked users"
ON blocked_users FOR ALL USING (auth.uid() = blocker_id);

-- Reports
CREATE POLICY "Users can create reports"
ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
ON reports FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

---

## Key Features

### 1. Personalized Feed (Following)

```typescript
// hooks/useFeed.ts
export function useFeed(feedType: 'home' | 'trending' | 'group', groupId?: string) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeed()
  }, [feedType, groupId])

  async function loadFeed() {
    const { data: { user } } = await supabase.auth.getUser()
    let query

    if (feedType === 'home') {
      // Posts from people user follows
      query = supabase
        .from('posts')
        .select('*, author:author_id(*, profiles:author_id(username, display_name, avatar_url))')
        .in('author_id', supabase.sql(`(
          SELECT following_id FROM follows WHERE follower_id = ${user.id}
        )`))
        .order('created_at', { ascending: false })

    } else if (feedType === 'trending') {
      // Top posts from last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      query = supabase
        .from('posts')
        .select('*, author:author_id(*, profiles:author_id(username, display_name, avatar_url))')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('likes_count', { ascending: false })
        .limit(50)

    } else if (feedType === 'group' && groupId) {
      query = supabase
        .from('posts')
        .select('*, author:author_id(*, profiles:author_id(username, display_name, avatar_url))')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
    }

    const { data } = await query
    setPosts(data || [])
    setLoading(false)
  }

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('feed-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'posts',
        filter: feedType === 'group' ? `group_id=eq.${groupId}` : undefined
      }, (payload) => {
        setPosts(prev => [payload.new, ...prev])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [feedType, groupId])

  return { posts, loading }
}
```

### 2. Post Creation with Hashtags

```typescript
// components/CreatePost.tsx
export function CreatePost({ groupId }: { groupId?: string }) {
  const [content, setContent] = useState('')
  const [images, setImages] = useState([])
  const [posting, setPosting] = useState(false)
  const { data: { user } } = useAuth()

  async function handleSubmit() {
    if (!content.trim() && images.length === 0) return

    setPosting(true)

    // Extract hashtags
    const hashtagMatches = content.match(/#[\w]+/g) || []
    const hashtags = hashtagMatches.map(tag => tag.slice(1))

    // Upload images if any
    const imageUrls = await Promise.all(
      images.map(img => uploadImage(img))
    )

    // Create post
    const { data: post } = await supabase
      .from('posts')
      .insert({
        author_id: user.id,
        group_id: groupId,
        content,
        images: imageUrls
      })
      .select()
      .single()

    // Create hashtags and relationships
    if (hashtags.length > 0) {
      for (const tag of hashtags) {
        // Get or create hashtag
        const { data: tagData } = await supabase
          .from('hashtags')
          .upsert({ name: tag.toLowerCase() })
          .select()
          .single()

        // Link post to hashtag
        await supabase.from('post_hashtags').insert({
          post_id: post.id,
          hashtag_id: tagData.id
        })
      }
    }

    setContent('')
    setImages([])
    setPosting(false)
  }

  return (
    <div className="create-post">
      <textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      {images.length > 0 && (
        <div className="image-preview">
          {images.map((img, i) => (
            <img key={i} src={URL.createObjectURL(img)} alt="" />
          ))}
        </div>
      )}
      <div className="actions">
        <label>
          📷
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => setImages([...images, ...Array.from(e.target.files)])}
          />
        </label>
        <button
          onClick={handleSubmit}
          disabled={posting || (!content.trim() && images.length === 0)}
        >
          {posting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  )
}
```

### 3. Real-time Engagement (Likes, Comments)

```typescript
// hooks/usePostEngagement.ts
export function usePostEngagement(postId: string) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [comments, setComments] = useState([])
  const { data: { user } } = useAuth()

  useEffect(() => {
    loadEngagement()

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`post-${postId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts',
        filter: `id=eq.${postId}`
      }, (payload) => {
        if (payload.new) {
          setLikes(payload.new.likes_count)
          setComments(payload.new.comments_count)
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [postId])

  async function loadEngagement() {
    const [postRes, likeRes, commentsRes] = await Promise.all([
      supabase.from('posts').select('likes_count, comments_count').eq('id', postId).single(),
      user ? supabase.from('likes').select('id').eq('user_id', user.id).eq('post_id', postId).maybeSingle() : Promise.resolve({ data: null }),
      supabase.from('comments').select('*, author:author_id(username, display_name, avatar_url)').eq('post_id', postId).order('created_at')
    ])

    if (postRes.data) {
      setLikes(postRes.data.likes_count)
      setComments(commentsRes.data || [])
    }
    setLiked(!!likeRes.data)
  }

  async function toggleLike() {
    if (!user) return

    if (liked) {
      await supabase.from('likes').delete().match({
        user_id: user.id,
        post_id: postId
      })
    } else {
      await supabase.from('likes').insert({
        user_id: user.id,
        post_id: postId
      })
    }

    setLiked(!liked)
  }

  async function addComment(content: string) {
    if (!user) return

    await supabase.from('comments').insert({
      post_id: postId,
      author_id: user.id,
      content
    })
  }

  return { liked, likes, comments, toggleLike, addComment }
}
```

### 4. Follow System

```typescript
// lib/follows.ts
export async function followUser(userId: string) {
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('follows').insert({
    follower_id: user.id,
    following_id: userId
  })

  // Update follower counts
  if (!error) {
    await supabase.rpc('increment_followers', { user_id: userId })
    await supabase.rpc('increment_following', { user_id: user.id })
  }

  return { error }
}

export async function unfollowUser(userId: string) {
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('follows').delete().match({
    follower_id: user.id,
    following_id: userId
  })

  if (!error) {
    await supabase.rpc('decrement_followers', { user_id: userId })
    await supabase.rpc('decrement_following', { user_id: user.id })
  }

  return { error }
}

// Database functions (run as migration)
CREATE OR REPLACE FUNCTION increment_followers(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET follower_count = follower_count + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_following(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET following_count = following_count + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;
```

### 5. Search & Discovery

```typescript
// hooks/useSearch.ts
export function useSearch(query: string, type: 'posts' | 'users' | 'groups' | 'hashtags') {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const timeout = setTimeout(async () => {
      setLoading(true)

      let dbQuery
      if (type === 'posts') {
        dbQuery = supabase
          .from('posts')
          .select('*, author:author_id(username, display_name, avatar_url)')
          .ilike('content', `%${query}%`)
          .order('created_at', { ascending: false })
          .limit(20)

      } else if (type === 'users') {
        dbQuery = supabase
          .from('profiles')
          .select('*')
          .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
          .limit(20)

      } else if (type === 'groups') {
        dbQuery = supabase
          .from('groups')
          .select('*')
          .ilike('name', `%${query}%`)
          .limit(20)

      } else if (type === 'hashtags') {
        dbQuery = supabase
          .from('hashtags')
          .select('*')
          .ilike('name', `%${query}%`)
          .order('post_count', { ascending: false })
          .limit(20)
      }

      const { data } = await dbQuery
      setResults(data || [])
      setLoading(false)
    }, 300)

    return () => clearTimeout(timeout)
  }, [query, type])

  return { results, loading }
}
```

### 6. Group Management

```typescript
// components/GroupSettings.tsx
export function GroupSettings({ group }: { group: any }) {
  const [settings, setSettings] = useState(group)
  const { data: { user } } = useAuth()

  async function updateSettings(updates: any) {
    const { error } = await supabase
      .from('groups')
      .update(updates)
      .eq('id', group.id)

    if (!error) {
      setSettings({ ...settings, ...updates })
      toast.show('Group updated', { type: 'success' })
    }
  }

  async function updateMemberRole(userId: string, role: string) {
    await supabase
      .from('group_members')
      .update({ role })
      .eq({ group_id: group.id, user_id: userId })
  }

  async function removeMember(userId: string) {
    await supabase
      .from('group_members')
      .delete()
      .eq({ group_id: group.id, user_id: userId })
  }

  return (
    <div className="group-settings">
      <h2>Group Settings</h2>

      <div className="setting">
        <label>Group Name</label>
        <input
          type="text"
          value={settings.name}
          onChange={(e) => updateSettings({ name: e.target.value })}
        />
      </div>

      <div className="setting">
        <label>Description</label>
        <textarea
          value={settings.description}
          onChange={(e) => updateSettings({ description: e.target.value })}
        />
      </div>

      <div className="setting">
        <label>Group Type</label>
        <select
          value={settings.type}
          onChange={(e) => updateSettings({ type: e.target.value })}
        >
          <option value="public">Public</option>
          <option value="restricted">Restricted</option>
          <option value="private">Private</option>
        </select>
      </div>

      <MembersList
        groupId={group.id}
        onUpdateRole={updateMemberRole}
        onRemoveMember={removeMember}
      />
    </div>
  )
}
```

---

## Moderation Tools

```typescript
// components/ModerationQueue.tsx
export function ModerationQueue() {
  const [reports, setReports] = useState([])

  useEffect(() => {
    loadReports()
  }, [])

  async function loadReports() {
    const { data } = await supabase
      .from('reports')
      .select('*, reporter:reporter_id(username, display_name), post(*, author:author_id(username)), comment(*)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    setReports(data || [])
  }

  async function resolveReport(reportId: string, action: 'dismiss' | 'delete_post' | 'delete_comment', notes: string) {
    const { data: report } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single()

    // Take action
    if (action === 'delete_post' && report.post_id) {
      await supabase.from('posts').delete().eq('id', report.post_id)
    } else if (action === 'delete_comment' && report.comment_id) {
      await supabase.from('comments').delete().eq('id', report.comment_id)
    }

    // Update report status
    await supabase
      .from('reports')
      .update({
        status: 'resolved',
        resolution_notes: notes,
        reviewed_by: (await supabase.auth.getUser()).data.user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', reportId)

    loadReports()
  }

  return (
    <div className="moderation-queue">
      <h2>Pending Reports ({reports.length})</h2>

      {reports.map(report => (
        <div key={report.id} className="report-item">
          <div className="report-info">
            <p><strong>Reporter:</strong> {report.reporter?.username}</p>
            <p><strong>Reason:</strong> {report.reason}</p>
            {report.description && <p><strong>Description:</strong> {report.description}</p>}
          </div>

          {report.post && (
            <div className="reported-content">
              <p><strong>Post by:</strong> {report.post.author?.username}</p>
              <p>{report.post.content}</p>
            </div>
          )}

          <div className="actions">
            <button onClick={() => resolveReport(report.id, 'dismiss', 'Not a violation')}>
              Dismiss
            </button>
            {report.post_id && (
              <button onClick={() => resolveReport(report.id, 'delete_post', 'Violated community guidelines')}>
                Delete Post
              </button>
            )}
            {report.comment_id && (
              <button onClick={() => resolveReport(report.id, 'delete_comment', 'Violated community guidelines')}>
                Delete Comment
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## What's Next

1. Build the feed UI with infinite scroll
2. Implement real-time notifications
3. Add rich text editor for posts
4. Create group management features
5. Build moderation dashboard
6. Add analytics for admins

---

*Part of the [Berlin Solopreneur SaaS Prompt Pack](../README.md)*
