# ChoreQuest (Chorely)

A fullstack household chore gamification app built with React + Vite frontend, Express backend, and PostgreSQL (Drizzle ORM). Mobile-first, playful (Duolingo meets Mario Party).

## Architecture

- **Frontend:** React + Vite, Tailwind CSS, shadcn/ui, Framer Motion, Zustand (persisted store)
- **Backend:** Express.js, Drizzle ORM, PostgreSQL
- **Auth:** Firebase (Google sign-in, email/password) — accounts linked via `firebaseUid` on users table
- **Routing:** wouter

## App Flow

1. `/` — Splash screen (2-3s animated loading, auto-redirects returning users to dashboard)
2. `/get-started` — Create New Family / Join Existing Family / Try Demo
3. `/auth` — Sign in (Google, Apple placeholder, email/password) — required before creating or joining. Checks if user already has a profile via firebaseUid.
4. `/setup-family` — 2-step family creation (name → your profile: name/gender/age). Creator becomes admin.
5. `/join-family` — Enter invite code → set up your profile (name/gender/age). Joiner becomes member.
6. `/join/:code` — Direct join via invite link (redirects to auth if not signed in)
7. `/home` — Legacy landing page (demo button)
8. `/family/:familyId/dashboard` — Dashboard with weekly calendar, chore cards
9. `/family/:familyId/leaderboard` — Points leaderboard
10. `/family/:familyId/chat` — Family chat with live time display
11. `/family/:familyId/rewards` — Rewards shop with claim flow
12. `/family/:familyId/profile` — Avatar customization (pants/jacket PNGs)
13. `/family/:familyId/admin` — Admin: create chores/rewards, leaderboard visibility, member role management

## Key Files

- `shared/schema.ts` — Drizzle schema (families, users, messages, chores, choreLogs, rewards)
- `shared/routes.ts` — API route definitions with Zod validation
- `server/storage.ts` — Database storage class (CRUD operations, demo rotation)
- `server/routes.ts` — Express route handlers
- `client/src/store/useStore.ts` — Zustand store (family, currentUser, firebaseUid, onboardingIntent)
- `client/src/lib/firebase.ts` — Firebase config and auth exports
- `client/src/components/Layout.tsx` — Layout with bottom nav (hidden on onboarding pages)
- `client/src/components/BottomNav.tsx` — Fixed bottom navigation
- `client/src/components/UserAvatar.tsx` — Layered PNG avatar component
- `client/src/components/ChoreCard.tsx` — Chore card with emoji mapping

## Database Tables

- `families` — id, name, inviteCode, timeZone
- `users` — id, familyId, firebaseUid, username, role, gender, age, points, streak, avatarUrl, avatarConfig, hideFromLeaderboard
- `messages` — id, familyId, userId, senderName, content, isSystem, createdAt
- `chores` — id, familyId, title, points, type (daily/weekly/monthly/box), assigneeId (null = anyone/public), lastCompletedAt, lastCompletedBy, cooldownHours, emoji
- `chore_logs` — id, choreId, userId, completedAt
- `rewards` — id, familyId, title, costPoints, emoji

## Auth & User Flow

- Users must sign in via Firebase (Google or email/password) before creating or joining a family
- Each Firebase account maps to one app user via `firebaseUid` column
- Family creator automatically becomes admin
- All joiners become members by default
- Admin can promote/demote members in the Admin panel (Member Roles section)
- No more "who's playing?" character selection — your account IS your profile

## Features

- Chore types: Daily, Weekly, Monthly, Open Chore / Chore Box
- Dashboard groups chores by timeframe category (default), with sort by points (high/low) toggle
- Daily streak bonus: +20% extra points when all daily chores completed every day in the week
- "Anyone (Public)" chore assignment with +20% bonus points
- Chore completion with confetti + system chat messages
- Reward claiming with point deduction + gold "ROYALTY ALERT" chat messages
- Smart auto-scroll chat (stays in place when user scrolls up)
- Demo family rotation (same demo for 5 minutes, then rotates)
- Avatar with layered PNG clothing (pants + jacket)
- Weekly calendar display on dashboard
- Firebase Google auth + email/password auth
- Mobile-first with safe-area support for bottom nav
- Admin role management (promote/demote members)
