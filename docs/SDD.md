# Software Design Document (SDD)
## RizqShare – AI-Powered Personal Finance & Donation Tracker

**Document Version:** 1.0  
**Date:** March 2025  
**Status:** Approved  

---

## 1. Introduction

### 1.1 Purpose
This Software Design Document (SDD) describes the architectural and detailed design of the RizqShare backend application. It is intended for developers, architects, and technical stakeholders.

### 1.2 Scope
- System architecture
- Component design
- Data model design
- API design
- Security design
- Integration design

### 1.3 References
- SRS (docs/SRS.md)
- BRS/BRD (docs/BRS_BRD.md)
- README.md, PROJECT_SUMMARY.md, API_EXAMPLES.md

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                  │
│  (React Native App / Web App / Postman / API Consumers)              │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/HTTPS (REST, JSON)
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API LAYER                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │
│  │   CORS      │  │ Rate Limit  │  │   Authentication Middleware  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Express.js Router                           │  │
│  │  /api/auth | /api/income | /api/expenses | /api/donations |    │  │
│  │  /api/dashboard | /api/ai                                      │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │
│  │  Validation │  │   Error     │  │     File Upload              │  │
│  │  Middleware │  │  Handler    │  │     Middleware               │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ │
│  │   Auth       │ │   Income     │ │   Expense    │ │  Donation   │ │
│  │  Controller  │ │  Controller  │ │  Controller  │ │ Controller  │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └─────────────┘ │
│  ┌──────────────┐ ┌──────────────┐                                   │
│  │  Dashboard   │ │     AI       │                                   │
│  │  Controller  │ │  Controller  │                                   │
│  └──────────────┘ └──────────────┘                                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                                   │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────┐ │
│  │  Analytics Service │  │  Notification Svc   │  │  AI Service    │ │
│  │  (calculations,    │  │  (email/push -      │  │  (OpenAI       │ │
│  │   trends, scores)  │  │   template ready)   │  │   integration) │ │
│  └────────────────────┘  └────────────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Mongoose ODM                               │   │
│  │  User | Income | Expense | Donation                           │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    MongoDB                                    │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                                 │
│  Firebase Admin SDK (Auth) | OpenAI API (AI Features) | File System  │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Architectural Pattern
- **Pattern:** Layered (Presentation → Application → Service → Data)
- **API Style:** RESTful
- **Data Access:** Repository-style via Mongoose models
- **Authentication:** Stateless JWT + optional Firebase

### 2.3 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Runtime | Node.js v18+ | Server runtime |
| Framework | Express.js | HTTP server, routing, middleware |
| Database | MongoDB | Document store |
| ODM | Mongoose | Schema, validation, queries |
| Auth | JWT, bcrypt, Firebase Admin | Authentication |
| AI | OpenAI API | GPT for advice, categorization, etc. |
| Validation | Express-validator | Input validation |
| Security | Helmet, CORS, express-rate-limit | Security headers, rate limiting |
| File Upload | Multer | Multipart form data |

---

## 3. Component Design

### 3.1 Directory Structure

```
RizqShare/
├── src/
│   ├── config/           # External service configuration
│   │   ├── database.js   # MongoDB connection
│   │   ├── firebase.js   # Firebase Admin SDK init
│   │   └── openai.js     # OpenAI client init
│   │
│   ├── models/           # Mongoose schemas
│   │   ├── User.js
│   │   ├── Income.js
│   │   ├── Expense.js
│   │   └── Donation.js
│   │
│   ├── routes/           # Route definitions
│   │   ├── auth.routes.js
│   │   ├── income.routes.js
│   │   ├── expense.routes.js
│   │   ├── donation.routes.js
│   │   ├── dashboard.routes.js
│   │   └── ai.routes.js
│   │
│   ├── controllers/      # Request handlers
│   │   ├── auth.controller.js
│   │   ├── income.controller.js
│   │   ├── expense.controller.js
│   │   ├── donation.controller.js
│   │   ├── dashboard.controller.js
│   │   └── ai.controller.js
│   │
│   ├── middleware/       # Express middleware
│   │   ├── auth.middleware.js   # JWT/Firebase verification
│   │   ├── validation.middleware.js
│   │   ├── error.middleware.js  # Global error handler
│   │   └── upload.middleware.js # Multer config
│   │
│   ├── services/         # Business logic
│   │   ├── analytics.service.js
│   │   ├── notification.service.js
│   │   └── (ai.service if extracted)
│   │
│   ├── utils/            # Helpers
│   │   ├── helpers.js    # Date, pagination, etc.
│   │   ├── calculations.js
│   │   └── validators.js
│   │
│   ├── app.js            # Express app setup
│   └── server.js         # Entry point, server start
│
├── uploads/              # File storage (receipts, avatars)
├── .env                  # Environment variables
└── package.json
```

