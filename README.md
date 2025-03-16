# Personal Finance Dashboard

## 🚀 Project Overview
The Personal Finance Dashboard is a web application designed to help users track their income, expenses, and net worth efficiently. Users can add transactions, visualize financial trends, and manage their financial data securely.

---

## 🛠️ Tech Stack

### Frontend:
-  Next.js – Framework for building the UI
- Material UI and Tailwind CSS – Styling components
- Zustand  – State management

### Backend:
- **Node.js** – Backend server
- PostgreSQL (Supabase) – Database for storing financial data
- Firebase Authentication – Secure user authentication

### Deployment:
- Frontend: Vercel 
- Backend: Render 
- Database: Supabase



## 🎯 Features Implemented

### 🔐 User Authentication
- Email/password authentication
- Google OAuth login
- Profile management

### 📊 Dashboard Overview
- Summary of total income, total expenses, and net worth
- Income vs. expenses trend visualization
- Expense breakdown by category
- Filter by moth and category
- Pageination

### 💰 Transactions Management
- Add, edit, and delete transactions
- Categorize transactions as income or expense
- View detailed transaction history
- Search option
- Pageination

### 📈 Net Worth Calculation
- Track assets and liabilities
- Auto-calculate net worth based on user data
- Add, edit, and delete assets and liabilities
- Search option
- Pageination

### 🔄 Backend API
- User authentication API
- CRUD operations for transactions , assets and liabilities
- Secure data handling with PostgreSQL (Supabase)

### ✨ Additional Features
- Dark mode support
- Mobile responsiveness
- PWA (Progressive Web App) support
- Pagination done for table data



## 🛠️ Setup Instructions

### 1️⃣ Clone the Repository

git clone https://github.com/yourusername/finance-dashboard.git
cd finance-dashboard


### 2️⃣ Install Dependencies

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install


### 3️⃣ Configure Environment Variables**
Create a `.env.local` file in the frontend folder:
env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key


Create a `.env` file in the backend folder:
`env
SUPABASE_URL
SUPABASE_ANON_KEY


### 4️⃣ Run the Development Server
####*Frontend:

npm run dev

#### Backend:

npm run start

The app will be available at `http://localhost:3000`



## 🚀 Deployment Guide
### Frontend Deployment (Vercel)

npm run build
vercel deploy


### Backend Deployment (Render )
1. Push backend code to GitHub.
2. Connect GitHub repo to Render.
3. Set environment variables.
4. Deploy!



