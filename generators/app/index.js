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
            'Welcome to the hunky-dory ' + chalk.red('generator-garden') + ' generator!'
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
                    key: 'fixture_mysql',
                    name: 'Fixtures driver for MYSQL',
                    value: 'fixture_mysql',
                },
            ],
            validate: function (answer) {
                if (answer.length < 1) {
                    return yosay('You must choose at least one driver !');
                }
                return true;
            }
        });

        return this.prompt(driverPrompts).then(function (props) {

            this.driversChecked = props.drivers.length > 0;

            this.apiTesterInit = props.drivers.includes('api_tester');
            this.webdriverInit = props.drivers.includes('webdriver');
            this.fixturesMysqlInit = props.drivers.includes('fixture_mysql');

        }.bind(this));
    },

    /**
     * Where you write the generator specific files
     */
    writing: function () {
        if (this.webdriverInit) {
            this._webdriverFilesInit();
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
            this.npmInstall(
                ['plus.garden@github:dsazz/plus.garden'],
                { 'save': true }
            );
        }

        if (this.webdriverInit) {
            this._webdriverPackageInit();
        }
    },

    /**
     * Called last
     */
    end: function () {
        // Show user hints about all checked drivers!
        this.log(yosay(chalk.red(this._generateHintsText()), {maxLength: 65}));
    },

    _isExistsPackageJSON: function () {
        return fs.existsSync(this.destinationPath('package.json'));
    },

    /**
     * Private method for initializing webdriver directories
     */
    _webdriverFilesInit: function () {
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
     * Private method for initializing webdriver package relations
     */
    _webdriverPackageInit: function () {
        this.npmInstall(
            ['plus.garden.webdriver@github:dsazz/plus.garden.webdriver'],
            { 'save': true }
        );
    },

    _supportFilesInit: function () {
        this._supportWorldInit();
        this._supportHooksInit();
    },

    _supportHooksInit: function () {
        this.fs.copy(
            this.templatePath('features/support/hooks.js'),
            this.destinationPath('features/support/hooks.js')
        );
    },

    _supportWorldInit: function () {
        this.fs.copyTpl(
            this.templatePath('features/support/world_tpl.js'),
            this.destinationPath('features/support/world.js'),
            {
                includeWebdriver: this.webdriverInit
            }
        );
    },

    /**
     * Setup garden env
     */
    _gardenFilesInit: function () {
        this._gardenIndexInit();
        this._gardenContainerInit();
    },

    _gardenContainerInit: function () {
        this.fs.copyTpl(
            this.templatePath('container_tpl.js'),
            this.destinationPath('container.js'),
            {
                includeWebdriver: this.webdriverInit
            }
        );
    },

    _gardenIndexInit: function () {
        this.fs.copy(
            this.templatePath('garden.js'),
            this.destinationPath('garden.js')
        );
    },

    /**
     * Generate hints after installation based on checked options
     * @returns {String}
     */
    _generateHintsText: function () {
        var hintsText = '';
        if (this.webdriverInit) {
            hintsText += this._getWebdriverHintText();
        }

        return hintsText || 'Good buy ...';
    },

    /**
     * Get hint for webdriver
     * @returns {String}
     */
    _getWebdriverHintText: function () {
        return 'If you whant use Webdriver don\'t forget also install webdriver-manager (npm install -g webdriver-manager)!';
    }
});
