/**
 * 
 * Build the final product
 * Blur images and add `size` as watermak
 * Output folder ./product/HTML
 *
 * @package ZiON
 */



var gulp	        = require('gulp'),
	plumber         = require('gulp-plumber'),
    
    //sass plugins
    autoprefixer    = require('gulp-autoprefixer'),
    rename          = require('gulp-rename'),
    sass            = require('gulp-sass'),
    rtlcss          = require('gulp-rtlcss'),
    sourcemaps      = require('gulp-sourcemaps'),
    
    //pug plugins
    pug				= require ('pug'),
    gulpJade		= require('gulp-pug'),
    prettify        = require('gulp-prettify'),
    // htmlbeautify    = require('gulp-html-beautify'),
    // prettify        = require('gulp-jsbeautifier'),

    npmMainfiles    = require('gulp-npm-mainfiles'),
    preprocess		= require('gulp-preprocess'),
	
	//Graphicsmagick
	gm          = require('gulp-gm');
    


/**
 * 
 * Main task for Building the final product
 *
*/

gulp.task('product', ['product:scss', 'product:pug', 'product:assets']);




/** 
 * Pushing SCSS files as is
*/

gulp.task('product:scss', ['product:css'], function () {
    
    //from template assets
    gulp.src(['./assets/scss/**/*.scss', './zcore/assets/scss/**/*.scss'])
        // .pipe(preprocess({context: { ZION_ENV : 'PRODUCTION'}, options:{fileNotFoundSilentFail:false, type: 'scss'}}))
        .pipe(gulp.dest('./product/HTML/assets/scss'));
});




/** 
 * Compile SCSS and make CSS files with burbon & autoprefixer
*/

gulp.task('product:css', function () {
	
	return gulp.src('./assets/scss/**/*.scss')
        // .pipe(preprocess({context: { ZION_ENV : 'PRODUCTIONCSS'}}))
        .pipe(plumber())
	    .pipe(sass({
            outputStyle : 'expanded',
            includePaths: require('node-bourbon').includePaths
        }).on('error', sass.logError))
	    .pipe(autoprefixer({
	        browsers: ['last 5 versions'],
	        cascade: false
	    }))
        .pipe(plumber.stop())
	    .pipe(gulp.dest('./product/HTML/assets/css'))
		.pipe(rtlcss()) // Convert to RTL. 
	    .pipe(rename({ suffix: '-rtl' })) // Append "-rtl" to the filename. 
	    .pipe(gulp.dest('./product/HTML/assets/css'));
});





/** 
 * Compile .pug files and generate uncompressed HTML
*/

gulp.task('product:pug', function () {

	return gulp.src('./pages/*.pug')
	    .pipe(plumber())
	    .pipe(gulpJade({
	      jade: pug,
	      pretty: true,
	      locals:{ZION_ENV:'PRODUCTION'}
	    }))
        .pipe(prettify({
          indent_inner_html: true,
          indent_size: 4
        }))
        // .pipe(htmlbeautify({
        //     indent_with_tabs: true,
        //     indent_level: 1
        // }))
         // .pipe(prettify({
         //    indent_char: '\t',
         //     indent_size: 1
         // }))
		.pipe(plumber.stop())
	    .pipe(gulp.dest('./product/HTML'));
});





/** 
 * Handle assets & Process images
*/

gulp.task('product:assets', ['product:images', 'product:videos', 'product:fonts', 'product:js', 'product:php', 'product:lib', 'product:asset:lib:npm']);





/* Push images */
gulp.task('product:images', ['product:imagesext'], function () {
	
	return gulp.src('./assets/images/**/{*.jpg,*.png}')

        .pipe(gm(function (gmfile, done) {

            if(gmfile.source.includes("dist--")){
                done(null, gmfile);
                return;
            }
 
            gmfile.size(function (err, size) {
                
                if(typeof size == 'undefined' || !('width' in size)) return;

                var fc = (size.width/100) * 6,
                    bl = (size.width/100) * 4;
                done(null, gmfile
                    .blur(bl, bl)
                    .fill("gray")
                    .font('./zcore/assets/fonts/open-sans/OpenSans-Bold-webfont.ttf')
                    .fontSize(fc+'px')
                    .drawText(0, 0, ""+size.width+" X "+size.height, 'Center')
                 );
         
             });

        }))
        .pipe(rename(function(path){
            if(path.basename.substring(0, 6)=='dist--'){
                path.basename = path.basename.substring(6, path.basename.length);
            }
        }))
        .pipe(gulp.dest('./product/HTML/assets/images/'));
});

gulp.task('product:imagesext', function () {
    
    return gulp.src('./assets/images/**/{*.gif,*.ico,*.svg}')
        .pipe(gulp.dest('./product/HTML/assets/images/'));
});




/* Push videos */
gulp.task('product:videos', function () {
    return gulp.src('./assets/videos/**/*.*')
        .pipe(gulp.dest('product/HTML/assets/videos'));
});


/* Push fonts */
gulp.task('product:fonts', function () {
    return gulp.src('./assets/fonts/**/*.*')
        .pipe(gulp.dest('product/HTML/assets/fonts/'));
});


/* Push js files */
gulp.task('product:js', function () {
    return gulp.src(['./assets/js/*.js', './zcore/assets/js/*.js'])
        .pipe(preprocess({context: { ZION_ENV : 'PRODUCTION'}}))
        .pipe(gulp.dest('product/HTML/assets/js/'));
});


/* Push php files */
gulp.task('product:php', function () {
 	return gulp.src(['./zcore/assets/php/**/*.php', './assets/php/**/*.php'])
        .pipe(gulp.dest('product/HTML/assets/php/'));
});


/* Push main files from node modules */
gulp.task("product:asset:lib:npm", function () {
    return gulp.src(npmMainfiles(), { base: "./node_modules" })
        .pipe(gulp.dest('product/HTML/assets/lib'));
});


/* Push custom library files */
gulp.task('product:lib', function () {
    return gulp.src(['./assets/lib/**/*.*', './zcore/assets/lib/**/*.*'])
        .pipe(gulp.dest('product/HTML/assets/lib'));
});