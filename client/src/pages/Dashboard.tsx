import { useEffect, useState } from 'react'
import api from "../services/api"
import type { Workout, WeeklyPlan, Template } from "../types/index"
import styles from "./Dashboard.module.css"
import WorkoutModal from '../components/modals/WorkoutModal'



export default function Dashboard(){
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
    const [todaysPlan, setTodaysPlan] = useState<WeeklyPlan | null>(null)
    const [planTemplate, setPlanTemplate] = useState<Template | null>(null)

    const fetchTodaysPlan = async (): Promise<void> => {
        const res = await api.get<WeeklyPlan[]>('/api/planner/')
        const today = new Date()
        const todayDow = today.getDay()
        const todayDate = today.toISOString().split('T')[0]
        const match = res.data.find(
          (p) => p.day_of_week === todayDow || p.date === todayDate
        )
        setTodaysPlan(match ?? null)
    }

    const startPlannedWorkout = async (): Promise<void> => {
        if (!todaysPlan?.template_id) return
        const res = await api.get<Template>(`/api/templates/${todaysPlan.template_id}`)
        setPlanTemplate(res.data)
        setEditingWorkout(null)
        setShowModal(true)
      }

    const fetchWorkouts = async (): Promise<void> => {
        const res = await api.get<Workout[]>('/api/workouts/')
        setWorkouts(res.data)
    }

    useEffect(() => {
        fetchWorkouts()
        fetchTodaysPlan()
    }, [])

    const recentWorkouts: Workout[] = workouts.slice(0, 5);     
    const thisWeekCount = workouts.filter((w) => {
        const d = new Date(w.date)
        const now = new Date()
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        weekStart.setHours(0, 0, 0, 0)
        return d >= weekStart
    }).length

    const openNew = (): void => {
        setEditingWorkout(null);
        setShowModal(true);
    }

    const openEdit = (workout: Workout): void => {
        setEditingWorkout(workout);
        setShowModal(true);
    }

    const handleDelete = async (id: string): Promise<void> => {
        if(!window.confirm("Delete this workout?")) 
            return;
        await api.delete(`/api/workouts/${id}`)
        fetchWorkouts()
    }
    
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>My Dashboard</h2>
                <button className={styles.button} onClick={openNew}> + Log Workout</button>
            </div>


            {todaysPlan && (
                <div className={styles.workoutCard}>
                    <div className={styles.workoutHeader}>
                    <div>
                        <span className={styles.workoutName}>Today's Plan</span>
                        <span className={styles.workoutDate}>
                        {' '}— {todaysPlan.name ?? todaysPlan.templates?.name ?? 'Workout'}
                        </span>
                    </div>
                    <button className={styles.actionButton} onClick={startPlannedWorkout}>
                        Start
                    </button>
                    </div>
                </div>
            )}
            <div className={styles.statsRow}>
                {[
                    { label: "This Week", value: thisWeekCount},
                    { label: "Total Workouts", value: workouts.length}
                 ].map((stat) => (
                    <div key={stat.label} className={styles.statCard}>
                        <div className={styles.statValue}>{stat.value}</div>
                        <div className={styles.statLabel}>{stat.label}</div>
                    </div>
                 ))}
            </div>

            <h3 className={styles.sectionTitle}>Recent Workouts</h3>
            
            {
                recentWorkouts.length === 0 && (
                    <p className={styles.empty}>
                        No recent workouts. Log one when ready!
                    </p>
                )
            }

            { 
                recentWorkouts.map((workout) => (
                    <div key={workout.id} className={styles.workoutCard}>
                        <div className={styles.workoutHeader}>
                            <>
                                <span className={styles.workoutName}>{workout.name}</span>
                                <span className={styles.workoutDate}> - {workout.date}</span>
                            </>

                            <div className={styles.workoutActions}>
                                <button className={styles.actionButton} onClick={() => openEdit(workout)}>
                                    Edit
                                </button>
                                <button className={styles.deleteButton} onClick={() => handleDelete}>
                                    Delete
                                </button>
                            </div>
                        </div>

                        <p className={styles.workoutExercises}>
                            {workout.workout_exercises
                                .map((we) => we.exercises.name).join(', ')
                            }
                        </p>
                    </div>
                ))
            }

            {showModal && (
            <WorkoutModal
                workout={editingWorkout}
                template={planTemplate}
                onClose={() => {
                setShowModal(false)
                setPlanTemplate(null)
                }}
                onSave={fetchWorkouts}
            />
            )}
        </div>
    )
}