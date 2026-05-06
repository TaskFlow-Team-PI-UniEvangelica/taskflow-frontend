import React from 'react';
import styles from './Input.module.css';

export default function Input({ label, type = 'text', placeholder, rightElement, ...rest }) {
  return (
    <div className={styles.inputGroup}>
      {label && <label className={styles.label}>{label}</label>}
      
      {/* ADICIONADO: width: '100%' na div protetora */}
      <div style={{ position: 'relative', width: '100%' }}>
        <input 
          type={type} 
          className={styles.inputField} 
          placeholder={placeholder}
          /* Garantindo que o input também ocupe 100% do espaço */
          style={{ width: '100%', boxSizing: 'border-box', ...(rightElement ? { paddingRight: '40px' } : {}) }}
          {...rest} 
        />
        
        {rightElement && rightElement}
      </div>
    </div>
  );
}