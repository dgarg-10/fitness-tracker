export type MuscleGroup = 
| 'chest'
| 'back'
| 'legs'
| 'shoulders'
| 'arms'
| 'core'
| 'cardio'
| 'other'

export type ExerciseType = 'weighted' | 'bodyweight' | 'cardio' | 'other'

export interface Exercise {
    id: string
    user_id: string | null
    name: string
    muscle_group: MuscleGroup
    type: ExerciseType
    is_custom: boolean
    created_at: string
}

export interface WorkoutSet {
    id?: string
    workout_exercise_id?: string
    set_number: number
    weight?: number | null
    reps?: number | null
    is_bodyweight?: boolean
    duration_seconds?: number | null
    distance_meters?: number | null

}

export interface WorkoutExercise {
    id: string
    workout_id: string
    exercise_id: string
    order_index: number
    exercises: Exercise
    sets: WorkoutSet[]
}

export interface Workout {
    id: string
    user_id: string
    name: string
    date: string
    notes: string | null
    reated_from_template_id: string | null
    created_at: string
    workout_exercises: WorkoutExercise[]
}

export interface TemplateExercise {
    id: string
    template_id: string
    exercise_id: string
    order_index: number
    exercises: Exercise
}
  
export interface Template {
    id: string
    user_id: string
    name: string
    created_at: string
    template_exercises: TemplateExercise[]
}
  
export interface WeeklyPlan {
    id: string
    user_id: string
    day_of_week: number | null
    date: string | null
    template_id: string | null
    name: string | null
    templates: { name: string } | null
}
export interface ProgressPoint {
    date: string
    max_weight: number
}
  
export interface PersonalRecord {
    id: string
    user_id: string
    exercise_id: string
    weight: number
    reps: number
    achieved_at: string
}
  
export interface ExerciseProgress {
    points: ProgressPoint[]
    pr: PersonalRecord | null
}
  
export interface ModalExercise {
    id: string
    name: string
    type: ExerciseType
    muscle_group: MuscleGroup
    sets: ModalSet[]
}
  
export interface ModalSet {
    set_number: number
    weight: string
    reps: string
    bodyweight: boolean
    duration_seconds: string
    distance_meters: string
    pace: string
}
