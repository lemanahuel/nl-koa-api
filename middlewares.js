
const _ = require('lodash');
const domains = ['http://localhost:5000', 'https://nl-koa-api.herokuapp.com', 'https://nl-koa-www.herokuapp.com'];

module.exports = {
  isValidDomain: (ctx, next) => {
    if (_.indexOf(domains, ctx.request.header.origin) > -1) {
      return next();
    }
    return ctx.badRequest({ error: 'err-invalid-origin-domain', origin: ctx.request.header.origin });
  }
};