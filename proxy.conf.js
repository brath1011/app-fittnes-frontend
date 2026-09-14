const PROXY_CONFIG = {
  "/auth": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  },
  "/rutinas": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "bypass": function (req, res, proxyOptions) {
      if (req.headers.accept && req.headers.accept.indexOf("html") !== -1) {
        return "/index.html";
      }
    }
  },
  "/ejercicios": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "bypass": function (req, res, proxyOptions) {
      if (req.headers.accept && req.headers.accept.indexOf("html") !== -1) {
        return "/index.html";
      }
    }
  },
  "/pagos": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "bypass": function (req, res, proxyOptions) {
      if (req.headers.accept && req.headers.accept.indexOf("html") !== -1) {
        return "/index.html";
      }
    }
  },
  "/boletas": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "bypass": function (req, res, proxyOptions) {
      if (req.headers.accept && req.headers.accept.indexOf("html") !== -1) {
        return "/index.html";
      }
    }
  },
  "/progreso": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "bypass": function (req, res, proxyOptions) {
      if (req.headers.accept && req.headers.accept.indexOf("html") !== -1) {
        return "/index.html";
      }
    }
  },
  "/subcategorias-imagenes": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  },
  "/medidas": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  },
  "/usuarios": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  },
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
};

module.exports = PROXY_CONFIG;
