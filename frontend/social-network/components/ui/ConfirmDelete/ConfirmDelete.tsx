'use client'

import styles from './ConfirmDelete.module.css'

interface ConfirmDeleteProps {
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDelete({ onConfirm, onCancel }: ConfirmDeleteProps) {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Delete Post?</h3>
        <p>Are you sure you want to delete this post? This action cannot be undone.</p>
        <div className={styles.actions}>
          <button onClick={onCancel} className={styles.cancelBtn}>Cancel</button>
          <button onClick={onConfirm} className={styles.deleteBtn}>Delete</button>
        </div>
      </div>
    </div>
  )
}
