function noStaticCache(env = 'dev') {
  return async (ctx, next) => {
    if (['prod', 'qa', 'staging', 'test'].includes(env) && (ctx.path.endsWith('png') || ctx.path.endsWith('css') || ctx.path.endsWith('js') || ctx.path.endsWith('jpg'))) {
      ctx.cacheControl = {
        maxAge: 6000,
        public: true
      };
    }
    await next();
  };
}

module.exports = { noStaticCache };
