var gulp = require("gulp");
    babel = require("gulp-babel"),
    shell = require("gulp-shell"),
    rename = require("gulp-rename"),
    mocha = require("gulp-mocha"),
    browserify = require("gulp-browserify"),
    source = require("vinyl-source-stream"),
    sass = require("gulp-sass"),
    gls = require("gulp-live-server");

var paths = {
  html: './index.html',
  data: './data/**/*',
  build: './build',
  index: './build/index.js',
  scripts: './src/*.es6',
  styles: './src/styles/*.scss'
};

gulp.task('build-styles', function() {
  gulp.src(paths.styles)
    .pipe(sass())
    .on('error', function(error) {
      console.log(error.message);
    })
    .pipe(gulp.dest(paths.build));
});

gulp.task('build-js', function() {
  gulp.src(paths.scripts)
    .pipe(babel())
    .on("error", function(error) {
      console.log(error.message);
    })
    .pipe(rename({ extname: ".js" }))
    .pipe(gulp.dest(paths.build));
});

gulp.task('browserify', ['build-js'], function() {
  gulp.src(paths.index)
    .pipe(browserify({
      insertGlobals: true
    }))
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest(paths.build));
});

gulp.task('watch', ['build-js', 'build-styles'], function() {
  gulp.watch("./src/styles/**/*", ['build-styles']);
  gulp.watch("./src/**/*", ['browserify']);
  gulp.watch("./index.html", ['assets']);
});

gulp.task('test', function() {
  gulp.src("./test/*.es6")
    .pipe(babel())
    .pipe(rename({ extname: ".js" }))
    .pipe(gulp.dest('test_build'))
    .pipe(mocha({
      reporter: "spec"
    }));
});

gulp.task('assets', function() {
  gulp.src('./node_modules/babel-core/browser-polyfill.min.js').pipe(gulp.dest(paths.build))
  gulp.src(paths.html).pipe(gulp.dest(paths.build))
  gulp.src(paths.data).pipe(gulp.dest('./build/data/'))
});

gulp.task('serve', function() {
  var server = gls.static('build', '8080');
  server.start();

  // use gulp.watch to trigger server actions(notify, start or stop)
  gulp.watch(['./build/*'], function () {
    server.notify.apply(server, arguments);
  });
});

gulp.task('default', [
  'serve',
  'assets',
  'watch'
]);