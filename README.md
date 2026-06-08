# Strangers — Next.js Social Network

A modern rebuild of the [Strangers](https://github.com/devthedevil/Strangers) social platform on **Next.js 15 (App Router)**, **React 19**, **TypeScript**, and **Tailwind 4**. Photo and video uploads ride on **Cloudinary**, real-time chat on **Pusher Channels**, data lives in **MongoDB Atlas**, and the whole thing deploys to **Vercel**.

![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?logo=cloudinary&logoColor=white)
![Pusher](https://img.shields.io/badge/Pusher-Channels-300D4F?logo=pusher&logoColor=white)

## Features

- **Auth** — email/password via NextAuth (JWT sessions, MongoDB-backed users)
- **Feed** — create posts with rich text and **photo or video** attachments
- **Cloudinary direct uploads** — signed signatures so videos bypass Vercel's 4.5 MB function payload cap
- **Likes & comments** — optimistic UI
- **Friends** — toggle reciprocal friend connections
- **Profiles** — editable name, bio, and avatar
- **Real-time chat** — presence channels backed by Pusher; messages persist in MongoDB

## Tech Stack

| Layer        | Stack                                  |
|--------------|-----------------------------------------|
| Framework    | Next.js 15 App Router + React 19        |
| Language     | TypeScript                              |
| Styling      | Tailwind 4 + Lucide icons               |
| Database     | MongoDB Atlas via Mongoose              |
| Auth         | NextAuth (Credentials provider)         |
| Media        | Cloudinary (signed browser uploads)     |
| Realtime     | Pusher Channels (presence)              |
| Hosting      | Vercel                                  |

## Environment

Copy `.env.example` to `.env.local` and fill in:

```env
MONGODB_URI=
AUTH_SECRET=           # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

PUSHER_APP_ID=
PUSHER_SECRET=
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=
```

## Run locally

```bash
npm install
npm run dev
# http://localhost:3000
```

## Deploy

This repo is wired for **Vercel**. Set the same env vars in the project's Vercel dashboard, then push to `main`.
