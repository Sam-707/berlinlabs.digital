---
title: "Phase 5: Firestore RLS Rules"
description: "Security templates for Firestore Row Level Security"
category: "Security"
tags: ["firestore", "rls", "security", "permissions", "rules"]
difficulty: "Intermediate"
timeRequired: "1-2 hours"
dependencies: ["Phase 1: Foundation Framework"]
order: 5
---

# Phase 5: Firestore RLS Rules

> **Note:** While the Berlin Solopreneur stack prefers Supabase, these templates are provided for Firebase/Firestore implementations.

---

## Template 1: User-Only Data

**Simplest security model - users can only access their own data**

---

### Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Root user document
    match /users/{userId} {
      // User can read/write their own document
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // All nested collections inherit the same rule
      match /{allPaths=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

### Use Cases

- Personal note-taking apps
- Personal finance trackers
- Todo lists
- Personal journals
- Individual user dashboards

---

### Data Structure

```
users/
  └─ {userId}/
      ├─ profile/
      │   └─ {document}
      ├─ notes/
      │   ├─ {noteId}
      │   └─ {noteId}
      └─ settings/
          └─ {document}
```

---

## Template 2: Multi-Role (User + Admin)

**Complex security model with role-based access control**

---

### Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Function to check if user is admin
    function isAdmin() {
      return request.auth != null &&
             request.auth.token.email == 'admin@yourdomain.com';
    }

    // Function to check if user owns the document
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }

    // Public resources (readable by everyone, writable by admin)
    match /public_content/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // User-owned resources
    match /users/{userId} {
      // User or admin can read
      allow read: if isOwner(userId) || isAdmin();

      // Only owner can write (admin can't modify user data directly)
      allow write: if isOwner(userId);

      // Nested collections inherit rules
      match /{allPaths=**} {
        allow read: if isOwner(userId) || isAdmin();
        allow write: if isOwner(userId);
      }
    }

    // Admin-only resources
    match /admin/{docId} {
      allow read, write: if isAdmin();
    }

    // Example: Orders (user can read own, admin can read all)
    match /orders/{orderId} {
      allow read: if isOwner(resource.data.userId) || isAdmin();
      allow create: if request.auth != null;
      allow update, delete: if isAdmin();
    }
  }
}
```

---

### Use Cases

- SaaS applications with admin panel
- Marketplaces (buyers, sellers, admins)
- Content platforms (creators, viewers, admins)
- Multi-tenant applications

---

### Role Management

```javascript
// Extended role system with custom claims
function getUserRole() {
  return request.auth.token.role;
}

function hasRole(role) {
  return request.auth != null &&
         request.auth.token.role == role;
}

// Usage in rules
match /premium_content/{docId} {
  allow read: if hasRole('premium') || hasRole('admin');
}
```

---

### Setting Custom Claims (Admin SDK)

```javascript
// Node.js Admin SDK
const admin = require('firebase-admin');

async function setAdminRole(uid) {
  await admin.auth().setCustomUserClaims(uid, {
    role: 'admin'
  });
}

async function setPremiumRole(uid) {
  await admin.auth().setCustomUserClaims(uid, {
    role: 'premium'
  });
}
```

---

## Template 3: Public + Private Data

**Mixed security model with both public and private data**

---

### Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Public blog posts
    match /posts/{postId} {
      // Anyone can read published posts
      allow read: if resource.data.published == true;

      // Authenticated users can read own drafts
      allow read: if isOwner(resource.data.authorId);

      // Authors can create
      allow create: if isAuthenticated();

      // Only owner can update/delete
      allow update, delete: if isOwner(resource.data.authorId);
    }

    // Private user data
    match /users/{userId} {
      // Public profile (readable by all)
      match /profile/{docId} {
        allow read: if true;
        allow write: if isOwner(userId);
      }

      // Private data (owner only)
      match /private/{allPaths=**} {
        allow read, write: if isOwner(userId);
      }

      // Settings (owner only)
      match /settings/{docId} {
        allow read, write: if isOwner(userId);
      }
    }

    // Comments on posts
    match /posts/{postId}/comments/{commentId} {
      // Anyone can read comments
      allow read: if true;

      // Authenticated users can comment
      allow create: if isAuthenticated();

      // Only comment author can edit/delete
      allow update, delete: if isOwner(resource.data.authorId);
    }
  }
}
```

