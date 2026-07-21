from flask import Blueprint, request, jsonify
from db import supabase
from middleware.auth import require_auth

workouts_bp = Blueprint('workouts', __name__)

@workouts_bp.route('/', methods=['GET'])
@require_auth
def get_workout():
    user_id = request.user_id
    result = supabase.table('workouts').select(
    '*, workout_exercises(*, exercises(*), sets(*))'
    ).eq('user_id', user_id).order('date', desc=True).execute()
    return jsonify(result.data)

@workouts_bp.route('/', methods=["POST"])
@require_auth
def create_workout():
    user_id = request.user_id
    data = request.json
    if not data.get("name") or not data.get("date"):
        return jsonify({"error": "name and date are required"}), 400
    for ex in data.get('exercises', []):
        if not ex.get("id"):
            return jsonify({"error": "each exercise requires an id"}), 400
        for s in ex.get("sets", []):
            if s.get("set_number") is None:
                return jsonify({"error": "each set requires a set_number"}), 400
    workout = supabase.table('workouts').insert({
        "user_id": user_id,
        "name": data["name"],
        "date": data["date"],
        "notes": data.get("notes"),
        "created_from_template_id": data.get("template_id")
    }).execute()
    workout_id = workout.data[0]["id"]
    for i, ex in enumerate(data.get('exercises', [])):
        we = supabase.table("workout_exercises").insert({
            "workout_id": workout_id,
            "exercise_id": ex["id"],
            "order_index": i
        }).execute()
        we_id = we.data[0]["id"]
        for s in ex.get("sets", []):
            supabase.table("sets").insert({
                "workout_exercise_id": we_id,
                "set_number": s["set_number"],
                "weight": s.get("weight") or None,
                "reps": s.get("reps") or None,
                "bodyweight": s.get('bodyweight', False),
                "duration_seconds": s.get("duration_seconds") or None,
                "distance_meters": s.get("distance_meters") or None,
                "pace": s.get("pace") or None
            }).execute()
    _update_prs(user_id, data.get('exercises', []))
    return jsonify(workout.data[0]), 201
    
@workouts_bp.route('/<workout_id>', methods=["PUT"])
@require_auth
def update_workout(workout_id):
    user_id = request.user_id
    body = request.json
    if not body.get("name"):
        return jsonify({"error": "name is required"}), 400
    for ex in body.get('exercises', []):
        if not ex.get("id"):
            return jsonify({"error": "each exercise requires an id"}), 400
        for s in ex.get("sets", []):
            if s.get("set_number") is None:
                return jsonify({"error": "each set requires a set_number"}), 400
    updated = supabase.table('workouts').update({
        'name': body['name'],
        'notes': body.get('notes')
    }).eq('id', workout_id).eq('user_id', user_id).execute()
    if not updated.data:
        return jsonify({'error': 'Not found'}), 404
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

@workouts_bp.route('/<workout_id>', methods=["DELETE"])
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
