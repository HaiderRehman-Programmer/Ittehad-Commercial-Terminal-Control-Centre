# 🚀 Web Application & Real Estate Management System

A full-stack, enterprise-grade web application built with a modern React frontend and a robust Node.js/Express backend, featuring database management via Prisma ORM.

---

## 🛠️ Technology Stack

### 🎨 Frontend Stack
* **UI Framework & Library:** [React 19](https://react.dev/) & [React DOM 19](https://react.dev/)
* **Build Tool:** [Vite 8](https://vitejs.dev/) with SWC / React Plugin
* **Language:** [TypeScript 6](https://www.typescriptlang.org/)
* **Styling & Design System:** [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`, `@tailwindcss/postcss`)
* **Routing:** [React Router DOM v7](https://reactrouter.com/)
* **State & Forms:** [React Hook Form](https://react-hook-form.com/) & [Zod Validation](https://zod.dev/) (`@hookform/resolvers`)
* **Animations:** [Framer Motion](https://www.framer.com/motion/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Data Visualization & Dashboards:** [Recharts](https://recharts.org/) & [ApexCharts](https://apexcharts.com/) (`react-apexcharts`)
* **Notifications:** [React Hot Toast](https://react-hot-toast.com/)
* **Document & PDF Export:** [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)
* **HTTP Client:** [Axios](https://axios-http.com/)

---

### ⚡ Backend Stack
* **Runtime & Framework:** [Node.js](https://nodejs.org/) & [Express 5](https://expressjs.com/)
* **Database & ORM:** [Prisma ORM 5](https://www.prisma.io/)
* **Databases Supported:** [SQLite](https://www.sqlite.org/) (Development) & [PostgreSQL](https://www.postgresql.org/) (Production/Migration)
* **Authentication & Security:** 
  * [JSON Web Token (JWT)](https://jwt.io/) for session authentication
  * [bcryptjs](https://github.com/dcodeIO/bcrypt.js) for password hashing
  * [Helmet](https://helmetjs.github.io/) for HTTP security header protection
  * [Express Rate Limit](https://www.npmjs.com/package/express-rate-limit) for API rate limiting
  * [CORS](https://www.npmjs.com/package/cors) for cross-origin management
* **Environment Management:** `dotenv`

---

## 📁 Project Architecture

```
Websites Demo/
├── public/                 # Static assets
├── src/                    # React Frontend Source
│   ├── components/         # Reusable UI components
│   ├── pages/              # Route views & dashboards
│   └── ...
├── server/                 # Express Backend Server
│   ├── index.js            # Server entry point & API routes
│   ├── middleware/         # Security & Auth middlewares
│   └── prisma.js           # Prisma client instance
├── prisma/                 # Database Schemas & Migrations
│   ├── schema.prisma       # Active Prisma database schema
│   ├── dev.db              # SQLite development database
│   └── seed.js / seed.ts   # Database seed scripts
├── scripts/                # Utility & migration scripts
├── package.json            # Node.js dependencies & scripts
└── vite.config.mjs         # Vite configuration
```

---

## ⚡ Getting Started

### 1. Prerequisites
Ensure you have **Node.js** (v18+ recommended) and **npm** installed on your system.

### 2. Installation
Install all required project dependencies:
```bash
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env` and fill in your configuration:
```bash
cp .env.example .env
```

### 4. Database Setup
To push the database schema and initialize your database:
```bash
npx prisma db push
```

---

## 📜 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run start` | Runs both Frontend (Vite) and Backend (Express) concurrently |
| `npm run dev` | Starts the Vite development server for the frontend |
| `npm run server` | Starts the Express backend API server |
| `npm run build` | Builds the production bundle for the frontend |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs ESLint to check for code quality and errors |
| `npm run db:setup-pg` | Pushes schema and migrates data to PostgreSQL |

---

## 🛡️ Security Features
* JWT token authentication middleware.
* Rate limiting on sensitive API endpoints.
* Helmet protection for HTTP headers.
* Password hashing using bcryptjs.

