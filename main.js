const listForm = document.getElementById('add-list-form');
const listInput = document.getElementById('add-list-input');
const listContainer = document.querySelector('.lists');
const deleteListBtn = document.getElementById('delete-list-button');
const deleteTaskBtn = document.getElementById('delete-task-button');
const taskTemplate = document.getElementById('task-template');
const listDisplayContainer = document.getElementById('tasks-view');
const listTitle = document.getElementById('todo-title');
const listCount = document.getElementById('todo-counter');
const tasksContainer = document.getElementById('todo-tasks');
const addTaskForm = document.getElementById('add-tasks');
const newTaskTitle = document.getElementById('new-task-title');
const newTaskDescription = document.getElementById('new-task-description');
const newTaskDate = document.getElementById('date-picker');
const editTaskDescription = document.getElementById('edit-task-description');
const editTaskDate = document.getElementById('edit-date-picker');
const editTaskTitle = document.getElementById('edit-task-title');
const editTaskForm = document.getElementById('edit-tasks');
const editTaskButton = document.getElementById('edit-task-button');
const deleteCompletetasks = document.getElementById('delete-complete-task-button');
const allTasksFilter = document.getElementById('all-tasks');
const deleters = document.querySelector('.deleters');
const newTaskAddButton = document.getElementById('add-new-task-button');
const submitNewTaskButton = document.getElementById('add-task-button');

const LOCAL_STORAGE_LIST_KEY = 'task.lists';
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'task.selectedListId';

let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY);

let selectedList;
let selectedTask;

loadPage();

function selectList() {
    let listItems = document.querySelectorAll('.list');
        listItems.forEach(list => {
        list.id === selectedListId ? list.classList.add('selected') : list.classList.remove('selected');
    })
}

allTasksFilter.addEventListener('click', () => {
    let allTaskobject = {id: 1, name: 'all tasks', tasks: []};
    clearElement(tasksContainer)
    lists.forEach(list => {
        list.tasks.forEach(task => {
            allTaskobject.tasks.push(task);
        });
        
    })
    
    console.log(allTaskobject)
    allTaskobject.tasks.forEach(task => {
        listTasks(task)
        let selectedDescription = document.querySelector(`[data-description-task-id = "${task.id}"]`);
        if (selectedDescription !== null) {
            console.log('dentro if')            
            task.complete === false ? selectedDescription.classList.remove('scratched') : selectedDescription.classList.add('scratched');
        }
    });
})

deleteCompletetasks.addEventListener('click', () => {
    clearElement(tasksContainer);
    selectedList.tasks = selectedList.tasks.filter(task => !task.complete);
    renderTasks(selectedList);
    renderBadges();
    save();
})

editTaskForm.addEventListener('submit', e => {
    e.preventDefault();
})

tasksContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'input') {
        selectedListId = e.target.dataset.listId;
        selectedList = lists.find(list => list.id === selectedListId);
        selectedTaskId = e.target.id;
        selectedTask = selectedList.tasks.find(task => task.id === selectedTaskId)
        let selectedDescription = document.querySelector(`[data-description-task-id = "${selectedTaskId}"]`);
        if (selectedTask.complete) {
            selectedTask.complete = false;
            selectedDescription.classList.remove('scratched');
        } else {
            selectedTask.complete = true;
            selectedDescription.classList.add('scratched');
        }
        tasksCounter(selectedList);
        save();
    }

    if (e.target.tagName.toLowerCase() === 'span') {
        if (e.target.id === 'close-x') {
            selectedListId = e.target.dataset.listId;
            selectedList = lists.find(list => list.id === selectedListId);
            selectedList.tasks = selectedList.tasks.filter(task => task.id !== e.target.dataset.taskId);
            e.target.parentNode.parentNode.parentNode.parentNode.removeChild(e.target.parentNode.parentNode.parentNode);
            tasksCounter(selectedList);
            save();
        }
        if (e.target.classList.contains('edit-task')) {
            selectedListId = selectedListId = e.target.dataset.listId;
            selectedList = lists.find(list => list.id === selectedListId);
            selectedTaskId = e.target.dataset.taskId;
            selectedTask = selectedList.tasks.find(task => task.id === selectedTaskId);
            editTaskDate.value = selectedTask.date;
            editTaskDescription.value = selectedTask.description;
            editTaskTitle.value = selectedTask.name;
        }
    }
})

editTaskButton.addEventListener('click', () => {
    selectedTask.date = editTaskDate.value;
    selectedTask.description = editTaskDescription.value;
    selectedTask.complete = false;
    editTaskTitle.value.trim() === '' ? false : selectedTask.name = editTaskTitle.value;
    clearElement(tasksContainer);
    renderTasks(selectedList);
    tasksCounter(selectedList);
    save();
})

listContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'li') {
        selectedListId = e.target.id;
        selectList();
        showList();
        clearElement(tasksContainer);
        renderTasks(selectedList);
        scratchDescription();
        save();
    }
})

listForm.addEventListener('submit', e => {
    e.preventDefault();
    const listName = listInput.value.trim();
    if(listName == null || listName === '') return
    const list = createList(listName);
    lists.push(list);
    selectedListId = list.id;
    listInput.value = null;
    addList(list);
    showList();
    clearElement(tasksContainer);
    renderTasks(list);
    selectList();
    showButtons();
    save();
})

newTaskAddButton.addEventListener('click', () => {
    submitNewTaskButton.classList.add('disabled');
    newTaskTitle.value = null;
    newTaskDescription.value = null;
    newTaskDate.value = null;
})

