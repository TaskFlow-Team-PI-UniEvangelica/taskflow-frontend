import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './components/AuthLayout/AuthLayout';
import LoginForm from './components/LoginForm/LoginForm';
import RegisterForm from './components/RegisterForm/RegisterForm';
import DashboardLayout from './components/DashboardLayout/DashboardLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Tasks from './pages/Tasks/Tasks';
import EditTasks from './pages/Tasks/EditTasks';
import Teams from './pages/Teams/Teams';
import ProtectedRoute from './components/AuthLayout/ProtectedRoute'; 
import Kanban from './pages/Kanban/Kanban'; 
import AdminPage from './pages/Admin/AdminPage';   

function App() {
  const [isReversed, setIsReversed] = useState(false);
  const handleSwap = () => setIsReversed(!isReversed);

  return (
    <Router>
      <Routes>
        {/* ROTA DE AUTENTICAÇÃO */}
        <Route path="/" element={
          <AuthLayout isReversed={isReversed} onSwap={handleSwap}>
            {isReversed ? (
              <RegisterForm onCancel={handleSwap} />
            ) : (
              <LoginForm onSwapToRegister={handleSwap} />
            )}
          </AuthLayout>
        } />

        {/* DASHBOARD */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout><Dashboard /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* KANBAN */}
        <Route path="/kanban" element={
          <ProtectedRoute>
            <DashboardLayout><Kanban /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* TAREFAS */}
        <Route path="/tasks" element={
          <ProtectedRoute>
            <DashboardLayout><Tasks /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* EDIÇÃO DE TAREFAS */}
        <Route path="/edit-tasks" element={
          <ProtectedRoute>
            <DashboardLayout><EditTasks /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* --- NOVA ROTA DE ADMIN (INTEGRAÇÃO BACKEND) --- */}
        <Route path="/admin" element={    
          <ProtectedRoute isAdminOnly={true}>
            <DashboardLayout><AdminPage /></DashboardLayout>
          </ProtectedRoute>


        } />

        {/* REDIRECIONAMENTO PADRÃO */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;