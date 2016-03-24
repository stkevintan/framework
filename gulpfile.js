"use strict"
//const serve = require('gulp-serve');
//const livereload = require('gulp-livereload');
const webpack = require('webpack');
const gutil = require('gulp-util');
const gulp = require('gulp');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('./webpack.config.js');
//const inject = require('connect-livereload')({port:3000});
const path = require('path');
const del = require('del');
const sass = require('gulp-sass');
const jade = require('gulp-jade');
const connect = require('gulp-connect');
let config = Object.create(webpackConfig);
const devComplier = webpack(config);

const PATHS = {
    scripts: 'src/scripts/**/*.js',
    //asserts: ['src/styles/**/*', 'index.html'],
    styles: 'src/styles/**/*',
    templates: 'src/templates/**/*.jade'
}

//const Statics = Array.of(PATHS.styles, PATHS.templates);

gulp.task('del:styles', () => del('dist/assets/css/*'));
gulp.task('styles', ['del:styles'], () => (
    gulp.src(PATHS.styles)
        .pipe(sass({
            outputStyle: 'compressed'
        })).on('error', sass.logError)
        .pipe(gulp.dest('dist/assets/css'))
        .pipe(connect.reload())
));

gulp.task('del:templates', () => del('dist/*.html'));
gulp.task('templates', ['del:templates'], () => (
    gulp.src(PATHS.templates)
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest('dist/'))
        .pipe(connect.reload())
));


gulp.task('del:scripts', () => del('dist/assets/js/*'));
gulp.task('scripts', ['del:scripts'], cb => {
    devComplier.run((err,stats) =>{
        if (err) throw new gutil.pluginError('webpack:build-dev', err);
        gutil.log('[webpack:build-dev]', stats.toString({
            colors: true
        }));
        cb();
    })
});

gulp.task('default', ['watch']);

gulp.task('compile', ['templates', 'styles','scripts']);

gulp.task('watch', ['compile', 'connect', 'webpack:dev-server'], () => {
    //gulp.watch(PATHS.scripts, ['webpack:build-dev']);
    gulp.watch(PATHS.styles, ['styles']);
    gulp.watch(PATHS.templates, ['templates']);
});

//static server
gulp.task('connect', () => {
    connect.server({
        root: 'dist',
        port: 3000,
        livereload: true
    })
});

gulp.task('webpack:dev-server', () => {
    let devConf = Object.create(config);
    devConf.entry = Array.of(devConf.entry).unshift('webpack-dev-server/client?http://localhost:8080', 'webpack/hot/dev-server');
    const compiler = webpack(devConf);
    new WebpackDevServer(compiler, {
        historyApiFallback: false,
        proxy: {
            '*': 'http://localhost:3000'
        },
        publicPath: '/dist/',
        lazy: false,
        hot: true
    }).listen(8080, 'localhost', err => {
        if (err) throw new gutil.PluginError('webpack-dev-server', err);
        gutil.log('[webpack-dev-server]', 'http://localhost:8080');
    });
});
