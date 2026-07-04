import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import api from '../services/api'
import type { WeeklyPlan, Template } from '../types'
import styles from './Planner.module.css'

const DAYS: string[] = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
]

export default function Planner() {
  const [plans, setPlans] = useState<WeeklyPlan[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [tab, setTab] = useState<'weekly' | 'calendar'>('weekly')
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([])
  const [customName, setCustomName] = useState<string>('')
  const [notes, setNotes] = useState<string>('')

  useEffect(() => {
    fetchPlans()
    fetchTemplates()
  }, [])

  const fetchPlans = async (): Promise<void> => {
    const res = await api.get<WeeklyPlan[]>('/api/planner/')
    setPlans(res.data)
  }

  const fetchTemplates = async (): Promise<void> => {
    const res = await api.get<Template[]>('/api/templates/')
    setTemplates(res.data)
  }

  const toggleTemplate = (id: string): void => {
    setSelectedTemplateIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  const handleAssign = async (): Promise<void> => {
    const payload: Record<string, string | number | null | (string | null)[]> = {
      template_ids: selectedTemplateIds.length ? selectedTemplateIds : [null],
      name: selectedTemplateIds.length ? null : (customName || null),
      notes: notes || null
    }
    if (tab === 'weekly') payload.day_of_week = selectedDay
    else payload.date = selectedDate

    await api.post('/api/planner/', payload)
    setSelectedDay(null)
    setSelectedDate('')
    setSelectedTemplateIds([])
    setCustomName('')
    setNotes('')
    fetchPlans()
  }

  const handleDelete = async (id: string): Promise<void> => {
    await api.delete(`/api/planner/${id}`)
    fetchPlans()
  }

  const weeklyPlans = plans.filter(
    (p) => p.day_of_week !== null && p.day_of_week !== undefined
  )
  const datePlans = plans.filter((p) => p.date)

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Planner</h2>

      <div className={styles.tabs}>
        {(['weekly', 'calendar'] as const).map((t) => (
          <button
            key={t}
            className={tab === t ? styles.tabActive : styles.tab}
            onClick={() => setTab(t)}
          >
            {t === 'weekly' ? 'Weekly Routine' : 'Specific Dates'}
          </button>
        ))}
      </div>

      {tab === 'weekly' && (
        <div>
          {DAYS.map((day, i) => {
            const dayPlans = weeklyPlans.filter((p) => p.day_of_week === i)
            return (
              <div key={day} className={styles.dayRow}>
                <div className={styles.dayHeader}>
                  <span className={styles.dayName}>{day}</span>
                  <button
                    className={styles.assignButton}
                    onClick={() => setSelectedDay(i)}
                  >
                    + Assign
                  </button>
                </div>
                {dayPlans.map((p) => (
                  <div key={p.id} className={styles.planEntry}>
                    <div>
                      <span>{p.name ?? p.templates?.name ?? 'Unnamed'}</span>
                      {p.notes && <div className={styles.notesText}>{p.notes}</div>}
                    </div>
                    <button
                      className={styles.removeButton}
                      onClick={() => handleDelete(p.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {tab === 'calendar' && (
        <div>
          <div className={styles.calendarForm}>
            <input
              className={styles.input}
              type="date"
              value={selectedDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSelectedDate(e.target.value)}
            />
            <div className={styles.checklist}>
              {templates.map((t) => (
                <label key={t.id} className={styles.checklistItem}>
                  <input
                    type="checkbox"
                    checked={selectedTemplateIds.includes(t.id)}
                    onChange={() => toggleTemplate(t.id)}
                  />
                  {t.name}
                </label>
              ))}
            </div>
            <input
              className={styles.input}
              placeholder="Custom label (optional, used when no templates selected)"
              value={customName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomName(e.target.value)}
            />
            <textarea
              className={styles.notesInput}
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button className={styles.addButton} onClick={handleAssign}>
              Add
            </button>
          </div>

          {datePlans
            .slice()
            .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
            .map((p) => (
              <div key={p.id} className={styles.dateCard}>
                <div>
                  <strong>{p.date}</strong>
                  <span className={styles.dateLabel}>
                    {p.name ?? p.templates?.name ?? 'Unnamed'}
                  </span>
                  {p.notes && <div className={styles.notesText}>{p.notes}</div>}
                </div>
                <button
                  className={styles.removeButton}
                  onClick={() => handleDelete(p.id)}
                >
                  Remove
                </button>
              </div>
            ))}
        </div>
      )}

      {selectedDay !== null && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Assign to {DAYS[selectedDay]}</h3>
            <div className={styles.checklist} style={{ marginBottom: 8 }}>
              {templates.map((t) => (
                <label key={t.id} className={styles.checklistItem}>
                  <input
                    type="checkbox"
                    checked={selectedTemplateIds.includes(t.id)}
                    onChange={() => toggleTemplate(t.id)}
                  />
                  {t.name}
                </label>
              ))}
            </div>
            <input
              className={styles.input}
              placeholder="Custom label (optional, used when no templates selected)"
              value={customName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomName(e.target.value)}
              style={{ width: '100%', marginBottom: 8 }}
            />
            <textarea
              className={styles.notesInput}
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: '100%' }}
            />
            <div className={styles.modalActions}>
              <button className={styles.addButton} onClick={handleAssign}>
                Save
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => {
                  setSelectedDay(null)
                  setSelectedTemplateIds([])
                  setCustomName('')
                  setNotes('')
                }}
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