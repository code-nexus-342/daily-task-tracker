# Daily Task Submission System

A full-stack application for managing daily task submissions with role-based access control and Google authentication.

## Features

- Google OAuth2 authentication
- Role-based access control (core, funder, guest)
- Task submission with file uploads
- Progress tracking dashboard
- Email reminders for missed submissions
- Responsive UI with Tailwind CSS and Framer Motion

## Tech Stack

### Backend
- Node.js with Express
- PostgreSQL with Sequelize ORM
- Google OAuth2 for authentication
- JWT for session management
- Winston for logging
- Nodemailer for email notifications

### Frontend
- React with Vite
- Tailwind CSS for styling
- Framer Motion for animations
- React Router for navigation
- Axios for API calls

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the example environment file and configure it:
   ```bash
   cp .env.example .env
   ```
   
   Then edit the `.env` file with your actual values:
   ```
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=http://localhost:5173

   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/daily_task_db
   DB_NAME=daily_task_db
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_HOST=localhost

   # Cloudinary (for file uploads)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. Run database migrations:
   ```bash
   npm run migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   VITE_API_URL=http://localhost:5000
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

### Users
- `POST /api/users/complete-profile` - Complete user profile
- `GET /api/users/me` - Get user profile
- `GET /api/users/auth/status` - Check authentication status

### Tasks
- `POST /api/tasks/submit` - Submit a new task
- `GET /api/tasks/all` - Get all task submissions

## License

MIT 