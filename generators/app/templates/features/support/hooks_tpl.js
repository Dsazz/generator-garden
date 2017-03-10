var {defineSupportCode} = require('cucumber');
defineSupportCode(function({After, Before}) {
    <% if (includeWebdriver) { %>
    Before("@webdriver.init", function () {
        this.browserService.before();
    });

    After("@webdriver.quit", function (scenarioResult, callback) {
        this.browserService.after(callback);
    });
    <% } %>

    <% if (includeFixturesMongo) { %>
    Before({tags: "@fixtures.drop"}, function (scenarioResult, callback) {
        this.garden.wait.launchFiber(function (scenarioResult, callback) {
            this.garden.get('FixtureLoader').drop();
            callback();
        }.bind(this));
    });

    Before({tags: "@fixtures.load"}, function (scenarioResult, callback) {
        this.garden.wait.launchFiber(function (scenarioResult, callback) {
            this.garden.get('FixtureLoader').reload();
            callback();
        }.bind(this));
    });
    <% } %>
});
