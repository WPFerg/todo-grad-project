var server = require("../server/server");
var request = require("request");
var assert = require("chai").assert;

var testPort = 52684;
var baseUrl = "http://localhost:" + testPort;
var todoListUrl = baseUrl + "/api/todo";

describe("server", function() {
    var serverInstance;
    beforeEach(function() {
        serverInstance = server(testPort);
    });
    afterEach(function() {
        serverInstance.close();
    });
    describe("get list of todos", function() {
        it("responds with status code 200", function(done) {
            request(todoListUrl, function(error, response) {
                assert.equal(response.statusCode, 200);
                done();
            });
        });
        it("responds with a body encoded as JSON in UTF-8", function(done) {
            request(todoListUrl, function(error, response) {
                assert.equal(response.headers["content-type"], "application/json; charset=utf-8");
                done();
            });
        });
        it("responds with a body that is a JSON empty array", function(done) {
            request(todoListUrl, function(error, response, body) {
                assert.equal(body, "[]");
                done();
            });
        });
    });
    describe("create a new todo", function() {
        it("responds with status code 201", function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    title: "This is a TODO item"
                }
            }, function(error, response) {
                assert.equal(response.statusCode, 201);
                done();
            });
        });
        it("responds with the location of the newly added resource", function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    title: "This is a TODO item"
                }
            }, function(error, response) {
                assert.equal(response.headers.location, "/api/todo/0");
                done();
            });
        });
        it("inserts the todo at the end of the list of todos", function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    title: "This is a TODO item"
                }
            }, function() {
                request.get(todoListUrl, function(error, response, body) {
                    assert.deepEqual(JSON.parse(body), [{
                        title: "This is a TODO item",
                        id: "0",
                        isCompleted: false
                    }]);
                    done();
                });
            });
        });
    });
    describe("delete a todo", function() {
        it("responds with status code 404 if there is no such item", function(done) {
            request.del(todoListUrl + "/0", function(error, response) {
                assert.equal(response.statusCode, 404);
                done();
            });
        });
        it("responds with status code 200", function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    title: "This is a TODO item"
                }
            }, function() {
                request.del(todoListUrl + "/0", function(error, response) {
                    assert.equal(response.statusCode, 200);
                    done();
                });
            });
        });
        it("removes the item from the list of todos", function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    title: "This is a TODO item"
                }
            }, function() {
                request.del(todoListUrl + "/0", function() {
                    request.get(todoListUrl, function(error, response, body) {
                        assert.deepEqual(JSON.parse(body), []);
                        done();
                    });
                });
            });
        });
    });
    describe("update todos", function() {

        beforeEach(function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    title: "This is a TODO item"
                }
            }, function() {
                done();
            });
        });

        it("should edit a todo's title if it exists", function(done) {
            request.put({
                url: todoListUrl,
                json: {
                    id: "0",
                    title: "This is another todo item"
                }
            }, function() {
                request.get(todoListUrl, function(error, response, body) {
                    assert.deepEqual(JSON.parse(body)[0], {
                        id: "0",
                        title: "This is another todo item",
                        isCompleted: false
                    });
                    done();
                });
            });
        });

        it("should edit a todo's isCompleted if it exists", function(done) {
            request.put({
                url: todoListUrl,
                json: {
                    id: "0",
                    isCompleted: true
                }
            }, function() {
                request.get(todoListUrl, function(error, response, body) {
                    assert.deepEqual(JSON.parse(body)[0], {
                        id: "0",
                        title: "This is a TODO item",
                        isCompleted: true
                    });
                    done();
                });
            });
        });

        it("should edit a todo's isCompleted & title if it exists", function(done) {
            request.put({
                url: todoListUrl,
                json: {
                    id: "0",
                    title: "This is an update",
                    isCompleted: true
                }
            }, function() {
                request.get(todoListUrl, function(error, response, body) {
                    assert.deepEqual(JSON.parse(body)[0], {
                        id: "0",
                        title: "This is an update",
                        isCompleted: true
                    });
                    done();
                });
            });
        });

        it("should create a todo if it doesn't already exist", function(done) {
            request.put({
                url: todoListUrl,
                json: {
                    title: "This is another todo item"
                }
            }, function() {
                request.get(todoListUrl, function(error, response, body) {
                    assert.equal(JSON.parse(body).length, 2);
                    done();
                });
            });
        });

        it("should fail if there's no body in the request", function(done) {
            request.put({
                url: todoListUrl,
                json: {}
            }, function(error, response) {
                assert.equal(response.statusCode, 404);
                done();
            });
        });
    });
});
