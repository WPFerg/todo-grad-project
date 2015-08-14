(function() {
    "use strict";

    // Declare app level module which depends on views, and components
    angular.module("todoApp", [
        "ngRoute",
        "ngResource",
        "ngAnimate",
        "todoApp.todoListView",
        "todoApp.todoApi",
        "todoApp.applyClassOnClick"
    ]).
    config(["$routeProvider", function ($routeProvider) {
        $routeProvider.otherwise({redirectTo: "/"});
    }]);
}());
