from functools import wraps
from flask import request, jsonify
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

# Separate client using the anon key specifically for verifying user tokens
_auth_client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_ANON_KEY")
)

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == 'OPTIONS':
            return f(*args, **kwargs)

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Unauthorized"}), 401
        token = auth_header.split(" ")[1]
        try:
            user = _auth_client.auth.get_user(token)
            request.user_id = user.user.id
        except Exception as e:
            print("Auth error:", e)
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)
    return decorated