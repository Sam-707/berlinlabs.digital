---
title: "Phase 6: Quick Project Templates"
description: "Pre-configured prompt templates for common SaaS application types"
category: "Templates"
tags: ["templates", "marketplace", "saas", "booking", "community"]
difficulty: "Beginner"
timeRequired: "30 minutes (to select and customize)"
dependencies: ["Phase 1: Foundation Framework"]
order: 6
---

# Phase 6: Quick Project Templates

> Use these templates with the [Foundation Framework](./01-foundation-framework.md) to kickstart common SaaS types.

---

## Template 1: Marketplace Platform

**Best for:** Course marketplaces, service marketplaces, product catalogs

---

### Master Prompt Customization

```yaml
Target:
  - Buyers: Looking to purchase products/services
  - Sellers: Wanting to sell products/services
  - Admin: Managing the platform

Business Model:
  - Freemium with transaction fees
  - OR Subscription for sellers
  - OR Commission on each sale

Primary Goal:
  - Get sellers to list products
  - Get buyers to make purchases
```

---

### User Roles

```yaml
Public Visitors:
  - Browse listings
  - View seller profiles
  - Search and filter

Sellers:
  - All public permissions
  - Create listings
  - Manage inventory
  - View sales analytics
  - Receive orders

Buyers:
  - All public permissions
  - Make purchases
  - Order tracking
  - Leave reviews
  - Save favorites

Admin:
  - Full control
  - Manage all users
  - Platform analytics
  - Dispute resolution
```

---

### Core Pages

```yaml
Public:
  - Landing page
  - Browse/search listings
  - Category pages
  - Seller profiles

Sellers:
  - Dashboard
  - Create/edit listing
  - My listings
  - Orders management
  - Analytics
  - Payout settings

Buyers:
  - Dashboard
  - My orders
  - Saved items
  - Reviews
  - Messages

Admin:
  - All listings
  - All users (sellers + buyers)
  - All orders
  - Platform analytics
  - Payout management
```

---

### Data Structure

```sql
-- Listings
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  images TEXT[],
  status TEXT DEFAULT 'active', -- active, sold, draft
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, completed, cancelled, refunded
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Security Rules

```yaml
Public Read Access:
  - All listings (where status = 'active')
  - Seller profiles
  - Reviews

User Own Data:
  - Own listings
  - Own orders
  - Own messages
  - Own reviews

Admin Only:
  - All orders
  - All users
  - Platform analytics
  - Payout data
```

---

### Features to Add

- [ ] Phase 2A: Email/password auth
- [ ] Phase 3A: User dashboard
- [ ] Phase 3B: Admin dashboard
- [ ] Phase 4A: Stripe Connect for seller payouts
- [ ] Phase 4B: Real-time order updates
- [ ] Search and filtering
- [ ] Messaging system
- [ ] Review system

---

## Template 2: SaaS Application

**Best for:** B2B tools, productivity apps, automation platforms

---

### Master Prompt Customization

```yaml
Target:
  - Professionals and businesses
  - Teams looking for productivity tools

Business Model:
  - Freemium (limited features)
  - Tiered subscriptions (Basic, Pro, Enterprise)

Primary Goal:
  - Get users to subscribe to Pro plan ($29-99/mo)
```

---

### User Roles

```yaml
Public Visitors:
  - View pricing
  - Read features
  - Access documentation

Users:
  - All public permissions
  - Access to free tier features
  - Manage account
  - View usage

Pro Users:
  - All user permissions
  - Access to pro features
  - Priority support

Admin:
  - Full control
  - Manage all users
  - View revenue analytics
  - Manage subscriptions
```

---

### Data Structure

```sql
-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan_id TEXT NOT NULL, -- free, basic, pro, enterprise
  status TEXT DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage Logs
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys (for B2B integrations)
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,
  name TEXT,
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Security Rules

```yaml
Public Read Access:
  - Pricing page data
  - Feature descriptions
  - Documentation

User Own Data:
  - Own subscription
  - Own usage logs
  - Own API keys

Pro/Enterprise Only:
  - Advanced features based on plan
  - Usage analytics

Admin Only:
  - All subscriptions
  - Revenue data
  - Platform usage
```

---

### Features to Add

- [ ] Phase 2A + 2B: Email/password + Google OAuth
- [ ] Phase 3A: User dashboard with usage widgets
- [ ] Phase 4A: Stripe subscriptions
- [ ] Usage tracking and limits
- [ ] API key management
- [ ] Webhooks for integrations

---

