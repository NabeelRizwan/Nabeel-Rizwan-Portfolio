# Nabeel Rizwan Portfolio

Professional AI and data science portfolio built with Next.js, React, TypeScript, Tailwind CSS, Framer Motion, Recharts, and Three.js.

## Overview

This portfolio presents selected AI, analytics, dashboard, machine learning, and Python projects with a polished single-page experience. It includes animated sections, project cards, data visualizations, a resume download, and a contact flow that opens the visitor's email client.

## Tech Stack

- Next.js 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Framer Motion for interaction and reveal animations
- Recharts for dashboard-style visualizations
- Three.js / React Three Fiber for the hero background
- Vercel Analytics

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Production Build

```bash
npm run build
npm run start
```

## Project Structure

```text
app/                  Next.js app routes and global layout
components/           Portfolio sections, navigation, footer, and UI primitives
components/sections/  Main page sections
lib/                  Shared utilities
public/               Static assets, icons, and resume
```

## Deployment

The project is ready for deployment on Vercel or any platform that supports Next.js. For Vercel, import the GitHub repository and use the default Next.js build settings.

## Notes

- Keep `public/resume.pdf` updated with the latest resume.
- Replace contact links only with live, recruiter-ready profiles.
- Use one lockfile in the repository. This project currently uses `package-lock.json` for npm.
