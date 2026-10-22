import React, { useEffect, useState } from 'react';
import {
  FaHistory,
  FaPlusCircle,
  FaExchangeAlt,
  FaUndoAlt,
  FaEdit,
  FaFlag,
  FaCalendarAlt,
  FaUsers,
  FaTrashAlt,
  FaArrowRight,
  FaTimes
} from 'react-icons/fa';
import styles from './TaskTimeline.module.css';

const STATUS_LABELS = {
  pendente: 'Pendente',
  em_andamento: 'Em Andamento',
  concluida: 'Concluída'
};

const PRIORITY_LABELS = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta'
};

function formatValue(actionType, value) {
  if (!value) return null;
  const lower = String(value).toLowerCase();
  if (actionType === 'MOVED' || actionType === 'RETURNED') {
    return STATUS_LABELS[lower] || value;
  }
  if (actionType === 'CHANGED_PRIORITY') {
    return PRIORITY_LABELS[lower] || value;
  }
  if (actionType === 'CHANGED_DEADLINE' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-');
    return `${d}/${m}/${y}`;
  }
  return value;
}

function getActionMetadata(actionType) {
  switch (actionType) {
    case 'CREATED':
      return {
        label: 'criou a tarefa',
        icon: <FaPlusCircle />,
        badgeClass: styles.badgeGreen
      };
    case 'MOVED':
    case 'STATUS_CHANGE':
      return {
        label: 'moveu o status da tarefa',
        icon: <FaExchangeAlt />,
        badgeClass: styles.badgeBlue
      };
    case 'RETURNED':
      return {
        label: 'reabriu a tarefa concluída',
        icon: <FaUndoAlt />,
        badgeClass: styles.badgeAmber
      };
    case 'EDITED_TITLE':
    case 'EDITED':
      return {
        label: 'alterou o título',
        icon: <FaEdit />,
        badgeClass: styles.badgeIndigo
      };
    case 'EDITED_DESCRIPTION':
      return {
        label: 'atualizou a descrição',
        icon: <FaEdit />,
        badgeClass: styles.badgeIndigo
      };
    case 'CHANGED_PRIORITY':
      return {
        label: 'alterou a prioridade',
        icon: <FaFlag />,
        badgeClass: styles.badgeIndigo
      };
    case 'CHANGED_DEADLINE':
      return {
        label: 'alterou o prazo de entrega',
        icon: <FaCalendarAlt />,
        badgeClass: styles.badgeIndigo
      };
    case 'CHANGED_ASSIGNEES':
      return {
        label: 'atualizou os responsáveis',
        icon: <FaUsers />,
        badgeClass: styles.badgeIndigo
      };
    case 'DELETED':
      return {
        label: 'excluiu a tarefa',
        icon: <FaTrashAlt />,
        badgeClass: styles.badgeRed
      };
    default:
      return {
        label: `realizou a ação ${actionType}`,
        icon: <FaHistory />,
        badgeClass: styles.badgeIndigo
      };
  }
}

function formatTimestamp(ts) {
  if (!ts) return '';
  try {
    const date = Array.isArray(ts)
      ? new Date(ts[0], ts[1] - 1, ts[2], ts[3] || 0, ts[4] || 0, ts[5] || 0)
      : new Date(ts);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return String(ts);
  }
}

export default function TaskTimeline({
  taskId,
  taskNumber,
  taskTitle,
  token,
  refreshKey = 0,
  isModal = false,
  isOpen = false,
  onClose
}) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!taskId || !token || (isModal && !isOpen)) {
      setHistory([]);
      return;
    }

    let active = true;
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/task/${taskId}/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok && active) {
          const data = await res.json();
          setHistory(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Erro ao carregar histórico da tarefa:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchHistory();
    return () => {
      active = false;
    };
  }, [taskId, token, refreshKey, isModal, isOpen]);

  const renderTimelineContent = () => {
    if (loading) {
      return <div className={styles.emptyState}>Carregando histórico de auditoria...</div>;
    }

    if (history.length === 0) {
      return (
        <div className={styles.emptyState}>
          Nenhum evento registrado para esta tarefa até o momento.
        </div>
      );
    }

    return (
      <div className={styles.timelineList}>
        {history.map((item) => {
          const meta = getActionMetadata(item.actionType);
          const oldValFormatted = formatValue(item.actionType, item.oldValue);
          const newValFormatted = formatValue(item.actionType, item.newValue);

          return (
            <div key={item.id} className={styles.timelineItem}>
              <div className={`${styles.iconCircle} ${meta.badgeClass}`}>
                {meta.icon}
              </div>
              <div className={styles.itemBody}>
                <div className={styles.itemHeader}>
                  <div>
                    <span className={styles.authorName}>{item.userName || 'Usuário'}</span>
                    <span className={styles.actionLabel}>{meta.label}</span>
                  </div>
                  <span className={styles.timestamp}>{formatTimestamp(item.timestamp)}</span>
                </div>

                {(oldValFormatted || newValFormatted) && (
                  <div className={styles.diffBox}>
                    {oldValFormatted && (
                      <span className={styles.oldValue} title={oldValFormatted}>
                        {oldValFormatted}
                      </span>
                    )}
                    {oldValFormatted && newValFormatted && (
                      <FaArrowRight className={styles.arrow} />
                    )}
                    {newValFormatted && (
                      <span className={styles.newValue} title={newValFormatted}>
                        {newValFormatted}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (isModal) {
    if (!isOpen) return null;
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <div>
              <h2 className={styles.modalTitle}>
                <FaHistory style={{ marginRight: '8px', color: 'var(--primary-blue)' }} />
                Histórico da Tarefa
              </h2>
              {taskTitle && (
                <p className={styles.modalSubtitle}>
                  {taskNumber ? `${taskNumber} - ${taskTitle}` : taskTitle}
                </p>
              )}
            </div>
            <button type="button" className={styles.closeBtn} onClick={onClose} title="Fechar">
              <FaTimes />
            </button>
          </div>
          {renderTimelineContent()}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.timelinePanel}>
      <div className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>
          <FaHistory style={{ color: 'var(--primary-blue)' }} />
          Linha do Tempo e Auditoria
        </h3>
        <span className={styles.countBadge}>{history.length} registro(s)</span>
      </div>
      {renderTimelineContent()}
    </div>
  );
}
