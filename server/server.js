var express = require("express");
var bodyParser = require("body-parser");
var _ = require("underscore");

module.exports = function(port, middleware, callback) {
    var app = express();

    if (middleware) {
        app.use(middleware);
    }
    app.use(express.static("public"));
    app.use(bodyParser.json());

    var latestId = 0;
    var todos = [];

    // Create
    app.post("/api/todo", function(req, res) {
        var todo = req.body;
        todo.id = latestId.toString();
        todo.isCompleted = false;
        latestId++;
        todos.push(todo);
        res.set("Location", "/api/todo/" + todo.id);
        res.sendStatus(201);
    });

    // Update
    app.put("/api/todo", function(req, res) {
        var update = req.body;
        if (update && (typeof update.title !== "undefined" ||
            typeof update.isCompleted !== "undefined")) {
            var id = update.id;
            var todoItem = getTodo(id);

            if (todoItem) {
                todoItem.title = update.title || todoItem.title;
                todoItem.isCompleted = update.isCompleted || todoItem.isCompleted;
                res.sendStatus(200);
            } else {
                // Force an update of the ID to avoid collisions
                update.id = latestId;
                latestId++;
                update.isCompleted = update.isCompleted || false;
                todos.push(update);
                res.sendStatus(201);
            }
        } else {
            res.sendStatus(404);
        }
    });

    // Read
    app.get("/api/todo", function(req, res) {
        res.json(todos);
    });

    // Delete
    app.delete("/api/todo/:id", function(req, res) {
        var id = req.params.id;
        var todo = getTodo(id);
        if (todo) {
            todos = todos.filter(function(otherTodo) {
                return otherTodo !== todo;
            });
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    });

    function getTodo(id) {
        return _.find(todos, function(todo) {
            return todo.id === id;
        });
    }

    var server = app.listen(port, callback);

    // We manually manage the connections to ensure that they're closed when calling close().
    var connections = [];
    server.on("connection", function(connection) {
        connections.push(connection);
    });

    return {
        close: function(callback) {
            connections.forEach(function(connection) {
                connection.destroy();
            });
            server.close(callback);
        }
    };
};
