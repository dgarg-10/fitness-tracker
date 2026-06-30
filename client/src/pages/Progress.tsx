import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceDot
} from 'recharts'
import api from '../services/api'
import type { Exercise, ExerciseProgress, ProgressPoint } from '../types'
import styles from './Progress.module.css'

export default function Progress() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [progressData, setProgressData] = useState<ExerciseProgress | null>(null)

  useEffect(() => {
    api.get<Exercise[]>('/api/exercises/').then((res) => {
      const trackable = res.data.filter(
        (e) => e.type === 'weighted' || e.type === 'bodyweight'
      )
      setExercises(trackable)
    })
  }, [])

  const loadProgress = async (ex: Exercise): Promise<void> => {
    setSelectedExercise(ex)
    const res = await api.get<ExerciseProgress>(`/api/progress/exercise/${ex.id}`)
    setProgressData(res.data)
  }

  const prPoint: ProgressPoint | undefined = progressData?.pr
    ? progressData.points.find((p) => p.max_weight === progressData.pr?.weight)
    : undefined

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Progress</h2>

      <div className={styles.pills}>
        {exercises.map((ex) => (
          <button
            key={ex.id}
            className={selectedExercise?.id === ex.id ? styles.pillActive : styles.pill}
            onClick={() => loadProgress(ex)}
          >
            {ex.name}
          </button>
        ))}
      </div>

      {progressData && selectedExercise && (
        <div>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>
              {selectedExercise.name} — Max Weight Over Time
            </h3>
            {progressData.pr && (
              <div className={styles.prBadge}>
                🏆 PR: {progressData.pr.weight} lbs × {progressData.pr.reps} reps
              </div>
            )}
          </div>

          {progressData.points.length === 0 ? (
            <p className={styles.empty}>No data logged yet for this exercise.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData.points}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis unit=" lbs" tick={{ fontSize: 12 }} />
                <Tooltip formatter={(val) => [`${val} lbs`, 'Max Weight']} />
                <Line
                  type="monotone"
                  dataKey="max_weight"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                {prPoint && (
                  <ReferenceDot
                    x={prPoint.date}
                    y={prPoint.max_weight}
                    r={7}
                    fill="#facc15"
                    stroke="#ca8a04"
                    label="PR"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {!progressData && (
        <p className={styles.empty}>Select an exercise above to see your progress.</p>
      )}
    </div>
  )
}