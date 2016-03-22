var gulp = require('gulp'),
 	less = require('gulp-less'),
 	browserSync = require('browser-sync').create(),
    browserSyncSpa = require("browser-sync-spa"),
 	path = require('path'),
 	minifyCSS = require('gulp-minify-css'),
 	LessPluginCleanCSS = require('less-plugin-clean-css'),
 	LessPluginAutoPrefix = require('less-plugin-autoprefix'),
 	cleancss = new LessPluginCleanCSS({ advanced: true }),
 	autoprefix= new LessPluginAutoPrefix({ browsers: ["last 2 versions"] }),
	reload = browserSync.reload;

browserSync.use(browserSyncSpa({

    // Only needed for angular apps
    selector: "[ng-app]",

    // Options to pass to connect-history-api-fallback.
    // If your application already provides fallback urls (such as an existing proxy server),
    // this value can be set to false to omit using the connect-history-api-fallback middleware entirely.
    history: {
        index: '/index.html'
    }
}));    

gulp.task('styles', function () {
  return gulp.src('./less/main.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ],
      plugins: [autoprefix, cleancss]
    }))
    .pipe(gulp.dest('./css'))
  	.pipe(minifyCSS())
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('serve', function () {

    // Serve files from the root of this project
    browserSync.init({
        /*server: {
            baseDir: "./"
        }*/
        open: true,
        server: {
            baseDir: "./"
        },
        files:   "./*"
    });

    gulp.watch("./less/*.less", ["styles"]);
    gulp.watch("./js/*.js").on("change", reload);
    gulp.watch("./**/*.html").on("change", reload);
});

// or...
/*
gulp.task('serve', function() {
    browserSync.init({
        proxy: "local.dev"
    });
});
*/

gulp.task('default', ['styles', 'serve']);