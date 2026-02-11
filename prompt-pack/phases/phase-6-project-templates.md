# Phase 6: Quick Project Templates

Ready-to-use prompt templates for common SaaS applications.

---

## Template 1 - Marketplace Platform

**Use for**: Course marketplace, service marketplace, product catalog, digital downloads

---

### Master Prompt Customization

```
You are building a Marketplace Platform.

BUSINESS CONTEXT:
- Target: [Creators/Sellers] who want to sell [products/services/courses]
- Business Model: MARKETPLACE (platform takes commission on each sale)
- Primary Goal: Get sellers to list items, buyers to purchase

USER ROLES:
- Public: Browse listings, view seller profiles, search/filter
- Buyers: Purchase items, leave reviews, save favorites
- Sellers: Create listings, manage inventory, view sales, withdraw earnings
- Admin: Manage all users, approve listings, handle disputes, view analytics

CORE PAGES:
- / - Landing page with featured listings
- /browse - Browse all listings with filters
- /listing/[id] - Individual listing page
- /seller/[slug] - Seller profile and listings
- /dashboard/buyer - Buyer dashboard (purchases, favorites)
- /dashboard/seller - Seller dashboard (listings, sales, earnings)
- /admin - Admin dashboard

DATA STRUCTURE:
- users (auth.users)
- profiles (user profiles with role: buyer, seller, admin)
- listings (products/services for sale)
  - id, seller_id, title, description, price, currency, category
  - images[], status, tags, created_at
- orders (purchases)
  - id, buyer_id, seller_id, listing_id, amount, status
  - commission_amount, seller_earnings, created_at
- reviews (buyer reviews of sellers/listings)
  - id, order_id, buyer_id, seller_id, rating, comment
- categories (listing categories)
- earnings (seller payouts)
  - id, seller_id, amount, status, payout_method

SECURITY RULES:
- Public: View listings, seller profiles (active status only)
- Buyers: View own orders, create orders, leave reviews for purchases
- Sellers: Manage own listings, view own sales/earnings
- Admin: Full access to all resources

FEATURES:
- Search and filtering (category, price range, rating)
- Seller verification/badges
- Commission system (platform takes X%)
- Messaging between buyer and seller
- Favorites/watchlist
- Order tracking
- Seller payout management
```

---

### Key Features to Implement

1. **Listing Management**
   - Create/edit/delete listings (sellers only)
   - Image upload (multiple images)
   - Rich text description
   - Category and tags
   - Inventory tracking (optional)

2. **Search & Filtering**
   - Full-text search on titles/descriptions
   - Filter by category, price, rating
   - Sort by newest, price, popularity

3. **Order Processing**
   - Checkout flow
   - Order status tracking
   - Commission calculation
   - Seller earnings tracking

4. **Review System**
   - Only verified buyers can review
   - Star ratings + text comments
   - Seller aggregate rating display

---

## Template 2 - SaaS Application

**Use for**: B2B tools, productivity apps, automation platforms, analytics tools

---

### Master Prompt Customization

```
You are building a B2B SaaS Application.

BUSINESS CONTEXT:
- Target: [Target professionals/businesses] who need to [solve specific problem]
- Business Model: SUBSCRIPTION (monthly/yearly tiers)
- Primary Goal: Get users to start free trial and convert to paid subscription

USER ROLES:
- Public: Landing page, pricing, sign up
- Users: Access core features, usage tracking, subscription management
- Admin: Manage all users, subscriptions, view platform analytics

CORE PAGES:
- / - Landing page with hero, features, social proof
- /pricing - Subscription tiers with features comparison
- /dashboard - Main application interface
- /dashboard/[FEATURE-1] - Core feature 1
- /dashboard/[FEATURE-2] - Core feature 2
- /dashboard/settings - User settings and subscription
- /admin - Admin dashboard

DATA STRUCTURE:
- users (auth.users)
- profiles (user profiles, subscription_tier)
- subscriptions (user subscription status)
- usage_logs (track feature usage for billing)
- [RESOURCE_1] (core data entity)
- [RESOURCE_2] (core data entity)

SECURITY RULES:
- Users can only access their own data
- Usage based on subscription tier
- Admin full access

FEATURES:
- Tiered pricing (Free, Basic, Pro, Enterprise)
- Usage tracking per tier
- Feature flags based on subscription
- Team/collaborator seats (optional)
- API access (paid tiers)
- Export data (paid tiers)
```

---

### Key Features to Implement

1. **Subscription Management**
   - Tier-based feature access
   - Usage tracking and limits
   - Upgrade/downgrade flows
   - Prorated billing

2. **Core Application**
   - Main productivity/utility feature
   - Data import/export
   - Sharing/collaboration (optional)

3. **Usage Dashboard**
   - Show usage vs limit
   - Upgrade prompts when near limit

