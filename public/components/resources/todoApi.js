(function() {
    "use strict";

    angular.module("todoApp.todoApi", ["ngResource"])

    .factory("TodoApi", ["$resource", function($resource) {
        return $resource("/api/todo/", {}, {
            "update": {
                method: "PUT"
            },
            "delete": {
                url: "/api/todo/:id",
                method: "DELETE"
            }
        });
    }]);
}());
