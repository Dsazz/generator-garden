/* =================================================================================
 * @author Stepanenko Stanislav <dev.stanislav.stepanenko@gmail.com>
 * =================================================================================
 * Copyright (c) 2017 Rakuten Marketing
 * Licensed under MIT (https://github.com/dsazz/generator-garden/blob/master/LICENSE)
 * ============================================================================== */

 module.exports = function (container) {
    <% if (includeWebdriver) { %>
    container.register('Webdriver', require('plus.garden.webdriver'));<% } %>
    <% if (includeApiTester) { %>
    container.register('ApiModule', require('plus.garden.api'));<% } %>
    <% if (includeFixturesMongo) { %>
    container.register('MongoFixtureLoaderModule', require('plus.garden.fixtures-mongo'));<% } %>
    <% if (includeFixturesMysql) { %>
    container.register('MysqlFixtureLoaderModule', require('plus.garden.fixtures-mysql'));<% } %>
    <% if (includeFixturesDocker) { %>
    container.register('DockerComposeFixturesModule', require('plus.garden.fixtures.docker-compose'));<% } %>
}
