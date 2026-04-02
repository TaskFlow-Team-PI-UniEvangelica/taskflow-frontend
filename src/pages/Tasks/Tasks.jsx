import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Tasks.module.css';
import { FaCheckCircle, FaCalendarAlt } from 'react-icons/fa'; 

export default function Tasks() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [erro, setErro] = useState(null); 
  const [isLoading, setIsLoading] = useState(false); 
  
  // 1. AJUSTE NO ESTADO: Os nomes agora batem 100% com o TaskRequestDTO
  const [taskData, setTaskData] = useState({
    titulo: '',
    descricao: '',
    idCriador: '', // Mudou de 'responsavel' para 'idCriador'
    prioridade: '',
    status: 'pendente',
    prazo: '' 
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    setErro(null);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:8080/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        // O body vai perfeitamente alinhado com o TaskRequestDTO
        body: JSON.stringify(taskData) 
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigate('/dashboard'); 
        }, 2500);

      } else if (response.status === 403) {
        setErro('Permissão negada. Apenas administradores podem criar tarefas.');
      } else {
        setErro('Erro ao registrar a tarefa. Verifique se os dados estão corretos.');
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
      setErro('Falha na comunicação com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {showSuccess && (
        <div className={styles.toastContainer}>
          <div className={styles.successToast}>
            <FaCheckCircle className={styles.successIcon} />
            <div className={styles.toastText}>
              <strong>Tarefa lançada!</strong>
              <span>Sua demanda foi registrada com sucesso.</span>
            </div>
          </div>
        </div>
      )}

      {erro && (
        <div style={{ backgroundColor: '#ff4d4f', color: 'white', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center' }}>
          {erro}
        </div>
      )}

      <div className={styles.mainCard}>
        <header className={styles.header}>
          <h1 className={styles.title}>Nova Tarefa</h1>
          <p className={styles.subtitle}>Configure os parâmetros técnicos da atividade.</p>
        </header>
        
        <form className={styles.form} onSubmit={handleCreate}>
          <div className={styles.layoutGrid}>
            <div className={styles.primarySection}>
              <div className={styles.field}>
                <label>Título do Item</label>
                <input 
                  type="text" 
                  placeholder="Defina o objetivo principal..." 
                  required 
                  value={taskData.titulo} 
                  onChange={(e) => setTaskData({...taskData, titulo: e.target.value})}
                />
              </div>

              <div className={styles.field}>
                <label>Documentação / Descrição</label>
                <textarea 
                  placeholder="Detalhes técnicos e requisitos..." 
                  rows="10"
                  value={taskData.descricao}
                  onChange={(e) => setTaskData({...taskData, descricao: e.target.value})}
                ></textarea>
              </div>
            </div>

            <div className={styles.sidebarSection}>
              <div className={styles.field}>
                <label>Criador / Responsável</label>
                {/* 2. AJUSTE DE VALORES: Os 'values' agora devem ser os IDs reais dos usuários no banco de dados */}
                <select value={taskData.idCriador} required onChange={(e) => setTaskData({...taskData, idCriador: e.target.value})}>
                  <option value="" disabled>Atribuir a...</option>
                  {/* Troque estes números (1, 2, 3) pelos IDs reais dos usuários no seu banco PostgreSQL */}
                  <option value="1">Guilherme Miguel</option>
                  <option value="2">Wanderlay Silva Neto</option>
                  <option value="3">Kayran</option>
                </select>
              </div>

              <div className={styles.field}>
                <label>Status Atual</label>
                <select value={taskData.status} required onChange={(e) => setTaskData({...taskData, status: e.target.value})}>
                  <option value="pendente">Pendente</option>
                  {/* 3. AJUSTE DE ENUM: O value agora tem o underline, igual ao Java */}
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluida">Concluída</option>
                </select>
              </div>

              <div className={styles.field}>
                <label>Prioridade</label>
                <select value={taskData.prioridade} required onChange={(e) => setTaskData({...taskData, prioridade: e.target.value})}>
                  <option value="" disabled>Nível de urgência</option>
                  <option value="alta">Prioridade P0 (Alta)</option>
                  <option value="media">Prioridade P1 (Média)</option>
                  <option value="baixa">Prioridade P2 (Baixa)</option>
                </select>
              </div>

              <div className={styles.field}>
                <label><FaCalendarAlt /> Prazo de Entrega (TPA)</label>
                <input 
                  type="date" 
                  required 
                  value={taskData.prazo}
                  onChange={(e) => setTaskData({...taskData, prazo: e.target.value})} 
                />
              </div>
            </div>
          </div>

          <footer className={styles.footer}>
            <button type="button" className={styles.secondaryBtn} onClick={() => navigate('/dashboard')} disabled={isLoading}>
              Descartar
            </button>
            <button type="submit" className={styles.primaryBtn} disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Tarefa'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}