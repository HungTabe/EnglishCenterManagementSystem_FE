# English Center Management System - Frontend

## Overview

This repository contains the frontend implementation of the **English Center Management System**, a web application built with **ReactJS** to streamline operations for an English language center. The system enables seamless interaction among administrators, instructors, and students, managing course categories, classes, schedules, tuition fees, instructor salaries, and content publication. The frontend is designed to provide an intuitive user interface, robust authentication, and role-based access control to ensure secure and efficient operations.

## Project Objectives

The primary purpose of this system is to enhance the efficiency of educational services by providing:
- A platform for administrators to manage courses, classes, instructors, students, and financial aspects (tuition fees and salaries).
- Tools for instructors to track attendance, view schedules, and communicate with students.
- Features for students to register for courses, view schedules, check attendance, and manage their profiles.
- A content management system for publishing news and announcements.
- Comprehensive reporting and statistical analysis for operational insights.

## Features

### For Students
- **F01: Course Registration** - Register for courses by completing payment.
- **F02: View Schedule Information** - View detailed schedules for registered courses.
- **F03: View Attendance Report** - Access personal attendance records.
- **F04: Notification Center** - Receive updates on class schedules, fee changes, and announcements.
- **F05: Student Profile Management** - View and update personal information and profile picture.

### For Teachers
- **F06: View Schedule Information** - Access detailed schedules, including class and student lists.
- **F07: Attendance Tracking** - Mark student attendance for each class session.
- **F08: Communication & Notification** - Send notifications about schedule changes, cancellations, or reminders.
- **F09: Teacher Profile Management** - View and update personal information and profile picture.

### For Administrators
- **F10: User Management** - Create and manage student and teacher accounts, assign teachers to classes, and transfer students.
- **F11: Class Management** - Create, update, and manage class schedules, instructors, locations, and fees.
- **F12: Course Category Management** - Add, update, or delete course categories (e.g., General English, IELTS Preparation).
- **F13: Course Management** - Create, update, or delete courses within categories.
- **F14: Salary Calculation** - Calculate instructor salaries based on teaching sessions and other factors.
- **F15: Content Management** - Publish, edit, delete, or archive news and announcements.
- **F16: Report & Statistics** - Generate reports on users, classes, courses, tuition, and salaries.
- **F17: Authentication & Access Control** - Role-based access ensuring secure feature interaction.
- **F18: Devices Management** - Manage devices used within the system.

## Technologies Used

- **ReactJS**: Core framework for building the user interface.
- **React Router**: For client-side routing.
- **Axios**: For making API requests to the backend.
- **Tailwind CSS**: For styling the application.
- **Redux** (or Context API): For state management.
- **JWT**: For authentication and authorization.
- **Vite** (or Create React App): Build tool for development and production.

## Prerequisites

- **Node.js** (v14.0.0 or higher) and **npm** (or **yarn**).
- A code editor like **Visual Studio Code**.
- Access to the backend API (ensure the backend server is running).

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/english-center-frontend.git
   cd english-center-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   - Create a `.env` file in the root directory.
   - Add necessary variables (e.g., API base URL):
     ```
     VITE_API_URL=http://localhost:5000/api
     ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   - The app will be available at `http://localhost:5173` (or another port if configured).

5. **Build for production**:
   ```bash
   npm run build
   ```
   - The output will be in the `dist/` folder, ready for deployment.

## Project Structure

```
english-center-frontend/
├── public/                 # Static assets (favicon, images, etc.)
├── src/                    # Source code
│   ├── assets/             # Images, fonts, and other assets
│   ├── components/         # Reusable React components
│   ├── pages/              # Page components (e.g., Home, Login, Dashboard)
│   ├── services/           # API service functions
│   ├── store/              # Redux or Context API setup
│   ├── styles/             # Tailwind CSS or custom styles
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── routes.jsx          # Route definitions
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore file
├── package.json            # Project dependencies