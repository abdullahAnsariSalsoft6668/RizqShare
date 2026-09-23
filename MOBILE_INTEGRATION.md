# RizqShare — Mobile App Integration Guide

Connect your React Native (or Expo) app to the RizqShare backend API.

---

## Prerequisites

1. Backend running locally or on a server
2. MongoDB connected
3. Mobile app with HTTP client (`axios` or `fetch`)

```bash
# Start backend
cd /path/to/RizqShare
npm install
npm run dev
```

Server default: `http://localhost:5000`  
API base: `http://localhost:5000/api`  
Health check: `GET http://localhost:5000/health`

---

## Base URL by Platform

| Environment | Base URL |
|-------------|----------|
| iOS Simulator | `http://localhost:5000/api` |
| Android Emulator | `http://10.0.2.2:5000/api` |
| Physical device (same Wi‑Fi) | `http://YOUR_COMPUTER_IP:5000/api` |
| Production | `https://your-api-domain.com/api` |

**Find your computer IP (macOS):**
```bash
ipconfig getifaddr en0
```

Example: `http://192.168.1.12:5000/api`

> Android: cleartext HTTP is blocked by default. For local dev, allow HTTP in `android/app/src/main/AndroidManifest.xml` (`android:usesCleartextTraffic="true"`) or use Expo `app.json` network security config. Prefer HTTPS in production.

---

## Auth Flow

RizqShare accepts **JWT** (email/password) or **Firebase ID token**.

```
┌─────────────┐     POST /auth/register or /auth/login      ┌─────────────┐
│  Mobile App │ ──────────────────────────────────────────► │   Backend   │
│             │ ◄────────────────────────────────────────── │             │
│             │     { user, token }                         │             │
└─────────────┘                                             └─────────────┘
       │
       │ Store token securely (SecureStore / Keychain / EncryptedSharedPreferences)
       │
       │ All protected requests:
       │ Authorization: Bearer <token>
       ▼
```

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phoneNumber": "+923001234567",
  "donationPercentage": 5,
  "currency": "PKR"
}
```

`currency` is optional. If omitted or empty, the user is saved as **`PKR`**.

Allowed currencies: `PKR`, `USD`, `INR`, `AED`, `GBP`, `EUR` (uppercase ISO codes). Invalid values return `400` with a field error on `currency`.

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Success response

```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "fullName": "John Doe",
      "donationPercentage": 5,
      "currency": "PKR",
      "givingScore": 0
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Token expiry: **7 days** (configurable via `JWT_EXPIRE`).

### Firebase auth (optional)

If the user signs in with Firebase on the client, send the Firebase ID token:

```
Authorization: Bearer <firebase-id-token>
```

Backend verifies it and creates/links the user automatically.

### Change currency

```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "currency": "USD"
}
```

`GET /api/dashboard/summary` then returns `"currency": "USD"` (and the same code on nested totals). Amounts are stored as entered — the API does not convert between currencies.

---

## Recommended Mobile Setup (React Native)

### 1. Install packages

```bash
npm install axios @react-native-async-storage/async-storage
# Optional (recommended for tokens):
npx expo install expo-secure-store
```

### 2. Config

```js
// src/config/api.js
import { Platform } from 'react-native';

const DEV_HOST = Platform.select({
  ios: 'http://localhost:5000/api',
  android: 'http://10.0.2.2:5000/api',
  default: 'http://localhost:5000/api',
});

// For a physical device, set your LAN IP:
// const DEV_HOST = 'http://192.168.1.12:5000/api';

export const API_BASE_URL = __DEV__
  ? DEV_HOST
  : 'https://your-production-api.com/api';
```

### 3. API client with auth header

```js
// src/services/apiClient.js
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('authToken');
      // Navigate to Login screen (use your navigation ref)
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 4. Auth service

```js
// src/services/authService.js
import api from './apiClient';
import * as SecureStore from 'expo-secure-store';

export async function register(payload) {
  const { data } = await api.post('/auth/register', payload);
  await SecureStore.setItemAsync('authToken', data.data.token);
  return data.data;
}

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  await SecureStore.setItemAsync('authToken', data.data.token);
  return data.data;
}

export async function logout() {
  await SecureStore.deleteItemAsync('authToken');
}

