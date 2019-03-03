const db = require('mongoose');
const Koa = require('koa');
const koaRouter = require('koa-router');
const koaLogger = require('koa-logger');
const koaCors = require('@koa/cors');
const koaBodyParser = require('koa-bodyparser');
const koaHelmet = require('koa-helmet');
const koaRespond = require('koa-respond');
const koaBody = require('koa-body');
const app = new Koa();
const router = new koaRouter();
const PORT = process.env.PORT || 5001;
const glob = require('glob');
const path = require('path');
const _ = require('lodash');
const async = require('async');

const connectDb = () => {
  db.connect('mongodb://127.0.0.1:27017/todo-list', {
    promiseLibrary: global.Promise,
    useNewUrlParser: true
  }).then(() => {
    // console.log('db-connect', DB_URI);
  }, err => {
    // console.log('err-db-connect', err);
    connectDb();
  });
};

db.Promise = global.Promise;
connectDb();

// app.on('error', (err, ctx) => {
//   log.error('server error', err, ctx);
// });

if (process.env.NODE_ENV !== 'production') {
  app.use(koaLogger());
}

app.use(koaBody({ multipart: true }))
app.use(koaHelmet());
app.use(koaRespond());
app.use(koaCors());
app.use(koaBodyParser({
  enableTypes: ['json'],
  jsonLimit: '5mb',
  strict: true,
  onerror: function (err, ctx) {
    ctx.throw('body parse error', 422)
  }
}));

// app.use(async ctx => {
//   // the parsed body will store in ctx.request.body
//   // if nothing was parsed, body will be an empty object {}
//   ctx.body = ctx.request.body;
// });

// API routes
glob('./modules/**/*.routes.js', {}, (err, files) => {
  async.each(files, (file, cb) => {
    require(path.resolve(file))(router);
    cb(null);
  }, err => {
    app.use(router.routes());
    app.use(router.allowedMethods());
    app.listen(PORT, () => console.log(`KOA-API server started on ${PORT}`))
  });
});