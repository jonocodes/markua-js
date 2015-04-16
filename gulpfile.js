var gulp = require("gulp")
var traceur = require("gulp-traceur")
var shell = require("gulp-shell")
var rename = require("gulp-rename")

gulp.task('build',function() {
  gulp.src("./src/*.es6")
    .pipe(traceur())
    .pipe(rename({ extname: ".js" }))
    .pipe(gulp.dest('build'));
});

gulp.task('test', shell.task('./node_modules/.bin/mocha --harmony -R spec'));

gulp.task('watch', function() {
  gulp.watch('./src/*', ['build']);
});
