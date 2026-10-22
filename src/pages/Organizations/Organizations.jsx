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
  const [membersCanDeleteOwnTasks, setMembersCanDeleteOwnTasks] = useState(false);
  const [membersCanEditAllTasks, setMembersCanEditAllTasks] = useState(false);
  const [membersCanEditOwnOrAssignedTasks, setMembersCanEditOwnOrAssignedTasks] = useState(true);
  const [membersCanMoveAllTasks, setMembersCanMoveAllTasks] = useState(false);
  const [membersCanMoveOwnOrAssignedTasks, setMembersCanMoveOwnOrAssignedTasks] = useState(true);
  const [membersCanChangeDeadlines, setMembersCanChangeDeadlines] = useState(false);
  const [membersCanReturnTasks, setMembersCanReturnTasks] = useState(false);
  const [deletedTasksRetentionDays, setDeletedTasksRetentionDays] = useState(7);
  const [inviteEmails, setInviteEmails] = useState('');
  
  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [editOrgName, setEditOrgName] = useState('');
  const [orgToEdit, setOrgToEdit] = useState(null);
  
  const [editMembersCanCreateTasks, setEditMembersCanCreateTasks] = useState(true);
  const [editMembersCanDeleteTasks, setEditMembersCanDeleteTasks] = useState(false);
  const [editMembersCanDeleteOwnTasks, setEditMembersCanDeleteOwnTasks] = useState(false);
  const [editMembersCanEditAllTasks, setEditMembersCanEditAllTasks] = useState(false);
  const [editMembersCanEditOwnOrAssignedTasks, setEditMembersCanEditOwnOrAssignedTasks] = useState(true);
  const [editMembersCanMoveAllTasks, setEditMembersCanMoveAllTasks] = useState(false);
  const [editMembersCanMoveOwnOrAssignedTasks, setEditMembersCanMoveOwnOrAssignedTasks] = useState(true);
  const [editMembersCanChangeDeadlines, setEditMembersCanChangeDeadlines] = useState(false);
  const [editMembersCanReturnTasks, setEditMembersCanReturnTasks] = useState(false);
  const [editDeletedTasksRetentionDays, setEditDeletedTasksRetentionDays] = useState(7);

  // --- Handlers de exclusividade mútua para o Modal de Criação ---
  const handleToggleCreateTasksNew = (checked) => {
    setMembersCanCreateTasks(checked);
    if (!checked) {
      setMembersCanDeleteOwnTasks(false);
    }
  };

  const handleToggleDeleteOwnNew = (checked) => {
    if (!membersCanCreateTasks) return;
    setMembersCanDeleteOwnTasks(checked);
    if (checked) {
      setMembersCanDeleteTasks(false);
    }
  };

  const handleToggleDeleteAllNew = (checked) => {
    setMembersCanDeleteTasks(checked);
    if (checked) {
      setMembersCanDeleteOwnTasks(false);
    }
  };

  const handleToggleEditOwnOrAssignedNew = (checked) => {
    setMembersCanEditOwnOrAssignedTasks(checked);
    if (checked) {
      setMembersCanEditAllTasks(false);
    }
  };

  const handleToggleEditAllNew = (checked) => {
    setMembersCanEditAllTasks(checked);
    if (checked) {
      setMembersCanEditOwnOrAssignedTasks(false);
    }
  };

  const handleToggleMoveOwnOrAssignedNew = (checked) => {
    setMembersCanMoveOwnOrAssignedTasks(checked);
    if (checked) {
      setMembersCanMoveAllTasks(false);
    } else if (!membersCanMoveAllTasks) {
      setMembersCanReturnTasks(false);
    }
  };

  const handleToggleMoveAllNew = (checked) => {
    setMembersCanMoveAllTasks(checked);
    if (checked) {
      setMembersCanMoveOwnOrAssignedTasks(false);
    } else if (!membersCanMoveOwnOrAssignedTasks) {
      setMembersCanReturnTasks(false);
    }
  };

  const handleToggleReturnTasksNew = (checked) => {
    if (!membersCanMoveOwnOrAssignedTasks && !membersCanMoveAllTasks) return;
    setMembersCanReturnTasks(checked);
  };

  // --- Handlers de exclusividade mútua para o Modal de Edição ---
  const handleToggleCreateTasksEdit = (checked) => {
    setEditMembersCanCreateTasks(checked);
    if (!checked) {
      setEditMembersCanDeleteOwnTasks(false);
    }
  };

  const handleToggleDeleteOwnEdit = (checked) => {
    if (!editMembersCanCreateTasks) return;
    setEditMembersCanDeleteOwnTasks(checked);
    if (checked) {
      setEditMembersCanDeleteTasks(false);
    }
  };

  const handleToggleDeleteAllEdit = (checked) => {
    setEditMembersCanDeleteTasks(checked);
    if (checked) {
      setEditMembersCanDeleteOwnTasks(false);
    }
  };

  const handleToggleEditOwnOrAssignedEdit = (checked) => {
    setEditMembersCanEditOwnOrAssignedTasks(checked);
    if (checked) {
      setEditMembersCanEditAllTasks(false);
    }
  };

  const handleToggleEditAllEdit = (checked) => {
    setEditMembersCanEditAllTasks(checked);
    if (checked) {
      setEditMembersCanEditOwnOrAssignedTasks(false);
    }
  };

  const handleToggleMoveOwnOrAssignedEdit = (checked) => {
    setEditMembersCanMoveOwnOrAssignedTasks(checked);
    if (checked) {
      setEditMembersCanMoveAllTasks(false);
    } else if (!editMembersCanMoveAllTasks) {
      setEditMembersCanReturnTasks(false);
    }
  };

  const handleToggleMoveAllEdit = (checked) => {
    setEditMembersCanMoveAllTasks(checked);
    if (checked) {
      setEditMembersCanMoveOwnOrAssignedTasks(false);
    } else if (!editMembersCanMoveOwnOrAssignedTasks) {
      setEditMembersCanReturnTasks(false);
    }
  };

  const handleToggleReturnTasksEdit = (checked) => {
    if (!editMembersCanMoveOwnOrAssignedTasks && !editMembersCanMoveAllTasks) return;
    setEditMembersCanReturnTasks(checked);
  };

  const openEditModal = (org) => {
    setOrgToEdit(org);
    setEditOrgName(org.nome);
    const canCreate = org.membersCanCreateTasks !== false;
    const canDeleteAll = org.membersCanDeleteTasks === true;
    const canDeleteOwn = canCreate && !canDeleteAll && org.membersCanDeleteOwnTasks === true;

    const canEditAll = org.membersCanEditAllTasks === true;
    const canEditOwnOrAssigned = !canEditAll && (org.membersCanEditOwnOrAssignedTasks !== false);

    const canMoveAll = org.membersCanMoveAllTasks === true;
    const canMoveOwnOrAssigned = !canMoveAll && (org.membersCanMoveOwnOrAssignedTasks !== false);
    const anyMove = canMoveAll || canMoveOwnOrAssigned;

    setEditMembersCanCreateTasks(canCreate);
    setEditMembersCanDeleteTasks(canDeleteAll);
    setEditMembersCanDeleteOwnTasks(canDeleteOwn);
    setEditMembersCanEditAllTasks(canEditAll);
    setEditMembersCanEditOwnOrAssignedTasks(canEditOwnOrAssigned);
    setEditMembersCanMoveAllTasks(canMoveAll);
    setEditMembersCanMoveOwnOrAssignedTasks(canMoveOwnOrAssigned);
    setEditMembersCanChangeDeadlines(org.membersCanChangeDeadlines === true);
    setEditMembersCanReturnTasks(anyMove && org.membersCanReturnTasks === true);
    setEditDeletedTasksRetentionDays(
      org.deletedTasksRetentionDays !== undefined && org.deletedTasksRetentionDays !== null
        ? Number(org.deletedTasksRetentionDays)
        : 0
    );
    setIsEditingOrg(true);
  };

  const handleEditOrg = async () => {
    if (!editOrgName.trim() || !orgToEdit) return;

    try {
      const token = auth?.user?.access_token;
      const anyEditMove = editMembersCanMoveAllTasks || editMembersCanMoveOwnOrAssignedTasks;
      const payload = {
        nome: editOrgName,
        membersCanCreateTasks: editMembersCanCreateTasks,
        membersCanDeleteTasks: editMembersCanDeleteTasks,
        membersCanDeleteOwnTasks: editMembersCanCreateTasks ? editMembersCanDeleteOwnTasks : false,
        membersCanEditAllTasks: editMembersCanEditAllTasks,
        membersCanEditOwnOrAssignedTasks: editMembersCanEditAllTasks ? false : editMembersCanEditOwnOrAssignedTasks,
        membersCanMoveAllTasks: editMembersCanMoveAllTasks,
        membersCanMoveOwnOrAssignedTasks: editMembersCanMoveAllTasks ? false : editMembersCanMoveOwnOrAssignedTasks,
        membersCanChangeDeadlines: editMembersCanChangeDeadlines,
        membersCanReturnTasks: anyEditMove ? editMembersCanReturnTasks : false
      };

      if (orgToEdit.myRole === 'OWNER') {
        payload.deletedTasksRetentionDays = Number(editDeletedTasksRetentionDays);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/organization/${orgToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setIsEditingOrg(false);
        setOrgToEdit(null);
        toast.success('Organização atualizada com sucesso!');
        refreshOrganizations();
      } else {
        const err = await response.json().catch(() => null);
        toast.error(err?.message || 'Erro ao atualizar organização. Verifique se você tem permissão.');
      }
    } catch (_err) {
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
    } catch (_err) {
      toast.error("Erro de rede.");
      setConfirmDeleteModal(false);
    }
  };

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) return;
    const token = auth?.user?.access_token;
    const anyNewMove = membersCanMoveAllTasks || membersCanMoveOwnOrAssignedTasks;
    
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
          membersCanDeleteOwnTasks: membersCanCreateTasks ? membersCanDeleteOwnTasks : false,
          membersCanEditAllTasks,
          membersCanEditOwnOrAssignedTasks: membersCanEditAllTasks ? false : membersCanEditOwnOrAssignedTasks,
          membersCanMoveAllTasks,
          membersCanMoveOwnOrAssignedTasks: membersCanMoveAllTasks ? false : membersCanMoveOwnOrAssignedTasks,
          membersCanChangeDeadlines,
          membersCanReturnTasks: anyNewMove ? membersCanReturnTasks : false,
          deletedTasksRetentionDays: Number(deletedTasksRetentionDays)
        })
      });
      
      if (response.ok) {
        const createdOrg = await response.json();

        // Enviar convites por email através do subsistema oficial de convites
        if (inviteEmails.trim()) {
           const emails = inviteEmails.split(',').map(e => e.trim()).filter(e => e);
           for (let email of emails) {
              await fetch(`${import.meta.env.VITE_API_URL}/organization/${createdOrg.id}/invites`, {
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
        const err = await response.json().catch(() => null);
        toast.error(err?.message || 'Erro ao criar organização');
      }
    } catch (_err) {
      toast.error('Erro de comunicação com servidor');
    }
  };

  // Trava visual para o Modal de Criação
  const disableNewDeleteOwn = !membersCanCreateTasks || membersCanDeleteTasks;
  const disableNewDeleteAll = membersCanDeleteOwnTasks;
  const disableNewEditOwn = membersCanEditAllTasks;
  const disableNewEditAll = membersCanEditOwnOrAssignedTasks;
  const disableNewMoveOwn = membersCanMoveAllTasks;
  const disableNewMoveAll = membersCanMoveOwnOrAssignedTasks;
  const disableNewReturn = !membersCanMoveOwnOrAssignedTasks && !membersCanMoveAllTasks;

  // Trava visual para o Modal de Edição
  const disableEditDeleteOwn = !editMembersCanCreateTasks || editMembersCanDeleteTasks;
  const disableEditDeleteAll = editMembersCanDeleteOwnTasks;
  const disableEditEditOwn = editMembersCanEditAllTasks;
  const disableEditEditAll = editMembersCanEditOwnOrAssignedTasks;
  const disableEditMoveOwn = editMembersCanMoveAllTasks;
  const disableEditMoveAll = editMembersCanMoveOwnOrAssignedTasks;
  const disableEditReturn = !editMembersCanMoveOwnOrAssignedTasks && !editMembersCanMoveAllTasks;

  const sectionBoxStyle = {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-app)',
    marginBottom: '12px'
  };

  const sectionTitleStyle = {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '4px'
  };

  const sectionHintStyle = {
    display: 'block',
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
    marginBottom: '10px',
    lineHeight: 1.4
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
          <div className={styles.modalBox} style={{maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto'}}>
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
              <strong style={{display: 'block', marginBottom: '4px', color: 'var(--text-primary)'}}>
                Governança de Permissões (Aplicável ao Cargo Membro)
              </strong>
              <span style={{display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px'}}>
                Estas regras limitam apenas usuários com cargo <strong>Membro</strong>. Gerentes, Sub-Donos e o Dono possuem permissão total de edição, movimentação e exclusão.
              </span>

              {/* 1. Criação e Prazos */}
              <div style={sectionBoxStyle}>
                <span style={sectionTitleStyle}>1. Criação e Prazos de Entrega</span>
                <span style={sectionHintStyle}>
                  Defina se os membros podem cadastrar novas tarefas na organização e se podem definir ou alterar datas limite.
                </span>
                <label style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer'}}>
                  <input
                    type="checkbox"
                    className="customCheckbox"
                    checked={membersCanCreateTasks}
                    onChange={e => handleToggleCreateTasksNew(e.target.checked)}
                  />
                  Membros podem criar tarefas
                </label>

                <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                  <input
                    type="checkbox"
                    className="customCheckbox"
                    checked={membersCanChangeDeadlines}
                    onChange={e => setMembersCanChangeDeadlines(e.target.checked)}
                  />
                  Membros podem alterar prazos de entrega
                </label>
              </div>

              {/* 2. Edição de Tarefas */}
              <div style={sectionBoxStyle}>
                <span style={sectionTitleStyle}>2. Edição de Tarefas (Aba Editar Tarefa)</span>
                <span style={sectionHintStyle}>
                  Escolha se os membros podem alterar apenas tarefas que criaram/nas quais estão como responsáveis ou qualquer tarefa da organização. Ativar uma opção bloqueia automaticamente a outra.
                </span>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    opacity: disableNewEditOwn ? 0.5 : 1,
                    cursor: disableNewEditOwn ? 'not-allowed' : 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    className="customCheckbox"
                    checked={membersCanEditOwnOrAssignedTasks}
                    disabled={disableNewEditOwn}
                    onChange={e => handleToggleEditOwnOrAssignedNew(e.target.checked)}
                  />
                  Membros podem alterar apenas tarefas que criaram ou nas quais sejam responsáveis
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: disableNewEditAll ? 0.5 : 1,
                    cursor: disableNewEditAll ? 'not-allowed' : 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    className="customCheckbox"
                    checked={membersCanEditAllTasks}
                    disabled={disableNewEditAll}
                    onChange={e => handleToggleEditAllNew(e.target.checked)}
                  />
                  Membros podem alterar todas as tarefas
                </label>
              </div>

              {/* 3. Movimentação e Retorno */}
              <div style={sectionBoxStyle}>
                <span style={sectionTitleStyle}>3. Movimentação no Kanban e Retorno de Status</span>
                <span style={sectionHintStyle}>
                  Defina quais tarefas os membros podem mover entre colunas. A opção de retornar tarefas concluídas só pode ser ativada caso ao menos uma das duas opções de movimentação esteja ligada.
                </span>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    opacity: disableNewMoveOwn ? 0.5 : 1,
                    cursor: disableNewMoveOwn ? 'not-allowed' : 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    className="customCheckbox"
                    checked={membersCanMoveOwnOrAssignedTasks}
                    disabled={disableNewMoveOwn}
                    onChange={e => handleToggleMoveOwnOrAssignedNew(e.target.checked)}
                  />
                  Membros podem mover apenas tarefas que criaram ou nas quais sejam responsáveis
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    opacity: disableNewMoveAll ? 0.5 : 1,
                    cursor: disableNewMoveAll ? 'not-allowed' : 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    className="customCheckbox"
                    checked={membersCanMoveAllTasks}
                    disabled={disableNewMoveAll}
                    onChange={e => handleToggleMoveAllNew(e.target.checked)}
                  />
                  Membros podem mover todas as tarefas
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: disableNewReturn ? 0.5 : 1,
                    cursor: disableNewReturn ? 'not-allowed' : 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    className="customCheckbox"
                    checked={membersCanReturnTasks}
                    disabled={disableNewReturn}
                    onChange={e => handleToggleReturnTasksNew(e.target.checked)}
                  />
                  Membros podem retornar status de tarefas concluídas
                </label>
              </div>

              {/* 4. Exclusão de Tarefas */}
              <div style={sectionBoxStyle}>
                <span style={sectionTitleStyle}>4. Exclusão de Tarefas</span>
                <span style={sectionHintStyle}>
                  Para permitir que membros excluam suas próprias tarefas, a opção de criar tarefas deve estar ligada. Excluir apenas as próprias tarefas e excluir todas são mutuamente exclusivas.
                </span>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    opacity: disableNewDeleteOwn ? 0.5 : 1,
                    cursor: disableNewDeleteOwn ? 'not-allowed' : 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    className="customCheckbox"
                    checked={membersCanDeleteOwnTasks}
                    disabled={disableNewDeleteOwn}
                    onChange={e => handleToggleDeleteOwnNew(e.target.checked)}
                  />
                  Membros podem excluir apenas suas próprias tarefas
                </label>
                
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: disableNewDeleteAll ? 0.5 : 1,
                    cursor: disableNewDeleteAll ? 'not-allowed' : 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    className="customCheckbox"
                    checked={membersCanDeleteTasks}
                    disabled={disableNewDeleteAll}
                    onChange={e => handleToggleDeleteAllNew(e.target.checked)}
                  />
                  Membros podem excluir todas as tarefas
                </label>
              </div>
            </div>

            <div className={styles.inputGroup} style={{marginBottom: '15px'}}>
              <label>Persistência do Histórico de Tarefas Excluídas (Exclusivo do Dono)</label>
              <select
                value={deletedTasksRetentionDays}
                onChange={e => setDeletedTasksRetentionDays(Number(e.target.value))}
                className={styles.input}
              >
                <option value={7}>7 dias</option>
                <option value={15}>15 dias</option>
                <option value={30}>30 dias</option>
                <option value={90}>90 dias</option>
                <option value={0}>Permanente (Sem expiração)</option>
              </select>
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
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '28px', borderRadius: '12px', width: '92%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Configurar Organização</h3>
              <FaTimes onClick={() => setIsEditingOrg(false)} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Nome da Organização</label>
              <input 
                type="text" 
                value={editOrgName} 
                onChange={e => setEditOrgName(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-primary)' }}
              />
            </div>

            <div style={{marginBottom: '18px'}}>
              <strong style={{display: 'block', marginBottom: '4px', color: 'var(--text-primary)'}}>
                Governança de Permissões (Aplicável ao Cargo Membro)
              </strong>
              <span style={{display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.4}}>
                Estas configurações controlam o que usuários com cargo <strong>Membro</strong> podem fazer. Cargos acima de Membro (Gerente, Sub-Dono e Dono) possuem acesso completo independentemente destas opções.
              </span>

              {/* 1. Criação e Prazos */}
              <div style={sectionBoxStyle}>
                <span style={sectionTitleStyle}>1. Criação e Prazos de Entrega</span>
                <span style={sectionHintStyle}>
                  Defina se os membros podem cadastrar novas tarefas na organização e se podem definir ou alterar datas limite.
                </span>
                <label style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)', cursor: 'pointer'}}>
                  <input
                    type="checkbox"
                    className="customCheckbox"
                    checked={editMembersCanCreateTasks}
                    onChange={e => handleToggleCreateTasksEdit(e.target.checked)}
                  />
                  Membros podem criar tarefas
                </label>

                <label style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', cursor: 'pointer'}}>
                  <input
                    type="checkbox"
                    className="customCheckbox"
                    checked={editMembersCanChangeDeadlines}
                    onChange={e => setEditMembersCanChangeDeadlines(e.target.checked)}
                  />
                  Membros podem alterar prazos de entrega
                </label>
              </div>

              {/* 2. Edição de Tarefas */}
              <div style={sectionBoxStyle}>
                <span style={sectionTitleStyle}>2. Edição de Tarefas (Aba Editar Tarefa)</span>
                <span style={sectionHintStyle}>
                  Escolha se os membros podem alterar apenas tarefas que criaram/nas quais estão como responsáveis ou qualquer tarefa da organização. Ativar uma opção bloqueia automaticamente a outra.
                </span>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    color: 'var(--text-secondary)',
                    opacity: disableEditEditOwn ? 0.45 : 1,
                    cursor: disableEditEditOwn ? 'not-allowed' : 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    className="customCheckbox"
                    checked={editMembersCanEditOwnOrAssignedTasks}
                    disabled={disableEditEditOwn}
                    onChange={e => handleToggleEditOwnOrAssignedEdit(e.target.checked)}
                  />
                  Membros podem alterar apenas tarefas que criaram ou nas quais sejam responsáveis
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-secondary)',
                    opacity: disableEditEditAll ? 0.45 : 1,
                    cursor: disableEditEditAll ? 'not-allowed' : 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    className="customCheckbox"
                    checked={editMembersCanEditAllTasks}
                    disabled={disableEditEditAll}
                    onChange={e => handleToggleEditAllEdit(e.target.checked)}
                  />
                  Membros podem alterar todas as tarefas
                </label>
              </div>

              {/* 3. Movimentação e Retorno */}
              <div style={sectionBoxStyle}>
                <span style={sectionTitleStyle}>3. Movimentação no Kanban e Retorno de Status</span>
                <span style={sectionHintStyle}>
                  Defina quais tarefas os membros podem mover entre colunas. A opção de retornar tarefas concluídas só pode ser ativada caso ao menos uma das duas opções de movimentação esteja ligada.
                </span>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    color: 'var(--text-secondary)',
                    opacity: disableEditMoveOwn ? 0.45 : 1,
                    cursor: disableEditMoveOwn ? 'not-allowed' : 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    className="customCheckbox"
                    checked={editMembersCanMoveOwnOrAssignedTasks}
                    disabled={disableEditMoveOwn}
                    onChange={e => handleToggleMoveOwnOrAssignedEdit(e.target.checked)}
                  />
                  Membros podem mover apenas tarefas que criaram ou nas quais sejam responsáveis
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    color: 'var(--text-secondary)',
                    opacity: disableEditMoveAll ? 0.45 : 1,
                    cursor: disableEditMoveAll ? 'not-allowed' : 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    className="customCheckbox"
                    checked={editMembersCanMoveAllTasks}
                    disabled={disableEditMoveAll}
                    onChange={e => handleToggleMoveAllEdit(e.target.checked)}
                  />
                  Membros podem mover todas as tarefas
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-secondary)',
                    opacity: disableEditReturn ? 0.45 : 1,
                    cursor: disableEditReturn ? 'not-allowed' : 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    className="customCheckbox"
                    checked={editMembersCanReturnTasks}
                    disabled={disableEditReturn}
                    onChange={e => handleToggleReturnTasksEdit(e.target.checked)}
                  />
                  Membros podem retornar status de tarefas concluídas
                </label>
              </div>

              {/* 4. Exclusão de Tarefas */}
              <div style={sectionBoxStyle}>
                <span style={sectionTitleStyle}>4. Exclusão de Tarefas</span>
                <span style={sectionHintStyle}>
                  Para permitir que membros excluam suas próprias tarefas, a opção de criar tarefas deve estar ligada. Excluir apenas as próprias tarefas e excluir todas são mutuamente exclusivas.
                </span>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    color: 'var(--text-secondary)',
                    opacity: disableEditDeleteOwn ? 0.45 : 1,
                    cursor: disableEditDeleteOwn ? 'not-allowed' : 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    className="customCheckbox"
                    checked={editMembersCanDeleteOwnTasks}
                    disabled={disableEditDeleteOwn}
                    onChange={e => handleToggleDeleteOwnEdit(e.target.checked)}
                  />
                  Membros podem excluir apenas suas próprias tarefas
                </label>
                
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-secondary)',
                    opacity: disableEditDeleteAll ? 0.45 : 1,
                    cursor: disableEditDeleteAll ? 'not-allowed' : 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    className="customCheckbox"
                    checked={editMembersCanDeleteTasks}
                    disabled={disableEditDeleteAll}
                    onChange={e => handleToggleDeleteAllEdit(e.target.checked)}
                  />
                  Membros podem excluir todas as tarefas
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Persistência do Histórico de Tarefas Excluídas {orgToEdit?.myRole !== 'OWNER' && '(Apenas o Dono pode alterar)'}
              </label>
              <select
                value={editDeletedTasksRetentionDays}
                disabled={orgToEdit?.myRole !== 'OWNER'}
                onChange={e => setEditDeletedTasksRetentionDays(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-app)',
                  color: 'var(--text-primary)',
                  opacity: orgToEdit?.myRole !== 'OWNER' ? 0.6 : 1
                }}
              >
                <option value={7}>Disponível por 7 dias</option>
                <option value={15}>Disponível por 15 dias</option>
                <option value={30}>Disponível por 30 dias</option>
                <option value={90}>Disponível por 90 dias</option>
                <option value={0}>Permanente (Sem expiração)</option>
              </select>
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
