import { toast } from 'react-toastify';
import React, { useContext, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { OrganizationContext } from '../../context/OrganizationContext';
import styles from './Organizations.module.css';
import { FaBuilding, FaPlus, FaCog, FaTimes } from 'react-icons/fa';

const translateRole = (role) => {
  switch(role) {
    case 'OWNER': return 'Dono';
    case 'SUB_OWNER': return 'Sub-Dono';
    case 'MANAGER': return 'Gerente';
    case 'MEMBER': return 'Membro';
    default: return role;
  }
};

export default function Organizations() {
  const auth = useAuth();
  const { organizations, refreshOrganizations, currentOrg, selectOrganization } = useContext(OrganizationContext);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [newOrgName, setNewOrgName] = useState('');
  const [membersCanCreateTasks, setMembersCanCreateTasks] = useState(true);
  const [membersCanDeleteTasks, setMembersCanDeleteTasks] = useState(false);
  const [membersCanChangeDeadlines, setMembersCanChangeDeadlines] = useState(false);
  const [membersCanReturnTasks, setMembersCanReturnTasks] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');
  
  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState('geral');
  const [editOrgName, setEditOrgName] = useState('');
  const [orgToEdit, setOrgToEdit] = useState(null);
  
  const [editMembersCanCreateTasks, setEditMembersCanCreateTasks] = useState(true);
  const [editMembersCanDeleteTasks, setEditMembersCanDeleteTasks] = useState(false);
  const [editMembersCanChangeDeadlines, setEditMembersCanChangeDeadlines] = useState(false);
  const [editMembersCanReturnTasks, setEditMembersCanReturnTasks] = useState(false);

  const [membros, setMembros] = useState([]);
  const [novoMembroEmail, setNovoMembroEmail] = useState('');
  const [novaRole, setNovaRole] = useState('MEMBER');

  const fetchMembros = async (orgId) => {
    try {
      const token = auth?.user?.access_token;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/organization/${orgId}/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setMembros(await response.json());
      }
    } catch (error) {
      console.error("Erro ao carregar equipe:", error);
    }
  };

  const openEditModal = (org) => {
    setOrgToEdit(org);
    setEditOrgName(org.nome);
    setEditMembersCanCreateTasks(org.membersCanCreateTasks !== false);
    setEditMembersCanDeleteTasks(org.membersCanDeleteTasks === true);
    setEditMembersCanChangeDeadlines(org.membersCanChangeDeadlines === true);
    setEditMembersCanReturnTasks(org.membersCanReturnTasks === true);
    setActiveModalTab('geral');
    setIsEditingOrg(true);
    fetchMembros(org.id);
  };

  const handleEditOrg = async () => {
    if (!editOrgName.trim() || !orgToEdit) return;

    try {
      const token = auth?.user?.access_token;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/organization/${orgToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          nome: editOrgName,
          membersCanCreateTasks: editMembersCanCreateTasks,
          membersCanDeleteTasks: editMembersCanDeleteTasks,
          membersCanChangeDeadlines: editMembersCanChangeDeadlines,
          membersCanReturnTasks: editMembersCanReturnTasks
        })
      });
      
      if (response.ok) {
        setIsEditingOrg(false);
        setOrgToEdit(null);
        toast.success('Organização atualizada com sucesso!');
        refreshOrganizations();
      } else {
        toast.error('Erro ao atualizar organização. Verifique se você tem permissão.');
      }
    } catch (err) {
      toast.error('Erro de rede.');
    }
  };

  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);

  const handleDeleteOrganization = async () => {
    try {
      const token = auth?.user?.access_token;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/organization/${orgToEdit.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        toast.success("Organização excluída com sucesso!");
        setIsEditingOrg(false);
        setConfirmDeleteModal(false);
        setOrgToEdit(null);
        refreshOrganizations();
      } else {
        toast.error("Erro ao excluir organização. Apenas o OWNER pode realizar esta ação.");
        setConfirmDeleteModal(false);
      }
    } catch (err) {
      toast.error("Erro de rede.");
      setConfirmDeleteModal(false);
    }
  };

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) return;
    const token = auth?.user?.access_token;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/organization`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          nome: newOrgName,
          membersCanCreateTasks,
          membersCanDeleteTasks,
          membersCanChangeDeadlines,
          membersCanReturnTasks
        })
      });
      
      if (response.ok) {
        const createdOrg = await response.json();

        // Enviar convites por email
        if (inviteEmails.trim()) {
           const emails = inviteEmails.split(',').map(e => e.trim()).filter(e => e);
           for (let email of emails) {
              await fetch(`${import.meta.env.VITE_API_URL}/organization/${createdOrg.id}/members`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, role: 'MEMBER' })
              });
           }
        }

        setNewOrgName('');
        setInviteEmails('');
        setShowCreateModal(false);
        refreshOrganizations();
      } else {
        toast.error('Erro ao criar organização');
      }
    } catch (err) {
      toast.error('Erro de comunicação com servidor');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Minhas Organizações</h1>
        <button className={styles.btnPrimary} onClick={() => setShowCreateModal(true)}>
          <FaPlus /> Nova Organização
        </button>
      </div>
      
      <div className={styles.grid}>
        {[...organizations].sort((a, b) => {
          if (currentOrg?.id === a.id) return -1;
          if (currentOrg?.id === b.id) return 1;
          return 0;
        }).map(org => (
          <div key={org.id} className={`${styles.card} ${currentOrg?.id === org.id ? styles.activeCard : ''}`}>
            <div className={styles.cardHeader}>
              <FaBuilding size={24} color="var(--primary-blue)" />
              <h2 className={styles.orgName}>{org.nome}</h2>
            </div>
            
            <div className={styles.cardBody}>
              <p className={styles.roleInfo}>
                Seu Papel: <strong>{translateRole(org.myRole) || 'Dono'}</strong>
              </p>
              
              <div className={styles.actions} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(org.myRole === 'OWNER' || org.myRole === 'SUB_OWNER') && (
                  <button className={styles.btnSecondary} onClick={() => openEditModal(org)}>
                    <FaCog style={{marginRight: '5px'}}/> Configurar
                  </button>
                )}
                {currentOrg?.id === org.id ? (
                  <button className={styles.btnSecondary} style={{ backgroundColor: '#10b981', color: '#fff', borderColor: '#10b981', cursor: 'default' }}>
                    Selecionada
                  </button>
                ) : (
                  <button className={styles.btnSecondary} onClick={() => {
                    selectOrganization(org.id);
                    toast.success(`Organização ${org.nome} selecionada como ativa.`);
                  }}>
                    Selecionar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {organizations.length === 0 && (
          <div className={styles.emptyState}>
            <p>Você ainda não pertence a nenhuma organização.</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox} style={{maxWidth: '500px'}}>
            <h3>Criar e Configurar Organização</h3>
            
            <div className={styles.inputGroup} style={{marginBottom: '15px'}}>
              <label>Nome da Organização</label>
              <input 
                type="text" 
                value={newOrgName} 
                onChange={e => setNewOrgName(e.target.value)} 
                placeholder="Ex: Minha Empresa"
                className={styles.input}
              />
            </div>

            <div style={{marginBottom: '15px'}}>
              <strong style={{display: 'block', marginBottom: '10px'}}>Configurações de Permissões:</strong>
              
              <label style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px'}}>
                <input type="checkbox" className="customCheckbox" checked={membersCanCreateTasks} onChange={e => setMembersCanCreateTasks(e.target.checked)} />
                Membros podem criar tarefas
              </label>
              
              <label style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px'}}>
                <input type="checkbox" className="customCheckbox" checked={membersCanDeleteTasks} onChange={e => setMembersCanDeleteTasks(e.target.checked)} />
                Membros podem deletar tarefas
              </label>

              <label style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px'}}>
                <input type="checkbox" className="customCheckbox" checked={membersCanChangeDeadlines} onChange={e => setMembersCanChangeDeadlines(e.target.checked)} />
                Membros podem alterar prazos
              </label>

              <label style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px'}}>
                <input type="checkbox" className="customCheckbox" checked={membersCanReturnTasks} onChange={e => setMembersCanReturnTasks(e.target.checked)} />
                Membros podem retornar status de tarefas
              </label>
            </div>

            <div className={styles.inputGroup} style={{marginBottom: '20px'}}>
              <label>Convidar Membros por Email (separados por vírgula)</label>
              <input 
                type="text" 
                value={inviteEmails} 
                onChange={e => setInviteEmails(e.target.value)} 
                placeholder="exemplo1@email.com, exemplo2@email.com"
                className={styles.input}
              />
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setShowCreateModal(false)}>Cancelar</button>
              <button className={styles.btnConfirm} onClick={handleCreateOrganization}>Criar e Salvar</button>
            </div>
          </div>
        </div>
      )}
    {isEditingOrg && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Configurar Organização</h3>
              <FaTimes onClick={() => setIsEditingOrg(false)} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Nome da Organização</label>
              <input 
                type="text" 
                value={editOrgName} 
                onChange={e => setEditOrgName(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-primary)' }}
              />
            </div>

            <div style={{marginBottom: '25px'}}>
              <strong style={{display: 'block', marginBottom: '10px', color: 'var(--text-primary)'}}>Permissões de Membros:</strong>
              
              <label style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', color: 'var(--text-secondary)'}}>
                <input type="checkbox" className="customCheckbox" checked={editMembersCanCreateTasks} onChange={e => setEditMembersCanCreateTasks(e.target.checked)} />
                Membros podem criar tarefas
              </label>
              
              <label style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', color: 'var(--text-secondary)'}}>
                <input type="checkbox" className="customCheckbox" checked={editMembersCanDeleteTasks} onChange={e => setEditMembersCanDeleteTasks(e.target.checked)} />
                Membros podem deletar tarefas
              </label>

              <label style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', color: 'var(--text-secondary)'}}>
                <input type="checkbox" className="customCheckbox" checked={editMembersCanChangeDeadlines} onChange={e => setEditMembersCanChangeDeadlines(e.target.checked)} />
                Membros podem alterar prazos
              </label>

              <label style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: 'var(--text-secondary)'}}>
                <input type="checkbox" className="customCheckbox" checked={editMembersCanReturnTasks} onChange={e => setEditMembersCanReturnTasks(e.target.checked)} />
                Membros podem retornar status de tarefas
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                {orgToEdit?.myRole === 'OWNER' && (
                  <button onClick={() => setConfirmDeleteModal(true)} style={{ padding: '10px 15px', border: 'none', background: '#dc2626', borderRadius: '8px', cursor: 'pointer', color: 'white', fontWeight: 'bold' }}>
                    Excluir Organização
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setIsEditingOrg(false)} style={{ padding: '10px 15px', border: 'none', background: '#6b7280', borderRadius: '8px', cursor: 'pointer', color: 'white' }}>
                  Cancelar
                </button>
                <button onClick={handleEditOrg} style={{ padding: '10px 15px', border: 'none', background: '#10b981', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Salvar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {confirmDeleteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ margin: '0 0 15px 0', color: 'var(--text-primary)' }}>Excluir Organização</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '25px', lineHeight: '1.5' }}>
              Tem certeza que deseja excluir a organização <strong>{orgToEdit?.nome}</strong> permanentemente? Esta ação não poderá ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setConfirmDeleteModal(false)} 
                style={{ padding: '10px 15px', border: 'none', background: '#6b7280', borderRadius: '8px', cursor: 'pointer', color: 'white' }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteOrganization} 
                style={{ padding: '10px 15px', border: 'none', background: '#dc2626', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
