
var firebase = firebase.database();

class Task {
    constructor(description, id) {
        this.description = description;
        this.id = id;
        this.priority = {};
        //this.userId = userId;
    }
}
// ui
class UI {
    constructor(){
        this.tasks = [];
        this.priorities = [];

        firebase.ref('priorities').once('value', (prioritiesSnapshot) => {
            const allPriorities = prioritiesSnapshot.val();
            Object.keys(allPriorities).forEach(priorityKey => {
                const priorityData = allPriorities[priorityKey];
                const priority = {
                    id: priorityKey,
                    name: priorityData.name,
                    color: priorityData.color
                };
                this.priorities.push(priority);
            });

            firebase.ref('tasks').once('value', (tasksSnapshot) => {
                const allTasks = tasksSnapshot.val();
                Object.keys(allTasks).forEach(taskKey => {
                    const taskData = allTasks[taskKey];
                    const task = new Task(taskData.description, taskKey);
    
                    if (taskData.priority) {
                        const priority = this.priorities.find(priority => priority.id == taskData.priority);
                        task.priority = priority;
                    }

                    this.tasks.push(task);
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
                });
            });
        });

        
        
    }

    addTask(description, taskPriority) {

        const newTaskSnapshot = firebase.ref('tasks').push();
        const taskId = newTaskSnapshot.key;
        const task = new Task(description, taskId);
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
        firebase.ref('tasks').child(taskId).set({
            description: task.description,
            id: task.id,
            priority: task.priority.id
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
        firebase.ref('tasks').child(id).set({
            description: newDesc,
            id: id,
            priority: newPriority
        });

    }

    deleteTask(target) {
        let id = target.id;
        const task = this.tasks.find((task) => task.id == id);
        if (!task) return;

        target.parentElement.parentElement.remove();
        firebase.ref('tasks').child(id).remove();
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
