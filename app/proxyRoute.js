const proxy = require('http-proxy-middleware');
const isAbsoluteUrl = require('is-absolute-url');

module.exports = (req, res, next) => {
  if (!req.app.proxying) {
    next();
    return;
  }

  const reqUrl = req.originalUrl.replace(/^\//, '');

  if (!isAbsoluteUrl(reqUrl)) {
    next();
    return;
  }

  const middleware = proxy({
    target: reqUrl,
    changeOrigin: true,
    logLevel: 'silent', // TODO: Sync with mockyeah settings.
    ignorePath: true,
    onProxyRes: (proxyRes, req, res) => {
      if (req.app.locals.recording) {
        // TODO: Record...
        console.log('recording...', { proxyRes, req, res });
        let body = '';
        proxyRes.on('data', function(data) {
          body += data;
        });
        proxyRes.on('end', function() {
          console.log('res from proxied server:', body);
          res.end('my response to cli');
        });

        console.log('recording to: ', req.app.locals.recordingSuiteName);

        // proxyRes.pipe(require('fs').createWriteStream('./out.json'));
      }
    }
  });

  middleware(req, res, next);
};
