
import React, { useState, useEffect } from 'react';
import { Page } from './types';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { Studio } from './pages/Studio';
import { ProjectDetail } from './pages/ProjectDetail';
import { Contact } from './pages/Contact';
import { Onboarding } from './pages/Onboarding';
import { PROJECTS } from './data/projects';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const activeProject = PROJECTS.find(p => p.id === currentPage);

  // Dynamic Metadata Handler for SEO
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let title = 'BERLINLABS | Operational Product Studio';
    let description = 'A Berlin-based studio building durable digital foundations for independent businesses.';

    if (currentPage === 'products') {
      title = 'System Index | BERLINLABS';
      description = 'Directory of active digital products, experiments, and architectural frameworks.';
    } else if (currentPage === 'studio') {
      title = 'Studio Principles | BERLINLABS';
    } else if (currentPage === 'contact') {
      title = 'Contact | BERLINLABS';
    } else if (currentPage === 'onboarding') {
      title = 'Apply for Pilot | MenuFlows Berlin';
      description = 'Onboarding for independent restaurants seeking a simpler digital menu system.';
    } else if (activeProject) {
      if (activeProject.id === 'menuflows') {
        title = 'MenuFlows – Digital Menu System for Independent Restaurants in Berlin';
        description = activeProject.detail?.tagline || '';
      } else {
        title = `${activeProject.title} | BERLINLABS`;
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
    if (currentPage === 'products') return <Products onNavigate={setCurrentPage} />;
    if (currentPage === 'studio') return <Studio />;
    if (currentPage === 'contact') return <Contact />;
    if (currentPage === 'onboarding') return <Onboarding />;
    
    if (activeProject) {
      return (
        <ProjectDetail 
          project={activeProject} 
          onBack={() => setCurrentPage('products')} 
          onNavigate={setCurrentPage}
        />
      );
    }

    return <Home onNavigate={setCurrentPage} />;
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-primary selection:text-black">
      <Navigation onNavigate={setCurrentPage} currentPage={currentPage} />
      <div className="flex-grow">
        {renderContent()}
      </div>
      <Footer onNavigate={setCurrentPage} />
    </div>
  );
};

export default App;
