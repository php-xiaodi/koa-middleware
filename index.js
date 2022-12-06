const { exception } = require('./middleware/exception');
const { openid } = require('./middleware/openid');
const { noStaticCache } = require('./middleware/no-static-cache');
const { nginx } = require('./middleware/nginx');
const { sign } = require('./middleware/sign');
const { requestId } = require('./middleware/requestid');
const { health } = require('./middleware/health');
const { security } = require('./middleware/security');

module.exports = {
  openid,
  exception,
  security,
  noStaticCache,
  nginx,
  requestId,
  health,
  sign
};
