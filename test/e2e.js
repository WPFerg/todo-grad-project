var testing = require("selenium-webdriver/testing");
var assert = require("chai").assert;
var helpers = require("./e2eHelpers");

testing.describe("end to end", function() {
    this.timeout(20000);
    testing.before(helpers.setupDriver);
    testing.beforeEach(helpers.setupServer);
    testing.afterEach(helpers.teardownServer);
    testing.after(function() {
        helpers.teardownDriver();
        helpers.reportCoverage();
    });

    testing.describe("on page load", function() {
        testing.it("displays TODO title", function() {
            helpers.navigateToSite();
            helpers.getTitleText().then(function(text) {
                assert.equal(text, "TODO List");
            });
        });
        testing.it("displays empty TODO list", function() {
            helpers.navigateToSite();
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute("get", "/api/todo");
            helpers.navigateToSite();
            helpers.getErrorText().then(function(text) {
                assert.equal(text, "Failed to get list. Server returned 500 - Internal Server Error");
            });
        });
    });
    testing.describe("on create todo item", function() {
        testing.it("clears the input field", function () {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.getInputText().then(function (value) {
                assert.equal(value, "");
            });
        });
        testing.it("adds the todo item to the list", function () {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.getTodoList().then(function (elements) {
                assert.equal(elements.length, 1);
            });
        });
        testing.it("displays an error if the request fails", function () {
            helpers.setupErrorRoute("post", "/api/todo");
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.getErrorText().then(function (text) {
                assert.equal(text, "Failed to create item. Server returned 500 - Internal Server Error");
            });
        });
        testing.it("can be done multiple times", function () {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.addTodo("Another new todo item");
            helpers.getTodoList().then(function (elements) {
                assert.equal(elements.length, 2);
            });
        });
    });
    testing.describe("on delete todo item", function() {
        testing.it("can delete items from the server", function() {
            helpers.navigateToSite();
            helpers.addTodo("Hello!");
            helpers.navigateToSite();
            helpers.deleteTodo(0);
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });
        testing.it("can delete multiple items", function() {
            helpers.navigateToSite();
            helpers.addTodo("Hello!");
            helpers.addTodo("Hello again!");
            helpers.deleteTodo(0);
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 1);
            });
        });
        testing.it("should display an error message if deletion fails", function() {
            helpers.setupErrorRoute("delete", "/api/todo/0");
            helpers.navigateToSite();
            helpers.addTodo("Hello!");
            helpers.deleteTodo(0);

            helpers.getErrorText().then(function (text) {
                assert.equal(text, "Failed to delete. Server returned 500 - Internal Server Error");
            });
        });
    });
    testing.describe("marking done", function() {
        testing.it("should mark an item done", function() {
            helpers.navigateToSite();
            helpers.addTodo("Hello!");
            helpers.markDone(0);
            helpers.navigateToSite();
            helpers.getTodoDone().then(function(elements) {
                assert.equal(elements.length, 1);
            });
        });
    });
    testing.describe("left to do text", function() {
        testing.it("should display 0 things left to do initially", function() {
            helpers.navigateToSite();
            helpers.getCountText().then(function(text) {
                assert.equal(text, "There are 0 things left to do");
            });
        });

        testing.it("should display the number of items left to do", function() {
            helpers.navigateToSite();
            helpers.addTodo("Hello!");
            helpers.getCountText().then(function(text) {
                assert.equal(text, "There is 1 thing left to do");
            });
        });

        testing.it("should exclude the number of items done", function() {
            helpers.navigateToSite();
            helpers.addTodo("Hello!");
            helpers.markDone(0);
            helpers.getCountText().then(function(text) {
                assert.equal(text, "There are 0 things left to do");
            });
        });
    });
    testing.describe("delete completed", function() {
        testing.it("should delete all completed items", function() {
            helpers.navigateToSite();
            helpers.addTodo("Hello!");
            helpers.markDone(0);

            helpers.clearAllDone();
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });

        testing.it("should leave all uncompleted items", function() {
            helpers.navigateToSite();
            helpers.addTodo("Hello!");
            helpers.addTodo("Hello again!");
            helpers.addTodo("Hello a third time!");
            helpers.markDone(0);

            helpers.clearAllDone();
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 2);
            });
        });

    });
});

