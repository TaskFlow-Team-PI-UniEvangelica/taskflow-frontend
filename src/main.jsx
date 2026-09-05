import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from 'react-oidc-context';
import { WebStorageStateStore } from 'oidc-client-ts';

const onSigninCallback = () => {
  // Limpa o lixo da URL criado pelo OIDC (?code=...&state=...)
  window.history.replaceState({}, document.title, window.location.pathname);
  // Força o usuario a sempre cair no Dashboard apos fazer login
  window.location.href = '/dashboard';
};

// chaves do keycloack
const keycloakConfig = {
  authority: import.meta.env.VITE_KEYCLOAK_AUTHORITY,
  client_id: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_REDIRECT_URI,
  response_type: "code",
  post_logout_redirect_uri: import.meta.env.VITE_REDIRECT_URI,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  monitorSession: true,
  onSigninCallback: onSigninCallback
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider {...keycloakConfig}>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
