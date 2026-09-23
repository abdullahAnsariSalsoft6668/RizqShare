# Software Requirements Specification (SRS)
## RizqShare – AI-Powered Personal Finance & Donation Tracker

**Document Version:** 1.0  
**Date:** March 2025  
**Status:** Approved  

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the functional and non-functional requirements for the RizqShare backend application—an AI-powered personal finance and donation tracking system.

### 1.2 Scope
- **Product Name:** RizqShare Backend API  
- **In Scope:** RESTful API for income, expense, donation tracking; user authentication; analytics; AI features  
- **Out of Scope:** Frontend UI, mobile app UI, payment gateway processing, third-party bank integration  

### 1.3 Definitions & Acronyms
| Term | Definition |
|------|------------|
| JWT | JSON Web Token |
| CRUD | Create, Read, Update, Delete |
| API | Application Programming Interface |
| SDK | Software Development Kit |
| ODM | Object Document Mapper (Mongoose) |

### 1.4 References
- IEEE 830-1998 (SRS standard)
- README.md, PROJECT_SUMMARY.md, API_EXAMPLES.md

---

## 2. Overall Description

### 2.1 Product Perspective
RizqShare is a standalone backend service that:
- Serves mobile (React Native) and web clients
- Integrates with MongoDB, Firebase, and OpenAI
- Exposes REST APIs for all operations

### 2.2 Product Functions (Summary)
1. User registration and authentication
2. Income entry and analytics
3. Expense tracking with categorization and receipts
4. Donation recording and progress monitoring
5. Dashboard with financial summary and trends
6. AI-powered advice, recommendations, and forecasting

### 2.3 User Classes
| User Class | Description |
|------------|-------------|
| End User | Individual user tracking personal finances and donations |
| System Administrator | Manages deployment, configuration, and monitoring |
| Mobile/Web Developer | Integrates with RizqShare API |

### 2.4 Operating Environment
- Node.js v18+
- MongoDB 4.4+ (local or Atlas)
- Linux, macOS, or Windows server
- Cloud deployment (Heroku, Railway, AWS, etc.)

### 2.5 Design Constraints
- RESTful API design
- JSON request/response format
- Token-based authentication
- MongoDB as primary database

---

## 3. Functional Requirements

### 3.1 Authentication (FR-AUTH)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AUTH-01 | The system SHALL allow user registration with email, password, full name, and optional phone number | High |
| FR-AUTH-02 | The system SHALL allow user login with email and password | High |
| FR-AUTH-03 | The system SHALL issue a JWT token upon successful login | High |
| FR-AUTH-04 | The system SHALL support Firebase ID token verification for protected routes | High |
| FR-AUTH-05 | The system SHALL allow users to retrieve their profile | High |
| FR-AUTH-06 | The system SHALL allow users to update their profile (name, phone, currency, donation percentage) | High |
| FR-AUTH-07 | The system SHALL allow users to change their password | High |
| FR-AUTH-08 | The system SHALL allow users to upload a profile picture | Medium |

### 3.2 Income Management (FR-INCOME)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-INCOME-01 | The system SHALL allow users to add income with source, amount, currency, date, frequency | High |
| FR-INCOME-02 | The system SHALL auto-calculate suggested donation based on user's donation percentage | High |
| FR-INCOME-03 | The system SHALL allow users to list income with pagination (page, limit) | High |
| FR-INCOME-04 | The system SHALL allow users to filter income by source, date range | High |
| FR-INCOME-05 | The system SHALL allow users to retrieve, update, and delete a specific income entry | High |
| FR-INCOME-06 | The system SHALL provide income statistics (total, count, average, growth) for a given period | High |
| FR-INCOME-07 | The system SHALL support multiple income sources (salary, freelance, business, etc.) | High |

