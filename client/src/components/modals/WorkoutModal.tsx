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
  Template,
  WeeklyPlan
} from '../../types'
import styles from './WorkoutModal.module.css'
import { toLocalDateString } from '../../utils/date'

const DAYS: string[] = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
]

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
    workout?.date ?? toLocalDateString(new Date())
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
  const [templates, setTemplates] = useState<Template[]>([])
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([])
  const [showTemplatePicker, setShowTemplatePicker] = useState<boolean>(false)
  const [showDayPicker, setShowDayPicker] = useState<boolean>(false)

  useEffect(() => {
    fetchExercises()
    fetchTemplates()
    fetchWeeklyPlans()
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

  const fetchTemplates = async (): Promise<void> => {
    const res = await api.get<Template[]>('/api/templates/')
    setTemplates(res.data)
  }

  const fetchWeeklyPlans = async (): Promise<void> => {
    const res = await api.get<WeeklyPlan[]>('/api/planner/')
    setWeeklyPlans(res.data)
  }

  const mergeTemplateExercises = (templatesToApply: Template[]): void => {
    setExercises((prev) => {
      const existingIds = new Set(prev.map((e) => e.id))
      const additions: ModalExercise[] = []
      templatesToApply.forEach((t) => {
        t.template_exercises
          .slice()
          .sort((a, b) => a.order_index - b.order_index)
          .forEach((te) => {
            if (existingIds.has(te.exercises.id)) return
            existingIds.add(te.exercises.id)
            additions.push({
              id: te.exercises.id,
              name: te.exercises.name,
              type: te.exercises.type,
              muscle_group: te.exercises.muscle_group,
              sets: []
            })
          })
      })
      return [...prev, ...additions]
    })
  }

  const applyTemplate = (t: Template): void => {
    mergeTemplateExercises([t])
    if (!name.trim()) setName(t.name)
    setShowTemplatePicker(false)
  }

  const applyPlannedTemplateIds = (templateIds: string[]): void => {
    const matched = templateIds
      .map((id) => templates.find((t) => t.id === id))
      .filter((t): t is Template => !!t)
    mergeTemplateExercises(matched)
    setShowDayPicker(false)
  }

  const openExercisePicker = (): void => {
    setShowExercisePicker(true)
    setShowTemplatePicker(false)
    setShowDayPicker(false)
  }

  const openTemplatePicker = (): void => {
    setShowTemplatePicker(true)
    setShowExercisePicker(false)
    setShowDayPicker(false)
  }

  const openDayPicker = (): void => {
    setShowDayPicker(true)
    setShowExercisePicker(false)
    setShowTemplatePicker(false)
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

  const plannedDayGroups = DAYS.map((day, i) => ({
    label: day,
    templateIds: weeklyPlans
      .filter((p) => p.day_of_week === i && p.template_id)
      .map((p) => p.template_id as string)
  })).filter((g) => g.templateIds.length > 0)

  const plannedDateGroups = Array.from(
    new Set(
      weeklyPlans.filter((p) => p.date && p.template_id).map((p) => p.date as string)
    )
  )
    .sort()
    .map((date) => ({
      label: date,
      templateIds: weeklyPlans
        .filter((p) => p.date === date && p.template_id)
        .map((p) => p.template_id as string)
    }))

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
          onClick={openExercisePicker}
        >
          + Add Exercise
        </button>
        <button
          className={styles.addExerciseButton}
          onClick={openTemplatePicker}
        >
          + Add Template as Workout
        </button>
        <button
          className={styles.addExerciseButton}
          onClick={openDayPicker}
        >
          + Add From a Planned Day
        </button>

        {showExercisePicker && (
          <div className={styles.exercisePicker}>
            <div className={styles.pickerHeader}>
              <p className={styles.exercisePickerTitle}>Pick an exercise:</p>
              <button
                className={styles.pickerCloseButton}
                onClick={() => setShowExercisePicker(false)}
                aria-label="Close exercise picker"
              >
                ✕
              </button>
            </div>
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

        {showTemplatePicker && (
          <div className={styles.exercisePicker}>
            <div className={styles.pickerHeader}>
              <p className={styles.exercisePickerTitle}>Pick a template:</p>
              <button
                className={styles.pickerCloseButton}
                onClick={() => setShowTemplatePicker(false)}
                aria-label="Close template picker"
              >
                ✕
              </button>
            </div>
            <div className={styles.exerciseList}>
              {templates.length === 0 && (
                <p className={styles.exerciseTag}>No templates yet.</p>
              )}
              {templates.map((t) => (
                <div
                  key={t.id}
                  onClick={() => applyTemplate(t)}
                  className={styles.exerciseOption}
                >
                  {t.name}
                  <span className={styles.exerciseTag}>
                    ({t.template_exercises.map((te) => te.exercises.name).join(', ') || 'no exercises'})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showDayPicker && (
          <div className={styles.exercisePicker}>
            <div className={styles.pickerHeader}>
              <p className={styles.exercisePickerTitle}>Pick a planned day:</p>
              <button
                className={styles.pickerCloseButton}
                onClick={() => setShowDayPicker(false)}
                aria-label="Close planned day picker"
              >
                ✕
              </button>
            </div>
            <div className={styles.exerciseList}>
              {plannedDayGroups.length === 0 && plannedDateGroups.length === 0 && (
                <p className={styles.exerciseTag}>No planned days with templates yet.</p>
              )}
              {plannedDayGroups.map((g) => (
                <div
                  key={g.label}
                  onClick={() => applyPlannedTemplateIds(g.templateIds)}
                  className={styles.exerciseOption}
                >
                  {g.label}
                  <span className={styles.exerciseTag}>
                    ({g.templateIds
                      .map((id) => templates.find((t) => t.id === id)?.name ?? 'Template')
                      .join(', ')})
                  </span>
                </div>
              ))}
              {plannedDateGroups.map((g) => (
                <div
                  key={g.label}
                  onClick={() => applyPlannedTemplateIds(g.templateIds)}
                  className={styles.exerciseOption}
                >
                  {g.label}
                  <span className={styles.exerciseTag}>
                    ({g.templateIds
                      .map((id) => templates.find((t) => t.id === id)?.name ?? 'Template')
                      .join(', ')})
                  </span>
                </div>
              ))}
            </div>
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