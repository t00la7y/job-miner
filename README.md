# Job Miner — Monorepo Structure

Full-stack MERN application with Docker support.
React + Tailwind (client) · Node + Express (server) · MongoDB · Docker · CI/CD

---

## Folder Structure

```
job-miner/
├── .gitignore                  # Covers both client and server
├── .dockerignore               # Excludes node_modules, .env from Docker builds
├── docker-compose.yml          # Wires client, server, and MongoDB together
├── README.md                   # Project overview, live links, screenshots
├── package.json                # Root scripts — npm run dev starts everything
│
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD — lint → test → build → deploy on push to main
│
├── client/                     # React + Vite + Tailwind — deployed to Vercel
│   ├── Dockerfile              # Multi-stage: build React, serve with Nginx
│   ├── .env                    # VITE_API_URL only — no secrets (never committed)
│   ├── .env.example            # VITE_API_URL=http://localhost:5174
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx            # React entry point
│       ├── App.jsx             # Router setup
│       ├── index.css           # Tailwind directives (@tailwind base/components/utilities)
│       │
│       ├── components/         # Reusable UI — used across multiple pages
│       │   ├── Navbar.jsx
│       │   ├── JobCard.jsx
│       │   ├── SearchBar.jsx
│       │   ├── FilterPanel.jsx
│       │   └── LoadingSpinner.jsx
│       │
│       ├── pages/              # Full page views — one file per route
│       │   ├── JobBoard.jsx
│       │   ├── InterviewTrainer.jsx
│       │   └── SavedJobs.jsx
│       │
│       ├── hooks/              # Custom React hooks — stateful logic extracted from components
│       │   ├── useJobs.js
│       │   ├── useInterview.js
│       │   └── useSavedJobs.js
│       │
│       └── services/           # All Axios API calls — components never call axios directly
│           ├── jobsService.js
│           └── interviewService.js
│
└── server/                     # Node + Express — deployed to Render
    ├── Dockerfile              # node:20-alpine, non-root user, npm ci
    ├── .env                    # Real secrets — NEVER commit (see .env.example)
    ├── .env.example            # Template with placeholder values — commit this
    ├── package.json
    ├── server.js               # Entry point — dotenv, middleware, route mounting
    │
    ├── routes/                 # URL definitions — thin, delegates to controllers
    │   ├── jobs.js             # GET /api/jobs, POST /api/jobs/save
    │   └── interview.js        # POST /api/interview
    │
    ├── controllers/            # Business logic — called by routes
    │   ├── jobsController.js   # Calls Adzuna API, returns results
    │   └── interviewController.js  # Calls Gemini API, scores answers
    │
    └── middleware/
        └── errorHandler.js     # Global error handler — catches all unhandled errors
```

---

## Docker Setup

### How it fits together

Three containers, one command to start everything:

| Container | Image | Port |
|-----------|-------|------|
| `client` | Built from `client/Dockerfile` | 5174|
| `server` | Built from `server/Dockerfile` | 5174 |
| `mongo` | Official `mongo:7` image | 27017 |

---

### server/Dockerfile

```dockerfile
# Stage 1 — install dependencies
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

# Stage 2 — lean production image
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .
ENV NODE_ENV=production
ENV PORT=5174
USER node
EXPOSE 5000
CMD ["node", "server.js"]
```

---

### client/Dockerfile

```dockerfile
# Stage 1 — build React app
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2 — serve with Nginx
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

### docker-compose.yml

```yaml
version: '3.8'

services:
  client:
    build: ./client
    ports:
      - "3000:80"
    depends_on:
      - server

  server:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - MONGO_URI=mongodb://mongo:27017/jobminer
      - JWT_SECRET=${JWT_SECRET}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - ADZUNA_APP_ID=${ADZUNA_APP_ID}
      - ADZUNA_API_KEY=${ADZUNA_API_KEY}
    depends_on:
      - mongo

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

---

### Root .gitignore

```
# Dependencies
node_modules
client/node_modules
server/node_modules

# Environment files — NEVER commit
.env
.env.local
.env.production
client/.env
server/.env

# Build output
client/dist
client/build

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db
```

### Root .dockerignore

```
node_modules
client/node_modules
server/node_modules
.env
client/.env
server/.env
.git
*.log
.DS_Store
```

---

## Quick Start Commands

### Local development (no Docker)

```bash
# 1. Clone the repo
git clone https://github.com/your-username/job-miner.git
cd job-miner

# 2. Install root dependencies
npm install

# 3. Install client dependencies
cd client && npm install && cd ..

# 4. Install server dependencies
cd server && npm install && cd ..

# 5. Copy env templates and fill in your values
cp server/.env.example server/.env

# 6. Start everything with one command
npm run dev
```

### With Docker

```bash
# Build and start all three containers
docker-compose up --build

# Stop everything
docker-compose down

# Stop and remove volume data (wipes MongoDB)
docker-compose down -v
```

---

## Root package.json scripts

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix client\" \"node server/server.js\"",
    "build": "npm run build --prefix client",
    "start": "node server/server.js"
  },
  "devDependencies": {
    "concurrently": "^8.0.0"
  }
}
```

---

## Environment Variables Reference

### server/.env.example

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/jobminer
JWT_SECRET=your-long-random-secret-here
GEMINI_API_KEY=your-gemini-key-here
ADZUNA_APP_ID=your-adzuna-app-id
ADZUNA_API_KEY=your-adzuna-api-key
```

### client/.env.example

```
VITE_API_URL=http://localhost:5000
```

> **Rule:** Frontend env vars are visible in the browser. Never put secret keys in `client/.env`.
> All secret API calls (Gemini, Adzuna) must go through the Express server.

---

## Deployment

| What | Platform | Watches |
|------|----------|---------|
| Frontend | Vercel | `client/` folder |
| Backend | Render | `server/` folder |
| Database | MongoDB Atlas | Cloud-hosted, no deployment needed |
| CI/CD | GitHub Actions | `.github/workflows/deploy.yml` |

---

*Built by Mpilo Shezi — MERN Stack Developer*