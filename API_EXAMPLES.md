# 📚 RizqShare API Examples

Complete API examples with request/response formats.

## Base URL
```
http://localhost:5000/api
```

---

## 🔐 Authentication

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phoneNumber": "+1234567890",
  "donationPercentage": 5
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "64f5a1b2c3d4e5f6a7b8c9d0",
      "email": "user@example.com",
      "fullName": "John Doe",
      "donationPercentage": 5,
      "currency": "INR"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Get Profile
```bash
GET /api/auth/profile
Authorization: Bearer <token>
```

---

## 💰 Income Management

### Add Income
```bash
POST /api/income
Authorization: Bearer <token>
Content-Type: application/json

{
  "source": "salary",
  "amount": 50000,
  "currency": "INR",
  "description": "Monthly salary",
  "date": "2024-01-15",
  "frequency": "monthly"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Income added successfully",
  "data": {
    "income": {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
      "source": "salary",
      "amount": 50000,
      "suggestedDonation": 2500,
      "date": "2024-01-15T00:00:00.000Z"
    }
  }
}
```

### Get All Income
```bash
GET /api/income?page=1&limit=10&source=salary&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

### Get Income Statistics
```bash
GET /api/income/stats?period=month
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "period": "month",
    "summary": {
      "total": 50000,
      "count": 2,
      "average": 25000,
      "suggestedDonation": 2500,
      "growth": 10.5
    },
    "bySource": {
      "salary": { "count": 1, "total": 50000 },
      "freelance": { "count": 1, "total": 15000 }
    }
  }
}
```

---

## 📊 Expense Management

### Add Expense
```bash
POST /api/expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Grocery Shopping",
  "amount": 3500,
  "category": "food",
  "description": "Monthly groceries from supermarket",
  "date": "2024-01-16",
  "paymentMethod": "card",
  "vendor": "BigBazaar"
}
```

### Upload Receipt
```bash
POST /api/expenses/64f5a1b2c3d4e5f6a7b8c9d2/receipt
Authorization: Bearer <token>
Content-Type: multipart/form-data

receipt: <file>
```

### Get Expense Statistics
```bash
GET /api/expenses/stats?period=month
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "summary": {
      "total": 35000,
      "count": 15,
      "average": 2333.33,
      "growth": -5.2
    },
    "distribution": {
      "food": { "amount": 10000, "percentage": 28.57 },
      "travel": { "amount": 5000, "percentage": 14.29 },
      "bills": { "amount": 8000, "percentage": 22.86 }
    },
    "topCategories": [
      { "category": "food", "amount": 10000, "percentage": 28.57 },
      { "category": "bills", "amount": 8000, "percentage": 22.86 }
    ]
  }
}
```

---

## 🎁 Donation Management

### Add Donation
```bash
POST /api/donations
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipient": "Local Orphanage",
  "amount": 5000,
  "purpose": "Monthly support for children's education",
  "category": "education",
  "date": "2024-01-20",
  "paymentMethod": "upi",
  "isTaxDeductible": true,
  "transactionId": "TXN123456789"
}
```

### Get Donation Progress
```bash
GET /api/donations/progress?period=month
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "period": "month",
    "donationGoal": 2500,
    "totalDonated": 1800,
    "remaining": 700,
    "progress": 72,
    "donationPercentage": 5,
    "message": "You have donated ₹ 1800 of ₹ 2500 goal."
  }
}
```

### Export Donations (CSV)
```bash
GET /api/donations/export?format=csv&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

### Get Donation Statistics
```bash
GET /api/donations/stats?period=month
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "summary": {
      "total": 5000,
      "count": 3,
      "average": 1666.67,
      "growth": 15.5,
      "consistency": 80
    },
    "byCategory": {
      "education": { "count": 2, "total": 3000 },
      "healthcare": { "count": 1, "total": 2000 }
    },
    "topRecipients": [
      { "recipient": "Local Orphanage", "count": 2, "total": 3000 }
    ]
  }
}
```

---

## 📈 Dashboard

