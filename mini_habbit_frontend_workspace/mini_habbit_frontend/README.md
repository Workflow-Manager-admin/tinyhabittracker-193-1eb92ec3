This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment Variables for API Base URL

The frontend fetches data from your backend API. To make this work in different environments (development, staging, production), set the API base URL using an environment variable.

1. Copy `.env.local.example` to `.env.local` and update the value as needed:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local`:
   ```
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3000   # Change to your backend's URL as needed
   ```
   - In development: use `http://localhost:3000` if running the backend locally.
   - In production: set this to your deployed backend API, e.g. `https://api.myhabitapp.com`

Next.js exposes `NEXT_PUBLIC_*` env vars to the browser, allowing the frontend React code and API utilities to switch the backend base URL easily.

### Development

- Both frontend and backend running locally (default):
  ```
  NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
  ```
- Start the frontend:
  ```
  npm run dev
  ```
- The app will connect to your local backend on port 3000.

### Production/Deployment

- Set `NEXT_PUBLIC_BACKEND_URL` in your hosting platform/environment (e.g. Vercel, Netlify).
- All API fetches will use this base URL.

**Changing environments does not require code changes—just update `.env.local` or your hosting environment vars!**

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
