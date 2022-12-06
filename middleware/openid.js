const util = require('util');
const jwt = require('jsonwebtoken');

const verify = util.promisify(jwt.verify);

const openid = (jwtUnless, secret) => async (ctx, next) => {
  const { path } = ctx.request;
  ctx.openid = false;
  let inUnless = false;
  jwtUnless.forEach(uPath => {
    if (uPath.test(path)) {
      inUnless = true;
    }
  });

  try {
    const { authorization } = ctx.header;
    let token = ctx.cookies.get('token');

    if (authorization) {
      [, token] = authorization.split(' ');
    }

    if (token) {
      const jwtrs = await verify(token, secret);
      const { openid, unionid } = jwtrs;

      ctx.openid = openid;
      ctx.unionid = unionid;
    }
  } catch (e) {
    console.error('middleware exception in openid', e.message);
  }

  if (inUnless || (!inUnless && ctx.openid)) {
    await next();
  } else {
    ctx.status = 401;
    ctx.body = { code: 1000, message: 'Token invalid' };
  }
};

module.exports = { openid };
