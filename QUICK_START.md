# Karigar Marketplace - Quick Start Guide

## 📋 Project Overview

Karigar is a full-stack, production-grade e-commerce marketplace connecting Indian artisans with buyers. It features:

- ✅ Complete MERN stack implementation
- ✅ Razorpay payment integration
- ✅ Multi-vendor order system
- ✅ KYC verification workflow
- ✅ Artisan "Story" profiles
- ✅ Advanced product filtering & search
- ✅ Role-based authentication (Buyer/Artisan/Admin)
- ✅ Mobile-responsive Tailwind CSS UI
- ✅ Zustand state management
- ✅ Professional folder structure

---

## 🎯 Quick Start (5 minutes)

### Step 1: Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend  
cd frontend
npm install
```

### Step 2: Configure Environment

**Backend (.env file in `backend/` folder):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/karigar_marketplace
JWT_SECRET=karigar_super_secret_jwt_key_2024
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
RAZORPAY_KEY_SECRET=YOUR_SECRET
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**Database Setup:**
- **Local MongoDB**: Download from [mongodb.com](https://www.mongodb.com/try/download/community) and run `mongod`
- **MongoDB Atlas (Cloud)**: Create free cluster at [mongodb.com/cloud](https://www.mongodb.com/cloud/atlas), get connection string, replace `MONGODB_URI` value

**Razorpay Keys (Test):**
1. Sign up at [razorpay.com](https://razorpay.com)
2. Go to Dashboard → Settings → API Keys
3. Copy **Key ID** and **Key Secret** and paste into `.env` file
4. Use test cards from the Testing section below

### Step 3: Start Servers

```bash
# Terminal 1: Backend
cd backend && npm run dev   # Runs on http://localhost:5000

# Terminal 2: Frontend
cd frontend && npm run dev  # Runs on http://localhost:5173
```

### Step 4: Test the App

1. Open `http://localhost:5173`
2. Register as **Buyer** or **Artisan**
3. Browse products, add to cart, checkout with Razorpay test keys
4. For artisans: Set up shop, add products, manage orders

---

## 📚 Key Files & What They Do

### Backend

| File | Purpose |
|------|---------|
| `src/server.js` | Express server, middleware setup |
| `src/config/database.js` | MongoDB connection |
| `src/models/*.js` | Database schemas |
| `src/controllers/*.js` | Business logic |
| `src/routes/*.js` | API endpoints |
| `src/middleware/auth.js` | JWT verification & role checks |
| `src/middleware/upload.js` | File upload handling |

### Frontend

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main app with routing |
| `src/main.jsx` | React entry point |
| `src/store/*.js` | Zustand state stores |
| `src/pages/` | Page components |
| `src/components/` | Reusable components |
| `tailwind.config.js` | Tailwind styling config |
| `vite.config.js` | Vite build config |

---

## 🔄 Data Flow Example

### Buying a Product

```
User clicks "Add to Cart" 
  ↓
Frontend sends POST /api/cart/add with productId
  ↓
Backend verifies JWT, checks stock, adds to Cart collection
  ↓
Frontend updates Zustand cart store
  ↓
User proceeds to checkout
  ↓
Frontend requests Razorpay order from backend
  ↓
Backend creates Razorpay order, returns order ID
  ↓
Frontend opens Razorpay payment modal
  ↓
User completes payment
  ↓
Frontend sends POST /api/orders with payment signature
  ↓
Backend verifies signature, creates Order, decrements stock
  ↓
Order confirmation sent to buyer & sellers
```

---

## 🛠 Common Commands

```bash
# Backend
npm run dev          # Development server with hot reload
npm start           # Production server
npm run seed        # Seed sample data (if available)

# Frontend
npm run dev         # Development with Vite
npm run build       # Production build
npm run preview     # Preview production build
```

---

## 🧪 Testing

### Register Test Users

**Buyer:**
- Email: `buyer@test.com`
- Password: `password123`

**Artisan:**
- Email: `artisan@test.com`
- Password: `password123`

### Razorpay Test Cards

- **Success**: `4111 1111 1111 1111`
- **Failure**: `4444 3333 2222 1111`
- Expiry: Any future date
- CVV: Any 3 digits

---

## 📊 Database Collections