### 3.3 Expense Management (FR-EXPENSE)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-EXPENSE-01 | The system SHALL allow users to add expenses with title, amount, category, date, payment method | High |
| FR-EXPENSE-02 | The system SHALL support predefined expense categories | High |
| FR-EXPENSE-03 | The system SHALL allow users to upload a receipt for an expense | High |
| FR-EXPENSE-04 | The system SHALL allow users to list, retrieve, update, and delete expenses | High |
| FR-EXPENSE-05 | The system SHALL allow users to search and filter expenses by category, date range | High |
| FR-EXPENSE-06 | The system SHALL provide expense statistics and category-wise distribution | High |
| FR-EXPENSE-07 | The system SHALL support AI-based auto-categorization of expenses | Medium |

### 3.4 Donation Management (FR-DONATION)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DONATION-01 | The system SHALL allow users to record donations with recipient, amount, purpose, category, date | High |
| FR-DONATION-02 | The system SHALL support donation categories (zakat, sadaqah, education, healthcare, etc.) | High |
| FR-DONATION-03 | The system SHALL allow users to track tax-deductible donations and upload tax certificates | High |
| FR-DONATION-04 | The system SHALL calculate and display donation progress vs. goal | High |
| FR-DONATION-05 | The system SHALL allow users to export donations in CSV/JSON format | High |
| FR-DONATION-06 | The system SHALL provide donation statistics by category and recipient | High |
| FR-DONATION-07 | The system SHALL support recurring donations (weekly, monthly, quarterly, yearly) | Medium |
| FR-DONATION-08 | The system SHALL allow users to upload donation receipts | High |

### 3.5 Dashboard & Analytics (FR-DASHBOARD)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DASHBOARD-01 | The system SHALL provide an overall financial summary (income, expenses, donations, savings) | High |
| FR-DASHBOARD-02 | The system SHALL provide financial trends over a configurable period (e.g., 6 months) | High |
| FR-DASHBOARD-03 | The system SHALL calculate and display a giving score (0–100) | High |
| FR-DASHBOARD-04 | The system SHALL calculate and display a financial health score | High |
| FR-DASHBOARD-05 | The system SHALL display savings rate and donation progress | High |
| FR-DASHBOARD-06 | The system SHALL provide giving score breakdown (donation rate, consistency, goal achievement) | Medium |
| FR-DASHBOARD-07 | The system SHALL track and display milestones (e.g., first donation, 10 donations) | Medium |

### 3.6 AI Features (FR-AI)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AI-01 | The system SHALL provide personalized financial advice based on user data | High |
| FR-AI-02 | The system SHALL provide AI donation recommendations | High |
| FR-AI-03 | The system SHALL auto-categorize expenses from description and amount | High |
| FR-AI-04 | The system SHALL generate impact stories for donation periods | Medium |
| FR-AI-05 | The system SHALL forecast future donations based on historical data | Medium |
| FR-AI-06 | The system SHALL gracefully degrade when OpenAI API is unavailable | High |

---

## 4. Non-Functional Requirements

### 4.1 Performance (NFR-PERF)

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-PERF-01 | API response time SHALL be under 500ms for 95% of requests (excluding AI calls) | High |
| NFR-PERF-02 | AI-powered endpoints MAY have response time up to 5 seconds | Medium |
| NFR-PERF-03 | The system SHALL support at least 100 concurrent users | Medium |
| NFR-PERF-04 | Pagination SHALL support up to 100 items per page | Low |

### 4.2 Security (NFR-SEC)

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-SEC-01 | Passwords SHALL be hashed using bcrypt with at least 12 rounds | High |
| NFR-SEC-02 | JWT tokens SHALL have a configurable expiration | High |
| NFR-SEC-03 | The system SHALL validate and sanitize all user inputs | High |
| NFR-SEC-04 | The system SHALL implement rate limiting (e.g., 100 requests per 15 minutes per IP) | High |
| NFR-SEC-05 | The system SHALL use Helmet for security headers | High |
| NFR-SEC-06 | The system SHALL enforce CORS policy | High |
| NFR-SEC-07 | Protected routes SHALL require valid authentication token | High |
| NFR-SEC-08 | File uploads SHALL be validated for type and size | High |

