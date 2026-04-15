import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginForm.module.css';
import Input from '../UI/Input';
import PasswordInput from '../UI/PasswordInput';
import Button from '../UI/Button';
import ForgotPasswordForm from './ForgotPasswordForm';

export default function LoginForm({ onSwapToRegister }) {
  // hook useNavigate
  const navigate = useNavigate();

  const [isRecovering, setIsRecovering] = useState(false);

  // criando os states para salvar as informações necessárias
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // envia e salva o token 
  const handleLogin = async (e) => {
    e.preventDefault();
    setErro(null);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      if (response.ok) {
        const data = await response.json();

        // salva o token recebido do back
        localStorage.setItem('token', data.token);
        console.log('Login feito com sucesso! Token guardado.');

        // chama a função para redirecionar o usuário
        navigate('/dashboard');

      } else {
        setErro('Email ou senha incorretos.');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setErro('Erro ao conectar com o servidor. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.formFade}>
      {isRecovering ? (
        <ForgotPasswordForm onBack={() => setIsRecovering(false)} />
      ) : (
        <>
          <div className={styles.header}>
            <h2 className={styles.title}>Bem Vindo de volta</h2>
            <p className={styles.subtitle}>Por favor insira seus dados.</p>
          </div>

          <form onSubmit={handleLogin}>

            {/* caso tenha erro exibe na tela */}
            {erro && <p style={{ color: '#ff4d4f', textAlign: 'center', marginBottom: '10px' }}>{erro}</p>}

            {/* conecta os inputs com os states */}
            <Input
              label="Email"
              type="email"
              placeholder="Insira seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* O NOVO CAMPO DE SENHA */}
            <PasswordInput
              label="Senha"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />

            <div className={styles.forgotPassword}>
              <span
                onClick={() => setIsRecovering(true)}
                className={styles.forgotLink}
                style={{ cursor: 'pointer' }}
              >
                Esqueceu a senha?
              </span>
            </div>

            {/* desabilita o botão e muda o texto enquanto a requisição está sendo feita */}
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Login'}
            </Button>
          </form>

          <div className={styles.socialLogin}>
            <div className={styles.divider}></div>

            <p style={{ color: 'var(--text-light)', marginTop: '20px', fontSize: '0.9rem' }}>
              Não tem uma conta?
              <span
                onClick={onSwapToRegister}
                style={{ color: 'var(--primary-blue)', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px' }}
              >
                Se inscreva
              </span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}