import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthLayout from './components/AuthLayout/AuthLayout';
import LoginForm from './components/LoginForm/LoginForm';
import RegisterForm from './components/RegisterForm/RegisterForm';
import DashboardLayout from './components/DashboardLayout/DashboardLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Tasks from './pages/Tasks/Tasks'; 
import Teams from './pages/Teams/Teams';

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
          <DashboardLayout><Dashboard /></DashboardLayout>
        } />

       
        <Route path="/tasks" element={
          <DashboardLayout><Tasks /></DashboardLayout>
        } />

        
        <Route path="/teams" element={
          <DashboardLayout><Teams /></DashboardLayout>
        } />
      </Routes>
    </Router>
  );
}

export default App;