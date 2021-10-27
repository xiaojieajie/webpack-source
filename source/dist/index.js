(function (graph) {
  function require(module) {
    function localRequire(relativePath) {
      return require(graph[module].dependecies[relativePath])
    }
    var exports = {};
    (function (require, exports, code) {
      eval(code)
    })(localRequire, exports, graph[module].code)
    return exports
  }
  require('./src/index.js')
})({ "./src/index.js": { "dependecies": { "./aa.js": "./src\\aa.js", "./bb.js": "./src\\bb.js" }, "code": "\"use strict\";\n\nvar _aa = require(\"./aa.js\");\n\nvar _bb = require(\"./bb.js\");\n\n// src/index\nconsole.log(\"\".concat(_bb.name, \"\\u4ECA\\u5E74\").concat(_aa.age, \"\\u5C81\\u4E86\"));" }, "./src\\aa.js": { "dependecies": {}, "code": "\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.age = void 0;\nvar age = 18;\nexports.age = age;" }, "./src\\bb.js": { "dependecies": {}, "code": "\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.name = void 0;\nconsole.log('我来了');\nvar name = '杰杰';\nexports.name = name;" } })