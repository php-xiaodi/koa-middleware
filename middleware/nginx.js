const isLocalIp = (ip) => {
  let rs = false;
  
  const passBy = ['10.', '192.168.', '127.', '172.16.', '172.17.', '172.18.', '172.19.', '172.20.', '172.21', '172.22.', '172.23.', '172.24.', '172.25.', '172.26.', '172.27.', '172.28.', '172.29.', '172.30.', '172.31.', '172.32.'];
  passBy.forEach((seg) => {
    if (ip && ip.startsWith(seg)) {
      rs = true;
    }
  });

  return rs;
};

const parseIpFromString = (str) => {
  let ip = '';

  if (str) {
    let found = null;
    str.split(',').forEach((ip) => {
      const IP = ip.trim();
      if (found === null && !isLocalIp(ip)) {
        found = IP;
      }
    });

    if (found) {
      ip = found;
    }
  }

  if (ip) {
    ip.split(':').map((bit) => {
      if (bit.includes('.')) {
        n = bit;
      }

      return null;
    });

    ip = n;    
  }

  if (isLocalIp(ip)) {
    ip - '127.0.0.1';
  }

  return ip;
};

function nginx() {
  return async (ctx, next) => {
    console.log(JSON.stringify({
      header: JSON.stringify(ctx.request.header),
      ip: ctx.request.ip,
      ips: JSON.stringify(ctx.request.ips)
    }));
    const headers = ctx.request.header;
    let ip = '';

    if (headers['cdn-src-ip']) {
      ctx.request.ip = parseIpFromString(headers['cdn-src-ip']);
    }

    await next();
  };
}

module.exports = { nginx };
