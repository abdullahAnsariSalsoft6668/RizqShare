# 🌟 RizqShare Backend

> AI-powered personal finance and donation tracker backend built with Node.js, Express, and MongoDB.

"Share your Rizq, earn infinite reward."

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)

## ✨ Features

### Core Features
- 💰 **Income Tracking** - Multiple income sources with auto-calculated donation targets
- 📊 **Expense Management** - Categorized expense tracking with receipts
- 🎁 **Donation Tracking** - Track charitable giving with progress monitoring
- 📈 **Analytics Dashboard** - Comprehensive financial insights and trends
- 🤖 **AI-Powered Insights** - Smart recommendations and predictions

### API Features
- 🔐 Firebase Authentication
- ✅ Input validation and sanitization
- 🛡️ Rate limiting and security headers
- 📁 File upload support for receipts
- 📊 Advanced analytics and reporting
- 🔄 Real-time donation goal calculations

## 🛠 Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Firebase Admin SDK
- **AI Integration**: OpenAI API
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Firebase project
- OpenAI API key (for AI features)

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd RiskShare
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Setup Firebase**
- Download your Firebase Admin SDK JSON file
- Place it in the root directory as `firebase-adminsdk.json`

5. **Start the server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Authentication
All protected routes require Firebase ID token in Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

#### **Income**
- `GET /api/income` - Get all income entries
- `POST /api/income` - Add income entry
- `GET /api/income/:id` - Get specific income
- `PUT /api/income/:id` - Update income
- `DELETE /api/income/:id` - Delete income
- `GET /api/income/stats` - Get income statistics

#### **Expenses**
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Add expense
- `GET /api/expenses/:id` - Get specific expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/stats` - Get expense statistics
- `POST /api/expenses/upload-receipt` - Upload receipt

#### **Donations**
- `GET /api/donations` - Get all donations
- `POST /api/donations` - Record donation
- `GET /api/donations/:id` - Get specific donation
- `PUT /api/donations/:id` - Update donation
- `DELETE /api/donations/:id` - Delete donation
- `GET /api/donations/stats` - Get donation statistics
- `GET /api/donations/progress` - Get donation progress

#### **Dashboard**
- `GET /api/dashboard/summary` - Get overall summary
- `GET /api/dashboard/trends` - Get financial trends
- `GET /api/dashboard/giving-score` - Get giving score

#### **AI Features**
- `POST /api/ai/financial-advice` - Get AI financial advice
- `POST /api/ai/donation-recommendations` - Get donation recommendations
- `POST /api/ai/categorize-expense` - Auto-categorize expense
- `POST /api/ai/impact-story` - Generate impact story
- `POST /api/ai/forecast` - Forecast future donations

## 📁 Project Structure

```
RiskShare/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js
│   │   ├── firebase.js
│   │   └── openai.js
│   ├── models/          # Mongoose models
│   │   ├── User.js
│   │   ├── Income.js
│   │   ├── Expense.js
│   │   └── Donation.js
│   ├── routes/          # API routes
│   │   ├── auth.routes.js
│   │   ├── income.routes.js
│   │   ├── expense.routes.js
│   │   ├── donation.routes.js
│   │   ├── dashboard.routes.js
│   │   └── ai.routes.js
│   ├── controllers/     # Route controllers
│   │   ├── auth.controller.js
│   │   ├── income.controller.js
│   │   ├── expense.controller.js
│   │   ├── donation.controller.js
│   │   ├── dashboard.controller.js
│   │   └── ai.controller.js
│   ├── middleware/      # Custom middleware
│   │   ├── auth.middleware.js
│   │   ├── validation.middleware.js
│   │   ├── error.middleware.js
│   │   └── upload.middleware.js
│   ├── services/        # Business logic
│   │   ├── ai.service.js
│   │   ├── analytics.service.js
│   │   └── notification.service.js
│   ├── utils/           # Utility functions
│   │   ├── helpers.js
│   │   ├── calculations.js
│   │   └── validators.js
│   ├── app.js          # Express app setup
│   └── server.js       # Server entry point
├── uploads/            # Uploaded files (gitignored)
├── .env               # Environment variables (gitignored)
├── .env.example       # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🔐 Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `OPENAI_API_KEY` - OpenAI API key for AI features

## 🧪 Testing

```bash
npm test
```

## 📝 License

MIT License - see LICENSE file for details

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@rizqshare.com or open an issue in the repository.

---

Made with ❤️ for meaningful giving

