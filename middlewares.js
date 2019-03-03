
const _ = require('lodash');
const domains = ['localhost:5001', 'nl-koa-api', 'nl-koa-www'];

module.exports = {
  isValidDomain: (ctx, next) => {
    console.log(ctx.request.header.host)
    if (_.indexOf(domains, ctx.request.header.host) > -1) {
      return next();
    }
    return ctx.badRequest({ error: 'err-invalid-cors-domain' });
  }
};