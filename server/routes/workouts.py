from flask import Blueprint, request, jsonify
from db import supabase
from middleware.auth import require_auth

exercises_bp = Blueprint('workouts', __name__)

@exercises_bp.route('/', methods=['GET'])
@require_auth
def get_workout():
    user_id = request.user_id
    result = supabase.table('workouts').select(
    '*, workout_exercises(*, exercises(*), sets(*))'
    ).eq('user_id', user_id).order('date', desc=True).execute()
    return jsonify(result.data)

@exercises_bp.route('/', methods=["POST"])
@require_auth
def create_workout():
    user_id = request.user_id
    data = request.json
    workout = supabase.table('workouts').insert({
        "user_id": user_id,
        "name": data["name"],
        "date": data["date"],
        "notes": data.get("notes"),
        "created_from_template_id": data.get("template_id")
    }).execute()
    workout_id = workout.data[0]["id"]
    for i, ex in enumerate(data.get('exercises', [])):
        we = supabase.table("workouts_exercise").insert({
            "workout_id": workout_id,
            "exercise_id": ex["id"],
            "order_index": i
        })
        we_id = we.data[0]["id"]
        for s in we.get("sets", []):
            supabase.table("sets").insert({
                "workout_exercise_id": we_id,
                "set_number": s["set_number"],
                "weight": s.get("weight") or None,
                "reps": s.get("reps") or None,
                "bodyweight": s.get('bodyweight', False),
                "duration_seconds": s.get("duration_seconds") or None,
                "duration_meters": s.get("distance_meters") or None,
                "pace": s.get("pace") or None 
            }).execute()
        _update_prs(user_id, data.get('exercises', []))
        return jsonify(workout.data[0]), 201
    
@exercises_bp.route('/<workout_id>', methods=["PUT"])
@require_auth
def update_workout(workout_id):
    user_id = request.user_id
    body = request.json
    supabase.table('workouts').update({
        'name': body['name'],
        'notes': body.get('notes')
    }).eq('id', workout_id).eq('user_id', user_id).execute()
    supabase.table('workout_exercises').delete().eq(
        'workout_id', workout_id
    ).execute()
    for i, ex in enumerate(body.get('exercises', [])):
        we = supabase.table('workout_exercises').insert({
            'workout_id': workout_id,
            'exercise_id': ex['id'],
            'order_index': i
        }).execute()
        we_id = we.data[0]['id']
        for s in ex.get('sets', []):
            supabase.table('sets').insert({
                'workout_exercise_id': we_id,
                'set_number': s['set_number'],
                'weight': s.get('weight') or None,
                'reps': s.get('reps') or None,
                'bodyweight': s.get('bodyweight', False),
                'duration_seconds': s.get('duration_seconds') or None,
                'distance_meters': s.get('distance_meters') or None,
                'pace': s.get('pace') or None
            }).execute()
    _update_prs(user_id, body.get('exercises', []))
    return jsonify({'success': True})

@exercises_bp.route('/<workout_id>', methods=["DELETE"])
@require_auth
def delete_exercise(workout_id):
    user_id = request.user_id
    supabase.table('workouts').delete().eq(
        'id', workout_id
    ).eq('user_id', user_id).execute()
    return jsonify({'success': True})    

def _update_prs(user_id, exercises):
    for ex in exercises:
        weighted_sets = [
            s for s in ex.get('sets', [])
            if s.get('weight') and s.get('reps')
        ]
        if not weighted_sets:
            continue
        best = max(weighted_sets, key=lambda s: float(s.get('weight', 0)))
        existing = supabase.table('personal_records').select('*').eq(
            'user_id', user_id
        ).eq('exercise_id', ex['id']).execute()
        if not existing.data or float(best.get('weight', 0)) > float(existing.data[0]['weight'] or 0):
            if existing.data:
                supabase.table('personal_records').delete().eq(
                    'id', existing.data[0]['id']
                ).execute()
            supabase.table('personal_records').insert({
                'user_id': user_id,
                'exercise_id': ex['id'],
                'weight': float(best.get('weight', 0)),
                'reps': int(best.get('reps', 0))
            }).execute()
