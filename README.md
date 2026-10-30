# TaskFlow - Personal Task Management System

TaskFlow is a personal task management web application developed as a full-stack internship project. It helps users organize daily responsibilities by creating, viewing, editing, completing, and deleting tasks.

## Features

- Create tasks with a title, description, and optional due date.
- View saved tasks.
- Edit existing tasks.
- Mark tasks as pending or completed.
- Delete tasks with confirmation.
- Store tasks persistently using SQLite.
- Validate user input on the backend.
- Display task statistics and filtering options.
- Responsive user interface.

## Technologies Used

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- SQLite
- better-sqlite3

## Project Structure

```text
taskflow/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server.js
├── package.json
├── package-lock.json
├── README.md
└── .gitignore
```

## Installation and Setup

### Requirements
- Node.js
- npm

### 1. Clone the repository
Run: `git clone https://github.com/haseeb-sec/taskflow.git`

Then: `cd taskflow`

### 2. Install dependencies
Run: `npm install`

### 3. Start the application
Run: `npm start`

### 4. Open the application
Visit: http://localhost:3000

The SQLite database file (`taskflow.db`) is created automatically when the server starts. The tasks table is also created if it does not already exist.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks` | Retrieve all tasks |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Update an existing task |
| DELETE | `/tasks/:id` | Delete a task |

## Validation and Error Handling

The backend validates:
- Task titles are required and limited to 120 characters.
- Descriptions are limited to 1000 characters.
- Due dates must use a valid YYYY-MM-DD format.
- Task status must be pending or completed.
- Task IDs must be valid, and the requested task must exist.

The API uses HTTP status codes including 200, 201, 400, 404, and 500.

## Database

TaskFlow uses SQLite to store task information. Each task contains:
- ID
- Title
- Description
- Due date
- Status
- Creation timestamp

Tasks remain stored when the application is refreshed or restarted.

## Known Limitations

- The application does not include user authentication.
- The server currently uses a fixed local port (3000).
- The project does not currently include an automated test suite.

## Project Purpose

This project was developed as part of the Stack & Scale Remote Internship 2026 to practice frontend and backend integration, REST API development, database operations, validation, debugging, and Git-based project delivery.

## Author

Haseeb Ullah Shah

GitHub: https://github.com/haseeb-sec
