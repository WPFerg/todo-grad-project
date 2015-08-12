var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var headerSection = document.getElementById("header-section");
var error = document.getElementById("error");
var leftToDo = document.getElementById("count-label");
var viewAllButton = document.getElementById("view-all-button");
var viewActiveButton = document.getElementById("view-active-button");
var viewCompleteButton = document.getElementById("view-complete-button");
var viewSpinnerButton = document.getElementById("view-spinner-button");
var deleteAllDoneButton = document.getElementById("delete-all-done-button");
var markDoneBox = document.getElementById("mark-done-box");
var currentFilters = {};

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

viewAllButton.onclick = setFilters({});
viewActiveButton.onclick = setFilters({isCompleted: false});
viewCompleteButton.onclick = setFilters({isCompleted: true});

viewSpinnerButton.onclick = function() {
    if (todoListPlaceholder.getAttribute("data-override") !== "true") {
        todoListPlaceholder.style.display = "block";
        todoListPlaceholder.setAttribute("data-override", "true");
        viewSpinnerButton.innerHTML = "Hide OneDiv&trade; Spinner";
    } else {
        todoListPlaceholder.style.display = "none";
        viewSpinnerButton.innerHTML = "Show OneDiv&trade; Spinner";
        todoListPlaceholder.setAttribute("data-override", "false");
    }
};

function createTodo(title, callback) {
    fetch("/api/todo", {
        method: "post",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({title: title})
    }).then(function (response) {
        if (response.status === 201) {
            callback();
        } else {
            error.textContent = "Failed to create item. Server returned " + response.status + " - " +
                response.statusText;
        }
    });
}

function getTodoList(callback) {
    fetch("/api/todo").then(function(response) {
        if (response.status === 200) {

            response.json().then(function(data) {
                callback(data);
            });
        } else {
            error.textContent = "Failed to get list. Server returned " + response.status + " - " +
                response.statusText;
        }
    });
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
    fetch("/api/todo/" + id, {
        method: "DELETE"
    }).then(function(response) {
        if (response.status === 200) {
            if (callback) {
                callback();
            }
        } else {
            error.textContent = "Failed to delete. Server returned " + response.status + " - " +
                response.statusText;
        }
    });
}

function markDone(event) {
    if (event && event.target) {
        var id = event.target.getAttribute("data-id");
        if (id) {

            fetch("/api/todo", {
                method: "PUT",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    isCompleted: true,
                    id: id
                })
            }).then(function(response) {
                if (response.status === 200) {
                    reloadTodoList();
                } else {
                    error.textContent = "Failed to mark done. " +
                        "Server returned " + response.status + " - " + response.statusText;
                }
            });
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

function reloadTodoList(filters, callback) {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    deleteAllDoneButton.style.display = "none";
    markDoneBox.className = "";
    headerSection.className = "";
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        if (todoListPlaceholder.getAttribute("data-override") !== "true") {
            todoListPlaceholder.style.display = "none";
        }
        var itemsLeftToDo = 0;
        var itemsDone = 0;

        todos.forEach(function(todo) {
            var displayItem = true;
            var listItem;
            var deleteButton;
            var markDoneButton;
            if (typeof filters !== "undefined") {
                currentFilters = filters;
                filters = currentFilters;
                var keys = Object.keys(filters);
                keys.forEach(function(key) {
                    if (filters[key] !== todo[key]) {
                        displayItem = false;
                    }
                });
            }

            if (displayItem) {
                listItem = document.createElement("div");
                var innerListItem = document.createElement("div");
                innerListItem.textContent = todo.title;
                listItem.appendChild(innerListItem);
                listItem.className = "todo-item";
                if (todo.isCompleted) {
                    listItem.className = "todo-done";
                }

                deleteButton = document.createElement("button");
                deleteButton.className = "delete-button";
                deleteButton.innerHTML = "&#x2717; Delete";
                deleteButton.setAttribute("data-id", todo.id);
                deleteButton.onclick = deleteToDoEvent;

                markDoneButton = document.createElement("button");
                markDoneButton.className = "mark-done-button";
                if(todo.isCompleted) {
                    markDoneButton.innerHTML = "&#10003; Finish" + (todo.isCompleted ? "ed" : "");
                } else {
                    markDoneButton.innerHTML = "&#10003; Finish";
                }
                markDoneButton.setAttribute("data-id", todo.id);
                markDoneButton.onclick = markDone;
            }

            if (!todo.isCompleted) {
                itemsLeftToDo++;
            } else {
                if (displayItem) {
                    markDoneButton.disabled = true;
                }
                itemsDone++;
            }

            if (displayItem) {
                listItem.appendChild(markDoneButton);
                listItem.appendChild(deleteButton);
                todoList.appendChild(listItem);
            }
        });

        leftToDo.textContent = "There " +
            (itemsLeftToDo === 1 ? "is" : "are") +
            " " + itemsLeftToDo + " thing" +
            (itemsLeftToDo === 1 ? "" : "s") +
            " left to do";

        viewAllButton.textContent =
            "View All " + (itemsDone + itemsLeftToDo) + " Task" +
            ((itemsDone + itemsLeftToDo) == 1 ? "" : "s");

        viewActiveButton.textContent =
            "View " + (itemsLeftToDo) + " Task" +
            ((itemsLeftToDo) == 1 ? "" : "s") + " Left to Do";

        viewCompleteButton.textContent =
            "View " + (itemsDone) + " Completed Task" +
            ((itemsDone) == 1 ? "" : "s");

        if (itemsDone > 0) {
            deleteAllDoneButton.onclick = clearDone(todos);
            deleteAllDoneButton.style.display = "inline-block";

            markDoneBox.className = "delete-button-visible";
            headerSection.className = "delete-button-visible";
        }

        if (callback) {
            callback();
        }
    });
}

function setFilters(filters) {
    return function() {
        reloadTodoList(filters);
    };
}

function pollServer() {
    reloadTodoList(currentFilters, function() {
        setTimeout(pollServer, 10000);
    });
}

pollServer();
