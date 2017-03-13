'use strict';
var Generator = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var fs = require('fs');
var path = require('path');

module.exports = Generator.extend({
    /**
     * Where you prompt users for options
     */
    prompting: function () {
        var driverPrompts = [];
        // Have Yeoman greet the user.
        this.log(yosay(
            'Welcome to the hunky-dory ' + chalk.green('Garden') + ' generator!',
            {maxLength: 30}
        ));

        if (false === this._isExistsPackageJSON()) {
            this.log(yosay(
                chalk.red('File package.json not found in your project. Please create it before using generator.')
            ));
            process.exit(1);
        }

        driverPrompts.push({
            type: 'checkbox',
            name: 'drivers',
            message: 'Choise drivers which you want: ',
            choices: [
                {
                    key: 'api_tester',
                    name: 'Api tester driver',
                    value: 'api_tester',
                },
                {
                    key: 'webdriver',
                    name: 'Webdriver selenium',
                    value: 'webdriver',
                    checked: true
                },
                {
                    key: 'fixture_mongo',
                    name: 'Fixtures driver for MongoDB',
                    value: 'fixture_mongo',
                },
                {
                    key: 'fixture_mysql',
                    name: 'Fixtures driver for MYSQL',
                    value: 'fixture_mysql',
                },
                {
                    key: 'fixture_docker',
                    name: 'Fixtures driver for Docker',
                    value: 'fixture_docker',
                },
            ],
            validate: function (answer) {
                if (answer.length < 1) {
                    return yosay(chalk.red('You must choose at least one driver !'));;
                }

                return true;
            }
        });

        return this.prompt(driverPrompts).then(function (props) {

            this.driversChecked = props.drivers.length > 0;

            this.apiTesterInit = props.drivers.includes('api_tester');
            this.webdriverInit = props.drivers.includes('webdriver');
            this.fixturesMongoInit = props.drivers.includes('fixture_mongo');
            this.fixturesMysqlInit = props.drivers.includes('fixture_mysql');
            this.fixturesDockerInit = props.drivers.includes('fixture_docker');

            this.webdriverDockerFileInit = false;

            var additionalPrompts = [];
            if (this.webdriverInit) {
                additionalPrompts.push({
                    type: 'confirm',
                    name: 'webdriver_docker_file_init',
                    message: 'Do you whant also install docker-compose.yml with selenium configuration for Webdriver ?'
                });
            }

            if (additionalPrompts.length) {
                return this.prompt(additionalPrompts).then(function (props) {
                    this.webdriverDockerFileInit = props.webdriver_docker_file_init;
                }.bind(this));
            }

        }.bind(this));
    },

    /**
     * Where you write the generator specific files
     */
    writing: function () {
        if (this.webdriverInit) {
            this._webdriverFilesInit();
        }

        if (this.apiTesterInit) {
            this._apiTesterFilesInit();
        }

        if (this.fixturesMongoInit) {
            this._fixturesMongoFilesInit();
        }

        if (this.fixturesMysqlInit) {
            this._fixturesMysqlFilesInit();
        }

        if (this.fixturesDockerInit) {
            this._fixturesDockerFilesInit();
        }

        if (this.driversChecked) {
            this._supportFilesInit();
            this._gardenFilesInit();
        }
    },

    /**
     * Where installation are run
     */
    install: function () {
        this.installDependencies({
            bower: false
        });

        if (this.driversChecked) {
            this._gardenPackageInit();
        }

        if (this.webdriverInit) {
            this._webdriverPackageInit();
        }

        if (this.apiTesterInit) {
            this._apiTesterPackageInit();
        }

        if (this.fixturesMongoInit) {
            this._fixturesMongoPackageInit();
        }

        if (this.fixturesMysqlInit) {
            this._fixturesMysqlPackageInit();
        }

        if (this.fixturesDockerInit) {
            this._fixturesDockerPackageInit();
        }
    },

    /**
     * Called last
     */
    end: function () {
        // Show user hints about all checked drivers
        this.log(yosay(chalk.red(this._generateHintsText()), {maxLength: 65}));
    },

    _isExistsPackageJSON: function () {
        return fs.existsSync(this.destinationPath('package.json'));
    },

    /**
     * Method for initializing Garden package relations
     */
    _gardenPackageInit: function () {
        this.npmInstall(['plus.garden@github:dsazz/plus.garden'], { 'save': true });
    },

    /**
     * Method for initializing webdriver directories
     */
    _webdriverFilesInit: function () {
        if (this.webdriverDockerFileInit) {
            this.fs.copy(
                this.templatePath('docker-compose.yml'),
                this.destinationPath('docker-compose.yml')
            );
        }

        this.fs.copy(
            this.templatePath('features/step_definitions/common.js'),
            this.destinationPath('features/step_definitions/common.js')
        );
        this.fs.copy(
            this.templatePath('features/Health.feature'),
            this.destinationPath('features/Health.feature')
        );
    },

    /**
     * Method for initializing webdriver package relations
     */
    _webdriverPackageInit: function () {
        this.npmInstall(
            ['plus.garden.webdriver@github:dsazz/plus.garden.webdriver'],
            { 'save': true }
        );
    },

    /**
     * Method for initializing  directories
     */
    _apiTesterFilesInit: function () {
        this.fs.copy(
            this.templatePath('features/step_definitions/api.js'),
            this.destinationPath('features/step_definitions/api.js')
        );
        this.fs.copy(
            this.templatePath('features/Api.feature'),
            this.destinationPath('features/Api.feature')
        );
    },

    /**
     * Method for initializing ApiTester package relations
     */
    _apiTesterPackageInit: function () {
        this.npmInstall(['plus.garden.api'], { 'save': true });
    },

    /**
     * Method for initializing MongoDB fixtures package relations
     */
    _fixturesMongoPackageInit: function () {
        this.npmInstall(['plus.garden.fixtures-mongo'], { 'save': true });
    },

    /**
     * Method for initializing MongoDB fixtures directories
     */
    _fixturesMongoFilesInit: function () {
        this.fs.copy(
            this.templatePath('fixtures/mongo/user.js'),
            this.destinationPath('fixtures/mongo/user.js')
        );
    },

    /**
     * Method for initializing Mysql fixtures package relations
     */
    _fixturesMysqlPackageInit: function () {
        this.npmInstall(['plus.garden.fixtures-mysql'], { 'save': true });
    },

    /**
     * Method for initializing Mysql fixtures directories
     */
    _fixturesMysqlFilesInit: function () {
    },

    /**
     * Method for initializing Docker fixtures package relations
     */
    _fixturesDockerPackageInit: function () {
        this.npmInstall(['plus.garden.fixtures.docker-compose'], { 'save': true });
    },

    /**
     * Method for initializing MongoDB fixtures directories
     */
    _fixturesDockerFilesInit: function () {
        this.fs.copy(
            this.templatePath('fixtures/docker-compose/Dockerfile'),
            this.destinationPath('fixtures/docker-compose/Dockerfile')
        );
        this.fs.copy(
            this.templatePath('fixtures/docker-compose/docker-compose.yml'),
            this.destinationPath('fixtures/docker-compose/docker-compose.yml')
        );
        this.fs.copy(
            this.templatePath('fixtures/docker-compose/dump/db1/system.indexes.bson'),
            this.destinationPath('fixtures/docker-compose/dump/db1/system.indexes.bson')
        );
        this.fs.copy(
            this.templatePath('fixtures/docker-compose/dump/db1/users.bson'),
            this.destinationPath('fixtures/docker-compose/dump/db1/users.bson')
        );
    },

    /**
     * Method for initializing features/support dir
     */
    _supportFilesInit: function () {
        this._supportWorldInit();
        this._supportHooksInit();
    },

    _supportHooksInit: function () {
        this.fs.copyTpl(
            this.templatePath('features/support/hooks_tpl.js'),
            this.destinationPath('features/support/hooks.js'),
            {
                includeWebdriver: this.webdriverInit,
                includeApiTester: this.apiTesterInit,
                includeFixturesMongo: this.fixturesMongoInit
            }
        );
    },

    _supportWorldInit: function () {
        this.fs.copyTpl(
            this.templatePath('features/support/world_tpl.js'),
            this.destinationPath('features/support/world.js'),
            {
                includeWebdriver: this.webdriverInit,
                includeApiTester: this.apiTesterInit
            }
        );
    },

    /**
     * Setup garden env
     */
    _gardenFilesInit: function () {
        this._gardenIndexInit();
        this._gardenParametersInit();
        this._gardenContainerInit();
        this._gardenConfigInit();
    },

    _gardenContainerInit: function () {
        this.fs.copyTpl(
            this.templatePath('container_tpl.js'),
            this.destinationPath('container.js'),
            {
                includeWebdriver: this.webdriverInit,
                includeApiTester: this.apiTesterInit,
                includeFixturesMongo: this.fixturesMongoInit,
                includeFixturesMysql: this.fixturesMysqlInit,
                includeFixturesDocker: this.fixturesDockerInit
            }
        );
    },

    _gardenIndexInit: function () {
        this.fs.copy(
            this.templatePath('garden.js'),
            this.destinationPath('garden.js')
        );
    },

    _gardenParametersInit: function () {
        this.fs.copy(
            this.templatePath('parameters.json'),
            this.destinationPath('parameters.json')
        );
    },

    _gardenConfigInit: function () {
        this.fs.copyTpl(
            this.templatePath('config_tpl.json'),
            this.destinationPath('config.json'),
            {
                includeWebdriver: this.webdriverInit,
                includeApiTester: this.apiTesterInit,
                includeFixturesMongo: this.fixturesMongoInit,
                includeFixturesMysql: this.fixturesMysqlInit,
                includeFixturesDocker: this.fixturesDockerInit
            }
        );
    },

    /**
     * Generate hints after installation based on checked options
     * @returns {String}
     */
    _generateHintsText: function () {
        var hintsText = [];
        if (this.webdriverInit) {
            hintsText.push(this._getWebdriverHintText());
        }

        if (this.fixturesDockerInit) {
            hintsText.push(this._getFixturesDockerHintText());
        }

        return hintsText.join('\n\t') || this._sayGoodbyeText();
    },

    /**
     * Get hint for webdriver
     * @returns {String}
     */
    _getWebdriverHintText: function () {
        return 'If you whant to use Webdriver don\'t forget also install webdriver-manager (npm install -g webdriver-manager)!';
    },

    /**
     * Get hint for webdriver
     * @returns {String}
     */
    _getFixturesDockerHintText: function () {
        return 'Don\'t forget install docker (https://www.docker.com/) and docker-compose (https://docs.docker.com/compose/) for using docker fixtures provider!';
    },

    /**
     * Say Goodbye
     * @returns {String}
     */
    _sayGoodbyeText: function () {
        return 'Goodbye ...';
    }
});