### Get Summary
```bash
GET /api/dashboard/summary?period=month
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "period": "month",
    "summary": {
      "income": {
        "total": 50000,
        "count": 2,
        "currency": "INR"
      },
      "expenses": {
        "total": 35000,
        "count": 15,
        "currency": "INR"
      },
      "donations": {
        "total": 2500,
        "count": 3,
        "goal": 2500,
        "progress": 100,
        "remaining": 0,
        "currency": "INR"
      },
      "savings": {
        "amount": 12500,
        "rate": 25,
        "currency": "INR"
      },
      "scores": {
        "givingScore": 85,
        "financialHealth": 78
      }
    }
  }
}
```

### Get Trends
```bash
GET /api/dashboard/trends?months=6
Authorization: Bearer <token>
```

### Get Giving Score
```bash
GET /api/dashboard/giving-score
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "givingScore": 85,
    "breakdown": {
      "donationRate": {
        "score": 5.5,
        "weight": 40,
        "description": "Percentage of income donated"
      },
      "consistency": {
        "score": 80,
        "weight": 30,
        "averageDaysBetween": 12,
        "description": "Frequency of donations"
      },
      "goalAchievement": {
        "score": 100,
        "weight": 30,
        "description": "Progress towards donation goal"
      }
    },
    "milestones": [
      { "name": "First Donation", "achieved": true },
      { "name": "10 Donations", "achieved": true },
      { "name": "₹10,000 Donated", "achieved": true }
    ],
    "nextMilestone": {
      "name": "50 Donations",
      "remaining": 35
    }
  }
}
```

---

## 🤖 AI Features

### Get Financial Advice
```bash
POST /api/ai/financial-advice
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "advice": "Based on your current financial situation...\n\n1. Consider reducing your entertainment expenses...\n2. You're doing great with donations...\n3. Build an emergency fund...",
    "userData": {
      "totalIncome": 50000,
      "totalExpenses": 35000,
      "totalDonations": 2500
    },
    "generatedAt": "2024-01-20T10:30:00.000Z"
  }
}
```

### Get Donation Recommendations
```bash
POST /api/ai/donation-recommendations
Authorization: Bearer <token>
```

### Auto-Categorize Expense
```bash
POST /api/ai/categorize-expense
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Paid electricity bill",
  "amount": 1500
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "category": "bills",
    "description": "Paid electricity bill",
    "amount": 1500
  }
}
```

### Generate Impact Story
```bash
POST /api/ai/impact-story
Authorization: Bearer <token>
Content-Type: application/json

{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

### Forecast Donations
```bash
GET /api/ai/forecast?months=3
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "forecast": [
      {
        "month": "2024-02",
        "predictedAmount": 2800,
        "confidence": "high"
      },
      {
        "month": "2024-03",
        "predictedAmount": 2900,
        "confidence": "high"
      }
    ],
    "historicalData": [
      { "month": "2024-01", "amount": 2500, "count": 3 }
    ]
  }
}
```

---

## 📋 Query Parameters

### Common Filters

**Pagination:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Date Range:**
- `startDate` - Start date (ISO format: 2024-01-01)
- `endDate` - End date (ISO format: 2024-12-31)

**Period:**
- `period` - Time period: `today`, `week`, `month`, `year`, `last30days`, `last90days`

**Sorting:**
- `sort` - Sort order: `latest` (default) or `oldest`

**Search:**
- `search` - Search term for filtering

### Examples

```bash
# Get expenses for January 2024, page 2
GET /api/expenses?startDate=2024-01-01&endDate=2024-01-31&page=2&limit=20

# Get income sorted by oldest first
GET /api/income?sort=oldest

# Search donations
GET /api/donations?search=orphanage

# Get food expenses only
GET /api/expenses?category=food
```

---

## 🔥 Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "amount",
      "message": "Amount must be a positive number",
      "value": -100
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Invalid or expired token. Please login again."
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

---

## 💡 Tips

1. **Always include Authorization header** for protected routes
2. **Use proper date formats** (ISO 8601: YYYY-MM-DD)
3. **Handle pagination** for large datasets
4. **Check response status** before processing data
5. **Store tokens securely** in your client app

---

For more details, check the main [README.md](./README.md)

