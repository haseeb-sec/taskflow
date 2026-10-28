
const taskList = document.getElementById("task-list");
const taskForm = document.getElementById("task-form");
const formSection = document.getElementById("task-form-section");
const showFormButton = document.getElementById("show-form-button");
const cancelFormButton = document.getElementById("cancel-form-button");
const discardButton = document.getElementById("discard-button");
const appMessage = document.getElementById("app-message");
const taskCount = document.getElementById("task-count");
const listHeading = document.getElementById("list-heading");
const todayLabel = document.getElementById("today-label");

let tasks = [];
let activeFilter = "all";
let editingTaskId = null;

const filterNames = {
  all: "All tasks",
  pending: "To do",
  completed: "Completed"
};

// Display today's date using the visitor's local date.
todayLabel.textContent = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "numeric"
}).format(new Date());

function showMessage(message, type = "") {
  appMessage.textContent = message;
  appMessage.className = type ? `message ${type}` : "message";
}

function formatDueDate(dateString) {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return `Due ${new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date)}`;
}

function createTaskRow(task) {
  const row = document.createElement("article");
  row.className = "task-row";
  row.classList.add(task.status === "completed" ? "completed" : "pending");

  const marker = document.createElement("span");
  marker.className = "task-marker";
  marker.setAttribute("aria-hidden", "true");
  marker.textContent = task.status === "completed" ? "✓" : "";

  const content = document.createElement("div");
  content.className = "task-content";

  const headingRow = document.createElement("div");
  headingRow.className = "task-heading-row";

  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;

  const status = document.createElement("span");
  status.className = `task-status status-${task.status === "completed" ? "completed" : "pending"}`;
  status.textContent = task.status === "completed" ? "Completed" : "To do";

  headingRow.append(title, status);
  content.appendChild(headingRow);

  if (task.description) {
    const description = document.createElement("p");
    description.className = "task-description";
    description.textContent = task.description;
    content.appendChild(description);
  }

  const metadata = document.createElement("div");
  metadata.className = "task-meta";

  if (task.dueDate) {
    const dueDate = document.createElement("span");
    const now = new Date();
    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0")
    ].join("-");

    const isOverdue = task.status !== "completed" && task.dueDate < today;
    dueDate.className = `task-due-date${isOverdue ? " overdue" : ""}`;
    dueDate.textContent = isOverdue
      ? `Overdue · ${formatDueDate(task.dueDate).replace("Due ", "")}`
      : formatDueDate(task.dueDate);
    metadata.appendChild(dueDate);
  }

  content.appendChild(metadata);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const completeButton = document.createElement("button");
  completeButton.type = "button";
  completeButton.className = "task-action-button";
  completeButton.textContent =
    task.status === "completed" ? "Mark pending" : "Complete";
  completeButton.addEventListener("click", () => updateTask(task.id, {
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    status: task.status === "completed" ? "pending" : "completed"
  }));

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "task-action-button";
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => editTask(task));

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "task-action-button delete";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => deleteTask(task.id));

  actions.append(completeButton, editButton, deleteButton);
  content.appendChild(actions);
  row.append(marker, content);

  return row;
}

