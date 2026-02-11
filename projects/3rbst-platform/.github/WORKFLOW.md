# 🚀 3rbst Development Workflow

## 📋 Issue-Driven Development

### Every task starts with an issue:
1. **Create issue** for any work (bug, feature, docs)
2. **Assign labels** (🐛 bug, 🚀 enhancement, 📱 mobile)
3. **Set milestone** if part of release
4. **Create branch** from issue: `git checkout -b feature/issue-#`

### 🔄 Development Cycle:
```
Issue Created → Branch → Code → Commit → PR → Review → Merge → 🚀 Auto-Deploy → Close Issue
```

## 🚀 **Auto-Deployment Active:**
- ✅ Connected to GitHub: `Sam-707/3rbst-platform`
- ✅ Production branch: `main`  
- ✅ Every `git push origin main` → Auto-deploys to Vercel
- ✅ Preview deployments for feature branches

## 📝 Commit Message Format:
```
🎯 TYPE: Brief description (closes #issue-number)

- Detailed change 1
- Detailed change 2

🤖 Generated with [Claude Code](https://claude.ai/code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:**
- `✨ FEAT:` New feature
- `🐛 FIX:` Bug fix  
- `📱 MOBILE:` Mobile optimization
- `🎨 UI:` Design improvements
- `📚 DOCS:` Documentation
- `🔧 CONFIG:` Configuration changes

## 🏷️ Labels Guide:

| Label | Purpose | Color |
|-------|---------|-------|
| 🐛 bug | Something broken | `#d73a4a` |
| 🚀 enhancement | New feature | `#a2eeef` |
| 📱 mobile | Mobile-related | `#0052cc` |
| 🎨 design | UI/UX improvements | `#e4e669` |
| 📚 documentation | Docs updates | `#0075ca` |
| 🤖 ai-feature | AI/ML related | `#5319e7` |
| 💰 payment | Payment system | `#fbca04` |
| 🔒 security | Security issues | `#d4c5f9` |
| ❓ question | Need discussion | `#d876e3` |
| 🚨 urgent | High priority | `#b60205` |

## 📊 Project Board Workflow:

### Columns:
1. **📋 Backlog** - Future work
2. **🎯 Sprint Ready** - Next 2 weeks  
3. **🚀 In Progress** - Active work
4. **🔍 Review** - Needs testing
5. **✅ Done** - Completed

### Rules:
- Move cards manually as work progresses
- Link all commits to issues
- Close issues when features are deployed

## 🎯 Milestones:
- **v1.1** (Sept 15) - Mobile + Telegram + Legal
- **v1.2** (Oct 15) - Payment system
- **v2.0** (Nov 15) - Multi-language

## 🔄 Release Process:
1. Create release branch: `git checkout -b release/v1.1`
2. Test everything thoroughly
3. Update version numbers
4. Create GitHub release with changelog
5. Deploy to production
6. Tag stable commit: `git tag v1.1`

## 🛡️ Branch Protection:
- `main` - Always deployable, protected
- `develop` - Integration branch (if needed)
- `feature/*` - Feature branches
- `hotfix/*` - Emergency fixes

---
**Remember:** Every line of code should trace back to an issue! 🎯