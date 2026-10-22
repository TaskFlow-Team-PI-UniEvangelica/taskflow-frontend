import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from 'react-oidc-context';
// chaves do keycloack (centralizadas para serem reaproveitadas no fluxo de cadastro)
import { keycloakConfig, hasActiveStoredToken } from './auth/keycloakConfig';

// Se o usuário já possui um token ativo e válido salvo, mas a URL contém ?code= e ?state=
// (por exemplo, após o usuário apertar o botão "Voltar" no navegador e cair no histórico antigo),
// limpa os parâmetros de callback imediatamente antes do AuthProvider tentar reprocessar um código já consumido.
if (hasActiveStoredToken() && window.location.search && window.location.search.includes('code=')) {
  window.history.replaceState({}, document.title, window.location.pathname || '/');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider {...keycloakConfig}>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
