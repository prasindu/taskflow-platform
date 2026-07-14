# CyphLab Frontend

Next.js (App Router) + Tailwind CSS frontend for the Project & Team Task Management Platform.

## Setup
```
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL to your backend
npm run dev
```

## Pages
- /login, /register - auth
- /dashboard - role-aware summary
- /projects, /projects/[id] - project list, Kanban tasks, members, chat
- /admin - user approval + role management (ADMIN only)

## Notes
- Theme: dark navy / gold / teal (Space Grotesk + Inter + JetBrains Mono)
- Auth token stored in localStorage, attached via axios interceptor
- Role-based route guarding via AppShell component
