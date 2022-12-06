function security({
  csp = 'default-src \'self\' \'unsafe-inline\' \'unsafe-eval\' data: *;'
}) {
  return async (ctx, next) => {
    ctx.set('Content-Security-Policy', csp);
    ctx.set('X-XSS-Protection', '1;mode=block');
    ctx.set('X-Content-Type-Options', 'nosniff');
    ctx.set('Strict-Transport-Security', 'max-age=15724800; includeSubDomains');
    ctx.set('X-Frame-Option', 'SAMEORIGIN');
    await next();
  };
}

module.exports = { security };
