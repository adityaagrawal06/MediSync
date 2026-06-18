# MediSync 🩺

MediSync is a full-stack medical records management platform built to securely connect patients and doctors. Patients can upload their medical history, manage visits, and generate secure, temporary QR codes to share their specific medical records with doctors.

## 🚀 Tech Stack

### Frontend
- **React.js** (via Vite) for a blazing-fast user interface.
- **Tailwind CSS** for modern, responsive, and aesthetic styling.
- **Axios** for reliable API communication.
- **React Router** for seamless client-side navigation.

### Backend
- **Node.js & Express.js** for handling high-performance RESTful API requests.
- **MySQL (mysql2)** for robust relational data storage.
- **JSON Web Tokens (JWT)** & **Bcrypt.js** for secure authentication and password hashing.
- **Multer** for handling medical file uploads.

---

## 🛠️ Installation & Setup

### 1. Database Setup
1. Ensure you have MySQL running on your machine (e.g., via XAMPP, MySQL Workbench, or Docker).
2. Open your MySQL client and execute the script located at `backend/src/config/schema.sql`.
   - *This will automatically create a database called `hack_horizon` and build all required tables (users, doctors, visits, prescriptions, etc.).*

### 2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Open the `backend/.env` file and verify your database credentials (`DB_USER`, `DB_PASSWORD`, etc.).
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *(The server will start on `http://localhost:8000`)*

### 3. Frontend Setup
1. Open a **new** terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *(The frontend will start on `http://localhost:5173`)*

---

## ✨ Key Features

- **Role-Based Access Control**: Separate, secure dashboards for Patients and Doctors.
- **Medical File Uploads**: Patients can securely upload prescriptions and lab reports.
- **QR Code Sharing**: Patients can generate encrypted, time-sensitive QR tokens to grant doctors temporary access to specific medical records.
- **Visit Tracking**: Both doctors and patients can maintain a timeline of medical visits and diagnoses.

---
*Created as part of the MediSync initiative.*
