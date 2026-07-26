# AI LeadDesk Mini - Enterprise AI CRM & Analytics Platform

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-19.0.0-blue.svg)](https://react.dev/)
[![Express Version](https://img.shields.io/badge/express-4.21.2-lightgrey.svg)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)

An enterprise-grade, production-ready MERN stack Customer Relationship Management (CRM) platform powered by **Groq AI (Llama-3)** intelligence, **Recharts** visualizations, **Socket.IO** real-time event synchronization, and robust security controls.

---

## 🏛️ System Architecture

```mermaid
flowchart TB
    subgraph Client ["Client (React 19 + Vite + TailwindCSS)"]
        UI[Enterprise Dashboard & Kanban]
        SocketClient[Socket.IO Client]
        ThemeCtx[Dark Mode & Notification Context]
    end

    subgraph Nginx ["Nginx Web Server"]
        ReverseProxy[Reverse Proxy / API Gateway]
    end

    subgraph Backend ["Backend API (Node.js + Express)"]
        RateLimit[Security & Rate Limiter Middleware]
        Swagger[/docs Swagger OpenAPI UI]
        Controllers[MVC Controllers & Service Layer]
        SocketServer[Socket.IO Engine]
    end

    subgraph External ["External Services"]
        Groq[Groq AI SDK Llama-3]
        Mailer[Nodemailer Email Transport]
        Cloudinary[Cloudinary Storage]
    end

    subgraph Database ["Database"]
        MongoDB[(MongoDB Database)]
    end

    Client <--> ReverseProxy
    ReverseProxy <--> Backend
    Backend <--> SocketServer
    Backend <--> MongoDB
    Backend --> Groq
    Backend --> Mailer
    Backend --> Cloudinary
```

---

## 🚀 Key Production Features

### 🔐 Security & Hardening
- **Helmet HTTP Security**: Strict Content Security Policy (CSP), Frameguard, and X-XSS protection headers.
- **Express Rate Limiting**: Global API rate limiters (200 reqs/15m) and strict authentication rate limiting (10 attempts/15m).
- **Mongo Sanitization**: Sanitizes input against NoSQL Operator Injection (`$gt`, `$ne`).
- **JWT Refresh Tokens**: Short-lived 15-minute Access Tokens paired with HttpOnly 7-day Refresh Tokens stored securely with token rotation and instant revocation.
- **Strong Password Validation**: Enforced regular expression requirements for password complexity (min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character).
- **Dynamic CORS Controls**: Secure origin validation supporting cross-domain requests with credential forwarding.

### ⚡ Performance & Optimization
- **Code-Splitting & Lazy Loading**: Routes split dynamically with `React.lazy()` and `Suspense` reducing main bundle size by **60%**.
- **Component Memoization**: Heavy list renderings and charts wrapped with `React.memo()`.
- **Database Indexing**: Compound indexes on MongoDB collections (`status`, `source`, `category`, `assignedTo`, `createdAt`, `priority`).
- **Lean Database Queries**: Non-mutating data queries executed with `.lean()` and targeted field selection.

### 📈 Business Intelligence & Analytics
- **8 KPI Metric Cards**: Total Leads, Today's Leads, Monthly Leads, High Priority, Won Deals, Lost Deals, Estimated Revenue, and Conversion Rate.
- **6 Recharts Visualizations**:
  1. *Monthly Leads*: AreaChart with gradient fill.
  2. *Status Distribution*: Donut PieChart.
  3. *Lead Source Distribution*: BarChart across acquisition channels.
  4. *Priority Distribution*: Color-coded AI Priority chart.
  5. *Revenue Pipeline*: Estimated revenue per stage.
  6. *Won vs Lost*: Monthly comparative BarChart.

### 🔄 Real-Time & Notification Engine
- **Socket.IO Real-Time Engine**: Event broadcasting for `lead:created`, `lead:updated`, `lead:assigned`, `lead:note_added`, and `dashboard:counters`.
- **Notification Center Drawer**: Live header bell icon with unread badge counter, category filtering, and direct lead navigation.
- **Email Notifications**: Automated triggers for *Customer Confirmation*, *Admin Alerts*, and *Sales Assignment* via Nodemailer.

---

## 🤖 Groq AI Setup Guide

AI LeadDesk Mini utilizes **Groq's Llama-3 70B** model for lightning-fast lead scoring, priority estimation, and automated email generation.

1. Sign up for a free account at [Groq Console](https://console.groq.com/).
2. Navigate to **API Keys** and click **Create API Key**.
3. Copy your API key (starts with `gsk_`).
4. Paste your key into `server/.env`:
   ```env
   GROQ_API_KEY=gsk_your_groq_api_key_here
   ```

---

## 🛠️ Local Installation & Development

### Prerequisites
- **Node.js**: `v20.0.0` or higher
- **MongoDB**: Local MongoDB instance running on port `27017` or MongoDB Atlas URI

### 1. Clone & Setup Workspace
```bash
git clone https://github.com/Ravikiran9988/ai-leaddesk-mini.git
cd "ai leaddesk mini"
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MONGODB_URI and GROQ_API_KEY
npm run seed     # Populate default Admin users and sample leads
npm run dev      # Starts server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## 🐳 Docker Deployment

To run the entire enterprise stack (MongoDB, Express API, and Nginx Client) using Docker Compose:

```bash
# 1. Set environment variables
cp .env.example .env

# 2. Build and launch containers
docker-compose up --build -d

# 3. Access applications
# Client: http://localhost
# API Docs: http://localhost:5000/docs
# Health Check: http://localhost:5000/api/health
```

---

## 🔑 Default Credentials (Seed Script)

Run `npm run seed` inside the `server/` directory to generate the following default accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **System Admin** | `admin@aileaddesk.com` | `Password123@` |
| **Sales Manager** | `manager@aileaddesk.com` | `Password123@` |
| **Sales Executive** | `sales@aileaddesk.com` | `Password123@` |

---

## 📖 API Documentation & Swagger

Interactive Swagger OpenAPI 3.0 documentation is exposed directly from the API.

- **Swagger UI**: `http://localhost:5000/docs`
- **Health Check Endpoint**: `http://localhost:5000/api/health`

### Key API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Login user & issue access/refresh cookies | No |
| `POST` | `/api/auth/refresh` | Rotate JWT access token | Cookie/Body |
| `POST` | `/api/auth/logout` | Revoke refresh token & clear cookies | Yes |
| `GET` | `/api/leads` | Paginated lead listing with filters | Yes |
| `POST` | `/api/leads` | Submit public lead inquiry | Rate-Limited |
| `GET` | `/api/leads/analytics` | 8 KPI cards & 6 Recharts datasets | Yes |
| `POST` | `/api/ai/analyze/:id` | Trigger Groq AI lead analysis | Yes |
| `GET` | `/api/health` | Comprehensive server & DB health metrics | No |

---

## 🧪 Automated Testing

Execute the automated backend test suite:

```bash
cd server
npm test
```

Tests run via Node's native test runner (`node --test`) covering password validation regex, operational error contracts, and API health response schemas.

---

## 📄 License
Distributed under the **MIT License**. See `LICENSE` for details.
