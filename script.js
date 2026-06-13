let tasks = [];
let subtasks = [];
let editingIndex = null;
let selectedTaskIndex = null;
let uploadedImage = null;

// Add Subtask
function addSubtask() {
  const input = document.getElementById("subtaskInput");
  if (input.value.trim()) {
    subtasks.push({ text: input.value, completed: false });
    input.value = "";
    renderSubtasks();
  }
}

function renderSubtasks() {
  const list = document.getElementById("subtaskList");
  list.innerHTML = "";

  subtasks.forEach((s, i) => {
    const li = document.createElement("li");
    li.textContent = s.text;
    list.appendChild(li);
  });
}

// Save Task
function saveTask() {
  const title = document.getElementById("taskTitle").value;

  const task = {
    title,
    dueDate: document.getElementById("dueDate").value,
    dueTime: document.getElementById("dueTime").value,
    subtasks: [...subtasks],
    image: uploadedImage,
    completed: false
  };

  if (editingIndex !== null) {
    tasks[editingIndex] = task;
    editingIndex = null;
  } else {
    tasks.push(task);
  }

  renderTasks();
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Render Sidebar Tasks
function renderTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach((t, i) => {
    const li = document.createElement("li");
    li.textContent = t.title;
    li.onclick = () => showTask(i);
    list.appendChild(li);
  });
}

// Show Task
function showTask(index) {
  selectedTaskIndex = index;
  const task = tasks[index];

  document.getElementById("taskDetail").classList.remove("hidden");
  document.getElementById("detailTitle").textContent = task.title;
  document.getElementById("detailDue").textContent =
    task.dueDate + " " + task.dueTime;
}

// Delete Task
function deleteTask() {
  tasks.splice(selectedTaskIndex, 1);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
  document.getElementById("taskDetail").classList.add("hidden");
}

// Photo Upload
function uploadPhoto(e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = () => {
    uploadedImage = reader.result;
  };

  reader.readAsDataURL(file);
}

// Filters (basic)
function filterTasks(type) {
  renderTasks();
}

// Clock
function updateClock() {
  document.getElementById("currentDateTime").textContent =
    new Date().toLocaleString();
}

setInterval(updateClock, 1000);

// Load saved tasks
window.onload = () => {
  const data = localStorage.getItem("tasks");
  if (data) tasks = JSON.parse(data);
  renderTasks();
};
