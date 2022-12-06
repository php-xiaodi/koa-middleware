const pgSign = require('@pysche/sign');
const redis = require('@pysche/redis');
const log4js = require('@pysche/log4js');

function sign({ wxappid, required, antiReplay }) {
  return async (ctx, next) => {
    const { path } = ctx.request;
    const token = ctx.header.authorization || '';
    const params = ctx.request.method === 'POST' ? ctx.request.body : ctx.request.query;
    const staticRequired = required.filter((url) => typeof url === 'string').includes(path);
    const regxRequired = required.filter((url) => typeof url === 'object').map((itm) => itm.reg).find((mode) => (new RegExp(mode).test(path)));

    if (staticRequired || regxRequired) {
      const requestid = ctx.state ? ctx.state.id : '';
      if ((!params.sig || (params.sig && !pgSign.loose(wxappid, token, params)))) {
        ctx.status = 401;
        ctx.body = {
          code: 401,
          message: 'Unauthorized Request'
        };

        log4js.json({
          app_name: 'exception',
          mercury_app_name: process.env.MERCURY_APP_NAME || '',
          api_name: 'middleware-sign',
          requestid,
          message: 'Sign mis-match',
          params: JSON.stringify(ctx.request.method === 'POST' ? ctx.request.body : ctx.request.query),
          dimension: {
            path: ctx.request.path
          }
        });
      } else if (antiReplay === true) {
        const used = await redis.get(`sig_used_${params.sig}`);
        if (used) {
          ctx.status = 403;
          ctx.body = {
            code: 403,
            message: 'Unauthorized Request'
          };

          log4js.json({
            app_name: 'exception',
            mercury_app_name: process.env.MERCURY_APP_NAME || '',
            api_name: 'middleware-sign',
            requestid,
            message: 'Sign replay',
            params: JSON.stringify(ctx.request.method === 'POST' ? ctx.request.body : ctx.request.query),
            dimension: {
              path: ctx.request.path
            }
          });
        } else {
          redis.set(`sig_used_${params.sig}`, true, 3600 * 24);
          await next();
        }
      } else {
        await next();
      }
    } else {
      await next();
    }
  };
}

module.exports = { sign };
