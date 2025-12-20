'use client';

import { CloseIcon } from '@/components/ui/icons';
import styles from './ConfirmationModal.module.css';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel }: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>{title}</h3>
          <button onClick={onCancel} className={styles.closeBtn}>
            <CloseIcon />
          </button>
        </div>
        <div className={styles.body}>
          <p>{message}</p>
        </div>
        <div className={styles.actions}>
          <button onClick={onCancel} className={styles.cancelBtn}>Cancel</button>
          <button onClick={onConfirm} className={styles.confirmBtn}>Confirm</button>
        </div>
      </div>
    </div>
  );
}