# Acadify - LMS Platform

A full-stack learning management system with course management, lecture delivery, enrollment tracking, and learner reviews.

## Project Structure

```
├── client/          # React frontend (Vite)
├── server/          # Express backend (Node.js)
└── package.json     # Root scripts for development
```

## Getting Started

### Prerequisites
- Bun 1.0+ (https://bun.sh)

### Installation

Install dependencies for all packages:

```bash
bun run install:all
```

Or install individually:

```bash
bun install                 # Root (concurrently)
bun --cwd client install   # React frontend
bun --cwd server install   # Node backend
```

### Development

Start both server and client concurrently with color-coded output:

```bash
bun run dev
```

This runs:
- **Server** (blue prefix) on `http://localhost:5000`
- **Client** (cyan prefix) on `http://localhost:5173`

### Individual Commands

**Start only the server:**
```bash
bun run dev:server
```

**Start only the client:**
```bash
bun run dev:client
```

### Building

Build both client and server:

```bash
bun run build
```

Build individually:
```bash
bun run build:client    # Build React app
bun run build:server    # Build Node backend (if applicable)
```

## Environment Variables

Create a `.env` file in the `server/` directory:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

Create a `.env` file in the `client/` directory:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Features

- **Course Management** - Create, edit, and organize courses with sections and lectures
- **Video Delivery** - Support for YouTube and MP4 video formats
- **Student Enrollment** - Manage course enrollments and access control
- **Progress Tracking** - Track student progress through lectures
- **Reviews & Ratings** - Learners can review courses with ratings and feedback
- **Instructor Dashboard** - Tools for instructors to manage their courses
- **Authentication** - Secure login and registration system

## Tech Stack

**Frontend:**
- React 19
- React Router 7
- Tailwind CSS 4
- Axios
- Vite

**Backend:**
- Express 5
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs for password hashing

## License

ISC
