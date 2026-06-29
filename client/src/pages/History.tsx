import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import api from '../services/api'
import type { Workout } from '../types'
import WorkoutModal from '../components/modals/WorkoutModal'
import styles from './History.module.css'

export default function History() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [search, setSearch] = useState<string>('')
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null)
  const [showModal, setShowModal] = useState<boolean>(false)

  useEffect(() => {
    fetchWorkouts()
  }, [])

  const fetchWorkouts = async (): Promise<void> => {
    const res = await api.get<Workout[]>('/api/workouts/')
    setWorkouts(res.data)
  }

  const handleDelete = async (id: string): Promise<void> => {
    if (!window.confirm('Delete this workout?')) return
    await api.delete(`/api/workouts/${id}`)
    fetchWorkouts()
  }

  const filtered = workouts.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.workout_exercises?.some((we) =>
        we.exercises.name.toLowerCase().includes(search.toLowerCase())
      )
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Workout History</h2>
        <input
          className={styles.searchInput}
          placeholder="Search by workout name or exercise..."
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 && (
        <p className={styles.empty}>
          {search ? 'No workouts match your search.' : 'No workouts logged yet.'}
        </p>
      )}

      {filtered.map((w) => (
        <div key={w.id} className={styles.workoutCard}>
          <div className={styles.workoutHeader}>
            <div>
              <span className={styles.workoutName}>{w.name}</span>
              <span className={styles.workoutDate}> — {w.date}</span>
            </div>
            <div className={styles.workoutActions}>
              <button
                className={styles.actionButton}
                onClick={() => {
                  setEditingWorkout(w)
                  setShowModal(true)
                }}
              >
                Edit
              </button>
              <button
                className={styles.deleteButton}
                onClick={() => handleDelete(w.id)}
              >
                Delete
              </button>
            </div>
          </div>
          <p className={styles.workoutExercises}>
            {w.workout_exercises.map((we) => we.exercises.name).join(', ')}
          </p>
          {w.notes && (
            <p className={styles.workoutNotes}>{w.notes}</p>
          )}
        </div>
      ))}

      {showModal && (
        <WorkoutModal
          workout={editingWorkout}
          onClose={() => setShowModal(false)}
          onSave={fetchWorkouts}
        />
      )}
    </div>
  )
}