```
┌─ Users
│  ├─ name, email, password (hashed)
│  ├─ role (buyer/artisan/admin)
│  ├─ avatar, phone
│  └─ addresses[], wishlist[]
│
├─ ArtisanProfiles
│  ├─ user (ref)
│  ├─ shopName, story, craftTradition
│  ├─ kyc (status, documents)
│  ├─ craftCategories[]
│  └─ rating, totalSales, totalRevenue
│
├─ Products
│  ├─ artisan (ref)
│  ├─ name, description, price
│  ├─ category, images[]
│  ├─ stock, discount
│  ├─ originState, materials[], technique
│  ├─ reviews[] with ratings
│  └─ isGITagged, customizationAvailable
│
├─ Orders
│  ├─ buyer (ref)
│  ├─ items[] (each with artisan ref & status)
│  ├─ shippingAddress
│  ├─ payment (razorpayOrderId, signature)
│  ├─ totalAmount, status
│  └─ createdAt, updatedAt
│
└─ Carts
   ├─ user (ref, unique)
   ├─ items[] (product, quantity, price snapshot)
   └─ coupon support
```

---

## 🔐 Authentication Flow

```
1. User registers/logs in
   ↓
2. Backend creates JWT token (signed with secret)
   ↓
3. Token sent as HttpOnly cookie + Authorization header
   ↓
4. Frontend stores token in localStorage for API calls
   ↓
5. Protected routes check token validity
   ↓
6. Token expires after 7 days (configurable)
```

---

## 🎨 UI Components

- **Navbar**: Logo, navigation, cart icon, user menu
- **Footer**: Links, social, brand info
- **ProductCard**: Image, name, price, rating, add-to-cart
- **ProductFilter**: Category, price, state, rating filters
- **OrderItem**: Order details, status tracking, actions
- **DashboardStats**: Overview cards for sellers

---

## 🚀 Production Deployment

### Backend (Node.js hosting)
- Render, Railway, Heroku, DigitalOcean
- Use MongoDB Atlas for database
- Set environment variables on hosting platform
- Enable CORS for frontend domain

### Frontend (Static hosting)
- Vercel (recommended for Vite)
- Netlify, GitHub Pages
- Build: `npm run build`
- Deploy `dist/` folder

### Environment Setup
```bash
# Production .env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
MONGODB_URI=mongodb+srv://username:pass@cluster.mongodb.net/
JWT_SECRET=use-strong-random-secret
RAZORPAY_KEY_ID=rzp_live_YOUR_KEY
```

---

## 🐛 Troubleshooting

### Backend Issues

| Issue | Solution |
|-------|----------|
| `Razorpay key_id is mandatory` error | Create `.env` file in backend folder with placeholder Razorpay keys (even test keys). See Step 2 above. |
| MongoDB connection fails | Start MongoDB first: `mongod` (local) or use MongoDB Atlas URI in `.env` |
| Port 5000 already in use | Change `PORT` in `.env` or kill process: `lsof -ti:5000 \| xargs kill` |
| Module not found errors | Run `npm install` in backend folder and restart with `npm run dev` |

### Frontend Issues

| Issue | Solution |
|-------|----------|
| CORS errors | Ensure `FRONTEND_URL` in backend `.env` matches frontend URL (http://localhost:5173) |
| Cart not syncing | Clear localStorage: `localStorage.clear()` in browser console |
| Components not rendering | Check browser console for errors, ensure Tailwind CSS loaded |
| API calls failing | Verify backend is running and `.env` URLs are correct |

### General

| Issue | Solution |
|-------|----------|
| File uploads fail | Create `backend/public/uploads` folder if it doesn't exist |
| Payment test fails | Use Razorpay test card: `4111 1111 1111 1111` with any future expiry |
| Database not persisting | Ensure MongoDB is actually running, not just the connection string set |

---

## 📖 Additional Resources

- [Express.js Docs](https://expressjs.com/)
- [MongoDB Mongoose](https://mongoosejs.com/)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Razorpay API](https://razorpay.com/docs/api/)

---

## 🎓 Next Steps

1. **Test all features** - Browse, buy, sell, manage orders
2. **Customize branding** - Update colors, logo, text
3. **Add more products** - Populate database with samples
4. **Setup email notifications** - Add transactional emails
5. **Analytics** - Integrate GA for tracking
6. **Deploy** - Push to production hosting

---

## ✅ Checklist

- [ ] Backend `.env` configured
- [ ] MongoDB running and connected
- [ ] Frontend running at localhost:5173
- [ ] Can register and login
- [ ] Can browse and filter products
- [ ] Can add items to cart
- [ ] Payment flow works with Razorpay
- [ ] Orders persist in database
- [ ] Artisan dashboard shows stats

---

**Happy coding! 🚀 For questions or issues, check the main README.md or create an issue.**
