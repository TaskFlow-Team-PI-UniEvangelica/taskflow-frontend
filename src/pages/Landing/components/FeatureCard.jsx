import React from 'react';
import styles from '../LandingPage.module.css';

export default function FeatureCard({ icon: Icon, title, children, delay = 0 }) {
  return (
    <article className={styles.featureCard} data-reveal style={{ transitionDelay: `${delay}ms` }}>
      <div className={styles.featureIcon} aria-hidden="true">
        <Icon />
      </div>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureText}>{children}</p>
    </article>
  );
}
