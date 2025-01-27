const API_BASE_URL = "https://vvri.pythonanywhere.com/api";

async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch from ${endpoint}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching data:", error);
        return []; 
    }
}

async function sendData(endpoint, method, data = null) {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method,
            headers: {
                "Content-Type": "application/json",
            },
            body: data ? JSON.stringify(data) : null,
        });
        if (!response.ok) {
            throw new Error(`Failed to ${method} data at ${endpoint}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error sending data:", error);
    }
}

async function showList(type) {
    const data = await fetchData(type); 
    const listContainer = document.getElementById(`${type}-list`);
    
    if (!listContainer) {
        console.error(`Element with id '${type}-list' not found.`);
        return;
    }

    listContainer.innerHTML = "";

    data.forEach(item => {
        const div = document.createElement("div");
        div.className = "list-item";
        
        if (type === "students") {
            div.innerHTML = `
                <p><strong>${item.name}</strong></p>
                <button onclick="viewItem('${type}', ${item.id})">View</button>
                <button onclick="editItem('${type}', ${item.id})">Edit</button>
                <button onclick="deleteItem('${type}', ${item.id})">Delete</button>
            `;
        } else if (type === "courses") {
            div.innerHTML = `
                <p><strong>${item.name}</strong></p>
                <button onclick="viewItem('${type}', ${item.id})">View</button>
                <button onclick="editItem('${type}', ${item.id})">Edit</button>
                <button onclick="deleteItem('${type}', ${item.id})">Delete</button>
            `;
        }
        
        listContainer.appendChild(div);
    });
}


async function viewItem(type, id) {
    const data = await fetchData(`${type}/${id}`); 
    alert(`Name: ${data.name}\nStudents: ${data.students?.length || 0}`);
}

function showCourseForm() {
    document.getElementById("form-title").textContent = "Add New Course";
    showFormCourseHelper("courses", "POST");
}

function showStudentForm() {
    document.getElementById("form-title").textContent = "Add New Student";
    showFormStudentHelper("students", "POST");
}

function showFormCourseHelper(type, method, id = null) {
    let courseInput = document.getElementById("courseId");
    courseInput.style.display = "none";
    document.getElementById("form-container").style.display = "flex";
    document.getElementById("name").value = "";

    if (method === "PATCH" || method === "PUT") {
        fetchData(`${type}/${id}`).then(data => {
            document.getElementById("name").value = data.name;
            
        });
    }

    document.getElementById("submit-btn").onclick = async () => {
        const name = document.getElementById("name").value;

        const endpoint = id ? `${type}/${id}` : type;
        await sendData(endpoint, method, { name });
        document.getElementById("form-container").style.display = "none";
        showList(type);
    };
}

function showFormStudentHelper(type, method, id = null) {
    const courseInput = document.getElementById("courseId");
    courseInput.style.display = "inline";
    document.getElementById("form-container").style.display = "flex"; 
    document.getElementById("name").value = ""; 
    courseInput.value = ""; 

    if (method === "PATCH" || method === "PUT") {
        fetchData(`${type}/${id}`).then(data => {
            document.getElementById("name").value = data.name; 
            courseInput.value = data.course_id || ""; 
        });
    }
    document.getElementById("submit-btn").onclick = async () => {
        const name = document.getElementById("name").value; 
        const courseId = courseInput.value; 

        if (!name || !courseId) {
            alert("Both Name and Course ID are required!");
            return;
        }

        const endpoint = id ? `${type}/${id}` : type;
        const payload = { name, course_id: courseId };

        await sendData(endpoint, method, payload);

        document.getElementById("form-container").style.display = "none";
        showList(type);
    };
}

async function editItem(type, id) {
    const method = type === "courses" ? "PATCH" : "PUT"; // PATCH for courses, PUT for students
    document.getElementById("form-title").textContent = `Edit ${type.slice(0, -1)}`;
    if (type === "students"){
        showFormStudentHelper(type, method, id);
    }
    else if (type === "courses"){
        showFormCourseHelper(type, method, id);
    }
}

async function deleteItem(type, id) {
    if (confirm("Are you sure you want to delete this item?")) {
        await sendData(`${type}/${id}`, "DELETE");
        showList(type); 
    }
}
function closeForm() {
    document.getElementById("form-container").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
    showList("courses");
    showList("students");
});
