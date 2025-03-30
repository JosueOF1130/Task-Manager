// 1. IMPORTS
import { db, auth, onAuthStateChanged, getDoc, doc, addDoc, collection} from "./db.js";
import { Logout } from "./auth.js";
// 2. GLOBAL VARIABLES

const greetViewBox = document.getElementById("greeting");
const logoutBtn = document.getElementById("logout-btn");   

// 3. FUNCTIONS

//CRUD operations for tasks

//create task
async function AddTask() {

    const user = auth.currentUser;
    if(!user) {
        //TODO show error toast
        alert("User not signed in");
        return;
    }


    const task = document.getElementById("input-task").value;
    const priority = document.querySelector('input[name="priority"]:checked').value;

    if (!task || !priority) {
        // TODO show error toast
        alert("Please enter a task and select a priority!");
        return;
    }

    let priorityNumber;

    switch (priority) {
        case "low":
            priorityNumber = 1;
            break;
        case "medium":
            priorityNumber = 2;
            break;
        case "high":
            priorityNumber = 3;
            break;
        default:
            priorityNumber = 2;
    }
    try {
        const tasksCollectionRef = collection(db, "users", user.uid, "tasks");
        await addDoc(tasksCollectionRef, {
            task: task,
            priority: priorityNumber,
            completed: false
        });
        //TODO show success toast
        alert("Task added successfully");
    } catch (error) { 
        //TODO show error toast
        console.log(error.message);
        alert(error.message);
    }
}

//read tasks
async function ReadTasks() {
    const user = auth.currentUser; 
    if(!user) {
        //TODO show error toast
        alert("User not signed in");
        return;
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












function SetEventListeners() {
    //logout button
    const logoutBtn = document.getElementById("logout-btn");
    // console.log(logoutBtn);
    logoutBtn.addEventListener("click", Logout);

    //add task button
    const addTaskBtn = document.getElementById("add-task-btn");
    addTaskBtn.addEventListener("click", AddTask);
    //Filter button


}


async function LoadView(user) {
    //load greeting if user is logged in
    LoadUserGreeting(user);

    //load tasks if user is logged in


    //set event listeners
    SetEventListeners();

    
}


async function handleAuthState() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            //user is signed in
            LoadView(user);
        } else {
            //redirect to the authentication page to sign in
            window.location.href = "../html/index.html";
        }
    });
}


//4. MAIN
document.addEventListener("DOMContentLoaded", handleAuthState);

