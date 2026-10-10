import React, { useEffect, useState } from 'react';
import { FaBars, FaTimes, FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';
import styles from '../LandingPage.module.css';

const NAV_LINKS = [
  { id: 'recursos', label: 'Recursos' },
  { id: 'como-funciona', label: 'Como funciona' },
  { id: 'permissoes', label: 'Permissões' },
];

export const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
};

export default function LandingNavbar({ onLogin, onSignup }) {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // fecha o menu mobile com ESC
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const handleNav = (e, id) => {
    e.preventDefault();
    setMenuOpen(false);
    scrollToSection(id);
  };

  return (
    <header className={`${styles.navbar} ${scrolled || menuOpen ? styles.navbarScrolled : ''}`}>
      <div className={styles.navInner}>
        <a href="#topo" className={styles.brand} onClick={(e) => handleNav(e, 'topo')} aria-label="TaskFlow - voltar ao topo">
          <span className={styles.brandIcon} aria-hidden="true">T</span>
          <span className={styles.brandText}>TaskFlow</span>
        </a>

        <nav className={styles.navLinks} aria-label="Navegação principal">
          {NAV_LINKS.map((link) => (
            <a key={link.id} href={`#${link.id}`} onClick={(e) => handleNav(e, link.id)}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className={styles.navActions}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnGhost} ${styles.hideMobile}`} onClick={onLogin}>
            Entrar
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary} ${styles.hideMobile}`} onClick={onSignup}>
            Criar conta
          </button>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.menuToggle}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-menu"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      <div
        id="landing-mobile-menu"
        className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}
        hidden={!menuOpen}
      >
        {NAV_LINKS.map((link) => (
          <a key={link.id} href={`#${link.id}`} onClick={(e) => handleNav(e, link.id)}>
            {link.label}
          </a>
        ))}
        <div className={styles.mobileMenuActions}>
          <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onLogin}>Entrar</button>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={onSignup}>Criar conta</button>
        </div>
      </div>
    </header>
  );
}
