const log4js = require('@pysche/log4js');
const dayjs = require('@pysche/dayjs');
const { pathOr } = require('ramda');

function exception(errors) {
  return async (ctx, next) => {
    try {
      const resp = ctx.response;
      const json = resp.body;
      const final = {
        code: 0,
        message: 'Unknown error'
      };

      if (json && json.code) {
        final.code = parseInt(json.code);

        if (typeof json.msg === 'string') {
          final.message = json.msg;
        } else if (typeof json.msg === 'object') {
          final.message = json.msg.description;
        }

        ctx.body = final;
      }

      await next();
    } catch (e) {
      if (e.isBoom) {
        ctx.status = e.output.statusCode;
      }

      if (e.status === 400) {
        ctx.body = {
          code: 400,
          message: e.message
        };
      }

      if (e.errorCode) {
        ctx.body = {
          code: e.errorCode,
          message: e.message
        };
      } else if (e.code) {
        ctx.body = {
          code: e.code,
          message: e.message
        };
      }

      if (parseInt(e.message) || 0) {
        const errorKey = parseInt(e.message);

        log4js.json({
          app_name: 'exception',
          api_name: ctx.request.path,
          request_id: ctx.state.id,
          call_time: ctx.request_time,
          response_time: dayjs().valueOf() - ctx.request_time,
          error_code: errorKey || 99999,
          error_code_alias: errors[errorKey],
          stack: JSON.stringify(e.stack),
          http_status_code: ctx.status,
          http_method: ctx.request.method,
          requestid: ctx.requestid || '',
          platform: 'b2c',
          api_name_with_method: `${ctx.request.method} ${ctx.request.url}`,
          pod_name: process.env.HOSTNAME,
          api_key: '',
          user_agent: ctx.headers['user-agent'],
          x_forwarded_for: ctx.headers['x-forwarded-for'] || '',
          dimension: {
            query: JSON.stringify(ctx.request.query || {}),
            params: JSON.stringify(ctx.request.params || {}),
            body: JSON.stringify(ctx.request.body || {}),
            response: ctx.body === 'string' ? ctx.body : JSON.stringify(ctx.body),
            ...(typeof ctx.dimension === 'object' ? ctx.dimension : {})
          }
        });

        ctx.body = {
          code: errorKey,
          message: errors[errorKey],
          data: e.data
        };
      } else {
        log4js.json({
          app_name: 'exception',
          api_name: ctx.request.path,
          request_id: ctx.state.id,
          call_time: ctx.request_time,
          response_time: dayjs().valueOf() - ctx.request_time,
          error_code: pathOr(99999, ['body', 'code'], ctx),
          error_code_alias: e.message,
          stack: JSON.stringify(e.stack),
          http_status_code: ctx.status,
          http_method: ctx.request.method,
          requestid: ctx.requestid || '',
          platform: 'b2c',
          api_name_with_method: `${ctx.request.method} ${ctx.request.url}`,
          pod_name: process.env.HOSTNAME,
          api_key: '',
          user_agent: ctx.headers['user-agent'],
          x_forwarded_for: ctx.headers['x-forwarded-for'] || '',
          dimension: {
            query: JSON.stringify(ctx.request.query || {}),
            params: JSON.stringify(ctx.request.params || {}),
            body: JSON.stringify(ctx.request.body || {}),
            response: ctx.body === 'string' ? ctx.body : JSON.stringify(ctx.body),
            ...(typeof ctx.dimension === 'object' ? ctx.dimension : {})
          }
        });
      }

      if (!ctx.body) {
        ctx.status = 500;
        ctx.body = {
          code: 99999,
          message: 'Unknown error'
        };
      }
    }
  };
}

module.exports = {
  exception
};
