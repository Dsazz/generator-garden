var {defineSupportCode} = require('cucumber');
defineSupportCode(function({ When, Then }) {
    When(/^I make GET request to "([^"]*)"$/, function(url, callback) {
        this.api.get(url).then(callback);
    });

    Then(/^the status code should be (\d+)$/, function(statusCode, callback) {
        this.api.assertStatus(statusCode).then(callback);
    });

    Then(/^content type should be "([^"]*)"$/, function(contentType, callback) {
        this.api.assertContentType(contentType).then(callback);
    });

    Then(/^the JSON response should be:$/, function(string, callback) {
        this.api.assertJSON(JSON.parse(string)).then(callback);
    });
});
