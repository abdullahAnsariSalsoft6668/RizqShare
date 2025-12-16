# 🚀 RizqShare Backend Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (local or Atlas) - [Download](https://www.mongodb.com/try/download/community) or [Atlas Setup](https://www.mongodb.com/cloud/atlas)
- **Git** (optional) - [Download](https://git-scm.com/)

## Step-by-Step Setup

### 1. Navigate to Project Directory

```bash
cd /Users/abdullahansari/Desktop/abdullah-ansari/node-js/RiskShare
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including Express, MongoDB, Firebase Admin, and more.

### 3. Configure Environment Variables

The `.env` file has been created with default values. Update it with your configuration:

```bash
# Edit the .env file
nano .env
```

**Required Configuration:**

1. **MongoDB URI**
   - Local: `mongodb://localhost:27017/rizqshare` (default)
   - Atlas: Get connection string from MongoDB Atlas dashboard

2. **JWT Secret**
   - Change `JWT_SECRET` to a strong random string for production

**Optional Configuration:**

3. **Firebase (for Authentication)**
   - Download Firebase Admin SDK JSON from Firebase Console
   - Place it in the root directory as `firebase-adminsdk.json`
   - OR set environment variables:
     - `FIREBASE_PROJECT_ID`
     - `FIREBASE_PRIVATE_KEY`
     - `FIREBASE_CLIENT_EMAIL`

4. **OpenAI (for AI Features)**
   - Get API key from [OpenAI Platform](https://platform.openai.com/)
   - Set `OPENAI_API_KEY` in `.env`

### 4. Start MongoDB

**If using local MongoDB:**

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Or manually
mongod --dbpath /path/to/your/data/directory
```

**If using MongoDB Atlas:**
- No need to start anything locally
- Just update `MONGODB_URI` in `.env` with your Atlas connection string

### 5. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
🚀 RizqShare Server running on port 5000
📝 Environment: development
🌐 API URL: http://localhost:5000/api
✅ MongoDB Connected: localhost
📦 Database: rizqshare
```

### 6. Test the API

**Check server health:**
```bash
curl http://localhost:5000/health
```

**Register a new user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

## Project Structure

```
RiskShare/
├── src/
│   ├── config/          # Database, Firebase, OpenAI config
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware
│   ├── services/        # Business logic services
│   ├── utils/           # Helper functions
│   ├── app.js          # Express app setup
│   └── server.js       # Server entry point
├── uploads/            # Uploaded files (auto-created)
├── .env               # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile

### Income
- `GET /api/income` - Get all income
- `POST /api/income` - Add income
- `GET /api/income/stats` - Get statistics

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Add expense
- `GET /api/expenses/stats` - Get statistics
- `POST /api/expenses/:id/receipt` - Upload receipt

### Donations
- `GET /api/donations` - Get all donations
- `POST /api/donations` - Add donation
- `GET /api/donations/stats` - Get statistics
- `GET /api/donations/progress` - Get donation progress
- `GET /api/donations/export` - Export donations

### Dashboard
- `GET /api/dashboard/summary` - Overall summary
- `GET /api/dashboard/trends` - Financial trends
- `GET /api/dashboard/giving-score` - Giving score details

### AI Features
- `POST /api/ai/financial-advice` - Get AI advice
- `POST /api/ai/donation-recommendations` - Get recommendations
- `POST /api/ai/categorize-expense` - Auto-categorize expense
- `POST /api/ai/impact-story` - Generate impact story
- `GET /api/ai/forecast` - Forecast donations

## Testing with Postman/Thunder Client

1. Import the base URL: `http://localhost:5000/api`
2. Register a user to get a token
3. Add token to Authorization header: `Bearer <your-token>`
4. Start making requests!

## Common Issues

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### MongoDB Connection Failed
- Check if MongoDB is running
- Verify `MONGODB_URI` in `.env`
- Check firewall settings

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Development Tips

1. **Use nodemon for auto-reload:**
   ```bash
   npm run dev
   ```

2. **Check logs:** Server logs show all requests and errors

3. **MongoDB GUI:** Use [MongoDB Compass](https://www.mongodb.com/products/compass) to view your data

4. **API Testing:** Use [Postman](https://www.postman.com/) or [Thunder Client](https://www.thunderclient.com/)

## Next Steps

1. **Frontend Integration:** Connect your React Native app to this backend
2. **Deploy:** Deploy to services like Heroku, Railway, or DigitalOcean
3. **Firebase Setup:** Configure Firebase for authentication
4. **OpenAI Setup:** Add OpenAI API key for AI features
5. **Email Service:** Implement notification service with SendGrid or Mailgun

## Support

For issues or questions:
- Check the main [README.md](./README.md)
- Review API documentation above
- Check console logs for error messages

---

Happy coding! 🌟

