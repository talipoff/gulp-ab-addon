// Remove next line
/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved */
'use strict';
const gulp = require('gulp');
const xo = require('gulp-xo');
const sass = require('gulp-sass');
// Const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css'); // https://github.com/jakubpawlowicz/clean-css#how-to-use-clean-css-api
const htmlmin = require('gulp-htmlmin'); // https://github.com/kangax/html-minifier
const replace = require('gulp-replace');
const debug = require('gulp-debug');
const abFilter = require('gulp-ab-filter');
const addon = require('gulp-ab-addon');

const project = {
	sourceDir: 'source',
	destDir: 'www', // debug version
  // DestDirP: 'wwwp', // production version
	source: {
		jsRoot: './*.js', // If key starts with '.' sourceDir omit
		js: '/js/**/*.js',
		css: '/scss/*.scss',
		html: '/*.html',
		json: '/*.json',
		manifest: '/*.manifest',
		favicon: '/favicons/*.*',
		tmpl: '/tmpl/*.*',
		wav: '/wav/*.*'
	},
	destination: { // Keys as in source
		js: '/js',
		css: '/css',
		wav: '/wav',
		tmpl: '/tmpl',
		other: '/' // Use if key not present
	},
	handler: { // Keys as in source
		jsRoot: js,
		js,
		css,
		html,
		tmpl: html,
		other: copy // Use if key not present
	}
};

gulp.task('test', () => {
	gulp.src([project.source.jsRoot, project.sourceDir + project.source.js])
    .pipe(xo().on('error', addon.error))
    .pipe(debug({title: 'testEnd:'}))
  ;
});

addon.makeTasks(project, gulp);

// Copy files to work folder and copy optimized files to production folder
function js(source, destination) {
	const opt = source[0] === '.' ? {} : {base: project.sourceDir}; // That cut when you build the way to destination
	return gulp.src(source, opt)
    .pipe(abFilter('!vendor/**/*.js', { // Don't test vendor files
	yes: xo().on('error', addon.error)
}))
    .pipe(abFilter('!*.js')) // Stop root files
    .pipe(gulp.dest(project.destDir + destination))
    .pipe(abFilter(project.destDirP !== '')) // Stop if not set production folder
    .pipe(abFilter('!*.debug.js')) // Stop debug files
    .pipe(uglify().on('error', addon.error))
    .pipe(gulp.dest(project.destDirP + destination))
  ;
}

// Copy files to work folder and copy optimized files to production folder
function css(source, destination) {
	return gulp.src(source)
    .pipe(sass().on('error', sass.logError))
    // .pipe(autoprefixer({browsers: ['last 2 versions'], cascade: false}))
    .pipe(gulp.dest(project.destDir + destination))
    .pipe(abFilter(project.destDirP !== '')) // Stop if not set production folder
    .pipe(cleanCSS().on('error', addon.error))
    .pipe(gulp.dest(project.destDirP + destination))
  ;
}

// Only copy files to work and production folders
function copy(source, destination) {
	return gulp.src(source)
    .pipe(gulp.dest(project.destDir + destination))
    .pipe(abFilter(project.destDirP !== '')) // Stop if not set production folder
    .pipe(gulp.dest(project.destDirP + destination));
}

// Copy files to work folder and copy optimized files to production folder
function html(source, destination) {
	const regEl = [/\{\{[^}]+\}\}/];
	const htmlminOptions = {
		collapseWhitespace: true,
		caseSensitive: true,
		ignoreCustomFragments: regEl, // Don't change template elements
		minifyJS: source.indexOf('/tmpl/') === -1, // Don't minify templates
		removeComments: true
	};
	return gulp.src(source)
    .pipe(gulp.dest(project.destDir + destination))
    .pipe(abFilter(project.destDirP !== '')) // Stop if not set production folder
    .pipe(replace(/<!-- debug -->[^]*?<!-- \/debug -->/gm, '')) // Remove debug elements
    .pipe(htmlmin(htmlminOptions).on('error', addon.error))
    .pipe(gulp.dest(project.destDirP + destination))
  ;
}
