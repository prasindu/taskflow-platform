# CyphLab — Project & Team Task Management Platform

A full-stack **Project and Team Task Management Platform** built as the practical assignment for the **Intern Full Stack Developer** position at CyphLab (Private) Limited.

The system supports three roles — **Administrator**, **Project Manager**, and **Team Member** — with admin-gated onboarding, role-based access control, project/task management, a per-project chat room, email notifications, and an activity/analytics layer.

---

## 🧰 Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | Next.js (App Router) + Tailwind CSS |
| Backend    | Node.js + Express |
| Database   | PostgreSQL |
| ORM        | Prisma |
| Auth       | JWT + bcrypt, Role-Based Access Control (RBAC) |
| Email      | Resend (transactional HTML emails) |
| CI/CD      | GitHub Actions (lint, build, migration check, smoke test) |

---

## 📁 Repository Structure

```
cyphlab/
├── backend/          # Express API + Prisma schema
├── frontend/          # Next.js + Tailwind client
├── docs/              # ERD, Use Case & Architecture diagrams, CI/CD explanation
│   ├── erd.png / erd.svg
│   ├── usecase.png / usecase.svg
│   ├── architecture.png / architecture.svg
│   └── CI_CD.md
├── postman/           # Postman collection (API documentation)
└── README.md          # You are here
```

---

## 👥 Roles & Core Features

### Administrator
- Approve or reject newly registered (pending) users
- Assign or change a user's role (`PM` / `MEMBER` / `ADMIN`)
- Full visibility and control over **every** project and task in the system
- View system-wide analytics (project status breakdown)
- View a global activity feed across all projects

### Project Manager
- Create and manage their own projects
- Assign approved users as project team members (triggers an email notification)
- Create, assign, edit, and delete tasks within their projects
- Track task-status analytics for their own projects
- Participate in the project chat room

### Team Member
- View projects and tasks they've been assigned to
- Update the status of their own tasks (`To Do → In Progress → Done`)
- Participate in the project chat room for projects they belong to

### Cross-cutting features
- **JWT authentication** with admin-gated approval (`isApproved` flag) before login is allowed
- **Role-based route & data guards** on every API endpoint
- **Email notifications** via Resend — sent when a user is approved and when a user is assigned to a project, using a branded dark navy/gold HTML template
- **Project chat room** — membership-verified messaging scoped to each project
- **Activity log** — records key actions (e.g. task status changes) per project, viewable by admins
- **Analytics dashboard data** — project-status breakdown for admins, task-status breakdown for PMs (powered by Prisma `groupBy`)

---

## 🗄️ Database Design

See [`docs/erd.png`](./docs/erd.png) for the full Entity Relationship Diagram.

Core models: `User`, `Project`, `ProjectMember` (join table), `Task`, `Message`, `ActivityLog` — connected via foreign keys with cascading deletes on project removal.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 14+ (local or hosted, e.g. Supabase/Neon/Railway)
- A [Resend](https://resend.com) API key (free tier is enough for testing)

### 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# fill in DATABASE_URL, JWT_SECRET, RESEND_API_KEY, etc. in .env
npx prisma migrate dev --name init
npm run seed        # creates the default admin account
npm run dev          # starts the API on http://localhost:5000
```

Default seeded admin login (change in `.env` before seeding if you want different credentials):

```
Email:    (value of ADMIN_EMAIL in .env)
Password: (value of ADMIN_PASSWORD in .env)
```

### 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local
# set NEXT_PUBLIC_API_URL to your backend URL
npm run dev          # starts the app on http://localhost:3000
```

### 3. Try the full flow
1. Log in as the seeded admin.
2. Register a second account from `/register` — it will sit as **Pending**.
3. As admin, approve it from the **Admin** page and assign it a role (`PM` or `MEMBER`).
4. Log in as that user, create a project (if PM), add members, create tasks, chat, and update task status.
5. Check the assigned member's inbox — they'll receive a Resend email notification.

---

## 🔌 API Documentation

Full request/response reference is provided as a Postman collection: [`postman/CyphLab.postman_collection.json`](./postman/CyphLab.postman_collection.json).

Import it into Postman, set the `baseUrl` variable (default `http://localhost:5000/api`), log in via `/auth/login` to get a token, and set it as the `token` collection variable — all other requests use it automatically via Bearer auth.

---

## 🧪 CI/CD

GitHub Actions runs on every push/PR to `main` or `develop`:
- **Backend**: install → `prisma generate` → `prisma migrate deploy` against a throwaway Postgres service container → lint → boot smoke test on `/api/health`
- **Frontend**: install → lint → production build (`next build`)

Full explanation: [`docs/CI_CD.md`](./docs/CI_CD.md)

---

## 📊 Diagrams

| Diagram | File |
|---|---|
| Entity Relationship Diagram | [`docs/erd.png`](./docs/erd.png) |
| Use Case Diagram | [`docs/usecase.png`](./docs/usecase.png) |
| System Architecture | [`docs/architecture.png`](./docs/architecture.png) |

---



All AI-generated code was reviewed, tested, and extended manually — including the activity log, analytics endpoints, and email-on-approval feature, which were added and integrated by hand on top of the initial scaffold. Business logic decisions, schema design choices, and final testing were done by the developer.

---

## 📹 Demo Video

*()*

## 🌐 Live Deployment

*(https://taskflow-platform-jet.vercel.app)*

---

## 📄 License

Built for evaluation purposes as part of the CyphLab internship application process.