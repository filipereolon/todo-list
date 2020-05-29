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

const LOCAL_STORAGE_LIST_KEY = 'task.lists';
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'task.selectedListId';

let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY);
let selectedList;
let selectedTask;


loadList();

function selectList() {
    let listItems = document.querySelectorAll('.list');
        listItems.forEach(list => {
        list.id === selectedListId ? list.classList.add('selected') : list.classList.remove('selected');
    })
}

tasksContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'input') {
        selectedTaskId = e.target.id;
        selectedTask = selectedList.tasks.find(task => task.id === selectedTaskId)
        if (selectedTask.complete) {
            selectedTask.complete = false;
        } else {
            selectedTask.complete = true;
        }
        save();
        tasksCounter(selectedList);
    }
})

listContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'li') {
        selectedListId = e.target.id;
        selectList();
        showList();
        save();
        clearElement(tasksContainer);
        renderTasks(selectedList);
    }
})

listForm.addEventListener('submit', e => {
    e.preventDefault();
    const listName = listInput.value.trim();
    if(listName == null || listName === '') return
    const list = createList(listName);
    lists.push(list);
    save();
    addList(list);
    listInput.value = null;
})

addTaskForm.addEventListener('submit', e => {
    e.preventDefault();
    const newTask = newTaskTitle.value.trim();
    const newDescription = newTaskDescription.value.trim();
    if (newTask == null || newTask ==='') return
    const task = createTask(newTask, newDescription);
    selectedList.tasks.push(task);
    addTaskForm.submit();
    save();
      
})

function teste() {
    showList();
    clearElement(tasksContainer);
    renderTasks(selectedList);
}

function createTask(name, description) {
    return {id: Date.now().toString(), name, description, complete: false, date: newTaskDate.value}
}

function createList(name) {
   return {id: Date.now().toString(), name, tasks: []}
}

function save() {
    localStorage.setItem(LOCAL_STORAGE_LIST_KEY,JSON.stringify(lists));
    localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId);
}

function loadList() {
    selectedList = lists.find(list => list.id === selectedListId);
    lists.forEach(addList)
    renderTasks(selectedList);
    showList();
    selectList();
}

function reloadList(e) {
    clearElement(e);
    loadList();
}

function showList() {
    selectedList = lists.find(list => list.id === selectedListId);
    listTitle.innerText = selectedList.name;
    tasksCounter(selectedList);
}

function renderTasks(selectedList) {
    selectedList.tasks.forEach(task => {
        const taskElement = document.importNode(taskTemplate.content, true)
        const checkbox = taskElement.querySelector('input');
        checkbox.id = task.id;
        checkbox.checked = task.complete;
        const taskTitle = taskElement.querySelector('.task-title');
        const taskDescription = taskElement.querySelector('.task-description');
        taskTitle.htmlFor = task.id;
        taskTitle.append(task.name);
        taskDescription.append(task.description);
        tasksContainer.appendChild(taskElement);
    })
}

function tasksCounter(selectedList) {
    let incomplete = selectedList.tasks.filter(task => !task.complete).length;
    const taskString = incomplete === 1 ? 'task' : 'tasks';
    incomplete === 0 ? incomplete = 'No': false;
    listCount.innerText = `${incomplete} incomplete ${taskString}`; 
}

function addList(list) {
    const listElement = document.createElement('li');
    listElement.id = list.id;
    listElement.classList.add('list');
    listElement.innerText = list.name;
    listContainer.appendChild(listElement);
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