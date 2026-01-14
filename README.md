EEE Inventory Management System

A full-stack web-based inventory management system for managing categories, products, customers, and orders.

## Features

- User Authentication (JWT-based)
- Role-based Access Control (Super Admin & Admin)
- Category Management
- Product Management
- Customer Management
- Order Creation and Management
- Order Status Tracking

## Technology Stack

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcryptjs for password hashing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- npm or yarn

## Installation

### 1. Clone or Extract the Project

```bash
cd eee-inventory-system
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory with the following content:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/eee_inventory
JWT_SECRET=eee_inventory_secret_key_2024
JWT_EXPIRE=30d
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On macOS/Linux
mongod

# On Windows
# Start MongoDB service from Services or run mongod.exe
```

### 5. Create Initial Super Admin User

After starting the server for the first time, you need to manually create a super admin user in MongoDB:

```javascript
// Connect to MongoDB using mongosh or MongoDB Compass
use eee_inventory

// Insert super admin user
db.users.insertOne({
  name: "Super Admin",
  email: "admin@eee.com",
  password: "$2a$10$YourHashedPasswordHere",
  role: "super_admin",
  createdAt: new Date()
})
```

**OR** Use this Node.js script (create `createSuperAdmin.js` in backend folder):

```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI);

async function createSuperAdmin() {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@eee.com' });
    
    if (existingAdmin) {
      console.log('Super admin already exists');
      process.exit();
    }
    
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@eee.com',
      password: 'admin123',
      role: 'super_admin'
    });
    
    console.log('Super admin created successfully');
    console.log('Email: admin@eee.com');
    console.log('Password: admin123');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

createSuperAdmin();
```

Run: `node createSuperAdmin.js`

### 6. Start the Backend Server

```bash
cd backend
npm start

# For development with auto-restart:
npm run dev
```

The server will start on `http://localhost:8000`

### 7. Open the Frontend

Open `frontend/index.html` in your web browser, or use a local server:

```bash
# Using Python
cd frontend
python -m http.server 8000

# Using Node.js http-server
npx http-server frontend -p 8000
```

Then navigate to `http://localhost:8000`

## Default Login Credentials

```
Email: admin@eee.com
Password: admin123
```

## Usage Guide

### 1. Login
- Open the application in your browser
- Enter your email and password
- Click "Login"

### 2. Dashboard Navigation
- After login, you'll see the welcome message
- Use the sidebar to navigate between different modules
- The top bar shows your name and provides access to profile and logout

### 3. Managing Categories
- Click "Category" in the sidebar
- Click "Add New Category" to create a category
- Fill in the form and click "Save"
- Use Edit/Delete buttons to modify categories

### 4. Managing Products
- Click "Product" in the sidebar
- Click "Add New Product" to create a product
- Select a category, enter price, quantity, and description
- Click "Save"

### 5. Managing Customers
- Click "Customer" in the sidebar
- Click "Add New Customer"
- Fill in customer details
- Click "Save"

### 6. Creating Orders
- Click "Order" in the sidebar
- Select a customer
- Add products by selecting product and quantity
- Click "Add Product" for each item
- Review total amount
- Click "Create Order"

### 7. Managing Orders
- Click "Manage Orders" in the sidebar
- View all orders with their status
- Use the dropdown to update order status

### 8. Adding Admins (Super Admin Only)
- Click the user menu in the top right
- Click "Add Admin"
- Fill in admin details
- Click "Add Admin"

## Project Structure

```
eee-inventory-system/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication & authorization
│   ├── server.js        # Entry point
│   └── package.json     # Dependencies
├── frontend/
│   ├── assets/
│   │   ├── css/        # Stylesheets
│   │   └── js/         # JavaScript files
│   ├── pages/          # HTML pages
│   └── index.html      # Entry point
└── README.md
```

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user

### Users
- POST `/api/users/admin` - Create admin (Super Admin only)
- GET `/api/users/admins` - Get all admins (Super Admin only)
- GET `/api/users/profile` - Get user profile
- PUT `/api/users/profile` - Update user profile

### Categories
- GET `/api/categories` - Get all categories
- POST `/api/categories` - Create category
- GET `/api/categories/:id` - Get single category
- PUT `/api/categories/:id` - Update category
- DELETE `/api/categories/:id` - Delete category

### Products
- GET `/api/products` - Get all products
- POST `/api/products` - Create product
- GET `/api/products/:id` - Get single product
- PUT `/api/products/:id` - Update product
- DELETE `/api/products/:id` - Delete product

### Customers
- GET `/api/customers` - Get all customers
- POST `/api/customers` - Create customer
- GET `/api/customers/:id` - Get single customer
- PUT `/api/customers/:id` - Update customer
- DELETE `/api/customers/:id` - Delete customer

### Orders
- GET `/api/orders` - Get all orders
- POST `/api/orders` - Create order
- GET `/api/orders/:id` - Get single order
- PUT `/api/orders/:id/status` - Update order status
- DELETE `/api/orders/:id` - Delete order

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check the `MONGO_URI` in `.env` file
- Verify MongoDB is accessible on the specified port

### Login Fails
- Verify super admin user exists in database
- Check email and password are correct
- Ensure backend server is running

### CORS Errors
- The backend has CORS enabled for all origins
- If issues persist, check browser console for specific errors

### Frontend Not Loading Data
- Ensure backend server is running on port 8000
- Check browser console for API errors
- Verify JWT token is being stored in localStorage

## License

This project is for educational purposes.

## Support

For issues or questions, please contact your instructor or create an issue in the project repository.
