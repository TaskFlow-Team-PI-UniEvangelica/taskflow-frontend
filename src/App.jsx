import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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


function App() {
  const [isReversed, setIsReversed] = useState(false);
  const handleSwap = () => setIsReversed(!isReversed);

  return (
    <Router>
      <Routes>
   
        <Route path="/" element={
          <AuthLayout isReversed={isReversed} onSwap={handleSwap}>
            {isReversed ? (
              <RegisterForm onCancel={handleSwap} />
            ) : (
              <LoginForm onSwapToRegister={handleSwap} />
            )}
          </AuthLayout>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout><Dashboard /></DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/kanban" element={
          <ProtectedRoute>
            <DashboardLayout><Kanban /></DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/tasks" element={
          <ProtectedRoute>
            <DashboardLayout><Tasks /></DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/edit-tasks" element={
          <ProtectedRoute>
            <DashboardLayout><EditTasks /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* <Route path="/teams" element={
          <ProtectedRoute>
            <DashboardLayout><Teams /></DashboardLayout>
          </ProtectedRoute>
        } /> */}
      </Routes>
    </Router>
  );
}

export default App;