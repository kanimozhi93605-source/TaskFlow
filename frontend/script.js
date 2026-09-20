const API_URL = "http://localhost:5000";

let tasks = [];
let currentFilter = "all";


// ===============================
// GET HTML ELEMENTS
// ===============================

const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const dateInput = document.getElementById("dateInput");
const addBtn = document.getElementById("addBtn");

const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");

const searchInput = document.getElementById("searchInput");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");

const clearCompleted = document.getElementById("clearCompleted");
const themeBtn = document.getElementById("themeBtn");

const filterButtons = document.querySelectorAll(".filter");


// ===============================
// LOAD TASKS
// ===============================

async function loadTasks() {

    try {

        const response = await fetch(`${API_URL}/tasks`);

        if (!response.ok) {
            throw new Error("Failed to load tasks");
        }

        tasks = await response.json();

        renderTasks();

    } catch (error) {

        console.error("Load error:", error);

        renderTasks();

    }

}


// ===============================
// ADD TASK
// ===============================

addBtn.addEventListener("click", async function () {

    const title = taskInput.value.trim();
    const priority = priorityInput.value;
    const date = dateInput.value;

    if (title === "") {

        alert("Please enter a task!");

        return;

    }

    const newTask = {
        title: title,
        priority: priority,
        date: date,
        completed: false
    };

    try {

        const response = await fetch(`${API_URL}/tasks`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(newTask)

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error("Failed to save task");
        }

        tasks.unshift(data.task);

        renderTasks();

        taskInput.value = "";
        priorityInput.value = "Medium";
        dateInput.value = "";

    } catch (error) {

        console.error("Add Task Error:", error);

        alert("Unable to add task.");

    }

});


// ===============================
// ENTER KEY
// ===============================

taskInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        addBtn.click();

    }

});


// ===============================
// DISPLAY TASKS
// ===============================

