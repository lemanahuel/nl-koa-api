
const _ = require('lodash');
const config = require('./config/config');

module.exports = {
  isValidDomain: (ctx, next) => {
    if (_.includes(config.WHITE_LIST_DOMAINS, ctx.request.header.origin)) {
      return next();
    }
    return ctx.badRequest({ error: 'err-invalid-origin-domain', origin: ctx.request.header.origin });
  }
};