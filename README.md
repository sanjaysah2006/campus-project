
# 🎓 Campus Sync

A full-stack campus management platform built with **Django REST Framework (Backend)** and **React + TypeScript (Frontend)**.

👉 **Live Demo**

* 🌐 Frontend: [https://campus-project-eight.vercel.app/](https://campus-project-eight.vercel.app/)
* 🔗 Backend API: [https://campus-sync-rjbz.onrender.com/api/](https://campus-sync-rjbz.onrender.com/api/)

---

# 🚀 Features

## 👥 Authentication & Users

* JWT-based authentication
* Role-based access (Student / Organizer / Admin)
* Student profile with ID card upload
* Secure login & token handling

---

## 🏫 Clubs

* Create and manage clubs
* Assign organizers
* Upload club logo/banner (Cloudinary)
* View club details

---

## 📅 Events

* Organizers can create events
* Admin approval system
* Upcoming events carousel
* Event registration system
* Event analytics (views, registrations)

---

## 💬 Messaging System

* One-to-one chat between users
* Conversation-based messaging
* Send & receive messages
* Clean modern chat UI

---

## 🔍 Smart Search & UI

* 🔎 Search dropdown (Top Navbar)
* 🎯 Select suggestion → navigate to event
* 🔄 Auto-sliding event carousel
* Responsive modern UI

---

## 📊 Admin Dashboard

* Manage events & clubs
* Approve/reject events
* View statistics (events, registrations)

---

# 🏗️ Tech Stack

## 🔹 Backend

* Python
* Django
* Django REST Framework
* PostgreSQL (Render DB) ✅
* JWT Authentication
* Cloudinary (media storage)

---

## 🔹 Frontend

* React (Vite)
* TypeScript
* Tailwind CSS
* React Query
* Axios
* Framer Motion
* ShadCN UI

---

## ☁️ Deployment

| Service       | Platform            |
| ------------- | ------------------- |
| Frontend      | Vercel              |
| Backend       | Render              |
| Database      | PostgreSQL (Render) |
| Media Storage | Cloudinary          |

---

# 📁 Project Structure

```
project/

├── backend/
│   ├── users/
│   ├── clubs/
│   ├── events/
│   ├── chat/
│   ├── backend/
│   └── manage.py

├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── contexts/

├── requirements.txt
└── README.md
```

---

# ⚙️ Backend Setup (Django)

```bash
# 1️⃣ Create Virtual Environment
python -m venv venv
venv\Scripts\activate

# 2️⃣ Install Dependencies
pip install -r requirements.txt

# 3️⃣ Setup Environment Variables
# create .env file
SECRET_KEY=your_secret_key
DATABASE_URL=your_postgres_url
CLOUDINARY_URL=your_cloudinary_url

# 4️⃣ Apply Migrations
python manage.py migrate

# 5️⃣ Create Superuser
python manage.py createsuperuser

# 6️⃣ Run Server
python manage.py runserver
```

---

# 🌐 Frontend Setup (React)

```bash
# 1️⃣ Install Dependencies
npm install

# 2️⃣ Create .env file
VITE_API_URL=http://localhost:8000/api/

# 3️⃣ Run Development Server
npm run dev
```

---

# 🔐 API Endpoints

## Auth

* POST `/api/login/`
* POST `/api/register/`

## Clubs

* GET `/api/clubs/`
* POST `/api/clubs/`

## Events

* GET `/api/events/`
* GET `/api/events/:id/`
* POST `/api/events/`
* POST `/api/events/:id/register/`

## Chat

* GET `/api/chat/conversations/`
* GET `/api/chat/messages/:id/`
* POST `/api/chat/send/`

---

# 🔑 Authentication

Uses JWT tokens.

Frontend stores:

* Access token
* Refresh token

Headers:

```bash
Authorization: Bearer <access_token>
```

---

# 💡 Key Concepts

## 🧠 Event System

* Events require admin approval
* Students can register
* Event interactions tracked

## 🎯 Search System

* Live search dropdown
* Keyboard navigation (↑ ↓ Enter)
* Direct navigation to event

## 📦 Media Handling

* Images stored on Cloudinary
* URLs served directly to frontend

---

# 🚀 Future Improvements

* 🔥 Real-time chat (WebSockets)
* 🔔 Notifications system
* 📷 File/image sharing in chat
* 👥 Group chats
* 🌙 Dark mode
* 📊 Advanced analytics dashboard

---

# 👨‍💻 Author

**Sanjay Kumar Sah**
Full Stack Developer 🚀

---

# ⭐ Final Note

This project demonstrates a **complete production-ready architecture**:

```
Frontend → Vercel
Backend → Render
Database → PostgreSQL
Media → Cloudinary
```

---
