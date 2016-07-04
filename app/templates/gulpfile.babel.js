// generated on <%= date %> using <%= name %> <%= version %>
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';
import {stream as wiredep} from 'wiredep';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

var styles_func = function(dist) {<% if (includeSassWithCompass) { %>
  dist = dist || false;
  var cf = './config.rb';
  return gulp.src(['app/styles/**/*.{sass,scss}', '!app/styles/**/_*.*'])
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.compass({
      config_file: cf,
      relative: false,
      sass: 'app/styles',
      css: 'dist/styles'
    }).on('error', function (error) {
      console.log(error);
      this.emit('end');
    }))<% } else { %>
    return gulp.src('app/styles/*.css')
    .pipe($.sourcemaps.init())<% } %>
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
};

gulp.task('styles', () => styles_func());

gulp.task('styles:dist', () => styles_func(true));

<% if (includeBabel) { -%>
gulp.task('scripts', () => {
  return gulp.src(['app/scripts/**/*.js', 'app/scripts/main.js', 'app/scripts/app.js'])
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(reload({stream: true}));
});
<% } -%>

function lint(files, options) {
  return () => {
    return gulp.src(files)
      .pipe(reload({stream: true, once: true}))
      .pipe($.eslint(options))
      .pipe($.eslint.format())
      .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
  };
}
const testLintOptions = {
  env: {
<% if (testFramework === 'mocha') { -%>
    mocha: true
<% } else if (testFramework === 'jasmine') { -%>
    jasmine: true
<% } -%>
  }
};

gulp.task('lint', lint('app/scripts/**/*.js'));
gulp.task('lint:test', lint('test/spec/**/*.js', testLintOptions));

<% if (includeBabel) { -%>
gulp.task('html', ['styles:dist', 'scripts'], () => {
<% } else { -%>
gulp.task('html', ['styles'], () => {
<% } -%>
  return gulp.src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if('*.js', $.uglify({
      mangle: true,
      compress: true
    })))
    .pipe($.if('*.css', $.cssnano({
      mergeIdents: false,
      reduceIdents: false
    })))
    .pipe($.if('*.html', $.htmlmin({
      collapseWhitespace: false,
      removeComments: true,
      removeAttributeQuotes: false,
      removeRedundantAttributes: true
    })))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.if($.if.isFile, $.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .on('error', function (err) {
      console.log(err);
      this.end();
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
    .concat('app/fonts/**/*'))
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

<% if (includeBabel) { -%>
gulp.task('serve', ['styles', 'scripts', 'fonts'], () => {
<% } else { -%>
gulp.task('serve', ['styles', 'fonts'], () => {
<% } -%>
  browserSync({
    notify: false,
    online: false,
    port: 9876,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch([
    'app/*.html',
    'app/styles/**/*.<%= includeSassWithCompass ? '{sass,scss}' : 'css' %>',
<% if (includeBabel) { -%>
    '.tmp/scripts/**/*.js',
<% } else { -%>
    'app/scripts/**/*.js',
<% } -%>
    'app/images/**/*',
    '.tmp/fonts/**/*'
  ]).on('change', reload);

  gulp.watch('app/styles/**/*.<%= includeSassWithCompass ? '{sass,scss}' : 'css' %>', ['styles']);
  gulp.watch(['gulpfile.babel.js', 'config.rb']).on('change', function(event) {
    reload();
    gulp.start('styles');
  });
<% if (includeBabel) { -%>
  gulp.watch('app/scripts/**/*.js', ['scripts']);
  gulp.watch('app/scripts/**/*.js', function(event) {
    // Fires wiredep when a new script is added
    if (event.type === 'added') {
      gulp.start('wiredep');
    }
  });
<% } -%>
  gulp.watch('app/fonts/**/*', ['fonts']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
});

gulp.task('serve:dist', () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

<% if (includeBabel) { -%>
gulp.task('serve:test', ['scripts'], () => {
<% } else { -%>
gulp.task('serve:test', () => {
<% } -%>
  browserSync({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
<% if (includeBabel) { -%>
        '/scripts': '.tmp/scripts',
<% } else { -%>
        '/scripts': 'app/scripts',
<% } -%>
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch(['gulpfile.babel.js', 'config.rb']).on('change', reload);
<% if (includeBabel) { -%>
  gulp.watch('app/scripts/**/*.js', ['scripts']);
<% } -%>
  gulp.watch('test/spec/**/*.js').on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// inject bower components
gulp.task('wiredep', ['styles', 'scripts', 'fonts'], () => {<% if (includeSassWithCompass) { %>
  gulp.src('app/styles/**/*.{sass,scss}')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('app/styles'));
<% } %>
  var injectSources = gulp.src(['.tmp/scripts/*/*.js', '.tmp/scripts/main.js', '.tmp/scripts/app.js', '.tmp/styles/**/*.css'], {read: false}),
      injectOptions = {
      ignorePath: ['/.tmp'],
      addRootSlash: false
    };
  gulp.src('app/*.html')
    .pipe(wiredep({<% if (includeBootstrap) { if (includeSassWithCompass) { %>
      exclude: ['bootstrap-sass'],<% } else { %>
      exclude: ['bootstrap.js'],<% }} %>
      ignorePath: /^(\.\.\/)*\.\./,
      exclude: [ '/jquery/', '/angular/', 'bower_components/modernizr/modernizr.js' ]
    }))
    .pipe($.inject(injectSources, injectOptions))
    .pipe(gulp.dest('app'));
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});
