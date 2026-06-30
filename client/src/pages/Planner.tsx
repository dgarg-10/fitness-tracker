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
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [customName, setCustomName] = useState<string>('')

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

  const handleAssign = async (): Promise<void> => {
    const payload: Record<string, string | number | null> = {
      template_id: selectedTemplate || null,
      name: customName || null
    }
    if (tab === 'weekly') payload.day_of_week = selectedDay
    else payload.date = selectedDate

    await api.post('/api/planner/', payload)
    setSelectedDay(null)
    setSelectedDate('')
    setSelectedTemplate('')
    setCustomName('')
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
                    <span>{p.name ?? p.templates?.name ?? 'Unnamed'}</span>
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
          <div className={styles.calendarControls}>
            <input
              className={styles.input}
              type="date"
              value={selectedDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSelectedDate(e.target.value)}
            />
            <select
              className={styles.input}
              value={selectedTemplate}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedTemplate(e.target.value)}
            >
              <option value="">-- Select template (optional) --</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <input
              className={styles.input}
              placeholder="Custom label (optional)"
              value={customName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomName(e.target.value)}
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
            <select
              className={styles.input}
              value={selectedTemplate}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedTemplate(e.target.value)}
              style={{ width: '100%', marginBottom: 8 }}
            >
              <option value="">-- Select template (optional) --</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <input
              className={styles.input}
              placeholder="Custom label (optional)"
              value={customName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomName(e.target.value)}
              style={{ width: '100%' }}
            />
            <div className={styles.modalActions}>
              <button className={styles.addButton} onClick={handleAssign}>
                Save
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setSelectedDay(null)}
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