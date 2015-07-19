/*! https://github.com/ltodorov/boilerplate | MIT License */

var gulp         = require('gulp'),
    util         = require('gulp-util'),
    gulpif       = require('gulp-if'),
    minimist     = require('minimist'),
    sourcemaps   = require('gulp-sourcemaps'),
    source       = require('vinyl-source-stream'),
    buffer       = require('vinyl-buffer'),
    browserify   = require('browserify'),
    watchify     = require('watchify'),
    uglify       = require('gulp-uglify'),
    autoprefixer = require('gulp-autoprefixer'),
    sass         = require('gulp-ruby-sass'),

    config       = require('./config.json'),

    knownOptions = {
        string: 'env',
        default: {
            env: process.env.NODE_ENV || config.env
        }
    },
    options = minimist(process.argv.slice(2), knownOptions),
    debug = options.env === 'development',
    wrapper;

/* =============================================================================
 * Bundling JavaScript files
 * =============================================================================
 */

wrapper = (function () {
    var b = browserify(config.js.src.file, {
            debug: debug
        });

    if (debug) {
        b = watchify(b);
        b.on('update', bundle);
        b.on('log', util.log);
    }

    return b;
}());

function bundle() {
    return wrapper.bundle()
        .on('error', util.log)
        .pipe(source(config.js.dest.file))
        .pipe(buffer())
        .pipe(gulpif(!debug, uglify()))
        .pipe(gulp.dest(config.js.dest.folder));
}

gulp.task('js', bundle);

/* =============================================================================
 * Compiling SCSS files
 * =============================================================================
 */

gulp.task('css', function () {
    var output;

    if (debug) {
        output = config.css.sass.style.development;
    } else {
        output = config.css.sass.style.production;
    }

    return sass(config.css.src.file, {
            style: output,
            sourcemap: debug
        })
        .on('error', util.log)
        .pipe(autoprefixer(config.css.autoprefixer))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(config.css.dest.folder));
});

gulp.task('watch', function () {
    if (debug) {
        gulp.watch(config.css.src.watch, ['css']);
    }
});

/* =============================================================================
 * Default task
 * =============================================================================
 */

gulp.task('default', ['js', 'css', 'watch']);