function renderTasks() {

    taskList.innerHTML = "";

    const searchText =
        searchInput.value.toLowerCase();

    const filteredTasks = tasks.filter(function (task) {

        const matchesSearch =
            task.title.toLowerCase().includes(searchText);

        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "pending" && !task.completed) ||
            (currentFilter === "completed" && task.completed);

        return matchesSearch && matchesFilter;

    });


    if (filteredTasks.length === 0) {

        emptyMessage.style.display = "block";

    } else {

        emptyMessage.style.display = "none";

    }


    filteredTasks.forEach(function (task) {

        const li = document.createElement("li");

        li.className = "task-item";


        if (task.completed) {

            li.classList.add("completed");

        }


        li.innerHTML = `

            <div class="task-info">

                <input
                    type="checkbox"
                    class="complete-checkbox"
                    ${task.completed ? "checked" : ""}
                >

                <div>

                    <strong>${task.title}</strong>

                    <div class="task-details">

                        <span>${task.priority}</span>

                        ${
                            task.date
                                ? `<span>${task.date}</span>`
                                : ""
                        }

                    </div>

                </div>

            </div>

            <div class="task-actions">

                <button class="edit-btn">
                    ✏️
                </button>

                <button class="delete-btn">
                    🗑️
                </button>

            </div>

        `;


        // ===============================
        // COMPLETE / UNCOMPLETE
        // ===============================

        const checkbox =
            li.querySelector(".complete-checkbox");


        checkbox.addEventListener("change", async function () {

            try {

                const response = await fetch(
                    `${API_URL}/tasks/${task._id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            title: task.title,
                            priority: task.priority,
                            date: task.date,
                            completed: checkbox.checked
                        })
                    }
                );


                const updatedTask = await response.json();


                if (!response.ok) {
                    throw new Error("Failed to update task");
                }


                task.completed = updatedTask.completed;

                renderTasks();


            } catch (error) {

                console.error("Update error:", error);

                alert("Unable to update task.");

                checkbox.checked = task.completed;

            }

        });

// ===============================
// EDIT TASK - MODAL
// ===============================

const editBtn = li.querySelector(".edit-btn");

editBtn.addEventListener("click", function () {

    const editModal = document.getElementById("editModal");
    const editTitle = document.getElementById("editTitle");
    const editPriority = document.getElementById("editPriority");
    const editDate = document.getElementById("editDate");

    editTitle.value = task.title;
    editPriority.value = task.priority;
    editDate.value = task.date || "";

    editModal.classList.add("show");

    const saveEdit = document.getElementById("saveEdit");
    const cancelEdit = document.getElementById("cancelEdit");
    const closeModal = document.getElementById("closeModal");

    // SAVE
    saveEdit.onclick = async function () {

        const newTitle = editTitle.value.trim();

        if (newTitle === "") {
            alert("Task title cannot be empty.");
            return;
        }

        try {

            const response = await fetch(
                `${API_URL}/tasks/${task._id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        title: newTitle,
                        priority: editPriority.value,
                        date: editDate.value,
                        completed: task.completed
                    })
                }
            );

            const updatedTask = await response.json();

            if (!response.ok) {
                throw new Error("Failed to edit task");
            }

            const index = tasks.findIndex(function (item) {
                return item._id === task._id;
            });

            if (index !== -1) {
                tasks[index] = updatedTask;
            }

            editModal.classList.remove("show");

            renderTasks();

        } catch (error) {

            console.error("Edit error:", error);

            alert("Unable to update task.");

        }

    };

    // CANCEL
    cancelEdit.onclick = function () {
        editModal.classList.remove("show");
    };

    // CLOSE X
    closeModal.onclick = function () {
        editModal.classList.remove("show");
    };

});


        // ===============================
        // DELETE TASK
        // ===============================

        const deleteBtn =
            li.querySelector(".delete-btn");


        deleteBtn.addEventListener("click", async function () {

            const confirmDelete =
                confirm("Delete this task?");


            if (!confirmDelete) {
                return;
            }


            try {

                const response = await fetch(
                    `${API_URL}/tasks/${task._id}`,
                    {
                        method: "DELETE"
                    }
                );


                if (!response.ok) {
                    throw new Error("Failed to delete task");
                }


                tasks = tasks.filter(function (item) {

                    return item._id !== task._id;

                });


                renderTasks();


            } catch (error) {

                console.error("Delete error:", error);

                alert("Unable to delete task.");

            }

        });


        taskList.appendChild(li);

    });


    updateStats();

}


// ===============================
// UPDATE STATISTICS
// ===============================

function updateStats() {

    const total = tasks.length;


    const completed =
        tasks.filter(function (task) {

            return task.completed;

        }).length;


    const pending =
        total - completed;


    totalTasks.textContent = total;

    completedTasks.textContent = completed;

    pendingTasks.textContent = pending;

}


// ===============================
// SEARCH
// ===============================

searchInput.addEventListener("input", function () {

    renderTasks();

});


// ===============================
// FILTER
// ===============================

filterButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        filterButtons.forEach(function (btn) {

            btn.classList.remove("active");

        });


        button.classList.add("active");


        currentFilter =
            button.dataset.filter;


        renderTasks();

    });

});


// ===============================
// CLEAR COMPLETED
// ===============================

clearCompleted.addEventListener("click", async function () {

    const completedCount =
        tasks.filter(function (task) {

            return task.completed;

        }).length;


    if (completedCount === 0) {

        alert("No completed tasks.");

        return;

    }


    const confirmClear =
        confirm("Delete all completed tasks?");


    if (!confirmClear) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/tasks/completed/all`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {
            throw new Error("Failed to clear tasks");
        }


        tasks = tasks.filter(function (task) {

            return !task.completed;

        });


        renderTasks();


    } catch (error) {

        console.error("Clear completed error:", error);

        alert("Unable to clear completed tasks.");

    }

});


// ===============================
// DARK MODE
// ===============================

themeBtn.addEventListener("click", function () {

    document.body.classList.toggle("dark-mode");


    if (document.body.classList.contains("dark-mode")) {

        themeBtn.textContent = "☀️";

    } else {

        themeBtn.textContent = "🌙";

    }

});


// ===============================
// START APP
// ===============================

loadTasks();
// =================================
// ✨ MOUSE GLITTER EFFECT
// =================================

