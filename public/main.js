var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var leftToDo = document.getElementById("count-label");
var viewAllButton = document.getElementById("view-all-button");
var viewActiveButton = document.getElementById("view-active-button");
var viewCompleteButton = document.getElementById("view-complete-button");
var deleteAllDoneButton = document.getElementById("delete-all-done-button");

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

viewAllButton.onclick = setFilters();
viewActiveButton.onclick = setFilters({isCompleted: false});
viewCompleteButton.onclick = setFilters({isCompleted: true});

function createTodo(title, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("POST", "/api/todo");
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify({
        title: title
    }));
    createRequest.onload = function() {
        if (this.status === 201) {
            callback();
        } else {
            error.textContent = "Failed to create item. Server returned " + this.status + " - " + this.responseText;
        }
    };
}

function getTodoList(callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("GET", "/api/todo");
    createRequest.onload = function() {
        if (this.status === 200) {
            callback(JSON.parse(this.responseText));
        } else {
            error.textContent = "Failed to get list. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send();
}

function deleteToDoEvent(event) {
    if (event && event.target) {
        var id = event.target.getAttribute("data-id");
        if (id) {
            deleteToDo(id, reloadTodoList);
        }
    }
}

function deleteToDo(id, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("DELETE", "/api/todo/" + id);
    createRequest.onload = function () {
        if (this.status === 200) {
            if (callback) {
                callback();
            }
        } else {
            error.textContent = "Failed to delete. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send();
}

function markDone(event) {
    if (event && event.target) {
        var id = event.target.getAttribute("data-id");
        if (id) {
            var createRequest = new XMLHttpRequest();
            createRequest.open("PUT", "/api/todo/");
            createRequest.setRequestHeader("Content-type", "application/json");
            createRequest.onload = function () {
                if (this.status === 200) {
                    reloadTodoList();
                } else {
                    error.textContent = "Failed to mark done. " +
                        "Server returned " + this.status + " - " + this.responseText;
                }
            };
            createRequest.send(JSON.stringify({
                isCompleted: true,
                "id": id
            }));
        }
    }
}

function clearDone(data) {
    return function() {
        data.forEach(function(todo) {
            if (todo.isCompleted) {
                deleteToDo(todo.id);
            }
        });
        reloadTodoList();
    };
}

function reloadTodoList(filters) {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    deleteAllDoneButton.style.display = "none";
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";
        var itemsLeftToDo = 0;
        var itemsDone = 0;

        todos.forEach(function(todo) {
            var displayItem = true;
            var listItem;
            var deleteButton;
            if (filters) {
                var keys = Object.keys(filters);
                keys.forEach(function(key) {
                    if (filters[key] !== todo[key]) {
                        displayItem = false;
                    }
                });
            }

            if (displayItem) {
                listItem = document.createElement("li");
                listItem.textContent = todo.title;
                if (todo.isCompleted) {
                    listItem.className = "todo-done";
                }

                deleteButton = document.createElement("button");
                deleteButton.className = "delete-button";
                deleteButton.textContent = "Delete";
                deleteButton.setAttribute("data-id", todo.id);
                deleteButton.onclick = deleteToDoEvent;
            }

            if (!todo.isCompleted) {
                if (displayItem) {
                    var markDoneButton = document.createElement("button");
                    markDoneButton.className = "mark-done-button";
                    markDoneButton.textContent = "Mark Done";
                    markDoneButton.setAttribute("data-id", todo.id);
                    markDoneButton.onclick = markDone;

                    listItem.appendChild(markDoneButton);
                }
                itemsLeftToDo++;
            } else {
                itemsDone++;
            }

            if (displayItem) {
                listItem.appendChild(deleteButton);
                todoList.appendChild(listItem);
            }
        });

        leftToDo.textContent = "There " +
            (itemsLeftToDo === 1 ? "is" : "are") +
            " " + itemsLeftToDo + " thing" +
            (itemsLeftToDo === 1 ? "" : "s") +
            " left to do";

        if (itemsDone > 0) {
            deleteAllDoneButton.onclick = clearDone(todos);
            deleteAllDoneButton.style.display = "inline-block";
        }
    });
}

function setFilters(filters) {
    return function() {
        reloadTodoList(filters);
    };
}

reloadTodoList();
