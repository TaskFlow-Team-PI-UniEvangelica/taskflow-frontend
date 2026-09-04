import { useAuth } from 'react-oidc-context';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, Outlet } from 'react-router-dom';
import styles from './DashboardLayout.module.css';
// --- MUDANÇA: FaTrello adicionado na lista de importações abaixo ---
import { FaChartPie, FaTasks, FaUsers, FaSignOutAlt, FaTimes, FaMoon, FaSun, FaSave, FaKey, FaCamera, FaIdBadge, FaEnvelope, FaBriefcase, FaEdit, FaTrello } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import PasswordInput from '../UI/PasswordInput';

export default function DashboardLayout() {
  const auth = useAuth();

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // --- MUDANÇA 1: Adicionado estado para a senha atual ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  const [profileImage, setProfileImage] = useState(localStorage.getItem('user_photo') || null);

  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [userData, setUserData] = useState({
    nome: "Carregando...",
    email: "carregando...",
    cargo: "carregando...",
    id: "..."
  });

  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showNotification = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    const buscarDadosDoUsuario = async () => {
      const token = auth?.user?.access_token;

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/user/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserData({
            nome: data.nome || "Usuário",
            email: data.email || "Sem email",
            cargo: data.cargo || "Sem cargo",
            id: data.id || "N/A"
          });
        } else if (response.status === 401 || response.status === 403) {
          handleLogoutConfirm();
        }
      } catch (_error) {
        console.error("Erro", _error);
      }
    };

    buscarDadosDoUsuario();
  }, [navigate]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfileImage(base64String);
        localStorage.setItem('user_photo', base64String);
        showNotification("Foto de perfil atualizada!", "save");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoutConfirm = () => {
    auth.signoutRedirect();
    localStorage.removeItem('user_photo');
    setShowLogoutModal(false);
  };

  const handlePasswordToggle = () => {
    setIsChangingPassword(!isChangingPassword);
    setNewPassword('');
    setCurrentPassword(''); // Limpa a senha atual ao cancelar também
  };

  const handlePasswordConfirm = async () => {
    if (currentPassword.trim() === "" || newPassword.trim() === "") {
      showNotification("Preencha a senha atual e a nova senha.", "error");
      return;
    }

    setIsLoadingPassword(true);
    try {
      const token = auth?.user?.access_token;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/me/password`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          senhaAtual: currentPassword,
          novaSenha: newPassword
        })
      });

      if (response.ok) {
        showNotification("Senha atualizada com segurança!", "password");
        setIsChangingPassword(false);
        setNewPassword('');
        setCurrentPassword('');
      } else if (response.status === 400 || response.status === 403) {
        showNotification("Senha atual incorreta ou dados inválidos.", "error");
      } else {
        showNotification("Erro ao atualizar a senha.", "error");
      }
    } catch (_error) {
      showNotification("Falha na comunicação com o servidor.", "error");
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className={styles.container}>

      {toast.show && (
        <div className={styles.toastContainer}>
          <div className={styles.toastCard}>
            <div className={styles.toastIcon}>
              {toast.type === 'save' ? <FaSave /> : <FaKey />}
            </div>
            <div className={styles.toastText}>
              <strong>{toast.type === 'save' ? 'Sistema' : 'Segurança'}</strong>
              <span>{toast.message}</span>
            </div>
          </div>
        </div>
      )}

      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>T</div>
          <div className={styles.logoText}>Task <br /> Flow</div>
        </div>

        <nav className={styles.menu}>
          <Link to="/dashboard" className={`${styles.menuItem} ${isActive('/dashboard') ? styles.active : ''}`}>
            <span>Dashboard</span>
            <FaChartPie size={20} />
          </Link>

          {/* --- AQUI ESTÁ A NOVA OPÇÃO DO KANBAN --- */}
          <Link to="/kanban" className={`${styles.menuItem} ${isActive('/kanban') ? styles.active : ''}`}>
            <span>Quadro Kanban</span>
            <FaTrello size={20} />
          </Link>

          <Link to="/tasks" className={`${styles.menuItem} ${isActive('/tasks') ? styles.active : ''}`}>
            <span>Criar Tarefas</span>
            <FaTasks size={20} />
          </Link>
          <Link to="/edit-tasks" className={`${styles.menuItem} ${isActive('/edit-tasks') ? styles.active : ''}`}>
            <span>Editar Tarefas</span>
            <FaEdit size={20} />
          </Link>
          <Link to="/teams" className={`${styles.menuItem} ${isActive('/teams') ? styles.active : ''}`}>
            <span>Equipe</span>
            <FaUsers size={20} />
          </Link>
        </nav>

        <div className={`${styles.menuItem} ${styles.logoutBtn}`} onClick={() => setShowLogoutModal(true)}>
          <span>Sair</span>
          <FaSignOutAlt size={20} />
        </div>
      </aside>

      <main className={styles.mainContent}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '20px' }}>

          <div className={styles.themeToggle} onClick={toggleTheme} style={{ cursor: 'pointer', marginRight: '20px' }}>
            {theme === 'dark' ? <FaMoon size={22} color="#fff" /> : <FaSun size={22} color="#f59e0b" />}
          </div>

          <div onClick={() => setShowProfileModal(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
              {userData.nome.split(' ')[0]}
            </span>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ccc', overflow: 'hidden', border: '2px solid var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {profileImage ? <img src={profileImage} alt="Nav" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
            </div>
          </div>
        </div>

        <Outlet />
      </main>

      {showLogoutModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Sair</h3>
            <p style={{ marginBottom: '25px', color: 'var(--text-secondary)' }}>Tem certeza de que deseja sair?</p>
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setShowLogoutModal(false)}>Cancelar</button>
              <button className={styles.btnConfirm} onClick={handleLogoutConfirm}>Sair</button>
            </div>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox} style={{ maxWidth: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <FaTimes onClick={() => { setShowProfileModal(false); setIsChangingPassword(false); }} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} />
            </div>

            <div className={styles.profileHeader} style={{ marginBottom: '30px' }}>
              <label htmlFor="avatar-upload" style={{ cursor: 'pointer', position: 'relative' }}>
                <div className={styles.avatarCircle} style={{ position: 'relative', overflow: 'hidden', width: '90px', height: '90px', borderRadius: '50%', border: '3px solid var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <FaCamera size={24} color="#ccc" />
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.3s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                    <FaCamera color="#fff" />
                  </div>
                </div>
              </label>
              <input id="avatar-upload" type="file" accept="image/*" hidden onChange={handlePhotoChange} />
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0 }}>{userData.nome}</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 10px' }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid var(--border-color, #eee)', paddingBottom: '10px' }}>
                <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '8px', color: 'var(--primary-blue)' }}>
                  <FaEnvelope size={18} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 2px 0' }}>Email de Acesso</p>
                  <p style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: 0, fontWeight: '500' }}>{userData.email}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid var(--border-color, #eee)', paddingBottom: '10px' }}>
                <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '8px', color: 'var(--primary-blue)' }}>
                  <FaBriefcase size={18} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 2px 0' }}>Especialidade / Cargo</p>
                  <p style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: 0, fontWeight: '500' }}>{userData.cargo}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', paddingBottom: '10px' }}>
                <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '8px', color: 'var(--primary-blue)' }}>
                  <FaIdBadge size={18} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 2px 0' }}>ID do Sistema</p>
                  <p style={{ fontSize: '1.1rem', color: 'var(--primary-blue)', margin: 0, fontWeight: 'bold', letterSpacing: '1px' }}>#{userData.id}</p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color, #eee)', paddingTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                <button type="button" onClick={handlePasswordToggle} className={styles.btnCancel} style={{ padding: '10px 25px', margin: 0, borderRadius: '20px', fontWeight: 'bold' }}>
                  {isChangingPassword ? 'Cancelar Alteração' : 'Mudar Senha de Acesso'}
                </button>

                {isChangingPassword && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px', width: '100%', animation: 'fadeIn 0.3s' }}>

                    {/* Substituição pelos componentes PasswordInput */}
                    <PasswordInput
                      placeholder="Digite sua senha atual..."
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      style={{ width: '100%', padding: '12px', paddingRight: '40px', borderRadius: '8px', border: '1px solid #ddd', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                      autoFocus
                    />

                    <PasswordInput
                      placeholder="Crie uma nova senha..."
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ width: '100%', padding: '12px', paddingRight: '40px', borderRadius: '8px', border: '2px solid var(--primary-blue)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                    />

                    <button
                      type="button"
                      onClick={handlePasswordConfirm}
                      className={styles.btnConfirm}
                      style={{ width: '100%', padding: '12px' }}
                      disabled={isLoadingPassword}
                    >
                      {isLoadingPassword ? 'Verificando e Salvando...' : 'Confirmar Nova Senha'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}