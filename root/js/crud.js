//imports
import { db, auth, onAuthStateChanged, getDoc, doc, addDoc, collection, getDocs, updateDoc, deleteDoc, setDoc, query, orderBy } from "./db.js";

//global variables

//functions

// async function CheckUser() {
//     //check if user is logged in
//     const user = auth.currentUser;
//     if(!user) {
//         //TODO show error toast
//         alert("Please log in to continue");
//         return null;
//     }
//     return user;
// }

//TASKS

async function CreateTask(task, priority) {
    const tasksCollectionRef = collection(db, "users", auth.currentUser.uid, "tasks");
    const newTask = await addDoc(tasksCollectionRef, {
        task: task,
        priority: priority,
        completed: false
    });
    return newTask;
}


async function GetTasks(filter, sort) {
    const collectionReference = collection(db, "users", auth.currentUser.uid, "tasks");
    let q = collectionReference;
    if(filter != "all") {
        q = query(collectionReference, orderBy(filter, sort));
        console.log(filter, sort);
    }
    const snapshot = await getDocs(q); 
    return snapshot;
}

async function SetTask(taskId, task, priority, completed) {
    // console.log(taskId, task, priority, completed);
    const taskCollectionRef = collection(db, "users", auth.currentUser.uid, "tasks");
    await setDoc(doc(taskCollectionRef, taskId), {
        task: task,
        priority: priority,
        completed: completed
    });
}

async function DeleteTask(taskId) {
    await deleteDoc(doc(db, "users", auth.currentUser.uid, "tasks", taskId));
}


//exports

export { CreateTask, GetTasks, DeleteTask, SetTask };