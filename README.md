# Book My Show

A full-stack movie ticket booking app with user authentication, movie browsing, seat selection, bookings, and admin movie management.

Live: [https://bms.luqe.in](https://bms.luqe.in)

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios
- Backend: Node.js, Express, PostgreSQL, JWT, Joi
- Email: Resend API for verification and password reset emails

## Features

- User signup, login, logout, and session refresh
- Email verification and password reset links
- Movie listing and movie details
- Show seat availability and booking flow
- My bookings page
- Admin dashboard for movie management
- Cookie-based auth support with CORS credentials

## Project Structure

```txt
.
|-- bms-backend/    # Express API and PostgreSQL migrations
|-- bms-frontend/   # React/Vite client
`-- README.md
```

## Local Setup

Install dependencies:

```bash
cd bms-backend
npm install

cd ../bms-frontend
npm install
```

Create environment files:

```bash
cd bms-backend
cp env_example.txt .env

cd ../bms-frontend
cp env_smaple_text .env
```

Update the copied `.env` files with your database URL, frontend URL, JWT secrets, Resend API key, and API URL.

Run the backend:

```bash
cd bms-backend
npm run dev
```

Run the frontend:

```bash
cd bms-frontend
npm run dev
```

## Useful Commands

```bash
# Backend
npm run migrate
npm run dev
npm start

# Frontend
npm run dev
npm run lint
npm run build
```

## Environment Notes

Backend uses `FRONTEND_ORIGIN` for CORS and `FRONTEND_URL` for email links.

Frontend uses `VITE_API_URL` to call the backend API.

Real `.env` files and `node_modules` are ignored by Git.
