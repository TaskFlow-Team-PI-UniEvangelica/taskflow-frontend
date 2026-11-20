// Rolagem suave até uma seção da landing page (respeita prefers-reduced-motion).
export const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
};
