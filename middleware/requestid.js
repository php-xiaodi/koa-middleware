function requestId() {
  return async (ctx, next) => {
    ctx.requestid = ctx.state ? ctx.state.id : '';
    await next();
  };
}

module.exports = { requestId };
