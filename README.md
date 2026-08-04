# 📦 Smart Inventory Management System

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.19.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green.svg)](https://www.mongodb.com/)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

An enterprise-grade, full-stack **Smart Inventory Management System** built with **MongoDB**, **Express.js**, **React 19**, and **Node.js** (MERN). Features real-time stock tracking, multi-warehouse management, supplier workflows, stock-in/out audit logs, QR code generation and scanning, automated PDF reporting, and an integrated **AI Assistant** powered by Groq LLM (`llama-3.3-70b-versatile`).

---

## 🌟 Key Features

- 📊 **Interactive Analytics Dashboard**: Real-time KPI summary cards, low stock alerts, reorder recommendations, and interactive charts powered by Recharts.
- 📦 **Product Catalog Management**: Comprehensive CRUD operations for products with image upload support (Multer), SKU tracking, stock thresholds, pricing, category, and warehouse assignment.
- 🏢 **Multi-Warehouse Tracking**: Monitor warehouse capacities, locations, and manage inventory across multiple physical storage hubs.
- 🏷️ **Category & Subcategory Hierarchy**: Organize products efficiently with structured categories, attributes, and tags.
- 🏭 **Supplier & Purchase Order Management**: Maintain supplier profiles, monitor lead times, create purchase orders, and track order lifecycles.
- 📥 **Stock-In & 📤 Stock-Out Operations**: Track incoming inventory and outgoing stock transfers with batch numbers, detailed reason codes, and real-time inventory updates.
- 📱 **QR Code & Barcode Generator / Scanner**: Generate printable QR codes for products, export labels to PDF, and scan barcodes directly within the web app using device cameras.
- 📄 **Reports & Exporting**: Generate comprehensive inventory, sales, and movement reports with export options to **PDF** (jsPDF AutoTable) and **CSV/Excel**.
- 🤖 **Groq-Powered AI Assistant**: Ask questions in natural language about current stock status, receive automated reordering advice, and analyze inventory trends.
- 🔐 **Authentication & Security**: Secure JSON Web Token (JWT) authentication, password encryption via `bcrypt`, and user profile management.

---

## 🏗️ Project Architecture & Tech Stack

### Technology Stack

- **Frontend**: React 19, Vite 8, React Router v7, Recharts, Lucide Icons, jsPDF & jsPDF-AutoTable, QRCode React, Axios.
- **Backend**: Node.js, Express 5, Mongoose ORM, JSON Web Token (JWT), Multer, Groq Cloud API.
- **Database**: MongoDB Atlas or local MongoDB instance.

### Directory Structure

```text
smartInventoryManagement/
├── client/                     # Frontend React (Vite) Application
│   ├── public/                 # Static assets & public files
│   ├── src/
│   │   ├── api/                # Axios instance & interceptors
│   │   ├── components/         # Reusable UI components (Sidebar, Navbar, Modals, etc.)
│   │   ├── context/            # React context (Auth context, Theme context)
│   │   ├── layouts/            # Main application layouts
│   │   ├── pages/              # App views (Dashboard, Products, StockIn, Reports, etc.)
│   │   └── utils/              # Helper functions & formatters
│   ├── package.json            # Client dependencies & scripts
│   └── vite.config.js          # Vite configuration
│
├── server/                     # Backend Express.js Server
│   ├── config/                 # Database configuration (db.js)
│   ├── controllers/            # Request handlers & business logic
│   ├── middleware/             # Auth & upload middleware
│   ├── models/                 # Mongoose schemas (Product, User, Warehouse, etc.)
│   ├── routes/                 # API routes (authRoutes, productRoutes, etc.)
│   ├── uploads/                # Product images directory
│   ├── utils/                  # Helper utilities & AI helpers
│   ├── seedDatabase.js         # Sample inventory seeder script
│   ├── seedUser.js             # Admin user initialization script
│   ├── server.js               # Express application entry point
│   ├── package.json            # Server dependencies & scripts
│   └── .env.example            # Environment variables template
│
├── package.json                # Root package configuration & convenience scripts
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

Follow these instructions to set up and run the Smart Inventory Management System on your local machine.

### Prerequisites

Ensure you have the following software installed:

- **Node.js**: `v20.19.0` or higher ([Download Node.js](https://nodejs.org/))
- **npm**: `v10.x` or higher (comes with Node.js)
- **MongoDB**: A running local MongoDB instance or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URL.
- **Groq API Key** (Optional): For AI Assistant features. Get a free API key at [Groq Console](https://console.groq.com/).

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/UmerDevHub/inventory-management-system.git
cd inventory-management-system
```

---

### Step 2: Install Dependencies

You can install all dependencies for both the root, server, and client with a single command from the project root:

```bash
npm run postinstall
```

*Alternatively, install them manually in each directory:*
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

---

### Step 3: Configure Environment Variables

1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Copy `.env.example` to create a `.env` file:
   ```bash
   cp .env.example .env
   ```
3. Open `server/.env` and update the environment variables according to your configuration:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/smart_inventory?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here

# AI Assistant Configuration (Groq Cloud API)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

4. (Optional) In the `client/` directory, you can create a `.env` file if you need to point to a custom API URL:
```env
VITE_API_URL=http://localhost:5000/api
```

---

### Step 4: Seed the Database

Before launching the app, initialize the default **Admin user** and optional **sample inventory data**:

#### 1. Create Default Admin User
```bash
# From root directory
npm run seed:admin

# Or from server directory
cd server && npm run seed:admin
```

**Default Admin Credentials:**
- **Email**: `admin@gmail.com`
- **Password**: `123456`

#### 2. Populate Sample Data (Categories, Warehouses, Products, Purchases, Suppliers)
```bash
# From root directory
npm run seed

# Or from server directory
cd server && npm run seed
```

---

### Step 5: Start the Project in Development Mode

You can run the backend server and frontend client concurrently or in separate terminals.

#### Option A: Running from Root Directory

**Terminal 1 (Backend Server):**
```bash
npm run dev:server
```
*Server will start on `http://localhost:5000`*

**Terminal 2 (Frontend Client):**
```bash
npm run dev:client
```
*Client will open on `http://localhost:5173`*

#### Option B: Running Individually

**Start Server:**
```bash
cd server
npm run dev
```

**Start Client:**
```bash
cd client
npm run dev
```

Open your browser and navigate to `http://localhost:5173`. Log in using the admin credentials (`admin@gmail.com` / `123456`).

---

### Step 6: Building for Production

To build the client application and serve it directly from the Express backend:

```bash
# 1. Build the frontend client bundle
npm run build

# 2. Start the production Express server
npm start
```
The server serves the compiled React static files from `client/dist` and will be accessible at `http://localhost:5000`.

---

## 📡 API Endpoint Overview

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Register a new user |
| | `POST` | `/api/auth/login` | User authentication & JWT issuance |
| | `GET` | `/api/auth/profile` | Get current user profile |
| **Products** | `GET` | `/api/products` | Get list of all products |
| | `POST` | `/api/products` | Create a new product (with image upload) |
| | `PUT` | `/api/products/:id` | Update product details |
| | `DELETE`| `/api/products/:id` | Delete product |
| **Categories**| `GET` | `/api/categories` | Get all product categories |
| | `POST` | `/api/categories` | Create a new category |
| **Warehouses**| `GET` | `/api/warehouses` | Get all warehouse locations |
| | `POST` | `/api/warehouses` | Create warehouse location |
| **Suppliers** | `GET` | `/api/suppliers` | List all suppliers |
| | `POST` | `/api/suppliers` | Add new supplier |
| **Stock In** | `GET` | `/api/stock-in` | View incoming stock movement history |
| | `POST` | `/api/stock-in` | Record new stock arrival |
| **Stock Out**| `GET` | `/api/stock-out` | View outgoing stock logs |
| | `POST` | `/api/stock-out` | Record stock dispatch |
| **Purchases** | `GET` | `/api/purchases` | Get all purchase orders |
| | `POST` | `/api/purchases` | Create purchase order |
| **Dashboard** | `GET` | `/api/dashboard` | Get real-time stats & KPI summary |
| **Reports** | `GET` | `/api/reports/stock` | Generate stock report data |
| **AI Assistant**|`POST` | `/api/ai/chat` | Query the Groq AI chatbot |

---

## 🛠️ Troubleshooting & FAQ

<details>
<summary><b>1. MongoDB Connection Error (MongooseServerSelectionError)</b></summary>

- Verify that your MongoDB daemon is running locally (`mongod`), or that your MongoDB Atlas URI in `server/.env` is correct.
- Ensure your IP address is whitelisted in MongoDB Atlas Network Access rules (`0.0.0.0/0` for development).
</details>

<details>
<summary><b>2. AI Assistant is not returning responses</b></summary>

- Check if `GROQ_API_KEY` is set in `server/.env`.
- Ensure your Groq API key is active. You can generate a free API key at [https://console.groq.com](https://console.groq.com).
</details>

<details>
<summary><b>3. Port 5000 or 5173 is already in use</b></summary>

- You can change `PORT=5000` in `server/.env` to another port (e.g. `PORT=5001`).
- Vite will automatically attempt the next available port if `5173` is occupied.
</details>

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 👨‍💻 Author

**Umer Nisar**  
GitHub: [@UmerDevHub](https://github.com/UmerDevHub)
