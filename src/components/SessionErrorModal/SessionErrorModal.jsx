import React from 'react';
import styles from './SessionErrorModal.module.css';

/**
 * Aviso exibido quando a autenticação OIDC falha (auth.error), por exemplo
 * em um retorno de login inválido ou expirado. Oferece entrar novamente.
 */
export default function SessionErrorModal({ onLogin, onClose }) {
  return (
    <div className={styles.overlay}>
      <div
        className={styles.box}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="session-error-title"
        aria-describedby="session-error-text"
      >
        <h3 id="session-error-title" className={styles.title}>Sessão não validada</h3>
        <p id="session-error-text" className={styles.text}>
          Sua sessão não pôde ser validada. Isso pode acontecer quando o login expira ou é
          interrompido. Entre novamente para continuar.
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={onLogin}>
            Entrar novamente
          </button>
          <button type="button" className={styles.secondary} onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
