var gulp = require('gulp');//引入gulp
var browserSync = require('browser-sync').create();//浏览器自动刷新

var useref = require('gulp-useref');//合并文件
var gulpIf = require('gulp-if');//合并文件时判断文件类型

var sass = require('gulp-sass');//预编译sass
var autoprefixer = require('gulp-autoprefixer');//浏览器前缀自动添加
var minifyCss = require('gulp-clean-css');//引入压缩css的插件

var jshint = require('gulp-jshint');//校验js文件
var uglify = require('gulp-uglify');//压缩js文件

var imagemin = require('gulp-imagemin');//图片压缩
var cache = require('gulp-cache');//缓存图片

var runSequence = require('run-sequence');//任务执行队列
var del = require('del');//删除构建文件

/**
 * 设置本地服务
 */
gulp.task('server', function () {
    browserSync.init({
        server: {
            baseDir: 'public'//服务启动基目录
        },
        port: '8080'//服务端口
    });
});

/**
 * 编译sass
 */
gulp.task('sass', function () {
    return gulp.src('public/scss/**/*.scss') //sass文件路径
            .pipe(sass())//编译sass
            .pipe(autoprefixer({
                browser: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'Firefox >= 20', 'opera 12.1', 'ios 6', 'android 4'],
                cascade: true, //是否美化属性值 默认：true
                remove: true //是否去掉不必要的前缀 默认：true
            }))//自动添加浏览器前缀
            .pipe(gulp.dest('public/css')) //sass编译后的css文件路径
            .pipe(browserSync.reload({
                stream: true
            }));//编译sass后自动刷新浏览器

});

/**
 * 压缩图片
 */
gulp.task('images', function () {
    return gulp.src('public/images/**/*.+(png|jpg|jpeg|gif|svg)')
            .pipe(cache(imagemin({
                optimizationLevel: 3,//优化等级0-7
                progressive: true,//无损压缩jpg图片,默认：false
                interlaced: true,//隔行扫描gif进行渲染,默认：false
                multipass: true //多次优化svg直到完全优化,默认：false
            })))
            .pipe(gulp.dest('dist/images'));
});

/**
 * 复制字体
 */
gulp.task('fonts', function () {
    return gulp.src('public/fonts/**/*')
            .pipe(gulp.dest('dist/fonts'));
});

/**
 * 复制插件
 */
gulp.task('plugins', function () {
    return gulp.src('public/plugins/**/*')
            .pipe(gulp.dest('dist/plugins'));
});

/**
 * 事件监听
 */
gulp.task('watch', function () {
    gulp.watch('public/**/*', browserSync.reload);//监听文件变化，自动刷新浏览器
    gulp.watch('public/scss/**/*.scss', ['sass']);//监听sass文件变化,并自动编译
});

/**
 * 校验js代码
 */
gulp.task('scripts', function () {
    return gulp.src('public/js/**/*.js')
            .pipe(gulpIf('*.js', jshint()))//校验js文件
            .pipe(gulpIf('*.js', jshint.reporter('default')));
});

/**
 * 构建html及其依赖的css和js
 */
gulp.task('useref', function () {
    return gulp.src('public/*.html')//html文件路径
            .pipe(useref())//合并html中引入的css和js文件
            .pipe(gulpIf('*.js', uglify()))//压缩js文件
            .pipe(gulpIf('*.css', minifyCss()))//压缩css文件
            .pipe(gulp.dest('dist'));//指定构建目录
});

/**
 * 开发阶段默认执行的任务
 */
gulp.task('default', function (callback) {
    runSequence(['server', 'sass', 'watch', 'scripts'], callback);
});

/**
 * 生成阶段构建项目
 */
gulp.task('bulid', function (callback) {
    runSequence(['useref', 'plugins', 'images', 'fonts'], callback);
});

/**
 * 删除构建文件
 */
gulp.task('delete', function () {
    del(['dist/**/*', '!dist/images', '!dist/images/**/*']);
});