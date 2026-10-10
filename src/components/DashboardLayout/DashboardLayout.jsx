import { useAuth } from 'react-oidc-context';
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link, useLocation, Outlet } from 'react-router-dom';
import styles from './DashboardLayout.module.css';
// --- MUDANÇA: FaTrello adicionado na lista de importações abaixo ---
import { FaUser, FaTrash, FaChartPie, FaTasks, FaUsers, FaSignOutAlt, FaTimes, FaMoon, FaSun, FaSave, FaKey, FaCamera, FaIdBadge, FaEnvelope, FaBriefcase, FaEdit, FaTrello, FaBuilding, FaBell, FaBars } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { OrganizationContext } from '../../context/OrganizationContext';
import PasswordInput from '../UI/PasswordInput';
import AvatarManager from './AvatarManager';
import { LOGOUT_FLAG_KEY } from '../../auth/keycloakConfig';

export default function DashboardLayout() {
  const auth = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // --- MUDANÇA 1: Adicionado estado para a senha atual ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAvatarManager, setShowAvatarManager] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [invites, setInvites] = useState([]);
  const [showInvitesDropdown, setShowInvitesDropdown] = useState(false);

  const [profileImage, setProfileImage] = useState(null);

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

  
  const fetchInvites = async () => {
    const token = auth?.user?.access_token;
    if (!token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/me/invites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInvites(data);
      }
    } catch (e) { console.error('Erro ao buscar convites', e); }
  };

  
  useEffect(() => {
    const token = auth?.user?.access_token;
    if (!token) return;

    const interval = setInterval(() => {
      fetch(`${import.meta.env.VITE_API_URL}/user/me/invites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => setInvites(data))
      .catch(e => console.error('Erro no polling de convites', e));
    }, 10000);

    return () => clearInterval(interval);
  }, [auth?.user?.access_token]);
  const handleInviteAction = async (inviteId, action) => {
    const token = auth?.user?.access_token;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/me/invites/${inviteId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showNotification(`Convite ${action === 'accept' ? 'aceito' : 'recusado'} com sucesso!`, 'success');
        fetchInvites();
        if (action === 'accept') {
          // fetchOrganizations() caso necessário ou reload
          window.location.reload();
        }
      } else {
        showNotification('Erro ao processar convite', 'error');
      }
    } catch (e) {
      showNotification('Erro interno', 'error');
    }
  };
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
          fetchAndSetAvatar(data.id);
        } else if (response.status === 401 || response.status === 403) {
          handleLogoutConfirm();
        }
      } catch (_error) {
        console.error("Erro", _error);
      }
    };

    buscarDadosDoUsuario();
    fetchInvites();
    
  }, [navigate]);


  
  const fetchAndSetAvatar = async (userId) => {
    const token = auth?.user?.access_token;
    if (!token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/${userId}/avatar`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        setProfileImage(URL.createObjectURL(blob));
      } else {
        setProfileImage(null);
        setShowAvatarManager(false);
      }
    } catch (e) {
      setProfileImage(null);
        setShowAvatarManager(false);
    }
  };

  const handleUploadBlob = async (blob) => {
    const formData = new FormData();
    formData.append('file', blob, 'avatar.jpg');
    const token = auth?.user?.access_token;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/me/avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (response.ok) {
        showNotification("Foto de perfil atualizada!", "save");
        fetchAndSetAvatar(userData.id);
        setShowAvatarManager(false);
      } else {
        showNotification("Erro ao atualizar foto", "error");
      }
    } catch (err) {
      showNotification("Erro ao fazer upload da foto", "error");
    }
  };

  const handleDeletePhoto = async () => {
    const token = auth?.user?.access_token;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/me/avatar`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        showNotification("Foto removida com sucesso!", "save");
        setProfileImage(null);
        setShowAvatarManager(false);
      } else {
        showNotification("Erro ao remover a foto no servidor.", "error");
      }
    } catch (err) {
      showNotification("Erro ao remover foto", "error");
    }
  };

  const handleLogoutConfirm = () => {
    // sinaliza para a landing page exibir o aviso de "você saiu da sua conta"
    sessionStorage.setItem(LOGOUT_FLAG_KEY, '1');
    auth.signoutRedirect();
    
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

  const { organizations, currentOrg, selectOrganization } = useContext(OrganizationContext);

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

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div className={styles.sidebarOverlay} onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>T</div>
          <div className={styles.logoText}>Task <br /> Flow</div>
          <button className={styles.closeSidebarBtn} onClick={() => setIsSidebarOpen(false)}>
            <FaTimes size={20} />
          </button>
        </div>

        <nav className={styles.menu} onClick={() => setIsSidebarOpen(false)}>
          <Link to="/dashboard" className={`${styles.menuItem} ${isActive('/dashboard') ? styles.active : ''}`}>
            <span>Dashboard</span>
            <FaChartPie size={20} />
          </Link>

          <Link to="/organizations" className={`${styles.menuItem} ${isActive('/organizations') ? styles.active : ''}`}>
            <span>Organizações</span>
            <FaBuilding size={20} />
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
        <div className={styles.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button className={styles.hamburger} onClick={() => setIsSidebarOpen(true)}>
              <FaBars />
            </button>
            {location.pathname !== '/organizations' && (
              <div className={styles.orgSelectorWrapper} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaBuilding size={20} color="var(--primary-blue)" className={styles.hideOnMobile} />
                <span style={{
                  padding: '8px 12px',
                  color: 'var(--text-primary, #333)',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}>
                  {currentOrg?.nome || 'Organização Não Selecionada'}
                </span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            
            {/* Bell Notification */}
            <div style={{ position: 'relative', marginRight: '20px', cursor: 'pointer' }}>
              <div onClick={() => setShowInvitesDropdown(!showInvitesDropdown)}>
                <FaBell size={22} color="var(--primary-blue)" />
                {invites.length > 0 && (
                  <div style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                    {invites.length}
                  </div>
                )}
              </div>
              {showInvitesDropdown && (
                <div style={{ position: 'absolute', top: '30px', right: '0', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', width: '250px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 100, padding: '10px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-primary)' }}>Convites Pendentes</h4>
                  {invites.length === 0 ? (
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Nenhum convite.</p>
                  ) : (
                    invites.map(inv => (
                      <div key={inv.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '10px' }}>
                        <p style={{ fontSize: '12px', margin: '0 0 5px 0', color: 'var(--text-primary)' }}><strong>{inv.organizationName}</strong></p>
                        <p style={{ fontSize: '11px', margin: '0 0 10px 0', color: 'var(--text-secondary)' }}>por {inv.inviterName}</p>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button onClick={() => handleInviteAction(inv.id, 'accept')} style={{ flex: 1, background: 'green', color: 'white', border: 'none', borderRadius: '4px', padding: '5px', cursor: 'pointer', fontSize: '11px' }}>Aceitar</button>
                          <button onClick={() => handleInviteAction(inv.id, 'decline')} style={{ flex: 1, background: 'red', color: 'white', border: 'none', borderRadius: '4px', padding: '5px', cursor: 'pointer', fontSize: '11px' }}>Recusar</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className={styles.themeToggle} onClick={toggleTheme} style={{ cursor: 'pointer', marginRight: '20px' }}>
              {theme === 'dark' ? <FaMoon size={22} color="#fff" /> : <FaSun size={22} color="#f59e0b" />}
            </div>

            <div onClick={() => setShowProfileModal(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {userData.nome.split(' ')[0]}
              </span>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fff', overflow: 'hidden', border: '2px solid var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {profileImage ? <img src={profileImage} alt="Nav" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; setProfileImage(null);
          setShowAvatarManager(false); }} /> : <FaUser size={20} color="var(--primary-blue)" />}
              </div>
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
              <div onClick={() => setShowAvatarManager(true)} style={{ cursor: 'pointer', position: 'relative' }}>
                <div className={styles.avatarCircle} style={{ position: 'relative', overflow: 'hidden', width: '90px', height: '90px', borderRadius: '50%', border: '3px solid var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', margin: '0 auto 15px auto' }}>
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; setProfileImage(null);
        setShowAvatarManager(false); }} />
                  ) : (
                    <FaUser size={40} color="var(--primary-blue)" />
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.3s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                    <FaCamera color="#fff" />
                  </div>
                </div>
              </div>
              

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

                <button type="button" onClick={() => window.open(`${import.meta.env.VITE_KEYCLOAK_AUTHORITY}/account/`, '_blank')} className={styles.btnCancel} style={{ padding: '10px 25px', margin: 0, borderRadius: '20px', fontWeight: 'bold', background: 'var(--primary-blue)', color: 'white' }}>
                  Gerenciar Conta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAvatarManager && (
        <AvatarManager
          currentImage={profileImage}
          onClose={() => setShowAvatarManager(false)}
          onUpload={handleUploadBlob}
          onDelete={handleDeletePhoto}
        />
      )}
    </div>
  );
}