export async function getProfile() {
  const { data } = await api.get('/auth/profile');
  return data.data.user;
}
```

---

## API Modules for Mobile Screens

All routes below are under `/api` and require `Authorization: Bearer <token>` unless noted.

### Auth

| Method | Endpoint | Auth | Use |
|--------|----------|------|-----|
| POST | `/auth/register` | No | Sign up |
| POST | `/auth/login` | No | Sign in |
| GET | `/auth/profile` | Yes | Profile screen |
| PUT | `/auth/profile` | Yes | Edit settings (including `currency`) |
| PUT | `/auth/profile/picture` | Yes | Avatar upload (`multipart`) |
| PUT | `/auth/password` | Yes | Change password |
| DELETE | `/auth/account` | Yes | Delete account |

### Income

| Method | Endpoint | Use |
|--------|----------|-----|
| GET | `/income` | List (+ `page`, `limit`, `startDate`, `endDate`, `source`) |
| POST | `/income` | Add income |
| GET | `/income/:id` | Detail |
| PUT | `/income/:id` | Update |
| DELETE | `/income/:id` | Delete |
| GET | `/income/stats` | Stats (`period=month`) |

**Add income body:**
```json
{
  "source": "salary",
  "amount": 50000,
  "currency": "PKR",
  "description": "Monthly salary",
  "date": "2024-01-15",
  "frequency": "monthly"
}
```

If `currency` is omitted, the API stores the user’s profile currency (default `PKR`).

Valid `source`: `salary`, `freelance`, `business`, `investment`, `rental`, `gift`, `other`

### Expenses

| Method | Endpoint | Use |
|--------|----------|-----|
| GET | `/expenses` | List |
| POST | `/expenses` | Add expense |
| GET | `/expenses/:id` | Detail |
| PUT | `/expenses/:id` | Update |
| DELETE | `/expenses/:id` | Delete |
| GET | `/expenses/stats` | Stats |
| POST | `/expenses/:id/receipt` | Upload receipt (`multipart`) |

**Add expense body:**
```json
{
  "title": "Grocery Shopping",
  "amount": 3500,
  "currency": "PKR",
  "category": "food",
  "description": "Monthly groceries",
  "date": "2024-01-16",
  "paymentMethod": "card",
  "vendor": "BigBazaar"
}
```

If `currency` is omitted, the API stores the user’s profile currency (default `PKR`).

Valid `category`: `food`, `travel`, `bills`, `shopping`, `healthcare`, `education`, `entertainment`, `housing`, `transportation`, `utilities`, `insurance`, `personal`, `charity`, `other`

### Donations

| Method | Endpoint | Use |
|--------|----------|-----|
| GET | `/donations` | List |
| POST | `/donations` | Record donation |
| GET | `/donations/:id` | Detail |
| PUT | `/donations/:id` | Update |
| DELETE | `/donations/:id` | Delete |
| GET | `/donations/stats` | Stats |
| GET | `/donations/progress` | Monthly 5% due + previous pending |
| GET | `/donations/obligations` | Month-by-month history (`?months=12`) |
| GET | `/donations/export` | Export (`format=csv`) |
| POST | `/donations/:id/receipt` | Upload receipt |

**Add donation body:**
```json
{
  "recipient": "Local Orphanage",
  "amount": 5000,
  "currency": "PKR",
  "purpose": "Children's education",
  "category": "education",
  "date": "2024-01-20",
  "paymentMethod": "upi",
  "isTaxDeductible": true
}
```

If `currency` is omitted, the API stores the user’s profile currency (default `PKR`).

Valid `category`: `zakat`, `sadaqah`, `tithe`, `education`, `healthcare`, `poverty-relief`, `disaster-relief`, `animal-welfare`, `environment`, `religious`, `community`, `other`

### Monthly donation pending (Home)

Each calendar month the user owes **`donationPercentage` of that month’s total income** (salary, freelance, business, etc.). Unpaid amounts carry forward. Donations apply **FIFO**: oldest unpaid month first, then the current month.

Do **not** recompute 5% on the client from a local income list. Read these numbers from the API after every income or donation write.

**Endpoints**

| Method | Endpoint | Use |
|--------|----------|-----|
| GET | `/donations/progress` | Home: this month / previous pending / total to give |
| GET | `/donations/obligations?months=12` | History list |
| GET | `/dashboard/summary` | Same pending fields on Home cards |

**Field map for Home**

| UI | `GET /donations/progress` | `GET /dashboard/summary` → `summary.donations` |
|----|---------------------------|-----------------------------------------------|
| This month due | `currentMonth.remaining` | `thisMonthDue` is the full month due; remaining is `thisMonthDue - thisMonthPaid` |
| This month paid | `currentMonth.paid` | `thisMonthPaid` |
| Previous pending | `carryOver.remaining` | `carryOver` |
| Total to give | `totalPending` or `remaining` | `totalPending` or `remaining` |
| Progress bar | `progress` (`currentMonth.paid / currentMonth.due`) | `progress` |
| Prefill donate amount | `totalPending` | `totalPending` |

Prefer the nested objects on `/donations/progress`. Legacy keys still work:

- `remaining` = `totalPending` (left to give, including carry-over)
- `donationGoal` = this month’s due + previous pending
- `totalDonated` = this month’s paid (FIFO-allocated)

**Example:** August income 400,000 (due 20,000), paid 10,000. September income 200,000 (due 10,000), unpaid.

```json
{
  "status": "success",
  "data": {
    "donationGoal": 20000,
    "totalDonated": 0,
    "remaining": 20000,
    "progress": 0,
    "donationPercentage": 5,
    "currency": "PKR",
    "currentMonth": {
      "yearMonth": "2026-09",
      "incomeTotal": 200000,
      "due": 10000,
      "paid": 0,
      "remaining": 10000
    },
    "carryOver": {
      "remaining": 10000,
      "months": [
        {
          "yearMonth": "2026-08",
          "incomeTotal": 400000,
          "due": 20000,
          "paid": 10000,
          "remaining": 10000,
          "status": "partial"
        }
      ]
    },
    "prepaid": 0,
    "totalPending": 20000,
    "message": "PKR 10000 due this month. PKR 10000 pending from previous months."
  }
}
```

A later 15,000 donation in September clears August’s 10,000 leftover first, then 5,000 of September. Then `carryOver.remaining` is 0, `currentMonth.paid` is 5000, `totalPending` is 5000.

**Home UI**

1. Show three lines: this month due, previous pending, total to give.
2. If `carryOver.remaining > 0`, banner: previous months still unpaid.
3. Progress bar uses `progress` (this month only).
4. Copy on donate: “This payment clears the oldest unpaid month first.”
5. After `POST /income` or `POST /donations`, refetch progress (or dashboard summary).

**History**

`GET /donations/obligations?months=12` → `data.months[]` with `status`: `paid` | `partial` | `pending`.

**TypeScript types**

```ts
type ObligationMonth = {
  yearMonth: string; // '2026-09'
  incomeTotal: number;
  due: number;
  paid: number;
  remaining: number;
  status?: 'paid' | 'partial' | 'pending';
};

