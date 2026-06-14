   <!-- ==== Custom JavaScript ==== -->
      // ========= App State Variables =========
      let subtasks = []; // Temporary subtask list
      let tasks = []; // Full list of all tasks
      let editingIndex = null; // Index of task being edited
      let selectedTaskIndex = null; // Currently viewed task index
      let uploadedImage = null; // Image (base64) for task

      // ========= Add Subtask =========
      function addSubtask() {
        const subtaskInput = document.getElementById("subtaskInput");
        const subtaskText = subtaskInput.value.trim();
        if (subtaskText !== "") {
          subtasks.push({ text: subtaskText, completed: false });
          updateSubtaskList();
          subtaskInput.value = "";
        }
      }

      // ========= Render Subtask List =========
      function updateSubtaskList() {
        const subtaskList = document.getElementById("subtaskList");
        subtaskList.innerHTML = "";

        subtasks.forEach((task, i) => {
          const li = document.createElement("li");
          li.className = "flex items-center justify-between";

          // Left side: checkbox + text
          const left = document.createElement("div");
          left.className = "flex items-center";

          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.className = "mr-2";
          checkbox.checked = task.completed;
          checkbox.onchange = () => {
            task.completed = checkbox.checked;
            li.className = checkbox.checked
              ? "line-through flex justify-between items-center"
              : "flex justify-between items-center";
          };

          const span = document.createElement("span");
          span.textContent = task.text;
          if (task.completed) li.classList.add("line-through");

          left.appendChild(checkbox);
          left.appendChild(span);

          // Right side: edit and delete buttons
          const right = document.createElement("div");
          right.className = "space-x-2";

          const editBtn = document.createElement("button");
          editBtn.textContent = "✏️";
          editBtn.className = "text-sm hover:text-yellow-400";
          editBtn.onclick = () => {
            const newText = prompt("Edit subtask:", task.text);
            if (newText !== null && newText.trim() !== "") {
              task.text = newText.trim();
              updateSubtaskList();
            }
          };

          const deleteBtn = document.createElement("button");
          deleteBtn.textContent = "❌";
          deleteBtn.className = "text-sm hover:text-red-400";
          deleteBtn.onclick = () => {
            subtasks.splice(i, 1);
            updateSubtaskList();
          };

          right.appendChild(editBtn);
          right.appendChild(deleteBtn);

          li.appendChild(left);
          li.appendChild(right);
          subtaskList.appendChild(li);
        });
      }

      // ========= Upload Photo and Convert to Base64 =========
      function uploadPhoto(event) {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (e) {
            uploadedImage = e.target.result;
          };
          reader.readAsDataURL(file);
        }
      }

      // ========= Save Task (New or Edited) =========
      function saveTask() {
        const title = document.getElementById("taskTitle").value.trim();
        const dueDate = document.getElementById("dueDate").value;
        const dueTime = document.getElementById("dueTime").value;
        if (!title) return alert("Please enter a task title.");

        const task = {
          title,
          dueDate,
          dueTime,
          subtasks: JSON.parse(JSON.stringify(subtasks)),
          completed: subtasks.length
            ? subtasks.every((s) => s.completed)
            : false,
          image: uploadedImage,
        };

        if (editingIndex !== null) {
          tasks[editingIndex] = task;
          saveTasksToStorage();
          editingIndex = null;
          document.getElementById("taskList").innerHTML = "";
          tasks.forEach(displayTaskInSidebar);
        } else {
          tasks.push(task);
          displayTaskInSidebar(task, tasks.length - 1);
          saveTasksToStorage();
        }

        // Reset input form
        document.getElementById("taskTitle").value = "";
        document.getElementById("dueDate").value = "";
        document.getElementById("dueTime").value = "";
        document.getElementById("subtaskList").innerHTML = "";
        uploadedImage = null;
        subtasks = [];
      }

      // ========= Load Selected Task into Form =========
      function editTask() {
        if (selectedTaskIndex === null) return alert("Select a task to edit.");
        const task = tasks[selectedTaskIndex];
        document.getElementById("taskTitle").value = task.title;
        document.getElementById("dueDate").value = task.dueDate;
        document.getElementById("dueTime").value = task.dueTime;
        uploadedImage = task.image;
        subtasks = JSON.parse(JSON.stringify(task.subtasks));
        updateSubtaskList();
        editingIndex = selectedTaskIndex;
        showAddTaskForm();
      }

      // ========= Delete Task =========
      function deleteTask() {
        if (selectedTaskIndex !== null) {
          tasks.splice(selectedTaskIndex, 1);
          saveTasksToStorage();
          document.getElementById("taskList").innerHTML = "";
          tasks.forEach(displayTaskInSidebar);
          document.getElementById("taskDetail").classList.add("hidden");
          selectedTaskIndex = null;
        }
      }

      // ========= Show Task in Sidebar =========
      function displayTaskInSidebar(task, index) {
        const taskList = document.getElementById("taskList");
        const li = document.createElement("li");
        li.className = "cursor-pointer hover:underline";
        li.textContent = task.title;
        li.onclick = () => showTaskDetail(task, index);
        taskList.appendChild(li);
      }

      // ========= Scroll to Task Form =========
      function showAddTaskForm() {
        document.getElementById("taskDetail").classList.add("hidden");
        document
          .getElementById("addTaskCard")
          .scrollIntoView({ behavior: "smooth" });
      }

      // ========= Show Task Details =========
      function showTaskDetail(task, index) {
        selectedTaskIndex = index;

        const titleElem = document.getElementById("detailTitle");
        titleElem.textContent = task.title;
        titleElem.className = task.completed ? "line-through" : "";

        document.getElementById(
          "detailDue"
        ).textContent = `Due: ${task.dueDate} at ${task.dueTime}`;

        document.getElementById("taskImage").src = task.image || "";
        document.getElementById("taskImage").style.display = task.image
          ? "block"
          : "none";

        // Setup main task checkbox
        const mainCheckbox = document.createElement("input");
        mainCheckbox.type = "checkbox";
        mainCheckbox.className = "mr-2";
        mainCheckbox.checked = task.completed;
        mainCheckbox.onchange = () => {
          task.completed = mainCheckbox.checked;
          titleElem.className = task.completed ? "line-through" : "";
          task.subtasks.forEach((st) => (st.completed = task.completed));
          showTaskDetail(task, index);
          saveTasksToStorage();
        };

        titleElem.innerHTML = ""; // Clear before re-render
        titleElem.appendChild(mainCheckbox);
        titleElem.appendChild(document.createTextNode(task.title));

        // Show subtasks
        const detailSubtasks = document.getElementById("detailSubtasks");
        detailSubtasks.innerHTML = "";
        task.subtasks.forEach((st, i) => {
          const li = document.createElement("li");
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.className = "mr-2";
          checkbox.checked = st.completed;
          checkbox.onchange = () => {
            st.completed = checkbox.checked;
            li.className = st.completed ? "line-through" : "";
            task.completed = task.subtasks.every((s) => s.completed);
            showTaskDetail(task, index);
            saveTasksToStorage();
          };
          li.appendChild(checkbox);
          li.appendChild(document.createTextNode(st.text));
          if (st.completed) li.classList.add("line-through");
          detailSubtasks.appendChild(li);
        });

        document.getElementById("taskDetail").classList.remove("hidden");
        document
          .getElementById("taskDetail")
          .scrollIntoView({ behavior: "smooth" });
      }

      // ========= Filter Tasks Based on Type =========
      function filterTasks(type) {
        const taskList = document.getElementById("taskList");
        taskList.innerHTML = "";
        document.getElementById("taskDetail").classList.add("hidden");
        const now = new Date();

        tasks.forEach((task, index) => {
          const dueDateTime = new Date(`${task.dueDate}T${task.dueTime}`);
          if (
            (type === "completed" && task.completed) ||
            (type === "overdue" && dueDateTime < now && !task.completed) ||
            (type === "upcoming" && dueDateTime >= now && !task.completed) ||
            type === "all"
          ) {
            displayTaskInSidebar(task, index);
          }
        });
      }

      // ========= Live Date and Time Clock =========
      function updateDateTime() {
        const now = new Date();
        const options = { weekday: "short", month: "short", day: "numeric" };
        const formattedDate = now.toLocaleDateString("en-US", options);
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        const formattedTime = `${hours}:${minutes}${ampm}`;
        document.getElementById(
          "currentDateTime"
        ).textContent = `${formattedDate}. ${formattedTime}`;
      }

      // Start clock
      setInterval(updateDateTime, 1000);
      window.onload = function () {
        const storedTasks = localStorage.getItem("tasks");
        if (storedTasks) {
          tasks = JSON.parse(storedTasks);
          tasks.forEach((task, index) => displayTaskInSidebar(task, index));
        }
      };

      updateDateTime();
      function saveTasksToStorage() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
      }

