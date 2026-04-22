import React, { useState, useEffect } from 'react';
// 1. Remova este import
// import DashboardLayout from '../../components/DashboardLayout/DashboardLayout'; 
import styles from './AdminPage.module.css';
import { FaUserShield, FaUserEdit, FaTrash, FaSpinner } from 'react-icons/fa';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ... mantenha toda a sua lógica de fetch, handleDelete e toggleStatus aqui igualzinha

  return (
    /* 2. REMOVA A TAG <DashboardLayout> DAQUI */
    <div className={styles.adminContainer}>
      <header className={styles.header}>
        <FaUserShield size={32} color="var(--primary-blue)" />
        <h1>Painel de Administração</h1>
      </header>

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span>Total de Usuários</span>
          <h2>{users.length}</h2>
        </div>
        <div className={styles.statCard}>
          <span>Usuários Ativos</span>
          <h2>{users.filter(u => u.status === 'ACTIVE').length}</h2>
        </div>
      </section>

      <div className={styles.tableWrapper}>
        {loading ? (
          <div className={styles.loadingArea}>
            <FaSpinner className={styles.iconSpin} /> Carregando usuários...
          </div>
        ) : (
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Função</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.nome}</td>
                  <td>{user.email}</td>
                  <td><span className={styles.roleBadge}>{user.funcao}</span></td>
                  <td>
                    <span 
                      className={user.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive}
                      onClick={() => toggleStatus(user)}
                      style={{ cursor: 'pointer' }}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className={styles.actions}>
                    <button title="Editar" className={styles.editBtn}><FaUserEdit /></button>
                    <button 
                      title="Excluir" 
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(user.id, user.nome)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
    /* 3. REMOVA A TAG </DashboardLayout> DAQUI */
  );
}