4. **Settings**
   - Profile management
   - Subscription management
   - Team management (optional)
   - API key management (optional)

---

## Template 3 - Content Platform

**Use for**: Blog platform, video platform, podcast hosting, course platform

---

### Master Prompt Customization

```
You are building a Content Platform.

BUSINESS CONTEXT:
- Target: [Creators] who want to publish [content type] and [viewers] who consume it
- Business Model: FREEMIUM with optional creator subscriptions
- Primary Goal: Get creators to publish content, viewers to engage

USER ROLES:
- Public: Discover and view content
- Viewers: Like, comment, follow creators, save to playlists
- Creators: Publish content, manage content, view analytics
- Admin: Content moderation, user management

CORE PAGES:
- / - Content discovery feed
- /content/[id] - Individual content page
- /creator/[slug] - Creator profile and content
- /dashboard/viewer - Saved content, following
- /dashboard/creator - Content management, analytics
- /admin - Content moderation, reports

DATA STRUCTURE:
- users, profiles (with role: viewer, creator, admin)
- content (posts, videos, podcasts, etc.)
  - id, creator_id, title, description, content_url, thumbnail
  - category, tags, status, published_at
- comments
  - id, content_id, user_id, parent_comment_id (for replies)
  - content, created_at
- likes (content_id, user_id)
- follows (follower_id, following_id)
- playlists (user_id, name, content_ids[])
- views (content_id, user_id, timestamp)

SECURITY RULES:
- Public: View published content, creator profiles
- Viewers: Like, comment, follow, create playlists
- Creators: Manage own content, view own analytics
- Admin: Full access, content moderation

FEATURES:
- Content feed with recommendations
- Search and categories
- Like/comment system
- Follow creators
- Save to playlists/favorites
- Creator analytics
- Content scheduling
```

---

### Key Features to Implement

1. **Content Publishing**
   - Rich text editor or media upload
   - Cover image/thumbnail
   - Categories and tags
   - Drafts and scheduling
   - Content versioning (optional)

2. **Discovery**
   - Algorithmic or chronological feed
   - Search functionality
   - Category browsing
   - Trending content

3. **Engagement**
   - Like/unlike
   - Nested comments
   - Share functionality
   - Follow creators

4. **Creator Tools**
   - Content management
   - Analytics dashboard
   - Comment moderation

---

## Template 4 - Booking/Reservation System

**Use for**: Appointments, restaurant bookings, event tickets, service scheduling

---

### Master Prompt Customization

```
You are building a Booking/Reservation System.

BUSINESS CONTEXT:
- Target: [Customers] who need to book [appointments/reservations] with [Providers]
- Business Model: MARKETPLACE with commission or SUBSCRIPTION for providers
- Primary Goal: Get customers to book, providers to accept bookings

USER ROLES:
- Public: Browse providers, view availability, book appointments
- Customers: Manage bookings, leave reviews, cancel/reschedule
- Providers: Manage availability, accept/decline bookings, view earnings
- Admin: Manage all users, bookings, disputes, analytics

CORE PAGES:
- / - Landing page with search
- /search - Find providers by [location/service]
- /provider/[slug] - Provider profile with booking calendar
- /dashboard/customer - My bookings, upcoming, past
- /dashboard/provider - Availability, booking requests, earnings
- /booking/[id] - Booking details and management

DATA STRUCTURE:
- users, profiles (role: customer, provider, admin)
- providers (provider profiles)
  - id, user_id, business_name, description, category
  - location, price_range, rating, verification_status
- availability (provider availability slots)
  - id, provider_id, date, start_time, end_time, status
- bookings
  - id, customer_id, provider_id, availability_id
  - status, notes, created_at
- reviews (customer reviews of providers)
- transactions (payment records)

SECURITY RULES:
- Public: View providers and their availability
- Customers: Manage own bookings, review providers after booking
- Providers: Manage own availability and booking requests
- Admin: Full access

FEATURES:
- Calendar-based booking
- Availability management
- Booking requests and confirmations
- Reminders (email/SMS)
- Deposits and payments
- Cancellation policy
- Reviews after completed bookings
```

---

### Key Features to Implement

1. **Availability Management**
   - Recurring availability
   - One-off availability blocks
   - Time zone handling
   - Buffer times between bookings

2. **Booking Flow**
   - Select service type
   - Choose available slot
   - Confirm details
   - Payment/deposit
   - Confirmation

3. **Booking Management**
   - Accept/decline requests
   - Reschedule
   - Cancel with policy enforcement
   - Reminders

4. **Calendar Integration**
   - Sync with external calendars (Google, Apple)
   - Prevent double-booking

---

## Template 5 - Community/Social Platform

**Use for**: Forums, groups, social networks, interest-based communities

---

### Master Prompt Customization