async function updateTask(id, updatedTask) {
  showMessage("");

  try {
    const response = await fetch(`/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask)
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Could not update the task.");
    }

    tasks = tasks.map(task => task.id === id ? result : task);
    renderTasks();
    showMessage("Task updated successfully.", "success");
  } catch (error) {
    showMessage(error.message || "Could not update the task.", "error");
  }
}

function editTask(task) {
  editingTaskId = task.id;
  document.getElementById("task-title").value = task.title;
  document.getElementById("task-description").value = task.description || "";
  document.getElementById("task-due-date").value = task.dueDate || "";

  const heading = formSection.querySelector("h2, h3");
  if (heading) heading.textContent = "Edit task";

  taskForm.querySelector('button[type="submit"]').textContent = "Save changes";
  formSection.hidden = false;
  showFormButton.hidden = true;
  showMessage("");
  document.getElementById("task-title").focus();
}

async function deleteTask(id) {
  if (!window.confirm("Are you sure you want to delete this task?")) return;

  showMessage("");

  try {
    const response = await fetch(`/tasks/${id}`, { method: "DELETE" });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Could not delete the task.");
    }

    tasks = tasks.filter(task => task.id !== id);
    renderTasks();
    showMessage("Task deleted successfully.", "success");
  } catch (error) {
    showMessage(error.message || "Could not delete the task.", "error");
  }
}

function updateDashboardStats() {
  const today = new Date();
  const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");

  const completed = tasks.filter(task => task.status === "completed").length;
  const pending = tasks.filter(task => task.status !== "completed").length;
  const overdue = tasks.filter(task =>
    task.status !== "completed" &&
    task.dueDate &&
    task.dueDate < localToday
  ).length;

  document.getElementById("stat-total").textContent = tasks.length;
  document.getElementById("stat-pending").textContent = pending;
  document.getElementById("stat-completed").textContent = completed;
  document.getElementById("stat-overdue").textContent = overdue;
}

function renderTasks() {
  updateDashboardStats();
  taskList.replaceChildren();

  const visibleTasks = tasks.filter(task => {
    if (activeFilter === "all") return true;
    return task.status === activeFilter;
  });

  listHeading.textContent = filterNames[activeFilter];
  taskCount.textContent =
    `${visibleTasks.length} ${visibleTasks.length === 1 ? "task" : "tasks"}`;

  if (visibleTasks.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "list-state";

    if (activeFilter === "completed") {
      emptyState.textContent = "No completed tasks to show yet.";
    } else if (activeFilter === "pending") {
      emptyState.textContent = "You're all caught up. No pending tasks.";
    } else {
      emptyState.textContent = "No tasks yet. Create your first task to get started.";
    }

    taskList.appendChild(emptyState);
    return;
  }

  visibleTasks.forEach(task => {
    taskList.appendChild(createTaskRow(task));
  });
}

async function loadTasks() {
  taskList.innerHTML = '<div class="list-state">Loading your tasks...</div>';
  taskCount.textContent = "Loading...";

  try {
    const response = await fetch("/tasks");

    if (!response.ok) {
      throw new Error("The server could not load your tasks.");
    }

    tasks = await response.json();
    renderTasks();
  } catch (error) {
    taskCount.textContent = "";
    taskList.innerHTML =
      '<div class="list-state">Could not load tasks. Check that the server is running and try again.</div>';
    showMessage(error.message, "error");
  }
}

function openForm() {
  editingTaskId = null;
  taskForm.reset();

  const heading = formSection.querySelector("h2, h3");
  if (heading) heading.textContent = "New task";

  taskForm.querySelector('button[type="submit"]').textContent = "Create task";
  formSection.hidden = false;
  showFormButton.hidden = true;
  showMessage("");
  document.getElementById("task-title").focus();
}

function closeForm() {
  formSection.hidden = true;
  showFormButton.hidden = false;
  taskForm.reset();
  editingTaskId = null;

  const heading = formSection.querySelector("h2, h3");
  if (heading) heading.textContent = "New task";

  taskForm.querySelector('button[type="submit"]').textContent = "Create task";
}

showFormButton.addEventListener("click", openForm);

cancelFormButton.addEventListener("click", closeForm);
discardButton.addEventListener("click", closeForm);

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    document.querySelectorAll(".nav-item").forEach(item => {
      const selected = item === button;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });

    renderTasks();
    showMessage("");
  });
});

taskForm.addEventListener("submit", async event => {
  event.preventDefault();
  showMessage("");

  const submitButton = taskForm.querySelector('button[type="submit"]');
  const title = document.getElementById("task-title").value.trim();
  const description = document.getElementById("task-description").value.trim();
  const dueDate = document.getElementById("task-due-date").value;

  if (!title) {
    showMessage("Please enter a task title.", "error");
    document.getElementById("task-title").focus();
    return;
  }

  const taskData = { title, description, dueDate: dueDate || null };
  const wasEditing = editingTaskId !== null;
  const url = wasEditing ? `/tasks/${editingTaskId}` : "/tasks";

  submitButton.disabled = true;
  submitButton.textContent = wasEditing ? "Saving..." : "Creating...";

  try {
    const response = await fetch(url, {
      method: wasEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(wasEditing
        ? { ...taskData, status: tasks.find(task => task.id === editingTaskId)?.status || "pending" }
        : taskData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Could not save the task.");
    }

    if (wasEditing) {
      tasks = tasks.map(task => task.id === editingTaskId ? result : task);
      showMessage("Task updated successfully.", "success");
    } else {
      tasks.unshift(result);
      showMessage("Task created successfully.", "success");
    }

    activeFilter = "all";
    document.querySelectorAll(".nav-item").forEach(button => {
      const selected = button.dataset.filter === "all";
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });

    renderTasks();
    closeForm();
    showMessage(wasEditing ? "Task updated successfully." : "Task created successfully.", "success");
  } catch (error) {
    showMessage(error.message || "Could not save the task. Please try again.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = editingTaskId !== null ? "Save changes" : "Create task";
  }
});

// Load tasks saved in the database when the page opens.
loadTasks();

