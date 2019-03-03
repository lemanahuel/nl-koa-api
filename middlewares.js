
const _ = require('lodash');
const domains = ['localhost:5000', 'nl-koa-api.herokuapp.com', 'nl-koa-www.herokuapp.com'];

module.exports = {
  isValidDomain: (ctx, next) => {
    if (_.indexOf(domains, ctx.request.header.origin) > -1) {
      return next();
    }
    return ctx.badRequest({ error: 'err-invalid-origin-domain' });
  }
};