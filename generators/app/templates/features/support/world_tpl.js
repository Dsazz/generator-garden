var {defineSupportCode} = require('cucumber');

var Garden = require(require.resolve('plus.garden')).Garden;
var garden = new Garden().init();
var config = garden.get('config');

function World() {
    this.garden = garden;
    this.config = config;

    <% if (includeWebdriver) { %>
    garden.get('Webdriver.Browser').create(function (browserService) {
        this.browserService = browserService;
        this.driver = browserService.driver;
        this.browser = browserService.browser;
    }.bind(this));<% } %>
    <% if (includeApiTester) { %>
    this.api = garden.get('ApiTester');<% } %>
};

defineSupportCode(function({Given, Then, setWorldConstructor, setDefaultTimeout}) {
    setWorldConstructor(World);
    <% if (includeWebdriver) { %>
    setDefaultTimeout(config.get('cucumber:timeout'));<% } %>
});

