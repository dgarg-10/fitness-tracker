import { useState } from 'react'
import styles from './ConfirmDeleteModal.module.css'

interface ConfirmDeleteModalProps {
  title?: string
  message: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

export default function ConfirmDeleteModal({
  title = 'Confirm Delete',
  message,
  onClose,
  onConfirm
}: ConfirmDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  const handleDelete = async (): Promise<void> => {
    setIsDeleting(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.modalTitle}>{title}</h3>
        <p className={styles.modalText}>{message}</p>
        <div className={styles.modalActions}>
          <button
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className={styles.deleteButton}
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
