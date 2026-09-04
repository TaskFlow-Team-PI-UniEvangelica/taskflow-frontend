import React, { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useLocation } from 'react-router-dom';
import styles from './Tasks.module.css'; 
import { FaCheckCircle, FaCalendarAlt, FaUsers } from 'react-icons/fa'; 

export default function EditTasks() {
  const auth = useAuth();
  const location = useLocation();
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [erro, setErro] = useState(null); 
  const [isLoading, setIsLoading] = useState(false); 

  const [selectedTaskId, setSelectedTaskId] = useState('');

  // Adicionado 'status' no state inicial
  const [taskData, setTaskData] = useState({
    titulo: '', descricao: '', prioridade: '', prazo: '', status: '', idsResponsaveis: []
  });

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (location.state?.taskId && tasks.length > 0) {
      handleTaskSelection(location.state.taskId.toString());
    }
  }, [tasks, location.state]);

  const fetchTasks = async () => {
    try {
      const token = auth?.user?.access_token;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/task`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setTasks(await response.json());
    } catch (_error) {
      console.error("Erro", _error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = auth?.user?.access_token;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setTeamMembers(await response.json());
    } catch (_error) {
      console.error("Erro", _error);
    }
  };

  const handleTaskSelection = (taskId) => {
    setSelectedTaskId(taskId);
    if (taskId) {
      const taskToEdit = tasks.find(t => t.id.toString() === taskId);
      if (taskToEdit) {
        const prazoFormatado = taskToEdit.prazo ? new Date(taskToEdit.prazo).toISOString().split('T')[0] : '';
        setTaskData({
          titulo: taskToEdit.titulo,
          descricao: taskToEdit.descricao || '',
          prioridade: String(taskToEdit.prioridade).toLowerCase(),
          prazo: prazoFormatado,
          status: String(taskToEdit.status).toLowerCase(), // Puxa o status da task selecionada
          idsResponsaveis: [] 
        });
      }
    } else {
      setTaskData({ titulo: '', descricao: '', prioridade: '', prazo: '', status: '', idsResponsaveis: [] });
    }
  };

  const handleCheckboxChange = (userId) => {
    const isSelected = taskData.idsResponsaveis.includes(userId);
    setTaskData(prev => ({
      ...prev,
      idsResponsaveis: isSelected ? prev.idsResponsaveis.filter(id => id !== userId) : [...prev.idsResponsaveis, userId]
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedTaskId) {
      setErro("Selecione uma tarefa para editar.");
      return;
    }
    
    setErro(null);
    setIsLoading(true);

    try {
      const token = auth?.user?.access_token;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/task/${selectedTaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          titulo: taskData.titulo,
          descricao: taskData.descricao,
          status: taskData.status, // Envia o status atualizado
          prioridade: taskData.prioridade,
          prazo: taskData.prazo,
          idsResponsaveis: taskData.idsResponsaveis
        }) 
      });

      if (response.ok) {
        setShowSuccess(true);
        fetchTasks();
        setTimeout(() => setShowSuccess(false), 2500);
      } else {
        setErro('Erro ao atualizar a tarefa.');
      }
    } catch (_error) {
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
            <div className={styles.toastText}><strong>Sucesso!</strong><span>Tarefa atualizada com sucesso.</span></div>
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
          <h1 className={styles.title}>Editar Tarefa</h1>
          <p className={styles.subtitle}>Atualize os detalhes e o status da tarefa selecionada.</p>
        </header>
        
        <form className={styles.form} onSubmit={handleUpdate}>
          
          <div className={styles.field} style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'var(--bg-app)', borderRadius: '8px', border: '1px solid var(--primary-blue)' }}>
            <label style={{ color: 'var(--primary-blue)', fontWeight: 'bold' }}>SELECIONAR TAREFA</label>
            <select 
              value={selectedTaskId}
              onChange={(e) => handleTaskSelection(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', marginTop: '5px', border: '1px solid #ccc' }}
            >
              <option value="">-- Escolha uma tarefa para editar --</option>
              {tasks.map(t => (
                <option key={t.id} value={t.id}>#{t.id} - {t.titulo}</option>
              ))}
            </select>
          </div>

          <div className={styles.layoutGrid}>
            <div className={styles.primarySection}>
              <div className={styles.field}>
                <label>TÍTULO DO ITEM</label>
                <input 
                  type="text" required disabled={!selectedTaskId}
                  value={taskData.titulo} 
                  onChange={(e) => setTaskData({...taskData, titulo: e.target.value})}
                />
              </div>

              <div className={styles.field}>
                <label>DOCUMENTAÇÃO / DESCRIÇÃO</label>
                <textarea 
                  rows="4" disabled={!selectedTaskId}
                  value={taskData.descricao}
                  onChange={(e) => setTaskData({...taskData, descricao: e.target.value})}
                ></textarea>
              </div>

              <div className={styles.field}>
                <label><FaUsers /> ATRIBUIR RESPONSÁVEIS</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '5px', padding: '10px', background: 'var(--bg-app)', borderRadius: '8px', border: '1px solid #ccc' }}>
                  {teamMembers.length === 0 ? (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nenhum membro.</span>
                  ) : (
                    teamMembers.map(user => (
                      <label key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', background: 'var(--bg-card)', padding: '5px 10px', borderRadius: '15px', border: '1px solid var(--primary-blue)', fontSize: '0.9rem' }}>
                        <input 
                          type="checkbox" disabled={!selectedTaskId}
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
                <select value={taskData.prioridade} required disabled={!selectedTaskId} onChange={(e) => setTaskData({...taskData, prioridade: e.target.value})}>
                  <option value="" disabled>Nível de urgência</option>
                  <option value="alta">ALTA</option>
                  <option value="media">MÉDIA</option>
                  <option value="baixa">BAIXA</option>
                </select>
              </div>

              {/* CAMPO DE STATUS ADICIONADO AQUI */}
              <div className={styles.field}>
                <label>STATUS ATUAL</label>
                <select value={taskData.status} required disabled={!selectedTaskId} onChange={(e) => setTaskData({...taskData, status: e.target.value})}>
                  <option value="pendente">Pendente</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluida">Concluída</option>
                </select>
              </div>

              <div className={styles.field}>
                <label><FaCalendarAlt /> PRAZO DE ENTREGA</label>
                <input 
                  type="date" required disabled={!selectedTaskId}
                  value={taskData.prazo}
                  onChange={(e) => setTaskData({...taskData, prazo: e.target.value})} 
                />
              </div>
            </div>
          </div>

          <footer className={styles.footer} style={{ justifyContent: 'flex-end', display: 'flex' }}>
            <button type="submit" className={styles.primaryBtn} disabled={isLoading || !selectedTaskId}>
              {isLoading ? 'Salvando...' : 'Salvar Edição'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}