'use strict';

var gulp = require('gulp');

var srcmaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');


gulp.task('sass', function () {

    gulp.src('public/scss/*.scss')

        //  Stops crashing watch on error.
        .pipe(plumber())

        //  Initialise sourcemaps.
        .pipe(srcmaps.init())

        //  Compile Sass files, log errors.
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))

        //  Write the sourcemaps to the current directory.
        .pipe(srcmaps.write('/'))

        //  Set the output destination for the final file.
        .pipe(gulp.dest('public/css'));

});

gulp.task('watch', function () {
    gulp.watch('public/scss/*.scss', ['sass']);
});
