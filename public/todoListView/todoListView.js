(function() {
    "use strict";

    angular.module("todoApp.todoListView", ["ngRoute", "todoApp.todoApi"])

    .config(["$routeProvider", function ($routeProvider) {
        $routeProvider.when("/", {
            templateUrl: "todoListView/todoListView.html",
            controller: "TodoListView"
        });
    }])

    .controller("TodoListView", ["$scope", "$http", "TodoApi", function ($scope, $http, TodoApi) {

        // Bound models
        $scope.todoToCreate = "";

        // Feedbacks
        $scope.isLoading = false;
        $scope.loadingOverride = false;
        $scope.errorText = "";
        $scope.editingItem = null;

        // To do items
        $scope.todos = [];
        $scope.itemsDone = 0;
        $scope.itemsLeftToDo = 0;
        $scope.appliedFilters = {};

        $scope.createTodo = function () {
            var title = $scope.todoToCreate;
            $scope.todoToCreate = "";
            TodoApi.save({title: title}, function () {
                $scope.reloadTodos();
            }, function (error) {
                $scope.errorText = "Failed to create item. Server returned " + error.status + " - " +
                    error.statusText;
            });
        };

        $scope.reloadTodos = function () {
            $scope.isLoading = true;

            $scope.todos = TodoApi.query({}, function() {
                $scope.isLoading = false;
                $scope.$recalculateItemNumbers();
            }, function(error) {
                $scope.errorText = "Failed to get list. Server returned " + error.status + " - " +
                    error.statusText;
                $scope.isLoading = false;
            });
        };

        $scope.$recalculateItemNumbers = function() {
            $scope.itemsLeftToDo = $scope.todos.filter(function(item) {
                return !item.isCompleted;
            }).length;

            $scope.itemsDone = $scope.todos.filter(function(item) {
                return item.isCompleted;
            }).length;
        };

        $scope.markDone = function (todo) {
            todo.isCompleted = true;
            $scope.$modifyTodo(todo, $scope.reloadTodos);
        };

        $scope.editMode = function(todo) {
            $scope.editingItem = todo;
        };

        $scope.finishedEditing = function (todo) {
            todo.isCompleted = false;
            $scope.editMode(null);
            $scope.$modifyTodo(todo, $scope.reloadTodos);
        };

        $scope.$modifyTodo = function (todoData, callback) {
            TodoApi.update(todoData, function (response) {
                if (callback) {
                    callback(response);
                }
            }, function (error) {
                $scope.errorText = "Failed to mark done. " +
                    "Server returned " + error.status + " - " + error.statusText;
            });
        };

        $scope.deleteTodoButton = function (todo) {
            $scope.$deleteTodo(todo.id, function() {
                $scope.todos = $scope.todos.filter(function(otherTodo) {
                    return todo !== otherTodo;
                });
            });
        };

        $scope.deleteAllDone = function () {
            var done = $scope.todos.filter(function (todo) {
                return todo.isCompleted;
            });

            var numberDeleted = 0;
            done.forEach(function (todo) {
                $scope.$deleteTodo(todo.id, function () {
                    numberDeleted++;

                    if (numberDeleted === done.length) {
                        $scope.reloadTodos();
                    }
                });
            });
        };

        $scope.$deleteTodo = function (id, callback) {
            TodoApi.delete({id: id}, function () {
                if (callback) {
                    callback();
                }
            }, function (error) {
                $scope.errorText = "Failed to delete. Server returned " + error.status + " - " +
                    error.statusText;
            });
        };

        $scope.toggleLoadSpinner = function () {
            $scope.loadingOverride = !$scope.loadingOverride;
        };

        $scope.resetFilters = function () {
            $scope.appliedFilters = {};
        };

        $scope.setFilter = function(key, value) {
            $scope.appliedFilters[key] = value;
        };

        $scope.reloadTodos();
    }]);
}());
