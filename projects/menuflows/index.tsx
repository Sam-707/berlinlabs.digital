
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './ErrorBoundary';

// Debug logging for deployment
console.log('🚀 MenuFlows Starting...');
console.log('Environment:', {
  url: window.location.href,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing',
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
  mode: import.meta.env.MODE,
  dev: import.meta.env.DEV
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Could not find root element');
  throw new Error("Could not find root element to mount to");
}

console.log('✅ Root element found, mounting React app...');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

console.log('✅ React app mounted successfully');
