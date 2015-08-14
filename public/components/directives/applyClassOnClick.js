(function() {
    "use strict";

    angular.module("todoApp.applyClassOnClick", [])

        .directive("applyClassOnClick", [function() {
            return {
                restrict: "A",
                scope: {
                    classToApply: "@applyClassOnClick"
                },
                link: function(scope, element, attrs) {
                    element.on("click", function() {
                        element.toggleClass(scope.classToApply);
                    });
                }
            };
        }]);
}());
