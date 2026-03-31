import React from 'react';
import { useBranding } from '../contexts';

interface PrivacyViewProps {
  onBack: () => void;
}

const PrivacyView: React.FC<PrivacyViewProps> = ({ onBack }) => {
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
          <h1 className="text-4xl font-black tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-slate-500 text-sm">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-10 text-slate-600 leading-relaxed">

          <Section title="1. Who We Are">
            <p>
              {branding.company.name} is a digital menu and ordering platform.
              We provide QR-based ordering infrastructure for restaurants,
              deployed and managed by your local agency or service provider.
            </p>
            <p>For any privacy-related enquiries, contact us at: <strong>{branding.company.supportEmail}</strong></p>
          </Section>

          <Section title="2. What Data We Collect">
            <p>We collect data in two contexts:</p>
            <SubList items={[
              { label: 'Restaurant end-customers', text: 'When a customer scans a QR code and places an order, we collect table number, order contents, and order status. We do not collect names, email addresses, or payment information — payments are handled outside our platform.' },
              { label: 'Agency partners & restaurant owners', text: 'When you register as a reseller or restaurant owner, we collect your name, email address, business name, and billing information for platform access.' },
              { label: 'Usage data', text: 'We collect anonymous analytics including page views, session duration, and feature usage to improve the platform.' },
            ]} />
          </Section>

          <Section title="3. How We Use Your Data">
            <SubList items={[
              { label: 'Order processing', text: 'Order data is used solely to display orders to restaurant staff and track order status in real time.' },
              { label: 'Platform administration', text: 'Partner and owner data is used to manage your account, process billing, and provide support.' },
              { label: 'Product improvement', text: 'Aggregated, anonymised usage data helps us improve features and performance.' },
            ]} />
            <p>We do not sell personal data to third parties. We do not use customer data for advertising purposes.</p>
          </Section>

          <Section title="4. Data Storage & Security">
            <p>
              All data is stored on <strong>Supabase</strong> infrastructure hosted in the EU (Frankfurt, Germany) on
              Amazon Web Services. We use row-level security policies to ensure each restaurant can only access its own data.
              Data in transit is encrypted via TLS 1.2+. Data at rest is encrypted using AES-256.
            </p>
          </Section>

          <Section title="5. Data Retention">
            <p>
              Order data is retained for 12 months from the date of the order, after which it is permanently deleted.
              Account data is retained for the duration of your subscription and deleted within 30 days of account closure upon request.
            </p>
          </Section>

          <Section title="6. Cookies">
            <p>
              We use minimal session cookies to maintain authentication state for restaurant owners and platform administrators.
              No tracking or advertising cookies are used. No third-party cookie services (e.g. Google Analytics, Facebook Pixel)
              are deployed on the ordering interface.
            </p>
          </Section>

          <Section title="7. Your Rights (GDPR)">
            <p>If you are based in the EU or EEA, you have the following rights:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-3">
              {[
                'Right to access — request a copy of the data we hold about you.',
                'Right to rectification — request correction of inaccurate data.',
                'Right to erasure — request deletion of your personal data.',
                'Right to data portability — receive your data in a machine-readable format.',
                'Right to object — object to processing of your data for certain purposes.',
              ].map(r => <li key={r}>{r}</li>)}
            </ul>
            <p className="mt-4">To exercise any of these rights, email <strong>{branding.company.supportEmail}</strong>. We will respond within 30 days.</p>
          </Section>

          <Section title="8. Third-Party Services">
            <p>We use the following sub-processors:</p>
            <div className="overflow-hidden rounded-2xl border border-slate-100 mt-4">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-wider text-slate-500">Service</th>
                    <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-wider text-slate-500">Purpose</th>
                    <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-wider text-slate-500">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { name: 'Supabase', purpose: 'Database & authentication', loc: 'EU (Frankfurt)' },
                    { name: 'Vercel', purpose: 'Hosting & edge delivery', loc: 'EU / Global CDN' },
                  ].map(r => (
                    <tr key={r.name}>
                      <td className="px-4 py-3 font-semibold text-slate-900">{r.name}</td>
                      <td className="px-4 py-3 text-slate-500">{r.purpose}</td>
                      <td className="px-4 py-3 text-slate-500">{r.loc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>
              We may update this policy periodically. Material changes will be communicated via email to registered
              account holders. Continued use of the platform after changes constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              {branding.company.name} · <a href={`https://${branding.company.domain}`} style={{ color: 'var(--color-accent)' }} className="underline">{branding.company.domain}</a><br />
              Email: <a href={`mailto:${branding.company.supportEmail}`} style={{ color: 'var(--color-accent)' }} className="underline">{branding.company.supportEmail}</a>
            </p>
          </Section>
        </div>
      </main>

      <Footer branding={branding} onBack={onBack} />
    </div>
  );
};

// ─── Shared sub-components ────────────────────────────────────────────────────

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

const Footer: React.FC<{ branding: any; onBack: () => void }> = ({ branding, onBack }) => (
  <footer className="border-t border-slate-100 py-8 mt-8">
    <div className="max-w-3xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-xs text-slate-400">© {new Date().getFullYear()} {branding.company.name}. All rights reserved.</p>
      <button onClick={onBack} className="text-xs text-slate-400 hover:text-slate-900 transition-colors">← Back to home</button>
    </div>
  </footer>
);

export default PrivacyView;
