# reSell Mania : A Managed Marketplace

A premium, fullstack marketplace solution for managed asset exchange. Designed with a monolithic architecture for easy deployment and high performance.

## 🚀 Overview
**reSell Mania** is a sleek, modern platform that allows users to list, manage, and exchange assets through a managed ledger system. It features a robust admin portal, secure authentication, and real-time transaction tracking.

### Key Features
- **User Authentication**: Secure JWT-based login and registration.
- **Product Management**: Categorized asset listings with image uploads (via Cloudinary).
- **Managed Ledger**: Detailed transaction history and order tracking.
- **Admin Portal**: Dedicated interface for managing categories, orders, and users.
- **Responsive Design**: Built with React and Tailwind CSS 4 for a premium look on any device.

---

## 🛠️ Tech Stack

### Frontend
- **React 19**: Modern UI component architecture.
- **Vite 6**: Ultra-fast build tool and dev server.
- **Tailwind CSS 4**: Next-gen styling with rich aesthetics.
- **Framer Motion**: Smooth micro-animations and transitions.
- **Lucide React**: Premium icon set.

### Backend
- **Node.js / Express 5**: High-performance API layer.
- **MongoDB / Mongoose**: Scalable NoSQL database.
- **Cloudinary**: Cloud-based media storage for asset images.
- **JWT**: Stateless token-based authentication.

---

## 📂 Project Structure

```text
reSell_Mania/
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # Reusable UI parts
│   │   ├── context/     # Auth & Language states
│   │   ├── pages/       # Route-level components
│   │   └── utils/       # API configuration (axios)
│   └── dist/            # Production build folder
├── server/              # Express backend
│   ├── controllers/     # Business logic
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   └── index.js         # Main server entry & static serving
├── package.json         # Root manager (Monolithic scripts)
└── README.md            # You are here!
```

---

## 💻 Developer Guide: How to Modify

### 1. The Monolithic Bridge
The server (`server/index.js`) is configured to serve the frontend in production mode.
- To modify the frontend, edit files in `client/src`.
- To modify the backend, edit files in `server/`.

### 2. API Configuration
The API URL is managed in `client/src/utils/api.js`. It automatically detects if it's running in development (`localhost:5001`) or production (relative path `/api`).

### 3. Adding New Features
- **New Routes**: Add a file in `server/routes/` and register it in `server/index.js`.
- **New Models**: Define the schema in `server/models/`.
- **New Pages**: Create a component in `client/src/pages/` and add the route in `App.jsx`.

---

## ⚙️ Setup & Deployment

### Local Development
1. Install all dependencies:
   ```bash
   npm run install:all
   ```
2. Start both frontend and backend:
   ```bash
   npm run dev
   ```

### Production Build
1. Build the production assets:
   ```bash
   npm run build
   ```
2. Start the monolithic server:
   ```bash
   npm start
   ```

### Live Deployment (Render Example)
- **Build Command**: `npm run install:all && npm run build`
- **Start Command**: `npm start`
- **Env Vars Required**: `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

---

## 📄 License
This project is for demonstration and marketplace management purposes.
