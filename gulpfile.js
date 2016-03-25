"use strict"
//system-wide dependencies
const path = require('path');
const opn = require('opn');
//dev dependencies
const gulp = require('gulp');
const gutil = require('gulp-util');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const del = require('del');
const sass = require('gulp-sass');
const jade = require('gulp-jade');
const connect = require('gulp-connect');
const plumber = require('gulp-plumber');
const empty  = require('gulp-empty');
// release dependencies
let autoprefixer = require('gulp-autoprefixer');
let imagemin = require('gulp-imagemin');
let pngquant = require('imagemin-pngquant');
//define constraints
const DEBUG = true;
const HOST = 'localhost';
const PORT = 8083;
const BACKEND_PORT = PORT+1;
const PATHS = {
    scripts: 'src/scripts/**/*.(js|jsx)',
    styles: 'src/styles/**/*',
    templates: 'src/templates/**/*.jade',
    images:'src/images/**/*',
    fonts: 'src/fonts/**/*'
}
const DESTROOT = DEBUG ? 'dist' : 'release';

let webpackConfig = require('./webpack.config.js');
webpackConfig.output.path =  path.join(__dirname , DESTROOT,'assets/js');

if(DEBUG) imagemin = empty;

gulp.task('del:styles', () => del(`${DESTROOT}/assets/css/*`));
gulp.task('styles', ['del:styles'], () => (
  //outputStyle: [(Defualt)Nested,expanded,compact,compressed]
    gulp.src(PATHS.styles)
        .pipe(plumber())
        .pipe(sass({
            outputStyle: DEBUG?'Nested':'compressed'
        })).on('error', sass.logError)
        .pipe(autoprefixer())
        .pipe(gulp.dest(`${DESTROOT}/assets/css`))
        .pipe(connect.reload())
));

gulp.task('del:templates', () => del(`${DESTROOT}/*.html`));
gulp.task('templates', ['del:templates'], () => (
    gulp.src(PATHS.templates)
        .pipe(plumber())
        .pipe(jade({
            pretty: DEBUG
        }))
        .pipe(gulp.dest(`${DESTROOT}/`))
        .pipe(connect.reload())
));

gulp.task('del:scripts', () => del('dist/assets/js/*'));
gulp.task('scripts', ['del:scripts'], cb => {
    if(!DEBUG) {
        webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
            compress:{warnings:false}
        }));
    }
    webpack(webpackConfig).run((err,stats) =>{
        if (err) throw new gutil.pluginError('webpack:build', err);
        gutil.log('[webpack:build-dev]', stats.toString({
            colors: true
        }));
        cb();
    })
});

gulp.task('del:images',() => del(`${DESTROOT}/assets/img/*`));
gulp.task('images',() =>(
    gulp.src(PATHS.images)
    .pipe(plumber())
    .pipe(imagemin({
        progressive: true,
        interlaced: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
    }))
    .pipe(gulp.dest(`${DESTROOT}/assets/img/`))
    .pipe(connect.reload())
));

gulp.task('del:fonts',() => del(`${DESTROOT}/assets/fonts/*`));
gulp.task('fonts',() =>(
    gulp.src(PATHS.fonts)
    .pipe(plumber())
    .pipe(gulp.dest(`${DESTROOT}/assets/fonts/`))
    .pipe(connect.reload())
))

gulp.task('compile', ['templates', 'styles' ,'scripts', 'images' , 'fonts']);

gulp.task('watch', ['templates', 'styles' ,'images' , 'fonts', 'server:gulp', 'server:webpack'], () => {
    gulp.watch(PATHS.styles, ['styles']);
    gulp.watch(PATHS.templates, ['templates']);
    opn(`http://${HOST}:${PORT}`,{
      //app:'firefox'
    }).then(() => {
        gutil.log('browser has opened');
    });
});

//static server
gulp.task('server:gulp', () => {
    connect.server({
        root: `${DESTROOT}`,
        port: BACKEND_PORT,
        host: HOST,
        livereload: true
    });
    gutil.log('[gulp server started]',`http://${HOST}:${BACKEND_PORT}`);
});

gulp.task('server:webpack', () => {
    webpackConfig.entry.app.unshift(`webpack-dev-server/client?http://${HOST}:${PORT}`, 'webpack/hot/dev-server');
    const compiler = webpack(webpackConfig);
    new WebpackDevServer(compiler, {
        historyApiFallback: false,
        proxy: {
            '*': `http://${HOST}:${BACKEND_PORT}`
        },
        lazy: false,
        hot: true,
        progress:true,
        color:true,
        publicPath:'/assets/js/'
    }).listen(PORT, HOST, err => {
        if (err) throw new gutil.PluginError('webpack-dev-server', err);
        gutil.log('[webpack server started]', `http://${HOST}:${PORT}`);
    });
});

//watch or compile
gulp.task('default', ['watch']);
