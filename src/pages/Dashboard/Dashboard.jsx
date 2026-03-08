import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaSave, FaKey, FaTimes } from 'react-icons/fa'; 

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Administrador");
  
  // ESTADOS PARA OS CONTADORES DINÂMICOS
  const [stats, setStats] = useState({
    concluidas: 0,
    pendentes: 0,
    atrasadas: 0,
    andamento: 0
  });

  const [toast, setToast] = useState({ show: false, message: '', icon: null });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // FUNÇÃO PARA CALCULAR ESTATÍSTICAS REAIS
  const atualizarEstatisticas = () => {
    // Busca as demandas salvas no localStorage
    const demandasSalvas = JSON.parse(localStorage.getItem('demandas_coletivas') || '[]');
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zera as horas para comparação justa de datas

    let contadores = { concluidas: 0, pendentes: 0, atrasadas: 0, andamento: 0 };

    demandasSalvas.forEach(tarefa => {
      const dataPrazo = new Date(tarefa.prazo);
      
      if (tarefa.status === 'concluida') {
        contadores.concluidas++;
      } else {
        // Lógica para Atrasadas vs Pendentes (TPA)
        if (dataPrazo < hoje) {
          contadores.atrasadas++;
        } else {
          contadores.pendentes++;
        }
      }
    });

    setStats(contadores);
  };

  useEffect(() => {
    setUserName("Administrador");
    atualizarEstatisticas();

    // Listener para atualizar o Dashboard instantaneamente quando uma tarefa for criada na aba Equipes
    window.addEventListener('storage', atualizarEstatisticas);
    return () => window.removeEventListener('storage', atualizarEstatisticas);
  }, []);

  const showToast = (message, type) => {
    const icon = type === 'save' ? <FaSave /> : <FaKey />;
    setToast({ show: true, message, icon });
    setTimeout(() => setToast({ show: false, message: '', icon: null }), 3000);
  };

  const handleSaveProfile = () => {
    showToast("Perfil atualizado com sucesso!", "save");
    setIsProfileOpen(false);
  };

  const handlePasswordConfirm = () => {
    if (newPassword.length > 0) {
      showToast("Senha alterada com segurança!", "password");
      setIsChangingPassword(false);
      setNewPassword('');
    }
  };

  return (
    <div className={styles.container}>
      
      {toast.show && (
        <div className={styles.toastContainer}>
          <div className={styles.toastCard}>
            <span className={styles.toastIcon}>{toast.icon}</span>
            <div className={styles.toastText}>
              <strong>Sucesso</strong>
              <span>{toast.message}</span>
            </div>
          </div>
        </div>
      )}

      {isProfileOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.closeBtn} onClick={() => setIsProfileOpen(false)}><FaTimes /></button>
            <h2 className={styles.modalTitle}>Editar Perfil</h2>
            
            <div className={styles.profileFields}>
              <label>Nome</label>
              <input type="text" defaultValue="Wanderlay Silva Neto" />
              
              <label>Email</label>
              <input type="email" defaultValue="wanderlay@exemplo.com" />
              
              <div className={styles.row}>
                <button 
                  className={styles.passwordTrigger} 
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                >
                  Trocar senha
                </button>
              </div>

              {isChangingPassword && (
                <div className={styles.passwordInPlace}>
                  <input 
                    type="password" 
                    placeholder="Digite a nova senha" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoFocus
                  />
                  <button onClick={handlePasswordConfirm} className={styles.confirmPassBtn}>Confirmar</button>
                </div>
              )}
            </div>

            <button className={styles.saveProfileBtn} onClick={handleSaveProfile}>
              Salvar Alterações
            </button>
          </div>
        </div>
      )}

      <h1 className={styles.title} style={{ marginBottom: '40px' }} onClick={() => setIsProfileOpen(true)}>
        Bem-vindo,<br />{userName} !
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
          <h2 className={styles.tasksTitle}>Tarefas Recentes</h2>
          <button className={styles.createBtn} onClick={() => navigate('/tasks')}>
            + Criar Tarefa
          </button>
        </div>
      </section>
    </div>
  );
}