addTaskForm.addEventListener('keydown', () => {
    if (newTaskTitle.value.trim().length > 0) {
        submitNewTaskButton.classList.remove('disabled');
        submitNewTaskButton.dataset.dismiss = 'modal'
    } else {
        submitNewTaskButton.classList.add('disabled');
        submitNewTaskButton.dataset.dismiss = 'not-modal'
    }
})

addTaskForm.addEventListener('click', () => {
    if (newTaskTitle.value.trim().length > 0) {
        submitNewTaskButton.classList.remove('disabled');
        submitNewTaskButton.dataset.dismiss = 'modal'
    } else {
        submitNewTaskButton.classList.add('disabled');
        submitNewTaskButton.dataset.dismiss = 'not-modal'
    }
})

submitNewTaskButton.addEventListener('click', () => {
    if (submitNewTaskButton.classList.contains('disabled')) {
       return 
    } else {
        const newTask = newTaskTitle.value.trim();
        const newDescription = newTaskDescription.value.trim();
        selectedList = lists.find(list => list.id === selectedListId);
        const task = createTask(newTask, newDescription, selectedListId);
        selectedList.tasks.push(task);
        clearElement(tasksContainer);
        tasksCounter(selectedList);
        renderTasks(selectedList);
        save();
    }
})

function createTask(name, description, ListId) {
    let splitDate = newTaskDate.value.split('-');
    let showDate = `${splitDate[2]}/` + `${splitDate[1]}/` + `${splitDate[0]}`;
    return {id: Date.now().toString(), ListId, name, description, complete: false, date: newTaskDate.value, dueDate: showDate}
}

function createList(name) {
   return {id: Date.now().toString(), name, tasks: []}
}

function save() {
    localStorage.setItem(LOCAL_STORAGE_LIST_KEY,JSON.stringify(lists));
    localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId);
}

function hideButtons() {
    deleters.classList.add('hide');
    newTaskAddButton.classList.add('hide');
}

function showButtons() {
    deleters.classList.remove('hide');
    newTaskAddButton.classList.remove('hide');
}

function loadPage() {
    selectedList = lists.find(list => list.id === selectedListId);
    showButtons();
    lists.forEach(addList)
    selectedListId ? renderTasks(selectedList) : false;
    showList();
    selectList();
    renderBadges();
    selectedListId ? scratchDescription() : false;
}

function scratchDescription() {
    selectedList = lists.find(list => list.id === selectedListId);
    
    selectedList.tasks.forEach(task => {
    let selectedDescription = document.querySelector(`[data-description-task-id = "${task.id}"]`);
        if (selectedDescription !== null) {            
            task.complete === false ? selectedDescription.classList.remove('scratched') : selectedDescription.classList.add('scratched');
        }
    }) 
}

function reloadList(e) {
    clearElement(e);
    lists.forEach(addList);
    renderBadges();
}

function showList() {
    if (selectedListId) {
        selectedList = lists.find(list => list.id === selectedListId);
        listTitle.innerText = selectedList.name;
        tasksCounter(selectedList);
    }
}

function  renderTasks(selectedList) {
    selectedList = lists.find(list => list.id === selectedListId)
    selectedList.tasks.forEach(task => listTasks(task))
}

function listTasks(task) {
    const taskElement = document.importNode(taskTemplate.content, true)
    const checkbox = taskElement.querySelector('input');
    const taskTitle = taskElement.querySelector('.task-title');
    const taskDescription = taskElement.querySelector('.task-description');
    const taskDueDate = taskElement.querySelector('.due-date');
    const taskEditButton = taskElement.querySelector('.edit-task');
    const deleteTask = taskElement.getElementById('close-x');
    checkbox.id = task.id;
    checkbox.checked = task.complete;
    checkbox.dataset.listId = task.ListId;
    deleteTask.dataset.taskId = task.id;
    deleteTask.dataset.listId = task.ListId;
    taskEditButton.dataset.taskId = task.id;
    taskEditButton.dataset.listId = task.ListId;
    taskDueDate.append(task.dueDate);
    taskTitle.htmlFor = task.id;
    taskTitle.append(task.name);
    taskDescription.dataset.descriptionTaskId = task.id;
    taskDescription.append(task.description);
    tasksContainer.appendChild(taskElement);
}

function tasksCounter(selectedList) {
    let incomplete = selectedList.tasks.filter(task => !task.complete).length;
    const taskString = incomplete === 1 ? 'task' : 'tasks';
    incomplete === 0 ? incomplete = 'No' : false;
    listCount.innerText = `${incomplete} incomplete ${taskString}`; 
    const badgeElement = document.querySelector(`[data-sel-id="${selectedListId}"]`);
    incomplete > 0 ?  badgeElement.innerText = `${incomplete}` : badgeElement.innerText = '0';
}

function renderBadges() {
    lists.forEach(list => {
        selectedListId = list.id;
        tasksCounter(list);
    })
    selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY);
}

function addList(list) {
    const listElement = document.createElement('li');
    const badgeElement = document.createElement('span');
    badgeElement.dataset.selId = list.id;
    listElement.id = list.id;
    listElement.classList.add('list');
    listElement.innerText = list.name;
    listContainer.appendChild(listElement);
    listElement.appendChild(badgeElement);
    badgeElement.classList.add('badge');
    badgeElement.classList.add('badge-info');
}

deleteListBtn.addEventListener('click', () => {
    lists = lists.filter(list => list.id !== selectedListId);
    reloadList(listContainer);
    save();
})

function clearElement(e) {
    while (e.firstChild) {
        e.removeChild(e.firstChild)
    }
}

$('#addModal').on('shown.bs.modal', function() {
    $(this).find('input:first').focus();
  });
  $('#editModal').on('shown.bs.modal', function() {
    $(this).find('input:first').focus();
  });