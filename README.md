# Maryam Medicare - Full-Stack Doctor Appointment System


*<p align="center">A modern, full-stack application for seamless patient appointment booking and clinic administration.</p>*

---

## ✨ Key Features

Maryam Medicare is a comprehensive platform designed to streamline the appointment process for both patients and clinic staff.

#### 👩‍⚕️ Patient-Facing Application
- **Web-Based Booking:** An intuitive interface for patients to book appointments.
- **Interactive Calendar:** Easily select a date to view available time slots.
- **Real-time Slot Availability:** The system instantly shows which 5-minute slots are open or booked.
- **WhatsApp Booking Bot:** A conversational chatbot allowing users to book appointments entirely within WhatsApp.

#### 🔒 Admin & Super Admin Dashboard
- **Secure Authentication:** Role-based access control (Admin/Super Admin) with JWT-powered authentication.
- **Patient Schedule Management:** A comprehensive dashboard to view all bookings with filters for date and session (Morning, Evening, Night).
- **Data Analytics:** Visual charts displaying daily booking breakdowns per session and 7-day booking trends.
- **Real-time Notifications:** Admins can send SMS reminders to patients directly from the dashboard for their upcoming turns.
- **User Management (Super Admin):** A dedicated interface for the Super Admin to create and remove admin accounts.

---

## 🛠️ Technology Stack

This project is built with a modern, robust, and scalable technology stack.

#### **Backend**
- **Framework:** Python, FastAPI
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Data Validation:** Pydantic
- **Authentication:** JWT (python-jose) & Password Hashing (passlib)
- **State Management (WhatsApp Bot):** Redis
- **APIs:** Meta WhatsApp Business Cloud API, Text.lk SMS Gateway

#### **Frontend**
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **UI:** React
- **Styling:** Tailwind CSS
- **Component Library:** `shadcn/ui`
- **Charts:** Recharts

#### **DevOps & Tooling**
- **Local Development:** `ngrok` for webhook testing
- **Containerization:** Docker for running Redis

---

## 🚀 Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing purposes.

### Prerequisites

- Python 3.9+ and `pip`
- Node.js 18+ and `npm`
- PostgreSQL database
- Redis (can be run via Docker)
- A [Text.lk](https://text.lk/) account for SMS
- A [Meta for Developers](https://developers.facebook.com/) account for the WhatsApp API

### 1. Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/maryam-medicare.git
cd maryam-medicare/backend  # Navigate to your backend folder

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
#    Create a .env file in the backend root and copy the contents of .env.example
cp .env.example .env
#    Now, open the .env file and fill in your actual credentials.

# 5. Create the Super Admin user (run this only once)
python create_superadmin.py

# 6. Run the backend server
uvicorn app.main:app --reload
```

Your FastAPI server will be running at `http://127.0.0.1:8000`.

### 2. Frontend Setup

```bash
# 1. Navigate to the frontend folder in a new terminal
cd ../frontend

# 2. Install dependencies
npm install

# 3. Run the frontend development server
npm run dev
```

Your Next.js frontend will be running at `http://localhost:3000`.

### 3. Environment Variables (`.env.example`)

Your `.env` file in the **backend** directory should look like this. Fill it with your own credentials.

```ini
# PostgreSQL Database
DATABASE_URL="postgresql://user:password@localhost/maryam_medicare_db"

# JWT Authentication
SECRET_KEY="your_very_strong_and_secret_key"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Redis for WhatsApp state management
REDIS_URL="redis://localhost:6379/0"

# Text.lk SMS Gateway
TEXTLK_API_TOKEN="your_textlk_api_token"
TEXTLK_SENDER_ID="YourSenderID"

# Meta WhatsApp Cloud API
META_ACCESS_TOKEN="your_meta_whatsapp_access_token"
META_PHONE_NUMBER_ID="your_meta_phone_number_id"
META_WEBHOOK_VERIFY_TOKEN="your_custom_verify_token_string"
```

### 4. WhatsApp Webhook Testing

To test the WhatsApp bot locally, you need to expose your backend server to the internet.

```bash
# In a separate terminal, run ngrok
ngrok http 8000
```

Copy the `https://...ngrok-free.app` URL and set it as the Webhook URL in your Meta App dashboard, appending `/whatsapp/webhook`.

---

## 📸 Screenshots
<p>User Page</p>
<img width="1919" height="942" alt="user" src="https://github.com/user-attachments/assets/4ee26ff0-788f-4dc1-82c9-bb852e4faa0d" />
<p>Admin Page</p>
<img width="1919" height="959" alt="admin" src="https://github.com/user-attachments/assets/f801ed9c-ba24-4070-91ff-b437fb5358b3" />
<p>Super Admin Page</p>
<img width="1919" height="902" alt="superadmin" src="https://github.com/user-attachments/assets/a6da014c-07c7-4991-92c6-ba858f7f705b" />



---

