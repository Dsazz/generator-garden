/* =================================================================================
 * @author Stepanenko Stanislav <dev.stanislav.stepanenko@gmail.com>
 * =================================================================================
 * Copyright (c) 2017 Rakuten Marketing
 * Licensed under MIT (https://github.com/dsazz/generator-garden/blob/master/LICENSE)
 * ============================================================================== */

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

            done();
        }.bind(this));
    });

    after(function (done) {
        /* clear temp directory after all tests */
        fs.removeSync(this.app.destinationPath());
        done();
    });

    it('creates default package.json if it not exists', function (done) {
        helpers.mockPrompt(this.app, {
            drivers: ['webdriver']
        });
        this.app.run(function () {
            assert.file(['package.json']);
            assert.JSONFileContent(
                this.app.destinationPath('package.json'),
                {
                    "name": "generator-garden",
                    "version": "0.1.0",
                    "description": "Test package.json",
                    "author": {
                        "name": "Garden User",
                        "email": "garden@awesome.com",
                        "url": ""
                    },
                    "license": "MIT"
                }
            );

            done();
        }.bind(this));
    });

    it('creates default .gitignore if it not exists', function (done) {
        helpers.mockPrompt(this.app, {
            drivers: ['webdriver']
        });
        this.app.run(function () {
            assert.file(['.gitignore']);
            assert.fileContent(
                this.app.destinationPath('.gitignore'),
                /\/config\/parameters\.json/
            );

            done();
        }.bind(this));
    });

    it('should add garden package and files', function (done) {
        helpers.mockPrompt(this.app, {
            drivers: ['webdriver']
        });
        this.app.run(function () {
            assert.file([
                'container.js',
                'garden.js',
                'parameters.json',
                'config.json'
            ]);

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
                /container\.register\('Webdriver', require\('plus\.garden\.webdriver'\)\)/
            );

            /** File world.js should contain initialization of WebdriverBrowser */
            assert.fileContent(
                this.app.destinationPath('features/support/world.js'),
                /garden\.get\('Webdriver\.Browser'\)\.create\(function \(browserService\) \{/
            );
            /** File world.js should contain setuping of default timeout */
            assert.fileContent(
                this.app.destinationPath('features/support/world.js'),
                /setDefaultTimeout\(config\.get\('cucumber:timeout'\)\)/
            );

            /** File hooks.js should contain hooks related to Webdriver */
            assert.fileContent(
                this.app.destinationPath('features/support/hooks.js'),
                /this\.browserService\.before\(\)/
            );

            /** File config.json should contain config for Webdriver */
            assert.JSONFileContent(
                this.app.destinationPath('config.json'),
                {

                    "webdriver": {

                        "server_host": "localhost",
                        "server_port": 4444,

                        "browser": "chrome",
                        "profile_name": "default",

                        "screen_resolution": "1280x1024",
                        "waitTimeout": 7000,

                        "capabilities": {
                            "phantomjs": {
                                "browserName": "phantomjs",
                                "phantomjs.cli.args": ["--ignore-ssl-errors=yes"]
                            },
                            "chrome": {
                                "browserName": "chrome",
                                "acceptSslCerts": true,
                                "chromeOptions": {
                                    "args": ["--test-type"]
                                }
                            },
                            "firefox": {
                                "browserName": "firefox"
                            }
                        }
                    }
                }
            );

            done();
        }.bind(this));
    });

    it('should init docker-compose.yml for webdriver env', function (done) {
        helpers.mockPrompt(this.app, {
            drivers: ['webdriver', 'webdriver_docker_file_init']
        });

        this.app.run(function () {
            assert.file([
                'docker-compose.yml',
                'features/Health.feature',
                'features/step_definitions/common.js',
                'features/support/hooks.js',
                'features/support/world.js'
            ]);

            done();
        });
    });

    it('should show correct hints by webdriver', function (done) {
        helpers.mockPrompt(this.app, {
            drivers: ['webdriver']
        });

        this.app.run(function () {
            assert.textEqual(this.app._generateHintsText(), this.app._getWebdriverHintText())

            done();
        }.bind(this));
    });

    /*************** Separate unit test in the future *************************/

    it('should add ApiTester dependencies', function (done) {
        helpers.mockPrompt(this.app, {
            drivers: ['api_tester']
        });

        this.app.run(function () {
            assert.equal(
                'plus.garden.api',
                this.npmInstallCalls[2][0]
            );

            done();
        }.bind(this));
    });

    it('should init default ApiTester env', function (done) {
        helpers.mockPrompt(this.app, {
            drivers: ['api_tester']
        });

        this.app.run(function () {
            assert.file([
                'features/Api.feature',
                'features/step_definitions/api.js',
                'features/support/hooks.js',
                'features/support/world.js'
            ]);
            /** File container.js should contain ApiTester */
            assert.fileContent(
                this.app.destinationPath('container.js'),
                /container\.register\('ApiModule', require\('plus\.garden\.api'\)\)/
            );

            /** File world.js should contain initialization of ApiTester */
            assert.fileContent(
                this.app.destinationPath('features/support/world.js'),
                /this\.api = garden\.get\('ApiTester'\)/
            );

            /** File hooks.js should not contain hooks related to Webdriver */
            assert.noFileContent(
                this.app.destinationPath('features/support/hooks.js'),
                /this\.browserService\.before\(\)/
            );

            /** File config.json should contain config for ApiTester */
            assert.JSONFileContent(
                this.app.destinationPath('config.json'),
                {
                    "api": {
                        "host": "http://google.com"
                    }
                }
            );

            done();
        }.bind(this));
    });

    it('should show correct hints by ApiTester', function (done) {
        helpers.mockPrompt(this.app, {
            drivers: ['api_tester']
        });

        this.app.run(function () {
            assert.textEqual(this.app._generateHintsText(), this.app._sayGoodbyeText())

            done();
        }.bind(this));
    });

    /*************** Separate unit test in the future *************************/

    it('should add fixtures Mongo dependencies', function (done) {
        helpers.mockPrompt(this.app, {
            drivers: ['fixture_mongo']
        });

        this.app.run(function () {
            assert.equal(
                'plus.garden.fixtures-mongo',
                this.npmInstallCalls[2][0]
            );

            done();
        }.bind(this));
    });

    it('should init default fixtures Mongo env', function (done) {
        helpers.mockPrompt(this.app, {
            drivers: ['fixture_mongo']
        });

        this.app.run(function () {
            assert.file([
                'fixtures/mongo/user.js'
            ]);
            /** File container.js should contain fixtures MongoDb module */
            assert.fileContent(
                this.app.destinationPath('container.js'),
                /container\.register\('MongoFixtureLoaderModule', require\('plus\.garden\.fixtures-mongo'\)\)/
            );

            /** File config.json should contain config for MongoDb */
            assert.JSONFileContent(
                this.app.destinationPath('config.json'),
                {
                    "fixtures-mongo": {
                        "uri": "mongodb://user:password@localhost:27017/dbname",
                        "fixtures": "fixtures/mongo"
                    }
                }
            );

            /** File hooks.js should not contain hooks related to fixtures Mongo */
            assert.fileContent(
                this.app.destinationPath('features/support/hooks.js'),
                /Before\(\{tags: '@fixtures.drop'}, function \(scenarioResult, callback\) \{/
            );

            done();
        }.bind(this));
    });

    it('should show correct hints by Mongo env', function (done) {
        helpers.mockPrompt(this.app, {
            drivers: ['fixture_mongo']
        });

        this.app.run(function () {
            assert.textEqual(this.app._generateHintsText(), this.app._sayGoodbyeText())

            done();
        }.bind(this));
    });

    /*************** Separate unit test in the future *************************/

    it('should add fixtures Mysql dependencies', function (done) {
        helpers.mockPrompt(this.app, {
            drivers: ['fixture_mysql']
        });

        this.app.run(function () {
            assert.equal(
                'plus.garden.fixtures-mysql',
                this.npmInstallCalls[2][0]
            );

            done();
        }.bind(this));
    });

    it('should init default fixtures Mysql env', function (done) {
        helpers.mockPrompt(this.app, {
            drivers: ['fixture_mysql']
        });

        this.app.run(function () {
            /** File container.js should contain fixtures Mysql module */
            assert.fileContent(
                this.app.destinationPath('container.js'),
                /container\.register\('MysqlFixtureLoaderModule', require\('plus\.garden\.fixtures-mysql'\)\)/
            );

            /** File config.json should contain config for Mysql */
            assert.JSONFileContent(
                this.app.destinationPath('config.json'),
                {
                    "fixtures-mysql": {
                        "uri": "mysql://user@localhost:3306/dbname",
                        "models": "fixtures/mysql/models",
                        "fixtures": "fixtures/mysql"
                    }
                }
            );

            done();
        }.bind(this));
    });

    it('should show correct hints by Mysql env', function (done) {
        helpers.mockPrompt(this.app, {
            drivers: ['fixture_mysql']
        });

        this.app.run(function () {
            assert.textEqual(this.app._generateHintsText(), this.app._sayGoodbyeText())

            done();
        }.bind(this));
    });

    /*************** Separate unit test in the future *************************/

    it('should add fixtures Docker dependencies', function (done) {
        helpers.mockPrompt(this.app, {
            drivers: ['fixture_docker']
        });

        this.app.run(function () {
            assert.equal(
                'plus.garden.fixtures.docker-compose',
                this.npmInstallCalls[2][0]
            );

            done();
        }.bind(this));
    });

    it('should init default fixtures Docker env', function (done) {
        helpers.mockPrompt(this.app, {
            drivers: ['fixture_docker']
        });

        this.app.run(function () {
            assert.file([
                'fixtures/docker-compose/Dockerfile',
                'fixtures/docker-compose/docker-compose.yml',
                'fixtures/docker-compose/dump/db1/system.indexes.bson',
                'fixtures/docker-compose/dump/db1/users.bson'
            ]);
            /** File container.js should contain fixtures Docker module */
            assert.fileContent(
                this.app.destinationPath('container.js'),
                /container\.register\('DockerComposeFixturesModule', require\('plus\.garden\.fixtures\.docker-compose'\)\)/
            );

            /** File config.json should contain config for Docker */
            assert.JSONFileContent(
                this.app.destinationPath('config.json'),
                {
                    "fixtures-docker-compose": {
                        "compose": "fixtures/docker-compose/docker-compose.yml",
                        "autoSudo": true,
                        "sudo": false
                    }
                }
            );

            done();
        }.bind(this));
    });

    it('should show correct hints by Docker env', function (done) {
        helpers.mockPrompt(this.app, {
            drivers: ['fixture_docker']
        });

        this.app.run(function () {
            assert.textEqual(this.app._generateHintsText(), this.app._getFixturesDockerHintText())

            done();
        }.bind(this));
    });
});
