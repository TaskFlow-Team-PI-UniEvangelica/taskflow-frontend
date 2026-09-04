import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

import DashboardLayout from './components/DashboardLayout/DashboardLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Kanban from './pages/Kanban/Kanban';
import Tasks from './pages/Tasks/Tasks';
import EditTasks from './pages/Tasks/EditTasks';
import Teams from './pages/Teams/Teams';

function App() {
  const auth = useAuth();

  // salvar token no local storage por enquanto para manter as outras pages funcionando
  useEffect(() => {
    if (auth.isAuthenticated && auth.user?.access_token) {
      localStorage.setItem('token', auth.user.access_token);
    } else {
      localStorage.removeItem('token');
    }
  }, [auth.isAuthenticated, auth.user]);

  // condicional enquanto o keycloak carrega a validação
  if (auth.isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20vh' }}>Carregando...</div>;
  }

  // condicional para erro de conexão com o keycloak
  if (auth.error) {
    return <div>Ocorreu um erro ao conectar ao servidor de Autenticação: {auth.error.message}</div>;
  }

  // Se não estiver logado exibe a landing page com o botão do Keycloak
  if (!auth.isAuthenticated) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20vh', fontFamily: 'sans-serif' }}>
        <h1>Bem-vindo ao TaskFlow</h1>
        <p>Você foi desconectado. Faça o login para acessar suas Organizações.</p>
        <button 
          onClick={() => auth.signinRedirect()} 
          style={{ padding: '12px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold', marginTop: '20px' }}>
          Entrar via Keycloak
        </button>
      </div>
    );
  }

  // se estiver logado renderiza o sistema
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/kanban" element={<Kanban />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/edit-tasks" element={<EditTasks />} />
          <Route path="/teams" element={<Teams />} />
        </Route>
        
        {/* rota padrão para redirecionamento */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;