# Learnera - School Management System

![Learnera Logo](logo-placeholder-path.png)

## 📚 Overview
Learnera is a comprehensive school management application built with Python Django (backend) and React.js (frontend). The system helps schools efficiently manage students, teachers, parents, attendance, examinations, fee collection, and communication.

## ✨ Features

### User Management
- **Multi-role System**: Supports School Admin, Teachers, Students, and Parents
- **Profile Management**: Complete user profile with personal information and settings

### Academic Management
- **Class & Section Management**: Create and manage classes and sections
- **Student Management**: Enrollment, tracking, and academic records
- **Teacher Assignment**: Assign teachers to classes and subjects

### Attendance System
- **Daily Attendance Tracking**: Mark and monitor student attendance
- **Attendance Reports**: Generate detailed attendance statistics and reports

### Examination Platform
- **Online Exam Creation**: Teachers can create exams with specific date/time settings
- **Secure Exam Environment**: Proctored exams with disabled copy-paste functionality
- **Exam Monitoring**: Integration with video conferencing for screen sharing and proctoring
- **Result Management**: Automated grading and result publication

### Fee Management
- **Fee Structure Setup**: Create various fee categories and structures
- **Online Payment Integration**: Secure payment processing using Stripe
- **Payment Tracking**: Complete history and reports of fee payments

### Communication Tools
- **Real-time Chat**: Built-in messaging system between students, parents, and teachers
- **Leave Management**: Request and approval system for student and teacher leaves
- **Notifications**: Important updates and information sharing

### Administrative Tools
- **Dashboard Analytics**: Overview of school metrics and performance indicators
- **Document Management**: Upload and manage important documents
- **Academic Year Management**: Organize data by academic years

## 🛠️ Technologies Used

### Backend
- **Django**: Web framework
- **Django REST Framework (DRF)**: API development
- **Channels**: WebSocket support for real-time features
- **PostgreSQL**: Database
- **Redis**: Caching and WebSocket backend
- **Docker**: Containerization

### Frontend
- **React.js**: UI library
- **Redux**: State management
- **Tailwind CSS**: Styling
- **ShadCN UI**: Component library
- **Vite**: Build tool

### Deployment
- **Docker**: Containerization
- **AWS EC2**: Hosting
- **Nginx**: Web server
- **SSL/TLS**: Secure connections

## 📋 Prerequisites
Before installation, make sure you have the following installed:

- Docker and Docker Compose
- Git
- Node.js and npm (for local development)
- Python 3.x (for local development)

## 🚀 Installation
Follow these steps to set up Learnera on your local machine:

### Clone the Repository
```bash
git clone https://github.com/amrazz/Learnera-app.git
cd Learnera-app
```

### Set Up Environment Variables

Backend (.env file in backend/learnera_app/)
```env
SECRET_KEY="your_secret_key"
DEBUG=True
DJANGO_LOGLEVEL=info
DATABASE_NAME="learnera"
DATABASE_USER="postgres"
DATABASE_PASSWORD="your_password"
DATABASE_HOST=db
DATABASE_PORT=5432
STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key"
STRIPE_SECRET_KEY="your_stripe_secret_key"
DJANGO_SETTINGS_MODULE=learnera_app.settings
```

Frontend (.env file in frontend/learnera/)
```env
VITE_API_URL=/api/
VITE_STRIPE_PUBLIC_KEY="your_stripe_publishable_key"
```

### Launch with Docker Compose
```bash
docker-compose up -d
```

This will start the following services:
- PostgreSQL database
- Redis for WebSocket and caching
- Django backend server
- React frontend application
- Nginx reverse proxy

### Access the Application
Once the containers are running, you can access the application at:
- http://localhost (or your domain if deployed)

## 🧪 Development Setup
For local development without Docker:

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd learnera_app
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend/learnera
npm install
npm run dev
```

## 📁 Project Structure
```
├── .gitignore
├── backend/
│   ├── learnera_app/
│   │   ├── chat/
│   │   ├── learnera_app/
│   │   ├── parents/
│   │   ├── school_admin/
│   │   ├── students/
│   │   ├── teachers/
│   │   └── users/
│   └── requirements.txt
├── docker-compose.yml
└── frontend/
    └── learnera/
        ├── public/
        ├── src/
        │   ├── component/
        │   ├── assets/
        │   └── redux/
        └── package.json
```

## 🌐 Deployment
The application is configured to be deployed on AWS EC2 using Docker:

1. Set up an EC2 instance with appropriate security groups
2. Clone the repository on the instance
3. Configure environment variables
4. Run with Docker Compose
5. Set up domain and SSL certificates

## 🔒 Security Features
- JWT authentication for API endpoints
- HTTPS connections
- Password hashing and security
- Role-based access control
- CSRF protection

## 👥 User Roles

### School Admin
- Create and manage all users
- Configure system settings
- Manage classes, sections, and academic years
- Generate reports and analytics

### Teachers
- Take attendance
- Create and evaluate exams
- Assign and grade homework
- Communicate with students and parents

### Students
- View class schedule and attendance
- Take online exams
- Submit assignments
- Chat with teachers

### Parents
- View child's academic progress
- Pay fees online
- Communicate with teachers
- Track attendance and reports

## 📞 Contact
For any queries related to this project, you can reach out at:

- Email: learnerapp999@gmail.com
- GitHub: amrazz
