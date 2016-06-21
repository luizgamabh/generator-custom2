'use strict';
var generators = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var wiredep = require('wiredep');
var mkdirp = require('mkdirp');
var _s = require('underscore.string');

module.exports = generators.Base.extend({
  constructor: function () {
    var testLocal;

    generators.Base.apply(this, arguments);

    this.option('skip-welcome-message', {
      desc: 'Skips the welcome message',
      type: Boolean
    });

    this.option('skip-install-message', {
      desc: 'Skips the message after the installation of dependencies',
      type: Boolean
    });

    this.option('test-framework', {
      desc: 'Test framework to be invoked',
      type: String,
      defaults: 'mocha'
    });

    this.option('babel', {
      desc: 'Use Babel',
      type: Boolean,
      defaults: true
    });

    if (this.options['test-framework'] === 'mocha') {
      testLocal = require.resolve('generator-mocha/generators/app/index.js');
    } else if (this.options['test-framework'] === 'jasmine') {
      testLocal = require.resolve('generator-jasmine/generators/app/index.js');
    }

    this.composeWith(this.options['test-framework'] + ':app', {
      options: {
        'skip-install': this.options['skip-install']
      }
    }, {
      local: testLocal
    });
  },

  initializing: function () {
    this.pkg = require('../package.json');
  },

  prompting: function () {
    var done = this.async();

    if (!this.options['skip-welcome-message']) {
      this.log(yosay('Be welcome to Custom Generator v2.'));
    }

    var prompts = [{
      type: 'checkbox',
      name: 'features',
      message: 'What more would you like?',
      choices: [{
        name: 'Sass with Compass',
        value: 'includeSassWithCompass',
        checked: true
      }, {
        name: 'Bootstrap',
        value: 'includeBootstrap',
        checked: false
      }, {
        name: 'Modernizr',
        value: 'includeModernizr',
        checked: true
      }, {
        name: 'Custom Grid System',
        value: 'includeCustomGS',
        checked: true
      }, {
        name: 'Perfect Scrollbar',
        value: 'includePerfectScrollbar',
        checked: true
      },  {
        name: 'Font Awesome',
        value: 'includeFontAwesome',
        checked: true
      }, {
        name: 'CSS Reset',
        value: 'includeCSSReset',
        checked: true
      }, {
        name: 'IncludeMedia (SASS Breakpoints manager)',
        value: 'includeIncludeMedia',
        checked: true
      }]
    }, {
      type: 'confirm',
      name: 'includeJQuery',
      message: 'Would you like to include jQuery?',
      default: true,
      when: function (answers) {
        return answers.features.indexOf('includeBootstrap') === -1;
      }
    }, {
      type: 'checkbox',
      name: 'plugins',
      message: 'What jQuery plugins would you like?',
      when: function (answers) {
        return answers.includeJQuery;
      },
      choices: [{
        name: 'jQuery Easing',
        value: 'includeJQueryEasing',
        checked: true
      }, {
        name: 'jQuery Smooth Scrollbars (2 plugins)',
        value: 'includeSmoothScroll',
        checked: false
      }, {
        name: 'jQuery Hotkeys',
        value: 'includeJQueryHotkeys',
        checked: false
      }, {
        name: 'jQuery Advanced Break',
        value: 'includeJQueryAdvancedBreak',
        checked: false
      }, {
        name: 'jQuery Advanced Scroll',
        value: 'includeJQueryAdvancedScroll',
        checked: false
      }]
    }];

    this.prompt(prompts, function (answers) {
      var features = answers.features;
      var plugins = answers.plugins;

      function hasFeature(feat) {
        return features && features.indexOf(feat) !== -1;
      };

      function hasPlugin(plug) {
        return plugins && plugins.indexOf(plug) !== -1;
      }

      // manually deal with the response, get back and store the results.
      // we change a bit this way of doing to automatically do this in the self.prompt() method.
      this.includeSassWithCompass = hasFeature('includeSassWithCompass');
      this.includeBootstrap = hasFeature('includeBootstrap');
      this.includeModernizr = hasFeature('includeModernizr');
      this.includeCustomGS = hasFeature('includeCustomGS');
      this.includePerfectScrollbar = hasFeature('includePerfectScrollbar');
      this.includeFontAwesome = hasFeature('includeFontAwesome');
      this.includeCSSReset = hasFeature('includeCSSReset');
      this.includeIncludeMedia = hasFeature('includeIncludeMedia');
      this.includeJQuery = answers.includeJQuery;
      this.includeJQueryEasing = hasPlugin('includeJQueryEasing');
      this.includeSmoothScroll = hasPlugin('includeSmoothScroll');
      this.includeJQueryHotkeys = hasPlugin('includeJQueryHotkeys');
      this.includeJQueryAdvancedBreak = hasPlugin('includeJQueryAdvancedBreak');
      this.includeJQueryAdvancedScroll = hasPlugin('includeJQueryAdvancedScroll');

      done();
    }.bind(this));
  },

  writing: {
    compass: function() {
      this.fs.copy(this.templatePath('config.rb'), this.destinationPath('config.rb'));
      this.fs.copy(this.templatePath('config-dist.rb'), this.destinationPath('config-dist.rb'));
    },

    gulpfile: function () {c
      this.bower_directory = './bower_components';
      this.fs.copyTpl(
        this.templatePath('gulpfile.babel.js'),
        this.destinationPath('gulpfile.babel.js'),
        {
          date: (new Date).toISOString().split('T')[0],
          name: this.pkg.name,
          version: this.pkg.version,
          bower_directory: this.bower_directory,
          includeSassWithCompass: this.includeSassWithCompass,
          includeBootstrap: this.includeBootstrap,
          includeModernizr: this.includeModernizr,
          includePerfectScrollbar: this.includePerfectScrollbar,
          includeFontAwesome: this.includeFontAwesome,
          includeJQuery: this.includeJQuery,
          includeJQueryEasing: this.includeJQueryEasing,
          includeSmoothScroll: this.includeSmoothScroll,
          includeJQueryHotkeys: this.includeJQueryHotkeys,
          includeJQueryAdvancedBreak: this.includeJQueryAdvancedBreak,
          includeJQueryAdvancedScroll: this.includeJQueryAdvancedScroll,
          includeBabel: this.options['babel'],
          testFramework: this.options['test-framework']
        }
      );
    },

    packageJSON: function () {
      this.fs.copyTpl(
        this.templatePath('_package.json'),
        this.destinationPath('package.json'),
        {
          includeSassWithCompass: this.includeSassWithCompass,
          includeBabel: this.options['babel']
        }
      );
    },

    babel: function () {
      this.fs.copy(
        this.templatePath('babelrc'),
        this.destinationPath('.babelrc')
      );
    },

    git: function () {
      this.fs.copy(
        this.templatePath('gitignore'),
        this.destinationPath('.gitignore'));

      this.fs.copy(
        this.templatePath('gitattributes'),
        this.destinationPath('.gitattributes'));
    },

    bower: function () {
      var bowerJson = {
        name: _s.slugify(this.appname),
        private: true,
        dependencies: {},
        overrides: {}
      };

      if (this.includeBootstrap) {
        if (this.includeSassWithCompass) {
          bowerJson.dependencies['bootstrap-sass'] = '~3.3.5';
          bowerJson.overrides['bootstrap-sass'] = {
            'main': [
              'assets/stylesheets/_bootstrap.scss',
              'assets/fonts/bootstrap/*',
              'assets/javascripts/bootstrap.js'
            ]
          };
        } else {
          bowerJson.dependencies['bootstrap'] = '~3.3.5';
          bowerJson.overrides['bootstrap'] = {
            'main': [
              'less/bootstrap.less',
              'dist/css/bootstrap.css',
              'dist/js/bootstrap.js',
              'dist/fonts/*'
            ]
          };
        }
      } else if (this.includeJQuery) {
        bowerJson.dependencies['jquery'] = '~2.1.4';
      }

      if (this.includeModernizr) {
        bowerJson.dependencies['modernizr'] = '~2.8.1';
        bowerJson.overrides['modernizr'] = {
          'main': [
            'modernizr.js'
          ]
        }
      }

      if (this.includeCustomGS) {
        bowerJson.dependencies['custom.gs'] = '~2.3.3';
      }

      if (this.includePerfectScrollbar) {
        bowerJson.dependencies['perfect-scrollbar'] = '~0.6.8';
        var main = [];
        if (this.includeJQuery) {
          main.push('js/perfect-scrollbar.jquery.js');
        } else {
          main.push('js/perfect-scrollbar.js')
        }
        if (this.includeSassWithCompass) {
          main.push('src/css/main.scss');
        } else {
          main.push('css/perfect-scrollbar.min.css');
        }
        bowerJson.overrides['perfect-scrollbar'] = {
          'main': main
        };
      }

      if (this.includeFontAwesome) {
        bowerJson.dependencies['font-awesome'] = 'fontawesome#~4.5.0';
        bowerJson.overrides['font-awesome'] = {
          'main': [
            "scss/font-awesome.scss",
            "fonts/FontAwesome.otf",
            "fonts/fontawesome-webfont.eot",
            "fonts/fontawesome-webfont.svg",
            "fonts/fontawesome-webfont.ttf",
            "fonts/fontawesome-webfont.woff",
            "fonts/fontawesome-webfont.woff2"
          ]
        }
      }

      if (this.includeIncludeMedia) {
        bowerJson.dependencies['include-media'] = '~1.4.2';
      }

      if (this.includeJQueryEasing) {
        bowerJson.dependencies['jquery-easing-original'] = '~1.3.2';
        bowerJson.overrides['jquery-easing-original'] = {
          'main': [
            'jquery.easing.min.js'
          ]
        }
      }

      if (this.includeSmoothScroll) {
        bowerJson.dependencies['jquery-mousewheel'] = '~3.1.13';
        bowerJson.dependencies['jquery_nicescroll'] = 'luizgamabh/nicescroll#~0.9.9';
        bowerJson.overrides['jquery_nicescroll'] = {
          'main': [
            'nicescroll.js'
          ]
        }
      }

      if (this.includeJQueryHotkeys) {
        bowerJson.dependencies['jquery.hotkeys'] = 'jeresig/jquery.hotkeys#~0.2.0';
      }

      if (this.includeJQueryAdvancedBreak) {
        bowerJson.dependencies['jquery.advancedbreak'] = 'luizgamabh/jquery.advancedbreak#~0.0.1';
        bowerJson.overrides['jquery.advancedbreak'] = {
          'main': [
            'jquery.advancedBreak.js'
          ]
        }
      }

      if (this.includeJQueryAdvancedScroll) {
        bowerJson.dependencies['jquery.advancedScroll'] = 'luizgamabh/jquery.advancedScroll#~0.0.1';
      }


      this.fs.writeJSON('bower.json', bowerJson);
      this.fs.copy(
        this.templatePath('bowerrc'),
        this.destinationPath('.bowerrc')
      );
    },

    editorConfig: function () {
      this.fs.copy(
        this.templatePath('editorconfig'),
        this.destinationPath('.editorconfig')
      );
    },

    h5bp: function () {
      this.fs.copy(
        this.templatePath('favicon.ico'),
        this.destinationPath('app/favicon.ico')
      );

      this.fs.copy(
        this.templatePath('apple-touch-icon.png'),
        this.destinationPath('app/apple-touch-icon.png')
      );

      this.fs.copy(
        this.templatePath('robots.txt'),
        this.destinationPath('app/robots.txt'));
    },

    styles: function () {
      var css = 'main';

      if (this.includeSassWithCompass) {
        this.directory('sass-structure', 'app/styles');
        css += '.sass';
      } else {
        css += '.css';
      }

      this.bower_directory = '../../bower_components';

      this.fs.copyTpl(
        this.templatePath(css),
        this.destinationPath('app/styles/' + css),
        {
          includeBootstrap: this.includeBootstrap,
          includeCustomGS: this.includeCustomGS,
          includeCSSReset: this.includeCSSReset,
          includePerfectScrollbar: this.includePerfectScrollbar,
          includeIncludeMedia: this.includeIncludeMedia,
          includeFontAwesome: this.includeFontAwesome,
          bower_directory: this.bower_directory
        }
      );
    },

    scripts: function () {
      this.fs.copy(
        this.templatePath('main.js'),
        this.destinationPath('app/scripts/main.js')
      );
    },

    html: function () {
      var bsPath;

      // path prefix for Bootstrap JS files
      if (this.includeBootstrap) {
        bsPath = '/bower_components/';

        if (this.includeSassWithCompass) {
          bsPath += 'bootstrap-sass/assets/javascripts/bootstrap/';
        } else {
          bsPath += 'bootstrap/js/';
        }
      }

      this.fs.copyTpl(
        this.templatePath('index.html'),
        this.destinationPath('app/index.html'),
        {
          appname: this.appname,
          includeSassWithCompass: this.includeSassWithCompass,
          includeBootstrap: this.includeBootstrap,
          includeModernizr: this.includeModernizr,
          includeJQuery: this.includeJQuery,
          bsPath: bsPath,
          bsPlugins: [
            'affix',
            'alert',
            'dropdown',
            'tooltip',
            'modal',
            'transition',
            'button',
            'popover',
            'carousel',
            'scrollspy',
            'collapse',
            'tab'
          ]
        }
      );
    },

    misc: function () {
      mkdirp('app/images');
      mkdirp('app/fonts');
    }
  },

  install: function () {
    this.installDependencies({
      skipMessage: this.options['skip-install-message'],
      skipInstall: this.options['skip-install']
    });
  },

  end: function () {
    var bowerJson = this.fs.readJSON(this.destinationPath('bower.json'));
    var howToInstall =
      '\nAfter running ' +
      chalk.yellow.bold('bundle install & npm install & bower install') +
      ', inject your' +
      '\nfront end dependencies by running ' +
      chalk.yellow.bold('gulp wiredep') +
      '.';

    if (this.options['skip-install']) {
      this.log(howToInstall);
      return;
    }

    // wire Bower packages to .html
    wiredep({
      bowerJson: bowerJson,
      directory: 'bower_components',
      exclude: ['bootstrap-sass', 'bootstrap.js'],
      ignorePath: /^(\.\.\/)*\.\./,
      src: 'app/index.html'
    });

    if (this.includeSassWithCompass) {
      // wire Bower packages to .scss
      wiredep({
        bowerJson: bowerJson,
        directory: 'bower_components',
        ignorePath: /^(\.\.\/)+/,
        src: 'app/styles/*.scss'
      });
    }
  }
});