### 4.3 Availability (NFR-AVAIL)

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-AVAIL-01 | The system SHALL expose a /health endpoint for liveness/readiness checks | High |
| NFR-AVAIL-02 | The system SHALL log errors for troubleshooting | High |
| NFR-AVAIL-03 | Target availability SHALL be 99% (excluding scheduled maintenance) | Medium |

### 4.4 Usability (NFR-USE)

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-USE-01 | API responses SHALL follow a consistent JSON structure (status, message, data/errors) | High |
| NFR-USE-02 | Error messages SHALL be descriptive and actionable | High |
| NFR-USE-03 | API SHALL support common query parameters (pagination, date range, sort) | High |

### 4.5 Maintainability (NFR-MAINT)

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-MAINT-01 | The system SHALL use environment variables for configuration | High |
| NFR-MAINT-02 | The system SHALL follow modular structure (models, routes, controllers, services) | High |
| NFR-MAINT-03 | Code SHALL be documented where necessary | Medium |

### 4.6 Scalability (NFR-SCALE)

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-SCALE-01 | The system SHALL support horizontal scaling (stateless API) | Medium |
| NFR-SCALE-02 | Database queries SHALL use appropriate indexes | High |
| NFR-SCALE-03 | File storage SHALL be configurable (local or cloud) | Low |

---

## 5. System Interface Requirements

### 5.1 User Interfaces
- Not applicable (API-only backend)

### 5.2 Hardware Interfaces
- Standard server hardware; no special hardware requirements

### 5.3 Software Interfaces
| Interface | Description |
|-----------|-------------|
| MongoDB | Primary data store via Mongoose ODM |
| Firebase Admin SDK | Optional user authentication via ID token |
| OpenAI API | AI features (advice, categorization, forecasting) |
| File System | Local storage for uploaded receipts/certificates |

### 5.4 Communication Interfaces
- REST over HTTP/HTTPS
- JSON request/response
- Bearer token in Authorization header

---

## 6. Data Requirements

### 6.1 User Data
- Email (unique), password (hashed), full name, phone
- Currency, donation percentage, financial targets
- Profile picture URL, subscription tier

### 6.2 Income Data
- Source, amount, currency, date, frequency, description
- Suggested donation (computed)

### 6.3 Expense Data
- Title, amount, category, date, payment method, vendor
- Receipt URL, description

### 6.4 Donation Data
- Recipient, amount, purpose, category, date
- Organization details, receipt, tax certificate
- Transaction ID, isTaxDeductible, isRecurring
- Impact story, beneficiaries helped

### 6.5 Data Retention
- User data retained until account deletion
- Export capability for user to retrieve their data

---

## 7. Traceability Matrix (Sample)

| Requirement ID | Module/Component |
|----------------|------------------|
| FR-AUTH-01 to 08 | auth.controller.js, auth.routes.js |
| FR-INCOME-01 to 07 | income.controller.js, income.routes.js, Income model |
| FR-EXPENSE-01 to 07 | expense.controller.js, expense.routes.js, Expense model, ai.controller.js |
| FR-DONATION-01 to 08 | donation.controller.js, donation.routes.js, Donation model |
| FR-DASHBOARD-01 to 07 | dashboard.controller.js, analytics.service.js |
| FR-AI-01 to 06 | ai.controller.js, ai.service.js, openai.js |

---

## 8. Appendix

### 8.1 Expense Categories
food, travel, bills, entertainment, healthcare, education, shopping, groceries, rent, utilities, other

### 8.2 Donation Categories
zakat, sadaqah, tithe, education, healthcare, poverty-relief, disaster-relief, animal-welfare, environment, religious, community, other

### 8.3 Supported Currencies
PKR, USD, INR, AED, GBP, EUR

### 8.4 Payment Methods
cash, card, upi, bank-transfer, cheque, online, other

---

*End of SRS Document*
