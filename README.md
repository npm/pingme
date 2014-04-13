# pingme

Super simple HTTP server that can be easily pinged so that Nagios et
al can know your stuff's healthy.

## USAGE

```javascript
var pm = require('pingme');
pm({
  status: function(cb) {
    // cb(new Error('oh noes!')); if not ok
    cb(null, {
      pid: process.pid,
      whateverRandom: dataYouWantToShow
    })
  },
  ping: function(cb) {
    cb(null); // cb(new Error('oh noes!')) if not ok
  },
  // pass in ssl: { key, cert } to use https instead
  // pass in `server: someServer` to hijack its request handler
  // but be warned that this takes over the /ping and /status urls
}).listen(1337);
```
