# 🌟 RizqShare - Complete App Features Summary

> **Tagline:** "Share your Rizq, earn infinite reward."  
> AI-powered personal finance and donation tracker built with Node.js, Express, and MongoDB.

---

## 📋 Overview

RizqShare is a comprehensive backend API that enables users to track their income, manage expenses, and monitor charitable donations with AI-powered insights. It supports multiple authentication methods and provides real-time analytics for informed financial decisions.

---

## ✨ Core Features

### 1. 💰 Income Tracking
- **Multiple income sources** – Salary, freelance, business, rental, investment, other
- **Auto-calculated donation targets** – Suggested donation based on user's donation percentage
- **Income statistics** – Total, count, average, growth rate by period
- **Filtering & pagination** – By source, date range, sorting (latest/oldest)
- **CRUD operations** – Full Create, Read, Update, Delete support
- **Multi-currency support** – PKR (default), USD, INR, AED, GBP, EUR
- **Frequency tracking** – Monthly, weekly, one-time, etc.

### 2. 📊 Expense Management
- **Categorized tracking** – Food, travel, bills, entertainment, healthcare, education, shopping, etc.
- **Receipt upload** – Attach receipts to expense entries
- **Payment method tracking** – Cash, card, UPI, bank transfer, etc.
- **Vendor information** – Store vendor details per expense
- **Expense statistics** – Total, distribution by category, top categories, growth
- **Search & filter** – By category, date range, search term
- **AI auto-categorization** – Smart categorization from description and amount

### 3. 🎁 Donation Tracking
- **Comprehensive donation recording** – Recipient, amount, purpose, category
- **Donation categories** – Zakat, Sadaqah, Tithe, Education, Healthcare, Poverty Relief, Disaster Relief, Animal Welfare, Environment, Religious, Community, Other
- **Progress monitoring** – Real-time progress toward donation goals
- **Receipt & tax certificate** – Document upload for donations
- **Tax-deductible tracking** – Flag tax-deductible donations
- **Organization details** – Name, website, phone, email, address
- **Recurring donations** – Weekly, monthly, quarterly, yearly
- **Impact tracking** – Impact story, beneficiaries helped
- **Export** – CSV/JSON export for tax or records
- **Transaction ID** – For verification and reconciliation

### 4. 📈 Analytics Dashboard
- **Overall summary** – Income, expenses, donations, savings in one view
- **Financial trends** – 6-month trend analysis
- **Giving score** – 0–100 score based on donation rate, consistency, goal achievement
- **Financial health score** – Overall financial wellness indicator
- **Savings rate** – Calculated from income, expenses, donations
- **Donation progress** – Goal vs. achieved with remaining amount
- **Category distribution** – Breakdown by category
- **Growth rates** – Period-over-period comparisons

### 5. 🤖 AI-Powered Features
- **Financial advice** – Personalized recommendations based on user data
- **Donation recommendations** – AI-suggested donation amounts and causes
- **Auto-categorize expense** – Categorize from description and amount
- **Impact story generation** – Generate impact narratives for donations
- **Donation forecasting** – Predict future donations based on history
- **Context-aware suggestions** – Uses income, expenses, and donation patterns

---

## 🔐 API & Security Features

### Authentication
- **JWT authentication** – Token-based auth for protected routes
- **Firebase Admin SDK** – Optional Firebase ID token verification
- **User registration** – Email, password, full name, phone, donation percentage
- **Login** – Email/password authentication
- **Profile management** – Get/update profile, change password
- **Profile picture upload** – User avatar support

### Security
- **Password hashing** – bcrypt with 12 rounds
- **Input validation** – Express-validator for all inputs
- **Sanitization** – XSS and injection prevention
- **Rate limiting** – 100 requests per 15 minutes
- **Security headers** – Helmet.js
- **CORS configuration** – Configurable allowed origins
- **MongoDB injection prevention** – Mongoose schema validation

### File Handling
- **Receipt upload** – For expenses and donations
- **Tax certificate upload** – For tax-deductible donations
- **File validation** – Type and size limits
- **Secure storage** – Dedicated uploads directory

---

## 📱 API Endpoints Summary

| Module | Endpoints | Key Operations |
|--------|-----------|----------------|
| **Auth** | 7 | Register, Login, Profile, Password, Avatar |
| **Income** | 6 | CRUD, Stats, Pagination |
| **Expenses** | 7 | CRUD, Stats, Receipt upload, Search |
| **Donations** | 9 | CRUD, Progress, Export, Receipts |
| **Dashboard** | 5 | Summary, Trends, Giving score, Predictions |
| **AI** | 5 | Advice, Recommendations, Categorize, Impact, Forecast |

**Total: 42+ endpoints**

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js v18+ |
| Framework | Express.js |
| Database | MongoDB with Mongoose |
| Authentication | Firebase Admin SDK, JWT, bcrypt |
| AI | OpenAI API |
| Validation | Express-validator |
| Security | Helmet, CORS, Rate limiting |
| File Upload | Multer |

---

## 📁 Data Models

- **User** – Profile, financial settings, giving score, subscription tier
- **Income** – Source, amount, frequency, suggested donation
- **Expense** – Title, amount, category, receipt, payment method
- **Donation** – Recipient, amount, category, organization, impact

---

## 🎯 User Capabilities

1. Set a **donation percentage** and auto-calculate targets from income
2. Track **savings rate** and financial health
3. Earn a **giving score** with milestones
4. Get **personalized AI advice** and recommendations
5. **Export** donation records for tax purposes
6. **Multi-currency** support (PKR default, USD, INR, AED, GBP, EUR)
7. **Subscription tiers** (free, pro) for future premium features

---

*Document Version: 1.0 | Last Updated: March 2025*
