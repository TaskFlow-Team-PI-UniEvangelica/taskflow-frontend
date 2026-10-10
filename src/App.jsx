import React from 'react';
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
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const auth = useAuth();

  // salvar token no local storage por enquanto para manter as outras pages funcionando
  

  // condicional enquanto o keycloak carrega a validação
  if (auth.isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '20px' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '16px',
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem', fontWeight: 'bold', animation: 'pulse 1.5s infinite'
        }}>T</div>
        <div style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Iniciando TaskFlow...</div>
      </div>
    );
  }

  // condicional para erro de conexão com o keycloak
  if (auth.error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20vh', fontFamily: 'sans-serif' }}>
        <h2>Oops! Houve uma falha na autenticação.</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: '20px' }}>Detalhe do erro: {auth.error.message}</p>
        <button 
          onClick={() => {
            // Limpa os parametros sujos da URL (?state=...&error=...) e recarrega a pagina limpa
            window.history.replaceState({}, document.title, "/");
            window.location.reload();
          }} 
          style={{ padding: '12px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>
          Tentar Novamente
        </button>
      </div>
    );
  }

  // Se não estiver logado exibe a landing page
  if (!auth.isAuthenticated) {
    return (
      <>
        <style>{`
          @keyframes pulse {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 14px rgba(59, 130, 246, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
          }
        `}</style>
        <LandingPage />
      </>
    );
  }

  // se estiver logado renderiza o sistema
  return (
    <OrganizationProvider>
      <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/kanban" element={<Kanban />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/edit-tasks" element={<EditTasks />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/organizations" element={<Organizations />} />
          </Route>
          
          {/* rota padrão para redirecionamento */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </OrganizationProvider>
  );
}

export default App;