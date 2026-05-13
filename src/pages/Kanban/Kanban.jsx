import React, { useState, useEffect } from 'react';
import styles from './Kanban.module.css';

export default function Kanban() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/task`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setTasks(await response.json());
    } catch (error) {
      console.error("Erro ao buscar tarefas");
    }
  };

  // --- TRATAMENTO DE DATAS ---
  const parseData = (prazo) => {
    if (!prazo) return new Date(); 
    if (Array.isArray(prazo)) return new Date(prazo[0], prazo[1] - 1, prazo[2]); 
    return new Date(prazo + "T00:00:00"); 
  };

  const isAtrasada = (prazo, status) => {
    if (String(status).toLowerCase() === 'concluida') return false;
    return parseData(prazo) < new Date(new Date().setHours(0,0,0,0));
  };

  // --- EVENTOS DE DRAG AND DROP NATIVO ---
  
  // 1. O que acontece quando pego o card? (Guardo o ID dele)
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  // 2. Permite que a coluna receba o card
  const handleDragOver = (e) => {
    e.preventDefault(); // Necessário para o onDrop funcionar
  };

  // 3. O que acontece quando solto o card na coluna nova?
  const handleDrop = async (e, novoStatus) => {
    const taskId = e.dataTransfer.getData("taskId");
    
    // Atualiza a tela imediatamente (Otimista) para não ter delay visual
    setTasks(prevTasks => prevTasks.map(t => 
      t.id.toString() === taskId ? { ...t, status: novoStatus } : t
    ));

    // Dispara o PATCH pro backend em background
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL}/task/${taskId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: novoStatus })
      });
    } catch (error) {
      console.error("Erro ao atualizar status via Drag and Drop");
      fetchTasks(); // Se der erro, recarrega os dados originais do banco
    }
  };

  // Separa as tarefas por status
  const pendentes = tasks.filter(t => String(t.status).toLowerCase() === 'pendente');
  const andamento = tasks.filter(t => String(t.status).toLowerCase() === 'em_andamento');
  const concluidas = tasks.filter(t => String(t.status).toLowerCase() === 'concluida');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Quadro Kanban</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Arraste e solte os cards para atualizar o status.</p>
      </header>

      <div className={styles.board}>
        {/* COLUNA PENDENTES */}
        <div className={styles.column} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'pendente')}>
          <div className={styles.columnHeader}>
            <span className={styles.columnTitle} style={{ borderBottom: '3px solid #3b82f6' }}>Pendentes</span>
            <span className={styles.taskCount}>{pendentes.length}</span>
          </div>
          <div className={styles.taskList}>
            {pendentes.map(task => (
              <TaskCard key={task.id} task={task} onDragStart={handleDragStart} isAtrasada={isAtrasada(task.prazo, task.status)} />
            ))}
          </div>
        </div>

        {/* COLUNA EM ANDAMENTO */}
        <div className={styles.column} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'em_andamento')}>
          <div className={styles.columnHeader}>
            <span className={styles.columnTitle} style={{ borderBottom: '3px solid #f59e0b' }}>Em Andamento</span>
            <span className={styles.taskCount}>{andamento.length}</span>
          </div>
          <div className={styles.taskList}>
            {andamento.map(task => (
              <TaskCard key={task.id} task={task} onDragStart={handleDragStart} isAtrasada={isAtrasada(task.prazo, task.status)} />
            ))}
          </div>
        </div>

        {/* COLUNA CONCLUÍDAS */}
        <div className={styles.column} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'concluida')}>
          <div className={styles.columnHeader}>
            <span className={styles.columnTitle} style={{ borderBottom: '3px solid #10b981' }}>Concluídas</span>
            <span className={styles.taskCount}>{concluidas.length}</span>
          </div>
          <div className={styles.taskList}>
            {concluidas.map(task => (
              <TaskCard key={task.id} task={task} onDragStart={handleDragStart} isAtrasada={false} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-componente para deixar o código mais limpo
function TaskCard({ task, onDragStart, isAtrasada }) {
  const dataFormatada = task.prazo ? new Date(
    Array.isArray(task.prazo) ? new Date(task.prazo[0], task.prazo[1] - 1, task.prazo[2]) : task.prazo + "T00:00:00"
  ).toLocaleDateString('pt-BR') : 'N/A';

  return (
    <div 
      className={styles.taskCard} 
      draggable // Habilita o drag do HTML5
      onDragStart={(e) => onDragStart(e, task.id)}
    >
      <p className={styles.taskTitle}>{task.titulo}</p>
      
      <div className={styles.taskMeta}>
        <span className={`${styles.priorityTag} ${styles[String(task.prioridade).toLowerCase()]}`}>
          {task.prioridade.toUpperCase()}
        </span>
        {isAtrasada && <span className={styles.overdueBadge}>ATRASADA</span>}
      </div>
      
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
        <div>📅 {dataFormatada}</div>
        <div style={{ marginTop: '4px', color: 'var(--primary-blue)', fontWeight: 'bold' }}>
          Equipe: {task.nomesResponsaveis && task.nomesResponsaveis.length > 0 ? task.nomesResponsaveis.length + ' membro(s)' : 'Nenhum'}
        </div>
      </div>
    </div>
  );
}