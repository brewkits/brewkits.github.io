import React from 'react';
import styles from './styles.module.css';

export default function BuyMeACoffee(): JSX.Element {
  return (
    <div className={styles.supportContainer}>
      <a
        href="https://www.buymeacoffee.com/brewkits"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.coffeeButton}
      >
        <span className={styles.coffeeIcon}>☕</span>
        <span className={styles.buttonText}>Buy Me a Coffee</span>
      </a>

      <a
        href="https://www.patreon.com/brewkits"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.patreonButton}
      >
        <span className={styles.patreonIcon}>🎨</span>
        <span className={styles.buttonText}>Support on Patreon</span>
      </a>
    </div>
  );
}
