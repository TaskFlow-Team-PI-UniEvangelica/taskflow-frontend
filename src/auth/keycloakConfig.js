import { WebStorageStateStore } from 'oidc-client-ts';

// chave usada para sinalizar que o usuário acabou de sair (exibe aviso na landing page)
export const LOGOUT_FLAG_KEY = 'taskflow:justLoggedOut';

const onSigninCallback = () => {
  // Limpa o lixo da URL criado pelo OIDC (?code=...&state=...)
  window.history.replaceState({}, document.title, window.location.pathname);
  // Força o usuario a sempre cair no Dashboard apos fazer login
  window.location.href = '/dashboard';
};

// configurações base do cliente OIDC (compartilhadas entre login e cadastro)
export const oidcSettings = {
  authority: import.meta.env.VITE_KEYCLOAK_AUTHORITY,
  client_id: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_REDIRECT_URI,
  response_type: "code",
  post_logout_redirect_uri: import.meta.env.VITE_REDIRECT_URI,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
};

// chaves do keycloack usadas pelo AuthProvider
export const keycloakConfig = {
  ...oidcSettings,
  monitorSession: true,
  onSigninCallback: onSigninCallback
};
