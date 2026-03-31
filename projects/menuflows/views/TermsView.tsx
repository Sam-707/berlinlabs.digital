import React from 'react';
import { useBranding } from '../contexts';

interface TermsViewProps {
  onBack: () => void;
}

const TermsView: React.FC<TermsViewProps> = ({ onBack }) => {
  const branding = useBranding();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <span>←</span> Back
          </button>
          <div className="w-px h-5 bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-md flex items-center justify-center" style={{ background: 'var(--color-accent)' }}>
              <span className="text-white font-black text-xs">✦</span>
            </div>
            <span className="font-black text-sm">{branding.company.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="text-xs font-black uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--color-accent)' }}>
            Legal
          </p>
          <h1 className="text-4xl font-black tracking-tight mb-3">Terms of Service</h1>
          <p className="text-slate-500 text-sm">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-10 text-slate-600 leading-relaxed">

          <Section title="1. Agreement to Terms">
            <p>
              By accessing or using {branding.company.name} (the "Platform"),
              you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.
            </p>
            <p>
              These terms apply to all users of the Platform, including restaurant owners, marketing agency partners,
              POS resellers, and end-customers placing orders.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              {branding.company.name} is a white-label digital menu and ordering platform. It enables restaurants
              to accept table orders via QR code-based digital menus. The Platform is distributed to restaurants
              through agency and reseller partners.
            </p>
            <p>
              We reserve the right to modify, suspend, or discontinue any part of the Platform at any time with
              reasonable notice to registered account holders.
            </p>
          </Section>

          <Section title="3. Account Registration">
            <SubList items={[
              { label: 'Eligibility', text: 'You must be at least 18 years old and have the legal authority to enter into contracts on behalf of your business.' },
              { label: 'Accuracy', text: 'You agree to provide accurate, current, and complete information during registration and to keep it updated.' },
              { label: 'Security', text: 'You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.' },
              { label: 'One account per entity', text: 'Each restaurant or business entity may register one account. Creating duplicate accounts to circumvent restrictions is prohibited.' },
            ]} />
          </Section>

          <Section title="4. Acceptable Use">
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-3">
              {[
                'Use the Platform for any unlawful purpose or in violation of any applicable regulation.',
                'Attempt to gain unauthorised access to any part of the Platform or its infrastructure.',
                'Upload content that is fraudulent, defamatory, obscene, or infringes third-party intellectual property rights.',
                'Reverse-engineer, decompile, or attempt to extract the source code of the Platform.',
                'Use the Platform to transmit spam, malware, or other malicious content.',
                'Resell or sublicense the source code of the Platform to other developers.',
              ].map(r => <li key={r}>{r}</li>)}
            </ul>
          </Section>

          <Section title="5. Subscription & Billing">
            <SubList items={[
              { label: 'Plans', text: 'Access to the Platform requires an active subscription. Pricing is as agreed in your onboarding agreement or reseller contract.' },
              { label: 'Billing cycle', text: 'Subscriptions are billed monthly in advance. Invoices are issued at the start of each billing period.' },
              { label: 'Payment', text: 'You authorise us to charge your designated payment method on the billing date. All fees are non-refundable except as required by law.' },
              { label: 'Late payment', text: 'Accounts with outstanding invoices may be suspended after 14 days of non-payment. Access is restored upon settlement.' },
              { label: 'Cancellation', text: 'You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period.' },
            ]} />
          </Section>

          <Section title="6. Intellectual Property">
            <p>
              All intellectual property in the Platform — including software, design, trademarks, and documentation —
              is owned by the platform operator or its licensors. These terms do not transfer any ownership rights to you.
            </p>
            <p>
              You retain ownership of all content you upload to the Platform (e.g. menu items, images, restaurant details).
              By uploading content, you grant the platform operator a limited licence to display and process it solely
              for the purpose of operating the Platform on your behalf.
            </p>
          </Section>

          <Section title="7. White-Label & Reseller Terms">
            <p>
              If you are a marketing agency or POS reseller distributing the Platform to restaurant clients, additional
              terms apply as set out in your reseller agreement. In particular:
            </p>
            <SubList items={[
              { label: 'End-customer responsibility', text: 'You are responsible for ensuring your restaurant clients comply with these Terms of Service.' },
              { label: 'Branding', text: 'White-label customisation is permitted within the limits defined in your reseller agreement.' },
              { label: 'No sub-reselling', text: 'You may not further sub-license or resell access to the Platform to other developers or agencies without prior written consent.' },
            ]} />
          </Section>

          <Section title="8. Data & Privacy">
            <p>
              Our collection and use of personal data is governed by our{' '}
              <button
                onClick={onBack}
                className="underline"
                style={{ color: 'var(--color-accent)' }}
              >
                Privacy Policy
              </button>
              , which forms part of these Terms. By using the Platform, you consent to the data practices described therein.
            </p>
            <p>
              You are responsible for ensuring that your use of the Platform complies with applicable data protection
              law, including GDPR where relevant, and for obtaining any consents required from your end-customers.
            </p>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>
              To the maximum extent permitted by law, {branding.company.name} and its operator shall not be liable for:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 mt-3">
              {[
                'Any indirect, incidental, special, or consequential damages arising from your use of the Platform.',
                'Loss of revenue, profits, or business opportunities resulting from Platform downtime or errors.',
                'Any loss or corruption of data uploaded by you or your restaurant clients.',
                'Actions or omissions of third-party services (e.g. Supabase, Vercel) that affect Platform availability.',
              ].map(r => <li key={r}>{r}</li>)}
            </ul>
            <p className="mt-4">
              Our total aggregate liability to you shall not exceed the fees paid by you in the three months preceding
              the event giving rise to the claim.
            </p>
          </Section>

          <Section title="10. Disclaimers">
            <p>
              The Platform is provided "as is" and "as available" without warranties of any kind, express or implied.
              We do not warrant that the Platform will be uninterrupted, error-free, or free of harmful components.
            </p>
            <p>
              We are not responsible for the accuracy of menu content, pricing, or availability information entered
              by restaurant owners. Restaurants are solely responsible for their menu data and for fulfilling orders.
            </p>
          </Section>

          <Section title="11. Termination">
            <p>
              We may suspend or terminate your account immediately if you breach these Terms, engage in fraudulent
              activity, or if required by law. Upon termination, your right to access the Platform ceases immediately.
            </p>
            <p>
              You may terminate your account at any time by contacting us at <strong>{branding.company.supportEmail}</strong>.
              Data deletion will be handled in accordance with our Privacy Policy.
            </p>
          </Section>

          <Section title="12. Governing Law">
            <p>
              These Terms are governed by the laws of Germany. Any disputes arising from these Terms shall be subject
              to the exclusive jurisdiction of the courts of Berlin, Germany, unless mandatory consumer protection
              law in your country of residence provides otherwise.
            </p>
          </Section>

          <Section title="13. Changes to These Terms">
            <p>
              We may update these Terms from time to time. Material changes will be communicated via email to registered
              account holders at least 14 days before they take effect. Continued use of the Platform after changes
              take effect constitutes acceptance of the updated Terms.
            </p>
          </Section>

          <Section title="14. Contact">
            <p>
              For any questions regarding these Terms, contact:<br />
              {branding.company.name} · <a href={`https://${branding.company.domain}`} style={{ color: 'var(--color-accent)' }} className="underline">{branding.company.domain}</a><br />
              Email: <a href={`mailto:${branding.company.supportEmail}`} style={{ color: 'var(--color-accent)' }} className="underline">{branding.company.supportEmail}</a>
            </p>
          </Section>
        </div>
      </main>

      <footer className="border-t border-slate-100 py-8 mt-8">
        <div className="max-w-3xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} {branding.company.name}. All rights reserved.</p>
          <button onClick={onBack} className="text-xs text-slate-400 hover:text-slate-900 transition-colors">← Back to home</button>
        </div>
      </footer>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">{title}</h2>
    <div className="space-y-4">{children}</div>
  </div>
);

const SubList: React.FC<{ items: { label: string; text: string }[] }> = ({ items }) => (
  <div className="space-y-3 mt-3">
    {items.map(({ label, text }) => (
      <div key={label} className="flex gap-3">
        <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: 'var(--color-accent)' }} />
        <p><strong className="text-slate-800">{label}:</strong> {text}</p>
      </div>
    ))}
  </div>
);

export default TermsView;
