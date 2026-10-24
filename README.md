# Luma Login

A small demo streaming-style login flow and title catalog built with React, Vite, and Express. Luma Screen uses original branding, CSS-made artwork, and its own visual style rather than reproducing another platform's branding or exact interface. The login API checks one in-memory demo account; it does not use a database or provide production authentication.

## Run locally

```sh
npm install
npm run dev
```

Open the Vite URL shown in the terminal (usually `http://localhost:5173`). Vite proxies `/api` requests to the Express server on port `3001`.

## Project folders

```text
frontend/          React + Vite application
  src/             React pages and styles
backend/           Node.js + Express API
  index.js         Login and community feed endpoints
.env               Frontend API base URL and development proxy target
package.json       Root scripts for running both applications
```

## API environment

All frontend API requests use the `VITE_API_BASE_URL` value from the project `.env` file. The default `/api` path uses Vite's development proxy, whose backend address is set by `VITE_API_PROXY_TARGET`.

```env
VITE_API_BASE_URL=/api
VITE_API_PROXY_TARGET=http://localhost:3001
```

For deployment, set `VITE_API_BASE_URL` to your backend's API base URL in your hosting provider's environment settings and configure the server/proxy accordingly. Vite environment values are included in frontend code, so never put passwords, API secrets, or other private credentials in `VITE_*` variables. Restart the Vite dev server after changing `.env`.

`.env.example` contains the starter values. Copy it to `.env` if needed.

## Demo account

- Email: `hello@luma.demo`
- Password: `lumademo123`

After login, the dashboard shows an original streaming-style catalog with search, film and series filters, a demo watchlist, and title detail dialogs. The earlier social feed remains available at `/community` and loads from the Express API. Feed API supports reading the feed, creating posts, liking and saving posts, adding comments, and following people. Demo content and interactions live in server memory, so they survive browser refreshes while the server is running but reset when the server restarts. Login state is held in navigation state only. The API trusts the username sent by the demo client and is not secure authentication. For a real application, use server-managed sessions or a secure token strategy, password hashing, HTTPS, rate limiting, and persistent user storage.

## Feed API

- `GET /api/feed?user=hello` — load posts, people, and following state for a user.
- `POST /api/posts` — create a post with `{ "username", "name", "caption" }`.
- `POST /api/posts/:id/like` — toggle a like with `{ "username" }`.
- `POST /api/posts/:id/save` — toggle a saved post with `{ "username" }`.
- `POST /api/posts/:id/comments` — add a comment with `{ "username", "name", "text" }`.
- `POST /api/follows` — toggle a follow with `{ "username", "targetUsername" }`.
