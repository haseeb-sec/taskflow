
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

  if (task.status === "completed") {
    row.classList.add("completed");
  }

  const marker = document.createElement("span");
  marker.className = "task-marker";
  marker.setAttribute("aria-hidden", "true");
  marker.textContent = task.status === "completed" ? "✓" : "";

  const content = document.createElement("div");
  content.className = "task-content";

  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;

  content.appendChild(title);

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
    dueDate.className = "task-due-date";
    dueDate.textContent = formatDueDate(task.dueDate);
    metadata.appendChild(dueDate);
  }

  if (task.status === "completed") {
    const status = document.createElement("span");
    status.textContent = "Completed";
    metadata.appendChild(status);
  } else {
    const status = document.createElement("span");
    status.textContent = "To do";
    metadata.appendChild(status);
  }

  content.appendChild(metadata);
  row.append(marker, content);

  return row;
}

function renderTasks() {
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
  formSection.hidden = false;
  showFormButton.hidden = true;
  showMessage("");
  document.getElementById("task-title").focus();
}

function closeForm() {
  formSection.hidden = true;
  showFormButton.hidden = false;
  taskForm.reset();
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

  const newTask = {
    title,
    description,
    dueDate: dueDate || null
  };

  submitButton.disabled = true;
  submitButton.textContent = "Saving...";

  try {
    const response = await fetch("/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newTask)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Could not save the task.");
    }

    tasks.unshift(result);
    activeFilter = "all";

    document.querySelectorAll(".nav-item").forEach(button => {
      const selected = button.dataset.filter === "all";
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });

    renderTasks();
    closeForm();
    showMessage("Task created successfully.", "success");
  } catch (error) {
    showMessage(error.message || "Could not save the task. Please try again.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Create task";
  }
});

// Load tasks saved in the database when the page opens.
loadTasks();

