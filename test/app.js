'use strict';
var fs = require('fs-extra');
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');


describe('generator-garden:app', function () {
    var testProjectRoot = path.join(__dirname, 'temp');

    beforeEach(function (done) {
        this.npmInstallCalls = [];

        helpers.testDirectory(testProjectRoot, function (err) {
            if (err) {
                done(err);
                return;
            }

            this.app = helpers.createGenerator('garden:app', [
                '../../generators/app'
            ]);

            /* Mock bower install and track the function calls. */
            this.app.npmInstall = function () {
                this.npmInstallCalls.push(arguments);
            }.bind(this);

            /* Change project root path to test dir */
            this.app.destinationRoot(testProjectRoot);

            /* create dummy package.json for working generator */
            fs.copySync(
                this.app.templatePath('_package.json'),
                this.app.destinationPath('package.json')
            );

            done();
        }.bind(this));
    });

    after(function (done) {
        /* clear temp directory after all tests */
        fs.removeSync(this.app.destinationPath());
        done();
    });

    it('creates test package.json', function (done) {
        assert.file([this.app.destinationPath('package.json')]);
        done();
    });

    it('should add garden package', function (done) {
        helpers.mockPrompt(this.app, {
            drivers: ['webdriver']
        });
        this.app.run(function () {
            assert.equal(
                'plus.garden@github:dsazz/plus.garden',
                this.npmInstallCalls[1][0]
            );

            done();
        }.bind(this));
    });

    it('should add webdriver dependencies', function (done) {
        helpers.mockPrompt(this.app, {
            drivers: ['webdriver']
        });

        this.app.run(function () {
            assert.equal(
                'plus.garden.webdriver@github:dsazz/plus.garden.webdriver',
                this.npmInstallCalls[2][0]
            );

            done();
        }.bind(this));
    });

    it('should init default webdriver env', function (done) {
        helpers.mockPrompt(this.app, {
            drivers: ['webdriver']
        });

        this.app.run(function () {
            assert.file([
                'features/Health.feature',
                'features/step_definitions/common.js',
                'features/support/hooks.js',
                'features/support/world.js'
            ]);
            /** File container.js should contain Webdriver */
            assert.fileContent(
                this.app.destinationPath('container.js'),
                /container\.register\(\'Webdriver\', require\(\'plus\.garden\.webdriver\'\)\)/
            );

            /** File world.js should contain initialization of WebdriverBrowser */
            assert.fileContent(
                this.app.destinationPath('features/support/world.js'),
                /garden\.get\(\'Webdriver\.Browser\'\)\.create\(function \(browserService\) \{/
            );
            /** File world.js should contain setuping of default timeout */
            assert.fileContent(
                this.app.destinationPath('features/support/world.js'),
                /setDefaultTimeout\(config\.get\(\'webdriver:waitTimeout\'\)\)/
            );

            done();
        }.bind(this));
    });

    it('should show correct hints by webdriver', function (done) {
        helpers.mockPrompt(this.app, {
            drivers: ['webdriver']
        });

        this.app.run(function () {
            assert.textEqual(this.app._generateHintsText(), this.app._getWebdriverHintText())

            done();
        }.bind(this));
    })
});
