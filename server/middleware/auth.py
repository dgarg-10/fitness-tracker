import os
from functools import wraps
import httpx
from flask import request, jsonify
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase_auth = create_client(
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
        # supabase_auth is a long-lived client; its pooled connection can go
        # stale between bursts of requests and get closed by the remote,
        # surfacing as a transport error rather than an actual invalid token.
        # Retry once before giving up, so that blip isn't mistaken for a bad
        # session and used to log the user out client-side.
        for attempt in range(2):
            try:
                user_response = supabase_auth.auth.get_user(token)
                if not user_response or not user_response.user:
                    return jsonify({"error": "Invalid token"}), 401
                request.user_id = user_response.user.id
                return f(*args, **kwargs)
            except httpx.TransportError as e:
                if attempt == 0:
                    continue
                print("Auth error (transient):", e)
                return jsonify({"error": "Auth service unavailable"}), 503
            except Exception as e:
                print("Auth error:", e)
                return jsonify({"error": "Invalid token"}), 401
    return decorated