from flask import Flask
from flask_cors import CORS
from routes.workouts import workouts_bp
from routes.templates import templates_bp
from routes.progress import progress_bp
from routes.planner import planner_bp
from routes.exercises import exercises_bp

app = Flask(__name__)
CORS(app, origins="http://localhost:5173")

app.register_blueprint(workouts_bp, url_prefix="/api/workouts")
app.register_blueprint(templates_bp, url_prefix="/api/templates")
app.register_blueprint(progress_bp, url_prefix="/api/progress")
app.register_blueprint(planner_bp, url_prefix="/api/planner")
app.register_blueprint(exercises_bp, url_preefix="/api/exercises")






if __name__ == __main__:
    app.run(debug=True)
