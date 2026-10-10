import React, { useRef, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import {
  FaTrello, FaBuilding, FaUsers, FaKey, FaBell, FaChartPie,
  FaArrowRight, FaCheck, FaMinus, FaUserPlus, FaSitemap, FaRocket,
  FaTimes, FaInfoCircle, FaMoon, FaShieldAlt, FaEnvelopeOpenText,
} from 'react-icons/fa';

import styles from './LandingPage.module.css';
import LandingNavbar, { scrollToSection } from './components/LandingNavbar';
import HeroKanbanMockup from './components/HeroKanbanMockup';
import FeatureCard from './components/FeatureCard';
import useReveal from './components/useReveal';
import { signupRedirect } from '../../auth/signup';
import { LOGOUT_FLAG_KEY } from '../../auth/keycloakConfig';

const HIGHLIGHTS = [
  { icon: FaTrello, label: 'Kanban visual' },
  { icon: FaShieldAlt, label: 'Permissões por papel' },
  { icon: FaEnvelopeOpenText, label: 'Convites por organização' },
  { icon: FaMoon, label: 'Modo escuro' },
];

const FEATURES = [
  { icon: FaTrello, title: 'Quadro Kanban', text: 'Mova tarefas entre Pendentes, Em Andamento e Concluídas e veja o fluxo do time de relance.' },
  { icon: FaBuilding, title: 'Múltiplas organizações', text: 'Participe de várias equipes e alterne entre elas com um clique, sem misturar as tarefas.' },
  { icon: FaUsers, title: 'Responsáveis por tarefa', text: 'Atribua uma ou mais pessoas a cada tarefa e saiba exatamente quem está cuidando de quê.' },
  { icon: FaKey, title: 'Permissões configuráveis', text: 'Defina se membros podem criar, excluir, reabrir tarefas ou alterar prazos.' },
  { icon: FaBell, title: 'Convites e notificações', text: 'Convide pessoas para a sua organização e acompanhe os convites pendentes.' },
  { icon: FaChartPie, title: 'Dashboard', text: 'Acompanhe o andamento das tarefas da organização com uma visão geral e objetiva.' },
];

const STEPS = [
  { icon: FaUserPlus, title: 'Crie sua conta', text: 'Cadastre-se em segundos com seu nome e e-mail.' },
  { icon: FaSitemap, title: 'Monte sua organização', text: 'Convide o time e defina quem é Dono, Sub-Dono, Gerente ou Membro.' },
  { icon: FaRocket, title: 'Distribua e acompanhe', text: 'Crie tarefas, atribua responsáveis e acompanhe tudo pelo Kanban.' },
];

const PERMISSION_COLUMNS = ['Criar', 'Excluir', 'Reabrir', 'Prazo'];
const PERMISSION_ROWS = [
  { role: 'Dono', values: [true, true, true, true] },
  { role: 'Sub-Dono', values: [true, true, true, true] },
  { role: 'Membro', values: [true, false, false, false], configurable: true },
];

export default function LandingPage() {
  const auth = useAuth();
  const pageRef = useRef(null);
  useReveal(pageRef);

  // aviso exibido apenas logo após um logout real
  const [showLogoutNotice, setShowLogoutNotice] = useState(() => {
    const flag = sessionStorage.getItem(LOGOUT_FLAG_KEY) === '1';
    if (flag) sessionStorage.removeItem(LOGOUT_FLAG_KEY);
    return flag;
  });

  const handleLogin = () => auth.signinRedirect();
  const handleSignup = () => signupRedirect();

  return (
    <div className={styles.page} ref={pageRef}>
      <a href="#conteudo" className={styles.skipLink}>Pular para o conteúdo</a>

      <LandingNavbar onLogin={handleLogin} onSignup={handleSignup} />

      {showLogoutNotice && (
        <div className={styles.notice} role="status">
          <FaInfoCircle aria-hidden="true" />
          <span>Você saiu da sua conta. Entre novamente para acessar suas organizações.</span>
          <button type="button" onClick={() => setShowLogoutNotice(false)} aria-label="Fechar aviso">
            <FaTimes />
          </button>
        </div>
      )}

      <main id="conteudo">
        {/* ================= HERO ================= */}
        <section id="topo" className={styles.hero}>
          <div className={styles.heroBg} aria-hidden="true" />
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroContent}>
              <span className={styles.badge}>
                <span className={styles.badgeDot} aria-hidden="true" />
                Gestão de tarefas para equipes
              </span>
              <h1 className={styles.heroTitle}>
                Organize equipes.<br />
                <span className={styles.gradientText}>Entregue no prazo.</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Crie organizações, distribua tarefas, acompanhe tudo em um quadro Kanban
                e controle quem pode fazer o quê. Tudo em um só lugar.
              </p>
              <div className={styles.heroCtas}>
                <button type="button" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`} onClick={handleSignup}>
                  Começar agora <FaArrowRight aria-hidden="true" />
                </button>
                <button type="button" className={`${styles.btn} ${styles.btnGhost} ${styles.btnLg}`} onClick={handleLogin}>
                  Já tenho conta
                </button>
              </div>
              <ul className={styles.heroChecks}>
                <li><FaCheck aria-hidden="true" /> Cadastro em segundos</li>
                <li><FaCheck aria-hidden="true" /> Modo claro e escuro</li>
              </ul>
            </div>

            <HeroKanbanMockup />
          </div>
        </section>

        {/* ================= DESTAQUES ================= */}
        <section className={styles.highlights} aria-label="Destaques">
          <div className={`${styles.container} ${styles.highlightsInner}`}>
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <div key={label} className={styles.highlightItem}>
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ================= RECURSOS ================= */}
        <section id="recursos" className={styles.section}>
          <div className={styles.container}>
            <header className={styles.sectionHeader} data-reveal>
              <span className={styles.eyebrow}>Recursos</span>
              <h2 className={styles.sectionTitle}>Tudo o que seu time precisa para fluir</h2>
              <p className={styles.sectionSubtitle}>
                Ferramentas simples e diretas para planejar, distribuir e acompanhar o trabalho.
              </p>
            </header>
            <div className={styles.featuresGrid}>
              {FEATURES.map((f, i) => (
                <FeatureCard key={f.title} icon={f.icon} title={f.title} delay={(i % 3) * 90}>
                  {f.text}
                </FeatureCard>
              ))}
            </div>
          </div>
        </section>

        {/* ================= COMO FUNCIONA ================= */}
        <section id="como-funciona" className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.container}>
            <header className={styles.sectionHeader} data-reveal>
              <span className={styles.eyebrow}>Como funciona</span>
              <h2 className={styles.sectionTitle}>Do cadastro à primeira entrega em 3 passos</h2>
            </header>
            <ol className={styles.steps}>
              {STEPS.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className={styles.step} data-reveal style={{ transitionDelay: `${i * 120}ms` }}>
                  <div className={styles.stepIcon} aria-hidden="true">
                    <Icon />
                    <span className={styles.stepNumber}>{i + 1}</span>
                  </div>
                  <h3 className={styles.stepTitle}>{title}</h3>
                  <p className={styles.stepText}>{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ================= PERMISSÕES ================= */}
        <section id="permissoes" className={styles.section}>
          <div className={`${styles.container} ${styles.splitGrid}`}>
            <div data-reveal>
              <span className={styles.eyebrow}>Papéis e permissões</span>
              <h2 className={styles.sectionTitle}>Cada pessoa com o acesso certo</h2>
              <p className={styles.sectionSubtitle}>
                Cada organização tem seus próprios papéis. O Dono decide o que os membros
                podem fazer e pode transferir a posse quando quiser.
              </p>
              <ul className={styles.checkList}>
                <li><FaCheck aria-hidden="true" /> Dono, Sub-Dono, Gerente e Membro</li>
                <li><FaCheck aria-hidden="true" /> Permissões de membros ajustáveis por organização</li>
                <li><FaCheck aria-hidden="true" /> Transferência de posse com segurança</li>
              </ul>
            </div>

            <div className={styles.permCard} data-reveal style={{ transitionDelay: '120ms' }}>
              <div className={styles.permCardHeader}>
                <FaShieldAlt aria-hidden="true" />
                <span>Configurações da organização</span>
              </div>
              <table className={styles.permTable}>
                <caption className={styles.srOnly}>Exemplo de permissões por papel</caption>
                <thead>
                  <tr>
                    <th scope="col">Papel</th>
                    {PERMISSION_COLUMNS.map((c) => <th key={c} scope="col">{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {PERMISSION_ROWS.map((row) => (
                    <tr key={row.role}>
                      <th scope="row">{row.role}</th>
                      {row.values.map((allowed, idx) => (
                        <td key={PERMISSION_COLUMNS[idx]}>
                          {row.configurable ? (
                            <span
                              className={`${styles.toggle} ${allowed ? styles.toggleOn : ''}`}
                              role="img"
                              aria-label={allowed ? 'Permitido (configurável)' : 'Bloqueado (configurável)'}
                            />
                          ) : allowed ? (
                            <FaCheck className={styles.permYes} aria-label="Permitido" />
                          ) : (
                            <FaMinus className={styles.permNo} aria-label="Bloqueado" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className={styles.permNote}>Os interruptores mostram o que o Dono pode ligar ou desligar para os membros.</p>
            </div>
          </div>
        </section>

        {/* ================= CTA FINAL ================= */}
        <section className={styles.ctaSection}>
          <div className={styles.container}>
            <div className={styles.ctaBox} data-reveal>
              <h2>Pronto para organizar seu time?</h2>
              <p>Crie sua conta e comece a distribuir tarefas hoje mesmo.</p>
              <div className={styles.ctaActions}>
                <button type="button" className={`${styles.btn} ${styles.btnWhite} ${styles.btnLg}`} onClick={handleSignup}>
                  Criar minha conta <FaArrowRight aria-hidden="true" />
                </button>
                <button type="button" className={`${styles.btn} ${styles.btnOutlineWhite} ${styles.btnLg}`} onClick={handleLogin}>
                  Entrar
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ================= RODAPÉ ================= */}
      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerInner}`}>
          <div className={styles.footerBrand}>
            <span className={styles.brandIcon} aria-hidden="true">T</span>
            <div>
              <strong>TaskFlow</strong>
              <p>Gestão de tarefas simples para equipes.</p>
            </div>
          </div>
          <nav className={styles.footerLinks} aria-label="Links do rodapé">
            {[['recursos', 'Recursos'], ['como-funciona', 'Como funciona'], ['permissoes', 'Permissões']].map(([id, label]) => (
              <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); scrollToSection(id); }}>{label}</a>
            ))}
          </nav>
          <p className={styles.copyright}>© {new Date().getFullYear()} TaskFlow · Projeto UniEvangélica</p>
        </div>
      </footer>
    </div>
  );
}
