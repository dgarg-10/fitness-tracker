# Fitness Tracker

A full-stack workout logging app that lets you track exercises, log sets, monitor progress over time, plan your weekly training schedule, and save reusable workout templates.

🔗 https://your-fitnesstracker.vercel.app/

> Note: the backend is hosted on Render's free tier and may take ~30 seconds to wake up on the first request.

## Screenshot

<img width="1500" height="740" alt="Image" src="https://github.com/user-attachments/assets/817f9e02-3265-483d-ab4b-ed73b14ef175" />

## Features

- Log workouts with exercises, sets, reps, and weight
- Support for weighted, bodyweight, and cardio exercise types
- Automatic personal record detection on every workout save
- Reusable workout templates (e.g. Push Day, Leg Day)
- Weekly planner to schedule training days in advance
- Progress charts showing max weight over time per exercise with PR callouts
- Full workout history with search by name or exercise

## Tech Stack

- **Frontend:** React, TypeScript, Vite, CSS Modules
- **Backend:** Flask (Python)
- **Database:** PostgreSQL via Supabase
- **Auth:** Supabase Auth with JWT-based session management
- **Deployment:** Vercel (frontend), Render (backend)

## Architecture

```
React + Vite (Vercel)  →  Flask REST API (Render)  →  Supabase Postgres
```

## Running Locally

```bash
# Clone the repo
git clone https://github.com/dgarg-10/fitness-tracker.git
cd fitness_tracker

# Backend setup
cd server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py

# Frontend setup (in a new terminal)
cd client
npm install
npm run dev
```

You need to set up environment variables in both `server/.env` and `client/.env`.

For `server/.env`:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
```

For `client/.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:5001
```

The frontend runs on `http://localhost:5173` and expects the backend on `http://localhost:5001`.

## What I Learned

I learned about the complexity of coordinating two separate deployments across Vercel and Render. Hosting the React frontend on Vercel and the Flask backend on Render meant configuring CORS carefully so the deployed frontend could actually reach the API. Each platform handled its half well, but managing environment variables across two separate dashboards and keeping them in sync added real overhead.

I also learned about the tradeoffs of using a managed database provider versus self-hosting. I picked Supabase for the managed PostgreSQL instance, built-in auth, and Row Level Security policies. This creates a vendor dependency, as I experienced firsthand when Supabase had a multi-day infrastructure incident that took the app down despite having no bugs in my own code, but the underlying database is still standard PostgreSQL if I ever need to migrate.

## Technical Decisions

I enforced per-user data isolation at the database layer using PostgreSQL Row Level Security policies rather than relying solely on application-level checks. This means even if the Flask auth logic contained a bug, the database itself would reject unauthorized reads and writes. The tradeoff is added schema complexity, but the security guarantee is much stronger than checking ownership only in Python.

For the workout modal, I batched all state changes locally in React and committed them in a single API call on save rather than writing to the database on every set change. This keeps the UI feeling instant during active logging and reduces write operations from potentially dozens per session to one, at the cost of data loss if the session is interrupted before saving.

I deliberately separated the frontend and backend into two independent services rather than using Flask templates to serve HTML directly. This meant React owns all the UI and Flask purely handles data by returning JSON responses with no knowledge of how they get rendered. The tradeoff is added complexity around CORS configuration and coordinating deployments across two platforms, but the backend is now completely client-agnostic. The same Flask API could serve a mobile app or any other client in the future without a single change to the server.