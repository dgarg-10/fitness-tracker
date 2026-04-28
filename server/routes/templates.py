from flask import jsonify, request, Blueprint
from db import supabase
from middleware.auth import require_auth

templates_bp = Blueprint('templates', __name__)

@templates_bp.route('/', methods=["GET"])
@require_auth
def get_template():
    user_id = request.user_id
    result = supabase.table('templates').select(
    '*, template_exercises(*, exercises(*))'
    ).eq('user_id', user_id).order('created_at', desc=True).execute()
    return jsonify(result.data)

@templates_bp.route('/', methods=["POST"])
@require_auth
def create_template():
    user_id = request.user_id
    data = request.json
    template = supabase.table('templates').insert({
        'name': data['name'],
        'user_id': user_id
    }).execute()
    template_id = template.data[0]['id']
    for i, ex in enumerate(data.get('exercises', [])):
        supabase.table('templates').insert({
            'template_id': template_id,
            'exercise_id': ex['id'],
            'order_index': i
        }).execute()
    return template.data[0], 201

@templates_bp.route('/<template_id>', methods=["PUT"])
@require_auth
def update_template(template_id):
    user_id = request.user_id   
    body = request.json
    supabase.table('templates').update({
        'name': body['name']
    }).eq('id', template_id).eq('user_id', user_id).execute()
    supabase.table('template_exercises').delete().eq(
        'template_id', template_id
    ).execute()
    for i, ex in enumerate(body.get('exercises', [])):
        supabase.table('template_exercises').insert({
            'template_id': template_id,
            'exercise_id': ex['id'],
            'order_index': i
        }).execute()
    return jsonify({'success': True})

@templates_bp.route('/<template_id>', methods=["DELETE"])
@require_auth
def delete_template(template_id):
    user_id = request.user_id
    supabase.table('templates').delete().eq(
        'id', template_id
    ).eq('user_id', user_id).execute()
    return jsonify({'success': True})

