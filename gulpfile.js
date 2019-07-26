const gulp = require('gulp');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const browserSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');
const imagemin = require('gulp-imagemin');
const imageminPngquant = require('imagemin-pngquant');
const less = require('gulp-less');
const path = require('path');
const gcmq = require('gulp-group-css-media-queries');

let isDev = process.argv.includes('--dev');
let isProd = !isDev;
let isSync = process.argv.includes('--sync');

let config = {
	src: './src/',
	build: './build',
	html: {
		src: '**/*.html',
		dest: '/'
	},
	img: {
		src: 'img/**/*',
		dest: '/img'
	},
	css: {
		src: 'css/style.less',
		watch: 'css/**/*.less',
		dest: '/css'
	}
};

/*
let cssRoot = config.src + config.css.src;

config.css.files = [
	'./node_modules/normalize.css/normalize.css',
	cssRoot + 'base.css',
	cssRoot + 'humans.css'
];
*/

function html() {
	return gulp.src(config.src + config.html.src)
		.pipe(gulp.dest(config.build + config.html.dest))
		.pipe(gulpIf(isSync, browserSync.stream()));
}

function img() {
	return gulp.src(config.src + config.img.src)
		.pipe(gulpIf(isProd, imagemin([
			imageminPngquant({
				quality: [0.7, 0.9]
			})
		])))
		.pipe(gulp.dest(config.build + config.img.dest));
}

function css() {
	return gulp.src(config.src + config.css.src)
		.pipe(gulpIf(isDev, sourcemaps.init()))
		.pipe(less())
		.pipe(gcmq())
		.pipe(autoprefixer({
			browsers: ['> 0.2%']
		}))
		.pipe(gulpIf(isProd, cleanCSS({
			level: 2
		})))
		.pipe(gulpIf(isDev, sourcemaps.write()))
		.pipe(gulp.dest(config.build + config.css.dest))
		.pipe(gulpIf(isSync, browserSync.stream()));
}

function clear() {
	return del(config.build + '/*');
}

function watch() {
	if (isSync) {
		browserSync.init({
			server: {
				baseDir: config.build
			},
			// tunnel: true
		});
	}

	gulp.watch(config.src + config.html.src, html);
	gulp.watch(config.src + config.css.watch, css);
}

let build = gulp.series(clear,
	gulp.parallel(html, img, css)
);

gulp.task('build', build);
gulp.task('watch', gulp.series(build, watch));