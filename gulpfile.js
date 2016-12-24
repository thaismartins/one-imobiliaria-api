var gulp = require('gulp'),
    concat = require('gulp-concat'),
    coffee = require('gulp-coffee');

var coffeePaths = [
    'controllers',
    'models',
    'services'
];

var coffeeFiles = [
    'config.coffee',
    'routes.coffee',
    'server.coffee'
];

function logError(error) {
    console.error(error);
    this.emit('end');
}

gulp.task('coffee', function() {

    coffeePaths.forEach(function(path) {
        gulp.src('./' + path + '/*.coffee')
            .pipe(coffee({bare: true})
            .on('error', logError))
            .pipe(gulp.dest('./dist/' + path));
    });

    coffeeFiles.forEach(function(file) {
        gulp.src(file)
            .pipe(coffee({bare: true})
                .on('error', logError))
            .pipe(gulp.dest('./dist'));
    });
});

gulp.task('copy-files', function() {
    gulp.src('./public/**/*')
        .pipe(gulp.dest('dist/public/'));
    gulp.src('./configs/**/*')
        .pipe(gulp.dest('dist/configs/'));
});

gulp.task('watch', function() {
    gulp.watch(['./*.coffee', './**/*.coffee', './**/**/*.coffee'], ['build'])
});

gulp.task('build', ['coffee', 'copy-files']);