# ICP Validation Plan for BridgeLabs Digital

**Objective:** Validate the Ideal Customer Profile (ICP) through customer interviews before building more features.

**Timeline:** 4 weeks (21 hours total)

**Goal:** 10 interviews to make a go/no-go decision on the ICP

---

## Target ICP to Validate

### Primary Hypothesis

**Developers (25-45) building SaaS products on evenings/weekends who want to ship faster.**

---

## Three Customer Personas to Test

### Persona 1: Side-Project Builder (Primary)
- Full-time developer
- 5-10 hours/week for side projects
- Has 3-5 failed projects
- Wants to ship something that gets users

**Listen for:**
- "I keep starting over with every project"
- "Auth/payments always take me forever"
- "I have 5 half-finished projects"
- "I know how to code, not what to build"

---

### Persona 2: Freelancer Scaling to Products
- Freelance developer (€40-80/hour)
- Wants product income to reduce client reliance
- Knows how to build, not what to build

**Listen for:**
- "I'm tired of trading time for money"
- "I want something that earns while I sleep"
- "I can build anything, I don't know what to build"

---

### Persona 3: First-Time Technical Founder
- Just quit or planning to quit job
- Has 6-12 months runway
- Never shipped product before

**Listen for:**
- "I'm leaving my job to build a SaaS"
- "I have savings for X months"
- "This is my first real product"

---

## Phase 1: Prepare Interview Script (Week 1)

### Tasks
1. ✅ Create interview script (`interview-script.md`)
2. ✅ Create outreach templates (`outreach-templates.md`)
3. ✅ Create interview notes template (`interview-notes-template.md`)
4. ✅ Create validation report template (`icp-validation-report.md`)

### Interview Questions Overview

| Section | Duration | Focus |
|---------|----------|-------|
| **Opener** | 5 min | Background, current projects |
| **Problem Discovery** | 15 min | Bottlenecks, process, pain points |
| **Current Behavior** | 10 min | Tools, templates, workflows |
| **Solution Testing** | 10 min | Would they use/pay? |
| **Demographics** | 5 min | Age, location, tech stack |
| **Total** | **45 min** | Target 30 min of conversation |

---

## Phase 2: Find Interview Candidates (Week 1-2)

### Target: 50 outreach attempts → 10 interviews (20% conversion)

### Outreach Channels

| Channel | Target | Template |
|---------|--------|----------|
| **LinkedIn** | 20 people | `outreach-templates.md` - LinkedIn section |
| **Twitter/X** | 15 people | `outreach-templates.md` - Twitter section |
| **Reddit** | 10 people | `outreach-templates.md` - Reddit section |
| **Berlin Meetups** | 5 people | `outreach-templates.md` - Berlin section |
| **Personal Network** | Bonus | `outreach-templates.md` - Personal section |

### Outreach Strategy

1. **Personalize every message** - Mention specific posts/projects
2. **Offer value in return** - Code review, feedback, introductions
3. **Follow up 2-3 times** - People get busy
4. **Engage before DMing** - Reply to posts first

### LinkedIn DM Script

```
Subject: Quick question about your SaaS dev process

Hey [Name],

Saw your post about [specific thing they posted about].

I'm building something for developers shipping SaaS products
and would love your feedback.

Would you have 15 min for a call this week?
Happy to return the favor with code review or advice.

No sales pitch - just research to make sure I build
something actually useful.

Best,
[Your Name]
```

---

## Phase 3: Conduct Interviews (Week 2-3)

### Logistics

| Detail | Specification |
|---------|---------------|
| **Format** | Zoom or Google Meet |
| **Duration** | 30-45 min (target 30 min of conversation) |
| **Recording** | Ask permission, record for notes |
| **Payment** | Not required (offer help in return) |

### Schedule
- 2-3 interviews per day
- Different times (morning, evening, lunch)
- Take detailed notes after each

### Key Things to Listen For

