import { useEffect } from 'react';

/**
 * Anima a entrada dos elementos marcados com `data-reveal` dentro do container
 * quando eles aparecem na tela. Respeita `prefers-reduced-motion`.
 */
export default function useReveal(containerRef) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const elements = container.querySelectorAll('[data-reveal]');
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    // sem suporte ou com movimento reduzido: mostra tudo de uma vez
    if (reduceMotion || !('IntersectionObserver' in window)) {
      elements.forEach((el) => { el.dataset.revealed = 'true'; });
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.dataset.revealed = 'true';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [containerRef]);
}
