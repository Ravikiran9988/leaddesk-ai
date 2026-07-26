# AI LeadDesk Mini

A full-stack lead management app built with React, Vite, Express, MongoDB, and JWT authentication.

## Features
- Landing page with responsive marketing sections
- Admin login with JWT-based authentication
- Protected admin dashboard for managing leads
- CRUD operations for leads via REST API
- Search, status updates, and lead deletion
- Loading states, validation, and error handling

## Tech Stack
- Frontend: React, Vite, Tailwind CSS, React Router
- Backend: Node.js, Express, MongoDB, Mongoose, JWT

## Setup
1. Install dependencies for both frontend and backend:
   - npm run install:all
2. Create environment files from the examples below.
3. Start the backend:
   - npm run dev:server
4. Start the frontend:
   - npm run dev:client
5. Seed the admin account:
   - npm run seed

## Environment Variables
- Server: copy .env.example to server/.env
- Client: set VITE_API_URL for the API base URL in the Vite app

## Deployment Notes
- Frontend: deploy the client folder to Vercel with SPA rewrites enabled
- Backend: deploy the server folder to Render with Node.js runtime
- Ensure the production MongoDB URI, JWT secret, and client URL are configured in environment variables
