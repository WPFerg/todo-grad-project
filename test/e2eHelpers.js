var express = require("express");
var createServer = require("../server/server");
var webdriver = require("selenium-webdriver");
var istanbul = require("istanbul");
var path = require("path");
var fs = require("fs");

var testPort = 52684;
var baseUrl = "http://localhost:" + testPort;
var instrumenter = new istanbul.Instrumenter();
var collector = new istanbul.Collector();
var gatheringCoverage = process.env.running_under_istanbul;
var coverageFilename = "build_artifacts/coverage-e2e.json";

var driver;
var router;
var server;

module.exports.setupDriver = function() {
    driver = new webdriver.Builder().forBrowser("chrome").build();
};

module.exports.setupServer = function(done) {
    router = express.Router();
    if (gatheringCoverage) {
        router.get("/app.js", function(req, res) {
            var absPath = path.join(__dirname, "..", "public", req.path);
            res.send(instrumenter.instrumentSync(fs.readFileSync("public/" + req.path, "utf8"), absPath));
        });

        router.get("/todoListView", function(req, res) {
            var absPath = path.join(__dirname, "..", "public", req.path);
            res.send(instrumenter.instrumentSync(fs.readFileSync("public/" + req.path, "utf8"), absPath));
        });

        router.get("/view2", function(req, res) {
            var absPath = path.join(__dirname, "..", "public", req.path);
            res.send(instrumenter.instrumentSync(fs.readFileSync("public/" + req.path, "utf8"), absPath));
        });
    }
    server = createServer(testPort, router, done);
};

module.exports.teardownServer = function(done) {
    server.close(done);
};

module.exports.teardownDriver = function() {
    if (gatheringCoverage) {
        driver.executeScript("return __coverage__;").then(function (coverage) {
            collector.add(coverage);
        });
    }
    driver.quit();
};

module.exports.reportCoverage = function() {
    if (gatheringCoverage) {
        fs.writeFileSync(coverageFilename, JSON.stringify(collector.getFinalCoverage()), "utf8");
    }
};

module.exports.navigateToSite = function() {
    driver.get(baseUrl);
};

module.exports.getTitleText = function() {
    return driver.findElement(webdriver.By.css("h1")).getText();
};

module.exports.getInputText = function() {
    return driver.findElement(webdriver.By.id("new-todo")).getAttribute("value");
};

module.exports.getErrorText = function() {
    var errorElement = driver.findElement(webdriver.By.id("error"));
    driver.wait(webdriver.until.elementTextContains(errorElement, "Failed"), 5000);
    return errorElement.getText();
};

module.exports.getCountText = function() {
    var countElement = driver.findElement(webdriver.By.id("count-label"));
    driver.wait(webdriver.until.elementTextContains(countElement, "There"), 5000);
    return countElement.getText();
};

module.exports.getTodoList = function() {
    var todoListPlaceholder = driver.findElement(webdriver.By.id("todo-list-placeholder"));
    driver.wait(webdriver.until.elementIsNotVisible(todoListPlaceholder), 5000);
    return driver.findElements(webdriver.By.css(".todo-item, .todo-done"));
};

module.exports.waitForListLoad = function() {
    var todoListPlaceholder = driver.findElement(webdriver.By.id("todo-list-placeholder"));
    driver.wait(webdriver.until.elementIsNotVisible(todoListPlaceholder), 5000);
};

module.exports.getTodoDone = function() {
    this.waitForListLoad();
    return driver.findElements(webdriver.By.css(".todo-done"));
};

module.exports.addTodo = function(text) {
    driver.findElement(webdriver.By.id("new-todo")).sendKeys(text);
    driver.findElement(webdriver.By.id("submit-todo")).click();
};

module.exports.deleteTodo = function(id) {
    this.waitForListLoad();
    driver.findElement(webdriver.By.css(".delete-button[data-id='" + id + "']"))
        .click();
};

module.exports.markDone = function(id) {
    this.waitForListLoad();
    driver.findElement(webdriver.By.css(".mark-done-button[data-id='" + id + "']"))
        .click();
};

module.exports.clearAllDone = function() {
    this.waitForListLoad();
    driver.findElement(webdriver.By.css("#delete-all-done-button")).click();
};

module.exports.setFilter = function(filter) {
    this.waitForListLoad();
    driver.findElement(webdriver.By.css("#view-" + filter + "-button")).click();
};

module.exports.setupErrorRoute = function(action, route) {
    if (action === "get") {
        router.get(route, function(req, res) {
            res.sendStatus(500);
        });
    }
    if (action === "post") {
        router.post(route, function(req, res) {
            res.sendStatus(500);
        });
    }
    if (action === "delete") {
        router.delete(route, function(req, res) {
            res.sendStatus(500);
        });
    }
};
