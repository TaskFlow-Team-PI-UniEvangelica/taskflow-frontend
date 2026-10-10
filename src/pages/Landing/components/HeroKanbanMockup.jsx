import React from 'react';
import { FaEnvelopeOpenText, FaCheckCircle, FaRegClock } from 'react-icons/fa';
import styles from '../LandingPage.module.css';

// dados fictícios apenas para ilustrar o quadro Kanban
const COLUMNS = [
  {
    title: 'Pendentes',
    color: '#3b82f6',
    cards: [
      { title: 'Definir escopo da sprint', priority: 'alta', people: ['MD', 'AL'], due: '12 out' },
      { title: 'Revisar protótipo', priority: 'media', people: ['JS'], due: '15 out' },
    ],
  },
  {
    title: 'Em Andamento',
    color: '#f59e0b',
    cards: [
      { title: 'Tela de organizações', priority: 'media', people: ['KR', 'MD'], due: '10 out', progress: 65 },
    ],
  },
  {
    title: 'Concluídas',
    color: '#10b981',
    cards: [
      { title: 'Login com Keycloak', priority: 'baixa', people: ['AL'], done: true },
    ],
  },
];

const PRIORITY_LABEL = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };

export default function HeroKanbanMockup() {
  return (
    <div
      className={styles.mockupWrap}
      role="img"
      aria-label="Ilustração do quadro Kanban do TaskFlow com tarefas pendentes, em andamento e concluídas"
    >
      <div className={styles.mockupGlow} aria-hidden="true" />

      <div className={styles.mockup} aria-hidden="true">
        <div className={styles.mockupBar}>
          <span className={styles.dot} style={{ background: '#ef4444' }} />
          <span className={styles.dot} style={{ background: '#f59e0b' }} />
          <span className={styles.dot} style={{ background: '#10b981' }} />
          <span className={styles.mockupTitle}>Equipe Dev · Kanban</span>
        </div>

        <div className={styles.mockupBoard}>
          {COLUMNS.map((col) => (
            <div key={col.title} className={styles.mockupColumn}>
              <div className={styles.mockupColumnHeader} style={{ borderBottomColor: col.color }}>
                <span>{col.title}</span>
                <span className={styles.mockupCount}>{col.cards.length}</span>
              </div>
              {col.cards.map((card) => (
                <div key={card.title} className={`${styles.mockupCard} ${card.done ? styles.mockupCardDone : ''}`}>
                  <div className={styles.mockupCardTop}>
                    <span className={`${styles.priority} ${styles[`priority_${card.priority}`]}`}>
                      {PRIORITY_LABEL[card.priority]}
                    </span>
                    {card.done && <FaCheckCircle className={styles.mockupDoneIcon} />}
                  </div>
                  <p className={styles.mockupCardTitle}>{card.title}</p>
                  {typeof card.progress === 'number' && (
                    <div className={styles.progress}>
                      <span style={{ width: `${card.progress}%` }} />
                    </div>
                  )}
                  <div className={styles.mockupCardFooter}>
                    <div className={styles.avatars}>
                      {card.people.map((p) => (
                        <span key={p} className={styles.avatar}>{p}</span>
                      ))}
                    </div>
                    {card.due && (
                      <span className={styles.due}><FaRegClock /> {card.due}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className={`${styles.floatCard} ${styles.floatCardTop}`} aria-hidden="true">
        <span className={styles.floatIcon}><FaEnvelopeOpenText /></span>
        <div>
          <strong>Novo convite</strong>
          <span>Entrar em <em>Equipe Dev</em></span>
        </div>
      </div>

      <div className={`${styles.floatCard} ${styles.floatCardBottom}`} aria-hidden="true">
        <span className={`${styles.floatIcon} ${styles.floatIconSuccess}`}><FaCheckCircle /></span>
        <div>
          <strong>Tarefa concluída</strong>
          <span>por Matheus D.</span>
        </div>
      </div>
    </div>
  );
}
