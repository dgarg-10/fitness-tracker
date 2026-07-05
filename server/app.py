from flask import Flask
from flask_cors import CORS
from routes.workouts import workouts_bp
from routes.templates import templates_bp
from routes.progress import progress_bp
from routes.planner import planner_bp
from routes.exercises import exercises_bp

app = Flask(__name__)

CORS(app, 
     resources={r"/api/*": {"origins": "your-fitnesstracker.vercel.app"}},
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     supports_credentials=True
)

app.register_blueprint(workouts_bp, url_prefix="/api/workouts")
app.register_blueprint(templates_bp, url_prefix="/api/templates")
app.register_blueprint(progress_bp, url_prefix="/api/progress")
app.register_blueprint(planner_bp, url_prefix="/api/planner")
app.register_blueprint(exercises_bp, url_prefix="/api/exercises")

if __name__ == "__main__":
    app.run(debug=True)