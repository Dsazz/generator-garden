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
        var prompts = [];
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

        prompts.push({
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

        return this.prompt(prompts).then(function (props) {

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
            this._webdriverDirInit();
        }

        this._gardenContainerInit();
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
        this.log(yosay(
            chalk.magenta('Good bye ...')
        ));
    },

    _isExistsPackageJSON: function () {
        return fs.existsSync(this.destinationPath('package.json'));
    },

    /**
     * Private method for initializing webdriver directories
     */
    _webdriverDirInit: function () {
        this.fs.copy(
            this.templatePath('webdriver/features'),
            this.destinationPath('features')
        );

        this.log(chalk.green('Copied Webdriver related dirs.'));
    },

    /**
     * Private method for initializing webdriver package relations
     */
    _webdriverPackageInit: function () {
        //"plus.garden": "github:dsazz/plus.garden",
        this.npmInstall(
            ['plus.garden.webdriver@github:dsazz/plus.garden.webdriver'],
            { 'save': true }
        );
    },

    _gardenContainerInit: function () {
        this.fs.copyTpl(
            this.templatePath('container_tpl.js'),
            this.destinationPath('container.js'),
            {
                includeWebdriver: this.webdriverInit
            }
        );

        this.log(chalk.green('Init container.js'));
    }
});
