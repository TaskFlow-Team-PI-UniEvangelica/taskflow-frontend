import { UserManager } from 'oidc-client-ts';
import { oidcSettings, hasActiveStoredToken, REGISTER_FLOW_KEY } from './keycloakConfig';

let registrationManager = null;

/**
 * Redireciona o usuário direto para a tela de cadastro do Keycloak.
 *
 * O Keycloak 24 ainda não suporta `prompt=create`, então usamos o endpoint
 * `/protocol/openid-connect/registrations`, que aceita os mesmos parâmetros
 * do endpoint de autorização (inclusive PKCE). O state é salvo no mesmo
 * storage padrão do AuthProvider, então o callback é processado normalmente
 * pelo react-oidc-context ao voltar para a aplicação.
 */
export const signupRedirect = () => {
  // Caso o usuário já esteja com token ativo, garante que sempre vá para o dashboard
  if (hasActiveStoredToken()) {
    window.location.replace('/dashboard');
    return Promise.resolve();
  }

  // Persiste no localStorage (mesma origem :5173) que o fluxo iniciado é de criação de conta
  window.localStorage.setItem(REGISTER_FLOW_KEY, '1');

  if (!registrationManager) {
    registrationManager = new UserManager({
      ...oidcSettings,
      metadataSeed: {
        authorization_endpoint: `${oidcSettings.authority}/protocol/openid-connect/registrations`,
      },
    });
  }
  return registrationManager.signinRedirect({
    redirectMethod: 'replace',
    url_state: 'register',
    state: { flow: 'register' },
  });
};
