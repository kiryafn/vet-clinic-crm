import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppRouter } from './app';
import { ErrorBoundary } from './app/providers/ErrorBoundary';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  </StrictMode>,
);