```
You are building a Community/Social Platform.

BUSINESS CONTEXT:
- Target: [People with shared interest] who want to connect and discuss
- Business Model: FREEMIUM (optional premium features)
- Primary Goal: Get users to join, post, and engage

USER ROLES:
- Public: View public posts and groups
- Members: Post, comment, like, join groups
- Moderators: Moderate content in assigned groups/sections
- Admin: Full platform control

CORE PAGES:
- / - Feed of posts from followed users/groups
- /post/[id] - Individual post with comments
- /group/[slug] - Group page with posts and members
- /user/[username] - User profile
- /dashboard - Notifications, messages, settings
- /admin - Moderation queue, user management

DATA STRUCTURE:
- users, profiles (role: member, moderator, admin)
- posts
  - id, user_id, content, attachments[], type
  - group_id, likes_count, created_at
- comments
  - id, post_id, user_id, content, parent_id
- groups
  - id, name, slug, description, type (public/private)
  - creator_id, member_count, created_at
- group_memberships
  - id, group_id, user_id, role (member/moderator/owner)
- likes (post_id, user_id)
- follows (follower_id, following_id)
- notifications

SECURITY RULES:
- Public: View public groups and posts
- Members: Post in groups they're part of
- Moderators: Moderate content in their groups
- Admin: Full access

FEATURES:
- Post creation (text, images, links, polls)
- Comment threads
- Like system
- Follow users
- Join groups
- Notifications
- Direct messages
- Search and hashtags
```

---

### Key Features to Implement

1. **Post Feed**
   - Chronological or algorithmic feed
   - Filter by posts, groups, people
   - Infinite scroll or pagination

2. **Groups**
   - Public vs private groups
   - Group discovery
   - Member management
   - Group-specific rules

3. **Engagement**
   - Like, comment, share
   - Mention users (@username)
   - Hashtags
   - Polls

4. **Notifications**
   - Real-time notifications
   - Notification types: likes, comments, follows, mentions
   - Mark as read

5. **Moderation**
   - Report content
   - Mod queue for reported content
   - Content removal
   - User suspension

---

## Template 6 - AI-Powered Web App

**Use for**: Document analysis, AI writing assistant, AI image generation, AI chatbot

---

### Master Prompt Customization

```
You are building an AI-Powered Web Application.

BUSINESS CONTEXT:
- Target: [Users] who need [AI capability]
- Business Model: FREEMIUM with usage-based pricing
- Primary Goal: Get users to try AI features and upgrade for more usage

USER ROLES:
- Public: Landing page, pricing
- Users: Use AI features with tier limits, manage subscription
- Admin: Manage users, view usage analytics, API costs

CORE PAGES:
- / - Landing page with AI demo
- /app - Main AI interface
- /app/history - Past generations/results
- /dashboard - Usage dashboard, subscription management
- /pricing - Tiered plans based on usage

DATA STRUCTURE:
- users, profiles, subscriptions
- ai_requests
  - id, user_id, model, prompt, response
  - tokens_used, cost, created_at
- ai_cache (deduplicate similar prompts)
- usage_logs (monthly usage tracking)

SECURITY RULES:
- Users can only access own requests and history
- Usage limited by subscription tier
- Admin full access

FEATURES:
- AI interface (chat, form, etc.)
- Usage tracking and limits
- Response caching
- History and favorites
- Tier-based pricing
- API access (optional)
```

---

### Key Features to Implement

1. **AI Interface**
   - Input form or chat interface
   - Streaming responses (optional)
   - Progress indicators

2. **Usage Management**
   - Track tokens/requests per user
   - Enforce tier limits
   - Show usage vs limit

3. **History**
   - Save all AI responses
   - Search/filter history
   - Export data

4. **Pricing**
   - Free tier: X requests/month
   - Paid tiers: More requests/month
   - Enterprise: Unlimited or custom

---

## Choosing the Right Template

| Template | Best For | Complexity | Key Challenge |
|----------|----------|------------|---------------|
| Marketplace | Two-sided markets | High | Chicken-egg problem, building supply and demand |
| SaaS Application | B2B productivity tools | Medium | Retention, churn reduction |
| Content Platform | User-generated content | Medium | Content moderation, engagement |
| Booking System | Appointments, reservations | High | Availability sync, time zones |
| Community Platform | Social networks, forums | Medium | Engagement, moderation |
| AI-Powered App | AI tools and assistants | Low-Medium | Cost management, UX design |

---

## Next Steps

After choosing your template:

1. **Customize the MASTER PROMPT** with your specific details
2. **Implement Foundation** → Phase 1
3. **Add Authentication** → Phase 2
4. **Build Dashboards** → Phase 3
5. **Add Payments** (if applicable) → Phase 4A
6. **Audit & Deploy** → Phase 7
