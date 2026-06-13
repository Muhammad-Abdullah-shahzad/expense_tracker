# 💸 Xpense Tracker

> **NCBA&E CS Department — Final Year Project (FYP)**  
> Department of Computer Sciences · Lahore Campus  
> **Prepared by:** Khadija & Khurram Sarfraz · Student IDs: 132223206 / 132223139  
> **Supervisor:** Mr. Muhammad Waseem · Internal Supervisor, NCBA&E Lahore

A full-stack **MERN** expense management system with JWT authentication, per-category budget tracking, multi-currency support, analytics dashboards, PDF report generation, and backup/restore — built for academic presentation and real-world usage.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Application Modules](#-application-modules)
- [Data Models](#-data-models)
- [Scripts](#-scripts)
- [Demo Credentials](#-demo-credentials)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **JWT Authentication** | Secure register/login with 30-day token expiry and bcrypt password hashing |
| 📊 **Analytics Dashboard** | Chart.js-powered bar, pie, and trend charts for monthly spending insights |
| 💰 **Expense Management** | Full CRUD — add, edit, delete, search, filter, and tag expenses |
| 🗂 **Category Budgets** | 8 predefined categories with individual spending limits and progress indicators |
| 🌐 **Multi-Currency** | PKR-based system with extensible exchange rate conversion |
| 📄 **PDF Reports** | Printable monthly statements with category breakdowns and academic branding |
| 🗄 **Backup & Restore** | Export all data as JSON and restore it on any session |
| 📋 **Activity Log** | Timestamped audit trail of every create/update/delete operation |
| 🌙 **Dark / Light Mode** | Theme toggle persisted via localStorage |
| 📱 **Responsive UI** | Mobile-first collapsible sidebar and adaptive grid layouts |

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.x | UI framework |
| **Vite** | 8.x | Build tool & dev server |
| **Tailwind CSS** | 3.x | Utility-first styling |
| **Chart.js** + react-chartjs-2 | 4.x / 5.x | Data visualizations |
| **Lucide React** | 1.x | Icon library |
| **Sonner** | 2.x | Toast notifications |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 25.x | Runtime |
| **Express** | 4.x | REST API framework |
| **MongoDB** | Local / Atlas | Primary database |
| **Mongoose** | 8.x | ODM / schema modeling |
| **JSON Web Token** | 9.x | Stateless authentication |
| **bcryptjs** | 2.x | Password hashing |
| **dotenv** | 16.x | Environment variable management |
| **nodemon** | 3.x | Dev auto-restart |
| **CORS** | 2.x | Cross-origin resource sharing |

### Tooling
| Tool | Purpose |
|---|---|
| **concurrently** | Run frontend + backend with a single command |

---

## 📁 Project Structure

```
expense_tracker/
├── package.json              # Root — concurrently scripts
│
├── frontend/                 # React + Vite application
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx          # App entry point
│       ├── App.jsx           # Root component + auth screen
│       ├── index.css         # Global styles & Tailwind directives
│       ├── context/
│       │   └── AppContext.jsx  # Global state, API calls, auth logic
│       └── components/
│           ├── Sidebar.jsx         # Collapsible navigation sidebar
│           ├── Header.jsx          # Top bar with search & theme toggle
│           ├── MetricCard.jsx      # KPI summary widget
│           ├── AnalyticsPanel.jsx  # Chart.js graphs
│           ├── BudgetProgress.jsx  # Per-category budget bars
│           ├── ExpenseForm.jsx     # Add / Edit modal form
│           ├── ExpenseList.jsx     # Filterable expense table
│           ├── ReportGenerator.jsx # Printable PDF statement builder
│           ├── BackupRestore.jsx   # JSON export / import
│           └── ActivityLog.jsx     # Audit log viewer
│
└── backend/                  # Express REST API
    ├── server.js             # App entry point
    ├── .env                  # Environment variables (not committed)
    ├── config/
    │   └── db.js             # MongoDB connection
    ├── middleware/
    │   └── authMiddleware.js # JWT protect middleware
    ├── models/
    │   ├── User.js           # User schema (budgets embedded)
    │   ├── Expense.js        # Expense schema
    │   └── ActivityLog.js    # Audit log schema
    └── routes/
        ├── authRoutes.js     # /api/auth
        ├── expenseRoutes.js  # /api/expenses
        ├── budgetRoutes.js   # /api/budgets
        └── logRoutes.js      # /api/logs
```

---

## ✅ Prerequisites

Make sure the following are installed on your machine:

- **Node.js** v18+ — [Download](https://nodejs.org/)
- **MongoDB** (local instance) — [Download](https://www.mongodb.com/try/download/community)  
  *(Or use a [MongoDB Atlas](https://www.mongodb.com/atlas) cloud URI)*
- **npm** v9+

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Muhammad-Abdullah-shahzad/expense_tracker.git
cd expense_tracker
```

### 2. Install All Dependencies

```bash
# Install root, frontend, and backend dependencies in one step
npm run install-all
```

Or install manually:

```bash
npm install
npm install --prefix frontend
npm install --prefix backend
```

### 3. Configure Environment Variables

Create the backend `.env` file:

```bash
cp backend/.env.example backend/.env
```

Then fill in your values (see [Environment Variables](#-environment-variables) below).

### 4. Start MongoDB

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Or start manually
mongod --dbpath /usr/local/var/mongodb
```

### 5. Run the Development Server

```bash
npm run dev
```

This starts **both** servers concurrently:
- **Frontend** → `http://localhost:5173`
- **Backend API** → `http://localhost:5001`

---

## 🔑 Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
# backend/.env

PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/expense-tracker
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

| Variable | Required | Description |
|---|---|---|
| `PORT` | ✅ | Port for the Express server (default: `5001`) |
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret key for signing JWT tokens |
| `NODE_ENV` | ⬜ | `development` or `production` |

> ⚠️ **Never commit `.env` to version control.** It is listed in `.gitignore`.

---

## 📡 API Reference

All protected routes require the `Authorization: Bearer <token>` header.

### Auth — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user |
| `POST` | `/api/auth/login` | Public | Login and receive JWT |
| `GET` | `/api/auth/me` | 🔒 Private | Get current user profile |
| `PUT` | `/api/auth/currency` | 🔒 Private | Update primary currency |

### Expenses — `/api/expenses`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/expenses` | 🔒 Private | Get all expenses for user |
| `POST` | `/api/expenses` | 🔒 Private | Create new expense |
| `PUT` | `/api/expenses/:id` | 🔒 Private | Update expense by ID |
| `DELETE` | `/api/expenses/:id` | 🔒 Private | Delete expense by ID |

### Budgets — `/api/budgets`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/budgets` | 🔒 Private | Get user's budget allocations |
| `PUT` | `/api/budgets` | 🔒 Private | Update budget allocations |

### Logs — `/api/logs`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/logs` | 🔒 Private | Get activity log entries |
| `POST` | `/api/logs` | 🔒 Private | Add a new log entry |
| `DELETE` | `/api/logs` | 🔒 Private | Clear all log entries |

---

## 🧩 Application Modules

### Dashboard
Real-time KPI cards showing **Total Spent**, **Remaining Balance**, **Top Expense Sector**, and **Record Count** for the current month. Includes a recent ledger preview panel.

### Expense Ledger
Searchable, filterable table of all expenses. Supports **category filter**, **currency display**, **tags**, and **notes**. Inline edit and delete actions with confirmation toasts.

### Budget Tracker
Visual progress bars for each of the **8 categories** (Food, Utilities, Shopping, Entertainment, Transportation, Health, Travel, Miscellaneous). Color-coded by usage threshold (green → amber → red). Editable budget limits per category.

### Analytics
Chart.js-powered visual panels:
- **Monthly bar chart** — spending per category
- **Pie / doughnut chart** — proportional breakdown
- **Trend line** — spending over time

### Report Generator
Select any calendar month to compile a **printable PDF statement** featuring:
- Summary statistics (Total Outflow, Daily Average, Record Count, Highest Cost)
- Category allocation table with status badges
- Academic branding with student and supervisor signatures

### Backup & Restore
- **Export** — Downloads all expenses, budgets, and currency settings as a `.json` file
- **Import** — Upload a previously exported JSON to restore all data to the backend

### Activity Log
Timestamped audit trail of every user action (expense added/updated/deleted, budget changes, backup restore, login/logout). Filterable by type: `create`, `update`, `delete`, `system`, `info`.

---

## 🗃 Data Models

### User
```js
{
  name: String,
  email: String (unique),
  password: String (bcrypt hashed),
  primaryCurrency: String (default: 'PKR'),
  budgets: {
    total: Number,
    food: Number,
    utilities: Number,
    shopping: Number,
    entertainment: Number,
    transportation: Number,
    health: Number,
    travel: Number,
    miscellaneous: Number
  },
  timestamps: true
}
```

### Expense
```js
{
  user: ObjectId (ref: User),
  amount: Number,
  currency: String (default: 'PKR'),
  category: String,
  date: String (YYYY-MM-DD),
  tags: [String],
  notes: String,
  timestamps: true
}
```

### ActivityLog
```js
{
  user: ObjectId (ref: User),
  action: String,
  details: String,
  type: String (create | update | delete | system | info),
  timestamps: true
}
```

---

## 📜 Scripts

From the **root** directory:

| Script | Command | Description |
|---|---|---|
| `dev` | `npm run dev` | Start frontend + backend concurrently |
| `frontend` | `npm run frontend` | Start only the Vite frontend |
| `backend` | `npm run backend` | Start only the Express backend |
| `install-all` | `npm run install-all` | Install all dependencies (frontend + backend) |

From the **`backend/`** directory:

| Script | Command | Description |
|---|---|---|
| `dev` | `npm run dev` | Start with nodemon (auto-restart) |
| `start` | `npm start` | Start with plain node (production) |

From the **`frontend/`** directory:

| Script | Command | Description |
|---|---|---|
| `dev` | `npm run dev` | Start Vite dev server |
| `build` | `npm run build` | Build for production |
| `preview` | `npm run preview` | Preview production build |
| `lint` | `npm run lint` | Run ESLint |

---

## 🎓 Demo Credentials

For quick presentation access, a pre-seeded account is available:

```
Email:    team@ncbae.edu.pk
Password: 123456
```

> Use the **"Auto-fill credentials"** button on the login screen for instant access.

---

## 📄 License

This project is developed as an academic Final Year Project at **NCBA&E, Lahore** and is intended for educational purposes.

---

<div align="center">
  <strong>Xpense Tracker</strong> · NCBA&E CS Department FYP · 2026<br/>
  Built with ❤️ by Khadija & Khurram Sarfraz
</div>
