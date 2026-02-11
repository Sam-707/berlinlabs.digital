const services = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1h.25c-.966 0-1.75.787-1.75 1.75v4.292c0 .966.787 1.75 1.75 1.75h1.5l2.25-2.25 2.25 2.25v2.5A2.75 2.75 0 01-5.5 0V8.75c0-1.52.635-2.75-1.417-2.75H6.25c-.966 0-1.75.787-1.75 1.75V4.25c0-1.52.635-2.75 1.417-2.75H3.167c-.966 0-1.75.787-1.75 1.75zm1.5 5.75c.966 0 1.75.787 1.75 1.75v4.292c0 .966-.787 1.75-1.75 1.75h4.083c.966 0 1.75-.787 1.75-1.75v4.292c0 .966-.787 1.75-1.75 1.75zm-11.75 6a1.75 1.75 0 01-3.5 0v4.292c0 .966-.787 1.75-1.75 1.75H17.5c.966 0 1.75-.787 1.75-1.75V12.5c0-.966-.787-1.75-1.75-1.75H11.25c-.966 0-1.75.787-1.75 1.75V17.25z" />
      </svg>
    ),
    title: 'Web Development',
    description: 'Modern, fast websites built with React 19, TypeScript, and Vite for optimal performance.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 00-.707.293l-2.414-2.414a1 1 0 00-.293-.707V6.414L16 17.414V7a2 2 0 00-2-2H6a2 2 0 00-2 2v16a2 2 0 002 2z" />
      </svg>
    ),
    title: 'SaaS Platforms',
    description: 'Full-cycle subscription products with Supabase, Stripe payments, and multi-tenant architecture.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8m-6.5-6.5a.5.5 0 111 0v-3m-11 0v3a.5.5 0 111 0v-3m12 3v10a2 2 0 01-2 2h-4a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2-2h-4z" />
      </svg>
    ),
    title: 'Real-time Features',
    description: 'Live updates with Supabase Realtime, instant order notifications, and collaborative tools.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 20v.01M15 10a3 3 0 11-6 0 1.742 1.557L8.414 12.05a1 1 0 00-.707-.293l-2.829-2.828a1 1 0 00-.707-.294l-.585-.586a1 1 0 00-.707-.293L6.414 9.05A1 1 0 006 8l2.828 2.828a1 1 0 00.707.294l.586.586a1 1 0 00.707.293L12 14.05a1 1 0 001-.707l2.829-2.828a1 1 0 00.706-.294l.585-.586A1 1 0 0018 10l-2.828-2.828a1 1 0 00-.707-.293l-.586-.586a1 1 0 00-.707-.293L6.414 9.05A1 1 0 006 8l2.828 2.828a1 1 0 00.706.294l.586.586a1 1 0 00.707.293L12 14.05a1 1 0 001-.707l2.829 2.828a1 1 0 00.706.294zM12 12l.01 0M3 20a2 2 0 114 0 2 2 0 012-2h6a2 2 0 012-2v2a2 2 0 01-2 2h-6z" />
      </svg>
    ),
    title: 'Mobile-First Design',
    description: 'Responsive interfaces optimized for mobile devices, tablets, and desktop experiences.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4 4m14-8H7a4 4 0 00-4 4v6M13 8a4 4 0 00-4 4v6a2 2 0 012-2h6a2 2 0 012-2V8a2 2 0 012-2h6a2 2 0 012-2v6a2 2 0 01-2 2h-6z" />
      </svg>
    ),
    title: 'AI Integration',
    description: 'Intelligent features with Gemini AI, automated workflows, and smart data analysis.',
  },
]

function Services() {
  return (
    <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 bg-brand-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">What We Build</h2>
          <p className="text-lg text-brand-muted max-w-2xl mx-auto">
            End-to-end digital solutions tailored to your business needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group p-8 bg-brand-primary rounded-xl border border-brand-border hover:border-brand-accent transition-all hover:scale-105"
            >
              <div className="w-14 h-14 bg-brand-accent/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-brand-accent/30 transition-colors">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{service.title}</h3>
              <p className="text-brand-muted">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services
