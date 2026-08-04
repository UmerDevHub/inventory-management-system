# Smart Inventory Management - Backend Server

This directory contains the Node.js + Express.js backend server for the **Smart Inventory Management System**.

## 🚀 Development Quick Start

To run the backend server:

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables example and configure .env
cp .env.example .env

# 3. Seed admin user & database sample data
npm run seed:admin
npm run seed

# 4. Start backend server with nodemon
npm run dev
```

The server will be running at `http://localhost:5000`.

## 📦 Features & Technologies

- **Framework**: Express.js 5 + Node.js
- **Database**: MongoDB & Mongoose ORM
- **Authentication**: JWT & Bcrypt
- **FileUploads**: Multer
- **AI Integration**: Groq Cloud SDK (`llama-3.3-70b-versatile`)

For complete API specifications and fullstack instructions, refer to the [Root README.md](../README.md).
