const projects = [
  {
    name: 'MenuFlows',
    description: 'Digital QR menu system for restaurants. Replace expensive paper menus with instant QR access. Update prices in seconds, no app required. Pricing: €29-49/month.',
    tags: ['SaaS', 'QR Menus', 'React 19', 'Supabase', 'B2B'],
    image: 'bg-gradient-to-br from-orange-500 to-red-600',
    status: '70% Complete',
    timeToLaunch: '4-6 weeks',
    targetMarket: '50K restaurants (DACH)',
    link: 'https://menuflows.de',
  },
  {
    name: '3rbst (عربست)',
    description: 'WhatsApp-based service explaining German documents in Arabic. Send a photo of any German official document, receive clear Arabic explanation. Pricing: €7-25 packages.',
    tags: ['AI-Powered', 'WhatsApp API', 'GDPR-Compliant', 'Social Impact'],
    image: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    status: '85% Complete',
    timeToLaunch: '2-8 weeks',
    targetMarket: '2M Arabic speakers (Germany)',
    link: 'https://3rbst.de',
  },
]

function ProjectCard({ project }: { project: typeof projects[0] }) {
  return (
    <div className="group bg-brand-primary rounded-xl border border-brand-border overflow-hidden hover:border-brand-accent transition-all">
      {/* Project Image/Placeholder */}
      <div className={`h-48 ${project.image} flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <span className="relative text-6xl font-bold text-white/90 group-hover:scale-110 transition-transform">
          {project.name.substring(0, 2)}
        </span>
      </div>

      {/* Project Info */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-2xl font-bold">{project.name}</h3>
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-muted hover:text-brand-accent transition-colors"
            aria-label={`Visit ${project.name}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2h-2m4 4v6a2 2 0 012-2h4a2 2 0 012-2v4a2 2 0 01-2-2h6a2 2 0 012-2v6a2 2 0 01-2-2h2a2 2 0 01-2-2V8a2 2 0 00-2-2h-2m4 4v6a2 2 0 012-2h4a2 2 0 012-2v4a2 2 0 01-2-2h-6z" />
            </svg>
          </a>
        </div>

        <p className="text-brand-muted mb-6">{project.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-brand-tertiary text-brand-text text-sm rounded-full border border-brand-border"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="space-y-3 pt-4 border-t border-brand-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-brand-muted">Status:</span>
            <span className="px-2 py-1 bg-brand-accent/10 text-brand-accent rounded-md text-xs font-semibold">
              {project.status}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-brand-muted">Time to Launch:</span>
            <span className="font-semibold">{project.timeToLaunch}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <span className="text-brand-muted whitespace-nowrap">Target Market:</span>
            <span className="font-semibold text-right">{project.targetMarket}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Portfolio() {
  return (
    <section id="portfolio" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Featured Projects</h2>
          <p className="text-lg text-brand-muted max-w-2xl mx-auto">
            Real products solving real problems. Built with modern tech and designed for scale.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <p className="text-brand-muted mb-6">Have a project in mind?</p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-accent hover:bg-brand-accentHover text-white text-lg font-semibold rounded-lg transition-all hover:scale-105"
          >
            Let's Build It Together
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4-4M4 16v4M12 21v-4M3 20a2 2 0 01-2-2h6a2 2 0 012 2v-2a2 2 0 00-2-2h-6a2 2 0 00-2 2v12a2 2 0 012 2h-6z" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}

export default Portfolio
