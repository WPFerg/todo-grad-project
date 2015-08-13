(function() {
    "use strict";

    angular.module("todoApp.todoListView", ["ngRoute"])

    .config(["$routeProvider", function ($routeProvider) {
        $routeProvider.when("/", {
            templateUrl: "todoListView/todoListView.html",
            controller: "TodoListView"
        });
    }])

    .controller("TodoListView", ["$scope", "$http", function ($scope, $http) {
        // Bound models
        $scope.todoToCreate = "";

        // Feedbacks
        $scope.isLoading = false;
        $scope.loadingOverride = false;
        $scope.errorText = "";

        // To do items
        $scope.todos = [];
        $scope.itemsDone = 0;
        $scope.itemsLeftToDo = 0;
        $scope.appliedFilters = {};

        $scope.createTodo = function () {
            var title = $scope.todoToCreate;
            $scope.todoToCreate = "";
            $http.post("/api/todo", {title: title}).then(function (response) {
                $scope.reloadTodos();
            }, function (error) {
                $scope.errorText = "Failed to create item. Server returned " + error.status + " - " +
                    error.statusText;
            });
        };

        $scope.reloadTodos = function () {
            $scope.isLoading = true;

            $http.get("/api/todo").then(function (response) {
                $scope.isLoading = false;
                $scope.todos = response.data;
                $scope.$recalculateItemNumbers();
            }, function (error) {
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
            $scope.$modifyToDo(todo, function () {
                $scope.reloadTodos();
            });
        };

        $scope.$modifyToDo = function (todoData, callback) {
            $http.put("/api/todo", todoData).then(function (response) {
                if (callback) {
                    callback(response);
                }
            }, function (error) {
                $scope.errorText = "Failed to mark done. " +
                    "Server returned " + error.status + " - " + error.statusText;
            });
        };

        $scope.deleteTodoButton = function (todo) {
            $scope.$deleteTodo(todo.id, $scope.reloadTodos);
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
            $http.delete("/api/todo/" + id).then(function (response) {
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
