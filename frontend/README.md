# NeuroLearn+ 🧠

AI-powered adaptive learning platform for specially-abled students.

## Features

### 🔵 Dyslexia Module
- Text-to-Speech with adjustable speed
- Audio lessons
- Interactive reading exercises
- Dyslexic font support
- Word highlighting

### 🟢 ADHD Module
- Focus mode
- Pomodoro timers
- Gamification (points, levels, badges)
- Short micro-lessons
- AI attention tracking

### 👥 Three Dashboards
- **Student**: Track progress, earn points, complete lessons
- **Parent**: Monitor child's activities and scores
- **Teacher**: View class analytics, identify struggling students

## Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT

## Installation

### Prerequisites
- Node.js v20+ 
- MongoDB Atlas account

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development

Start backend:
```bash
node server.js
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Usage

1. Register as Student/Parent/Teacher
2. Login with credentials
3. Students: Access learning modules
4. Parents: Monitor child's progress
5. Teachers: View class analytics

## Project Structure
neurolearn-plus/
├── backend/          # Node.js backend
├── frontend/         # React frontend
└── README.md

## Authors

- Sharwari Kadam

## License

This project is created for educational purposes.