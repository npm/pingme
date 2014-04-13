var test = require('tap').test;
var http = require('http');
var pm = require('../pingme.js');
var sd = require('server-destroy');
var server;
var PORT = 11337;

test('setup', function(t) {
  var data = { test: 'stuff' };
  server = pm({
    ping: function(cb) {
      cb();
    },
    status: function(cb) {
      setTimeout(function() {
        cb(null, data);
      }, 100);
    }
  });

  // Add destroy function
  sd(server);

  server.listen(PORT, function() {
    t.pass('listening');
    t.end();
  });
});

test('/ping', function(t) {
  req('/ping', function(status, headers, body) {
    t.equal(status, 200);
    t.equal(headers['content-type'], 'text/plain');
    t.equal(body, 'OK\n');
    t.end();
  });
});

test('/status', function(t) {
  req('/status', function(status, headers, body) {
    t.equal(status, 200);
    t.equal(headers['content-type'], 'application/json');
    var data = JSON.parse(body);
    t.equal(data.test, 'stuff');
    t.ok(data.responseTime >= 100, data.responseTime + '>=100');
    t.end();
  });
});

test('/foo', function(t) {
  req('/foo', function(status, headers, body) {
    t.equal(status, 404);
    t.equal(headers['content-type'], 'text/plain');
    t.equal(body, 'Not Found\n');
    t.end();
  });

});

test('teardown', function(t) {
  server.destroy(function() {
    t.pass('torn down');
    t.end();
  });
});

function req(url, cb) {
  return http.get('http://localhost:' + PORT + url, function(res) {
    var b = '';
    res.setEncoding('utf8');
    res.on('data', function(d) {
      b += d;
    });
    res.on('end', function() {
      cb(res.statusCode, res.headers, b);
    });
  });
}

