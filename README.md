# 📈 PrimeTrade Portfolio Management System

A premium, full-stack portfolio management application designed for scalability, security, and world-class user experience. Built with the **MERN Stack** (MongoDB, Express, React, Node.js).

---

## 👨‍💻 Developed By
**Aman Varma**  
*Backend Developer Intern Candidate*  
[LinkedIn](https://linkedin.com/in/aman-v-697771345) | [GitHub](https://github.com/Amanvarma2231) | 📞 **+91 6306572504**

---

## 🌟 Key Features

### 🛡️ Secure Authentication
- **JWT-based Auth**: Advanced session management using JsonWebTokens.
- **Bcrypt Encryption**: Industrial-grade password hashing.
- **Protected Routes**: Secure access to dashboard and user data.

### 📊 Portfolio Management
- **Live Stats**: Real-time investment and asset tracking cards.
- **Full CRUD**: Add, Edit, and Delete assets with a smooth Glassmorphic UI.
- **Real DB Storage**: Fully integrated with **MongoDB Atlas** for permanent data persistence.

### ⚙️ Account Customization (New!)
- **Update Profile**: Users can update their username and email directly from the settings.
- **Security Control**: Change passwords securely with current password verification.
- **Demo Login**: One-click login for recruiters and reviewers.

---

## 🛠️ Technology Stack

| Logic | Technology | Icon |
| :--- | :--- | :---: |
| **Frontend** | React.js (Vite) | ⚛️ |
| **Backend** | Node.js / Express | 🟢 |
| **Database** | MongoDB Atlas (Cloud) | 🍃 |
| **Styling** | Vanilla CSS (Glassmorphism) | 🎨 |
| **Icons** | Lucide-React | ✨ |

---

## 🚀 Getting Started

### 1. Installation
First, install the dependencies for the root, backend, and frontend:
```bash
# Install root dependencies (concurrently)
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Environment Setup
Create a `.env` file in the `backend/` folder:
```env
PORT=5000
MONGODB_URI=your_atlas_connection_string
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=30d
NODE_ENV=development
```

### 3. Run Commands

#### 🔥 Recommended: Run Everything (Backend + Frontend)
From the root directory:
```bash
npm run dev
```

#### 🛡️ Run Backend Only
```bash
npm run backend
```

#### ⚛️ Run Frontend Only
```bash
npm run frontend
```

---

## 📄 API Reference (v1)

| Type | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/auth/register` | Create a new account | ❌ |
| `POST` | `/api/v1/auth/login` | Sign in to account | ❌ |
| `GET` | `/api/v1/auth/me` | Fetch profile details | ✅ |
| `PUT` | `/api/v1/auth/updatedetails` | Update Username/Email | ✅ |
| `PUT` | `/api/v1/auth/updatepassword` | Update Password | ✅ |
| `GET` | `/api/v1/portfolio` | Get all assets | ✅ |
| `POST` | `/api/v1/portfolio` | Add new asset | ✅ |

---

## 🛡️ Security Implementation
- **Helmet.js**: Protects against common web vulnerabilities by setting various HTTP headers.
- **CORS Config**: Restricted origin access for production readiness.
- **Data Validation**: Strict Mongoose schemas for data integrity.

---

## 📜 Future Scalability
- **Redis Caching**: To handle 10k+ concurrent portfolio requests.
- **Microservices**: Decoupling Auth and Portfolio services.
- **Docker**: Containerization for seamless cloud deployment on AWS/Azure.

---
*Created with ❤️ for the Primetrade.ai Backend Developer Internship Challenge.*
# PrimeTrade
# PrimeTrade
# PrimeTrade
