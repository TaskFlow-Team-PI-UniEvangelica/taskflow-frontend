import React, { useEffect, useState } from 'react';
import { FaTrashAlt, FaTimes, FaClock } from 'react-icons/fa';
import styles from './TaskTimeline.module.css';

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

export default function DeletedTasksModal({
  isOpen,
  onClose,
  organization,
  token,
  refreshKey = 0
}) {
  const [deletedItems, setDeletedItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !organization?.id || !token) {
      setDeletedItems([]);
      return;
    }

    let active = true;
    const fetchDeletedHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/task/organization/${organization.id}/deleted-history`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (res.ok && active) {
          const data = await res.json();
          setDeletedItems(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Erro ao buscar histórico de tarefas excluídas:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDeletedHistory();
    return () => {
      active = false;
    };
  }, [isOpen, organization?.id, token, refreshKey]);

  if (!isOpen) return null;

  const retentionDays = organization?.deletedTasksRetentionDays;
  const retentionLabel =
    retentionDays && retentionDays > 0
      ? `Retenção ativa: ${retentionDays} dia(s) (definida pelo Dono)`
      : 'Retenção ativa: Permanente (definida pelo Dono)';

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>
              <FaTrashAlt style={{ marginRight: '8px', color: '#ef4444' }} />
              Histórico de Tarefas Excluídas
            </h2>
            <p className={styles.modalSubtitle}>
              <FaClock style={{ marginRight: '5px' }} />
              {retentionLabel}
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} title="Fechar">
            <FaTimes />
          </button>
        </div>

        {loading ? (
          <div className={styles.emptyState}>Carregando tarefas excluídas...</div>
        ) : deletedItems.length === 0 ? (
          <div className={styles.emptyState}>
            Nenhuma tarefa excluída registrada no período de retenção desta organização.
          </div>
        ) : (
          <div className={styles.timelineList}>
            {deletedItems.map((item) => {
              const displayTitle = item.taskNumber
                ? `${item.taskNumber} - ${item.taskTitle || item.oldValue || 'Tarefa Excluída'}`
                : item.taskTitle || item.oldValue || 'Tarefa Excluída';

              return (
                <div key={item.id} className={styles.timelineItem}>
                  <div className={`${styles.iconCircle} ${styles.badgeRed}`}>
                    <FaTrashAlt />
                  </div>
                  <div className={styles.itemBody}>
                    <div className={styles.itemHeader}>
                      <div>
                        <span className={styles.authorName}>{displayTitle}</span>
                      </div>
                      <span className={styles.timestamp}>{formatTimestamp(item.timestamp)}</span>
                    </div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Excluída por <strong style={{ color: 'var(--text-primary)' }}>{item.userName || 'Usuário'}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
