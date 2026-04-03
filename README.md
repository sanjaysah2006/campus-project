# 🎓 Campus Sync

A full-stack campus management platform built with **Django REST Framework (Backend)** and **React + TypeScript (Frontend)**.  
It allows students and organizers to manage clubs, events, and communicate via real-time-style messaging.

---

## 🚀 Features

### 👥 Authentication & Users
- JWT-based authentication  
- Role-based access (Student / Organizer / Admin)  
- Profile management  
- Change password  

### 🏫 Clubs
- Create and manage clubs  
- Assign organizer to each club  
- Upload club image  
- View club details  

### 📅 Events
- Organizers can create events  
- Upcoming & past event filtering  
- Event listing per club  

### 💬 Messaging System
- One-to-one chat between users  
- Conversation creation  
- Send & receive messages  
- Auto-load chat from URL  
- Modern chat UI  

### 🎨 UI/UX
- Clean dashboard layout  
- Sidebar navigation  
- Responsive design  
- Smooth animations (Framer Motion)  

---

## 🏗️ Tech Stack

### 🔹 Backend
- Python  
- Django  
- Django REST Framework  
- SQLite (default, can switch to PostgreSQL)  
- JWT Authentication  

### 🔹 Frontend
- React (Vite)  
- TypeScript  
- Tailwind CSS  
- React Query  
- Axios  
- Framer Motion  
- ShadCN UI  

---

## 📁 Project Structure

project/

│

├── backend/

│   ├── users/

│   ├── clubs/

│   ├── events/

│   ├── chat/

│   └── manage.py

│

├── campus-connect/   (frontend)

│   ├── src/

│   │   ├── pages/

│   │   ├── components/

│   │   ├── lib/

│   │   ├── contexts/

│

├── venv/

├── requirements.txt

└── README.md



---

## ⚙️ Backend Setup (Django)

```bash
# 1️⃣ Create Virtual Environment
python -m venv venv
venv\Scripts\activate   # Windows

# 2️⃣ Install Dependencies
pip install -r requirements.txt

# 3️⃣ Apply Migrations
python manage.py makemigrations
python manage.py migrate

# 4️⃣ Create Superuser
python manage.py createsuperuser

# 5️⃣ Run Server
python manage.py runserver
```


## 🌐 Frontend Setup (React)
### 1️⃣ Install Dependencies
```bash
npm install

# 2️⃣ Run Development Server
npm run dev 
```


## 🔐 API Endpoints
### Auth
- POST /api/login/

- POST /api/register/

### Clubs
- GET /api/clubs/

- GET /api/clubs/:id/

- POST /api/clubs/

### Events
- GET /api/events/

- POST /api/events/

### Chat
- GET /api/chat/conversations/

- GET /api/chat/messages/:id/

- POST /api/chat/send/

- POST /api/chat/create/



## 🔑 Authentication
Uses JWT tokens.
Frontend stores:

- Access token

- Refresh token

- Add token in headers:

```
Authorization: Bearer <access_token>
```


## 💡 Key Concepts
🧠 Conversation Logic
- A conversation is created between 2 users
- If already exists → reuse it
- Messages belong to a conversation

🎯 Organizer Logic
- Only organizers can create events
- Others can message the club


## 🚀 Future Improvements
- 🔥 Real-time chat (WebSockets)

- 🔔 Notifications

- 📷 File/image sharing

- 👥 Group chats

- 🌙 Dark mode
