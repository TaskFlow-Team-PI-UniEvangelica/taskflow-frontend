import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

import DashboardLayout from './components/DashboardLayout/DashboardLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Kanban from './pages/Kanban/Kanban';
import Tasks from './pages/Tasks/Tasks';
import EditTasks from './pages/Tasks/EditTasks';
import Teams from './pages/Teams/Teams';
import Organizations from './pages/Organizations/Organizations';
import LandingPage from './pages/Landing/LandingPage';
import { OrganizationProvider } from './context/OrganizationContext';
import {
  REGISTER_FLOW_KEY,
  POST_REGISTER_LOGIN_KEY,
  REGISTERED_EMAIL_KEY,
  clearOidcStorage,
  hasActiveStoredToken,
} from './auth/keycloakConfig';
import { signupRedirect } from './auth/signup';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Layout protegido para todas as rotas internas do TaskFlow.
 * Caso o usuário NÃO esteja autenticado, força o redirecionamento com replace
 * para a URL raiz da Landing Page (/), alterando a barra de endereços do navegador
 * e impedindo que a Landing Page seja renderizada sob a URL /dashboard.
 */
function ProtectedLayout({ isActiveToken }) {
  if (!isActiveToken) {
    return <Navigate to="/" replace />;
  }

  return (
    <OrganizationProvider>
      <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />
      <DashboardLayout />
    </OrganizationProvider>
  );
}

function App() {
  const auth = useAuth();
  const searchParams = new URLSearchParams(window.location.search);
  const startSignupParam = searchParams.get('start_signup') === '1';
  const startLoginParam = searchParams.get('start_login') === '1';
  const hasOAuthCode = searchParams.has('code') && searchParams.has('state');

  const isActiveToken = Boolean(
    (auth.isAuthenticated && !auth.user?.expired) ||
    (!auth.error && hasActiveStoredToken())
  );

  const isPostRegisterRedirect =
    startSignupParam ||
    startLoginParam ||
    sessionStorage.getItem(POST_REGISTER_LOGIN_KEY) === '1' ||
    (hasOAuthCode && window.localStorage.getItem(REGISTER_FLOW_KEY) === '1');

  // 1. Fluxo pós-cadastro e atalhos vindos das telas do Keycloak (Se inscreva / Cancelar)
  useEffect(() => {
    if (auth.isLoading) return;

    if (startSignupParam) {
      window.history.replaceState({}, document.title, '/');
      signupRedirect();
      return;
    }

    if (startLoginParam) {
      window.history.replaceState({}, document.title, '/');
      window.localStorage.removeItem(REGISTER_FLOW_KEY);
      auth.signinRedirect({ redirectMethod: 'replace' }).catch(() => {
        window.location.replace('/');
      });
      return;
    }

    if (sessionStorage.getItem(POST_REGISTER_LOGIN_KEY) === '1') {
      sessionStorage.removeItem(POST_REGISTER_LOGIN_KEY);
      window.localStorage.removeItem(REGISTER_FLOW_KEY);
      const registeredEmail = sessionStorage.getItem(REGISTERED_EMAIL_KEY) || '';
      sessionStorage.removeItem(REGISTERED_EMAIL_KEY);
      clearOidcStorage();

      auth
        .signinRedirect({
          redirectMethod: 'replace',
          prompt: 'login',
          ...(registeredEmail ? { login_hint: registeredEmail } : {}),
        })
        .catch(() => {
          window.location.replace('/');
        });
    }
  }, [auth.isLoading, auth, startSignupParam, startLoginParam]);

  // 2. Auto-recuperação de falhas de renovação silenciosa ou sessão encerrada no Keycloak
  useEffect(() => {
    if (!auth?.events) return undefined;

    const handleSessionInvalidated = () => {
      clearOidcStorage();
      if (window.location.pathname !== '/' && !window.location.pathname.startsWith('/dashboard')) {
        window.history.replaceState({}, document.title, '/');
      }
    };

    const unsubSilentError = auth.events.addSilentRenewError(handleSessionInvalidated);
    const unsubSignedOut = auth.events.addUserSignedOut(handleSessionInvalidated);
    const unsubExpired = auth.events.addAccessTokenExpired(handleSessionInvalidated);

    return () => {
      if (typeof unsubSilentError === 'function') unsubSilentError();
      if (typeof unsubSignedOut === 'function') unsubSignedOut();
      if (typeof unsubExpired === 'function') unsubExpired();
    };
  }, [auth?.events]);

  const errorHandledRef = useRef(null);

  // 3. Limpeza imediata de parâmetros residuais de callback caso ocorra erro (protegido contra loop de re-render)
  useEffect(() => {
    if (!auth.error) {
      errorHandledRef.current = null;
      return;
    }
    // Executa no máximo uma única vez por instância de erro, prevenindo loops de dispatch e vazamento de RAM
    if (errorHandledRef.current === auth.error) return;
    errorHandledRef.current = auth.error;

    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname || '/');
    }
    if (!hasActiveStoredToken()) {
      clearOidcStorage();
    }
  }, [auth.error]);

  // Condicional de carregamento apenas durante o handshake inicial ou redirecionamento pós-cadastro
  if (auth.isLoading || isPostRegisterRedirect) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '20px' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '16px',
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem', fontWeight: 'bold', animation: 'pulse 1.5s infinite'
        }}>T</div>
        <div style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
          {isPostRegisterRedirect ? 'Redirecionando para o login...' : 'Iniciando TaskFlow...'}
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Rota pública: Landing Page (acessível na URL raiz / tanto para usuários logados quanto não logados) */}
        <Route path="/" element={<LandingPage />} />

        {/* Rotas protegidas (Dashboard, Kanban, Tasks, etc.): se não autenticado, força ir para / */}
        <Route element={<ProtectedLayout isActiveToken={isActiveToken} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/kanban" element={<Kanban />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/edit-tasks" element={<EditTasks />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/organizations" element={<Organizations />} />
        </Route>

        {/* Qualquer outra rota: redireciona para a Landing Page (/) com replace */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;