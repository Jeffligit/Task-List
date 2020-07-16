let user;
let uid;

class Task {
    constructor(description, id, user_id) {
        this.description = description;
        this.id = id;
        this.priority = {};
        this.user_id = user_id;
    }
}
// ui
class UI {
    constructor(){
        this.tasks = [];
        this.priorities = [];
        
    }

    addTask(description, taskPriority) {

        const newTaskSnapshot = firebase.database().ref('tasks').push();
        const taskId = newTaskSnapshot.key;
        const task = new Task(description, taskId, uid);
        const priorityObj = this.priorities.find(priority => priority.id == taskPriority);
        task.priority = priorityObj;
        this.tasks.push(task);

        let badgeType;
        if (task.priority.id == "L") {
            badgeType = "badge-success";
        } else if (task.priority.id == "M") {
            badgeType = "badge-warning";
        } else {
            badgeType = "badge-danger";
        }
        const list = document.getElementById("task-list");
        const row = document.createElement("tr");
        row.innerHTML = `
        <td class="text-center"><span class="badge ${badgeType}">${task.priority.name}</span></td>
        <td id="row_${taskId}" class="text-center">${description}</td>
        <td class="text-center"><a style="cursor: pointer;"><img id="${taskId}" class="edit" src="pencil.svg"/></a></td>
        `;
        list.appendChild(row);
        firebase.database().ref('tasks').child(taskId).set({
            description: task.description,
            id: task.id,
            priority: task.priority.id,
            user_id: task.user_id
        });

        document.getElementById('task').value = '';
    }

    editTask(target) {
        let id = target.id;
        let currTask;
        this.tasks.forEach(task => {
            if (task.id == id) {
                currTask = task;
            }
        })
        let badgeType;
        if (currTask.priority.id == "L") {
            badgeType = "badge-success";
        } else if (currTask.priority.id == "M") {
            badgeType = "badge-warning";
        } else {
            badgeType = "badge-danger";
        }
        let current_desc = document.getElementById(`row_${id}`).innerHTML;
        target.parentElement.parentElement.parentElement.innerHTML=`
         <td class="text-center"><span class="badge ${badgeType}">${currTask.priority.name}</span></td>
         <td id="row_${id}" class="text-center"><input type="text" class="form-control" id="new_desc" value="${current_desc}"></td>
         <td class="text-center">
            <button id="${id}" class="btn-success save">
                save
            </button>
            <button id="${id}" class="btn-danger delete">
                delete
            </button>
            <button class="btn btn-light dropdown-toggle" type="button" id="${id}_btn" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">${currTask.priority.id}</button>
                <div class="dropdown-menu" id="${id}_list" aria-labelledby="dropdownMenuButton">
                  <a class="dropdown-item text-success" id="${id}">L</a>
                  <a class="dropdown-item text-warning" id="${id}">M</a>
                  <a class="dropdown-item text-danger" id="${id}">H</a>
                </div>
        </td>
        `;
        const newButton = document.getElementById(`${id}_btn`);
        const text = newButton.textContent;
        if (text == "L") {
            newButton.style.color = "green";
        } else if (text == "M") {
            newButton.style.color = "#FFC300";
        } else {
            newButton.style.color = "#C70039";
        } 
    }

    saveTask(target) {
        let id = target.id;
        const newDesc = document.getElementById('new_desc').value;
        const newPriority = document.getElementById(`${id}_btn`).textContent;
        const priorityObj = this.priorities.find(priority => priority.id == newPriority);
        let currTask;
        this.tasks.forEach(task => {
            if (task.id == id) {
                currTask = task;
            }
        })
        currTask.priority = priorityObj;
        currTask.description = newDesc;
        let badgeType;
        if (currTask.priority.id == "L") {
            badgeType = "badge-success";
        } else if (currTask.priority.id == "M") {
            badgeType = "badge-warning";
        } else {
            badgeType = "badge-danger";
        }
        target.parentElement.parentElement.innerHTML=`
        <td class="text-center"><span class="badge ${badgeType}">${currTask.priority.name}</span></td>
            <td id="row_${id}" class="text-center">${newDesc}</td>
            <td class="text-center">
                <a style="cursor: pointer;">
                    <img id="${id}" class="edit" src="pencil.svg"/>
                </a>
            </td>
            `;
        firebase.database().ref('tasks').child(id).set({
            description: newDesc,
            id: id,
            priority: newPriority,
            user_id: uid
        });

    }

    deleteTask(target) {
        let id = target.id;
        const task = this.tasks.find((task) => task.id == id);
        if (!task) return;

        target.parentElement.parentElement.remove();
        firebase.database().ref('tasks').child(id).remove();
    }

}

const ui = new UI();
const priorityDropDown = document.getElementById("priority-list");
const priorityButton = document.getElementById("priority-button");

