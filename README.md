# 🪔 Karigar - Indian Artisan Handicraft Marketplace

A full-stack e-commerce platform connecting rural Indian artisans directly to buyers, preserving cultural heritage while empowering local craftsmen.

## 🎯 Features

### For Buyers
- Browse products by category, price, rating, and location
- Advanced filtering and search functionality
- Secure checkout with Razorpay payment integration
- Order tracking and management
- Product reviews and ratings
- Wishlist management
- Persistent shopping cart
- Address management

### For Artisans (Sellers)
- Complete shop setup with profile and branding
- Product listing with rich metadata (craft tradition, origin, materials)
- KYC verification for seller credibility
- Artisan "Story" section (journey, village, tradition, photos)
- Order management dashboard
- Analytics on sales, revenue, and products
- Multi-product ordering support
- Rating and review management

### For Admin
- KYC verification workflow
- Product approval system
- User and content management
- Analytics and reporting

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT with HttpOnly Cookies
- **Payment**: Razorpay API
- **File Upload**: Multer
- **Security**: bcryptjs, CORS, Cookie Parser

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod Validation
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Payment**: Razorpay Widget

## 📁 Project Structure

```
karigar-market/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & environment config
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth, error handling, file upload
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API endpoints
│   │   ├── utils/           # Helper functions
│   │   └── server.js        # Express app entry
│   ├── public/uploads/      # User-uploaded files
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable React components
    │   ├── pages/           # Page components
    │   ├── store/           # Zustand state stores
    │   ├── hooks/           # Custom React hooks
    │   ├── utils/           # Helper functions
    │   ├── services/        # API calls
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    └── README.md
```

## 🗄 Database Schema

### User Model
- Authentication (email, password)
- Role-based access (buyer, artisan, admin)
- Profile (name, phone, avatar)
- Shipping addresses
- Wishlist

### ArtisanProfile Model
- Shop branding (shopName, logo, banner)
- Artisan story & craft tradition
- KYC verification (Aadhaar, PAN, Bank details)
- Craft categories & GI tagging
- Rating & statistics

### Product Model
- Rich product metadata (materials, technique, crafting time)
- Multi-image support
- Pricing & discounts
- Inventory management
- Reviews & ratings
- Origin & cultural information

### Order Model
- Multi-vendor order items (each artisan's items tracked separately)
- Order lifecycle (pending → confirmed → processing → shipped → delivered)
- Payment integration (Razorpay)
- Shipping tracking
- Item-level status tracking

### Cart Model
- Persistent shopping cart
- Coupon support
- Item quantity management

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Razorpay account (test keys)
- npm or yarn

### Backend Setup

1. **Navigate to backend folder**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/karigar_marketplace
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
FRONTEND_URL=http://localhost:5173
```

4. **Start MongoDB** (if running locally)
```bash
mongod
```

5. **Run development server**
```bash
npm run dev
```

Server will start at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend folder**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file** (Vite will automatically proxy to backend)
```env
VITE_API_URL=http://localhost:5000/api
```

4. **Run development server**
```bash
npm run dev
```

Frontend will start at `http://localhost:5173`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (artisan only)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/:id/reviews` - Add review

### Orders
- `POST /api/orders/create-razorpay-order` - Create Razorpay order
- `POST /api/orders` - Create order (after payment)
- `GET /api/orders/my-orders` - Get buyer's orders
- `GET /api/orders/seller/my-orders` - Get seller's orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/item/:itemId/status` - Update item status
- `PUT /api/orders/:id/cancel` - Cancel order

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart/add` - Add to cart
- `PUT /api/cart/update` - Update item quantity
- `DELETE /api/cart/:productId` - Remove item
- `DELETE /api/cart/clear` - Clear cart

### Artisans
- `GET /api/artisans` - Get all artisans
- `GET /api/artisans/:id` - Get artisan profile
- `PUT /api/artisans/profile` - Update artisan profile
- `POST /api/artisans/kyc` - Submit KYC documents
- `GET /api/artisans/dashboard/stats` - Get dashboard stats

## 🎨 UI/UX Design

### Color Scheme (Indian Heritage)
- **Saffron** (#FF9933) - Primary accent
- **Clay** (#A67C52) - Warm earth tone
- **Terracotta** (#C85A54) - Craft warmth
- **Indigo** (#1C0E4F) - Deep traditional
- **Sage** (#7B8A5E) - Natural
- **Gold** (#D4AF37) - Premium

### Typography
- Serif for headings (Georgia) - Traditional elegance
- Sans-serif for body (Inter) - Modern clarity

### Mobile-First Responsive Design
- Tailwind CSS breakpoints: sm, md, lg, xl
- Touch-friendly interactive elements
- Optimized for all device sizes

## 🔐 Security Features

- JWT authentication with HttpOnly cookies
- Password hashing with bcryptjs
- Razorpay signature verification
- Input validation with Zod schemas
- CORS enabled with credentials
- Role-based access control (RBAC)
- Protected API endpoints
- File upload restrictions

## 📦 Deployment

### Backend (Heroku/Railway/Render)
```bash
npm install -g heroku
heroku login
heroku create your-app-name
git push heroku main
```

### Frontend (Vercel/Netlify)
```bash
npm run build
vercel deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Traditional Indian artisans for their heritage
- MongoDB & Express communities
- React & Tailwind CSS ecosystems
- Razorpay for payment solutions

---

**Made with ❤️ for Indian Artisans**

For support, email support@karigar.in or open an issue on GitHub.
