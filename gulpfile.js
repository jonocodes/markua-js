var gulp = require("gulp");
var babel = require("gulp-babel");
var shell = require("gulp-shell");
var rename = require("gulp-rename");
var mocha = require("gulp-mocha");
var browserify = require("gulp-browserify");
var source = require("vinyl-source-stream");
var sass = require("gulp-sass")

gulp.task('build-styles', function() {
  gulp.src("./src/styles/*.scss")
    .pipe(sass())
    .on('error', function(error) {
      console.log(error.message);
    })
    .pipe(gulp.dest('build'))
});

gulp.task('build-js', function() {
  gulp.src("./src/*.es6")
    .pipe(babel())
    .on("error", function(error) {
      console.log(error.message);
    })
    .pipe(rename({ extname: ".js" }))
    .pipe(gulp.dest('build'));
});

gulp.task('browserify', ['build-js'], function() {
  return gulp.src('./build/index.js')
    .pipe(browserify({
      insertGlobals: true
    }))
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest('build'))
});

gulp.task('dev-web', function() {
  gulp.watch("./src/styles/*", ["build-styles"]);
  gulp.watch("./src/*", ["browserify"]);
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

gulp.task('watch', function() {
  gulp.watch('./src/*', ['build-js']);
});
