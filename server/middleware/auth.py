from functools import wraps
from flask import request, jsonify
import jwt
from dotenv import load_dotenv

load_dotenv()

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
            payload = jwt.decode(
                token,
                options={
                    "verify_signature": False,
                    "verify_aud": False
                }
            )
            request.user_id = payload["sub"]
        except jwt.InvalidTokenError as e:
            print("Auth error:", e)
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)
    return decorated