import React, { useState } from 'react';
import styles from './LoginForm.module.css';
import Input from '../UI/Input';
import Button from '../UI/Button';
import ForgotPasswordForm from './ForgotPasswordForm';


export default function LoginForm({ onSwapToRegister }) {
  const [isRecovering, setIsRecovering] = useState(false);

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

          <form onSubmit={(e) => e.preventDefault()}>
            <Input 
              label="Email" 
              type="email" 
              placeholder="Insira seu email" 
            />
            
            <Input 
              label="Senha" 
              type="password" 
              placeholder="••••••••" 
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

            <Button type="submit" variant="primary">
              Login
            </Button>
          </form>

          <div className={styles.socialLogin}>
              <div className={styles.divider}>
                
              </div>
              
              <p style={{color: 'var(--text-light)', marginTop: '20px', fontSize: '0.9rem'}}>
                Não tem uma conta? 
                {/* Aqui chamamos o movimento do botão central */}
                <span 
                  onClick={onSwapToRegister} 
                  style={{color: 'var(--primary-blue)', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px'}}
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