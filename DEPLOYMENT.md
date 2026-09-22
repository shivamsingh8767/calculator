# MATH/OS — Production Deployment & Operations Guide

This guide details the complete production architecture, configuration, environment setup, and deployment workflow for **MATH/OS**.

---

## 1. System Architecture

```text
┌──────────────────────────────────────────────────────────┐
│                   MATH/OS Client (SPA)                   │
│          HTML5 · CSS3 · Vanilla JavaScript (ES6+)        │
│          MathEngine (Local) · Formula Library UI         │
└────────────────────────────┬─────────────────────────────┘
                             │ HTTPS API Requests (fetch)
                             ▼
┌──────────────────────────────────────────────────────────┐
│                 Node.js / Express.js API                 │
│         Security Headers · Rate Limiting · CORS          │
│       /api/health · /api/formulas · /api/history         │
└────────────────────────────┬─────────────────────────────┘
                             │ Mongoose ODM (TLS / SRV)
                             ▼
┌──────────────────────────────────────────────────────────┐
│                   MongoDB Atlas Cluster                  │
│       Formulas (65 records) · Calculation History        │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Environment Variables

### Frontend (`.env` or Hosting Provider Environment)
| Variable | Description | Example (Development) | Example (Production) |
|---|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend REST API | `http://localhost:5000/api` | `https://api.yourdomain.com/api` |

*Note: The frontend never receives database credentials, secret keys, or Atlas connection strings.*

### Backend (`backend/.env` or Container Environment)
| Variable | Description | Example (Development) | Example (Production) |
|---|---|---|---|
| `PORT` | HTTP port for Express | `5000` | `5000` (or injected by Cloud Provider) |
| `NODE_ENV` | Runtime environment mode | `development` | `production` |
| `MONGODB_URI` | MongoDB Atlas SRV connection string | `mongodb+srv://user:pass@cluster.mongodb.net/mathos?retryWrites=true&w=majority` | `mongodb+srv://...` |
| `CLIENT_URL` | Allowed frontend origins (comma-separated) | `http://localhost:3000` | `https://mathos.yourdomain.com` |
| `RATE_LIMIT_MAX` | Request limit per 15 min per IP | `500` | `1000` |

---

## 3. MongoDB Atlas Provisioning

1. **Create Cluster:** Create a shared (M0 Free Tier) or dedicated cluster in your target region on MongoDB Atlas.
2. **Database User:** Under **Database Access**, create a user with read/write permissions to the `mathos` database (e.g., `Built-in Role: readWriteAnyDatabase` or scoped to `mathos`).
3. **Network Access:** Under **Network Access**, add an IP Access List entry. For elastic cloud container platforms (Cloud Run, Render, Railway, Heroku, AWS ECS), add `0.0.0.0/0` with strong database user credentials.
4. **Connection String:** Under **Clusters → Connect → Drivers (Node.js)**, copy the connection string. Replace `<password>` with the database user's password:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/mathos?retryWrites=true&w=majority
   ```

---

## 4. Local Development Setup

### Step A: Start the Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB Atlas URI
npm run seed     # One-time database seeding (65 formulas)
npm run dev      # Runs with nodemon on port 5000
```

### Step B: Start the Frontend
```bash
# In the root project directory:
npm install
npm run dev      # Runs Vite dev server on http://localhost:3000
```

---

## 5. Production Build & Deployment Steps

### Recommended Deployment Order
1. **Deploy & Seed Database:**
   - Configure Atlas cluster and set `MONGODB_URI`.
   - Run `npm run seed` inside `backend/` to populate the formula library catalog (65 formulas).
2. **Deploy Backend API:**
   - Deploy `backend/` to your server or container platform (e.g. Docker, Cloud Run, Render, Railway).
   - Set environment variables: `NODE_ENV=production`, `PORT=5000`, `MONGODB_URI=...`, `CLIENT_URL=https://<your-frontend-url>`.
   - Start command: `npm start`.
   - Verify health: `GET https://<your-backend-url>/api/health`.
   - Verify formulas: `GET https://<your-backend-url>/api/formulas`.
3. **Build & Deploy Frontend:**
   - Set build environment variable: `VITE_API_BASE_URL=https://<your-backend-url>/api`.
   - Execute production build:
     ```bash
     npm run build
     ```
   - Deploy the generated `dist/` directory to any static hosting provider (Vercel, Netlify, Cloudflare Pages, Firebase Hosting, S3/CloudFront).
4. **Final Verification:**
   - Open the production frontend URL.
   - Perform calculation (e.g., `25 + 25 = 50` and `sin(30)`).
   - Open History drawer to verify sync with MongoDB Atlas.
   - Test Formula search and copy actions.

---

## 6. Security & Operational Features

- **Zero Secrets in Frontend:** Client bundle is pure static assets with no credentials.
- **Production Error Sanitization:** The API suppresses stack traces and internal paths in all error responses.
- **Security Headers:** Express sends `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection`, `Referrer-Policy`, and `HSTS` (in production).
- **Abuse Protection:** In-memory rate limiting shields endpoints from malicious request flooding while remaining generous for legitimate formula searching and calculations.
- **Zero-Downtime Offline Fallback:** If the backend API becomes temporarily unreachable, the frontend automatically falls back to client-side formula evaluation and local caching without crashing or breaking calculator functionality.
