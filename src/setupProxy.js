const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/chat", {
      target: "http://43.155.159.208:3002",
      changeOrigin: true,
      secure: false
    })
  );
  app.use(
    createProxyMiddleware("/strArr", {
      target: "http://localhost:3003",
      changeOrigin: true,
      secure: false
    })
  );
  app.use(
    createProxyMiddleware("/getStrArr", {
      target: "http://localhost:3003",
      changeOrigin: true,
      secure: false
    })
  );
  app.use(
    createProxyMiddleware("/writeCode", {
      target: "http://localhost:8081",
      changeOrigin: true,
      secure: false
    })
  );
  app.use(
    createProxyMiddleware("/search/api/stream", {
      target: "http://43.155.184.218:8084",
      changeOrigin: true,
      secure: false
    })
  );
  app.use(
    createProxyMiddleware("/search/api/dev/stream", {
      target: "http://localhost:8081",
      changeOrigin: true,
      secure: false
    })
  );
  app.use(
    createProxyMiddleware("/inputStream", {
      target: "http://localhost:8081",
      changeOrigin: true,
      secure: false
    })
  );
  // app.use(
  //   createProxyMiddleware("/search/api/streamdev", {
  //     target: "http://localhost:8081/",
  //     changeOrigin: true,
  //     secure: false
  //   })
  // );
};
