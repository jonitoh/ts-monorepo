import React from 'react';
import Card from '#components/card/card';
import styles from './app.module.scss';

export default function App() {
  return (
    <div className={styles.app}>
      <div className={styles.wrapper}>
        <Card text="Fake app" label="click on me!" />
        <div className={styles.result}>
          <div className={styles.left}>Left</div>
          <div className={styles.right}>Right</div>
        </div>
      </div>
    </div>
  );
}
