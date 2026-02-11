function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-brand-tertiary border-t border-brand-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <a href="#" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-accent to-brand-accentHover flex items-center justify-center text-white font-bold text-xl">
                BL
              </div>
              <span className="text-xl font-bold">BridgeLabs</span>
            </a>
            <p className="text-brand-muted text-sm">
              Digital solutions for modern businesses in Berlin and beyond.
            </p>
          </div>

          {/* Sitemap */}
          <div className="md:col-span-2">
            <h4 className="font-semibold mb-4 text-brand-text">Sitemap</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#services" className="text-brand-muted hover:text-brand-accent transition-colors">Services</a></li>
              <li><a href="#portfolio" className="text-brand-muted hover:text-brand-accent transition-colors">Portfolio</a></li>
              <li><a href="#about" className="text-brand-muted hover:text-brand-accent transition-colors">About</a></li>
              <li><a href="#contact" className="text-brand-muted hover:text-brand-accent transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-1">
            <h4 className="font-semibold mb-4 text-brand-text">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/privacy" className="text-brand-muted hover:text-brand-accent transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="text-brand-muted hover:text-brand-accent transition-colors">Terms of Service</a></li>
              <li><a href="/imprint" className="text-brand-muted hover:text-brand-accent transition-colors">Imprint</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-brand-border pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p className="text-brand-muted">
            &copy; {currentYear} BridgeLabs Digital Solutions. All rights reserved.
          </p>
          <p className="text-brand-muted">
            Built with React 19 + TypeScript + Tailwind CSS in Berlin
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
