import React from 'react';
import styles from './styles.module.css';

export default function BuyMeACoffee(): JSX.Element {
  return (
    <div className={styles.coffeeContainer}>
      <a
        href="https://www.buymeacoffee.com/brewkits"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.coffeeButton}
      >
        <span className={styles.coffeeIcon}>☕</span>
        <span className={styles.coffeeText}>Buy Me a Coffee</span>
      </a>
    </div>
  );
}
