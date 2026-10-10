import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from 'react-oidc-context';
// chaves do keycloack (centralizadas para serem reaproveitadas no fluxo de cadastro)
import { keycloakConfig } from './auth/keycloakConfig';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider {...keycloakConfig}>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
