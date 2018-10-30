let gulp = require('gulp'),
 uglify = require('gulp-uglify'),
 sourcemaps = require('gulp-sourcemaps'),
 concat = require('gulp-concat'),
rename = require('gulp-rename'),
 ngAnnotate = require('gulp-ng-annotate'),
 notify = require('gulp-notify'),
 minify = require('gulp-minify');
   
   
 
let jsAssets = [
    'js/dbhelper.js',
    'js/idb.js',
    'js/main.js',
    'js/sw_register.js'
    ];

    gulp.task('js', function() {
        return gulp.src(jsAssets)
            .pipe(sourcemaps.init())
            .pipe(concat('apps.js'))
            .pipe(gulp.dest('min/js'))
            .pipe(ngAnnotate())
            .on('error', notify.onError("Error: <%= error.message %>"))
            .pipe(rename({
                suffix: '.min'
            }))
            return gulp.src('min/js/apps.js')
            .pipe(uglify())
            .on('error', notify.onError("Error: <%= error.message %>"))
            .pipe(sourcemaps.write('/map'))
            .pipe(gulp.dest('min/js'))
            .pipe(notify('JS Assets compiled Task Done'));
    });
    gulp.task('compress', function() {
        gulp.src(['min/js/apps.js'])
          .pipe(minify())
          .pipe(gulp.dest('min/js/compress'))
      });