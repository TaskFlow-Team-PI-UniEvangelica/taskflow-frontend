import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from 'react-oidc-context';
import { FaHistory, FaTrashAlt } from 'react-icons/fa';
import { OrganizationContext } from '../../context/OrganizationContext';
import TaskTimeline from '../../components/TaskHistory/TaskTimeline';
import DeletedTasksModal from '../../components/TaskHistory/DeletedTasksModal';
import styles from './Kanban.module.css';

export default function Kanban() {
  const auth = useAuth();
  const { currentOrg } = useContext(OrganizationContext);
  const [tasks, setTasks] = useState([]);
  const [historyTask, setHistoryTask] = useState(null);
  const [showDeletedModal, setShowDeletedModal] = useState(false);

  const userRole = currentOrg?.myRole || currentOrg?.userRole;
  const isAboveMember = ['OWNER', 'SUB_OWNER', 'MANAGER'].includes(userRole);

  const fetchTasks = async () => {
    if (!currentOrg?.id) {
        setTasks([]);
        return;
    }
    try {
      const token = auth?.user?.access_token;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/task?organizationId=${currentOrg.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) setTasks(await response.json());
    } catch (_error) {
      console.error("Erro ao buscar tarefas");
    }
  };

  // Observa apenas o ID da organização para evitar recarregar os cards quando configurações mudam em background
  useEffect(() => {
    fetchTasks();
    setHistoryTask(null);
  }, [currentOrg?.id]);


  // --- TRATAMENTO DE DATAS ---
  const parseData = (prazo) => {
    if (!prazo) return null; 
    if (Array.isArray(prazo)) return new Date(prazo[0], prazo[1] - 1, prazo[2]); 
    return new Date(prazo + "T00:00:00"); 
  };

  const isAtrasada = (prazo, status) => {
    if (String(status).toLowerCase() === 'concluida') return false;
    const dataPrazo = parseData(prazo);
    if (!dataPrazo) return false;
    return dataPrazo < new Date(new Date().setHours(0,0,0,0));
  };

  // --- EVENTOS DE DRAG AND DROP NATIVO ---
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, novoStatus) => {
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;
    
    setTasks(prevTasks => prevTasks.map(t => 
      t.id.toString() === taskId ? { ...t, status: novoStatus } : t
    ));

    try {
      const token = auth?.user?.access_token;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/task/${taskId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: novoStatus })
      });
      if (!response.ok) {
        fetchTasks();
      }
    } catch (_error) {
      console.error("Erro ao atualizar status via Drag and Drop");
      fetchTasks();
    }
  };

  const pendentes = tasks.filter(t => String(t.status).toLowerCase() === 'pendente');
  const andamento = tasks.filter(t => String(t.status).toLowerCase() === 'em_andamento');
  const concluidas = tasks.filter(t => String(t.status).toLowerCase() === 'concluida');

  return (
    <div className={styles.container}>
      <header className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className={styles.title}>Quadro Kanban</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Arraste e solte os cards para atualizar o status ou consulte o histórico de auditoria.</p>
        </div>
        {isAboveMember && (
          <button
            type="button"
            onClick={() => setShowDeletedModal(true)}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              padding: '10px 16px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.88rem'
            }}
          >
            <FaTrashAlt /> Histórico de Excluídas
          </button>
        )}
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
              <TaskCard
                key={task.id}
                task={task}
                onDragStart={handleDragStart}
                onOpenHistory={setHistoryTask}
                isAtrasada={isAtrasada(task.prazo, task.status)}
              />
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
              <TaskCard
                key={task.id}
                task={task}
                onDragStart={handleDragStart}
                onOpenHistory={setHistoryTask}
                isAtrasada={isAtrasada(task.prazo, task.status)}
              />
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
              <TaskCard
                key={task.id}
                task={task}
                onDragStart={handleDragStart}
                onOpenHistory={setHistoryTask}
                isAtrasada={false}
              />
            ))}
          </div>
        </div>
      </div>

      <TaskTimeline
        isModal
        isOpen={Boolean(historyTask)}
        onClose={() => setHistoryTask(null)}
        taskId={historyTask?.id}
        taskNumber={historyTask?.taskNumber}
        taskTitle={historyTask?.titulo}
        token={auth?.user?.access_token}
      />

      <DeletedTasksModal
        isOpen={showDeletedModal}
        onClose={() => setShowDeletedModal(false)}
        organization={currentOrg}
        token={auth?.user?.access_token}
      />
    </div>
  );
}

function TaskCard({ task, onDragStart, onOpenHistory, isAtrasada }) {
  const dataFormatada = task.prazo ? new Date(
    Array.isArray(task.prazo) ? new Date(task.prazo[0], task.prazo[1] - 1, task.prazo[2]) : task.prazo + "T00:00:00"
  ).toLocaleDateString('pt-BR') : 'Sem prazo';

  return (
    <div 
      className={styles.taskCard} 
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
    >
      <div className={styles.cardHeaderRow}>
        <p className={styles.taskTitle}>
          {task.taskNumber ? `${task.taskNumber} - ${task.titulo}` : task.titulo}
        </p>
        <button
          type="button"
          className={styles.historyBtn}
          title="Ver histórico de alterações"
          onClick={(e) => {
            e.stopPropagation();
            onOpenHistory(task);
          }}
        >
          <FaHistory />
        </button>
      </div>
      
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