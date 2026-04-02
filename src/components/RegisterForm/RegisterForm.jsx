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

  // states para salvar informações dos usuários
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);

    // verifica se a confimação bate com a senha
    if (formData.senha !== formData.confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);

    try {
      // Fazendo o POST para a rota do seu Spring Boot
      const response = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // enviando os campos esperados pelo DTO do back
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          cargo: formData.cargo
        }),
      });

      // verifica se o post deu certo
      if (response.ok) {
        setSucesso(true);
        // timeout de 2 segundos para retornar a tela de login
        setTimeout(() => {
          onCancel(); 
        }, 2000);
      } else {
        // se retornar erro nas requisições exibe esse erro
        setErro('Este email já está cadastrado ou os dados são inválidos.');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setErro('Erro ao conectar com o servidor. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.formFade}>
      <div className={styles.header}>
        <h2 className={styles.title}>Seja Bem Vindo</h2>
        <p className={styles.subtitle}>Crie uma conta para fazer login no TaskFlow</p>
      </div>

      {/* Se o registro der certo, esconde o form e mostra essa mensagem. Se não, mostra o form. */}
      {sucesso ? (
        <div style={{ textAlign: 'center', padding: '30px 10px' }}>
          <h3 style={{ color: 'var(--primary-blue, #4CAF50)', marginBottom: '10px' }}>
            Conta criada com sucesso!
          </h3>
          <p style={{ color: 'var(--text-light)' }}>Redirecionando para o login...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          
          {/* Exibição de erro caso exista */}
          {erro && <p style={{ color: '#ff4d4f', textAlign: 'center', marginBottom: '15px', fontWeight: '500' }}>{erro}</p>}

          {/* Foi adicionada a propriedade `value={formData.campo}` em todos os inputs 
              para que o React saiba exatamente o que está escrito neles a todo momento. */}
          <Input 
            label="Nome" 
            placeholder="Seu nome completo" 
            value={formData.nome} 
            onChange={(e) => setFormData({...formData, nome: e.target.value})}
            required
          />
          <Input 
            label="Email" 
            type="email" 
            placeholder="voce@exemplo.com" 
            value={formData.email} 
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          
          <div className={styles.fieldGroup}>
            <label className={styles.labelCustom}>Cargos da Equipe</label>
            <select 
              className={styles.selectCustom}
              required
              value={formData.cargo} 
              onChange={(e) => setFormData({...formData, cargo: e.target.value})}
            >
              <option value="" disabled>Selecione seu cargo</option>
              <option value="admin">Admin</option>
              <option value="funcionario">Funcionário</option>
            </select>
          </div>

          <Input 
            label="Senha" 
            type="password" 
            placeholder="Sua senha" 
            value={formData.senha} 
            onChange={(e) => setFormData({...formData, senha: e.target.value})}
            required
          />
          <Input 
            label="Confirme a senha" 
            type="password" 
            placeholder="Confirme a senha" 
            value={formData.confirmarSenha} 
            onChange={(e) => setFormData({...formData, confirmarSenha: e.target.value})}
            required
          />

          <div className={styles.actions}>
            <span onClick={onCancel} className={styles.cancelLink} style={{ cursor: 'pointer' }}>
              Cancelar
            </span>
            {/* botão so responde quando o servidor responder */}
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar conta'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}