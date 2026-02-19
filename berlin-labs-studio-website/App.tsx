
import React, { useState, useEffect } from 'react';
import { Page } from './types';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Systems } from './pages/Systems';
import { Studio } from './pages/Studio';
import { ProjectDetail } from './pages/ProjectDetail';
import { Contact } from './pages/Contact';
import { Onboarding } from './pages/Onboarding';
import { SYSTEMS } from './data/systems';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const activeProject = SYSTEMS.find(p => p.id === currentPage);

  // Dynamic Metadata Handler for SEO
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let title = 'BERLINLABS | Operational Product Studio';
    let description = 'A Berlin-based studio building durable digital foundations for independent businesses.';

    if (currentPage === 'systems') {
      title = 'Systems | BERLINLABS';
      description = 'Operational systems at different stages of maturity.';
    } else if (currentPage === 'studio') {
      title = 'Method | BERLINLABS';
    } else if (currentPage === 'contact') {
      title = 'Contact | BERLINLABS';
    } else if (currentPage === 'onboarding') {
      title = 'Apply for Pilot | MenuFlows Berlin';
      description = 'Onboarding for independent restaurants seeking a simpler digital menu system.';
    } else if (activeProject) {
      if (activeProject.id === 'menuflows') {
        title = 'MenuFlows – Digital Menu System for Independent Restaurants in Berlin';
        description = activeProject.oneLiner || '';
      } else {
        title = `${activeProject.name} | BERLINLABS`;
        description = activeProject.oneLiner || description;
      }
    }

    document.title = title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
  }, [currentPage, activeProject]);

  const renderContent = () => {
    if (currentPage === 'home') return <Home onNavigate={setCurrentPage} />;
    if (currentPage === 'systems') return <Systems onNavigate={setCurrentPage} />;
    if (currentPage === 'studio') return <Studio />;
    if (currentPage === 'contact') return <Contact onNavigate={setCurrentPage} />;
    if (currentPage === 'onboarding') return <Onboarding />;

    if (activeProject) {
      return (
        <ProjectDetail
          project={activeProject}
          onBack={() => setCurrentPage('systems')}
          onNavigate={setCurrentPage}
        />
      );
    }

    return <Home onNavigate={setCurrentPage} />;
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-primary selection:text-black" role="application">
      <Navigation onNavigate={setCurrentPage} currentPage={currentPage} role="navigation" />
      <main id="main-content" role="main" className="flex-grow">
        {renderContent()}
      </main>
      <Footer onNavigate={setCurrentPage} role="contentinfo" />
    </div>
  );
};

export default App;
