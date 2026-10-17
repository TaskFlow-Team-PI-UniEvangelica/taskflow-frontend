import React, { useState, useEffect, useContext } from 'react';
import { OrganizationContext } from '../../context/OrganizationContext';
import { useAuth } from 'react-oidc-context';
import { useLocation } from 'react-router-dom';
import styles from './Tasks.module.css'; 
import { FaCheckCircle, FaCalendarAlt, FaUsers, FaTrashAlt } from 'react-icons/fa'; 
import TaskTimeline from '../../components/TaskHistory/TaskTimeline';
import DeletedTasksModal from '../../components/TaskHistory/DeletedTasksModal';

export default function EditTasks() {
  const auth = useAuth();
  const { currentOrg, currentUser } = useContext(OrganizationContext);
  const location = useLocation();
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Tarefa atualizada com sucesso.');
  const [erro, setErro] = useState(null); 
  const [isLoading, setIsLoading] = useState(false); 
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [showDeletedModal, setShowDeletedModal] = useState(false);

  const [selectedTaskId, setSelectedTaskId] = useState('');

  const [taskData, setTaskData] = useState({
    titulo: '', descricao: '', prioridade: '', prazo: '', status: '', idsResponsaveis: []
  });

  const userRole = currentOrg?.myRole || currentOrg?.userRole;
  const isAboveMember = ['OWNER', 'SUB_OWNER', 'MANAGER'].includes(userRole);

  const selectedTask = tasks.find(t => t.id.toString() === selectedTaskId) || null;

  const isOwnTask = Boolean(
    selectedTask &&
    currentUser &&
    ((selectedTask.criadorId != null && Number(selectedTask.criadorId) === Number(currentUser.id)) ||
     (selectedTask.nomeCriador && currentUser.nome && selectedTask.nomeCriador === currentUser.nome))
  );

  const isAssignedTask = Boolean(
    selectedTask &&
    currentUser &&
    ((Array.isArray(selectedTask.idsResponsaveis) &&
      selectedTask.idsResponsaveis.some(id => Number(id) === Number(currentUser.id))) ||
     (Array.isArray(selectedTask.nomesResponsaveis) &&
      currentUser.nome &&
      selectedTask.nomesResponsaveis.includes(currentUser.nome)))
  );

  const isOwnOrAssignedTask = isOwnTask || isAssignedTask;

  // Regra de edição:
  // - Cargos acima de MEMBER (OWNER, SUB_OWNER, MANAGER) sempre podem editar qualquer task.
  // - Cargo MEMBER pode editar todas se membersCanEditAllTasks=true, ou apenas tarefas que criou/é responsável se membersCanEditOwnOrAssignedTasks=true.
  const canEditSelectedTask = Boolean(
    selectedTask &&
    (isAboveMember ||
      currentOrg?.membersCanEditAllTasks === true ||
      (currentOrg?.membersCanEditOwnOrAssignedTasks !== false && isOwnOrAssignedTask))
  );

  // Regra de movimentação de status:
  // - Cargos acima de MEMBER sempre podem mover qualquer task.
  // - Cargo MEMBER pode mover todas se membersCanMoveAllTasks=true, ou apenas tarefas que criou/é responsável se membersCanMoveOwnOrAssignedTasks=true.
  const canMoveSelectedTask = Boolean(
    selectedTask &&
    (isAboveMember ||
      currentOrg?.membersCanMoveAllTasks === true ||
      (currentOrg?.membersCanMoveOwnOrAssignedTasks !== false && isOwnOrAssignedTask))
  );

  // Regra de exclusão:
  // - Cargos acima de MEMBER (OWNER, SUB_OWNER, MANAGER) sempre podem excluir qualquer task.
  // - Cargo MEMBER pode excluir todas se membersCanDeleteTasks=true, ou apenas a própria se membersCanCreateTasks=true && membersCanDeleteOwnTasks=true.
  const canDeleteSelectedTask = Boolean(
    selectedTask &&
    (isAboveMember ||
      currentOrg?.membersCanDeleteTasks === true ||
      (currentOrg?.membersCanCreateTasks !== false &&
        currentOrg?.membersCanDeleteOwnTasks === true &&
        isOwnTask))
  );

  const canChangeDeadline = Boolean(
    currentOrg && canEditSelectedTask && (isAboveMember || currentOrg.membersCanChangeDeadlines === true)
  );

  const anyMemberMoveOptionEnabled = Boolean(
    currentOrg?.membersCanMoveAllTasks === true || currentOrg?.membersCanMoveOwnOrAssignedTasks !== false
  );

  const canReturnTask = Boolean(
    currentOrg &&
    canMoveSelectedTask &&
    (isAboveMember || (anyMemberMoveOptionEnabled && currentOrg.membersCanReturnTasks === true))
  );

  // Recarrega a lista e limpa a seleção APENAS quando o ID da organização muda (evita flicker no hot reload)
  useEffect(() => {
    fetchTasks();
    if (currentOrg?.id) {
      fetchUsers();
    } else {
      setTeamMembers([]);
    }
    setSelectedTaskId('');
    setTaskData({ titulo: '', descricao: '', prioridade: '', prazo: '', status: '', idsResponsaveis: [] });
  }, [currentOrg?.id, auth?.user?.access_token]);

  useEffect(() => {
    if (location.state?.taskId && tasks.length > 0) {
      handleTaskSelection(location.state.taskId.toString());
    }
  }, [tasks, location.state]);

  const fetchTasks = async () => {
    try {
      const token = auth?.user?.access_token;
      if (!currentOrg?.id || !token) return setTasks([]);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/task?organizationId=${currentOrg.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setTasks(await response.json());
    } catch (_error) {
      console.error("Erro", _error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = auth?.user?.access_token;
      if (!currentOrg?.id || !token) return;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/organization/${currentOrg.id}/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setTeamMembers(await response.json());
    } catch (_error) {
      console.error("Erro", _error);
    }
  };

  const handleTaskSelection = (taskId) => {
    setSelectedTaskId(taskId);
    setErro(null);
    if (taskId) {
      const taskToEdit = tasks.find(t => t.id.toString() === taskId);
      if (taskToEdit) {
        const prazoFormatado = taskToEdit.prazo
          ? (Array.isArray(taskToEdit.prazo)
              ? `${taskToEdit.prazo[0]}-${String(taskToEdit.prazo[1]).padStart(2, '0')}-${String(taskToEdit.prazo[2]).padStart(2, '0')}`
              : String(taskToEdit.prazo).split('T')[0])
          : '';
        const idsAtuais = Array.isArray(taskToEdit.idsResponsaveis) && taskToEdit.idsResponsaveis.length > 0
          ? taskToEdit.idsResponsaveis
          : teamMembers
              .filter(m => Array.isArray(taskToEdit.nomesResponsaveis) && taskToEdit.nomesResponsaveis.includes(m.nome))
              .map(m => m.id);
        setTaskData({
          titulo: taskToEdit.titulo,
          descricao: taskToEdit.descricao || '',
          prioridade: String(taskToEdit.prioridade).toLowerCase(),
          prazo: prazoFormatado,
          status: String(taskToEdit.status).toLowerCase(),
          idsResponsaveis: idsAtuais
        });
      }
    } else {
      setTaskData({ titulo: '', descricao: '', prioridade: '', prazo: '', status: '', idsResponsaveis: [] });
    }
  };

  const handleCheckboxChange = (userId) => {
    const isSelected = taskData.idsResponsaveis.includes(userId);
    setTaskData(prev => ({
      ...prev,
      idsResponsaveis: isSelected ? prev.idsResponsaveis.filter(id => id !== userId) : [...prev.idsResponsaveis, userId]
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedTaskId) {
      setErro("Selecione uma tarefa para editar.");
      return;
    }
    
    setErro(null);
    setIsLoading(true);

    try {
      const token = auth?.user?.access_token;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/task/${selectedTaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          titulo: taskData.titulo,
          descricao: taskData.descricao,
          status: taskData.status,
          prioridade: taskData.prioridade,
          prazo: taskData.prazo,
          idsResponsaveis: taskData.idsResponsaveis
        }) 
      });

      if (response.ok) {
        setSuccessMessage('Tarefa atualizada com sucesso.');
        setShowSuccess(true);
        await fetchTasks();
        setHistoryRefreshKey(prev => prev + 1);
        setTimeout(() => setShowSuccess(false), 2500);
      } else {
        const errData = await response.json().catch(() => null);
        setErro(errData?.message || 'Erro ao atualizar a tarefa.');
      }
    } catch (_error) {
      setErro('Falha na comunicação com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTaskId || !selectedTask) return;
    const labelNum = selectedTask.taskNumber ?? selectedTask.id;
    if (!window.confirm(`Tem certeza que deseja excluir a tarefa "${labelNum} - ${taskData.titulo}"?`)) {
      return;
    }

    setErro(null);
    setIsLoading(true);

    try {
      const token = auth?.user?.access_token;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/task/${selectedTaskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccessMessage('Tarefa excluída com sucesso.');
        setShowSuccess(true);
        setSelectedTaskId('');
        setTaskData({ titulo: '', descricao: '', prioridade: '', prazo: '', status: '', idsResponsaveis: [] });
        await fetchTasks();
        setHistoryRefreshKey(prev => prev + 1);
        setTimeout(() => setShowSuccess(false), 2500);
      } else {
        const errData = await response.json().catch(() => null);
        setErro(errData?.message || 'Você não possui permissão para excluir esta tarefa.');
      }
    } catch (_error) {
      setErro('Falha na comunicação com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {showSuccess && (
        <div className={styles.toastContainer}>
          <div className={styles.successToast}>
            <FaCheckCircle className={styles.successIcon} />
            <div className={styles.toastText}><strong>Sucesso!</strong><span>{successMessage}</span></div>
          </div>
        </div>
      )}

      <div className={styles.mainCard}>
        {erro && (
          <div style={{ backgroundColor: '#ff4d4f', color: 'white', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center' }}>
            {erro}
          </div>
        )}

        <header className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 className={styles.title}>Editar Tarefa</h1>
            <p className={styles.subtitle}>Atualize os detalhes, o status e acompanhe o histórico completo de auditoria da tarefa selecionada.</p>
          </div>
          {isAboveMember && (
            <button
              type="button"
              onClick={() => setShowDeletedModal(true)}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                padding: '10px 16px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.88rem'
              }}
            >
              <FaTrashAlt /> Histórico de Excluídas
            </button>
          )}
        </header>
        
        <form className={styles.form} onSubmit={handleUpdate}>
          
          <div className={styles.field} style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'var(--bg-app)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <label style={{ color: 'var(--primary-blue)', fontWeight: 'bold' }}>SELECIONAR TAREFA</label>
            <select 
              value={selectedTaskId}
              onChange={(e) => handleTaskSelection(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', marginTop: '5px', border: '1px solid var(--border-color)' }}
            >
              <option value="">Escolha uma tarefa para editar</option>
              {tasks.map(t => (
                <option key={t.id} value={t.id}>{t.taskNumber ?? t.id} - {t.titulo}</option>
              ))}
            </select>
          </div>

          {selectedTaskId && (!canEditSelectedTask || !canMoveSelectedTask) && (
            <div
              style={{
                marginBottom: '18px',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                lineHeight: 1.45
              }}
            >
              {!canEditSelectedTask && !canMoveSelectedTask
                ? 'Visualização somente leitura: as configurações atuais da organização permitem que membros alterem ou movam apenas tarefas criadas por eles mesmos ou nas quais estejam atribuídos como responsáveis.'
                : !canEditSelectedTask
                  ? 'Edição de conteúdo bloqueada para esta tarefa: você pode atualizar apenas o status, conforme as regras da organização para o cargo Membro.'
                  : 'Movimentação de status bloqueada para esta tarefa conforme as regras da organização para o cargo Membro.'}
            </div>
          )}

          <div className={styles.layoutGrid}>
            <div className={styles.primarySection}>
              <div className={styles.field}>
                <label>TÍTULO DO ITEM</label>
                <input 
                  type="text" required disabled={!selectedTaskId || !canEditSelectedTask}
                  value={taskData.titulo} 
                  onChange={(e) => setTaskData({...taskData, titulo: e.target.value})}
                />
              </div>

              <div className={styles.field}>
                <label>DOCUMENTAÇÃO / DESCRIÇÃO</label>
                <textarea 
                  rows="4" disabled={!selectedTaskId || !canEditSelectedTask}
                  value={taskData.descricao}
                  onChange={(e) => setTaskData({...taskData, descricao: e.target.value})}
                ></textarea>
              </div>

              <div className={styles.field}>
                <label><FaUsers /> ATRIBUIR RESPONSÁVEIS</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '5px', padding: '10px', background: 'var(--bg-app)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  {teamMembers.length === 0 ? (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nenhum membro.</span>
                  ) : (
                    teamMembers.map(user => (
                      <label key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: (!selectedTaskId || !canEditSelectedTask) ? 'not-allowed' : 'pointer', opacity: (!selectedTaskId || !canEditSelectedTask) ? 0.6 : 1, background: 'var(--bg-card)', padding: '5px 10px', borderRadius: '15px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                        <input 
                          type="checkbox" className="customCheckbox" disabled={!selectedTaskId || !canEditSelectedTask}
                          checked={taskData.idsResponsaveis.includes(user.id)}
                          onChange={() => handleCheckboxChange(user.id)}
                        />
                        {user.nome.trim().split(/\s+/).length > 1 ? `${user.nome.trim().split(/\s+/)[0]} ${user.nome.trim().split(/\s+/)[1][0]}.` : user.nome.trim().split(/\s+/)[0]} </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className={styles.sidebarSection}>
              <div className={styles.field}>
                <label>PRIORIDADE</label>
                <select value={taskData.prioridade} required disabled={!selectedTaskId || !canEditSelectedTask} onChange={(e) => setTaskData({...taskData, prioridade: e.target.value})}>
                  <option value="" disabled>Nível de urgência</option>
                  <option value="alta">ALTA</option>
                  <option value="media">MÉDIA</option>
                  <option value="baixa">BAIXA</option>
                </select>
              </div>

              <div className={styles.field}>
                <label>STATUS ATUAL</label>
                <select
                  value={taskData.status}
                  required
                  disabled={!selectedTaskId || !canMoveSelectedTask || (selectedTask?.status === 'concluida' && !canReturnTask)}
                  onChange={(e) => setTaskData({...taskData, status: e.target.value})}
                >
                  <option value="pendente">Pendente</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluida">Concluída</option>
                </select>
              </div>

              <div className={styles.field}>
                <label><FaCalendarAlt /> PRAZO DE ENTREGA</label>
                <input 
                  type="date"
                  disabled={!selectedTaskId || !canChangeDeadline}
                  value={taskData.prazo}
                  onChange={(e) => setTaskData({...taskData, prazo: e.target.value})} 
                />
                {selectedTaskId && !canChangeDeadline && (
                  <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    Apenas cargos autorizados podem alterar o prazo nesta organização.
                  </small>
                )}
              </div>
            </div>
          </div>

          <footer className={styles.footer} style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
            <div>
              {selectedTaskId && canDeleteSelectedTask && (
                <button
                  type="button"
                  onClick={handleDeleteTask}
                  disabled={isLoading}
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    padding: '12px 20px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaTrashAlt /> Excluir Tarefa
                </button>
              )}
            </div>
            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={isLoading || !selectedTaskId || (!canEditSelectedTask && !canMoveSelectedTask)}
            >
              {isLoading ? 'Salvando...' : 'Salvar Edição'}
            </button>
          </footer>
        </form>

        {selectedTaskId && (
          <TaskTimeline
            taskId={selectedTaskId}
            taskNumber={selectedTask?.taskNumber}
            taskTitle={taskData.titulo}
            token={auth?.user?.access_token}
            refreshKey={historyRefreshKey}
          />
        )}
      </div>

      <DeletedTasksModal
        isOpen={showDeletedModal}
        onClose={() => setShowDeletedModal(false)}
        organization={currentOrg}
        token={auth?.user?.access_token}
        refreshKey={historyRefreshKey}
      />
    </div>
  );
}