## Template 3: Content Platform

**Best for:** Blog platforms, video platforms, podcast hosting

---

### Master Prompt Customization

```yaml
Target:
  - Content creators (writers, video makers, podcasters)
  - Content consumers

Business Model:
  - Ad-supported (free)
  - OR Subscription for premium content
  - OR Creator revenue share

Primary Goal:
  - Get creators to upload content
  - Get viewers to consume content
```

---

### User Roles

```yaml
Public Visitors:
  - Browse content
  - Search and filter
  - View public content

Creators:
  - All public permissions
  - Upload content
  - Manage content
  - View analytics
  - Monetization tools

Moderators:
  - All creator permissions
  - Review flagged content
  - Manage comments

Admin:
  - Full control
```

---

### Data Structure

```sql
-- Content
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_url TEXT, -- S3/Cloudflare R2 URL
  thumbnail_url TEXT,
  category TEXT,
  tags TEXT[],
  visibility TEXT DEFAULT 'public', -- public, private, unlisted
  views INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published', -- draft, published, archived
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For replies
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Playlists
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playlist Items
CREATE TABLE playlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Features to Add

- [ ] Phase 2A + 2B: Authentication
- [ ] File upload to S3/Cloudflare R2
- [ ] Phase 4B: Real-time view counts
- [ ] Comments and replies
- [ ] Like/subscribe system
- [ ] Playlist functionality
- [ ] Search and recommendations
- [ ] Creator analytics dashboard

---

## Template 4: Booking/Reservation System

**Best for:** Appointments, restaurant bookings, event tickets

---

### Master Prompt Customization

```yaml
Target:
  - Customers: Need to book appointments/services
  - Providers: Offer services/appointments

Business Model:
  - Transaction fee on bookings
  - OR Subscription for providers
  - OR Both

Primary Goal:
  - Get providers to list services
  - Get customers to make bookings
```

---

### User Roles

```yaml
Public Visitors:
  - Browse providers and services
  - View availability
  - Make bookings (as guest or registered)

Customers:
  - All public permissions
  - Manage bookings
  - Leave reviews
  - Booking history

Providers:
  - All customer permissions
  - Manage services
  - Set availability
  - Accept/reject bookings
  - View earnings

Admin:
  - Full control
```

---

### Data Structure

```sql
-- Services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER NOT NULL, -- minutes
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Availability Slots
CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Allow guest bookings
  slot_id UUID REFERENCES availability_slots(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending', -- pending, confirmed, cancelled, completed
  amount DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Features to Add

- [ ] Phase 2A: Authentication (optional guest bookings)
- [ ] Calendar UI for availability
- [ ] Phase 4A: Stripe for deposits/payments
- [ ] Phase 4B: Real-time booking updates
- [ ] Email/SMS reminders
- [ ] Review system
- [ ] Provider earnings dashboard

---

## Template 5: Community/Social Platform

**Best for:** Forums, groups, social networks

---

### Master Prompt Customization

```yaml
Target:
  - People with shared interests
  - Niche communities

Business Model:
  - Free with optional premium memberships
  - OR Ad-supported

Primary Goal:
  - Get users to join and engage
  - Build active communities
```

---

### User Roles

```yaml
Public Visitors:
  - Browse public posts
  - View public groups
  - Limited search

Members:
  - All public permissions
  - Create posts
  - Comment and like
  - Join groups
  - Follow users
  - Create events

Moderators:
  - All member permissions
  - Moderate posts/comments
  - Manage group membership
  - Access moderation tools

Admin:
  - Full control
```

---

### Data Structure

```sql
-- Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  images TEXT[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groups
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    is_private BOOLEAN DEFAULT FALSE,
    member_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group Members
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- member, moderator, admin
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
    description TEXT,
    event_time TIMESTAMPTZ NOT NULL,
    location TEXT,
    attending_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follows
CREATE TABLE follows (
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);
```

---

### Features to Add

- [ ] Phase 2A + 2B: Authentication
- [ ] Rich text editor for posts
- [ ] Phase 4B: Real-time feed updates
- [ ] Notification system
- [ ] Group management
- [ ] Event creation and RSVP
- [ ] Follow/unfollow functionality
- [ ] Hashtags and trending

---

## Next Steps

1. Choose a template above
2. Combine with [Phase 1: Foundation Framework](./01-foundation-framework.md)
3. Add relevant phases based on features needed
4. Customize data structure for your specific use case

---

*Part of the [Berlin Solopreneur SaaS Prompt Pack](../README.md)*
