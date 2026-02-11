# 3rbst Launch Plan

**Product Status:** 85% Complete
**Time to Launch:** 2-8 weeks (post-validation)
**Target Market:** 2M Arabic speakers in Germany
**Pricing:** €7-25 packages

---

## Overview

This plan covers the complete launch process for 3rbst, from legal registration through WhatsApp API setup to beta launch and scaling.

---

## Phase 1: Legal Foundation (Week 1-4)

### Business Registration (Gewerbeanmeldung)

#### Week 1: Preparation

**Documents Needed:**
- [ ] Valid passport/ID card
- [ ] Proof of address (Meldebescheinigung)
- [ ] Possible trade license (Gewerbeschein) - check local requirements

**Business Structure Decision:**

| Structure | Cost | Setup Time | Liability | Recommended |
|-----------|-------|-------------|-----------|-------------|
| **Einzelunternehmen** | €20-60 | 1 day | Personal assets | ✅ Yes - Start here |
| **GmbH** | €25,000 + €2,500 fees | 4-6 weeks | Limited liability | No - Overkill for MVP |
| **UG (haftungsbeschränkt)** | €1-25,000 + €800-1,500 | 2-3 weeks | Limited liability | Maybe - If scaling fast |

**Recommendation:** Start as Einzelunternehmen (sole proprietorship)

#### Week 2: Registration Process