type DonationProgress = {
  donationGoal: number;
  totalDonated: number;
  remaining: number;
  progress: number;
  donationPercentage: number;
  currency: string;
  currentMonth: Omit<ObligationMonth, 'status'>;
  carryOver: { remaining: number; months: ObligationMonth[] };
  prepaid: number;
  totalPending: number;
  totalDueAllTime: number;
  totalPaidAllTime: number;
  message: string;
};
```

### Dashboard

| Method | Endpoint | Use |
|--------|----------|-----|
| GET | `/dashboard/summary?period=month` | Home summary cards |
| GET | `/dashboard/trends?months=6` | Charts |
| GET | `/dashboard/giving-score` | Giving score + milestones |
| GET | `/dashboard/categories` | Category breakdown |
| GET | `/dashboard/predictions` | Predictions |

### AI

| Method | Endpoint | Use |
|--------|----------|-----|
| POST | `/ai/financial-advice` | Advice screen |
| POST | `/ai/donation-recommendations` | Recommendations |
| POST | `/ai/categorize-expense` | Auto-category on add expense |
| POST | `/ai/impact-story` | Impact narrative |
| GET | `/ai/forecast?months=3` | Forecast chart |

**Categorize expense:**
```json
{ "description": "Paid electricity bill", "amount": 1500 }
```

> AI calls can take a few seconds. Show a loading state. If OpenAI is not configured, backend returns fallback content.

---

## File Upload (Receipt / Avatar)

```js
import api from './apiClient';

