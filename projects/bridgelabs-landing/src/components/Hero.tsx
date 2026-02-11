function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-tertiary">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sPSJodHRwOi8vd3d3LnczLzIwMDAvc3ZnIj48cGF0a2g+PC9zdmc+')] opacity-5"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent/10 border border-brand-accent/20 rounded-full mb-6">
            <span className="w-2 h-2 bg-brand-accent rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-brand-accent">Validating Two Products in Parallel</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-brand-accent to-brand-accentHover bg-clip-text text-transparent">
              Building Products
            </span>
            <br />
            <span className="text-brand-text">That Solve Real Problems</span>
          </h1>

          <p className="text-xl sm:text-2xl text-brand-muted mb-12 max-w-3xl mx-auto">
            Berlin-based digital studio validating and launching innovative SaaS products.
            <br />
            QR menus for restaurants. AI-powered document translation.
          </p>

          {/* Product Highlights */}
          <div className="grid sm:grid-cols-2 gap-4 mb-12 max-w-4xl mx-auto">
            <div className="p-6 bg-brand-secondary rounded-xl border border-brand-border">
              <div className="text-3xl mb-3">🍽️</div>
              <h3 className="text-xl font-bold mb-2">MenuFlows</h3>
              <p className="text-sm text-brand-muted">Digital QR menus for 50K+ restaurants in DACH region</p>
              <div className="mt-3 text-xs font-semibold text-brand-accent">70% complete • €29-49/month</div>
            </div>
            <div className="p-6 bg-brand-secondary rounded-xl border border-brand-border">
              <div className="text-3xl mb-3">🇩🇪🇸🇦</div>
              <h3 className="text-xl font-bold mb-2">3rbst (عربست)</h3>
              <p className="text-sm text-brand-muted">WhatsApp-based German document explanation for 2M Arabic speakers</p>
              <div className="mt-3 text-xs font-semibold text-brand-accent">85% complete • €7-25 packages</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#portfolio"
              className="px-8 py-4 bg-brand-accent hover:bg-brand-accentHover text-white text-lg font-semibold rounded-lg transition-all hover:scale-105"
            >
              View Our Products
            </a>
            <a
              href="#contact"
              className="px-8 py-4 bg-brand-tertiary hover:bg-brand-accent text-white text-lg font-semibold rounded-lg transition-all hover:scale-105 border border-brand-border"
            >
              Join Beta Testing
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-brand-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7v5" />
          </svg>
        </div>
      </div>
    </section>
  )
}

export default Hero