//Add task
document.getElementById("task-form").addEventListener("submit", function(e) {
    e.preventDefault();
    if (priorityButton.textContent == "Priority") {
        document.getElementById("alert").innerHTML = "Your task must have a priority type."
        return;
    } else {
        document.getElementById("alert").innerHTML = "";
    }
    const taskElement = document.getElementById("task");
    const description = taskElement.value;
    let priority;
    if (priorityButton.textContent == "Low") {
        priority = "L";
    } else if (priorityButton.textContent == "Medium") {
        priority = "M";
    } else {
        priority = "H";
    }
    ui.addTask(description, priority);
});

//Edit task
document.getElementById("task-list").addEventListener('click', function(e){
    if (e.target.className === "edit") {
        ui.editTask(e.target);
    } else if (e.target.className === "btn-success save") {
        ui.saveTask(e.target);
    } else if (e.target.className === "btn-danger delete") {
        ui.deleteTask(e.target);
    } else if (e.target.className === "dropdown-item text-success") {
        document.getElementById(`${e.target.id}_btn`).textContent = e.target.textContent;
        document.getElementById(`${e.target.id}_btn`).style.color = "green";
    } else if (e.target.className === "dropdown-item text-warning") {
        document.getElementById(`${e.target.id}_btn`).textContent = e.target.textContent;
        document.getElementById(`${e.target.id}_btn`).style.color = "#FFC300";
    } else if (e.target.className === "dropdown-item text-danger") {
        document.getElementById(`${e.target.id}_btn`).textContent = e.target.textContent;
        document.getElementById(`${e.target.id}_btn`).style.color = "#C70039";
    }
    e.preventDefault();
});

//Edit priority dropdown
priorityDropDown.addEventListener("click", (e) => {
    e.preventDefault();
    const text = document.getElementById(e.target.id).text;

    if (text == "Low") {
        priorityButton.style.color = "green";
    } else if (text == "Medium") {
        priorityButton.style.color = "#FFC300";
    } else {
        priorityButton.style.color = "#C70039";
    }
    priorityButton.textContent = text;
    
});

//Switch to register page
document.getElementById("register-btn").addEventListener("click", function(e) {
    document.getElementById("login-page").setAttribute("class", "card mt-4 d-none");
    document.getElementById("registration-page").setAttribute("class", "card mt-4 d-block");
});

//Switch back to login
document.getElementById("back-to-login-page").addEventListener("click", function(e) {
    document.getElementById("login-page").setAttribute("class", "card mt-4 d-block");
    document.getElementById("registration-page").setAttribute("class", "card mt-4 d-none");
});

//Log in
document.getElementById("login-btn").addEventListener("click", function(e) {
    const emailElement = document.getElementById("login-email");
    const passwordElement = document.getElementById("login-password");
    const emailAlertElement = document.getElementById("login-email-alert");
    const passwordAlertElement = document.getElementById("login-password-alert");
    const email = emailElement.value;
    const password = passwordElement.value;

    //Errors
    if (email == "" && password == "") {
        emailElement.setAttribute("class", "form-control border border-danger");
        passwordElement.setAttribute("class", "form-control border border-danger");
        emailAlertElement.innerHTML = "Enter an email";
        passwordAlertElement.innerHTML = "Enter a password";
    } else if (email == "") {
        emailElement.setAttribute("class", "form-control border border-danger");
        emailAlertElement.innerHTML = "Enter an email";
    } else if (password == "") {
        passwordElement.setAttribute("class", "form-control border border-danger");
        passwordAlertElement.innerHTML = "Enter a password";
    }

    firebase.auth().signInWithEmailAndPassword(email, password).then(function (e) {
        user = firebase.auth().currentUser;
        uid = user.uid;
        loadTasks();
        document.getElementById("login-page").setAttribute("class", "card mt-4 d-none");
        document.getElementById("task-list-page").setAttribute("class", "card mt-4 d-block");
    }).catch(function (error) {
        if (error.code == "auth/user-not-found") {
            emailElement.setAttribute("class", "form-control border border-danger");
            emailAlertElement.innerHTML = "This email is not in use";
        } else if (error.code == "auth/wrong-password") {
            passwordElement.setAttribute("class", "form-control border border-danger");
            passwordElement.value = "";
            passwordAlertElement.innerHTML = error.message;
        }
        console.log(error);
    });
});

