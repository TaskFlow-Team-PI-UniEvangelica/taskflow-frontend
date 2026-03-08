import React from 'react';
import styles from './LoginForm.module.css';
import Input from '../UI/Input';
import Button from '../UI/Button';

export default function ForgotPasswordForm({ onBack }) {
  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>Recuperar Senha</h2>
        <p className={styles.subtitle}>Insira seu e-mail para receber o link de recuperação.</p>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <Input 
          label="E-mail de Recuperação" 
          type="email" 
          placeholder="seu@email.com" 
        />
        
        <Button type="submit" variant="primary">
          Enviar Instruções
        </Button>

        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <span 
            onClick={onBack} 
            className={styles.forgotLink} 
            style={{ cursor: 'pointer', fontWeight: 'bold' }}
          >
            Voltar para o Login
          </span>
        </div>
      </form>
    </div>
  );
}