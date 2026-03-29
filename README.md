# Spendly — Expense Tracker

A full-stack expense tracking web application built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- JWT based authentication (signup, login, protected routes)
- Add, edit, delete expenses with category, amount, date, note
- Predefined and custom categories
- Payment method tracking (Cash, Card, UPI, Net Banking)
- Recurring expenses with auto-generation via cron job
- Monthly budget setting with alerts
- Dashboard with stats and recent transactions
- Analytics with category-wise pie chart, monthly trend area chart, payment method breakdown
- Filter and search expenses by date range, category, note
- Bulk delete expenses
- Export data as CSV and HTML report
- Pagination for large datasets
- Fully responsive dark UI

## Tech Stack

**Frontend**
- React 19 + Vite
- React Router DOM
- Zustand (state management)
- Recharts (data visualization)
- Axios
- React Hot Toast

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs (password hashing)
- express-validator (input validation)
- node-cron (recurring expenses)

## Project Structure
```
expense-tracker/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── utils/           # Helper functions
│   ├── validators/      # Input validators
│   └── server.js        # Entry point
└── frontend/
    └── src/
        ├── api/         # Axios API calls
        ├── components/  # Shared components
        ├── context/     # Zustand store
        ├── pages/       # Page components
        └── utils/       # Constants and helpers
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/profile | Get profile |
| PUT | /api/auth/profile | Update profile |
| PUT | /api/auth/change-password | Change password |
| GET | /api/expenses | Get all expenses |
| POST | /api/expenses | Add expense |
| PUT | /api/expenses/:id | Update expense |
| DELETE | /api/expenses/:id | Delete expense |
| DELETE | /api/expenses/bulk | Bulk delete |
| GET | /api/analytics/dashboard | Dashboard stats |
| GET | /api/analytics/category | Category wise stats |
| GET | /api/analytics/monthly | Monthly trend |
| GET | /api/analytics/payment-methods | Payment method stats |
| GET | /api/export/csv | Export CSV |
| GET | /api/export/pdf | Export HTML report |

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend folder:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```
```bash
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Environment Variables

| Variable | Description |
|----------|-------------|
| PORT | Backend server port |
| MONGO_URI | MongoDB connection string |
| JWT_SECRET | Secret key for JWT tokens |
| JWT_EXPIRE | JWT expiry duration |
| NODE_ENV | development or production |