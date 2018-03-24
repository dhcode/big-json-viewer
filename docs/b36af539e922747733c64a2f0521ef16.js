// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
require = (function (modules, cache, entry) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof require === "function" && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof require === "function" && require;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  // Override the current require with this new one
  return newRequire;
})({20:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var json_node_info_1 = require("../parser/json-node-info");
var buffer_json_parser_1 = require("../parser/buffer-json-parser");
var json_node_search_1 = require("../parser/json-node-search");
var scope = self;
scope.onmessage = function (msg) {
    var data = msg.data;
    if (data.handler && jsonParserWorker[data.handler]) {
        try {
            var result = jsonParserWorker[data.handler].apply(jsonParserWorker, data.args);
            if (data.resultId) {
                scope.postMessage({
                    resultId: data.resultId,
                    result: result
                });
            }
        } catch (e) {
            if (data.resultId) {
                scope.postMessage({
                    resultId: data.resultId,
                    error: e.toString()
                });
            }
        }
    }
};
var JsonParserWorker = /** @class */function () {
    function JsonParserWorker() {
        this.rootNodes = {};
        this.index = 0;
    }
    JsonParserWorker.prototype.generateKey = function () {
        return (this.index++).toString();
    };
    JsonParserWorker.prototype.openParser = function (data) {
        var key = this.generateKey();
        this.rootNodes[key] = new buffer_json_parser_1.BufferJsonParser(data).getRootNodeInfo();
        return {
            parserKey: key,
            node: this.rootNodes[key].getInfo()
        };
    };
    JsonParserWorker.prototype.callParser = function (key, path, method) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        if (this.rootNodes[key]) {
            if (method === 'closeParser') {
                delete this.rootNodes[key];
                return;
            }
            var rootNode = this.rootNodes[key];
            var targetNode = rootNode.getByPath(path);
            if (method === 'search') {
                return json_node_search_1.searchJsonNodes.apply(null, [targetNode].concat(args));
            }
            if (!targetNode) {
                throw new Error('Node "' + rootNode.path + '" has no path "' + path + '"');
            }
            var result = targetNode[method].apply(targetNode, args);
            if (json_node_info_1.JsonNodeInfoMethods.indexOf(method) !== -1 && result) {
                return result.getInfo();
            }
            if (json_node_info_1.JsonNodeInfoArrayMethods.indexOf(method) !== -1 && result) {
                return result.map(function (entry) {
                    return entry.getInfo();
                });
            }
            return result;
        }
        throw new Error('Unknown rootNode ' + key);
    };
    return JsonParserWorker;
}();
var jsonParserWorker = new JsonParserWorker();
},{"../parser/json-node-info":12,"../parser/buffer-json-parser":11,"../parser/json-node-search":18}]},{},[20])