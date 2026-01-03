# Backend for AccessEdu

This backend provides authentication, session tracking, and educational content management for the AccessEdu platform using the MERN stack (MongoDB, Express, React, Node.js).

## Features

- User authentication with JWT tokens
- Session tracking with login/logout timestamps
- Session duration calculation
- User activity tracking (total active minutes)
- Educational content management (subjects, lessons, poems)
- English poetry collection and management
- Role-based access control (student, teacher, admin)

## Models

### User Model
- `name`: String (required, max 100 chars)
- `email`: String (required, unique, valid email format)
- `password`: String (required, min 6 chars, bcrypt hashed)
- `role`: String (enum: 'student', 'teacher', 'admin', default: 'student')
- `lastLoginAt`: Date
- `lastLogoutAt`: Date
- `totalActiveMinutes`: Number (default: 0)

### Session Model
- `userId`: ObjectId (reference to User)
- `loginAt`: Date (required)
- `logoutAt`: Date
- `durationMinutes`: Number

## API Endpoints

### Authentication

#### POST /api/auth/login
Login a user and create a session.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "sessionId": "session_id_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "student"
  }
}
```

#### POST /api/auth/logout
Logout a user and update session duration.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "sessionId": "session_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User logged out successfully",
  "durationMinutes": 15
}
```

### Content Management

#### GET /api/content
Get all educational content (poems, lessons, etc.)

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `type`: Content type filter (e.g., 'poem', 'lesson')
- `subject`: Subject ID filter
- `level`: Difficulty level filter

**Response:**
```json
{
  "success": true,
  "count": 5,
  "total": 25,
  "page": 1,
  "pages": 5,
  "data": []
}
```

#### GET /api/content/:id
Get content by ID

#### GET /api/content/subject/:subjectId
Get content by subject ID

#### POST /api/content
Create new content (Teacher/Admin only)

**Request Body:**
```json
{
  "title": "The Road Not Taken",
  "type": "poem",
  "subject": "subject_id_here",
  "content": "Two roads diverged in a yellow wood...",
  "author": "Robert Frost",
  "level": "Intermediate",
  "difficulty": 7,
  "duration": 5,
  "tags": ["poetry", "choices", "life"]
}
```

### Subject Management

#### GET /api/subjects
Get all subjects

#### GET /api/subjects/:id
Get subject by ID

#### POST /api/subjects
Create new subject (Admin only)

**Request Body:**
```json
{
  "name": "English Poetry",
  "code": "ENG201",
  "description": "Analysis and appreciation of English poetry",
  "category": "Language Arts",
  "level": "High School"
}
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/accessedu
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

## Running the Application

1. Install dependencies:
```bash
npm install
```

2. Start the backend server:
```bash
npm run server:dev
```

Or run both frontend and backend simultaneously:
```bash
npm run dev:full
```

## Database Setup

Make sure MongoDB is running on your system before starting the server. You can install MongoDB locally or use MongoDB Atlas for cloud hosting.