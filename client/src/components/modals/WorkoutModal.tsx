import { useState, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import api from '../../services/api'
import type {
  Workout,
  Exercise,
  ModalExercise,
  ModalSet,
  MuscleGroup,
  ExerciseType,
  Template
} from '../../types'
import styles from './WorkoutModal.module.css'

interface NewExerciseForm {
  name: string
  muscle_group: MuscleGroup
  type: ExerciseType
}

interface WorkoutModalProps {
    workout: Workout | null
    template?: Template | null
    onClose: () => void
    onSave: () => void
  }

const MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio'
]

function makeEmptySet(type: ExerciseType, setNumber: number): ModalSet {
  return {
    set_number: setNumber,
    weight: '',
    reps: '',
    bodyweight: type === 'bodyweight',
    duration_seconds: '',
    distance_meters: '',
    pace: ''
  }
}

export default function WorkoutModal({ workout, template, onClose, onSave }: WorkoutModalProps) {
  const [name, setName] = useState<string>(workout?.name ?? '')
  const [date, setDate] = useState<string>(
    workout?.date ?? new Date().toISOString().split('T')[0]
  )
  const [notes, setNotes] = useState<string>(workout?.notes ?? '')
  const [exercises, setExercises] = useState<ModalExercise[]>([])
  const [allExercises, setAllExercises] = useState<Exercise[]>([])
  const [showExercisePicker, setShowExercisePicker] = useState<boolean>(false)
  const [showNewExerciseForm, setShowNewExerciseForm] = useState<boolean>(false)
  const [newExercise, setNewExercise] = useState<NewExerciseForm>({
    name: '',
    muscle_group: 'chest',
    type: 'weighted'
  })

  useEffect(() => {
    fetchExercises()
    if (workout) {
      const mapped: ModalExercise[] = workout.workout_exercises
        .slice()
        .sort((a, b) => a.order_index - b.order_index)
        .map((we) => ({
          id: we.exercises.id,
          name: we.exercises.name,
          type: we.exercises.type,
          muscle_group: we.exercises.muscle_group,
          sets: we.sets
            .slice()
            .sort((a, b) => a.set_number - b.set_number)
            .map((s) => ({
              set_number: s.set_number,
              weight: s.weight?.toString() ?? '',
              reps: s.reps?.toString() ?? '',
              bodyweight: s.bodyweight ?? false,
              duration_seconds: s.duration_seconds?.toString() ?? '',
              distance_meters: s.distance_meters?.toString() ?? '',
              pace: s.pace ?? ''
            }))
        }))
      setExercises(mapped)
    } else if (template) {
      const mapped: ModalExercise[] = template.template_exercises
        .slice()
        .sort((a, b) => a.order_index - b.order_index)
        .map((te) => ({
          id: te.exercises.id,
          name: te.exercises.name,
          type: te.exercises.type,
          muscle_group: te.exercises.muscle_group,
          sets: []
        }))
      setExercises(mapped)
      setName(template.name)
    }
  }, [])

  const fetchExercises = async (): Promise<void> => {
    const res = await api.get<Exercise[]>('/api/exercises/')
    setAllExercises(res.data)
  }

  const addExercise = (ex: Exercise): void => {
    if (exercises.find((e) => e.id === ex.id)) return
    setExercises((prev) => [
      ...prev,
      {
        id: ex.id,
        name: ex.name,
        type: ex.type,
        muscle_group: ex.muscle_group,
        sets: []
      }
    ])
    setShowExercisePicker(false)
  }

  const removeExercise = (exId: string): void => {
    setExercises((prev) => prev.filter((e) => e.id !== exId))
  }

  const createAndAddExercise = async (): Promise<void> => {
    const res = await api.post<Exercise>('/api/exercises/', newExercise)
    const created = res.data
    setAllExercises((prev) => [...prev, created])
    addExercise(created)
    setShowNewExerciseForm(false)
    setNewExercise({ name: '', muscle_group: 'chest', type: 'weighted' })
  }

  const addSet = (exId: string): void => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex
        return {
          ...ex,
          sets: [...ex.sets, makeEmptySet(ex.type, ex.sets.length + 1)]
        }
      })
    )
  }

  const updateSet = (
    exId: string,
    setIndex: number,
    field: keyof ModalSet,
    value: string | boolean
  ): void => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex
        return {
          ...ex,
          sets: ex.sets.map((s, i) =>
            i === setIndex ? { ...s, [field]: value } : s
          )
        }
      })
    )
  }

  const removeSet = (exId: string, setIndex: number): void => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex
        return {
          ...ex,
          sets: ex.sets
            .filter((_, i) => i !== setIndex)
            .map((s, i) => ({ ...s, set_number: i + 1 }))
        }
      })
    )
  }

  const handleSave = async (): Promise<void> => {
    const payload = { name, date, notes, exercises }
    if (workout) {
      await api.put(`/api/workouts/${workout.id}`, payload)
    } else {
      await api.post('/api/workouts/', payload)
    }
    onSave()
    onClose()
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.modalTitle}>
          {workout ? 'Edit Workout' : 'Log Workout'}
        </h3>

        <input
          className={styles.input}
          placeholder="Workout name"
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        />
        <input
          className={styles.input}
          type="date"
          value={date}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
        />
        <textarea
          className={styles.textarea}
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
        />

        {exercises.map((ex) => (
          <div key={ex.id} className={styles.exerciseCard}>
            <div className={styles.exerciseHeader}>
              <span className={styles.exerciseName}>{ex.name}</span>
              <button
                className={styles.removeButton}
                onClick={() => removeExercise(ex.id)}
              >
                Remove
              </button>
            </div>

            {ex.sets.map((set, i) => (
              <div key={i} className={styles.setRow}>
                <span className={styles.setNumber}>#{set.set_number}</span>

                {ex.type === 'weighted' && (
                  <>
                    <input
                      className={styles.setInput}
                      placeholder="lbs"
                      type="number"
                      value={set.weight}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateSet(ex.id, i, 'weight', e.target.value)
                      }
                    />
                    <span className={styles.multiply}>×</span>
                    <input
                      className={styles.setInput}
                      placeholder="reps"
                      type="number"
                      value={set.reps}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateSet(ex.id, i, 'reps', e.target.value)
                      }
                    />
                  </>
                )}

                {ex.type === 'bodyweight' && (
                  <input
                    className={styles.setInput}
                    placeholder="reps"
                    type="number"
                    value={set.reps}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateSet(ex.id, i, 'reps', e.target.value)
                    }
                  />
                )}

                {ex.type === 'cardio' && (
                  <>
                    <input
                      className={styles.setInputWide}
                      placeholder="seconds"
                      type="number"
                      value={set.duration_seconds}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateSet(ex.id, i, 'duration_seconds', e.target.value)
                      }
                    />
                    <input
                      className={styles.setInputWide}
                      placeholder="meters"
                      type="number"
                      value={set.distance_meters}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateSet(ex.id, i, 'distance_meters', e.target.value)
                      }
                    />
                    <input
                      className={styles.setInputWide}
                      placeholder="pace"
                      value={set.pace}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateSet(ex.id, i, 'pace', e.target.value)
                      }
                    />
                  </>
                )}

                <button
                  className={styles.deleteSetButton}
                  onClick={() => removeSet(ex.id, i)}
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              className={styles.addSetButton}
              onClick={() => addSet(ex.id)}
            >
              + Add Set
            </button>
          </div>
        ))}

        <button
          className={styles.addExerciseButton}
          onClick={() => setShowExercisePicker(true)}
        >
          + Add Exercise
        </button>

        {showExercisePicker && (
          <div className={styles.exercisePicker}>
            <p className={styles.exercisePickerTitle}>Pick an exercise:</p>
            <div className={styles.exerciseList}>
              {allExercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => addExercise(ex)}
                  className={`${styles.exerciseOption} ${
                    exercises.find((e) => e.id === ex.id)
                      ? styles.exerciseOptionSelected
                      : ''
                  }`}
                >
                  {ex.name}
                  <span className={styles.exerciseTag}>({ex.type})</span>
                </div>
              ))}
            </div>
            <button
              className={styles.createExerciseButton}
              onClick={() => setShowNewExerciseForm(true)}
            >
              + Create new exercise
            </button>

            {showNewExerciseForm && (
              <div className={styles.newExerciseForm}>
                <input
                  className={styles.newExerciseInput}
                  placeholder="Name"
                  value={newExercise.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setNewExercise((p) => ({ ...p, name: e.target.value }))
                  }
                />
                <select
                  className={styles.newExerciseSelect}
                  value={newExercise.muscle_group}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setNewExercise((p) => ({
                      ...p,
                      muscle_group: e.target.value as MuscleGroup
                    }))
                  }
                >
                  {MUSCLE_GROUPS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <select
                  className={styles.newExerciseSelect}
                  value={newExercise.type}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setNewExercise((p) => ({
                      ...p,
                      type: e.target.value as ExerciseType
                    }))
                  }
                >
                  <option value="weighted">Weighted</option>
                  <option value="bodyweight">Bodyweight</option>
                  <option value="cardio">Cardio</option>
                </select>
                <button
                  className={styles.newExerciseAddButton}
                  onClick={createAndAddExercise}
                >
                  Add
                </button>
              </div>
            )}
          </div>
        )}

        <div className={styles.modalActions}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.saveButton} onClick={handleSave}>
            Save Workout
          </button>
        </div>
      </div>
    </div>
  )
}