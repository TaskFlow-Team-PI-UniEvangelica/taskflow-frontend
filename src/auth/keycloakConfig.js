import { WebStorageStateStore } from 'oidc-client-ts';

// chave usada para sinalizar que o usuário acabou de sair (exibe aviso na landing page)
export const LOGOUT_FLAG_KEY = 'taskflow:justLoggedOut';

// chaves usadas para controlar o fluxo pós-cadastro (impedir auto-login e redirecionar ao login)
export const REGISTER_FLOW_KEY = 'taskflow:registerFlow';
export const POST_REGISTER_LOGIN_KEY = 'taskflow:postRegisterLogin';
export const REGISTERED_EMAIL_KEY = 'taskflow:registeredEmail';
export const JUST_SIGNED_IN_KEY = 'taskflow:justSignedIn';

// configurações base do cliente OIDC (compartilhadas entre login e cadastro)
export const oidcSettings = {
  authority: import.meta.env.VITE_KEYCLOAK_AUTHORITY,
  client_id: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_REDIRECT_URI,
  response_type: "code",
  post_logout_redirect_uri: import.meta.env.VITE_REDIRECT_URI,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
};

/**
 * Remove todos os artefatos de sessão/estado OIDC do localStorage e sessionStorage
 * para evitar loops de token inválido (HTTP 400) ou dessincronização com o Keycloak.
 */
export const clearOidcStorage = () => {
  try {
    Object.keys(window.localStorage).forEach((key) => {
      if (key.startsWith('oidc.')) {
        window.localStorage.removeItem(key);
      }
    });
    Object.keys(window.sessionStorage).forEach((key) => {
      if (key.startsWith('oidc.')) {
        window.sessionStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.error('Erro ao limpar storage OIDC:', e);
  }
};

/**
 * Verifica se já existe um token ativo e não expirado salvo no storage local.
 */
export const hasActiveStoredToken = () => {
  try {
    const storageKey = `oidc.user:${oidcSettings.authority}:${oidcSettings.client_id}`;
    const rawUser = window.localStorage.getItem(storageKey);
    if (!rawUser) return false;
    const parsed = JSON.parse(rawUser);
    if (!parsed || !parsed.access_token) return false;
    if (parsed.expires_at && parsed.expires_at * 1000 <= Date.now()) {
      return false;
    }
    return true;
  } catch (_e) {
    return false;
  }
};

const onSigninCallback = async (user) => {
  // Limpa o lixo da URL criado pelo OIDC (?code=...&state=...)
  window.history.replaceState({}, document.title, window.location.pathname);

  const isRegistrationCallback =
    window.localStorage.getItem(REGISTER_FLOW_KEY) === '1' ||
    user?.url_state === 'register' ||
    user?.state?.flow === 'register';

  // Se o callback veio da criação de conta (register.ftl), o login NÃO pode ser automático:
  // removemos o token salvo, encerramos a sessão recém-aberta no Keycloak e redirecionamos para o login.
  if (isRegistrationCallback) {
    window.localStorage.removeItem(REGISTER_FLOW_KEY);
    sessionStorage.setItem(POST_REGISTER_LOGIN_KEY, '1');
    const email = user?.profile?.email || user?.profile?.preferred_username || '';
    if (email) {
      sessionStorage.setItem(REGISTERED_EMAIL_KEY, email);
    }
    clearOidcStorage();

    const idToken = user?.id_token;
    if (idToken) {
      const logoutUrl =
        `${oidcSettings.authority}/protocol/openid-connect/logout` +
        `?id_token_hint=${encodeURIComponent(idToken)}` +
        `&post_logout_redirect_uri=${encodeURIComponent(oidcSettings.redirect_uri)}`;
      window.location.replace(logoutUrl);
    } else {
      window.location.replace('/');
    }
    return;
  }

  // Login normal: sinaliza entrada recente e substitui o histórico pelo Dashboard imediatamente
  window.localStorage.removeItem(REGISTER_FLOW_KEY);
  sessionStorage.setItem(JUST_SIGNED_IN_KEY, '1');
  window.location.replace('/dashboard');
};

// chaves do keycloack usadas pelo AuthProvider
export const keycloakConfig = {
  ...oidcSettings,
  monitorSession: false,
  onSigninCallback: onSigninCallback,
};
