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
const LOCAL_STORAGE_ISFILTERSELECTED = 'task.isfilterselected;'

let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY);

let selectedList;
let selectedTask;
let isFilterSelected = parseInt(localStorage.getItem(LOCAL_STORAGE_ISFILTERSELECTED)) || 0;

loadPage();

function unselectLists() {
    let listItems = document.querySelectorAll('.list');
        listItems.forEach(list => list.classList.remove('selected'))
}

function selectList() {
    let listItems = document.querySelectorAll('.list');
        listItems.forEach(list => {
        list.id === selectedListId ? list.classList.add('selected') : list.classList.remove('selected');
    })
}

function unselectFilters() {
    let filterItems = document.querySelectorAll('.filter');
    filterItems.forEach(filter => filter.classList.remove('selected'));
}

allTasksFilter.addEventListener('click', renderAllTasks)

function sortByDate(list) {
    list.tasks = list.tasks.sort((a, b) => {
        return b.date < a.date ? 1
            : b.date > a.date ? -1
            : 0;
    })
}

function renderAllTasks() {
    let allTaskobject = {id: 1, name: 'all tasks', tasks: []};
    isFilterSelected = 1;
    clearElement(tasksContainer)
    lists.forEach(list => {
        list.tasks.forEach(task => {
            allTaskobject.tasks.push(task);
        });
        
    })

    sortByDate(allTaskobject);
    allTaskobject.tasks.forEach(task => {
        listTasks(task)
        let selectedDescription = document.querySelector(`[data-description-task-id = "${task.id}"]`);
        let selectedTaskList = document.querySelector(`[data-task-id-div = "${task.id}"]`);
        if (selectedDescription !== null) {   
            task.complete === false ? selectedTaskList.classList.remove('scratched') : selectedTaskList.classList.add('scratched');    
            task.complete === false ? selectedDescription.classList.remove('scratched') : selectedDescription.classList.add('scratched');
        }
        selectedList = lists.find(list => list.id === task.ListId);
        selectedTaskList.innerText = '-' + selectedList.name;
    });
    
    let incomplete = allTaskobject.tasks.filter(task => !task.complete).length;
    const taskString = incomplete === 1 ? 'task' : 'tasks';
    incomplete === 0 ? incomplete = 'No' : false;
    listCount.innerText = `${incomplete} incomplete ${taskString}`; 

    allTasksFilter.classList.add('selected');
    listTitle.innerText = 'All Tasks';
    unselectLists();
    hideButtons();
    save();
}

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
        isFilterSelected === 1 ? renderAllTasks() : tasksCounter(selectedList);
        renderBadges();
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
            selectedListId = e.target.dataset.listId;
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
    editTaskTitle.value.trim() === '' ? false : selectedTask.name = editTaskTitle.value;
    clearElement(tasksContainer);
    isFilterSelected === 1 ? renderAllTasks() : renderTasks(selectedList);
    save();
})

listContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'li') {
        isFilterSelected = 0;
        selectedListId = e.target.id;
        unselectFilters();
        selectList();
        showList();
        clearElement(tasksContainer);
        renderTasks(selectedList);
        scratchDescription();
        showButtons();
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
        renderBadges();
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
    localStorage.setItem(LOCAL_STORAGE_ISFILTERSELECTED, isFilterSelected);
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
    switch(isFilterSelected) {
        case 0:
            loadPageOnList();
            break;
        case 1:
            loadPageOnAllTasks();
            break;
            
    }
}

function loadPageOnAllTasks() {
    renderAllTasks();
    lists.forEach(addList)
    renderBadges();
}

function loadPageOnList() {
    selectedList = lists.find(list => list.id === selectedListId);
    showButtons();
    lists.forEach(addList)
    renderTasks(selectedList);
    tasksCounter(selectedList);
    showList();
    selectList();
    renderBadges();
    scratchDescription();
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
    sortByDate(selectedList);
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
    const listTitleDiv = taskElement.querySelector('.list-title');
    listTitleDiv.dataset.taskIdDiv = task.id;
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
}

function renderBadges() {
    lists.forEach(list => {
        selectedListId = list.id;
        let incomplete = list.tasks.filter(task => !task.complete).length;
        const badgeElement = document.querySelector(`[data-sel-id="${selectedListId}"]`);
        incomplete > 0 ?  badgeElement.innerText = `${incomplete}` : badgeElement.innerText = '0';
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
    renderAllTasks();
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