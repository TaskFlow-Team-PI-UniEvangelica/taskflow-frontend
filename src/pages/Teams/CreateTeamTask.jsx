import React, { useState } from 'react';
import styles from './CreateTeamTask.module.css'; 
import { FaUsers, FaPlus, FaTrash, FaExclamationTriangle, FaCalendarAlt } from 'react-icons/fa';

export default function CreateTeamTask({ onCancel, onSave }) {
  const [members, setMembers] = useState(['']);
  const [priority, setPriority] = useState('Média');
  const [taskName, setTaskName] = useState('');
  const [deadline, setDeadline] = useState(''); 

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!taskName.trim() || !deadline || members.filter(m => m.trim() !== '').length === 0) {
      
      alert("Por favor, preencha o nome, o prazo e adicione ao menos um membro.");
      return;
    }

    const novaTarefa = {
      titulo: taskName,
      membros: members.filter(m => m.trim() !== '').join(', '),
      prioridade: priority,
      prazo: deadline, 
      status: 'pendente'
    };

    onSave(novaTarefa);
  };

  return (
    <form className={styles.mainCard} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h2 className={styles.title}>Criar Tarefa em Equipe</h2>
        <p className={styles.subtitle}>Defina os membros, a prioridade e o prazo (TPA).</p>
      </div>

      <div className={styles.layoutGrid}>
        {/* LADO ESQUERDO: MEMBROS */}
        <div className={styles.col}>
          <div className={styles.field}>
            <label><FaUsers /> Membros da Equipe ({members.length})</label>
            {members.map((member, index) => (
              <div key={index} className={styles.memberRow}>
                <input
                  type="text"
                  placeholder="Nome do membro"
                  className={styles.input}
                  value={member}
                  onChange={(e) => {
                    const newMembers = [...members];
                    newMembers[index] = e.target.value;
                    setMembers(newMembers);
                  }}
                />
                <button 
                  type="button" 
                  className={styles.removeBtn}
                  onClick={() => setMembers(members.filter((_, i) => i !== index))}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
            <button 
              type="button" 
              className={styles.addMemberBtn} 
              onClick={() => setMembers([...members, ''])}
            >
              <FaPlus /> Adicionar Membro
            </button>
          </div>
        </div>

        {/* LADO DIREITO: CONFIGURAÇÕES */}
        <div className={styles.col}>
          <div className={styles.field}>
            <label>Nome da Tarefa</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="Ex: Refatoração UI" 
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label><FaCalendarAlt /> Prazo de Entrega (TPA)</label>
            <input 
              type="date" 
              className={styles.input} 
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label><FaExclamationTriangle /> Prioridade</label>
            <select className={styles.input} value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
            </select>
          </div>

          <div className={styles.statsMiniCard}>
            <span className={styles.miniTitle}>Resumo do Grupo</span>
            <strong className={styles.miniValue}>{members.length} Colaboradores</strong>
            <small className={styles.miniDetail}>Prioridade: {priority} | Prazo: {deadline || 'Não definido'}</small>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.secondaryBtn} onClick={onCancel}>Cancelar</button>
        <button type="submit" className={styles.primaryBtn}>Criar Equipe e Tarefa</button>
      </div>
    </form>
  );
}