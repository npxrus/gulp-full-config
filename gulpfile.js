import gulp from "gulp";
import del from "del";
import browserSync from "browser-sync";
import pug from "gulp-pug";
import htmlMin from "gulp-htmlmin";
import sass from "gulp-sass";
import mqGroup from "gulp-group-css-media-queries";
import postCSS from "gulp-postcss";
import csso from "postcss-csso";
import autoprefixer from "autoprefixer";
import babel from "gulp-babel";
import terser from "gulp-terser";

// System
const server = browserSync.create();

const paths = {
  layout: {
    src: ["src/index.pug", "src/views/pages/*.pug"],
    dest: "dist/",
    watch: "src/**/*.pug",
  },
  styles: {
    src: "src/assets/styles/main.scss",
    dest: "dist/assets/styles/",
    watch: "src/assets/styles/**/*.scss",
  },
  scripts: {
    src: "src/assets/scripts/main.js",
    dest: "dist/assets/scripts/",
    watch: "src/assets/scripts/**/*.js",
  },
};

// Service
const clean = () => del(["dist"]);

const copy = () => {
  return gulp
    .src(["src/assets/fonts/**/*", "src/assets/images/**/*"], {
      base: "src",
    })
    .pipe(gulp.dest("dist/"))
    .pipe(server.stream({ once: true }));
};

const serve = (done) => {
  server.init({
    server: {
      baseDir: "./dist",
    },
  });
  done();
};

// Layout
const html = () => {
  return gulp
    .src(paths.layout.src)
    .pipe(pug())
    .pipe(htmlMin({ removeComments: true, collapseWhitespace: true }))
    .pipe(gulp.dest(paths.layout.dest))
    .pipe(server.stream());
};

// Styles
const css = () => {
  return gulp
    .src(paths.styles.src)
    .pipe(sass({ outputStyle: "compressed" }))
    .pipe(postCSS([autoprefixer, csso]))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(server.stream());
};

// Scripts
const js = () => {
  return gulp
    .src(paths.scripts.src)
    .pipe(babel({ presets: ["@babel/preset-env"] }))
    .pipe(terser())
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(server.stream());
};

// Watcher
const watch = () => {
  gulp.watch(paths.layout.watch, gulp.series(html));
  gulp.watch(paths.styles.watch, gulp.series(css));
  gulp.watch(paths.scripts.watch, gulp.series(js));
  gulp.watch(
    ["src/assets/fonts/**/*", "src/assets/images/**/*"],
    gulp.series(copy)
  );
};

// Export
export default gulp.series(
  clean,
  gulp.parallel(html, css, js, copy),
  gulp.parallel(serve, watch)
);
