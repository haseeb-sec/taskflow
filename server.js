
const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware to read JSON request bodies.
app.use(express.json());

// Open (or create) the SQLite database file.
const db = new Database("taskflow.db");

// Create the tasks table if it does not exist.
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    due_date TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

// Serve the frontend files from the public folder.
app.use(express.static(path.join(__dirname, "public")));

// GET /tasks: return all saved tasks.
app.get("/tasks", (req, res) => {
  try {
    const tasks = db.prepare(`
      SELECT
        id,
        title,
        description,
        due_date AS dueDate,
        status,
        created_at AS createdAt
      FROM tasks
      ORDER BY id DESC
    `).all();

    res.json(tasks);
  } catch (error) {
    console.error("Could not load tasks:", error.message);
    res.status(500).json({ error: "Could not load tasks." });
  }
});

// POST /tasks: validate and save a new task.
app.post("/tasks", (req, res) => {
  const { title, description = "", dueDate = null } = req.body;

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      error: "Task title is required."
    });
  }

  if (title.trim().length > 120) {
    return res.status(400).json({
      error: "Task title must be 120 characters or fewer."
    });
  }

  if (typeof description !== "string" || description.length > 1000) {
    return res.status(400).json({
      error: "Description must be 1000 characters or fewer."
    });
  }

  if (
    dueDate !== null &&
    (typeof dueDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) ||
      Number.isNaN(Date.parse(`${dueDate}T00:00:00Z`)) ||
      new Date(`${dueDate}T00:00:00Z`).toISOString().slice(0, 10) !== dueDate)
  ) {
    return res.status(400).json({
      error: "Please provide a valid due date."
    });
  }

  try {
    const result = db.prepare(`
      INSERT INTO tasks (title, description, due_date)
      VALUES (?, ?, ?)
    `).run(title.trim(), description.trim(), dueDate);

    const task = db.prepare(`
      SELECT
        id,
        title,
        description,
        due_date AS dueDate,
        status,
        created_at AS createdAt
      FROM tasks
      WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(task);
  } catch (error) {
    console.error("Could not save task:", error.message);
    res.status(500).json({ error: "Could not save the task." });
  }
});

// Start the server.
app.listen(PORT, () => {
  console.log(`TaskFlow is running at http://localhost:${PORT}`);
});

