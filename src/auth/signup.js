import { UserManager } from 'oidc-client-ts';
import { oidcSettings } from './keycloakConfig';

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
  if (!registrationManager) {
    registrationManager = new UserManager({
      ...oidcSettings,
      metadataSeed: {
        authorization_endpoint: `${oidcSettings.authority}/protocol/openid-connect/registrations`,
      },
    });
  }
  return registrationManager.signinRedirect();
};
