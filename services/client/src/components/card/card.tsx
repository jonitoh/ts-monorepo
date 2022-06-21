import React, { MouseEventHandler } from 'react';
import styles from './card.module.scss';

export interface Props {
  text: string;
  label: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export default function Card({ text, label, onClick }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.infoContent}>
          <div className={styles.text}>{text}</div>
          <div className={styles.actionArea}>
            <button type="button" onClick={onClick} className={styles.leftBtn}>
              {label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Card.defaultProps = {
  onClick: undefined,
};
