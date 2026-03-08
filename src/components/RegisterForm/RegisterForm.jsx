import React, { useState } from 'react';
import styles from './RegisterForm.module.css'; 
import Input from '../UI/Input';
import Button from '../UI/Button';

export default function RegisterForm({ onCancel }) {
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    cargo: '' 
  });

  const handleSubmit = (e) => {
    e.preventDefault();
  
    console.log("Dados do novo membro do BitBuilders:", formData);
    
    onCancel(); 
  };

  return (
    <div className={styles.formFade}>
      <div className={styles.header}>
        <h2 className={styles.title}>Seja Bem Vindo</h2>
        <p className={styles.subtitle}>Crie uma conta para fazer login no TaskFlow</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Input 
          label="Nome" 
          placeholder="Seu nome completo" 
          onChange={(e) => setFormData({...formData, nome: e.target.value})}
        />
        <Input 
          label="Email" 
          type="email" 
          placeholder="voce@exemplo.com" 
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        

        <div className={styles.fieldGroup}>
          <label className={styles.labelCustom}>Função na Equipe</label>
          <select 
            className={styles.selectCustom}
            required
            value={formData.cargo}
            onChange={(e) => setFormData({...formData, cargo: e.target.value})}
          >
            <option value="" disabled>Selecione sua especialidade</option>
            <option value="Fullstack Developer">Fullstack Developer</option>
            <option value="Backend Engineer">Backend Engineer</option>
            <option value="UI/UX Designer">UI/UX Designer</option>
            <option value="Software Engineer">Software Engineer</option>
            <option value="Infraestrutura / N1">Infraestrutura / N1</option>
          </select>
        </div>

        <Input 
          label="Senha" 
          type="password" 
          placeholder="Sua senha" 
          onChange={(e) => setFormData({...formData, senha: e.target.value})}
        />
        <Input 
          label="Confirme a senha" 
          type="password" 
          placeholder="Confirme a senha" 
          onChange={(e) => setFormData({...formData, confirmarSenha: e.target.value})}
        />

        <div className={styles.actions}>
          <span onClick={onCancel} className={styles.cancelLink}>
            Cancelar
          </span>
          <Button type="submit" variant="primary">
            Criar conta
          </Button>
        </div>
      </form>
    </div>
  );
}