/**
 * 
 * Build the template in ./bin with all the assets
 * Serve the template at http://localhost:3000
 * Watch the files and automate refresh
 * 
 *
 * @package ZiON
 */


var gulp        	= require('gulp'),

	//serve the template
	browserSync 	= require('browser-sync').create(),
	reload      	= browserSync.reload,
	
	//prevents work flow from breaking on compilation error
	plumber         = require('gulp-plumber'),
	
    //sass plugins
    autoprefixer    = require('gulp-autoprefixer'),
    rename          = require('gulp-rename'),
    sass            = require('gulp-sass'),
    rtlcss          = require('gulp-rtlcss'),
    sourcemaps      = require('gulp-sourcemaps'),
    
    //pug plugins
    pug            	= require ('pug'),
    
    
    //For handling npm libraries
    npmMainfiles    = require('gulp-npm-mainfiles'),
    preprocess 		= require('gulp-preprocess'),
    watch           = require('gulp-watch'),
    
    //native node plugins
    fs 				= require('fs')

    //connecting php for form submissions
    php             = require('gulp-connect-php');



/**
 * 
 * Main task for Build, serve & watch the template
 *
*/
gulp.task('bin', ['build', 'serve', 'watch']);






/** =======================================================

 Build from the compilables

======================================================= **/


gulp.task('build', ['build:scss', 'build:assets']);



/** 
 * Compile SCSS files with burbon & autoprefixer
*/
gulp.task('build:scss', function(){
	return gulp.src('./assets/scss/**/*.scss')
        // .pipe(preprocess({context: { ZION_ENV : 'DEBUG'}}))
        .pipe(plumber())
	    .pipe(sourcemaps.init())
	    .pipe(sass({
            outputStyle : 'expanded',
            includePaths: require('node-bourbon').includePaths
        }).on('error', sass.logError))
	    .pipe(autoprefixer({
	        browsers: ['last 5 versions'],
	        cascade: false
	    }))
        .pipe(sourcemaps.write())
        .pipe(plumber.stop())
	    .pipe(gulp.dest('./bin/assets/css'))
	    .pipe(browserSync.stream())
		.pipe(rtlcss()) // Convert to RTL. 
	    .pipe(rename({ suffix: '-rtl' })) // Append "-rtl" to the filename. 
	    .pipe(gulp.dest('./bin/assets/css'))
		.pipe(browserSync.stream());
});







/** =======================================================

 Handle assets

======================================================= **/


gulp.task('build:assets', ['asset:images', 'asset:videos', 'asset:fonts', 'asset:js', 'asset:php', 'asset:lib', 'asset:lang']);



/* Push images */
gulp.task('asset:images', function () {
    return gulp.src('./assets/images/**/{*.jpg,*.png,*.gif,*.ico,*.svg}')
        .pipe(watch('./assets/images/**/{*.jpg,*.png,*.gif,*.ico,*.svg}'))
        .pipe(rename(function(path){
            if(path.basename.substring(0, 6)=='dist--'){
                path.basename = path.basename.substring(6, path.basename.length);
            }
        }))
        .pipe(gulp.dest('bin/assets/images'));
});


/* Push videos */
gulp.task('asset:videos', function () {
    return gulp.src('./assets/videos/**/*.*')
        .pipe(watch('./assets/videos/**/*.*'))
        .pipe(gulp.dest('bin/assets/videos'));
});


/* Push fonts */
gulp.task('asset:fonts', function () {
    return gulp.src('./assets/fonts/**/*')
        .pipe(watch('./assets/fonts/**/*'))
        .pipe(gulp.dest('bin/assets/fonts/'));
});


/* Push js files */
gulp.task('asset:js', function () {
    return gulp.src(['./assets/js/*.js', './zcore/assets/js/core.js'])
        .pipe(watch(['./assets/js/*.js', './zcore/assets/js/core.js']))
        .pipe(preprocess({context: { ZION_ENV : 'DEBUG'}}))
        .pipe(gulp.dest('bin/assets/js/'));
});


/* Push php files */
gulp.task('asset:php', function () {
 	return gulp.src(['./assets/php/**/*.php', './zcore/assets/php/**/*.php'])
 		.pipe(watch(['./assets/php/**/*.php', './zcore/assets/php/**/*.php']))
        .pipe(gulp.dest('bin/assets/php/'));
});





/* Push custom library files */
gulp.task('asset:lib', ['asset:lib:local', 'asset:lib:npm']);


gulp.task('asset:lib:local', function () {
    return gulp.src(['./assets/lib/**/*.*', './zcore/assets/lib/**/*.*'])
        .pipe(watch(['./assets/lib/**/*.*']))
        .pipe(gulp.dest('bin/assets/lib'));
});


/* Push main files from node modules */
gulp.task("asset:lib:npm", function () {
    return gulp.src(npmMainfiles(), { base: "./node_modules" })
        .pipe(gulp.dest('bin/assets/lib'));
});


/* pushing language files for i18n support */
gulp.task('asset:lang', function () {
    return gulp.src(['./assets/lang/**/*.json'])
        .pipe(watch(['/assets/lang/**/*.json']))
        .pipe(gulp.dest('bin/assets/lang'));
});


        


/** =======================================================

 Serve the template

======================================================= **/

/** 
 * Browsersync middleware function
 * Compiles .pug files with browsersync
*/
function compilePug (req, res, next) {
    var parsed = require("url").parse(req.url);
    
    if (parsed.pathname.match(/\.html$/) || parsed.pathname == '/') {
        
        var file = 'index';
        
        if(parsed.pathname != '/'){
            file = parsed.pathname.substring(1, (parsed.pathname.length - 5));
        }

        var html = pug.renderFile(__dirname+'/../../pages/'+file+'.pug', {ZION_ENV:'DEBUG', pretty:true});
        fs.writeFileSync('./bin/'+file+'.html', html);
    }

    next();
}




/** 
 *
 * Serve the template at http://localhost:3000
 * Compiles .pug files on the fly
 *
*/


/** php connec for browsersync **/

gulp.task('serve:php', function() {
    php.server({ base: 'bin/', port: 8010, keepalive: true, debug: false});
});


gulp.task('serve', function(){

    browserSync.init({
        server: {
            baseDir: "bin/"
        },
        // proxy: '127.0.0.1:8010',
        port: 3000,
        open: true,
        notify: false,
        middleware: compilePug
    });

});






/** =======================================================

 The night's watch!

======================================================= **/

gulp.task('watch', function(){
	
	// gulp.watch(['./pages/*.pug', './pug_modules/**/*.pug'], reload);
    watch(['./pages/*.pug', './pug_modules/**/*.pug'], reload);
	gulp.watch(['./bin/assets/**/*.*', '!./bin/assets/css/**/*.*'], reload); 
	gulp.watch(['./assets/scss/**/*.scss', './zcore/assets/scss/**/*.scss'], ['build:scss']);
	
});