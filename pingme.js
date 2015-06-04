var http = require('http');
var https = require('https');

module.exports = pingme;

function pingme(options) {
  if (!options || typeof options !== 'object')
    throw new TypeError('options object required');
  if (typeof options.status !== 'function')
    throw new TypeError('status function required');
  if (typeof options.ping !== 'function')
    throw new TypeError('ping function required');

  var ping = options.ping;
  var status = options.status;

  var server = options.server;
  var hijack = !!server;
  if (!server) {
    if (options.ssl)
      server = https.createServer(options.ssl);
    else
      server = http.createServer();
  }

  if (hijack) {
    server.emit = function (orig) { return function (ev, q, s) {
      if (ev === 'request' && (q.url === '/ping' || q.url === '/status'))
        onRequest(q, s);
      else
        orig.apply(this, arguments);
    }}(server.emit);
  } else {
    server.on('request', onRequest);
  }

  function onRequest(q, s) {
    switch(q.url) {
    case '/ping':
      s.setHeader('content-type', 'text/plain');
      ping(function(er) {
        if (er) {
          s.statusCode = er.statusCode || 500;
          s.end(er.message);
        } else {
          s.end('OK\n');
        }
      });
      break;
    case '/status':
      s.setHeader('content-type', 'application/json');
      var start = Date.now();
      status(function(er, data) {
        var d = {};
        if (er)
          s.statusCode = er.statusCode || 500;
        d.status = er ? er.message : 'OK';
        d.responseTime = new Date() - start;
        d.pid = process.pid;
        d.app = process.title;
        d.host = process.env.SMF_ZONENAME || process.env.HOSTNAME;
        d.uptime = process.uptime();
        Object.keys(data || {}).forEach(function(k) {
          d[k] = data[k];
        });
        s.end(JSON.stringify(d));
      });
      break;
    default:
      s.setHeader('content-type', 'text/plain');
      s.statusCode = 404;
      s.end('Not Found\n');
      break;
    }
  }

  return server;
}
