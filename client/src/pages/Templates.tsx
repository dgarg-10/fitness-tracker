import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import api from '../services/api'
import type { Template, Exercise } from '../types'
import styles from './Templates.module.css'


export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [showForm, setShowForm] = useState<boolean>(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [name, setName] = useState<string>('')
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([])

  useEffect(() => {
    fetchTemplates()
    fetchExercises()
  }, [])

  const fetchTemplates = async (): Promise<void> => {
    const res = await api.get<Template[]>('/api/templates/')
    setTemplates(res.data)
  }

  const fetchExercises = async (): Promise<void> => {
    const res = await api.get<Exercise[]>('/api/exercises/')
    setExercises(res.data)
  }

  const openNew = (): void => {
    setEditingTemplate(null)
    setName('')
    setSelectedExercises([])
    setShowForm(true)
  }

  const openEdit = (template: Template): void => {
    setEditingTemplate(template)
    setName(template.name)
    setSelectedExercises(template.template_exercises.map((te) => te.exercises))
    setShowForm(true)
  }

  const handleSave = async (): Promise<void> => {
    if (!name.trim()) return
    const payload = { name, exercises: selectedExercises }
    if (editingTemplate) {
      await api.put(`/api/templates/${editingTemplate.id}`, payload)
    } else {
      await api.post('/api/templates/', payload)
    }
    setShowForm(false)
    fetchTemplates()
  }

  const handleDelete = async (id: string): Promise<void> => {
    if (!window.confirm('Delete this template?')) return
    await api.delete(`/api/templates/${id}`)
    fetchTemplates()
  }

  const toggleExercise = (ex: Exercise): void => {
    setSelectedExercises((prev) =>
      prev.find((e) => e.id === ex.id)
        ? prev.filter((e) => e.id !== ex.id)
        : [...prev, ex]
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Templates</h2>
        <button className={styles.button} onClick={openNew}>
          + New Template
        </button>
      </div>

      {templates.length === 0 && (
        <p className={styles.empty}>No templates yet. Create your first one!</p>
      )}

      {templates.map((t) => (
        <div key={t.id} className={styles.templateCard}>
          <div className={styles.templateHeader}>
            <div>
              <span className={styles.templateName}>{t.name}</span>
            </div>
            <div className={styles.templateActions}>
              <button
                className={styles.actionButton}
                onClick={() => openEdit(t)}
              >
                Edit
              </button>
              <button
                className={styles.deleteButton}
                onClick={() => handleDelete(t.id)}
              >
                Delete
              </button>
            </div>
          </div>
          <p className={styles.templateExercises}>
            {t.template_exercises.map((te) => te.exercises.name).join(', ') || 'No exercises'}
          </p>
        </div>
      ))}

      {showForm && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>
              {editingTemplate ? 'Edit Template' : 'New Template'}
            </h3>
            <input
              className={styles.input}
              placeholder="Template name (e.g. Push Day)"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            />
            <p className={styles.exercisePickerTitle}>Select Exercises:</p>
            {exercises.map((ex) => (
              <div
                key={ex.id}
                onClick={() => toggleExercise(ex)}
                className={`${styles.exerciseOption} ${
                  selectedExercises.find((e) => e.id === ex.id)
                    ? styles.exerciseOptionSelected
                    : ''
                }`}
              >
                {ex.name}
                <span className={styles.exerciseTag}>({ex.muscle_group})</span>
              </div>
            ))}
            <div className={styles.modalActions}>
              <button className={styles.button} onClick={handleSave}>
                Save
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}