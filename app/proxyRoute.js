const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const proxy = require('http-proxy-middleware');
const isAbsoluteUrl = require('is-absolute-url');
const { resolveFilePath } = require('./lib/helpers');

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

        const { capturesDir } = req.app.config;
        console.log(req.app.config);
        // const capturePath = path.join(capturesDir, req.app.locals.recordingSuiteName);
        // const filePath = resolveFilePath(capturePath, reqUrl);

        // console.log('recording to: ', filePath);

        // mkdirp.sync(capturePath);

        // proxyRes.pipe(fs.createWriteStream(filePath));
      }
    }
  });

  middleware(req, res, next);
};
