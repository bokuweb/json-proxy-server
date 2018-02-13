const http = require('http');
const is = require('@sindresorhus/is');
const httpProxy = require('http-proxy');
const jsonServer = require('json-server');
const { parse } = require('url');
const route = require('path-match')({
  sensitive: false,
  strict: true,
  end: true,
});
const log = require('./log');

module.exports = config => {
  config = config || require('./json-proxy-server.conf')();
  if (!config.targetURL || !is.string(config.targetURL)) {
    throw new Error('Please specify target url.');
  }

  log.setLevel(config.log);
  const server = jsonServer.create();
  const DEFAULT_JSON_SERVER_PORT = 5050;
  const DEFAULT_PROXY_SERVER_PORT = 9000;
  const jsonServerPort = (config.jsonServer && config.jsonServer.port) || DEFAULT_JSON_SERVER_PORT;
  const proxyServerPort = (config.proxyServer && config.proxyServer.port) || DEFAULT_PROXY_SERVER_PORT;

  const rewriter = jsonServer.rewriter(
    config.routes.reduce((acc, r) => {
      acc[r.path] = `/${r.name}`;
      return acc;
    }, {}),
  );
  server.use(rewriter);
  server.listen(jsonServerPort, () => {
    log.info(`JSON Server is running :${jsonServerPort}`);
  });
  const router = jsonServer.router(
    config.routes.reduce((acc, r) => {
      acc[r.name] = is.function(r.res) ? r.res() : r.res;
      return acc;
    }, {}),
  );
  server.use(router);

  const proxy = httpProxy.createProxyServer({});
  const proxyServer = http.createServer((req, res) => {
    log.info(`Request ${req.url}`);
    const hit = config.routes.find(r => route(r.path)(parse(req.url).pathname));
    if (hit || req.url === '/db') {
      proxy.web(req, res, {
        target: `http://localhost:${jsonServerPort}`,
      });
    } else {
      proxy.web(req, res, {
        target: config.targetURL,
      });
    }
  });

  proxyServer.listen(proxyServerPort);
  log.info(`Proxy Server is running :${proxyServerPort}`);
};
