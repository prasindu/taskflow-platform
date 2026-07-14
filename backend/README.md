# CyphLab Backend

Node.js + Express + PostgreSQL (Prisma) + JWT auth backend for the Project & Team Task Management Platform.

## Setup
```
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, RESEND_API_KEY etc.
npx prisma migrate dev --name init
npm run seed            # creates default admin (admin@cyphlab.com)
npm run dev
```

## Roles
ADMIN -> approves users, manages any project
PM -> creates/manages own projects, assigns members & tasks
MEMBER -> views assigned projects/tasks, updates task status, chats

## Main Endpoints
- POST /api/auth/register, /api/auth/login, GET /api/auth/me
- GET /api/users/pending, PATCH /api/users/:id/approve, PATCH /api/users/:id/role
- POST/GET/PUT/DELETE /api/projects, POST /api/projects/:id/members
- POST/GET /api/projects/:projectId/tasks, PUT/PATCH/DELETE /api/tasks/:id, GET /api/tasks/my
- GET/POST /api/projects/:projectId/messages