### 3.2 Request Flow

```
Request → CORS → Rate Limit → Auth (if protected) → Validation → Controller
    → Service (if needed) → Model/DB → Response
    ↓ (on error)
Error Middleware → JSON Error Response
```

---

## 4. Data Model Design

### 4.1 Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐
│    User     │       │   Income    │
├─────────────┤       ├─────────────┤
│ _id         │◄──────│ user (ref)  │
│ email       │       │ source      │
│ password    │       │ amount      │
│ fullName    │       │ currency    │
│ donationPct │       │ date        │
│ currency    │       │ suggestedDonation│
│ givingScore │       └─────────────┘
└──────┬──────┘
       │
       │ 1:N
       │
       ├──────────────► ┌─────────────┐
       │                │   Expense   │
       │                ├─────────────┤
       │                │ user (ref)  │
       │                │ title       │
       │                │ amount      │
       │                │ category    │
       │                │ receipt     │
       │                └─────────────┘
       │
       └──────────────► ┌─────────────┐
                        │  Donation   │
                        ├─────────────┤
                        │ user (ref)  │
                        │ recipient   │
                        │ amount      │
                        │ category    │
                        │ purpose     │
                        │ receipt     │
                        └─────────────┘
```

### 4.2 User Model

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Primary key |
| firebaseUid | String | Optional Firebase user ID |
| email | String | Unique, required |
| password | String | Hashed, select: false |
| fullName | String | Required |
| phoneNumber | String | Optional |
| profilePicture | String | URL/path |
| currency | String | Default PKR |
| donationPercentage | Number | 0–100, default 5 |
| monthlyIncomeTarget | Number | Optional |
| monthlyExpenseLimit | Number | Optional |
| notificationsEnabled | Boolean | Default true |
| subscriptionTier | String | free, pro |
| givingScore | Number | 0–100 |
| totalDonated | Number | Aggregated |
| totalIncome | Number | Aggregated |
| totalExpenses | Number | Aggregated |
| createdAt, updatedAt | Date | Timestamps |

**Indexes:** email, firebaseUid, createdAt

### 4.3 Income Model

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Primary key |
| user | ObjectId | Ref User |
| source | String | salary, freelance, etc. |
| amount | Number | Required |
| currency | String | Default PKR |
| description | String | Optional |
| date | Date | Required |
| frequency | String | monthly, weekly, etc. |
| suggestedDonation | Number | Computed |

**Indexes:** user + date, user + source

### 4.4 Expense Model

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Primary key |
| user | ObjectId | Ref User |
| title | String | Required |
| amount | Number | Required |
| category | String | food, travel, etc. |
| description | String | Optional |
| date | Date | Required |
| paymentMethod | String | cash, card, upi, etc. |
| vendor | String | Optional |
| receipt | Object | url, filename, uploadedAt |

**Indexes:** user + date, user + category

### 4.5 Donation Model

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Primary key |
| user | ObjectId | Ref User |
| recipient | String | Required |
| amount | Number | Required |
| purpose | String | Required |
| category | String | zakat, sadaqah, etc. |
| date | Date | Required |
| organizationDetails | Object | name, website, etc. |
| receipt | Object | url, filename |
| transactionId | String | Optional |
| isTaxDeductible | Boolean | Default false |
| taxCertificate | Object | url, uploadedAt |
| paymentMethod | String | cash, upi, etc. |
| isRecurring | Boolean | Default false |
| recurringFrequency | String | weekly, monthly, etc. |
| impactStory | String | Optional |
| beneficiariesHelped | Number | Optional |

**Indexes:** user + date, user + category, recipient

---

## 5. API Design

### 5.1 API Conventions
- **Base URL:** `/api`
- **Format:** JSON
- **Auth:** `Authorization: Bearer <token>`
- **Pagination:** `page`, `limit` (default 10, max 100)
- **Date range:** `startDate`, `endDate` (ISO 8601)
- **Period:** `period` = today, week, month, year, last30days, last90days

### 5.2 Response Format
```json
{
  "status": "success" | "error",
  "message": "Optional message",
  "data": { ... } | null,
  "errors": [ { "field": "...", "message": "..." } ]  // if error
}
```

### 5.3 Route Summary

| Method | Route | Controller | Auth |
|--------|-------|------------|------|
| POST | /api/auth/register | auth | No |
| POST | /api/auth/login | auth | No |
| GET | /api/auth/profile | auth | Yes |
| PUT | /api/auth/profile | auth | Yes |
| GET | /api/income | income | Yes |
| POST | /api/income | income | Yes |
| GET | /api/income/:id | income | Yes |
| PUT | /api/income/:id | income | Yes |
| DELETE | /api/income/:id | income | Yes |
| GET | /api/income/stats | income | Yes |
| GET | /api/expenses | expense | Yes |
| POST | /api/expenses | expense | Yes |
| POST | /api/expenses/:id/receipt | expense | Yes |
| ... | (similar for donations, dashboard, ai) | ... | ... |

---

## 6. Security Design

### 6.1 Authentication Flow
1. **Register/Login:** Validate credentials → Generate JWT (or verify Firebase token)
2. **Protected Route:** Extract token from `Authorization` header → Verify JWT (or Firebase) → Attach user to `req.user`

### 6.2 Password Security
- bcrypt with 12 rounds
- Password not returned in API responses (`select: false`)

### 6.3 Token Security
- JWT with configurable expiry (e.g., 7d)
- Stored client-side; never logged

### 6.4 Input Validation
- Express-validator on all inputs
- Mongoose schema validation
- Sanitization for XSS

### 6.5 Rate Limiting
- 100 requests per 15 minutes per IP (configurable)
- Applied globally or per route

### 6.6 CORS
- Configurable allowed origins
- Credentials supported for cookie-based auth if needed

### 6.7 File Upload Security
- Allowed MIME types: image/*, application/pdf
- Max file size limit
- Filename sanitization

---

## 7. Integration Design

### 7.1 MongoDB
- Connection via Mongoose
- Connection string from `MONGODB_URI`
- Connection pooling (default)
- Indexes for performance

### 7.2 Firebase
- Initialize with service account or env vars
- `verifyIdToken()` for Firebase ID tokens
- Optional; used when client sends Firebase token

### 7.3 OpenAI
- REST API calls to `https://api.openai.com/v1/chat/completions`
- API key from `OPENAI_API_KEY`
- Fallback behavior when API unavailable (e.g., return default message)

