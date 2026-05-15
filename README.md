# VoltNexus

VoltNexus is an advanced online electronic shop repairing platform built on the MERN stack. It connects users, workers, and dealers, streamlining the process of electronic device repair, billing, and customer support.

## 🚀 Key Features

- **Role-Based Dashboards**: Dedicated interfaces for Users, Workers, and Dealers.
- **Authentication & Security**: Secure JWT-based authentication and protected routes.
- **AI Chatbot**: Integrated with Google Generative AI for smart, automated customer support.
- **Payment Integration**: Seamless billing and payments powered by Razorpay.
- **Notifications**: Automated email notifications via Nodemailer and SMS alerts via Twilio.
- **Responsive UI**: Modern, dynamic frontend built with React, Vite, and Tailwind CSS.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT, bcryptjs
- **Third-Party Services**: Razorpay, Twilio, Nodemailer, Google Generative AI

## 📁 Project Structure

```text
VoltNexus/
├── backend/               # Node.js/Express backend server
│   ├── controllers/       # Route controllers
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express routes
│   ├── middleware/        # Custom middlewares
│   ├── utils/             # Helper utilities (Email, SMS)
│   └── index.js           # Server entry point
└── voltnexus-frontend/    # React/Vite frontend application
    ├── src/
    │   ├── components/    # Reusable UI components
    │   ├── pages/         # Dashboard & Auth pages
    │   ├── App.jsx        # Main application component
    │   └── main.jsx       # React DOM entry point
    └── vite.config.js     # Vite configuration
```

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas URL)
- A [Razorpay](https://razorpay.com/) account for payments
- A [Twilio](https://www.twilio.com/) account for SMS
- [Google Gemini API Key](https://aistudio.google.com/) for the Chatbot

## 🛠️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/Harikrrish-2002/Voltnexus.git
cd Voltnexus
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory and configure the necessary environment variables (see [Environment Variables](#environment-variables)).

Start the backend server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 3. Frontend Setup

Open a new terminal window/tab:

```bash
cd voltnexus-frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```

The frontend will usually be accessible at `http://localhost:5173`.

## 🔐 Environment Variables

You need to create a `.env` file in the `backend` directory with the following configuration:

```env
# Server
PORT=5000

# Database
MONGO_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key

# Payment (Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# AI Chatbot (Google Gemini)
GEMINI_API_KEY=your_gemini_api_key

# Email (Nodemailer)
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## 📜 License

This project is licensed under the ISC License.
