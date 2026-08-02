import { useState } from 'react'
import api from '../../services/api'
import styles from './DeleteWorkoutModal.module.css'

interface DeleteWorkoutModalProps {
  workoutId: string
  onClose: () => void
  onDeleted: () => void
}

export default function DeleteWorkoutModal({ workoutId, onClose, onDeleted }: DeleteWorkoutModalProps) {
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  const handleDelete = async (): Promise<void> => {
    setIsDeleting(true)
    try {
      await api.delete(`/api/workouts/${workoutId}`)
      onDeleted()
      onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.modalTitle}>Delete Workout</h3>
        <p className={styles.modalText}>
          Delete this workout? This action cannot be undone.
        </p>
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
