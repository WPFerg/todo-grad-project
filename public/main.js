var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

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

function deleteToDo(event) {
    if (event && event.target) {
        var id = event.target.getAttribute("data-id");
        if (id) {
            var createRequest = new XMLHttpRequest();
            createRequest.open("DELETE", "/api/todo/" + id);
            createRequest.onload = function () {
                if (this.status === 200) {
                    reloadTodoList();
                } else {
                    error.textContent = "Failed to delete. Server returned " + this.status + " - " + this.responseText;
                }
            };
            createRequest.send();
        }
    }
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

function reloadTodoList() {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";
        todos.forEach(function(todo) {
            var listItem = document.createElement("li");
            listItem.textContent = todo.title;
            if (todo.isCompleted) {
                listItem.className = "todo-done";
            }

            var deleteButton = document.createElement("button");
            deleteButton.className = "delete-button";
            deleteButton.textContent = "Delete";
            deleteButton.setAttribute("data-id", todo.id);
            deleteButton.onclick = deleteToDo;

            if (!todo.isCompleted) {
                var markDoneButton = document.createElement("button");
                markDoneButton.className = "mark-done-button";
                markDoneButton.textContent = "Mark Done";
                markDoneButton.setAttribute("data-id", todo.id);
                markDoneButton.onclick = markDone;

                listItem.appendChild(markDoneButton);
            }

            listItem.appendChild(deleteButton);
            todoList.appendChild(listItem);
        });
    });
}

reloadTodoList();
