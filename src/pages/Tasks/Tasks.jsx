import React, { useState, useEffect } from 'react';
import styles from './Tasks.module.css';
import { FaCheckCircle, FaCalendarAlt, FaUsers } from 'react-icons/fa'; 

export default function Tasks() {
  const [teamMembers, setTeamMembers] = useState([]); 
  const [showSuccess, setShowSuccess] = useState(false);
  const [erro, setErro] = useState(null); 
  const [isLoading, setIsLoading] = useState(false); 
  
  const [taskData, setTaskData] = useState({
    titulo: '', descricao: '', prioridade: '', prazo: '', idsResponsaveis: [] 
  });

  useEffect(() => {
    fetchUsers(); 
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setTeamMembers(await response.json());
    } catch (error) {
      console.error("Erro ao buscar usuários da equipe", error);
    }
  };

  const handleCheckboxChange = (userId) => {
    const isSelected = taskData.idsResponsaveis.includes(userId);
    setTaskData(prev => ({
      ...prev,
      idsResponsaveis: isSelected 
        ? prev.idsResponsaveis.filter(id => id !== userId) 
        : [...prev.idsResponsaveis, userId] 
    }));
  };

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
        body: JSON.stringify(taskData) 
      });

      if (response.ok) {
        setShowSuccess(true);
        setTaskData({ titulo: '', descricao: '', prioridade: '', prazo: '', idsResponsaveis: [] });
        setTimeout(() => setShowSuccess(false), 2500);
      } else {
        setErro('Erro ao registrar a tarefa no sistema.');
      }
    } catch (error) {
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
              <strong>Sucesso!</strong>
              <span>Tarefa criada com sucesso.</span>
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
                <label>TÍTULO DO ITEM</label>
                <input 
                  type="text" placeholder="Defina o objetivo principal..." required 
                  value={taskData.titulo} 
                  onChange={(e) => setTaskData({...taskData, titulo: e.target.value})}
                />
              </div>

              <div className={styles.field}>
                <label>DOCUMENTAÇÃO / DESCRIÇÃO</label>
                <textarea 
                  placeholder="Detalhes técnicos e requisitos..." rows="4"
                  value={taskData.descricao}
                  onChange={(e) => setTaskData({...taskData, descricao: e.target.value})}
                ></textarea>
              </div>

              <div className={styles.field}>
                <label><FaUsers /> ATRIBUIR RESPONSÁVEIS</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '5px', padding: '10px', background: 'var(--bg-app)', borderRadius: '8px', border: '1px solid #ccc' }}>
                  {teamMembers.length === 0 ? (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nenhum membro encontrado.</span>
                  ) : (
                    teamMembers.map(user => (
                      <label key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', background: 'var(--bg-card)', padding: '5px 10px', borderRadius: '15px', border: '1px solid var(--primary-blue)', fontSize: '0.9rem' }}>
                        <input 
                          type="checkbox" 
                          checked={taskData.idsResponsaveis.includes(user.id)}
                          onChange={() => handleCheckboxChange(user.id)}
                        />
                        {user.nome.split(' ')[0]} 
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className={styles.sidebarSection}>
              <div className={styles.field}>
                <label>PRIORIDADE</label>
                <select value={taskData.prioridade} required onChange={(e) => setTaskData({...taskData, prioridade: e.target.value})}>
                  <option value="" disabled>Nível de urgência</option>
                  <option value="alta">ALTA</option>
                  <option value="media">MÉDIA</option>
                  <option value="baixa">BAIXA</option>
                </select>
              </div>

              <div className={styles.field}>
                <label><FaCalendarAlt /> PRAZO DE ENTREGA</label>
                <input 
                  type="date" required 
                  value={taskData.prazo}
                  onChange={(e) => setTaskData({...taskData, prazo: e.target.value})} 
                />
              </div>
            </div>
          </div>

          <footer className={styles.footer} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className={styles.primaryBtn} disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Tarefa'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}