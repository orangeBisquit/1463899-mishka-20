const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("gulp-csso");
const rename = require("gulp-rename");

const htmlmin = require("gulp-htmlmin");

const uglify = require("gulp-uglify");
const pipeline = require("readable-stream").pipeline;

const sync = require("browser-sync").create();

const imagemin = require("gulp-imagemin");
const del = require("del");

// Styles
const styles = () => {
  return gulp
    .src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer()]))
    .pipe(csso())
    .pipe(rename("styles.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
};

exports.styles = styles;

// HTML Minification
const minify = () => {
  return gulp
    .src("source/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("build"));
};

exports.minify = minify;

// JS Minification
const compress = () => {
  return pipeline(
    gulp.src("source/js/*.js"),
    uglify(),
    rename(function (path) {
      path.basename += ".min";
    }),
    gulp.dest("build/js")
  );
};

exports.compress = compress;

// Server
const server = (done) => {
  sync.init({
    server: {
      baseDir: "build",
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("source/*.html").on("change", sync.reload);
};

exports.default = gulp.series(styles, server, watcher);

// Image Optimization

const images = () => {
  return gulp
    .src("source/img/**/**/*.{jpg,png,svg}")
    .pipe(
      imagemin([
        imagemin.optipng({ optimizationLevel: 3 }),
        imagemin.mozjpeg({ progressive: true }),
        imagemin.svgo(),
      ]).pipe(gulp.dest("build/img"))
    );
};

exports.images = images;

// Copy

const clean = () => {
  return del("build");
};

exports.clean = clean;

const copy = () => {
  return gulp
    .src(
      [
        "source/fonts/**/*.{woff,woff2}",
        "source/img/**",
        "source/img/icons/**",
        "source/img/webp/**",
        "source/*.ico",
      ],
      {
        base: "source",
      }
    )
    .pipe(gulp.dest("build"));
};

exports.copy = copy;

// Build

const build = gulp.series(clean, copy, images, minify, compress, styles);

exports.build = build;

// Build & Start

const start = gulp.series(build, server, watcher);

exports.start = start;
