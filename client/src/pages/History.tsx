import { useEffect, useState }from 'react'
import type {ChangeEvent} from 'react'
import api from "../services/api"
import type { Workout } from "../types/index"
import styles from "./History.module.css"
import WorkoutModal from '../components/modals/WorkoutModal'

export default function History(){
    const[workouts, setWorkouts] = useState<Workout[]>([]);
    const[search, setSearch] = useState<string>('');
    const[editingWorkout, setEditingWorkout] = useState<Workout|null>(null);
    const[showModal, setShowModal] = useState<boolean>(false);

    const fetchWorkouts = async (): Promise<void> => {
        const res = await api.get<Workout[]>("/api/workouts/")
        setWorkouts(res.data);
    }

    useEffect(() => {
        fetchWorkouts()
    }, [])

    const openEdit = (workout: Workout) => {
        setEditingWorkout(workout);
        setShowModal(true)
    }

    const handleDelete = async(id: string): Promise<void> => {
        if(!window.confirm("Delete this workout?"))
            return;
        await api.delete(`/api/workouts/${id}`);
        fetchWorkouts();
    }

    const filtered = workouts.filter( (w) => 
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.workout_exercises?.some((we) =>
        we.exercises.name.toLowerCase().includes(search.toLowerCase())
      )
    )


    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Your Workout History</h2>
                <input 
                    className={styles.searchInput}
                    placeholder="Search by workout name or exercise..." 
                    value={search}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                />
            </div>


            {
                filtered.length === 0 && (
                    <p className={styles.empty}>
                        {search ? 'No workouts match' : "No workouts logged yet"}
                    </p>
                )
            }

            {
                filtered.map((w) => (
                    <div key={w.id} className={styles.workoutCard}>
                        <>
                            <span className={styles.workoutName}>{w.name}</span>
                            <span className={styles.workoutDate}> - {w.date}</span>
                        </>

                        <div className={styles.workoutActions}>
                            <button 
                                className={styles.actionButton}
                                onClick={() => openEdit(w)}
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
                    
                        <p className={styles.workoutExercises}>
                            {w.workout_exercises.map((we) => we.exercises.name).join(', ')}
                        </p>

                        { w.notes && (
                            <p className={styles.workoutNotes}>Notes: {w.notes}</p>
                        )}
                    </div>
                ))
            }

            {/*{
                showModal && (
                    <WorkoutModal
                        workout={editingWorkout}
                        onClose={() => setShowModal(false)}
                        onSave={fetchWorkouts}
                    />
            )}
            */}
        </div>
    )
}