**Step-by-Step:**
1. [ ] Book appointment at local Gewerbeamt (business office)
   - Berlin: [Finance Senate](https://www.berlin.de/sen/finanzen/service/angebot/018248/index.html)
   - Cost: €20-60 (varies by city)

2. [ ] Fill out "Gewerbeanmeldung" form
   - Business description: "Online-Dienstleistungen für Dokumentenübersetzung und -analyse"
   - Business name: 3rbst (or "3rbst Dokumenten服务")

3. [ ] Bring documents to appointment
   - [ ] Passport/ID
   - [ ] Meldebescheinigung (if applicable)
   - [ ] Cash/card for fee payment

4. [ ] Receive trade license (Gewerbeschein)
   - Keep this safe - needed for bank account, PayPal, etc.

5. [ ] Register with Finanzamt (tax office)
   - They'll send you the Fragebogen zur steuerlichen Erfassung (tax questionnaire)
   - Fill out online at ELSTER platform
   - You'll receive a Steuernummer (tax number)

**Costs:**
- Gewerbeanmeldung: €20-60 (one-time)
- Notary (if GmbH): €800-1,500 (not needed for Einzelunternehmen)
- Chamber of Commerce (IHK) fees: €0-50/year (may be waived for small businesses)

#### Week 3-4: Financial Setup

**Business Bank Account:**
- [ ] Open business bank account
  - Options: N26, Penta, comdirect, traditional banks
  - Documents needed: Gewerbeschein, passport, proof of address
  - Cost: €0-10/month

**Tax Registration:**
- [ ] Complete ELSTER registration (online tax system)
- [ ] Receive Steuernummer (tax number) - takes 2-4 weeks
- [ ] Decide on VAT (Umsatzsteuer) registration
  - Under €22,000/year: Can apply for Kleinunternehmerregelung (small business exemption)
  - Over €22,000/year: Must register for VAT

**Kleinunternehmerregelung (Small Business Exemption):**
- If you expect <€22,000 revenue in Year 1: Apply for exemption
- Benefit: No VAT collection, no VAT returns
- Drawback: Can't deduct input VAT, less professional appearance
- Apply via the Fragebogen zur steuerlichen Erfassung

---

## Phase 2: Legal Pages & Compliance (Week 3-4)

### Required Legal Pages

#### 1. Impressum (Legal Notice)

**Required Information:**
```markdown
# Impressum

Angaben gemäß § 5 TMG

[Your Full Name]
[Your Street Address]
[Postal Code] [City]

**Kontakt:**
- E-Mail: [your-email@3rbst.de]
- Telefon: [+49 XXX XXXXXXX]

**Registereintrag:**
Eintragung im Handelsregister: [Not applicable for Einzelunternehmen]
Registernummer: [N/A]

**Umsatzsteuer-ID:**
Umsatzsteuer-Identifikationsnummer: [Your VAT ID - if applicable]

**Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:**
[Your Full Name]
[Your Address]

**Haftungsausschluss:**
[Disclaimer about content accuracy, external links, etc.]

**Streitschlichtung:**
[Information about EU online dispute resolution - optional for B2C]
```

#### 2. Datenschutzerklärung (Privacy Policy)

**Key Sections Required by GDPR:**
- [ ] What data is collected (WhatsApp messages, documents, metadata)
- [ ] Purpose of data collection (document translation/analysis)
- [ ] Legal basis (Art. 6 DSGVO - Contract performance or Consent)
- [ ] Data retention period (e.g., 30 days for documents)
- [ ] User rights (Art. 15-22 DSGVO)
  - Right to access
  - Right to rectification
  - Right to erasure ("right to be forgotten")
  - Right to restriction of processing
  - Right to data portability
  - Right to object
- [ ] Data security measures
- [ ] International data transfers (if using US-based services)
- [ ] Contact for privacy questions

**Template Cost:** €100-200 for lawyer-drafted template

#### 3. AGB (Terms of Service)

**Key Sections:**
- [ ] Service description (document translation/analysis via WhatsApp)
- [ ] User obligations (no illegal documents, payment terms)
- [ ] Service limitations (no legal advice, accuracy disclaimers)
- [ ] Payment terms (pricing, payment methods)
- [ ] Liability limitations (critical for document-related services)
- [ ] Termination rights (both user and provider)
- [ ] Applicable law (German law)
- [ ] Jurisdiction (local court)

**Important Disclaimers:**
- "Not a substitute for professional legal advice"
- "Translation accuracy not guaranteed for legal purposes"
- "Not responsible for decisions made based on translations"

**Template Cost:** €100-200 for lawyer-drafted template

#### 4. Widerrufsbelehrung (Cancellation Policy)

**Required for B2C (if applicable to your pricing model):**
- 14-day right of withdrawal
- Exclusion for digital services once performance begins (with consent)

**Note:** For pay-per-document pricing, standard cancellation may not apply.
For subscription plans, include this.

### GDPR Implementation

**Technical Requirements:**

1. **Consent Mechanism:**
   - [ ] Add opt-in message: "By sending documents, you agree to our Privacy Policy"
   - [ ] Store consent timestamp
   - [ ] Provide link to Privacy Policy in every interaction

2. **Data Minimization:**
   - [ ] Only store documents for required time (e.g., 24-48 hours for processing)
   - [ ] Delete WhatsApp messages after processing
   - [ ] Anonymize analytics data

3. **User Rights Implementation:**
   - [ ] `/delete` command - delete all user data
   - [ ] `/export` command - export user data (GDPR Art. 15)
   - [ ] `/whatdata` command - show what data is stored

4. **Data Security:**
   - [ ] Encrypt documents at rest (Supabase already does this)
   - [ ] Use secure WhatsApp API connection
   - [ ] Regular security audits

5. **Data Processing Agreement (DPA):**
   - [ ] Sign DPA with WhatsApp (Meta)
   - [ ] Sign DPA with OpenAI/Anthropic (if applicable)
   - [ ] Sign DPA with Supabase

**Cost:** €200-500 for GDPR review/setup (if using templates)

---

## Phase 3: WhatsApp Business API Setup (Week 5-6)

### WhatsApp Business Partner Selection

**Options:**

| Provider | Setup Cost | Per-Message Cost | Conversation Bundles | Recommended |
|----------|------------|------------------|---------------------|-------------|
| **Twilio** | $0 setup | Variable | 1,000 conversations: $X/month | ✅ Yes - Good documentation |
| **MessageBird** | €0 setup | Variable | Bundles available | Maybe - Check pricing |
| **360dialog** | €99 setup | Variable | 1,000 conversations: €X/month | Maybe - Popular for SMBs |
| **WATI** | $49/month | Unlimited | All-inclusive | Maybe - Simple pricing |

**Recommendation:** Start with Twilio or 360dialog for best balance of cost and features

### Application Process

**Step 1: Create WhatsApp Business Account (WABA)**
1. [ ] Sign up at Meta Business Suite
2. [ ] Create Business Manager account
3. [ ] Verify business email domain

**Step 2: Submit Application**
1. [ ] Provide business information
   - Business name (use "3rbst" or registered business name)
   - Business type (SaaS, Translation Services)
   - Website URL (landing page required)
   - Business description

2. [ ] Upload business documents
   - [ ] Business registration (Gewerbeschein)
   - [ ] Proof of address (utility bill, Meldebescheinigung)
   - [ ] Domain ownership proof (DNS record)

3. [ ] Submit for review
   - Review time: 1-5 business days
   - May require follow-up documents

**Step 3: Configure Phone Number**
1. [ ] Choose phone number type
   - [ ] Existing number: Port current number (€5-10)
   - [ ] New number: Buy from provider (€1-5/month)

2. [ ] Verify number
   - [ ] SMS verification
   - [ ] Or call verification

**Step 4: Set Up Message Templates**
1. [ ] Create message templates (required for outbound messages)
   - Template categories: Marketing, Utility, Authentication

2. [ ] Submit templates for approval
   - Template example: "Hello {{1}}, your document translation is ready. Click here to view: {{2}}"

   - Approval time: 1-24 hours

### Pricing Structure

**WhatsApp Business API Costs:**

| Type | Cost | Notes |
|------|------|-------|
| **Setup** | €0-99 | Varies by provider |
| **Phone Number** | €1-5/month | Monthly rental |
| **Conversations** | Variable | Bundled or pay-per-use |
| - Utility conversations | €0.005-0.01 | Each 24-hour session |
| - Marketing conversations | €0.01-0.02 | Each 24-hour session |
| - Authentication conversations | €0.005-0.01 | Each 24-hour session |

**Conversation Definition:** A conversation lasts for 24 hours from the first message.
All messages within 24 hours count as 1 conversation.

**Cost Estimates:**
- 1,000 users/month = ~1,000 conversations
- Cost: €5-20/month (depending on provider)

---

## Phase 4: Technical Integration (Week 6-7)

### WhatsApp API Integration

**Code Setup:**

```bash
# Install provider SDK
npm install twilio  # or @whiskeysockets/baileys for free option
```

**Implementation Tasks:**
- [ ] Set up webhook endpoint for incoming messages
- [ ] Implement message queue system
- [ ] Document processing pipeline
- [ ] AI integration (OpenAI/Anthropic)
- [ ] Response formatting
- [ ] Error handling
- [ ] Rate limiting (prevent abuse)

**Database Schema Updates:**
```sql
-- Add to users/conversations table
ALTER TABLE users ADD COLUMN phone_number TEXT UNIQUE;
ALTER TABLE users ADD COLUMN whatsapp_conversation_id TEXT;
ALTER TABLE users ADD COLUMN consent_given BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN consent_timestamp TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN data_retention_until TIMESTAMPTZ;

-- Document processing table
CREATE TABLE document_processions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  document_type TEXT,
  document_url TEXT,
  translation_result TEXT,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- GDPR deletion tracking
CREATE TABLE gdpr_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  request_type TEXT, -- 'deletion', 'export'
  status TEXT, -- 'pending', 'completed', 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

### GDPR Commands Implementation

**Command Handlers:**
- [ ] `/delete` - Delete all user data
- [ ] `/export` - Export all user data
- [ ] `/whatdata` - Show what data is stored
- [ ] `/help` - Show all commands

---

## Phase 5: Testing & Compliance Check (Week 7)

### Testing Checklist

**Functional Testing:**
- [ ] Send document → Receive translation (test all formats)
- [ ] Pay-per-document flow (test payment)
- [ ] Package purchase flow (test subscription)
- [ ] GDPR commands (delete, export, whatdata)
- [ ] Error handling (invalid file, payment failure)
- [ ] Multi-language support (German to Arabic)

**Compliance Testing:**
- [ ] Test data deletion works completely
- [ ] Verify data retention limits (auto-delete after X days)
- [ ] Test consent mechanism
- [ ] Verify all legal pages are accessible
- [ ] Test opt-out/unsubscribe functionality

**Security Testing:**
- [ ] Test rate limiting (prevent spam)
- [ ] Test file size limits
- [ ] Test file type validation (no executables)
- [ ] Verify webhook signature verification
- [ ] Test SQL injection protection

### Pre-Launch Compliance Review

**Checklist:**
- [ ] Legal pages live and accessible
- [ ] Privacy policy covers all data processing
- [ ] Terms of service include liability disclaimers
- [ ] Cookie consent (if using web interface)
- [ ] GDPR consent flow implemented
- [ ] Data deletion functionality working
- [ ] Data export functionality working
- [ ] WhatsApp templates approved
- [ ] Business verification complete

---

## Phase 6: Beta Launch (Week 8)

### Beta User Recruitment

**Target:** 50-100 beta users

**Recruitment Channels:**

1. **Facebook Groups (Primary)**
   - "Arabic in Germany"
   - "Syrians in Berlin"
   - "Arabische Community in Deutschland"
   - "Learn German (Arabic speakers)"

2. **Local Networks**
   - [ ] Arabic cultural centers
   - [ ] Mosques (community boards)
   - [ ] Arabic grocery stores
   - [ ] Language exchange groups

3. **WhatsApp Groups**
   - [ ] Existing Arabic community groups
   - [ ] Student groups
   - [ ] Expat groups

### Beta Offer Terms

**Beta Deal:**
- [ ] Free: 5 documents (€0 value)
- [ ] No payment required
- [ ] All features included
- [ ] Priority support via WhatsApp
- [ ] Feedback required (1 survey after 5 documents)

**Onboarding Flow:**
```
1. User sees post → Clicks link to WhatsApp
2. Sends "START" to bot
3. Bot responds: Welcome message + "By using this service, you agree to our Privacy Policy [link]. Reply AGREE to continue."
4. User replies "AGREE"
5. Bot: "Great! Send me a German document and I'll explain it in Arabic."
6. User sends document
7. Bot processes → Returns Arabic explanation
8. Bot: "How was this? Reply 1-5 for quality."
```

### Beta Success Criteria

| Metric | Target | Actual |
|--------|--------|--------|
| Beta Users | 50-100 | [ ] |
| Documents Processed | 250+ | [ ] |
| Satisfaction Rate (4-5 stars) | 80%+ | [ ] |
| Would Pay (survey) | 60%+ | [ ] |
| Bug Reports | <10 | [ ] |

---

## Phase 7: Marketing & Community (Week 8-12)

### Marketing Playbook

**Channel 1: Community Marketing (Primary)**

**Strategy:** Build trust through helpfulness

**Tactics:**
- [ ] Post weekly "German document explained" tips in groups
- [ ] Share before/after examples (with permission)
- [ ] Answer German bureaucracy questions (build authority)
- [ ] Host "Ask me anything" sessions about German documents

**Content Ideas:**
- "5 German documents every Arabic speaker should understand"
- "How to read a German rental contract (German + Arabic explanation)"
- "German bureaucracy words you need to know"

**Channel 2: Facebook Ads (Secondary)**

**Campaign Setup:**
- [ ] Budget: €100-200/month
- [ ] Targeting: Arabic speakers in Germany, age 25-55
- [ ] Ad language: Arabic
- [ ] Ad copy: "German documents confusing? We explain them in Arabic via WhatsApp. Try 5 documents free."

**Channel 3: Referral Program**

**Program:**
- [ ] Offer: 1 free document for each friend who signs up
- [ ] Referral code: Each user gets unique code
- [ ] Share via WhatsApp "Invite friends" button

---

## Phase 8: Pricing & Monetization

### Pricing Structure

| Package | Price | What You Get | Target |
|---------|-------|--------------|--------|
| **Starter** | €7 | 5 documents | Occasional users (1-2 docs/month) |
| **Regular** | €15 | 15 documents | Average users (3-5 docs/month) |
| **Power** | €25 | 30 documents | Power users (10+ docs/month) |
| **Unlimited** | €49/month | Unlimited documents | Heavy users, businesses |

**Add-Ons:**
- [ ] Rush processing (1 hour): +€2/document
- [ ] Legal review by actual lawyer: +€50-100/document (partner service)

### Payment Processing

**Options:**

| Provider | Setup | Transaction Fee | Monthly Fee | Recommended |
|----------|-------|-----------------|-------------|-------------|
| **Stripe** | Free | 1.4% + €0.25 | €0 | ✅ Yes - Best for subscriptions |
| **PayPal** | Free | 2.9% + €0.35 | €0 | Maybe - Users like PayPal |
| **SumUp** | Free | 2.5% | €0 | Maybe - Simple for Germany |

**Recommendation:** Stripe for primary, PayPal as backup option

---

## Phase 9: Metrics & KPIs

### Weekly Metrics to Track

| Metric | Month 1 Target | Month 3 Target | Month 6 Target |
|--------|----------------|----------------|----------------|
| Active Users | 100 | 500 | 1,500 |
| MRR | €0 | €600 | €2,500 |
| Documents Processed | 500 | 2,000 | 6,000 |
| Free-to-Paid Conversion | - | 15% | 20% |
| Churn (monthly) | - | <8% | <8% |
| NPS Score | - | 4.0+ | 4.5+ |
| Avg. Docs/User/Month | - | 4-6 | 5-8 |

### Monitoring Setup

**Dashboard Metrics:**
- [ ] New users (by channel)
- [ ] Active users (last 7 days)
- [ ] Documents processed (by type)
- [ ] MRR & ARPU (Average Revenue Per User)
- [ ] Conversion rate (free to paid)
- [ ] Churn rate
- [ ] Satisfaction score

**Alerts:**
- [ ] Error rate >5% on document processing
- [ ] Processing time >30 seconds
- [ ] API costs spike (unexpected usage)
- [ ] Negative feedback spike

---

## Resource Requirements

### Upfront Investment

| Item | Cost | Notes |
|------|------|-------|
| Business Registration | €60 | Gewerbeamt |
| Bank Account Setup | €0-10 | Varies by bank |
| Legal Templates | €300-500 | Impressum, AGB, GDPR (3rbst needs more robust legal) |
| WhatsApp Provider Setup | €0-99 | Varies by provider |
| Domain (3rbst.de) | €15 | First year |
| WhatsApp Phone Number | €5 | First month |
| Facebook Ads (beta) | €100 | Initial recruitment |
| **Total Upfront** | **€480-789** | Higher than MenuFlows due to legal |

### Monthly Costs (Post-Launch)

| Item | Cost | Notes |
|------|------|-------|
| Vercel Pro | €20 | Hosting |
| Sentry | €0 | Free tier |
| Domain | €1.25 | Amortized |
| WhatsApp Phone Number | €5 | Monthly |
| WhatsApp Conversations | €5-20 | 1,000-5,000 conversations |
| OpenAI/Anthropic API | €10-50 | Document processing |
| Email | €0-10 | Free tier to paid |
| Insurance (optional) | €10-30 | Professional indemnity |
| **Total Monthly** | **€51-136** | Higher due to API + WhatsApp costs |

### Time Commitment

| Phase | Hours/Week | Duration | Activities |
|-------|------------|----------|-------------|
| Legal Registration | 5-10 | 2-4 weeks | Paperwork, appointments |
| WhatsApp Setup | 10-15 | 2 weeks | Application, integration |
| Beta Launch | 10-15 | 2 weeks | Recruitment, support |
| Growth & Marketing | 10-15 | Ongoing | Community, ads |
| Support & Iteration | 5-10 | Ongoing | User questions, features |

**Average: 10-15 hours/week**

---

## Success Criteria

### Month 1-2 (Beta Phase)
- [ ] 50-100 beta users recruited
- [ ] 250+ documents processed
- [ ] Positive feedback from 70%+ users
- [ ] <5 critical bugs
- [ ] 60%+ say they'd pay for the service

### Month 3-6 (Launch Phase)
- [ ] 500+ active users
- [ ] MRR >€600
- [ ] Free-to-paid conversion >15%
- [ ] Churn <8% monthly
- [ ] NPS >4.0

### Month 6+ (Scale Phase)
- [ ] 1,500+ active users
- [ ] MRR >€2,500
- [ ] Repeatable acquisition (CAC < LTV)
- [ ] NPS >4.5
- [ ] Profitable (revenue > costs)

---

## Risk Mitigation

### Legal Risks

**Risk:** Translation accuracy issues
**Mitigation:**
- Clear disclaimers that this is not legal advice
- Accuracy percentage in responses
- Partner with actual lawyers for "legal review" add-on

**Risk:** GDPR violation
**Mitigation:**
- Implement robust data deletion
- Short data retention (24-48 hours)
- GDPR-compliant consent flow
- Regular compliance audits

**Risk:** WhatsApp account ban
**Mitigation:**
- Follow WhatsApp Business Policy strictly
- Use approved message templates
- Don't spam users
- Provide clear opt-out

### Business Risks

**Risk:** Low willingness to pay
**Mitigation:**
- Start with free tier to prove value
- Survey pricing sensitivity during beta
- Offer multiple pricing tiers
- Add urgency (limited free docs)

**Risk:** High API costs (OpenAI/Anthropic)
**Mitigation:**
- Implement rate limiting per user
- Cache document translations
- Use cheaper models for simple tasks
- Monitor usage closely

**Risk:** Competition (Google Translate, DeepL)
**Mitigation:**
- Focus on explanation, not just translation
- Contextualize for German bureaucracy
- WhatsApp convenience (no app switch)
- Personal, helpful service

---

## Launch Timeline Summary

```
Week 1:        Business registration preparation
Week 2:        Register business (Gewerbeamt), open bank account
Week 3:        Legal pages (Impressum, GDPR, AGB)
Week 4:        Finanzamt registration, tax number
Week 5:        WhatsApp API application
Week 6:        WhatsApp API setup, technical integration
Week 7:        Testing, compliance check
Week 8:        Beta launch (50-100 users)
Week 9-12:     Beta support, iteration, marketing
Month 4-6:     Scale to 500-1,500 users, optimize
```

**Total Time to Launch:** 8-12 weeks (legal takes time)

**Fastest Path:** If already have business registered: 2-4 weeks

---

## Appendices

### Appendix A: Legal Template Resources

**German Legal Template Providers:**
1. **IT-Recht Kanzlei** - Premium, lawyer-reviewed templates (€100-200)
2. ** muster-mustermann.de** - Mid-range (€50-100)
3. **Standard IT-Muster** - Budget-friendly (€30-50)

**Note:** 3rbst requires more robust legal than MenuFlows because of document-related liability. Budget €300-500 for legal templates.

### Appendix B: WhatsApp Message Templates

**Welcome Message (Template 1):**
```
مرحباً! 👋

أنا 3rbst - سأشرح لك المستندات الألمانية باللغة العربية.

إرسال مستند ألماني وسأشرح ما يعنيه.

✅ 5 مستندات مجانية للبدء
🔒 خصوصية محمية بالكامل
⚡ استجابة سريعة

ابدأ الآن عن طريق إرسال صورة أو ملف.

---
Hello! 👋

I'm 3rbst - I'll explain German documents to you in Arabic.

Send me a German document and I'll explain what it means.

✅ 5 free documents to start
🔒 Fully private
⚡ Fast response

Start now by sending a photo or file.
```

**Consent Message (Template 2):**
```
By using this service, you agree to our Privacy Policy: [link]

Reply AGREE to continue.

باستخدام هذه الخدمة، أنت توافق على سياسة الخصوصية الخاصة بنا: [رابط]

رد بـ "موافق" للمتابعة.
```

### Appendix C: Beta Recruitment Post Template

```
🇩🇪✍️ Möchten Sie deutsche Dokumente besser verstehen?

Ich entwickle 3rbst - einen WhatsApp-Service, der deutsche Dokumente
auf Arabisch erklärt.

🎁 50 Beta-Tester gesucht!
✅ 5 Dokumente kostenlos
✅ Keine Kreditkarte erforderlich
✅ Sofortige Nutzung via WhatsApp

Einfach diese Nummer speichern und "START" schreiben:
[WhatsApp Number]

Interessiert? Kommentieren Sie unten oder DM mich!
```

---

**Document Version:** 1.0
**Last Updated:** [Date]
**Owner:** [Name]
