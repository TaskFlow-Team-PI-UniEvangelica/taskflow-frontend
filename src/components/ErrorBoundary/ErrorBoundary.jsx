import React from 'react';
import styles from './ErrorBoundary.module.css';

/**
 * Captura erros de renderização dos componentes filhos e exibe uma tela amigável
 * no lugar da tela branca. Não captura erros de handlers de evento nem de código
 * assíncrono (fetch), que continuam tratados nos próprios componentes.
 *
 * Props:
 * - resetKey: quando muda (ex.: a rota atual), o erro é descartado e os filhos são renderizados de novo.
 * - fullPage: ocupa a tela inteira (uso global); caso contrário, ocupa só a área de conteúdo.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this.handleRetry = this.handleRetry.bind(this);
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Erro de renderização capturado pelo ErrorBoundary:', error, info?.componentStack);
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  handleRetry() {
    this.setState({ hasError: false });
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className={this.props.fullPage ? styles.fullPage : styles.inline} role="alert">
        <div className={styles.box}>
          <h2 className={styles.title}>Algo deu errado</h2>
          <p className={styles.text}>
            Ocorreu um erro inesperado ao exibir esta tela. Tente novamente ou volte ao início.
          </p>
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={this.handleRetry}>
              Tentar novamente
            </button>
            <button type="button" className={styles.secondary} onClick={() => window.location.assign('/')}>
              Voltar ao início
            </button>
          </div>
        </div>
      </div>
    );
  }
}