//Sign up
document.getElementById("complete-reg-btn").addEventListener("click", function(e) {
    e.preventDefault();
    const emailElement = document.getElementById("reg-email");
    const passwordElement = document.getElementById("reg-password");
    const passwordConfirmElement = document.getElementById("reg-password-confirm");
    const passwordAlertElement = document.getElementById("password-alert");
    const emailAlertElement = document.getElementById("reg-email-alert");
    const passwordConfirmAlertElement = document.getElementById("confirm-password-alert");

    const email = emailElement.value;
    const password = passwordElement.value;
    const confirmPassword = passwordConfirmElement.value;
    // if password and confirm password is not the same
    if (email == "" && password == "") {
        passwordAlertElement.innerHTML = "Enter a password";
        passwordElement.setAttribute("class", "form-control border border-danger");
        emailAlertElement.innerHTML = "Enter an email";
        emailElement.setAttribute("class", "form-control border border-danger");
        return;
    } else if (password == "") {
        passwordAlertElement.innerHTML = "Enter a password";
        passwordElement.setAttribute("class", "form-control border border-danger");
        return;
    } else if (email == "") {
        emailAlertElement.innerHTML = "Enter an email";
        emailElement.setAttribute("class", "form-control border border-danger");
        return;
    } else if (password != confirmPassword) {
        passwordConfirmAlertElement.innerHTML = "Password does not match";
        passwordConfirmElement.value = "";
        passwordElement.value = "";
        passwordElement.setAttribute("class", "form-control border border-danger");
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password).then(function (e) {
        console.log("created");
        user = firebase.auth().currentUser;
        uid = user.uid;
        loadTasks();
        document.getElementById("registration-page").setAttribute("class", "card mt-4 d-none");
        document.getElementById("task-list-page").setAttribute("class", "card mt-4 d-block");
    }).catch(function(error) {
        //Short password
        if (error.code == "auth/weak-password") {
            passwordAlertElement.innerHTML = error.message;
            passwordElement.setAttribute("class", "form-control border border-danger");
            //Email is already in use or not in email form.
        } else if (error.code == "auth/email-already-in-use" || error.code == "auth/invalid-email") {
            emailAlertElement.innerHTML = error.message;
            emailElement.setAttribute("class", "form-control border border-danger");
        } 
        console.log(error);
    });
});

// clear up errors in sign up email when email form is clicked
document.getElementById("reg-email").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("reg-email").setAttribute("class", "form-control");
    document.getElementById("reg-email-alert").innerHTML = "";
});

// clear up errors in password and confirm password when password form is clicked
document.getElementById("reg-password").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("reg-password").setAttribute("class", "form-control");
    document.getElementById("reg-password-confirm").setAttribute("class", "form-control");
    document.getElementById("password-alert").innerHTML = "";
    document.getElementById("confirm-password-alert").innerHTML = "";
});

// clear up errors in password and confirm password when confirm password form is clicked
document.getElementById("reg-password-confirm").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("reg-password").setAttribute("class", "form-control");
    document.getElementById("reg-password-confirm").setAttribute("class", "form-control");
    document.getElementById("password-alert").innerHTML = "";
    document.getElementById("confirm-password-alert").innerHTML = "";
});

// clear up errors in login email when email form is clicked
document.getElementById("login-email").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("login-email").setAttribute("class", "form-control");
    document.getElementById("login-email-alert").innerHTML = "";
});

// clear up errors in login password when password form is clicked
document.getElementById("login-password").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("login-password").setAttribute("class", "form-control");
    document.getElementById("login-password-alert").innerHTML = "";
});

function loadTasks() {
    firebase.database().ref('priorities').once('value', (prioritiesSnapshot) => {
        const allPriorities = prioritiesSnapshot.val();
        Object.keys(allPriorities).forEach(priorityKey => {
            const priorityData = allPriorities[priorityKey];
            const priority = {
                id: priorityKey,
                name: priorityData.name,
                color: priorityData.color
            };
            ui.priorities.push(priority);
        });

        firebase.database().ref('tasks').once('value', (tasksSnapshot) => {
            const allTasks = tasksSnapshot.val();
            Object.keys(allTasks).forEach(taskKey => {
                const taskData = allTasks[taskKey];
                console.log(uid);
                console.log(taskData.user_id);
                if (taskData.user_id == uid) {
                    const task = new Task(taskData.description, taskKey);

                    if (taskData.priority) {
                        const priority = ui.priorities.find(priority => priority.id == taskData.priority);
                        task.priority = priority;
                    }

                    ui.tasks.push(task);
                    const taskListElement = document.getElementById("task-list");
                    const row = document.createElement("tr");
                    let badgeType;
                    if (task.priority.id == "L") {
                        badgeType = "badge-success";
                    } else if (task.priority.id == "M") {
                        badgeType = "badge-warning";
                    } else {
                        badgeType = "badge-danger";
                    }
                    row.innerHTML = `
                    <td class="text-center"> <span class="badge ${badgeType}">${task.priority.name}</span> </td>
                    <td id="row_${task.id}" class="text-center">${task.description}</td>
                    <td class="text-center"><a style="cursor: pointer;"><img id="${task.id}" class="edit" src="pencil.svg"/></a></td>
                    `; 
                    taskListElement.appendChild(row);
                }
            });
        });
    });

}