const config = require('config');

const health = () => async (ctx, next) => {
  if (ctx.url === `${config.get('router.prefix')}/health`) {
    ctx.url = '/readiness';
  } else if (ctx.url === `${config.get('router.prefix')}/prometheus`) {
    ctx.url = '/prometheus';
  }

  await next();
};

module.exports = { health };
