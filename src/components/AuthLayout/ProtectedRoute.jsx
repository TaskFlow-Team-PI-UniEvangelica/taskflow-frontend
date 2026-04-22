import { Navigate } from 'react-router-dom';


export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  // se não houver token manda o usuário de volta para a tela de login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // se houver token renderiza o dashboard
  return children;
}