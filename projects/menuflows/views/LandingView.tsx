import React from 'react';

interface LandingViewProps {
  onDemo: () => void;
}

/**
 * Landing page shown when no restaurant slug is in the URL
 * menuflows.app/ → Shows this page
 * menuflows.app/burgerlab → Shows restaurant menu
 */
const LandingView: React.FC<LandingViewProps> = ({ onDemo }) => {
  return (
    <div className="min-h-screen bg-background-dark text-white overflow-y-auto">
      {/* Hero */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />

        <nav className="relative z-10 max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white">bolt</span>
            </div>
            <span className="text-2xl font-black tracking-tight">
              menu<span className="text-primary">flows</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/admin" className="text-sm text-white/60 hover:text-white transition-colors">
              Admin
            </a>
            <button
              onClick={onDemo}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-full text-sm font-bold transition-all"
            >
              Try Demo
            </button>
          </div>
        </nav>

        <header className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-bold uppercase tracking-widest mb-8">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            Digital Restaurant Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9] mb-6">
            The Future of
            <br />
            <span className="text-primary">Restaurant Ordering</span>
          </h1>

          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12">
            QR-based digital menus with real-time kitchen sync.
            <br />
            No app downloads. No friction. Just smooth operations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onDemo}
              className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary/90 rounded-full text-lg font-bold shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
            >
              View Demo Restaurant
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <a
              href="mailto:hello@menuflows.app"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-lg font-bold transition-all"
            >
              Contact Sales
            </a>
          </div>

        </header>
      </div>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: 'qr_code_2',
              title: 'QR Menu',
              desc: 'Guests scan, browse, and order from their phone. No app needed.',
            },
            {
              icon: 'sync_alt',
              title: 'Handshake Protocol',
              desc: 'Unique codes connect digital orders to physical tables seamlessly.',
            },
            {
              icon: 'monitoring',
              title: 'Real-time Kitchen',
              desc: 'Orders appear instantly. Track status from pending to served.',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:border-primary/30 transition-all"
            >
              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-white/60">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-black text-center mb-12">Simple Pricing</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Starter', price: '29', features: ['1 Location', 'QR Menus', 'Order Management'] },
            { name: 'Professional', price: '49', features: ['3 Locations', 'Analytics', 'Priority Support'], popular: true },
            { name: 'Enterprise', price: 'Custom', features: ['Unlimited', 'API Access', 'Dedicated Manager'] },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`p-8 rounded-3xl ${
                plan.popular
                  ? 'bg-primary text-white ring-2 ring-primary ring-offset-4 ring-offset-[#0a0a0a]'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="text-xs font-bold uppercase tracking-widest mb-4 opacity-70">Most Popular</div>
              )}
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="text-4xl font-black mb-6">
                {plan.price === 'Custom' ? plan.price : `€${plan.price}`}
                {plan.price !== 'Custom' && <span className="text-lg font-normal opacity-60">/mo</span>}
              </div>
              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-lg">check</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Business Types */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-black mb-4">For All Food Businesses</h2>
        <p className="text-white/60 mb-12">Restaurants, cafés, bars, bakeries, food trucks, and more.</p>

        <div className="flex flex-wrap justify-center gap-4">
          {['Restaurants', 'Cafés', 'Bars', 'Bakeries', 'Food Trucks', 'Ghost Kitchens', 'Hotels'].map((type) => (
            <div key={type} className="px-6 py-3 bg-white/5 rounded-full text-sm font-bold">
              {type}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">bolt</span>
            </div>
            <span className="font-bold">menuflows</span>
          </div>
          <div className="text-white/40 text-sm">
            © 2024 Menuflows. Built in Berlin.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingView;