export async function uploadExpenseReceipt(expenseId, fileUri, fileName = 'receipt.jpg') {
  const formData = new FormData();
  formData.append('receipt', {
    uri: fileUri,
    name: fileName,
    type: 'image/jpeg', // or image/png, application/pdf
  });

  const { data } = await api.post(`/expenses/${expenseId}/receipt`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
```

Same pattern for:
- `POST /donations/:id/receipt` — field name: `receipt`
- `PUT /auth/profile/picture` — field name: `profilePicture`

---

## Suggested Screen → API Map

| Screen | Primary APIs |
|--------|--------------|
| Login / Register | `POST /auth/login`, `POST /auth/register` |
| Home / Dashboard | `GET /dashboard/summary`, `GET /dashboard/giving-score` |
| Transactions | `GET /income`, `GET /expenses` |
| Add Income | `POST /income` |
| Add Expense | `POST /expenses`, `POST /ai/categorize-expense` |
| Donations | `GET /donations`, `GET /donations/progress` |
| Add Donation | `POST /donations` |
| Trends | `GET /dashboard/trends` |
| AI Insights | `POST /ai/financial-advice`, `POST /ai/donation-recommendations` |
| Profile | `GET /auth/profile`, `PUT /auth/profile` |

---

## Response Format

**Success:**
```json
{
  "status": "success",
  "message": "Optional message",
  "data": { }
}
```

**Error:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    { "field": "amount", "message": "Amount must be a positive number" }
  ]
}
```

Handle on mobile:
- `401` → clear token, go to Login
- `400` → show field errors
- `404` → “Not found”
- `429` → rate limited (100 req / 15 min)
- Network error → offline / retry UI

---

## Query Parameters

| Param | Example | Used on |
|-------|---------|---------|
| `page` | `1` | Lists |
| `limit` | `20` | Lists (max 100) |
| `startDate` | `2024-01-01` | Lists, stats |
| `endDate` | `2024-12-31` | Lists, stats |
| `period` | `month` | Stats, dashboard (`today`, `week`, `month`, `year`, `last30days`, `last90days`) |
| `sort` | `latest` | Lists |
| `search` | `orphanage` | Donations / expenses |
| `category` | `food` | Expenses |
| `source` | `salary` | Income |

---

## Suggested Mobile Project Structure

```
mobile-app/
├── src/
│   ├── config/
│   │   └── api.js
│   ├── services/
│   │   ├── apiClient.js
│   │   ├── authService.js
│   │   ├── incomeService.js
│   │   ├── expenseService.js
│   │   ├── donationService.js
│   │   ├── dashboardService.js
│   │   └── aiService.js
│   ├── context/          # AuthContext (user + token)
│   ├── screens/
│   ├── components/
│   └── navigation/
└── App.js
```

---

## Checklist Before First Run

- [ ] Backend `npm run dev` is running
- [ ] MongoDB is connected
- [ ] Base URL matches simulator / emulator / device
- [ ] Android cleartext HTTP allowed for local HTTP
- [ ] Token saved after login/register
- [ ] `Authorization: Bearer <token>` sent on protected routes
- [ ] Test: `GET /health` from device/emulator browser or app

---

## Quick Test Sequence

1. Register a user → save `token`
2. `GET /auth/profile` with Bearer token
3. `POST /income` → check `suggestedDonation` in response
4. `POST /expenses` → list with `GET /expenses`
5. `POST /donations` → `GET /donations/progress`
6. `GET /dashboard/summary?period=month`

---

## Related Docs

- [README.md](./readme.md) — Backend overview
- [SETUP.md](./SETUP.md) — Backend setup
- [API_EXAMPLES.md](./API_EXAMPLES.md) — Full request/response samples
- [docs/APP_FEATURES_SUMMARY.md](./docs/APP_FEATURES_SUMMARY.md) — Feature list

---

## Support

If mobile requests fail:
1. Confirm backend health: `curl http://localhost:5000/health`
2. Confirm base URL for your platform (especially Android `10.0.2.2`)
3. Check token is present and not expired
4. Inspect backend terminal logs for validation/auth errors

---

Made for RizqShare mobile integration · Share your Rizq, earn infinite reward.
