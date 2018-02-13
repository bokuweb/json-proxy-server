module.exports = () => {
  return {
    targetURL: 'http://localhost:8081',
    jsonServer: {
      port: 4444,
    },
    proxyServer: {
      port: 5555,
    },
    routes: [
      { name: 'users', path: '/users/:id', res: { id: 1, name: 'foo' } },
      { name: 'posts', path: '/posts/:id', res: require('./post') },
    ],
    log: "INFO",
  };
};
