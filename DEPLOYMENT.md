# StudyFlow AI — Public Deployment Guide

## Recommended: Render

This repository is prepared for a single-service deployment. The Node/Express server serves the built React application and `/api` from the same URL.

### 1. Push to GitHub
Create a public GitHub repository and push the project contents.

### 2. Create the Render service
Create a **Web Service** from the repository. The included `render.yaml` contains the build/start/health configuration.

If entering settings manually:

- **Build command:** `npm ci --prefix client && npm run build --prefix client && npm ci --prefix server --omit=dev`
- **Start command:** `node server/server.js`
- **Health check path:** `/health`

### 3. Environment variables
Set:

- `AUTH_SECRET` — a long random secret. Render can generate it when using `render.yaml`.
- `GEMINI_API_KEY` — optional; set it to enable live Gemini responses.
- `GEMINI_MODEL` — optional; defaults to `gemini-1.5-flash`.

Never commit real API keys or production secrets.

### 4. Verify the deployment
Open:

- `/health` — should return JSON with `status: healthy`.
- `/` — should show the StudyFlow AI login screen.

Sign in with the demo student account or create a new student account. For the Admin Dashboard, use the demo admin account supplied in the README.

## Docker alternative

```bash
docker build -t studyflow-ai .
docker run --rm -p 5000:5000 \
  -e AUTH_SECRET="replace-with-a-random-secret" \
  -e GEMINI_API_KEY="your-gemini-key" \
  studyflow-ai
```

Then open `http://localhost:5000`.

## Storage limitation

The challenge intentionally keeps persistence in `server/src/db/data_store.json` and uploaded documents in `server/uploads`. This avoids requiring a hosted database. Cloud hosts with ephemeral disks may reset these files after a restart/redeploy, so this is appropriate for a prototype/demo rather than production. A production version should move the JSON store and uploads to durable managed storage.
