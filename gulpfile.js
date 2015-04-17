var gulp = require("gulp")
var babel = require("gulp-babel")
var shell = require("gulp-shell")
var rename = require("gulp-rename")
var mocha = require("gulp-mocha")

gulp.task('build', function() {
  gulp.src("./src/*.es6")
    .pipe(babel())
    .pipe(rename({ extname: ".js" }))
    .pipe(gulp.dest('build'));
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
  gulp.watch('./src/*', ['build']);
});
