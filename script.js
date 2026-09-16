const tasks = [];

// Get tasks saved from Add Task page
const savedTasks = JSON.parse(localStorage.getItem("tasks"));

if (savedTasks) {
    tasks.length = 0;
    tasks.push(...savedTasks);
}

// Dashboard Data
function updateDashboard() {
    const resultStats = tasks.reduce((ac, cur) => {
        if (cur.status === "Completed") {
            ac.completed++;
        } else if (cur.status === "Todo") {
            ac.toDo++;
        } else if (cur.status === "In Progress") {
            ac.progress++;
        }

        return ac;
    }, {
        toDo: 0,
        completed: 0,
        progress: 0
    });

    document.getElementById("totalTask").innerHTML = `<b>${tasks.length}</b>`;
    document.getElementById("Todo").innerHTML = `<b>${resultStats.toDo}</b>`;
    document.getElementById("inProgress").innerHTML = `<b>${resultStats.progress}</b>`;
    document.getElementById("completed").innerHTML = `<b>${resultStats.completed}</b>`;
}

// Display
const table = document.getElementById("taskTable");

function allData() {
    const row = tasks.map((e) => `
        <tr>
            <td>${e.id}</td>
            <td>${e.title}</td>
            <td>${e.assignee}</td>
            <td>${e.status}</td>
            <td>${e.priority}</td>
            <td>${e.tags.join(", ")}</td>
            <td>
                <button onclick="editTask(${e.id})">Edit</button>
                <button onclick="deleteTask(${e.id})">Delete</button>
            </td>
        </tr>
    `);

    table.innerHTML = row.join(" ");
}

// Delete
function deleteTask(id) {
    const del = tasks.filter((e) => e.id !== id);

    tasks.length = 0;
    tasks.push(...del);

    localStorage.setItem("tasks", JSON.stringify(tasks));

    allData();
    updateDashboard();
}

// Edit Task
function editTask(id) {
    const task = tasks.find((e) => e.id === id);

    const form = document.createElement("form");

    form.innerHTML = `
        <h2>Edit task</h2>

        <label>Task Title</label>
        <input type="text" id="editTitle" value="${task.title}" required>

        <label>Assignee</label>
        <input type="text" id="editAssignee" value="${task.assignee}" required>

        <label>Status</label>
        <select id="editStatus" required>
            <option value="Todo">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
        </select>

        <label>Priority</label>
        <select id="editPriority" required>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
        </select>

        <label>Tags</label>
        <input type="text" id="editTags" value="${task.tags}" required>

        <button type="submit">Update Task</button>
    `;

    document.body.appendChild(form);

    document.getElementById("editStatus").value = task.status;
    document.getElementById("editPriority").value = task.priority;
    document.getElementById("editTags").value = task.tags.join(", ");

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const title = document.getElementById("editTitle").value.trim();
        const assignee = document.getElementById("editAssignee").value.trim();
        const status = document.getElementById("editStatus").value;
        const priority = document.getElementById("editPriority").value;

        const tags = [
            ...new Set(
                document.getElementById("editTags").value
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag !== "")
            )
        ];

        if (tags.length === 0) {
            alert("At least one tag is required");
            return;
        }

        task.title = title;
        task.assignee = assignee;
        task.status = status;
        task.priority = priority;
        task.tags = tags;

        localStorage.setItem("tasks", JSON.stringify(tasks));

        allData();
        updateDashboard();

        form.remove();
    });
}

allData();
updateDashboard();

// Filtering
const drop = document.getElementById("drop");
const subDrop = document.getElementById("subDrop");
const search = document.getElementById("taskFilter");
const applyFilter = document.getElementById("applyFilter");

// Apply Filter button
applyFilter.addEventListener("click", () => {
    const key = search.value.trim().toLowerCase();
    const selected = drop.value;
    const subValue = subDrop.value;

    let filteredData = tasks;

    // ID
    if (selected === "id") {
        filteredData = tasks.filter((e) =>
            String(e.id).includes(key)
        );
    }

    // Title
    else if (selected === "title") {
        filteredData = tasks.filter((e) =>
            e.title.toLowerCase().includes(key)
        );
    }

    // Assign
    else if (selected === "assignee") {
        filteredData = tasks.filter((e) =>
            e.assignee.toLowerCase().includes(key)
        );
    }

    // Tags
    else if (selected === "tags") {
        filteredData = tasks.filter((e) =>
            e.tags.some((tag) =>
                tag.toLowerCase().includes(key)
            )
        );
    }

    // Status
    else if (selected === "status") {
        if (subValue === "") {
            allData();
            return;
        }

        filteredData = tasks.filter((e) =>
            e.status === subValue
        );
    }

    // Priority
    else if (selected === "priority") {
        if (subValue === "") {
            allData();
            return;
        }

        filteredData = tasks.filter((e) =>
            e.priority === subValue
        );
    }

    // Display filtered data
    const filteredRow = filteredData.map((e) => `
        <tr>
            <td>${e.id}</td>
            <td>${e.title}</td>
            <td>${e.assignee}</td>
            <td>${e.status}</td>
            <td>${e.priority}</td>
            <td>${e.tags.join(", ")}</td>
            <td>
                <button onclick="editTask(${e.id})">Edit</button>
                <button onclick="deleteTask(${e.id})">Delete</button>
            </td>
        </tr>
    `);

    table.innerHTML = filteredRow.join("");
});

// Show second dropdown
drop.addEventListener("change", () => {
    subDrop.innerHTML = `<option value="">Select</option>`;

    if (drop.value === "status") {
        subDrop.innerHTML = `
            <option value="">Select Status</option>
            <option value="Completed">Completed</option>
            <option value="Todo">To Do</option>
            <option value="In Progress">In Progress</option>
        `;

        subDrop.style.display = "inline-block";
    } else if (drop.value === "priority") {
        subDrop.innerHTML = `
            <option value="">Select Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
        `;

        subDrop.style.display = "inline-block";
    } else {
        subDrop.style.display = "none";
    }
});

// Add Task
const addTaskForm = document.getElementById("addTaskForm");

addTaskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const id = tasks.length > 0
        ? Math.max(...tasks.map(task => task.id)) + 1
        : 101;

    const title = document.getElementById("title").value.trim();
    const assignee = document.getElementById("assignee").value.trim();
    const status = document.getElementById("formStatus").value;
    const priority = document.getElementById("formPriority").value;

    const tags = [
        ...new Set(
            document.getElementById("formTags").value
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag !== "")
        )
    ];

    const newPerson = {
        id,
        title,
        assignee,
        status,
        priority,
        tags
    };

    tasks.push(newPerson);

    localStorage.setItem("tasks", JSON.stringify(tasks));

    allData();
    updateDashboard();

    addTaskForm.reset();
});