**Problem Signals (good ICP fit):** ✅
- "I keep starting over with every project"
- "Auth/payments always take me forever"
- "I have 5 half-finished projects"
- "I know how to code, not what to build"
- "I ship prototypes but never real products"

**Anti-Patterns (wrong ICP):** ❌
- "I use create-react-app and it's fine"
- "I don't need patterns, I build from scratch"
- "My company pays for everything"
- "I'm not technical, I'm the business person"

**Price Sensitivity:**
- What did they last pay for dev tools?
- Would they pay €49-99 for this?
- Would they pay €299 for lifetime access?

---

## Phase 4: Analyze Results (Week 3)

### Summary Spreadsheet Structure

Create a spreadsheet with these columns:

| Column | Description |
|--------|-------------|
| 1 | Interview date |
| 2 | Persona (which of the 3) |
| 3 | Biggest bottleneck (their words) |
| 4 | Current solutions (what they use now) |
| 5 | Would they use BridgeLabs? (yes/no/maybe) |
| 6 | Price sensitivity |
| 7 | Key quotes |
| 8 | Follow-up needed? |

*See `interview-notes-template.md` for full spreadsheet format*

---

### Look for Patterns

**Problem Validation:**
- Do 7+/10 mention the same bottlenecks?
- Are these bottlenecks urgent/painful?
- Would they pay to solve them?

**ICP Validation:**
- Which persona resonated most?
- Any new personas emerge?
- What characteristics do the "yes" people share?

**Feature Priorities:**
- What do they want most? (auth, payments, templates?)
- What don't they care about?
- What would they pay extra for?

**Pricing Validation:**
- What price point feels right?
- One-time or subscription?
- What are they comparing it to?

---

## Phase 5: Decision Matrix (Week 4)

### Go/No-Go Criteria

**🟢 GREEN LIGHT (Build it) if:**
- ✅ 7+/10 say this is a real problem
- ✅ 5+/10 would pay for it
- ✅ Clear price sensitivity (€49-99 range)
- ✅ One persona clearly resonates
- ✅ Problem is urgent (not "nice to have")

**🟡 YELLOW LIGHT (Pivot) if:**
- Problem is real but timing is wrong
- Would use it but wouldn't pay
- Different persona than expected
- Price resistance (too expensive for perceived value)

**🔴 RED LIGHT (Stop) if:**
- ❌ Don't see this as a problem
- ❌ Already happy with current solutions
- ❌ "I would never pay for this"
- ❌ Can't find a clear ICP

---

### Next Steps Based on Results

**IF GREEN LIGHT:**
→ Double down on validated persona
→ Build MVP focused on their #1 problem
→ Pre-sell to interview participants
→ Launch to validated ICP first

**IF YELLOW LIGHT:**
→ Adjust ICP based on learnings
→ Reposition product
→ Do 5 more interviews with refined hypothesis
→ Consider different pricing model

**IF RED LIGHT:**
→ Thank participants, follow up anyway
→ Write blog post about what you learned
→ Consider pivot or different problem space
→ Don't build yet

---

## Weekly Time Commitment

| Week | Hours | Tasks |
|------|-------|-------|
| **Week 1** | 5 hours | Prepare script (2h) + Find 50 people (3h) |
| **Week 2** | 6 hours | Outreach (2h) + Schedule (2h) + Interviews (2h) |
| **Week 3** | 6 hours | Interviews (4h) + Analysis (2h) |
| **Week 4** | 4 hours | Complete analysis (2h) + Summary (2h) |
| **Total** | **21 hours** | Over 4 weeks |

---

## Critical Success Metrics

**Minimum Success:**
- 10 completed interviews
- Clear pattern in responses
- Decision on whether to proceed

**Stretch Goals:**
- 20 completed interviews
- 3 people say "I want this now"
- Clear pricing validated
- 5+ pre-sale commitments

---

## Files Created

All files are in: `/Users/samhizam/Desktop/Lionbridge.Digital/prompt-pack/berlin-saas/company-setup/`

