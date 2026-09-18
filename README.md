# SHEMA STORE - E-Commerce Platform

A modern, full-stack e-commerce website built with:
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js + Express.js
- **Database**: MySQL
- **Authentication**: Session-based with bcrypt password hashing

## Project Structure

```
shema-store/
├── client/                 # Customer-facing website
│   ├── assets/
│   │   ├── css/           # Stylesheets
│   │   ├── js/            # JavaScript files
│   │   └── images/        # Images and assets
│   └── *.html             # HTML pages
│
├── admin/                  # Admin dashboard
│   ├── assets/
│   │   ├── css/           # Admin styles
│   │   ├── js/            # Admin scripts
│   │   └── images/        # Admin images
│   └── *.html             # Admin pages
│
├── server/                 # Node.js backend
│   ├── config/            # Configuration files
│   ├── controllers/       # Request handlers
│   ├── routes/           # API endpoints
│   ├── middleware/       # Express middleware
│   ├── models/           # Data models
│   ├── utils/            # Utility functions
│   ├── uploads/          # Uploaded files
│   ├── server.js         # Entry point
│   └── app.js            # Express app setup
│
├── database/             # Database files
│   ├── database.sql      # Database schema
│   └── seed.js           # Sample data
│
├── package.json          # Dependencies
├── .env                  # Environment variables
├── .env.example          # Example env file
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## Prerequisites

Before starting, ensure you have installed:

1. **Node.js** (v14.0.0 or higher)
   - Download from https://nodejs.org/

2. **MySQL** (via XAMPP or standalone)
   - XAMPP: https://www.apachefriends.org/
   - Or MySQL Community Server: https://dev.mysql.com/downloads/mysql/

3. **Git** (optional, for version control)
   - Download from https://git-scm.com/

## Installation & Setup

### Step 1: Extract/Clone Project

Extract the SHEMA STORE project to your desired location or clone it:

```bash
cd C:\xampp\htdocs\
git clone <repository-url> shema-store
cd shema-store
```

### Step 2: Install Node.js Dependencies

```bash
npm install
```

This installs all required packages listed in `package.json`:
- express (Web framework)
- mysql2 (Database driver)
- bcrypt (Password hashing)
- dotenv (Environment variables)
- cors (Cross-origin requests)
- helmet (Security headers)
- express-session (Session management)
- multer (File uploads)
- express-validator (Input validation)
- nodemon (Development auto-reload)

### Step 3: Set Up MySQL Database

1. **Start XAMPP** (or your MySQL server)
   - Open XAMPP Control Panel
   - Click "Start" next to MySQL

2. **Create Database**
   - Open phpMyAdmin (http://localhost/phpmyadmin)
   - Click "New" on the left sidebar
   - Database name: `shema_store`
   - Collation: `utf8mb4_unicode_ci`
   - Click "Create"

3. **Import Database Schema**
   - In phpMyAdmin, select the `shema_store` database
   - Click "Import" tab
   - Choose file: `database/database.sql`
   - Click "Go"

   OR use MySQL command line:
   ```bash
   mysql -u root -p < database/database.sql
   ```

### Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and update values:
   ```
   NODE_ENV=development
   PORT=3000
   
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=          # Leave empty if no password
   DB_NAME=shema_store
   
   SESSION_SECRET=change_this_to_secure_random_string
   JWT_SECRET=change_this_to_secure_random_string
   ```

### Step 5: Start the Application

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start on `http://localhost:3000`

## Usage

### Customer Website

**URLs**:
- Home: http://localhost:3000/client/index.html
- Products: http://localhost:3000/client/products.html
- Cart: http://localhost:3000/client/cart.html
- Checkout: http://localhost:3000/client/checkout.html
- Account: http://localhost:3000/client/account.html

**Features**:
- Browse products
- Search functionality
- Shopping cart
- Wishlist
- User registration & login
- WhatsApp checkout integration
- User profile & order history

### Admin Dashboard

**URL**: http://localhost:3000/admin/login.html

**Default Credentials**:
- Username: `Shema`
- Password: `shema1@`

**Admin Features**:
- Product management (add, edit, delete)
- Product image management
- Category management
- Order management
- Customer management
- Product reviews
- Store settings
- Admin credentials change

## API Endpoints

### Authentication
```
POST   /api/auth/login          - Customer login
POST   /api/auth/register       - Customer registration
POST   /api/auth/logout         - Customer logout
GET    /api/auth/me             - Get current user
```

### Products
```
GET    /api/products            - Get all products
GET    /api/products/:id        - Get single product
GET    /api/products/search     - Search products
POST   /api/products            - Create product (Admin)
PUT    /api/products/:id        - Update product (Admin)
DELETE /api/products/:id        - Delete product (Admin)
```

