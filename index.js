const config = require('./config/config');
const glob = require('glob');
const path = require('path');
const _ = require('lodash');
const async = require('async');
const Koa = require('koa');
const koaRouter = require('koa-router');
const logger = require('koa-logger');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');
const helmet = require('koa-helmet');
const respond = require('koa-respond');
const body = require('koa-body');
const db = require('./integrations/mongodb');
const app = new Koa();
const router = new koaRouter();
const PORT = config.PORT;

// app.on('error', (err, ctx) => {
//   log.error('server error', err, ctx);
// });

db.connect();

if (process.env.NODE_ENV !== 'production') {
  app.use(logger());
}

app.use(helmet());
app.use(respond());
app.use(cors());
app.use(body({ multipart: true }))
app.use(bodyParser({
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