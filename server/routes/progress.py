from flask import Blueprint, jsonify, request
from db import supabase
from middleware.auth import require_auth

progress_bp = Blueprint('progress', __name__)

@progress_bp.route('/exercise/<exercise_id>', methods=['GET'])
@require_auth
def get_exercise_progress(exercise_id):
    user_id = request.user_id

    workout_exercises = supabase.table('workout_exercises').select(
        '*, workouts(date, user_id), sets(*)'
    ).eq('exercise_id', exercise_id).execute()

    points = []
    for we in workout_exercises.data:
        if we['workouts']['user_id'] != user_id:
            continue
        weighted_sets = [s for s in we['sets'] if s.get('weight')]
        if not weighted_sets:
            continue
        max_weight = max(s['weight'] for s in weighted_sets)
        points.append({
            'date': we['workouts']['date'],
            'max_weight': max_weight
        })

    points.sort(key=lambda x: x['date'])

    pr = supabase.table('personal_records').select('*').eq(
        'user_id', user_id
    ).eq('exercise_id', exercise_id).execute()

    return jsonify({
        'points': points,
        'pr': pr.data[0] if pr.data else None
    })