### Categories
```
GET    /api/categories          - Get all categories
GET    /api/categories/:id      - Get category with products
POST   /api/categories          - Create category (Admin)
PUT    /api/categories/:id      - Update category (Admin)
DELETE /api/categories/:id      - Delete category (Admin)
```

### Shopping Cart
```
GET    /api/cart                - Get user's cart
POST   /api/cart                - Add item to cart
PUT    /api/cart/:itemId        - Update cart item
DELETE /api/cart/:itemId        - Remove item from cart
DELETE /api/cart                - Clear entire cart
```

### Wishlist
```
GET    /api/wishlist            - Get user's wishlist
POST   /api/wishlist            - Add to wishlist
DELETE /api/wishlist/:productId - Remove from wishlist
DELETE /api/wishlist            - Clear wishlist
```

### Orders
```
GET    /api/orders              - Get all orders (Admin)
GET    /api/orders/:id          - Get order details
POST   /api/orders              - Create order
PUT    /api/orders/:id          - Update order (Admin)
DELETE /api/orders/:id          - Delete order (Admin)
```

### Reviews
```
GET    /api/reviews/product/:id - Get product reviews
GET    /api/reviews             - Get all reviews (Admin)
POST   /api/reviews             - Create review
PUT    /api/reviews/:id         - Update review
DELETE /api/reviews/:id         - Delete review (Admin)
```

### Store Settings
```
GET    /api/settings            - Get store settings
PUT    /api/settings            - Update settings (Admin)
```

## WhatsApp Checkout

When customers complete checkout, they are redirected to WhatsApp with a pre-filled message containing:
- Customer name and phone
- Delivery location
- Products and quantities
- Order total
- Customer notes

**Store WhatsApp Number**: +250 793 087 491

The number is configured in store settings and can be updated by the admin.

## Security Features

- **Password Hashing**: bcrypt with 10 salt rounds
- **Session Management**: Secure server-side sessions
- **CORS Protection**: Configurable CORS origin
- **Security Headers**: Helmet.js for HTTP security
- **File Upload Validation**: MIME type and size checking
- **Input Validation**: express-validator for request data
- **SQL Injection Prevention**: Parameterized queries with mysql2
- **Admin Authentication**: Session-based with middleware protection
- **User Authentication**: Session-based with middleware protection

## File Upload

**Supported File Types**:
- .jpg, .jpeg
- .png
- .webp

**Upload Size Limit**: 5MB

**Upload Directories**:
- Products: `server/uploads/products/`
- Categories: `server/uploads/categories/`
- Users: `server/uploads/users/`

## Database Schema

### Main Tables

**admins**: Admin accounts
- username, password (hashed), email

**users**: Customer accounts
- first_name, last_name, email, phone, password (hashed), address

**products**: Product listings
- name, description, sku, price, discount, stock, category_id

**categories**: Product categories
- name, description, image, is_active

**orders**: Customer orders
- customer_name, phone, delivery_location, notes, total_amount, status

**order_items**: Items in each order
- order_id, product_id, quantity, price, size, color

**wishlists**: User favorites
- user_id, product_id

**reviews**: Product reviews
- product_id, user_id, rating, comment, is_approved

**store_settings**: Store configuration
- store_name, whatsapp_number, phone, email, address, etc.

## Troubleshooting

### Port 3000 Already in Use
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### MySQL Connection Error
- Ensure MySQL/XAMPP is running
- Check DB_HOST, DB_USER, DB_PASSWORD in .env
- Verify database `shema_store` exists

### Cannot Find Module Errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors
- Check CORS_ORIGIN in .env matches your domain
- Ensure credentials are set to 'include' in fetch calls

## Development Tips

### Enable Auto-Reload
```bash
npm run dev
# Uses nodemon to auto-restart server on file changes
```

### View Database in phpMyAdmin
```
http://localhost/phpmyadmin
```

### Test API Endpoints
Use Postman, Insomnia, or curl:
```bash
curl -X GET http://localhost:3000/api/products \
  -H "Content-Type: application/json"
```

## Deployment

For production deployment:

1. Set `NODE_ENV=production` in .env
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server/server.js
   pm2 startup
   pm2 save
   ```
3. Use a reverse proxy like Nginx
4. Enable HTTPS with SSL certificates
5. Set secure environment variables
6. Use a managed database (e.g., AWS RDS)

## Performance Optimization

- Add database indexes on frequently searched columns
- Implement caching for product listings
- Optimize image sizes and formats
- Use CDN for static assets
- Implement pagination for large data sets
- Add request rate limiting

## Future Enhancements

- Payment gateway integration (Stripe, PayPal)
- Email notifications
- SMS notifications
- Inventory management
- Analytics dashboard
- Product recommendations
- Advanced search filters
- User reviews and ratings
- Shipping integration
- Multi-language support

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, contact: support@shema-store.local

## Credits

SHEMA STORE - Built with ❤️ using Node.js + Express + MySQL
