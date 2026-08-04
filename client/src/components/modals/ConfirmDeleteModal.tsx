import { useState } from 'react'
import { isAxiosError } from 'axios'
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
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async (): Promise<void> => {
    setIsDeleting(true)
    setError(null)
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      const message = isAxiosError<{ error?: string }>(err)
        ? err.response?.data?.error ?? 'Failed to delete. Please try again.'
        : 'Failed to delete. Please try again.'
      setError(message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.modalTitle}>{title}</h3>
        <p className={styles.modalText}>{message}</p>
        {error && (
          <p style={{ color: '#f87171', marginTop: 8 }}>{error}</p>
        )}
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
