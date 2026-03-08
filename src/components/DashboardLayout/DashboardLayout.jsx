import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import styles from './DashboardLayout.module.css';
import { FaChartPie, FaTasks, FaUsers, FaSignOutAlt, FaTimes, FaMoon, FaSun, FaSave, FaKey, FaCamera } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

export default function DashboardLayout({ children }) {

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  

  const [profileImage, setProfileImage] = useState(localStorage.getItem('user_photo') || null);
  
  const { theme, toggleTheme } = useTheme(); 
  const navigate = useNavigate();
  const location = useLocation(); 

  const [userData, setUserData] = useState({
    nome: "Wanderlay Silva Neto",
    email: "wanderlay@exemplo.com",
    telefone: "(62) 99999-9999",
    id: "2310078"
  });


  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showNotification = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };


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
    setShowLogoutModal(false);
    navigate('/');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    showNotification("Alterações salvas com sucesso!", "save");
    setShowProfileModal(false);
  };

  const handlePasswordToggle = () => {
    setIsChangingPassword(!isChangingPassword);
  };

  const handlePasswordConfirm = () => {
    if (newPassword.trim() !== "") {
      showNotification("Senha atualizada com segurança!", "password");
      setIsChangingPassword(false);
      setNewPassword('');
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
          <Link to="/tasks" className={`${styles.menuItem} ${isActive('/tasks') ? styles.active : ''}`}>
            <span>Tarefas</span>
            <FaTasks size={20} />
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

        {children}
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
          <div className={styles.modalBox}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <FaTimes onClick={() => { setShowProfileModal(false); setIsChangingPassword(false); }} style={{ cursor: 'pointer' }} />
            </div>
            
            <div className={styles.profileHeader}>
              <label htmlFor="avatar-upload" style={{ cursor: 'pointer', position: 'relative' }}>
                <div className={styles.avatarCircle} style={{ position: 'relative', overflow: 'hidden', width: '80px', height: '80px', borderRadius: '50%', border: '3px solid var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <FaCamera size={24} color="#ccc" />
                  )}
               
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.3s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                    <FaCamera color="#fff" />
                  </div>
                </div>
              </label>
              <input id="avatar-upload" type="file" accept="image/*" hidden onChange={handlePhotoChange} />
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>{userData.nome}</h2>
            </div>

            <form className={styles.profileForm} onSubmit={handleSaveProfile}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'left' }}>
                <label style={{ color: 'var(--text-primary)' }}>Email</label>
                <input 
                  type="email" 
                  value={userData.email} 
                  onChange={(e) => setUserData({...userData, email: e.target.value})}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'left', marginTop: '10px' }}>
                <label style={{ color: 'var(--text-primary)' }}>Telefone</label>
                <input 
                  type="text" 
                  value={userData.telefone} 
                  onChange={(e) => setUserData({...userData, telefone: e.target.value})}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', marginTop: '15px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'left' }}>
                  <label style={{ color: 'var(--text-primary)' }}>ID de Usuário</label>
                  <input type="text" value={userData.id} readOnly style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#f9f9f9', color: '#666' }} />
                </div>
                <button type="button" onClick={handlePasswordToggle} className={styles.btnCancel} style={{ height: '42px', padding: '0 15px' }}>
                  {isChangingPassword ? 'Cancelar' : 'Trocar senha'}
                </button>
              </div>

              {isChangingPassword && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', animation: 'fadeIn 0.3s' }}>
                  <input 
                    type="password" 
                    placeholder="Nova senha" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '2px solid var(--primary-blue)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                    autoFocus
                  />
                  <button type="button" onClick={handlePasswordConfirm} className={styles.btnConfirm} style={{ width: 'auto', padding: '0 15px' }}>
                    Confirmar
                  </button>
                </div>
              )}
              
              <button type="submit" className={styles.btnConfirm} style={{ marginTop: '25px', width: '100%' }}>
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}