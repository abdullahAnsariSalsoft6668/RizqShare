# ⚡ RizqShare Quick Reference Card

## 🚀 Get Started in 3 Steps

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm run dev

# 3. Test it
curl http://localhost:5000/health
```

---

## 🔑 Essential Commands

```bash
# Development (auto-reload)
npm run dev

# Production
npm start

# Using start script
./start.sh
```

---

## 📡 Base URLs

```
Local:  http://localhost:5000
API:    http://localhost:5000/api
Health: http://localhost:5000/health
```

---

## 🔐 Quick Auth Flow

```bash
# 1. Register
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "pass123",
  "fullName": "John Doe"
}

# 2. Login (get token)
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "pass123"
}

# 3. Use token in all requests
Authorization: Bearer <your-token>
```

---

## 📊 Main Endpoints

### Income
```
GET    /api/income              # List all
POST   /api/income              # Add new
GET    /api/income/:id          # Get one
PUT    /api/income/:id          # Update
DELETE /api/income/:id          # Delete
GET    /api/income/stats        # Statistics
```

### Expenses
```
GET    /api/expenses            # List all
POST   /api/expenses            # Add new
PUT    /api/expenses/:id        # Update
DELETE /api/expenses/:id        # Delete
GET    /api/expenses/stats      # Statistics
POST   /api/expenses/:id/receipt # Upload receipt
```

### Donations
```
GET    /api/donations           # List all
POST   /api/donations           # Add new
PUT    /api/donations/:id       # Update
DELETE /api/donations/:id       # Delete
GET    /api/donations/stats     # Statistics
GET    /api/donations/progress  # Progress
GET    /api/donations/export    # Export CSV
```

### Dashboard
```
GET /api/dashboard/summary      # Overall summary
GET /api/dashboard/trends       # Financial trends
GET /api/dashboard/giving-score # Giving score
GET /api/dashboard/categories   # Category breakdown
GET /api/dashboard/predictions  # Predictions
```

### AI
```
POST /api/ai/financial-advice        # Get advice
POST /api/ai/donation-recommendations # Recommendations
POST /api/ai/categorize-expense      # Auto-categorize
POST /api/ai/impact-story            # Generate story
GET  /api/ai/forecast                # Forecast
```

---

## 💡 Common Queries

```bash
# Get current month data
GET /api/income?period=month

# Get with date range
GET /api/expenses?startDate=2024-01-01&endDate=2024-01-31

# Pagination
GET /api/donations?page=2&limit=20

# Search
GET /api/expenses?search=grocery

# Filter by category
GET /api/expenses?category=food

# Sort
GET /api/income?sort=oldest
```

---

## 🎯 Quick Add Examples

### Add Income
```json
POST /api/income
{
  "source": "salary",
  "amount": 50000,
  "description": "Monthly salary",
  "date": "2024-01-15"
}
```

### Add Expense
```json
POST /api/expenses
{
  "title": "Groceries",
  "amount": 3500,
  "category": "food",
  "date": "2024-01-16"
}
```

### Add Donation
```json
POST /api/donations
{
  "recipient": "Local Charity",
  "amount": 2000,
  "purpose": "Monthly support",
  "category": "education",
  "date": "2024-01-20"
}
```

---

## 🔧 Configuration

### Environment (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rizqshare
JWT_SECRET=your_secret_key
OPENAI_API_KEY=your_openai_key (optional)
```

### File Locations
- **Config:** `src/config/`
- **Models:** `src/models/`
- **Routes:** `src/routes/`
- **Controllers:** `src/controllers/`
- **Uploads:** `uploads/`

---

## 📦 Categories Reference

### Income Sources
- `salary`
- `freelance`
- `business`
- `investment`
- `rental`
- `gift`
- `other`

### Expense Categories
- `food`
- `travel`
- `bills`
- `shopping`
- `healthcare`
- `education`
- `entertainment`
- `housing`
- `transportation`
- `utilities`
- `insurance`
- `personal`
- `charity`
- `other`

### Donation Categories
- `zakat`
- `sadaqah`
- `tithe`
- `education`
- `healthcare`
- `poverty-relief`
- `disaster-relief`
- `animal-welfare`
- `environment`
- `religious`
- `community`
- `other`

---

## 🛠️ Troubleshooting

### Port in Use
```bash
lsof -ti:5000 | xargs kill -9
```

### MongoDB Not Running
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Reset Dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

### Check Logs
- Server logs appear in terminal
- MongoDB logs: Check MongoDB data directory

---

## 📱 Response Format

### Success
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { ... }
}
```

### Error
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [ ... ]
}
```

---

## 🎨 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

---

## 🔥 Pro Tips

1. **Use pagination** for large datasets
2. **Filter by date** for specific periods
3. **Export donations** for tax purposes
4. **Upload receipts** for documentation
5. **Check giving score** regularly
6. **Use AI features** for insights
7. **Monitor trends** monthly
8. **Set donation goals** realistically

---

## 📚 Documentation Files

- `README.md` - Overview & features
- `SETUP.md` - Detailed setup guide
- `API_EXAMPLES.md` - Complete API docs
- `PROJECT_SUMMARY.md` - Technical summary
- `QUICK_REFERENCE.md` - This file

---

## 🆘 Need Help?

1. Check `SETUP.md` for setup issues
2. Review `API_EXAMPLES.md` for API usage
3. See `PROJECT_SUMMARY.md` for architecture
4. Check server logs for errors
5. Verify MongoDB connection
6. Check `.env` configuration

---

## 🎯 Testing Checklist

- [ ] Server starts successfully
- [ ] Health check responds
- [ ] Can register user
- [ ] Can login and get token
- [ ] Can add income
- [ ] Can add expense
- [ ] Can add donation
- [ ] Dashboard shows summary
- [ ] File upload works
- [ ] AI features respond

---

**Quick Start:** `npm install && npm run dev`

**Test API:** `curl http://localhost:5000/health`

**Happy Coding! 🌟**

