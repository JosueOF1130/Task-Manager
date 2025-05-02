// 1. IMPORTS
import { db, auth, onAuthStateChanged, getDoc, doc, addDoc, collection, getDocs, updateDoc, deleteDoc } from "./db.js";
// import { Logout } from "./auth.js";
import Icons from "./icons.js";
import { CreateTask, GetTasks, SetTask, DeleteTask } from "./crud.js";
// 2. GLOBAL VARIABLES

const greetViewBox = document.getElementById("greeting");
const logoutBtn = document.getElementById("logout-btn");
const addTaskBtn = document.getElementById("add-task-btn");

const modalContainer = document.getElementById("edit-task-modal");

let emptyList = false;

// 3. FUNCTIONS

//check if user is logged in

function CheckUser() {
    const user = auth.currentUser; 
    if(!user) {
        //TODO show error toast
        // alert("User not signed in");
        return null;
    }
    // console.log("check user: ", user);
    return user;
}


//CRUD operations for tasks

//create task
async function AddTask() {
    
    const taskField = document.getElementById("input-task");
    const priorityButton = document.querySelector('input[name="priority"]:checked');

    let task = taskField.value;
    let priority = priorityButton.value;

    if (!task || !priority) {
        // TODO show error toast
        alert("Please enter a task and select a priority!");
        return;
    }

    let priorityNumber = parseInt(priority);

    try {
        const newTask = await CreateTask(task, priorityNumber);
        //TODO show success toast
        // alert("Task added successfully");

        //manually add task to the list
        const taskList = document.getElementById("task-list");
        const markup = `<li class="task-item p-2 d-flex align-items-center justify-content-between " data-id="${newTask.id}">
        <div class="task-check d-flex align-items-center">
        ${ priorityNumber == 1 ? Icons.lowPriorityIcon : priorityNumber == 2 ? Icons.midPriorityIcon : Icons.highPriorityIcon}
            <input type="checkbox" class="form-check-input task-checkbox me-2 mt-0" id="task-${newTask.id}">
            <label for="task-${newTask.id}">${task}</label>
        </div>

        <div class="btn-group" role="group" aria-label="edit and delete buttons">
            <button type="button" class="edit-btn btn w-50 p-2" id="edit-task-${newTask.id}" data-bs-toggle="modal" data-bs-target="#edit-task-modal">${Icons.editIcon}</button>
            <button type="button" class="trash-btn btn p-2" id="delete-task-${newTask.id}">${Icons.trashIcon}</button>
        </div>

        
        </li>`;
    taskList.innerHTML += markup;
    const tempTask = {
        task: task,
        priority: priorityNumber,
        completed: false
    };
    const checkbox = document.getElementById(`task-${newTask.id}`);
    checkbox.addEventListener("change", () => ToggleTask(newTask.id));
    const deleteBtn = document.getElementById(`delete-task-${newTask.id}`);
    deleteBtn.addEventListener("click", () => TrashTask(newTask.id));
    const editBtn = document.getElementById(`edit-task-${newTask.id}`);
    editBtn.addEventListener("click", () => OpenEditModal(newTask.id, tempTask));

    //clear input field
    taskField.value = "";
    document.getElementById("medium-priority").checked = true;

    } catch (error) { 
        //TODO show error toast
        console.log(error.message);
        alert(error.message);
    }
}

