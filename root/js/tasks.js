// 1. IMPORTS
import { db, auth, onAuthStateChanged, getDoc, doc } from "./db.js";
// 2. GLOBAL VARIABLES

const greetViewBox = document.getElementById("greeting");
const logoutBtn = document.getElementById("logout-btn");   

// 3. FUNCTIONS

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
    // logoutBtn.addEventListener("click", Logout());

    //add task button
    // const addTaskBtn = document.getElementById("add-task-btn");
    
    //Filter button


}

async function Logout() {
    try {
        //sign user out of firebase
        await auth.signOut();
        //redirect to the authentication page to sign in
        window.location.href = "../html/index.html";
    } catch (error) {
        //TODO show error toast
        alert(error.message);
    }
}



function handleAuthState() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            //set event listeners
            SetEventListeners();
            //load greeting if user is logged in
            LoadUserGreeting(user);
        } else {
            //redirect to the authentication page to sign in
            window.location.href = "../html/index.html";
        }
    });
}


//4. MAIN
document.addEventListener("DOMContentLoaded", handleAuthState);