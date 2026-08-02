# Render deployment — required environment variables & setup

After importing `render.yaml` into Render, add the following environment variables (secrets) for the `jobdekho-server` service. For security, enter these in the Render dashboard (do NOT commit secrets to the repo).

Server env vars (required for full functionality)
- `MONGO_URI` — MongoDB connection string (MongoDB Atlas recommended). Example: `mongodb+srv://<user>:<pass>@cluster0.mongodb.net/jobdekho?retryWrites=true&w=majority`
- `PORT` — leave as `5000` (Render overrides anyway)
- `JWT_SECRET` — strong secret used for signing JWTs
- `JWT_EXPIRE` — token expiration (example `7d`)
- `SESSION_SECRET` — session secret for `express-session`
- `OPENAI_API_KEY` — API key for OpenAI (optional; required for AI features)
- `CLIENT_URL` — frontend origin, e.g. `https://applystaq-client.onrender.com` (used for redirects)
- `GOOGLE_CLIENT_ID` — Google OAuth client ID (create in Google Cloud Console)
- `GOOGLE_CLIENT_SECRET` — Google OAuth client secret

Client env vars
- `VITE_API_URL` — set on the `applystaq-client` static site in Render to point at your backend, e.g. `https://applystaq-server.onrender.com`

Google OAuth redirect URIs
- Add these URIs in Google Cloud Console (OAuth consent & credentials):
  - Production backend callback: `https://<your-backend-domain>/api/auth/google/callback`
  - Local dev callback: `http://localhost:5000/api/auth/google/callback`
  - Frontend auth callback (used by client redirect): `https://<your-frontend-domain>/auth/callback`

Render import steps
1. Push your repository to GitHub and confirm `render.yaml` is at repository root.
2. Go to Render → New → Import from GitHub → select this repo. Render should detect services from `render.yaml`.
3. For each detected service, open the service settings and add the env vars above under "Environment".
4. Deploy; Render will run the `buildCommand` and `startCommand` from `render.yaml`.

Notes
- If you don't want to use Render, you can host frontend on Vercel and backend on Render — set `VITE_API_URL` to your Render backend URL.
- After deployment, test `GET /health` and the frontend root. Test sign-in flows.
