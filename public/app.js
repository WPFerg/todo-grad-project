(function() {
    "use strict";

    // Declare app level module which depends on views, and components
    angular.module("todoApp", [
        "ngRoute",
        "todoApp.todoListView"
    ]).
    config(["$routeProvider", function ($routeProvider) {
        $routeProvider.otherwise({redirectTo: "/"});
    }]);
}());
