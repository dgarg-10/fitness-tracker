from flask import Blueprint, jsonify, request
from middleware.auth import require_auth
from db import supabase

planner_bp = Blueprint('planner', __name__)

@planner_bp.route('/', methods=["GET"])
@require_auth
def get_planner():
    user_id = request.user_id
    result = supabase.table('weekly_plan').select(
        '*, templates(name)'
    ).eq('user_id', user_id).execute()
    return jsonify(result.data)

@planner_bp.route('/', methods=["POST"])
@require_auth
def create_planner():
    user_id = request.user_id
    data = request.json
    result = supabase.table('weekly_plan').insert({
        'user_id': user_id,
        'day_of_week': data.get('day_of_week'),
        'date': data.get('date'),
        'template_id': data.get('template_id'),
        'name': data.get('name')
    }).execute()
    return jsonify(result.data[0]), 201

@planner_bp.route('/<weekly_plan_id>', methods=["DELETE"])
@require_auth
def delete_planner(weekly_plan_id):
    user_id = request.user_id
    supabase.table('weekly_plan').delete().eq(
        'id', weekly_plan_id
    ).eq('user_id', user_id).execute()
    return jsonify({'success': True})