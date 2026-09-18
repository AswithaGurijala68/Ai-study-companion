# StudyFlow AI — Public Deployment Guide

## Live Deployment Links

- **Frontend Client:** [https://ai-study-companion-client.onrender.com](https://ai-study-companion-client.onrender.com)
- **Backend API:** [https://ai-study-companion-server-ysjy.onrender.com](https://ai-study-companion-server-ysjy.onrender.com)
- **API Health Check:** [https://ai-study-companion-server-ysjy.onrender.com/health](https://ai-study-companion-server-ysjy.onrender.com/health)

---

## Deployment Architecture Options

### Option A: Separate Frontend & Backend Services (Current Live Setup)

#### 1. Backend Web Service (Render)
- **Service Type:** Web Service
- **Root Directory:** `server` (or repository root)
- **Build Command:** `npm ci --prefix server --omit=dev`
- **Start Command:** `node server/server.js`
- **Health Check Path:** `/health`
- **Environment Variables:**
  - `PORT`: `5000` (or Render default)
  - `NODE_ENV`: `production`
  - `AUTH_SECRET`: A long random secret key
  - `CORS_ORIGIN`: `https://ai-study-companion-client.onrender.com,http://localhost:5173`
  - `GEMINI_API_KEY`: *(Optional)* Your Google Gemini API key
  - `GEMINI_MODEL`: `gemini-1.5-flash`

#### 2. Frontend Static Site (Render)
- **Service Type:** Static Site
- **Root Directory:** `client` (or repository root)
- **Build Command:** `npm ci && npm run build` (or `npm ci --prefix client && npm run build --prefix client`)
- **Publish Directory:** `dist` (or `client/dist`)
- **Environment Variables:**
  - `VITE_API_URL`: `https://ai-study-companion-server-ysjy.onrender.com/api`

---

### Option B: Unified Full-Stack Service
The Node/Express server serves the built React application and `/api` from the same single URL.
- **Build Command:** `npm ci --prefix client && npm run build --prefix client && npm ci --prefix server --omit=dev`
- **Start Command:** `node server/server.js`
- **Health Check Path:** `/health`

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
