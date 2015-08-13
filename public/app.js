(function() {
    "use strict";

    // Declare app level module which depends on views, and components
    angular.module("todoApp", [
        "ngRoute",
        "ngResource",
        "todoApp.todoListView",
        "todoApp.todoApi"
    ]).
    config(["$routeProvider", function ($routeProvider) {
        $routeProvider.otherwise({redirectTo: "/"});
    }]);
}());
