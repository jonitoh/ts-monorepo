import React, { MouseEventHandler } from "react";
import styles from "./card.module.scss";

export interface Props {
    text: string;
    label: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
}

export default function Card({ text, label, onClick }: Props) {
    return (
        <div className={styles.card}>
            <div className={styles.title}>{text}</div>
            <button type="button" onClick={onClick} className={styles.btn}>
                {label}
            </button>
        </div>
    );
}

Card.defaultProps = {
    onClick: undefined,
};
