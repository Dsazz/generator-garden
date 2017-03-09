/* =================================================================================
 * @author Slava Hatnuke
 * =================================================================================
 * Copyright (c) 2015 Rakuten Marketing
 * Licensed under MIT (https://github.com/linkshare/plus.garden/blob/master/LICENSE)
 * ============================================================================== */

 module.exports = function (container) {
    <% if (includeWebdriver) { %>
    container.register('Webdriver', require('plus.garden.webdriver'));
    <% } %>

    <% if (includeApiTester) { %>
    container.register('ApiModule', require('plus.garden.api'));
    <% } %>
}
