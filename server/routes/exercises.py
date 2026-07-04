from flask import jsonify, request, Blueprint
from db import supabase
from middleware.auth import require_auth

exercises_bp = Blueprint('exercises', __name__)


@exercises_bp.route('/', methods=['GET'])
@require_auth
def get_exercise():
    user_id = request.user_id
    result = supabase.table('exercises').select('*').or_(
    f'user_id.is.null,user_id.eq.{user_id}'
    ).execute() 
    return jsonify(result.data)


@exercises_bp.route('/', methods=["POST"])
@require_auth
def create_exercise():
    user_id = request.user_id
    data = request.json
    result = supabase.table('exercises').insert({
        'user_id': user_id,
        'name': data['name'],
        'muscle_group': data['muscle_group'],
        'type': data['type'],
        'is_custom': True
    }).execute()
    return jsonify(result.data[0]), 201


@exercises_bp.route('/<exercise_id>', methods=["PUT"])
@require_auth
def update_exercise(exercise_id):
    user_id = request.user_id
    data = request.json
    result = supabase.table('exercises').update({
        'name': data['name'],
        'muscle_group': data['muscle_group'],
        'type': data['type']
    }).eq('id', exercise_id).eq('user_id', user_id).execute()
    if not result.data:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(result.data[0])


@exercises_bp.route('/<exercise_id>', methods=['DELETE'])
@require_auth
def delete_exercise(exercise_id):
    user_id = request.user_id
    templates_result = supabase.table('templates').select('id').eq(
        'user_id', user_id
    ).execute()
    template_ids = [t['id'] for t in templates_result.data]
    if template_ids:
        supabase.table('template_exercises').delete().eq(
            'exercise_id', exercise_id
        ).in_('template_id', template_ids).execute()

    supabase.table('exercises').delete().eq(
        'id', exercise_id
    ).eq('user_id', user_id).execute()
    return jsonify({'success': True})