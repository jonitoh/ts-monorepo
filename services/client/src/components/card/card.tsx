import React, { MouseEventHandler, ReactNode } from 'react';
import classNames from 'classnames';
import Button from '#common/buttons/button';
import cardStyles from '../card.module.css';
import styles from './two-click.module.css';
import {
  Props as StyleProps,
  defaultProps as StyleDefaultProps,
  getContentStyle,
  getShadowStyle,
} from '../options';

export interface Props extends StyleProps {
  src: string;
  imgText: string;
  leftButtonText: string;
  rightButtonText: string;
  leftOnClick?: MouseEventHandler<HTMLButtonElement> | (() => void);
  rightOnClick?: MouseEventHandler<HTMLButtonElement> | (() => void);
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export default function TwoClickCard({
  shadowStyle,
  contentStyle,
  src,
  imgText,
  leftButtonText,
  rightButtonText,
  leftOnClick,
  rightOnClick,
  leftIcon,
  rightIcon,
}: Props) {
  return (
    <div className={cardStyles.wrapper}>
      <div className={classNames([cardStyles.card, ...[getShadowStyle(cardStyles, shadowStyle)]])}>
        <div className={cardStyles.imgBox}>
          <img src={src} alt={imgText} />
        </div>
        <div
          className={classNames([
            cardStyles.infoContent,
            ...[getContentStyle(cardStyles, contentStyle)],
            styles.infoContent,
            ...[getContentStyle(styles, contentStyle)],
          ])}
        >
          <div className={styles.text}>{imgText}</div>
          <div className={styles.actionArea}>
            <Button
              type="button"
              label={leftButtonText}
              onClick={leftOnClick}
              className={styles.leftBtn}
              icon={leftIcon}
            />
            <Button
              type="button"
              label={rightButtonText}
              onClick={rightOnClick}
              className={styles.rightBtn}
              icon={rightIcon}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

TwoClickCard.defaultProps = {
  ...StyleDefaultProps,
  // shadowStyle: undefined,
  contentStyle: undefined,
  leftOnClick: undefined,
  rightOnClick: undefined,
  leftIcon: undefined,
  rightIcon: undefined,
};
