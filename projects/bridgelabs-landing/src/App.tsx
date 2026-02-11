import { useState } from 'react'
import Hero from './components/Hero'
import Services from './components/Services'
import Portfolio from './components/Portfolio'
import Contact from './components/Contact'
import Footer from './components/Footer'
import './index.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  return (
    <div className="min-h-screen bg-brand-primary text-brand-text">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-primary/95 backdrop-blur-md border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="#" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-accent to-brand-accentHover flex items-center justify-center text-white font-bold text-xl">
                BL
              </div>
              <span className="text-xl font-bold">BridgeLabs</span>
            </a>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-brand-muted hover:text-brand-text transition-colors">Services</a>
              <a href="#portfolio" className="text-brand-muted hover:text-brand-text transition-colors">Portfolio</a>
              <a href="#about" className="text-brand-muted hover:text-brand-text transition-colors">About</a>
              <a href="#contact" className="px-4 py-2 bg-brand-accent hover:bg-brand-accentHover text-white rounded-lg transition-colors">
                Let's Talk
              </a>
            </div>
            <button className="md:hidden text-brand-text" onClick={() => setCurrentPage('menu')}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <Hero />

      {/* Services Section */}
      <Services />

      {/* Portfolio Section */}
      <Portfolio />

      {/* About Section */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Building Digital Solutions in Berlin</h2>
          <p className="text-lg text-brand-muted mb-12">
            BridgeLabs is a Berlin-based digital studio crafting exceptional web experiences, SaaS platforms,
            and innovative solutions for businesses ready to scale.
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="p-6 bg-brand-secondary rounded-xl border border-brand-border">
              <div className="w-12 h-12 bg-brand-accent/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0 9-9 0 01-18 0" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2 2h6a2 2 0 012-2v-6a2 2 0 01-2-2h-4l-2-2H5a2 2 0 01-2 2v6a2 2 0 012 2h2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Modern Tech Stack</h3>
              <p className="text-brand-muted">React 19, TypeScript, Supabase, Vite - cutting-edge tools for blazing-fast applications.</p>
            </div>
            <div className="p-6 bg-brand-secondary rounded-xl border border-brand-border">
              <div className="w-12 h-12 bg-brand-accent/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7m0 0 9a2 2 0 01-2-2h6a2 2 0 012-2V5a2 2 0 01-2-2h-3l-3 3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Full-Cycle Development</h3>
              <p className="text-brand-muted">From concept to deployment, we handle everything. Design, development, testing, and scaling.</p>
            </div>
            <div className="p-6 bg-brand-secondary rounded-xl border border-brand-border">
              <div className="w-12 h-12 bg-brand-accent/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012-2v1a2 2 0 002 2v2a2 2 0 012 2v2a2 2 0 012-2h6a2 2 0 012-2v-4a2 2 0 00-2-2h-1.945" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 16.5A2.5 2.5 0 0018.5 14h-1.072" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Berlin-Based</h3>
              <p className="text-brand-muted">Local expertise with global perspective. We understand the German market and European tech landscape.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <Contact />

      {/* Footer */}
      <Footer />

      {/* Floating Social Links */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-3">
        <a
          href="https://linkedin.com/company/bridgelabs"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 bg-[#0077B5] hover:bg-[#006396] text-white rounded-lg flex items-center justify-center transition-colors shadow-lg"
          aria-label="LinkedIn"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-1.499-.138-.616-.274-1.107-.626-.972-1.68-.013-.056-.086-.176-.166-.312-.056-.098-.118-.2-.18-.351-.066-.131-.15-.264-.197-.395-.048-.128-.126-.276-.176-.426-.063-.2-.158-.424-.238-.662-.078-.25-.179-.543-.295-.861-.06-.233-.14-.504-.22-.783-.066-.278-.162-.583-.24-.904-.079-.336-.19-.71-.312-1.142-.117-.501-.289-1.057-.462-1.731-.165-.702-.398-1.462-.526-2.296-.13-.643-.311-1.324-.444-2.068-.086-.432-.19-.916-.265-1.44-.092-.546-.209-1.12-.331-1.738-.105-.653-.247-1.334-.372-2.078-.147-.871-.348-1.78-.498-2.763-.149-.905-.351-1.848-.537-2.907-.191-1.181-.449-2.419-.712-3.832-.243-1.496-.572-3.054-.851-4.746-.299-1.819-.706-3.732-1.096-5.825-.394-2.178-.93-4.521-1.497-7.152-.532-2.773-1.254-5.722-2.078-9.125 9.058-20.463-12.127-31.378 1.146-22.601 2.953-42.909 4.949-56.276 6.772-69.137 9.218-80.672 12.545-88.866 15.503-94.857 17.365-101.028 17.365-101.028s4.82-3.107 12.545-3.107 17.365-101.028c0-30.015-11.023-56.276-30.015-56.276 0-24.232-10.996-56.276-30.015-56.276 0-14.296-9.157-56.276-30.015-56.276-49.408-14.266-56.276-30.015-56.276-49.408-14.266-56.276-30.015-56.276-56.276-30.015-56.276 0-22.753-14.296-56.276-30.015-56.276-56.276-56.276-30.015-56.276 0-16.481-14.266-56.276-30.015-56.276-56.276-49.408-14.266-56.276-30.015-56.276z"/>
          </svg>
        </a>
        <a
          href="https://github.com/bridgelabs"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 bg-brand-tertiary hover:bg-brand-accent text-white rounded-lg flex items-center justify-center transition-colors shadow-lg"
          aria-label="GitHub"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8 9.8v2.051c-6.315 0-11.557-4.251-12.749-9.849 0-5.352 3.438-9.8 8-9.8 0-1.943.906-3.724-2.451-5.825-.088-.681-.176-1.382-.264-2.096-.193-1.662-.408-3.386-.614-5.218-.071-.71-.142-1.458-.212-2.235-.281-.916-.561-1.852-.83-2.856-.064-.474-.128-.976-.187-1.511-.189-1.592-.369-3.201-.546-4.954-.649-5.847-.033-.498-.065-1.008-.096-1.529-.137-2.192-.193-3.254-.257-4.505-.055-.46-.108-.944-.16-1.447-.215-2.321-.31-3.407-.394-4.854-.448-6.2-.636-7.763-.341-1.669-.672-3.403-1.003-5.24-1.354-7.984-.385-1.938-.773-3.994-1.162-6.207-1.567-9.037-.266-1.378-.593-2.826-.89-4.422-1.213-6.771-.172-1.096-.342-2.256-.511-3.461-.763-5.37-1.127-8.15-1.514-11.879-.737-4.523-1.481-9.182-2.227-13.977-2.993-18.976 0-6.426 1.481-13.879 4.454-18.976 8.449-24.321 14.422-31.226 21.132-40.411 1.943-14.266 6.772-56.276 17.365-101.028 56.276-56.276 56.276 24.266 49.408 56.276 56.276 30.015 56.276 56.276 30.015 56.276 0 8.449-14.266 24.266-30.015 31.226 40.411 56.276 49.408 56.276 56.276 30.015 56.276 30.015-31.226 24.266-49.408 14.266z"/>
          </svg>
        </a>
      </div>
    </div>
  )
}

export default App