//read tasks
async function ReadTasks() {
    const filter = document.querySelector('input[name="filter"]:checked').value;
    const sort = document.querySelector('input[name="sort"]:checked').value;
    try {
        const tasks = await GetTasks(filter, sort);
        let markup = "";
        tasks.forEach((task) => {
            const data = task.data();
            // console.log(data);
            // console.log(data.completed)
            markup += `<li class="task-item p-2 d-flex align-items-center justify-content-between " data-id="${task.id}">
            <div class="task-check d-flex align-items-center">
            ${ data.priority == 1 ? Icons.lowPriorityIcon : data.priority == 2 ? Icons.midPriorityIcon : Icons.highPriorityIcon}
                <input type="checkbox" class="form-check-input task-checkbox me-2 mt-0" id="task-${task.id}" ${data.completed ? "checked" : ""}>
                <label for="task-${task.id}">${data.task}</label>
            </div>

            <div class="btn-group" role="group" aria-label="edit and delete buttons">
                <button type="button" class="edit-btn btn w-50 p-2" id="edit-task-${task.id}" data-bs-toggle="modal" data-bs-target="#edit-task-modal">${Icons.editIcon}</button>
                <button type="button" class="trash-btn btn p-2" id="delete-task-${task.id}">${Icons.trashIcon}</button>
            </div>

            
            </li>`;
        });

        const taskList = document.getElementById("task-list");
        taskList.innerHTML = markup;
        
        tasks.forEach((task) => {
            const checkbox = document.getElementById(`task-${task.id}`);
            checkbox.addEventListener("change", () => ToggleTask(task.id));
            const deleteBtn = document.getElementById(`delete-task-${task.id}`);
            deleteBtn.addEventListener("click", () => TrashTask(task.id));
            const editBtn = document.getElementById(`edit-task-${task.id}`);
            editBtn.addEventListener("click", () => OpenEditModal(task.id, task.data()));
        });
    } catch (error) {
        //TODO show error toast
        console.log(error.message);
        alert(error.message);
    }
}

//update task
//opens the edit modal with the values of the selected task
async function OpenEditModal(taskId, task) {
    //get input fields elements
    const taskInput = document.getElementById("edit-input-task");
    const priorityInput = document.getElementById(task.priority === 1 ? "edit-low-priority" : task.priority === 2 ? "edit-medium-priority" : "edit-high-priority");
    //set input values to the task values saved in firebase
    taskInput.value = task.task;
    priorityInput.checked = true;
    //set event listener to the update task button
    document.getElementById("update-task-btn").addEventListener("click", async () => {
        try {
            //updates task
            await SetTask(taskId, taskInput.value, priorityInput.value, task.completed);
            //refresh the list to show updated task
            ReadTasks();
        } catch(error) {
            console.log(error.message);
        }
    });
}


//delete task
async function TrashTask(taskId) {
    try {
        await DeleteTask(taskId);
        ReadTasks();
    } catch(error) {
        //TODO show error toast
        alert(error.message);
    }
}


async function LoadUserGreeting(user) {
    //get users information
    try {
        //get user document
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if(userSnap.exists()) {
            //get users data if doc reference exists
            const userData = userSnap.data();
            greetViewBox.innerHTML = `Welcome ${userData.username}!`;
        }else{
            //TODO show error toast for user not found
            alert("user not found");
        }
    }catch(error) {
        //TODO show error toast
        alert(error.message);
    }
}


async function ToggleTask(taskId) {
    if(!CheckUser()) return;
    
    console.log("toggle task: ", taskId);

    try {
        const taskDoc = await getDoc(doc(db, "users", auth.currentUser.uid, "tasks", taskId));
        if(taskDoc.exists()) {
            const taskData = taskDoc.data();
            const completed = !taskData.completed;
            await updateDoc(doc(db, "users", auth.currentUser.uid, "tasks", taskId), {
                completed: completed
            });
        }
    } catch(error) {
        alert(error.message);
    }
}












function SetEventListeners() {
    //logout button
    logoutBtn.addEventListener("click", () => {});
    // logoutBtn.addEventListener("click", Logout);
    //add task button
    addTaskBtn.addEventListener("click", AddTask);
    //Filter options
    const filterInputs = document.querySelectorAll('.filter-input');

    //sort options
    const sortInputs = document.querySelectorAll('.sort-input');
    sortInputs.forEach(option => {
        option.addEventListener('change', ReadTasks);
    });

    // Add change event listeners to each input
    filterInputs.forEach(option => {
        option.addEventListener('change', () => {
            sortInputs.forEach(input => {
                input.disabled = option.value === "all" ? true : false;
            });
            ReadTasks();
        });
    });
    
}



async function LoadView(user) {
    //load greeting if user is logged in
    LoadUserGreeting(user);

    //load tasks if user is logged in
    ReadTasks();

    //set event listeners
    SetEventListeners();

    
}


async function handleAuthState() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            //user is signed in
            const test = CheckUser();
            LoadView(user);
        } else {
            console.log(user);
            window.location.href = "../html/index.html";
        }
    });
}


//4. MAIN
document.addEventListener("DOMContentLoaded", handleAuthState);