### 7.4 File Storage
- Local `uploads/` directory
- Structured: `uploads/receipts/`, `uploads/avatars/`
- Future: S3/cloud storage adapter

---

## 8. Error Handling Design

### 8.1 Error Types
- Validation errors (400)
- Unauthorized (401)
- Forbidden (403)
- Not found (404)
- Conflict (409)
- Internal server error (500)

### 8.2 Error Response Format
```json
{
  "status": "error",
  "message": "Human-readable message",
  "errors": [
    { "field": "amount", "message": "Amount must be positive", "value": -100 }
  ]
}
```

### 8.3 Error Middleware
- Central error handler
- Logs errors (without sensitive data)
- Returns consistent JSON

---

## 9. Performance Considerations

### 9.1 Database
- Indexes on frequently queried fields (user, date, category)
- Pagination to limit result size
- Aggregation pipelines for stats

### 9.2 Caching (Future)
- Redis for session/token blacklist
- Cache dashboard summary for short TTL

### 9.3 Async Operations
- AI calls are async; consider queue for high load
- File uploads streamed

---

## 10. Deployment Design

### 10.1 Environment Variables
- `NODE_ENV` (development, production)
- `PORT` (default 5000)
- `MONGODB_URI`
- `JWT_SECRET`
- `OPENAI_API_KEY`
- `FIREBASE_*` (optional)
- `CORS_ORIGIN`

### 10.2 Process Management
- Node process (no clustering in baseline)
- Optional: PM2, systemd for production

### 10.3 Health Check
- `GET /health` returns 200 when MongoDB connected

---

## 11. Appendix

### A. Expense Categories
food, travel, bills, entertainment, healthcare, education, shopping, groceries, rent, utilities, other

### B. Donation Categories
zakat, sadaqah, tithe, education, healthcare, poverty-relief, disaster-relief, animal-welfare, environment, religious, community, other

### C. Income Sources
salary, freelance, business, rental, investment, gift, other

### D. Payment Methods
cash, card, upi, bank-transfer, cheque, online, other

---

*End of SDD Document*