---

### Use Cases

- Blog platforms
- Social networks
- Content management systems
- Forums

---

## Template 4: Team/Collaboration Access

**Shared documents with team-based permissions**

---

### Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isMember(teamId) {
      return isAuthenticated() &&
             exists(/databases/$(database)/documents/teams/$(teamId)/members/$(request.auth.uid));
    }

    function isTeamOwner(teamId) {
      return isAuthenticated() &&
             request.auth.uid == get(/databases/$(database)/documents/teams/$(teamId)).data.ownerId;
    }

    // Teams
    match /teams/{teamId} {
      // Members can read, owner can write
      allow read: if isMember(teamId);
      allow write: if isTeamOwner(teamId);

      // Team members subcollection
      match /members/{userId} {
        allow read: if isMember(teamId);
        allow create: if isTeamOwner(teamId);
        allow delete: if isTeamOwner(teamId) || request.auth.uid == userId;
      }

      // Team documents
      match /documents/{docId} {
        allow read: if isMember(teamId);
        allow create, update: if isMember(teamId);
        allow delete: if isTeamOwner(teamId) || request.auth.uid == resource.data.createdBy;
      }
    }
  }
}
```

---

### Use Cases

- Collaboration tools
- Team dashboards
- Shared project management
- Multi-user workspaces

---

## Template 5: Time-Based Access

**Access control based on subscription or time periods**

---

### Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function hasActiveSubscription() {
      return isAuthenticated() &&
             request.auth.token.subscription == 'active';
    }

    function isWithinPeriod(field) {
      let now = request.time;
      return resource.data[field] != null &&
             resource.data[field].toDate() > now;
    }

    // Premium content requires active subscription
    match /premium_content/{docId} {
      allow read: if hasActiveSubscription();
    }

    // Time-limited access
    match /shared_links/{linkId} {
      allow read: if isWithinPeriod('expiresAt');
    }

    // Trial period access
    match /trial_users/{userId} {
      allow read, write: if isWithinPeriod('trialEndsAt');
    }
  }
}
```

---

### Use Cases

- Subscription-based content
- Time-limited shares
- Trial periods
- Temporary access passes

---

## Testing Rules

### Using Firebase Emulator

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize emulator
firebase init emulators

# Start emulator
firebase emulators:start

# Run tests
firebase emulators:exec --only firestore "npm test"
```

### Test with Firebase Security Rules Unit Tests

```javascript
// tests/firestore.test.js
const firebase = require('@firebase/testing');

const PROJECT_ID = 'my-test-project';

function getFirestore(auth) {
  return firebase.initializeTestApp({ projectId: PROJECT_ID, auth }).firestore();
}

describe('Firestore Rules', () => {
  before(async () => {
    await firebase.loadFirestoreRules({
      projectId: PROJECT_ID,
      rules: fs.readFileSync('firestore.rules', 'utf8')
    });
  });

  after(async () => {
    await firebase.clearFirestoreData({ projectId: PROJECT_ID });
  });

  it('should allow user to read own data', async () => {
    const db = getFirestore({ uid: 'user123' });
    const testDoc = db.collection('users').doc('user123');

    await firebase.assertSucceeds(testDoc.get());
  });

  it('should deny user from reading other user data', async () => {
    const db = getFirestore({ uid: 'user123' });
    const otherDoc = db.collection('users').doc('user456');

    await firebase.assertFails(otherDoc.get());
  });
});
```

---

## Migration to Supabase

**Converting Firestore rules to Supabase RLS:**

| Firestore Pattern | Supabase RLS Equivalent |
|-------------------|-------------------------|
| `request.auth.uid` | `auth.uid()` |
| `resource.data.field` | Direct column access |
| `exists(/path/...)` | `EXISTS (SELECT 1 FROM ...)` |
| `get(/path/...).data` | JOIN or subquery |
| Custom claims | `profiles.role` column |

---

## Next Steps

- [ ] Test rules with Firebase emulator
- [ ] Implement role management system
- [ ] Create unit tests for security rules
- [ ] Consider migration to Supabase for simpler RLS

---

*Part of the [Berlin Solopreneur SaaS Prompt Pack](../README.md)*
