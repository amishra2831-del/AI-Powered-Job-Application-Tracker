# Job Dekho

A smart job application tracker built with the MERN stack, featuring AI-powered job parsing and resume matching via the OpenAI Chat API.

🔗 **Live Demo:** [jobdekho.vercel.app]https://client-fy4gra8y7-amishra2831-dels-projects.vercel.app


## Overview

Job Dekho helps you manage your entire job search in one place. Track applications on a visual Kanban board, use AI to automatically parse job descriptions, and get a resume match score for every position you apply to.
Current Version: 1.0

## Features

- **Kanban Board** — drag and drop applications across stages (Saved, Applied, Interview, Offer, Rejected)
- **AI Job Parser** — paste a job description and AI automatically fills application details
- **Resume Match Score** — compares your resume against a job description and returns a score with strengths, gaps and improvement tips
- **Application Details** — track salary, location, job type, deadlines and notes
- **Stats Dashboard** — visualize your job search with charts and upcoming deadlines
- **Profile Page** — customize username, bio, location and avatar color
- **Google OAuth** — sign in with your Google account in one click
- **Email & Password Auth** — traditional signup with secure JWT authentication (test users)
- **Dark Mode** — full light and dark mode support

## Tech Stack

**Frontend**
- React + Vite
- Tailwind CSS
- React Query
- @dnd-kit (drag and drop)
- React Hook Form + Zod
- Recharts

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication (httpOnly cookies)
- OpenAI Chat API (Copilot-style AI)
- Passport.js (Google OAuth2)

**Deployed On**
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## Authentication

Job Dekho supports two sign-in methods:

**Email & Password** — bcrypt password hashing, JWT tokens in httpOnly cookies for XSS protection (for test users).

**Google OAuth** — one-click sign in via Passport.js Google OAuth2 strategy. Account created automatically on first sign in.


## Local Development

**Prerequisites**
- Node.js v18+
- MongoDB (local)
- OpenAI API key
- Google OAuth credentials

**Backend setup**
```bash
cd server
npm install
```

Create `server/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/jobdekho
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4o-mini
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret
```
```bash
npm run dev
```

**Frontend setup**
```bash
cd client
npm install
```
Create `client/.env`:
```
VITE_API_URL=http://localhost:5000
```
```bash
npm run dev
```

## Project Structure
```
applystaq/
├── client/          # React frontend
│   └── src/
│       ├── api/         # API functions
│       ├── assets/      # Relevant images
│       ├── components/  # Reusable components
│       ├── context/     # Auth and dark mode context
│       ├── hooks/       # Custom hooks
│       └── pages/       # Page components
└── server/          # Express backend
    ├── config/      # Database connection
    ├── controllers/ # Route handlers
    ├── middleware/  # Auth middleware
    ├── models/      # Mongoose schemas
    └── routes/      # API routes
```

## Author

[S-undas](https://github.com/S-undas)
