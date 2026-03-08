import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Equipe.module.css';
import { FaUserCircle, FaEnvelope, FaProjectDiagram, FaCircle, FaSearch, FaPlus, FaArrowLeft } from 'react-icons/fa';
import CreateTeamTask from './CreateTeamTask'; 

export default function Equipe() {
  const navigate = useNavigate();
  const [membros, setMembros] = useState([]);
  const [busca, setBusca] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

 
  const [demandasColetivas, setDemandasColetivas] = useState([
    { id: 1, titulo: "Refatoração UI - BitBuilders", membros: "Guilherme, Wanderlay e Kayran", prioridade: "Alta" }
  ]);

  useEffect(() => {
    const fetchEquipe = async () => {
      try {
        const response = [
          { id: 1, nome: "Guilherme Miguel", cargo: "Fullstack Developer", email: "guilherme@bitbuilders.com", status: "online", tarefas: 3 },
          { id: 2, nome: "Wanderlay Silva Neto", cargo: "Backend Engineer", email: "wanderlay@bitbuilders.com", status: "online", tarefas: 5 },
          { id: 3, nome: "Kayran", cargo: "Software Engineer", email: "kayran@bitbuilders.com", status: "offline", tarefas: 2 }
        ];
        setMembros(response);
      } catch (error) {
        console.error("Erro ao carregar equipe:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipe();
  }, []);


  const salvarNovaTarefa = (novaTarefa) => {
    const tarefaComId = { ...novaTarefa, id: Date.now() };
    setDemandasColetivas([tarefaComId, ...demandasColetivas]);
    setIsCreatingTeam(false);

    
    const pendentesAtuais = parseInt(localStorage.getItem('tasks_pendentes') || '0');
    localStorage.setItem('tasks_pendentes', (pendentesAtuais + 1).toString());
    
    
    window.dispatchEvent(new Event('storage'));
  };

  const membrosFiltrados = membros.filter(membro => 
    membro.nome.toLowerCase().includes(busca.toLowerCase()) ||
    membro.cargo.toLowerCase().includes(busca.toLowerCase())
  );

  const atribuirTarefa = (nomeMembro) => {
    navigate('/tasks', { state: { responsavelSelecionado: nomeMembro.toLowerCase() } });
  };

  if (loading) return <div className={styles.loader}>Sincronizando usuários...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>
            {isCreatingTeam ? "Nova Equipe de Trabalho" : "Membros da Equipe"}
          </h1>
          <p className={styles.subtitle}>
            {isCreatingTeam 
              ? "Configure os membros, prioridade e demandas do novo grupo." 
              : "Gerencie e atribua demandas para o time BitBuilders."}
          </p>
        </div>

        <div className={styles.headerActions}>
          {isCreatingTeam ? (
            <button className={styles.backBtn} onClick={() => setIsCreatingTeam(false)}>
              <FaArrowLeft /> Voltar para Lista
            </button>
          ) : (
            <>
              <button className={styles.createTeamBtn} onClick={() => setIsCreatingTeam(true)}>
                <FaPlus /> Criar Equipe
              </button>

              <div className={styles.searchWrapper}>
                <FaSearch className={styles.searchIcon} />
                <input 
                  type="text" 
                  placeholder="Buscar por nome ou cargo..." 
                  className={styles.searchInput}
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </header>

      {isCreatingTeam ? (
        <div className={styles.fadeAnim}>
          <CreateTeamTask 
            onCancel={() => setIsCreatingTeam(false)} 
            onSave={salvarNovaTarefa}
          />
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {membrosFiltrados.length > 0 ? (
              membrosFiltrados.map(membro => (
                <div key={membro.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <FaUserCircle className={styles.avatar} />
                    <div className={`${styles.statusDot} ${styles[membro.status]}`}>
                      <FaCircle />
                    </div>
                  </div>
                  <div className={styles.info}>
                    <h3 className={styles.nome}>{membro.nome}</h3>
                    <span className={styles.cargo}>{membro.cargo}</span>
                  </div>
                  <div className={styles.details}>
                    <div className={styles.detailItem}>
                      <FaEnvelope className={styles.icon} />
                      <span>{membro.email}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <FaProjectDiagram className={styles.icon} />
                      <span>{membro.tarefas} tarefas ativas</span>
                    </div>
                  </div>
                  <footer className={styles.cardFooter}>
                    <button className={styles.assignBtn} onClick={() => atribuirTarefa(membro.nome)}>
                      Atribuir Tarefa
                    </button>
                  </footer>
                </div>
              ))
            ) : (
              <p className={styles.noResult}>Nenhum integrante encontrado.</p>
            )}
          </div>

          <div className={styles.teamTasksSection} style={{marginTop: '50px'}}>
            <h2 className={styles.title} style={{fontSize: '1.4rem', marginBottom: '20px'}}>
              Demandas Coletivas Ativas
            </h2>
            {demandasColetivas.map(tarefa => (
              <div key={tarefa.id} className={styles.teamTaskCard}>
                <div className={styles.taskInfo}>
                  <strong>{tarefa.titulo}</strong>
                  <span>Equipe: {tarefa.membros}</span>
                </div>
                <div className={`${styles.taskBadge} ${tarefa.prioridade.toLowerCase() === 'alta' ? styles.high : ''}`}>
                  {tarefa.prioridade}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}