| File | Purpose |
|------|---------|
| `interview-script.md` | Questions, opening, closing, checklist |
| `outreach-templates.md` | LinkedIn, Twitter, Reddit scripts, follow-ups |
| `interview-notes-template.md` | Spreadsheet structure, scoring system |
| `icp-validation-report.md` | Findings, quotes, recommendation template |
| `validation-plan.md` | This file - overview and workflow |

---

## Related Files

- `/Users/samhizam/Desktop/Lionbridge.Digital/prompt-pack/berlin-saas/company-setup/funding-icp.md`
  - Contains ICP definitions to validate

---

## Quick Start Checklist

### Week 1
- [ ] Read `interview-script.md` (15 min)
- [ ] Read `outreach-templates.md` (15 min)
- [ ] Set up tracking spreadsheet (30 min)
- [ ] Find 20 LinkedIn prospects (1 hour)
- [ ] Find 15 Twitter prospects (1 hour)
- [ ] Find 10 Reddit communities (30 min)

### Week 2
- [ ] Send LinkedIn messages (1 hour)
- [ ] Send Twitter DMs (1 hour)
- [ ] Post on Reddit (30 min)
- [ ] Follow up on non-responders (1 hour)
- [ ] Schedule 5-10 interviews (1 hour)
- [ ] Conduct 3-5 interviews (2 hours)

### Week 3
- [ ] Conduct remaining interviews (4 hours)
- [ ] Complete all interview notes (2 hours)
- [ ] Start identifying patterns (1 hour)

### Week 4
- [ ] Complete pattern analysis (1 hour)
- [ ] Fill out `icp-validation-report.md` (2 hours)
- [ ] Make go/no-go decision (1 hour)
- [ ] Plan next steps (1 hour)

---

## Post-Validation Verification

After completing interviews:

1. ✅ Review all interview notes
2. ✅ Identify patterns across 10+ interviews
3. ✅ Make go/no-go decision on ICP
4. ✅ If go: proceed with landing page and pre-sales
5. ✅ If no-go: pivot or revisit problem space

---

## Success Indicators

### Problem Validation
- [ ] 7+/10 recognize the same problem
- [ ] Problem is urgent, not "nice to have"
- [ ] Current solutions are inadequate

### Solution Validation
- [ ] 5+/10 would use BridgeLabs
- [ ] Clear feature priorities emerge
- [ ] Solution fits the problem

### Pricing Validation
- [ ] 5+/10 would pay for it
- [ ] Clear price range (€49-99/month)
- [ ] Understandable comparisons

### ICP Validation
- [ ] One persona clearly resonates
- [ ] Understandable characteristics
- [ ] Reachable via existing channels

---

## Common Pitfalls to Avoid

1. **Leading questions** - Don't sell during interviews
2. **Confirmation bias** - Don't only hear what you want to hear
3. **Small sample size** - 10 interviews minimum
4. **Wrong people** - Interview your target ICP, not friends/family
5. **Skipping patterns** - Look for patterns, not outliers
6. **Ignoring pricing** - Must validate willingness to pay
7. **Analysis paralysis** - Make a decision after 10 interviews

---

## Resources

### Reading
- [The Mom Test](https://www.amazon.com/Mom-Test-entrepreneurs-should-everyone/dp/1492031162) by Rob Fitzpatrick
- [Steve Blank's Customer Development](http://steveblank.com/category/customer-development/)
- [Intercom on Customer Research](https://www.intercom.com/books)

### Tools
- **Recording:** Zoom, Google Meet
- **Notes:** Notion, Google Docs, Apple Notes
- **Spreadsheet:** Google Sheets, Excel
- **Calendar:** Calendly (for scheduling)

---

## Contact

**Questions about this plan?**
- Review `interview-script.md` for question details
- Review `outreach-templates.md` for messaging
- Review `interview-notes-template.md` for data capture
- Review `icp-validation-report.md` for analysis

---

**Good luck with the validation!**

Remember: The goal is to learn, not to sell. Be curious, ask good questions, and let the data guide your decision.
