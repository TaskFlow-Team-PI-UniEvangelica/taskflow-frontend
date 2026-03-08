import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Tasks.module.css';
import { FaCheckCircle, FaCalendarAlt } from 'react-icons/fa'; 

export default function Tasks() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [taskData, setTaskData] = useState({
    titulo: '',
    descricao: '',
    responsavel: '',
    prioridade: '',
    status: 'pendente',
    prazo: '' 
  });

  const handleCreate = (e) => {
    e.preventDefault();
    
    
   
    const demandasExistentes = JSON.parse(localStorage.getItem('demandas_coletivas') || '[]');
    
   
    const novaTarefa = {
      ...taskData,
      id: Date.now(),
      membros: taskData.responsavel, 
      titulo: taskData.titulo
    };

    
    localStorage.setItem('demandas_coletivas', JSON.stringify([novaTarefa, ...demandasExistentes]));

    
    window.dispatchEvent(new Event('storage'));

    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      navigate('/dashboard'); 
    }, 2500);
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
                  onChange={(e) => setTaskData({...taskData, titulo: e.target.value})}
                />
              </div>

              <div className={styles.field}>
                <label>Documentação / Descrição</label>
                <textarea 
                  placeholder="Detalhes técnicos e requisitos..." 
                  rows="10"
                  onChange={(e) => setTaskData({...taskData, descricao: e.target.value})}
                ></textarea>
              </div>
            </div>

            <div className={styles.sidebarSection}>
              <div className={styles.field}>
                <label>Responsável</label>
                <select defaultValue="" required onChange={(e) => setTaskData({...taskData, responsavel: e.target.value})}>
                  <option value="" disabled>Atribuir a...</option>
                  <option value="Guilherme Miguel">Guilherme Miguel</option>
                  <option value="Wanderlay Silva Neto">Wanderlay Silva Neto</option>
                  <option value="Kayran">Kayran</option>
                </select>
              </div>

              <div className={styles.field}>
                <label>Status Atual</label>
                <select value={taskData.status} required onChange={(e) => setTaskData({...taskData, status: e.target.value})}>
                  <option value="pendente">Pendente</option>
                  <option value="andamento">Em Andamento</option>
                  <option value="concluida">Concluída</option>
                </select>
              </div>

              <div className={styles.field}>
                <label>Prioridade</label>
                <select defaultValue="" required onChange={(e) => setTaskData({...taskData, prioridade: e.target.value})}>
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
                  onChange={(e) => setTaskData({...taskData, prazo: e.target.value})} 
                />
              </div>
            </div>
          </div>

          <footer className={styles.footer}>
            <button type="button" className={styles.secondaryBtn} onClick={() => navigate('/dashboard')}>Descartar</button>
            <button type="submit" className={styles.primaryBtn}>Salvar Tarefa</button>
          </footer>
        </form>
      </div>
    </div>
  );
}