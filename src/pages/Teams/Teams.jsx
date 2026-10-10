import { toast } from 'react-toastify';
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { OrganizationContext } from '../../context/OrganizationContext';
import styles from './Equipe.module.css';
import { FaUserCircle, FaEnvelope, FaSearch, FaPlus, FaArrowLeft, FaTimes, FaCog, FaInfoCircle } from 'react-icons/fa';

const translateRole = (role) => {
  switch(role) {
    case 'OWNER': return 'Dono';
    case 'SUB_OWNER': return 'Sub-Dono';
    case 'MANAGER': return 'Gerente';
    case 'MEMBER': return 'Membro';
    default: return role;
  }
};

export default function Equipe() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { currentOrg, refreshOrganizations } = useContext(OrganizationContext);

  const [membros, setMembros] = useState([]);
  const [todosUsuarios, setTodosUsuarios] = useState([]);
  const [busca, setBusca] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isManagingMembers, setIsManagingMembers] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', action: null });

  const [novoMembroEmail, setNovoMembroEmail] = useState('');
  const [novaRole, setNovaRole] = useState('MEMBER');

  const fetchEquipe = async () => {
    if (!currentOrg) {
      setMembros([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = auth?.user?.access_token;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/organization/${currentOrg.id}/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setMembros(await response.json());
      }
    } catch (error) {
      console.error("Erro ao carregar equipe:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodosUsuarios = async () => {
    try {
      const token = auth?.user?.access_token;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setTodosUsuarios(await response.json());
      }
    } catch (error) {
      console.error("Erro", error);
    }
  };

  useEffect(() => {
    fetchEquipe();
    fetchTodosUsuarios();
  }, [currentOrg]);

  const handleAddMember = async () => {
    if (!novoMembroEmail) return toast.error('Informe o email do usuário');
    
    try {
      const token = auth?.user?.access_token;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/organization/${currentOrg.id}/invites`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: novoMembroEmail, role: novaRole })
      });
      
      if (response.ok) {
        setIsAddingMember(false);
        toast.success('Convite enviado com sucesso!');
      } else {
        toast.error('Erro ao convidar membro.');
      }
    } catch (err) {
      toast.error('Erro de rede.');
    }
  };

  const currentUserEmail = auth?.user?.profile?.email;
  const currentUserObj = (Array.isArray(membros) ? membros : []).find(m => m.email === currentUserEmail);

  const membrosFiltrados = (Array.isArray(membros) ? membros : [])
    .filter(membro => 
      (membro.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
      (translateRole(membro.roleNaOrganizacao) || '').toLowerCase().includes(busca.toLowerCase())
    )
    .sort((a, b) => {
      if (a.email === currentUserEmail) return -1;
      if (b.email === currentUserEmail) return 1;
      return 0;
    });



  if (loading) return <div className={styles.loader}>Sincronizando usuários...</div>;
  if (!currentOrg) return <div className={styles.container}><h2 style={{color: 'var(--text-secondary)'}}>Selecione uma organização no menu principal.</h2></div>;

  const handleRemoveMember = async (userId, isSelf) => {
    setConfirmModal({
      isOpen: true,
      title: isSelf ? "Sair da Organização" : "Remover Membro",
      message: isSelf ? "Tem certeza que deseja sair desta organização?" : "Tem certeza que deseja remover este membro?",
      action: async () => {
        try {
          const token = auth?.user?.access_token;
          const response = await fetch(`${import.meta.env.VITE_API_URL}/organization/${currentOrg.id}/members/${userId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            if (isSelf) {
              refreshOrganizations();
              navigate('/dashboard');
            } else {
              fetchEquipe();
            }
          } else {
            toast.error("Você não tem permissão para realizar esta ação.");
          }
        } catch (err) {
          toast.error("Erro de rede.");
        }
      }
    });
  };

  const handleTransferOwnership = async (userId) => {
    setConfirmModal({
      isOpen: true,
      title: "Transferir Posse",
      message: "Atenção! Ao transferir a posse, você deixará de ser o Dono desta organização e passará a ser Sub-Dono. Deseja continuar?",
      action: async () => {
        try {
          const token = auth?.user?.access_token;
          const response = await fetch(`${import.meta.env.VITE_API_URL}/organization/${currentOrg.id}/members/${userId}/transfer-ownership`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            toast.success("Posse transferida com sucesso!");
            fetchEquipe();
            refreshOrganizations();
          } else {
            toast.error("Erro ao transferir a posse.");
          }
        } catch (err) {
          toast.error("Erro de rede.");
        }
      }
    });
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const token = auth?.user?.access_token;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/organization/${currentOrg.id}/members/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      if (response.ok) {
        toast.success('Papel atualizado com sucesso!');
        fetchEquipe();
      } else {
        toast.error('Erro ao atualizar papel do usuário.');
      }
    } catch (err) {
      toast.error('Erro de rede.');
    }
  };

  const currentUserRole = (Array.isArray(membros) ? membros : []).find(m => m.email === auth?.user?.profile?.email)?.roleNaOrganizacao;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>
            Membros da Organização
          </h1>
          <p className={styles.subtitle}>
            Gerencie os acessos de "{currentOrg.nome}".
          </p>
        </div>

        <div className={styles.headerActions}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {(currentUserRole === 'OWNER' || currentUserRole === 'SUB_OWNER' || currentUserRole === 'MANAGER') && (
                <button className={styles.createTeamBtn} onClick={() => setIsAddingMember(true)} style={{ whiteSpace: 'nowrap' }}>
                  <FaPlus style={{ marginRight: '5px' }} /> Convidar Membro
                </button>
              )}
              {(currentUserRole === 'OWNER' || currentUserRole === 'SUB_OWNER') && (
                <button className={styles.createTeamBtn} onClick={() => setIsManagingMembers(true)} style={{ whiteSpace: 'nowrap', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                  <FaCog style={{ marginRight: '5px' }} /> Gerenciar Membros
                </button>
              )}
              {currentUserRole === 'OWNER' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 15px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  <FaInfoCircle size={15} style={{ flexShrink: 0 }} />
                  <span>Transfira a posse para sair.</span>
                </div>
              ) : currentUserObj ? (
                <button 
                  onClick={() => handleRemoveMember(currentUserObj.id, true)}
                  style={{ padding: '8px 15px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', whiteSpace: 'nowrap', alignSelf: 'center' }}
                >
                  Sair da Organização
                </button>
              ) : null}
            </div>

            <div className={styles.searchWrapper}>
              <FaSearch className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Buscar por nome ou papel..." 
                className={styles.searchInput}
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
        </div>
      </header>

      <div className={styles.grid}>
        {membrosFiltrados.length > 0 ? (
          membrosFiltrados.map(membro => (
            <div key={membro.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <FaUserCircle className={styles.avatar} />
                <div style={{ marginTop: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary-blue)', fontSize: '0.9rem', backgroundColor: 'var(--bg-app)', padding: '4px 12px', borderRadius: '15px' }}>
                    {translateRole(membro.roleNaOrganizacao)}
                  </span>
                  {membro.email === currentUserEmail && (
                    <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--success-color, #10b981)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                      Você
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.info}>
                <h3 className={styles.nome}>{membro.nome}</h3>
              </div>
              <div className={styles.details}>
                <div className={styles.detailItem}>
                  <FaEnvelope className={styles.icon} />
                  <span>{membro.email}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noResult}>Nenhum integrante encontrado.</p>
        )}
      </div>

      {isAddingMember && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Convidar Membro</h3>
              <FaTimes onClick={() => setIsAddingMember(false)} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>E-mail do Usuário</label>
              <input 
                type="email"
                placeholder="exemplo@email.com"
                value={novoMembroEmail} 
                onChange={e => setNovoMembroEmail(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-primary)' }}
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Papel (Role)</label>
              <select 
                value={novaRole} 
                onChange={e => setNovaRole(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-primary)' }}
              >
                <option value="MEMBER">Membro (Padrão)</option>
                <option value="MANAGER">Gerente</option>
                <option value="SUB_OWNER">Sub-Dono</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsAddingMember(false)} style={{ padding: '10px 15px', border: 'none', background: '#6b7280', borderRadius: '8px', cursor: 'pointer', color: 'white' }}>
                Cancelar
              </button>
              <button onClick={handleAddMember} style={{ padding: '10px 15px', border: 'none', background: 'var(--primary-blue)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {isManagingMembers && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Gerenciar Membros</h3>
              <FaTimes onClick={() => setIsManagingMembers(false)} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} />
            </div>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {membros.map(membro => (
                <div key={membro.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{membro.nome}</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{membro.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {membro.roleNaOrganizacao === 'OWNER' ? (
                        <span style={{ fontWeight: 'bold', color: 'var(--primary-blue)', fontSize: '0.9rem', backgroundColor: 'var(--bg-app)', padding: '4px 12px', borderRadius: '15px' }}>Dono</span>
                    ) : (
                      <>
                        <select 
                          value={membro.roleNaOrganizacao} 
                          onChange={e => handleUpdateRole(membro.id, e.target.value)}
                          style={{ height: '32px', padding: '0 5px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: '0.85rem', boxSizing: 'border-box' }}
                        >
                          <option value="MEMBER">Membro</option>
                          <option value="MANAGER">Gerente</option>
                          <option value="SUB_OWNER">Sub-Dono</option>
                        </select>
                        
                        {currentUserRole === 'OWNER' && membro.roleNaOrganizacao === 'SUB_OWNER' && (
                          <button 
                            onClick={() => handleTransferOwnership(membro.id)}
                            style={{ height: '32px', padding: '0 10px', background: '#f59e0b', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap', boxSizing: 'border-box', display: 'flex', alignItems: 'center' }}
                            title="Tornar Dono"
                          >
                            Tornar Dono
                          </button>
                        )}
                        <button 
                          onClick={() => handleRemoveMember(membro.id, false)}
                          style={{ height: '32px', padding: '0 10px', background: '#dc2626', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap', boxSizing: 'border-box', display: 'flex', alignItems: 'center' }}
                        >
                          Remover
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setIsManagingMembers(false)} style={{ padding: '10px 15px', border: 'none', background: '#6b7280', borderRadius: '8px', cursor: 'pointer', color: 'white' }}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ margin: '0 0 15px 0', color: 'var(--text-primary)' }}>{confirmModal.title}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '25px', lineHeight: '1.5' }}>{confirmModal.message}</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setConfirmModal({ isOpen: false, title: '', message: '', action: null })} 
                style={{ padding: '10px 15px', border: 'none', background: '#6b7280', borderRadius: '8px', cursor: 'pointer', color: 'white' }}
              >
                Cancelar
              </button>
              <button 
                onClick={async () => {
                  if (confirmModal.action) await confirmModal.action();
                  setConfirmModal({ isOpen: false, title: '', message: '', action: null });
                }} 
                style={{ padding: '10px 15px', border: 'none', background: 'var(--primary-blue)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}