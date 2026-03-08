import React from 'react';
import styles from './Input.module.css';


export default function Input({ label, type = 'text', placeholder, ...rest }) {
  return (
    <div className={styles.inputGroup}>
      {label && <label className={styles.label}>{label}</label>}
      <input 
        type={type} 
        className={styles.inputField} 
        placeholder={placeholder}
        {...rest} 
      />
    </div>
  );
}