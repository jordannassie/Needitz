# Needitz

A [Next.js](https://nextjs.org) project bootstrapped with TypeScript, Tailwind CSS, and ready for deployment on [Netlify](https://netlify.com).

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Netlify (via `@netlify/plugin-nextjs`)

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy to Netlify

### Option 1 — Netlify UI (recommended)

1. Push this repo to GitHub
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**
3. Connect your GitHub account and select this repo
4. Netlify will auto-detect the `netlify.toml` settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
5. Click **Deploy site**

### Option 2 — Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

## Environment Variables

Add any secrets in the Netlify dashboard under **Site settings → Environment variables**, or locally in a `.env.local` file (never commit this file).

## Project Structure

```
src/
  app/
    layout.tsx   # Root layout
    page.tsx     # Home page
    globals.css  # Global styles
netlify.toml     # Netlify build config
next.config.ts   # Next.js config
tailwind.config.ts
tsconfig.json
```
