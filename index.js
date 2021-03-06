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
const static = require('koa-static');
const session = require('koa-session');
const Pug = require('koa-pug');
const db = require('./integrations/mongodb');
const app = new Koa();
const router = new koaRouter();

db.connect();

if (process.env.NODE_ENV !== 'production') {
  app.use(logger());
}

app.on('error', (err, ctx) => {
  console.error('server error', err, ctx);
});

const pug = new Pug({
  viewPath: './public/docs',
  basedir: './public/docs',
  app: app
});
//GLOBALES
pug.locals = {
  name: 'KOA-API con PUG'
};

app.use(static('./public'));
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

app.keys = ['codigo secreto de la sesion de koa'];

app.use(session({
  key: 'koa:sess',
  maxAge: 86400000,
  autoCommit: true,
  overwrite: true,
  httpOnly: true,
  signed: true,
  rolling: false,
  renew: false
}, app));

// app.use(async ctx => {
//   // the parsed body will store in ctx.request.body
//   // if nothing was parsed, body will be an empty object {}
//   ctx.body = ctx.request.body;
// });

// API routes
router.all('/', ctx => {
  ctx.redirect('/docs');
  ctx.status = 301;
});

glob('./modules/**/*.routes.js', {}, (err, files) => {
  async.each(files, (file, cb) => {
    require(path.resolve(file))(router);
    cb(null);
  }, err => {
    router.all('/docs', ctx => {
      ctx.render('index.pug', {
        description: 'Probando templating con PUG',
        endpoints: _.map(_.filter(router.stack, stack => {
          return stack.path.length > 1 && stack.path !== '/docs';
        }), stack => {
          return {
            path: stack.path,
            methods: stack.methods
          };
        }),
      }, {}, true);
    });
    app.use(router.routes());
    app.use(router.allowedMethods());
    app.listen(config.PORT, () => console.log(`KOA-API server started on ${config.PORT}`))
  });
});