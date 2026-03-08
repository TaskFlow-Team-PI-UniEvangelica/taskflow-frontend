import React from 'react';
import styles from './AuthLayout.module.css';
import { FaExchangeAlt } from 'react-icons/fa';

export default function AuthLayout({ children, isReversed = false, onSwap }) {
  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${isReversed ? styles.reverse : ''}`}>
        
 
        <div className={styles.formSection}>
          {children}
        </div>


        <div 
          className={`${styles.swapButton} ${isReversed ? styles.reversed : ''}`} 
          onClick={onSwap}
        >
          <FaExchangeAlt size={24} color="#3b82f6" /> 
        </div>

     
        <div className={styles.brandSection}>
          <div className={styles.brandContent}>
            <h1 className={styles.logoTitle}>
              <span>Task</span> <br /> Flow
            </h1>
          </div>
        </div>

      </div>
    </div>
  );
}