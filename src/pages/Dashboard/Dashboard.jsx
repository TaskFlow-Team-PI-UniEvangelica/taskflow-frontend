import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Carregando...");
  const [tasks, setTasks] = useState([]);
  
  const [stats, setStats] = useState({
    concluidas: 0, pendentes: 0, atrasadas: 0, andamento: 0
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/');

      try {
        const response = await fetch('http://localhost:8080/user/me', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUserName(data.nome ? data.nome.split(' ')[0] : "Usuário");
        }
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
      }
    };

    const fetchTasks = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:8080/task', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setTasks(data);
          atualizarEstatisticas(data);
        }
      } catch (error) {
        console.error("Erro ao buscar tarefas:", error);
      }
    };

    fetchUserProfile();
    fetchTasks();
  }, [navigate]);

  const parseData = (prazo) => {
    if (!prazo) return new Date(); 
    if (Array.isArray(prazo)) {
      return new Date(prazo[0], prazo[1] - 1, prazo[2]); 
    }
    return new Date(prazo + "T00:00:00"); 
  };

  const atualizarEstatisticas = (listaDeTarefas) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); 

    let contadores = { concluidas: 0, pendentes: 0, atrasadas: 0, andamento: 0 };

    if (Array.isArray(listaDeTarefas)) {
      listaDeTarefas.forEach(tarefa => {
        const dataPrazo = parseData(tarefa.prazo);
        const statusNormalizado = String(tarefa.status).toLowerCase(); 
        
        if (statusNormalizado === 'concluida') {
          contadores.concluidas++;
        } else if (statusNormalizado === 'em_andamento') {
          contadores.andamento++;
        } else {
          if (dataPrazo < hoje) {
            contadores.atrasadas++;
          } else {
            contadores.pendentes++;
          }
        }
      });
    }

    setStats(contadores);
  };

  // Cores injetadas diretamente (Verde, Amarelo, Vermelho, Azul)
  const getCorDaBolinha = (status, prazo) => {
    const statusNormalizado = String(status).toLowerCase();
    if (statusNormalizado === 'concluida') return '#10b981'; 
    if (statusNormalizado === 'em_andamento') return '#f59e0b'; 
    
    const dataPrazo = parseData(prazo);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (dataPrazo < hoje) return '#ef4444'; // Atrasada fica vermelha
    return 'var(--primary-blue)'; // Pendente em dia fica azul
  };

  return (
    <div className={styles.container}>
      
      <h1 className={styles.title} style={{ marginBottom: '40px' }}>
        Bem-vindo,<br />{userName}!
      </h1>

      <section className={styles.statsGrid}>
        <div className={styles.statWrapper}>
          <span className={styles.statTitle}>Concluídas</span>
          <div className={`${styles.statCard} ${styles.cardGreen}`}>{stats.concluidas}</div>
        </div>
        <div className={styles.statWrapper}>
          <span className={styles.statTitle}>Pendentes</span>
          <div className={`${styles.statCard} ${styles.cardBlue}`}>{stats.pendentes}</div>
        </div>
        <div className={styles.statWrapper}>
          <span className={styles.statTitle}>Atrasadas</span>
          <div className={`${styles.statCard} ${styles.cardOrange}`}>{stats.atrasadas}</div>
        </div>
        <div className={styles.statWrapper}>
          <span className={styles.statTitle}>Em Andamento</span>
          <div className={`${styles.statCard} ${styles.cardYellow}`}>{stats.andamento}</div>
        </div>
      </section>

      <section className={styles.tasksSection} style={{ marginTop: '40px' }}>
        <div className={styles.tasksHeader}>
          <h2 className={styles.tasksTitle}>Todas as Tarefas</h2>
          <button className={styles.createBtn} onClick={() => navigate('/tasks')}>
            + Criar Tarefa
          </button>
        </div>

        {/* --- ADICIONADO ROLAGEM INFINITA AQUI (maxHeight e overflowY) --- */}
        <div className={styles.tasksTable} style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '10px' }}>
          {!Array.isArray(tasks) || tasks.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>Nenhuma tarefa cadastrada ainda.</p>
          ) : (
            // Removi o .slice() - Agora lista TODAS as tarefas com scroll
            tasks.map((task) => (
              <div key={task.id} className={styles.taskRow} style={{ marginBottom: '10px' }}>
                <div className={styles.taskMainInfo}>
                  {/* Bolinha com cor dinâmica */}
                  <div className={styles.statusIndicator} style={{ backgroundColor: getCorDaBolinha(task.status, task.prazo), width: '12px', height: '12px', borderRadius: '50%' }}></div>
                  <div>
                    <strong>{task.titulo}</strong>
                    <p>Status: {String(task.status).replace('_', ' ').toUpperCase()}</p>
                  </div>
                </div>
                
                <div className={styles.taskDeadline}>
                  {parseData(task.prazo).toLocaleDateString('pt-BR')}
                  {parseData(task.prazo) < new Date(new Date().setHours(0,0,0,0)) && String(task.status).toLowerCase() !== 'concluida' && (
                    <span className={styles.overdueBadge} style={{ marginLeft: '10px' }}>Atrasada</span>
                  )}
                </div>

                <div>
                  <span className={`${styles.priorityTag} ${styles[String(task.prioridade).toLowerCase()]}`}>
                    {task.prioridade}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}