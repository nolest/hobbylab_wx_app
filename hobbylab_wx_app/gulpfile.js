'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var rename = require("gulp-rename");
// gulp.task('all', function () {
//   return gulp.src(['./src/**','!./src/css/**/*.scss'])
//     .pipe(gulp.dest('./app/'));
// });

gulp.task('sass', function () {
  return gulp.src('./src/pages/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(rename({
			extname: ".wxss"
		}))
    .pipe(gulp.dest('./dest/pages'));
});

gulp.task('watches', function () {
  gulp.watch('./src/**', ['sass']);
});
