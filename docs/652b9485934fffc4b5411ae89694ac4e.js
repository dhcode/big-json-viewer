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
})({8:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var BRACE_START = '{'.charCodeAt(0);
var BRACE_END = '}'.charCodeAt(0);
var BRACKET_START = '['.charCodeAt(0);
var BRACKET_END = ']'.charCodeAt(0);
var COLON = ':'.charCodeAt(0);
var COMMA = ','.charCodeAt(0);
var DOUBLE_QUOTE = '"'.charCodeAt(0);
var SINGLE_QUOTE = '\''.charCodeAt(0);
var SPACE = ' '.charCodeAt(0);
var TAB = '\t'.charCodeAt(0);
var NEWLINE = '\n'.charCodeAt(0);
var BACKSPACE = '\b'.charCodeAt(0);
var CARRIAGE_RETURN = '\r'.charCodeAt(0);
var FORM_FEED = '\f'.charCodeAt(0);
var BACK_SLASH = '\\'.charCodeAt(0);
var FORWARD_SLASH = '/'.charCodeAt(0);
var MINUS = '-'.charCodeAt(0);
var PLUS = '+'.charCodeAt(0);
var DOT = '.'.charCodeAt(0);
var CHAR_E_LOW = 'e'.charCodeAt(0);
var CHAR_E_HIGH = 'E'.charCodeAt(0);
var DIGIT_0 = '0'.charCodeAt(0);
var DIGIT_9 = '9'.charCodeAt(0);
var IGNORED = [SPACE, TAB, NEWLINE, CARRIAGE_RETURN];
var NULL = 'null'.split('').map(function (d) {
    return d.charCodeAt(0);
});
var TRUE = 'true'.split('').map(function (d) {
    return d.charCodeAt(0);
});
var FALSE = 'false'.split('').map(function (d) {
    return d.charCodeAt(0);
});
var BufferJsonNodeInfo = /** @class */function () {
    function BufferJsonNodeInfo(parser, index, path) {
        this.path = [];
        this.parser = parser;
        this.index = index;
        this.path = path;
    }
    /**
     * Returns the list of keys in case of an object for the defined range
     * @param {number} start
     * @param {number} limit
     */
    BufferJsonNodeInfo.prototype.getObjectKeys = function (start, limit) {
        if (start === void 0) {
            start = 0;
        }
        if (this.type !== 'object') {
            throw new Error("Unsupported method on non-object " + this.type);
        }
        assertStartLimit(start, limit);
        var ctx = {
            path: this.path,
            objectKeys: [],
            start: start,
            limit: limit
        };
        this.parser.parseObject(this.index, ctx);
        return ctx.objectKeys;
    };
    /**
     * Return the NodeInfo at the defined position.
     * Use the index from getObjectKeys
     * @param index
     */
    BufferJsonNodeInfo.prototype.getByIndex = function (index) {
        if (this.type === 'object') {
            var nodes = this.getObjectNodes(index, 1);
            if (nodes.length) {
                return nodes[0];
            }
        }
        if (this.type === 'array') {
            var nodes = this.getArrayNodes(index, 1);
            if (nodes.length) {
                return nodes[0];
            }
        }
        return undefined;
    };
    /**
     * Return the NodeInfo for the specified key
     * Use the index from getObjectKeys
     * @param key
     */
    BufferJsonNodeInfo.prototype.getByKey = function (key) {
        if (this.type === 'object') {
            var ctx = {
                path: this.path,
                objectKey: key
            };
            this.parser.parseObject(this.index, ctx);
            return ctx.objectNodes ? ctx.objectNodes[0] : undefined;
        }
        if (this.type === 'array') {
            return this.getByIndex(parseInt(key));
        }
        return undefined;
    };
    /**
     * Find the information for a given path
     * @param {string[]} path
     * @returns {BufferJsonNodeInfo}
     */
    BufferJsonNodeInfo.prototype.getByPath = function (path) {
        if (!path) {
            return undefined;
        }
        if (!path.length) {
            return this;
        }
        var p = path.slice();
        var key;
        var node = this;
        while ((key = p.shift()) !== undefined && node) {
            node = node.getByKey(key);
        }
        return node;
    };
    /**
     * Returns a map with the NodeInfo objects for the defined range
     * @param {number} start
     * @param {number} limit
     */
    BufferJsonNodeInfo.prototype.getObjectNodes = function (start, limit) {
        if (start === void 0) {
            start = 0;
        }
        if (this.type !== 'object') {
            throw new Error("Unsupported method on non-object " + this.type);
        }
        assertStartLimit(start, limit);
        var ctx = {
            path: this.path,
            objectNodes: [],
            start: start,
            limit: limit
        };
        this.parser.parseObject(this.index, ctx);
        return ctx.objectNodes;
    };
    /**
     * Returns a list of NodeInfo for the defined range
     * @param {number} start
     * @param {number} limit
     */
    BufferJsonNodeInfo.prototype.getArrayNodes = function (start, limit) {
        if (start === void 0) {
            start = 0;
        }
        if (this.type !== 'array') {
            throw new Error("Unsupported method on non-array " + this.type);
        }
        assertStartLimit(start, limit);
        var ctx = {
            path: this.path,
            arrayNodes: [],
            start: start,
            limit: limit
        };
        this.parser.parseArray(this.index, ctx);
        return ctx.arrayNodes;
    };
    /**
     * Get the natively parsed value
     */
    BufferJsonNodeInfo.prototype.getValue = function () {
        return this.parser.parseNative(this.index, this.index + this.chars);
    };
    BufferJsonNodeInfo.prototype.getInfo = function () {
        return {
            type: this.type,
            path: this.path,
            length: this.length
        };
    };
    return BufferJsonNodeInfo;
}();
exports.BufferJsonNodeInfo = BufferJsonNodeInfo;
/**
 * Parses meta data about a JSON structure in an ArrayBuffer.
 */
var BufferJsonParser = /** @class */function () {
    function BufferJsonParser(data) {
        if (data instanceof ArrayBuffer) {
            this.data = new Uint16Array(data);
        } else if (typeof data === 'string' && typeof TextEncoder !== 'undefined') {
            this.data = new TextEncoder().encode(data);
        } else if (typeof data === 'string') {
            this.data = new Uint16Array(new ArrayBuffer(data.length * 2));
            for (var i = 0; i < data.length; i++) {
                this.data[i] = data.charCodeAt(i);
            }
        }
    }
    BufferJsonParser.prototype.getRootNodeInfo = function () {
        var start = this.skipIgnored(0);
        var ctx = {
            path: [],
            nodeInfo: new BufferJsonNodeInfo(this, start, [])
        };
        var end = this.parseValue(start, ctx, false);
        if (start === end) {
            return null;
        }
        return ctx.nodeInfo;
    };
    BufferJsonParser.prototype.parseValue = function (start, ctx, throwUnknown) {
        if (throwUnknown === void 0) {
            throwUnknown = true;
        }
        var char = this.data[start];
        if (isString(char)) {
            return this.parseString(start, ctx);
        }
        if (isNumber(char)) {
            return this.parseNumber(start, ctx);
        }
        if (char === BRACE_START) {
            return this.parseObject(start, ctx);
        }
        if (char === BRACKET_START) {
            return this.parseArray(start, ctx);
        }
        if (char === TRUE[0]) {
            return this.parseToken(start, TRUE, ctx);
        }
        if (char === FALSE[0]) {
            return this.parseToken(start, FALSE, ctx);
        }
        if (char === NULL[0]) {
            return this.parseToken(start, NULL, ctx);
        }
        if (throwUnknown) {
            throw new Error("parse value unknown token " + bufToString(char) + " at " + start);
        }
        function isString(char) {
            return char === DOUBLE_QUOTE || char === SINGLE_QUOTE;
        }
        function isNumber(char) {
            return char === MINUS || char >= DIGIT_0 && char <= DIGIT_9;
        }
    };
    BufferJsonParser.prototype.parseObject = function (start, ctx) {
        var index = start + 1; // skip the start brace
        var length = 0;
        var keys = [];
        var nodes = [];
        while (index <= this.data.length) {
            if (index === this.data.length) {
                throw new Error("parse object incomplete at end");
            }
            index = this.skipIgnored(index);
            if (this.data[index] === BRACE_END) {
                index++;
                break;
            }
            var keyCtx = getKeyContext(length);
            index = this.parseString(index, keyCtx);
            if (keyCtx && ctx && ctx.objectKeys) {
                keys.push(keyCtx.value);
            }
            index = this.skipIgnored(index);
            if (this.data[index] !== COLON) {
                throw new Error("parse object unexpected token " + bufToString(this.data[index]) + " at " + index + ". Expected :");
            } else {
                index++;
            }
            index = this.skipIgnored(index);
            var valueCtx = null;
            if (keyCtx && ctx && (ctx.objectNodes || keyCtx.value === ctx.objectKey)) {
                valueCtx = {
                    path: ctx.path,
                    nodeInfo: new BufferJsonNodeInfo(this, index, ctx.path.concat([keyCtx.value]))
                };
            }
            index = this.parseValue(index, valueCtx);
            index = this.skipIgnored(index);
            if (valueCtx && ctx.objectNodes) {
                nodes.push(valueCtx.nodeInfo);
            } else if (valueCtx && ctx.objectKey !== undefined) {
                ctx.objectNodes = [valueCtx.nodeInfo];
                return;
            }
            length++;
            if (this.data[index] === COMMA) {
                index++;
            } else if (this.data[index] !== BRACE_END) {
                throw new Error("parse object unexpected token " + bufToString(this.data[index]) + " at " + index + ". Expected , or }");
            }
        }
        if (ctx && ctx.nodeInfo) {
            ctx.nodeInfo.type = 'object';
            ctx.nodeInfo.length = length;
            ctx.nodeInfo.chars = index - start;
        }
        if (ctx && ctx.objectKeys) {
            ctx.objectKeys = keys;
        }
        if (ctx && ctx.objectNodes) {
            ctx.objectNodes = nodes;
        }
        function getKeyContext(keyIndex) {
            if (!ctx || ctx.start && keyIndex < ctx.start || ctx.limit && keyIndex >= ctx.start + ctx.limit) {
                return null;
            }
            if (ctx && (ctx.objectKeys || ctx.objectNodes || ctx.objectKey !== undefined)) {
                return {
                    path: ctx.path,
                    value: null
                };
            }
            return null;
        }
        return index;
    };
    BufferJsonParser.prototype.parseArray = function (start, ctx) {
        var index = start + 1; // skip the start bracket
        var length = 0;
        while (index <= this.data.length) {
            if (index === this.data.length) {
                throw new Error("parse array incomplete at end");
            }
            index = this.skipIgnored(index);
            if (this.data[index] === BRACKET_END) {
                index++;
                break;
            }
            var valueCtx = null;
            if (isInRange(length) && ctx.arrayNodes) {
                valueCtx = {
                    path: ctx.path,
                    nodeInfo: new BufferJsonNodeInfo(this, index, ctx.path.concat([length.toString()]))
                };
            }
            index = this.parseValue(index, valueCtx);
            if (valueCtx) {
                ctx.arrayNodes.push(valueCtx.nodeInfo);
            }
            index = this.skipIgnored(index);
            length++;
            if (this.data[index] === COMMA) {
                index++;
            } else if (this.data[index] !== BRACKET_END) {
                throw new Error("parse array unexpected token " + bufToString(this.data[index]) + " at " + index + ". Expected , or ]");
            }
        }
        if (ctx && ctx.nodeInfo) {
            ctx.nodeInfo.type = 'array';
            ctx.nodeInfo.length = length;
            ctx.nodeInfo.chars = index - start;
        }
        function isInRange(keyIndex) {
            return !(!ctx || ctx.start && keyIndex < ctx.start || ctx.limit && keyIndex >= ctx.start + ctx.limit);
        }
        return index;
    };
    BufferJsonParser.prototype.parseString = function (start, ctx) {
        var index = start;
        var expect = this.data[index] === DOUBLE_QUOTE ? DOUBLE_QUOTE : SINGLE_QUOTE;
        var esc = false,
            length = 0;
        for (index++; index <= this.data.length; index++) {
            if (index === this.data.length) {
                throw new Error("parse string incomplete at end");
            }
            if (!esc && this.data[index] === expect) {
                index++;
                break;
            }
            if (this.data[index] === BACK_SLASH) {
                esc = !esc;
            } else {
                esc = false;
            }
            if (!esc) {
                length++;
            }
        }
        if (ctx && ctx.nodeInfo) {
            ctx.nodeInfo.type = 'string';
            ctx.nodeInfo.length = length;
            ctx.nodeInfo.chars = index - start;
        }
        if (ctx && ctx.value !== undefined) {
            ctx.value = JSON.parse(bufToString(this.data.subarray(start, index)));
        }
        return index;
    };
    BufferJsonParser.prototype.parseNumber = function (start, ctx) {
        var i = start;
        if (this.data[i] === MINUS) {
            i++;
        }
        i = this.parseDigits(i);
        if (this.data[i] === DOT) {
            i++;
            i = this.parseDigits(i);
        }
        if (this.data[i] === CHAR_E_HIGH || this.data[i] === CHAR_E_LOW) {
            i++;
            if (this.data[i] === PLUS || this.data[i] === MINUS) {
                i++;
            }
            i = this.parseDigits(i);
        }
        if (ctx && ctx.nodeInfo) {
            ctx.nodeInfo.type = 'number';
            ctx.nodeInfo.chars = i - start;
        }
        if (ctx && ctx.value !== undefined) {
            ctx.value = JSON.parse(bufToString(this.data.subarray(start, i)));
        }
        return i;
    };
    BufferJsonParser.prototype.parseDigits = function (start) {
        while (this.data[start] >= DIGIT_0 && this.data[start] <= DIGIT_9) {
            start++;
        }
        return start;
    };
    BufferJsonParser.prototype.parseToken = function (start, chars, ctx) {
        var index = start;
        for (var i = 0; i < chars.length; i++) {
            if (this.data[index] !== chars[i]) {
                throw new Error("Unexpected token " + bufToString(this.data[index]) + " at " + index + ". Expected " + bufToString(chars));
            }
            index++;
        }
        var token = bufToString(this.data.subarray(start, index));
        if (ctx && ctx.nodeInfo) {
            if (token === 'null') {
                ctx.nodeInfo.type = 'null';
            } else {
                ctx.nodeInfo.type = 'boolean';
            }
            ctx.nodeInfo.chars = index - start;
        }
        if (ctx && ctx.value !== undefined) {
            ctx.value = JSON.parse(token);
        }
        return index;
    };
    BufferJsonParser.prototype.parseNative = function (start, end) {
        return JSON.parse(bufToString(this.data.subarray(start, end)));
    };
    BufferJsonParser.prototype.skipIgnored = function (start) {
        for (var i = start; i < this.data.length; i++) {
            if (IGNORED.indexOf(this.data[i]) !== -1) {
                continue;
            }
            return i;
        }
    };
    return BufferJsonParser;
}();
exports.BufferJsonParser = BufferJsonParser;
function bufToString(buf) {
    if (typeof buf === 'number') {
        buf = [buf];
    }
    return String.fromCharCode.apply(null, buf);
}
function assertStartLimit(start, limit) {
    if (isNaN(start) || start < 0) {
        throw new Error("Invalid start " + start);
    }
    if (limit && limit < 0) {
        throw new Error("Invalid limit " + limit);
    }
}
},{}],9:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonNodeInfoArrayMethods = ['getObjectNodes', 'getArrayNodes'];
exports.JsonNodeInfoMethods = ['getByIndex', 'getByKey', 'getByPath'];
var AsyncJsonNodeInfoProxy = /** @class */function () {
    function AsyncJsonNodeInfoProxy(nodeInfo) {
        this.nodeInfo = nodeInfo;
        this.type = this.nodeInfo.type;
        this.path = this.nodeInfo.path;
        this.length = this.nodeInfo.length;
    }
    AsyncJsonNodeInfoProxy.prototype.getObjectKeys = function (start, limit) {
        return this.promiseCall('getObjectKeys', start, limit);
    };
    AsyncJsonNodeInfoProxy.prototype.getByIndex = function (index) {
        return this.promiseCall('getByIndex', index);
    };
    AsyncJsonNodeInfoProxy.prototype.getByKey = function (key) {
        return this.promiseCall('getByKey', key);
    };
    AsyncJsonNodeInfoProxy.prototype.getByPath = function (path) {
        return this.promiseCall('getByPath', path);
    };
    AsyncJsonNodeInfoProxy.prototype.getObjectNodes = function (start, limit) {
        return this.promiseCall('getObjectNodes', start, limit);
    };
    AsyncJsonNodeInfoProxy.prototype.getArrayNodes = function (start, limit) {
        return this.promiseCall('getArrayNodes', start, limit);
    };
    AsyncJsonNodeInfoProxy.prototype.getValue = function () {
        return this.promiseCall('getValue');
    };
    AsyncJsonNodeInfoProxy.prototype.promiseCall = function (method) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return new Promise(function (resolve) {
            resolve(_this.nodeInfo[method].apply(_this.nodeInfo, args));
        });
    };
    return AsyncJsonNodeInfoProxy;
}();
exports.AsyncJsonNodeInfoProxy = AsyncJsonNodeInfoProxy;
},{}],13:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function searchJsonNodes(node, pattern, searchArea) {
    if (searchArea === void 0) {
        searchArea = 'all';
    }
    pattern = ensureGlobal(pattern);
    var results = [];
    if (node.path.length && (searchArea === 'all' || searchArea === 'keys')) {
        forEachMatchFromString(pattern, node.path[node.path.length - 1], function (index, length) {
            results.push({ path: node.path, key: index, length: length });
        });
    }
    if (node.type === 'object') {
        node.getObjectNodes().forEach(function (subNode) {
            results.push.apply(results, searchJsonNodes(subNode, pattern, searchArea));
        });
    } else if (node.type === 'array') {
        node.getArrayNodes().forEach(function (subNode) {
            results.push.apply(results, searchJsonNodes(subNode, pattern, searchArea));
        });
    } else if (searchArea === 'all' || searchArea === 'values') {
        forEachMatchFromString(pattern, String(node.getValue()), function (index, length) {
            results.push({ path: node.path, value: index, length: length });
        });
    }
    return results;
}
exports.searchJsonNodes = searchJsonNodes;
function forEachMatchFromString(pattern, subject, callback) {
    pattern = ensureGlobal(pattern);
    pattern.lastIndex = 0;
    var match = null;
    while ((match = pattern.exec(subject)) !== null) {
        callback(match.index, match[0].length);
    }
    pattern.lastIndex = 0;
}
exports.forEachMatchFromString = forEachMatchFromString;
function ensureGlobal(pattern) {
    if (!pattern.global) {
        var flags = 'g' + (pattern.ignoreCase ? 'i' : '') + (pattern.multiline ? 'm' : '');
        return new RegExp(pattern.source, flags);
    }
    return pattern;
}
},{}],7:[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
    var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
        d.__proto__ = b;
    } || function (d, b) {
        for (var p in b) {
            if (b.hasOwnProperty(p)) d[p] = b[p];
        }
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
}();
var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = this && this.__generator || function (thisArg, body) {
    var _ = { label: 0, sent: function sent() {
            if (t[0] & 1) throw t[1];return t[1];
        }, trys: [], ops: [] },
        f,
        y,
        t,
        g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
        return this;
    }), g;
    function verb(n) {
        return function (v) {
            return step([n, v]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) {
            try {
                if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [0, t.value];
                switch (op[0]) {
                    case 0:case 1:
                        t = op;break;
                    case 4:
                        _.label++;return { value: op[1], done: false };
                    case 5:
                        _.label++;y = op[1];op = [0];continue;
                    case 7:
                        op = _.ops.pop();_.trys.pop();continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                            _ = 0;continue;
                        }
                        if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                            _.label = op[1];break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];t = op;break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];_.ops.push(op);break;
                        }
                        if (t[2]) _.ops.pop();
                        _.trys.pop();continue;
                }
                op = body.call(thisArg, _);
            } catch (e) {
                op = [6, e];y = 0;
            } finally {
                f = t = 0;
            }
        }if (op[0] & 5) throw op[1];return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var json_node_info_1 = require("./parser/json-node-info");
var buffer_json_parser_1 = require("./parser/buffer-json-parser");
var json_node_search_1 = require("./parser/json-node-search");
/**
 * Implements the JsonNodeInfo API to call the parser in a web worker.
 */
var WorkerParserJsonInfo = /** @class */function () {
    function WorkerParserJsonInfo(workerCall, nodeInfo) {
        this.workerCall = workerCall;
        this.type = nodeInfo.type;
        this.path = nodeInfo.path;
        this.length = nodeInfo.length;
    }
    WorkerParserJsonInfo.prototype.getObjectKeys = function (start, limit) {
        return this.workerCall(this.path, 'getObjectKeys', start, limit);
    };
    WorkerParserJsonInfo.prototype.getByIndex = function (index) {
        var _this = this;
        return this.workerCall(this.path, 'getByIndex', index).then(function (info) {
            return new WorkerParserJsonInfo(_this.workerCall, info);
        });
    };
    WorkerParserJsonInfo.prototype.getByKey = function (key) {
        var _this = this;
        return this.workerCall(this.path, 'getByKey', key).then(function (info) {
            return new WorkerParserJsonInfo(_this.workerCall, info);
        });
    };
    WorkerParserJsonInfo.prototype.getByPath = function (path) {
        var _this = this;
        return this.workerCall(this.path, 'getByPath', path).then(function (info) {
            return new WorkerParserJsonInfo(_this.workerCall, info);
        });
    };
    WorkerParserJsonInfo.prototype.getObjectNodes = function (start, limit) {
        var _this = this;
        return this.workerCall(this.path, 'getObjectNodes', start, limit).then(function (list) {
            return list.map(function (info) {
                return new WorkerParserJsonInfo(_this.workerCall, info);
            });
        });
    };
    WorkerParserJsonInfo.prototype.getArrayNodes = function (start, limit) {
        var _this = this;
        return this.workerCall(this.path, 'getArrayNodes', start, limit).then(function (list) {
            return list.map(function (info) {
                return new WorkerParserJsonInfo(_this.workerCall, info);
            });
        });
    };
    WorkerParserJsonInfo.prototype.getValue = function () {
        return this.workerCall(this.path, 'getValue');
    };
    WorkerParserJsonInfo.prototype.close = function () {
        return this.workerCall(this.path, 'closeParser');
    };
    WorkerParserJsonInfo.prototype.search = function (path, pattern, searchArea) {
        if (searchArea === void 0) {
            searchArea = 'all';
        }
        return this.workerCall(this.path, 'search', pattern, searchArea);
    };
    return WorkerParserJsonInfo;
}();
exports.WorkerParserJsonInfo = WorkerParserJsonInfo;
var ClosableAsyncJsonNodeInfoProxy = /** @class */function (_super) {
    __extends(ClosableAsyncJsonNodeInfoProxy, _super);
    function ClosableAsyncJsonNodeInfoProxy(_nodeInfo) {
        var _this = _super.call(this, _nodeInfo) || this;
        _this._nodeInfo = _nodeInfo;
        return _this;
    }
    ClosableAsyncJsonNodeInfoProxy.prototype.search = function (path, pattern, searchArea) {
        if (searchArea === void 0) {
            searchArea = 'all';
        }
        var targetNode = this._nodeInfo.getByPath(path);
        if (targetNode) {
            return Promise.resolve(json_node_search_1.searchJsonNodes(targetNode, pattern, searchArea));
        }
        return Promise.resolve([]);
    };
    ClosableAsyncJsonNodeInfoProxy.prototype.close = function () {};
    return ClosableAsyncJsonNodeInfoProxy;
}(json_node_info_1.AsyncJsonNodeInfoProxy);
exports.ClosableAsyncJsonNodeInfoProxy = ClosableAsyncJsonNodeInfoProxy;
var WorkerClient = /** @class */function () {
    function WorkerClient() {
        this.requestIndex = 0;
        this.requestCallbacks = {};
        this.worker = null;
        this.initWorker();
    }
    WorkerClient.prototype.initWorker = function () {
        var _this = this;
        this.worker = new Worker("b36af539e922747733c64a2f0521ef16.js");
        this.worker.onmessage = function (msg) {
            if (msg.data && msg.data.resultId && _this.requestCallbacks[msg.data.resultId]) {
                var callb = _this.requestCallbacks[msg.data.resultId];
                delete _this.requestCallbacks[msg.data.resultId];
                callb(msg.data);
            }
        };
        this.worker.onerror = function (e) {
            return console.error(e);
        };
    };
    WorkerClient.prototype.call = function (handler) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return this.callWorker.apply(this, [handler, undefined].concat(args));
    };
    WorkerClient.prototype.callWorker = function (handler, transfers) {
        var _this = this;
        if (transfers === void 0) {
            transfers = undefined;
        }
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return new Promise(function (resolve, reject) {
            var resultId = ++_this.requestIndex;
            // console.log('request ' + resultId + ' ' + handler, args);
            _this.requestCallbacks[resultId] = function (data) {
                if (data.error !== undefined) {
                    // console.log('response error ' + resultId, data.error);
                    reject(data.error);
                    return;
                }
                // console.log('response ' + resultId, data.result);
                resolve(data.result);
            };
            _this.worker.postMessage({
                handler: handler,
                args: args,
                resultId: resultId
            }, transfers);
        });
    };
    return WorkerClient;
}();
exports.WorkerClient = WorkerClient;
function parseWithWorker(data) {
    return __awaiter(this, void 0, void 0, function () {
        var worker, info, workerCall;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window['Worker']) {
                        return [2 /*return*/, new ClosableAsyncJsonNodeInfoProxy(new buffer_json_parser_1.BufferJsonParser(data).getRootNodeInfo())];
                    }
                    worker = new WorkerClient();
                    if (!(data instanceof ArrayBuffer)) return [3 /*break*/, 2];
                    return [4 /*yield*/, worker.callWorker('openParser', [data], data)];
                case 1:
                    info = _a.sent();
                    return [3 /*break*/, 4];
                case 2:
                    return [4 /*yield*/, worker.call('openParser', data)];
                case 3:
                    info = _a.sent();
                    _a.label = 4;
                case 4:
                    workerCall = function workerCall() {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        return worker.call.apply(worker, ['callParser', info.parserKey].concat(args));
                    };
                    return [2 /*return*/, new WorkerParserJsonInfo(workerCall, info.node)];
            }
        });
    });
}
exports.parseWithWorker = parseWithWorker;
},{"./parser/json-node-info":9,"./parser/buffer-json-parser":8,"./parser/json-node-search":13,"./worker\\json-parser.worker.ts":[["b36af539e922747733c64a2f0521ef16.js",14],"b36af539e922747733c64a2f0521ef16.map",14]}],6:[function(require,module,exports) {
"use strict";

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = this && this.__generator || function (thisArg, body) {
    var _ = { label: 0, sent: function sent() {
            if (t[0] & 1) throw t[1];return t[1];
        }, trys: [], ops: [] },
        f,
        y,
        t,
        g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
        return this;
    }), g;
    function verb(n) {
        return function (v) {
            return step([n, v]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) {
            try {
                if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [0, t.value];
                switch (op[0]) {
                    case 0:case 1:
                        t = op;break;
                    case 4:
                        _.label++;return { value: op[1], done: false };
                    case 5:
                        _.label++;y = op[1];op = [0];continue;
                    case 7:
                        op = _.ops.pop();_.trys.pop();continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                            _ = 0;continue;
                        }
                        if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                            _.label = op[1];break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];t = op;break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];_.ops.push(op);break;
                        }
                        if (t[2]) _.ops.pop();
                        _.trys.pop();continue;
                }
                op = body.call(thisArg, _);
            } catch (e) {
                op = [6, e];y = 0;
            } finally {
                f = t = 0;
            }
        }if (op[0] & 5) throw op[1];return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var json_node_search_1 = require("./parser/json-node-search");
var worker_client_1 = require("./worker-client");
/**
 * Creates the DOM nodes and interactivity to watch large JSON structures.
 */
var BigJsonViewer = /** @class */function () {
    function BigJsonViewer(rootNode, options) {
        this.options = {
            objectNodesLimit: 50,
            arrayNodesLimit: 50,
            labelAsPath: false,
            linkLabelCopyPath: 'Copy path',
            linkLabelExpandAll: 'Expand all'
        };
        this.rootNode = rootNode;
        if (options) {
            Object.assign(this.options, options);
        }
    }
    /**
     * Returns an HTMLElement that displays the tree.
     * It must be attached to DOM.
     * Offers an API to open/close nodes.
     */
    BigJsonViewer.elementFromData = function (data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var rootNode, viewer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        return [4 /*yield*/, worker_client_1.parseWithWorker(data)];
                    case 1:
                        rootNode = _a.sent();
                        viewer = new BigJsonViewer(rootNode, options);
                        return [2 /*return*/, viewer.getRootElement()];
                }
            });
        });
    };
    BigJsonViewer.prototype.getRootElement = function () {
        return __awaiter(this, void 0, void 0, function () {
            var nodeElement;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.rootNode) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getNodeElement(this.rootNode)];
                    case 1:
                        nodeElement = _a.sent();
                        nodeElement.classList.add('json-node-root');
                        return [2 /*return*/, nodeElement];
                    case 2:
                        return [2 /*return*/, null];
                }
            });
        });
    };
    BigJsonViewer.prototype.getNodeElement = function (node) {
        return __awaiter(this, void 0, void 0, function () {
            var element, header;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        element = document.createElement('div');
                        element.classList.add('json-node');
                        element.jsonNode = node;
                        return [4 /*yield*/, this.getNodeHeader(node)];
                    case 1:
                        header = _a.sent();
                        element.headerElement = element.appendChild(header);
                        this.attachInteractivity(element, node);
                        return [2 /*return*/, element];
                }
            });
        });
    };
    BigJsonViewer.prototype.attachInteractivity = function (nodeElement, node) {
        var _this = this;
        nodeElement.isNodeOpen = function () {
            if (_this.isOpenableNode(node)) {
                return nodeElement.headerElement.classList.contains('json-node-open');
            }
            return false;
        };
        nodeElement.openNode = function () {
            if (_this.isOpenableNode(node)) {
                return _this.openNode(nodeElement);
            }
            return Promise.resolve(false);
        };
        nodeElement.closeNode = function () {
            if (_this.isOpenableNode(node)) {
                return _this.closeNode(nodeElement);
            }
            return Promise.resolve(false);
        };
        nodeElement.toggleNode = function () {
            if (nodeElement.isNodeOpen()) {
                return nodeElement.closeNode();
            } else {
                return nodeElement.openNode();
            }
        };
        nodeElement.openPath = function (path) {
            if (_this.isOpenableNode(node)) {
                return _this.openPath(nodeElement, path, true);
            }
            return null;
        };
        nodeElement.openAll = function (maxDepth, paginated) {
            if (maxDepth === void 0) {
                maxDepth = Infinity;
            }
            if (paginated === void 0) {
                paginated = 'first';
            }
            if (_this.isOpenableNode(node)) {
                return _this.openAll(nodeElement, maxDepth, paginated);
            }
            return Promise.resolve(0);
        };
        nodeElement.getOpenPaths = function (withStubs) {
            if (withStubs === void 0) {
                withStubs = true;
            }
            if (_this.isOpenableNode(node)) {
                return _this.getOpenPaths(nodeElement, withStubs);
            }
            return [];
        };
        nodeElement.openBySearch = function (pattern, openLimit, searchArea) {
            if (openLimit === void 0) {
                openLimit = 1;
            }
            if (searchArea === void 0) {
                searchArea = 'all';
            }
            return _this.openBySearch(nodeElement, pattern, openLimit, searchArea);
        };
    };
    BigJsonViewer.prototype.attachClickToggleListener = function (anchor) {
        var _this = this;
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            var nodeElement = _this.findNodeElement(anchor);
            if (nodeElement && _this.isOpenableNode(nodeElement.jsonNode)) {
                if (nodeElement.isNodeOpen()) {
                    _this.closeNode(nodeElement, true);
                } else {
                    _this.openNode(nodeElement, true);
                }
            }
        });
    };
    BigJsonViewer.prototype.isOpenableNode = function (node) {
        return (node.type === 'array' || node.type === 'object') && !!node.length;
    };
    BigJsonViewer.prototype.closeNode = function (nodeElement, dispatchEvent) {
        if (dispatchEvent === void 0) {
            dispatchEvent = false;
        }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!nodeElement.isNodeOpen()) {
                    return [2 /*return*/, false];
                }
                if (nodeElement.childrenElement) {
                    nodeElement.headerElement.classList.remove('json-node-open');
                    nodeElement.removeChild(nodeElement.childrenElement);
                    nodeElement.childrenElement = null;
                    if (dispatchEvent) {
                        this.dispatchNodeEvent('closeNode', nodeElement);
                    }
                    return [2 /*return*/, true];
                }
                return [2 /*return*/, false];
            });
        });
    };
    BigJsonViewer.prototype.highlightNode = function (nodeElement, pattern) {
        return __awaiter(this, void 0, void 0, function () {
            var header;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        return [4 /*yield*/, this.getNodeHeader(nodeElement.jsonNode, pattern)];
                    case 1:
                        header = _a.sent();
                        nodeElement.headerElement.parentElement.replaceChild(header, nodeElement.headerElement);
                        nodeElement.headerElement = header;
                        return [2 /*return*/];
                }
            });
        });
    };
    BigJsonViewer.prototype.getHighlightedText = function (text, pattern) {
        var fragment = document.createDocumentFragment();
        if (!pattern) {
            fragment.appendChild(document.createTextNode(text));
            return fragment;
        }
        var lastIndex = 0;
        json_node_search_1.forEachMatchFromString(pattern, text, function (index, length) {
            if (lastIndex < index) {
                fragment.appendChild(document.createTextNode(text.substring(lastIndex, index)));
            }
            var mark = document.createElement('mark');
            mark.appendChild(document.createTextNode(text.substr(index, length)));
            fragment.appendChild(mark);
            lastIndex = index + length;
        });
        if (lastIndex !== text.length) {
            fragment.appendChild(document.createTextNode(text.substring(lastIndex, text.length)));
        }
        return fragment;
    };
    BigJsonViewer.prototype.openBySearch = function (nodeElement, pattern, openLimit, searchArea) {
        return __awaiter(this, void 0, void 0, function () {
            var viewer, matches, activeMark, cursor, length, i, openedElement;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!pattern) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.closeNode(nodeElement, true)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, null];
                    case 2:
                        viewer = this;
                        return [4 /*yield*/, this.rootNode.search(nodeElement.jsonNode.path, pattern, searchArea)];
                    case 3:
                        matches = _a.sent();
                        activeMark = null;
                        cursor = {
                            matches: matches,
                            index: 0,
                            navigateTo: function navigateTo(index) {
                                return __awaiter(this, void 0, void 0, function () {
                                    var match, openedElement;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                this.index = index;
                                                match = this.matches[index];
                                                if (!match) {
                                                    return [2 /*return*/];
                                                }
                                                return [4 /*yield*/, viewer.openSearchMatch(nodeElement, this.matches[index])];
                                            case 1:
                                                openedElement = _a.sent();
                                                if (!openedElement) return [3 /*break*/, 3];
                                                return [4 /*yield*/, viewer.highlightNode(openedElement, pattern)];
                                            case 2:
                                                _a.sent();
                                                openedElement.scrollIntoView({ block: 'center' });
                                                if (activeMark) {
                                                    activeMark.classList.remove('highlight-active');
                                                }
                                                activeMark = viewer.findMarkForMatch(openedElement, match);
                                                if (activeMark) {
                                                    activeMark.classList.add('highlight-active');
                                                }
                                                _a.label = 3;
                                            case 3:
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            },
                            next: function next() {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                return [4 /*yield*/, this.navigateTo(this.index + 1 >= this.matches.length ? 0 : this.index + 1)];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            },
                            previous: function previous() {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                return [4 /*yield*/, this.navigateTo(this.index - 1 < 0 ? this.matches.length : this.index - 1)];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            }
                        };
                        length = Math.min(matches.length, openLimit);
                        i = 0;
                        _a.label = 4;
                    case 4:
                        if (!(i < length && i < openLimit)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.openSearchMatch(nodeElement, matches[i])];
                    case 5:
                        openedElement = _a.sent();
                        if (!openedElement) return [3 /*break*/, 7];
                        return [4 /*yield*/, viewer.highlightNode(openedElement, pattern)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 4];
                    case 8:
                        this.dispatchNodeEvent('openedNodes', nodeElement);
                        cursor.navigateTo(0);
                        return [2 /*return*/, cursor];
                }
            });
        });
    };
    BigJsonViewer.prototype.findMarkForMatch = function (nodeElement, match) {
        var children = null,
            expectIndex = 0;
        if (match.key !== undefined) {
            var label = nodeElement.headerElement.querySelector('.json-node-label');
            if (label) {
                children = label.childNodes;
                expectIndex = match.key;
            }
        }
        if (match.value !== undefined) {
            var value = nodeElement.headerElement.querySelector('.json-node-value');
            if (value) {
                children = value.childNodes;
                expectIndex = match.value;
            }
        }
        if (children) {
            var index = nodeElement.jsonNode.type === 'string' ? -1 : 0;
            for (var i = 0; i < children.length; i++) {
                var cn = children[i];
                if (cn.nodeType === Node.TEXT_NODE) {
                    index += cn.textContent.length;
                }
                if (cn.nodeType === Node.ELEMENT_NODE && cn.tagName === 'MARK' && expectIndex === index) {
                    return cn;
                }
            }
        }
        return null;
    };
    BigJsonViewer.prototype.openSearchMatch = function (nodeElement, match) {
        return __awaiter(this, void 0, void 0, function () {
            var matchNodeElementParent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(match.key !== undefined && match.path.length)) return [3 /*break*/, 4];
                        if (!match.path.length) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.openPath(nodeElement, match.path.slice(0, -1))];
                    case 1:
                        matchNodeElementParent = _a.sent();
                        if (!matchNodeElementParent) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.openKey(matchNodeElementParent, match.path[match.path.length - 1])];
                    case 2:
                        return [2 /*return*/, _a.sent()]; // ensure the key is visible
                    case 3:
                        return [3 /*break*/, 6];
                    case 4:
                        if (!(match.value !== undefined)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.openPath(nodeElement, match.path)];
                    case 5:
                        return [2 /*return*/, _a.sent()];
                    case 6:
                        return [2 /*return*/, null];
                }
            });
        });
    };
    BigJsonViewer.prototype.getOpenPaths = function (nodeElement, withSubs) {
        var result = [];
        if (!nodeElement.isNodeOpen()) {
            return result;
        }
        var children = nodeElement.childrenElement.children;
        var nodeElements = this.getVisibleChildren(children);
        for (var i = 0; i < nodeElements.length; i++) {
            var element = nodeElements[i];
            if (element.isNodeOpen()) {
                result.push.apply(result, this.getOpenPaths(element, withSubs));
            }
        }
        var limit = this.getPaginationLimit(nodeElement.jsonNode);
        // find open stubs
        if (!result.length && limit) {
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child.isNodeOpen() && child.childrenElement && child.childrenElement.children.length) {
                    var first = child.childrenElement.children[0];
                    if (first.jsonNode) {
                        result.push(first.jsonNode.path);
                    }
                }
            }
        }
        if (!result.length) {
            result.push(nodeElement.jsonNode.path);
        }
        return result;
    };
    BigJsonViewer.prototype.openNode = function (nodeElement, dispatchEvent) {
        if (dispatchEvent === void 0) {
            dispatchEvent = false;
        }
        return __awaiter(this, void 0, void 0, function () {
            var children;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (nodeElement.isNodeOpen()) {
                            return [2 /*return*/, false];
                        }
                        nodeElement.headerElement.classList.add('json-node-open');
                        return [4 /*yield*/, this.getPaginatedNodeChildren(nodeElement)];
                    case 1:
                        children = _a.sent();
                        nodeElement.childrenElement = nodeElement.appendChild(children);
                        if (dispatchEvent) {
                            this.dispatchNodeEvent('openNode', nodeElement);
                        }
                        return [2 /*return*/, true];
                }
            });
        });
    };
    BigJsonViewer.prototype.dispatchNodeEvent = function (type, nodeElement) {
        var event;
        if (document.createEvent) {
            event = document.createEvent('Event');
            event.initEvent(type, true, false);
        } else {
            event = new Event(type, {
                bubbles: true,
                cancelable: false
            });
        }
        nodeElement.dispatchEvent(event);
    };
    BigJsonViewer.prototype.openKey = function (nodeElement, key) {
        return __awaiter(this, void 0, void 0, function () {
            var node, children, index, keys, stubIndex, stub, stubIndex, stub, childNodeElement;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        node = nodeElement.jsonNode;
                        children = null;
                        index = -1;
                        if (!(node.type === 'object')) return [3 /*break*/, 6];
                        return [4 /*yield*/, node.getObjectKeys()];
                    case 1:
                        keys = _a.sent();
                        index = keys.indexOf(key);
                        if (index === -1) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, nodeElement.openNode()];
                    case 2:
                        _a.sent();
                        if (!(node.length > this.options.objectNodesLimit)) return [3 /*break*/, 5];
                        stubIndex = Math.floor(index / this.options.objectNodesLimit);
                        stub = nodeElement.childrenElement.children[stubIndex];
                        if (!stub) return [3 /*break*/, 4];
                        return [4 /*yield*/, stub.openNode()];
                    case 3:
                        _a.sent();
                        index -= stubIndex * this.options.objectNodesLimit;
                        children = stub.childrenElement.children;
                        _a.label = 4;
                    case 4:
                        return [3 /*break*/, 6];
                    case 5:
                        children = nodeElement.childrenElement.children;
                        _a.label = 6;
                    case 6:
                        if (!(node.type === 'array')) return [3 /*break*/, 11];
                        index = parseInt(key);
                        if (isNaN(index) || index >= node.length || index < 0) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, nodeElement.openNode()];
                    case 7:
                        _a.sent();
                        if (!(node.length > this.options.arrayNodesLimit)) return [3 /*break*/, 10];
                        stubIndex = Math.floor(index / this.options.arrayNodesLimit);
                        stub = nodeElement.childrenElement.children[stubIndex];
                        if (!stub) return [3 /*break*/, 9];
                        return [4 /*yield*/, stub.openNode()];
                    case 8:
                        _a.sent();
                        index -= stubIndex * this.options.arrayNodesLimit;
                        children = stub.childrenElement.children;
                        _a.label = 9;
                    case 9:
                        return [3 /*break*/, 11];
                    case 10:
                        children = nodeElement.childrenElement.children;
                        _a.label = 11;
                    case 11:
                        if (children && index >= 0 && index < children.length) {
                            childNodeElement = children[index];
                            if (!childNodeElement.jsonNode) {
                                return [2 /*return*/, null];
                            }
                            return [2 /*return*/, childNodeElement];
                        }
                        return [2 /*return*/, null];
                }
            });
        });
    };
    BigJsonViewer.prototype.openPath = function (nodeElement, path, dispatchEvent) {
        if (dispatchEvent === void 0) {
            dispatchEvent = false;
        }
        return __awaiter(this, void 0, void 0, function () {
            var element, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!path.length) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.openNode(nodeElement, dispatchEvent)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, nodeElement];
                    case 2:
                        element = nodeElement;
                        i = 0;
                        _a.label = 3;
                    case 3:
                        if (!(i < path.length)) return [3 /*break*/, 7];
                        if (!element) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, this.openKey(element, path[i])];
                    case 4:
                        element = _a.sent();
                        if (!element) return [3 /*break*/, 6];
                        return [4 /*yield*/, element.openNode()];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        i++;
                        return [3 /*break*/, 3];
                    case 7:
                        if (dispatchEvent) {
                            this.dispatchNodeEvent('openedNodes', nodeElement);
                        }
                        return [2 /*return*/, element];
                }
            });
        });
    };
    BigJsonViewer.prototype.openAll = function (nodeElement, maxDepth, paginated, dispatchEvent) {
        if (dispatchEvent === void 0) {
            dispatchEvent = false;
        }
        return __awaiter(this, void 0, void 0, function () {
            var opened, newMaxDepth, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        return [4 /*yield*/, nodeElement.openNode()];
                    case 1:
                        _b.sent();
                        opened = 1;
                        if (maxDepth <= 1 || !nodeElement.childrenElement) {
                            return [2 /*return*/, opened];
                        }
                        newMaxDepth = maxDepth === Infinity ? Infinity : maxDepth - 1;
                        _a = opened;
                        return [4 /*yield*/, this.openAllChildren(nodeElement.childrenElement.children, newMaxDepth, paginated)];
                    case 2:
                        opened = _a + _b.sent();
                        if (dispatchEvent) {
                            this.dispatchNodeEvent('openedNodes', nodeElement);
                        }
                        return [2 /*return*/, opened];
                }
            });
        });
    };
    BigJsonViewer.prototype.openAllChildren = function (children, maxDepth, paginated) {
        return __awaiter(this, void 0, void 0, function () {
            var opened, i, child, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        opened = 0;
                        i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(i < children.length)) return [3 /*break*/, 8];
                        child = children[i];
                        if (!child.jsonNode) return [3 /*break*/, 3];
                        _a = opened;
                        return [4 /*yield*/, child.openAll(maxDepth, paginated)];
                    case 2:
                        opened = _a + _c.sent();
                        return [3 /*break*/, 7];
                    case 3:
                        if (!child.openNode) return [3 /*break*/, 7];
                        if (paginated === 'none') {
                            return [2 /*return*/, opened];
                        }
                        return [4 /*yield*/, child.openNode()];
                    case 4:
                        _c.sent();
                        if (!child.childrenElement) return [3 /*break*/, 6];
                        _b = opened;
                        return [4 /*yield*/, this.openAllChildren(child.childrenElement.children, maxDepth, paginated)];
                    case 5:
                        opened = _b + _c.sent();
                        _c.label = 6;
                    case 6:
                        if (paginated === 'first') {
                            return [2 /*return*/, opened];
                        }
                        _c.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 1];
                    case 8:
                        return [2 /*return*/, opened];
                }
            });
        });
    };
    /**
     * Returns the pagination limit, if the node should have
     */
    BigJsonViewer.prototype.getPaginationLimit = function (node) {
        if (node.type === 'array' && node.length > this.options.arrayNodesLimit) {
            return this.options.arrayNodesLimit;
        }
        if (node.type === 'object' && node.length > this.options.objectNodesLimit) {
            return this.options.objectNodesLimit;
        }
        return 0;
    };
    BigJsonViewer.prototype.getVisibleChildren = function (children) {
        var result = [];
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (child.jsonNode) {
                result.push(child);
            } else if (child.openNode && child.isNodeOpen() && child.childrenElement) {
                result.push.apply( // is a stub
                result, this.getVisibleChildren(child.childrenElement.children));
            }
        }
        return result;
    };
    BigJsonViewer.prototype.getPaginatedNodeChildren = function (nodeElement) {
        return __awaiter(this, void 0, void 0, function () {
            var node, element, limit, start, nodes, _i, nodes_1, node_1, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        node = nodeElement.jsonNode;
                        element = document.createElement('div');
                        element.classList.add('json-node-children');
                        limit = this.getPaginationLimit(node);
                        if (!limit) return [3 /*break*/, 1];
                        for (start = 0; start < node.length; start += limit) {
                            element.appendChild(this.getPaginationStub(node, start, limit));
                        }
                        return [3 /*break*/, 6];
                    case 1:
                        return [4 /*yield*/, this.getChildNodes(node, 0, limit)];
                    case 2:
                        nodes = _c.sent();
                        _i = 0, nodes_1 = nodes;
                        _c.label = 3;
                    case 3:
                        if (!(_i < nodes_1.length)) return [3 /*break*/, 6];
                        node_1 = nodes_1[_i];
                        _b = (_a = element).appendChild;
                        return [4 /*yield*/, this.getNodeElement(node_1)];
                    case 4:
                        _b.apply(_a, [_c.sent()]);
                        _c.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6:
                        return [2 /*return*/, element];
                }
            });
        });
    };
    BigJsonViewer.prototype.getChildNodes = function (node, start, limit) {
        if (node.type === 'object') {
            return node.getObjectNodes(start, limit);
        }
        if (node.type === 'array') {
            return node.getArrayNodes(start, limit);
        }
        return Promise.resolve([]);
    };
    BigJsonViewer.prototype.getPaginationStub = function (node, start, limit) {
        var _this = this;
        var stubElement = document.createElement('div');
        stubElement.classList.add('json-node-stub');
        var anchor = document.createElement('a');
        anchor.href = 'javascript:';
        anchor.classList.add('json-node-stub-toggler');
        stubElement.headerElement = anchor;
        this.generateAccessor(anchor);
        var end = Math.min(node.length, start + limit) - 1;
        var label = document.createElement('span');
        label.classList.add('json-node-label');
        label.appendChild(document.createTextNode('[' + start + ' ... ' + end + ']'));
        anchor.appendChild(label);
        stubElement.appendChild(anchor);
        anchor.addEventListener('click', function (e) {
            return __awaiter(_this, void 0, void 0, function () {
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            e.preventDefault();
                            if (!stubElement.isNodeOpen()) return [3 /*break*/, 1];
                            this.closePaginationStub(stubElement, true);
                            return [3 /*break*/, 4];
                        case 1:
                            _a = this.openPaginationStub;
                            _b = [stubElement];
                            return [4 /*yield*/, this.getChildNodes(node, start, limit)];
                        case 2:
                            return [4 /*yield*/, _a.apply(this, _b.concat([_c.sent(), true]))];
                        case 3:
                            _c.sent();
                            _c.label = 4;
                        case 4:
                            return [2 /*return*/];
                    }
                });
            });
        });
        stubElement.isNodeOpen = function () {
            return anchor.classList.contains('json-node-open');
        };
        stubElement.openNode = function () {
            return __awaiter(_this, void 0, void 0, function () {
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (!!stubElement.isNodeOpen()) return [3 /*break*/, 3];
                            _a = this.openPaginationStub;
                            _b = [stubElement];
                            return [4 /*yield*/, this.getChildNodes(node, start, limit)];
                        case 1:
                            return [4 /*yield*/, _a.apply(this, _b.concat([_c.sent()]))];
                        case 2:
                            _c.sent();
                            return [2 /*return*/, true];
                        case 3:
                            return [2 /*return*/, false];
                    }
                });
            });
        };
        stubElement.closeNode = function () {
            return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (stubElement.isNodeOpen()) {
                        this.closePaginationStub(stubElement);
                        return [2 /*return*/, false];
                    }
                    return [2 /*return*/, true];
                });
            });
        };
        stubElement.toggleNode = function () {
            if (stubElement.isNodeOpen()) {
                return stubElement.closeNode();
            } else {
                return stubElement.openNode();
            }
        };
        return stubElement;
    };
    BigJsonViewer.prototype.closePaginationStub = function (stubElement, dispatchEvent) {
        if (dispatchEvent === void 0) {
            dispatchEvent = false;
        }
        if (stubElement.childrenElement) {
            stubElement.headerElement.classList.remove('json-node-open');
            stubElement.removeChild(stubElement.childrenElement);
            stubElement.childrenElement = null;
            if (dispatchEvent) {
                this.dispatchNodeEvent('closeStub', stubElement);
            }
        }
    };
    BigJsonViewer.prototype.openPaginationStub = function (stubElement, nodes, dispatchEvent) {
        if (dispatchEvent === void 0) {
            dispatchEvent = false;
        }
        return __awaiter(this, void 0, void 0, function () {
            var children, _i, nodes_2, node, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        stubElement.headerElement.classList.add('json-node-open');
                        children = document.createElement('div');
                        children.classList.add('json-node-children');
                        stubElement.childrenElement = children;
                        _i = 0, nodes_2 = nodes;
                        _c.label = 1;
                    case 1:
                        if (!(_i < nodes_2.length)) return [3 /*break*/, 4];
                        node = nodes_2[_i];
                        _b = (_a = children).appendChild;
                        return [4 /*yield*/, this.getNodeElement(node)];
                    case 2:
                        _b.apply(_a, [_c.sent()]);
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        stubElement.appendChild(children);
                        if (dispatchEvent) {
                            this.dispatchNodeEvent('openStub', stubElement);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    BigJsonViewer.prototype.getNodeHeader = function (node, highlightPattern) {
        if (highlightPattern === void 0) {
            highlightPattern = null;
        }
        return __awaiter(this, void 0, void 0, function () {
            var element, anchor;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        element = document.createElement('div');
                        element.classList.add('json-node-header');
                        element.classList.add('json-node-' + node.type);
                        if (!(node.type === 'object' || node.type === 'array')) return [3 /*break*/, 1];
                        anchor = document.createElement('a');
                        anchor.classList.add('json-node-toggler');
                        anchor.href = 'javascript:';
                        if (node.length) {
                            this.attachClickToggleListener(anchor);
                            this.generateAccessor(anchor);
                        }
                        this.generateLabel(anchor, node, highlightPattern);
                        this.generateTypeInfo(anchor, node);
                        element.appendChild(anchor);
                        return [3 /*break*/, 3];
                    case 1:
                        this.generateLabel(element, node, highlightPattern);
                        return [4 /*yield*/, this.generateValue(element, node, highlightPattern)];
                    case 2:
                        _a.sent();
                        this.generateTypeInfo(element, node);
                        _a.label = 3;
                    case 3:
                        this.generateLinks(element, node);
                        return [2 /*return*/, element];
                }
            });
        });
    };
    BigJsonViewer.prototype.generateAccessor = function (parent) {
        var span = document.createElement('span');
        span.classList.add('json-node-accessor');
        parent.appendChild(span);
    };
    BigJsonViewer.prototype.generateTypeInfo = function (parent, node) {
        var typeInfo = document.createElement('span');
        typeInfo.classList.add('json-node-type');
        if (node.type === 'object') {
            typeInfo.appendChild(document.createTextNode('Object(' + node.length + ')'));
        } else if (node.type === 'array') {
            typeInfo.appendChild(document.createTextNode('Array[' + node.length + ']'));
        } else {
            typeInfo.appendChild(document.createTextNode(node.type));
        }
        parent.appendChild(typeInfo);
    };
    BigJsonViewer.prototype.generateLabel = function (parent, node, highlightPattern) {
        if (!node.path.length) {
            return;
        }
        var label = document.createElement('span');
        label.classList.add('json-node-label');
        if (this.options.labelAsPath && node.path.length > 1) {
            var prefix = document.createElement('span');
            prefix.classList.add('json-node-label-prefix');
            prefix.appendChild(document.createTextNode(node.path.slice(0, node.path.length - 1).join('.') + '.'));
            label.appendChild(prefix);
        }
        label.appendChild(this.getHighlightedText(node.path[node.path.length - 1], highlightPattern));
        parent.appendChild(label);
        parent.appendChild(document.createTextNode(': '));
    };
    BigJsonViewer.prototype.generateValue = function (parent, node, highlightPattern) {
        return __awaiter(this, void 0, void 0, function () {
            var value, valueElement;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        return [4 /*yield*/, node.getValue()];
                    case 1:
                        value = _a.sent();
                        valueElement = document.createElement('span');
                        valueElement.classList.add('json-node-value');
                        valueElement.appendChild(this.getHighlightedText(JSON.stringify(value), highlightPattern));
                        parent.appendChild(valueElement);
                        return [2 /*return*/];
                }
            });
        });
    };
    BigJsonViewer.prototype.generateLinks = function (parent, node) {
        var _this = this;
        if (this.isOpenableNode(node) && this.options.linkLabelExpandAll) {
            var link = parent.appendChild(document.createElement('a'));
            link.classList.add('json-node-link');
            link.href = 'javascript:';
            link.appendChild(document.createTextNode(this.options.linkLabelExpandAll));
            link.addEventListener('click', function (e) {
                return __awaiter(_this, void 0, void 0, function () {
                    var nodeElement;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                e.preventDefault();
                                nodeElement = this.findNodeElement(parent);
                                if (!(nodeElement && this.isOpenableNode(nodeElement.jsonNode))) return [3 /*break*/, 2];
                                return [4 /*yield*/, this.openAll(nodeElement, Infinity, 'first', true)];
                            case 1:
                                _a.sent();
                                _a.label = 2;
                            case 2:
                                return [2 /*return*/];
                        }
                    });
                });
            });
        }
        if (node.path.length && this.options.linkLabelCopyPath) {
            var link = parent.appendChild(document.createElement('a'));
            link.classList.add('json-node-link');
            link.href = 'javascript:';
            link.appendChild(document.createTextNode(this.options.linkLabelCopyPath));
            link.addEventListener('click', function (e) {
                e.preventDefault();
                var input = document.createElement('input');
                input.type = 'text';
                input.value = node.path.join('.');
                var nodeElement = _this.findNodeElement(parent);
                _this.dispatchNodeEvent('copyPath', nodeElement);
                parent.appendChild(input);
                input.select();
                try {
                    if (!document.execCommand('copy')) {
                        console.warn('Unable to copy path to clipboard');
                    }
                } catch (e) {
                    console.error('Unable to copy path to clipboard', e);
                }
                parent.removeChild(input);
            });
        }
    };
    BigJsonViewer.prototype.findNodeElement = function (el) {
        while (el && !el['jsonNode']) {
            el = el.parentElement;
        }
        return el;
    };
    return BigJsonViewer;
}();
exports.BigJsonViewer = BigJsonViewer;
},{"./parser/json-node-search":13,"./worker-client":7}],4:[function(require,module,exports) {
"use strict";

function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./parser/buffer-json-parser"));
__export(require("./parser/json-node-info"));
__export(require("./big-json-viewer"));
__export(require("./worker-client"));
},{"./parser/buffer-json-parser":8,"./parser/json-node-info":9,"./big-json-viewer":6,"./worker-client":7}],3:[function(require,module,exports) {
"use strict";

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = this && this.__generator || function (thisArg, body) {
    var _ = { label: 0, sent: function sent() {
            if (t[0] & 1) throw t[1];return t[1];
        }, trys: [], ops: [] },
        f,
        y,
        t,
        g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
        return this;
    }), g;
    function verb(n) {
        return function (v) {
            return step([n, v]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) {
            try {
                if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [0, t.value];
                switch (op[0]) {
                    case 0:case 1:
                        t = op;break;
                    case 4:
                        _.label++;return { value: op[1], done: false };
                    case 5:
                        _.label++;y = op[1];op = [0];continue;
                    case 7:
                        op = _.ops.pop();_.trys.pop();continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                            _ = 0;continue;
                        }
                        if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                            _.label = op[1];break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];t = op;break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];_.ops.push(op);break;
                        }
                        if (t[2]) _.ops.pop();
                        _.trys.pop();continue;
                }
                op = body.call(thisArg, _);
            } catch (e) {
                op = [6, e];y = 0;
            } finally {
                f = t = 0;
            }
        }if (op[0] & 5) throw op[1];return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var src_1 = require("../src");
var demoData = {
    simpleData: {
        element1: 'str',
        element2: 1234,
        element3: [23, 43, true, false, null, { name: 'special' }, {}],
        element4: [],
        element5: 'this should be some long text\nwith line break',
        element6: {
            name: 'Hero',
            age: 32,
            birthday: { year: 1986, month: 4, day: 30 }
        }
    },
    largeData: function () {
        var list = new Array(Math.floor(Math.random() * 1000));
        for (var i = 0; i < list.length; i++) {
            list[i] = Math.random();
            if (list[i] < 0.2) {
                list[i] = 'hey ' + list[i];
            }
            if (list[i] > 0.8) {
                list[i] = {};
                var entries = Math.floor(Math.random() * 1000);
                for (var j = 0; j < entries; j++) {
                    list[i]['entry-' + j] = Math.random();
                }
            }
        }
        return list;
    }()
};
var codeElement = document.getElementById('code');
var viewerElement = document.getElementById('viewer');
var pathsElement = document.getElementById('paths');
var copiedElement = document.getElementById('copied');
var searchElement = document.getElementById('search');
var searchInfoElement = document.getElementById('searchInfo');
var rootNode = document.getElementById('rootNode');
querySelectorArray('[data-load]').forEach(function (link) {
    var load = link.getAttribute('data-load');
    if (demoData[load] && !link.loadListener) {
        link.loadListener = true;
        link.addEventListener('click', function (e) {
            e.preventDefault();
            loadStructureData(demoData[load]);
        });
    }
});
codeElement.addEventListener('input', function (e) {
    console.log('show data based on input');
    showData(codeElement.value);
});
searchElement.addEventListener('input', function (e) {
    return __awaiter(_this, void 0, void 0, function () {
        var cursor_1, prevBtn, nextBtn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    return [4 /*yield*/, rootNode.closeNode()];
                case 1:
                    _a.sent();
                    if (!(searchElement.value.length >= 2)) return [3 /*break*/, 3];
                    return [4 /*yield*/, rootNode.openBySearch(new RegExp(searchElement.value, 'i'))];
                case 2:
                    cursor_1 = _a.sent();
                    searchInfoElement.textContent = cursor_1.matches.length + ' matches';
                    searchInfoElement.appendChild(document.createTextNode(' '));
                    prevBtn = searchInfoElement.appendChild(document.createElement('a'));
                    prevBtn.href = 'javascript:';
                    prevBtn.addEventListener('click', function (e) {
                        e.preventDefault();
                        cursor_1.previous();
                    });
                    prevBtn.textContent = 'Prev';
                    searchInfoElement.appendChild(document.createTextNode(' '));
                    nextBtn = searchInfoElement.appendChild(document.createElement('a'));
                    nextBtn.href = 'javascript:';
                    nextBtn.addEventListener('click', function (e) {
                        e.preventDefault();
                        cursor_1.next();
                    });
                    nextBtn.textContent = 'Next';
                    return [3 /*break*/, 5];
                case 3:
                    return [4 /*yield*/, rootNode.openBySearch(null)];
                case 4:
                    _a.sent();
                    searchInfoElement.textContent = '';
                    _a.label = 5;
                case 5:
                    return [2 /*return*/];
            }
        });
    });
});
loadStructureData(demoData.simpleData);
function loadStructureData(structure) {
    var text = JSON.stringify(structure, null, 2);
    codeElement.value = text;
    showData(text);
    showPaths();
}
function showData(data) {
    return __awaiter(this, void 0, void 0, function () {
        var e_1, errEl;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (viewerElement.children.length) {
                        viewerElement.removeChild(viewerElement.children[0]);
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4,, 5]);
                    return [4 /*yield*/, src_1.BigJsonViewer.elementFromData(data)];
                case 2:
                    rootNode = _a.sent();
                    rootNode.id = 'rootNode';
                    viewerElement.appendChild(rootNode);
                    return [4 /*yield*/, rootNode.openAll(1)];
                case 3:
                    _a.sent();
                    setupRootNode();
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    console.error('BigJsonViewer error', e_1);
                    errEl = document.createElement('div');
                    errEl.classList.add('alert', 'alert-danger');
                    errEl.appendChild(document.createTextNode(e_1.toString()));
                    viewerElement.appendChild(errEl);
                    return [3 /*break*/, 5];
                case 5:
                    return [2 /*return*/];
            }
        });
    });
}
function setupRootNode() {
    var listener = function listener(e) {
        console.log('event', e.type);
        showPaths();
    };
    rootNode.addEventListener('openNode', listener);
    rootNode.addEventListener('closeNode', listener);
    rootNode.addEventListener('openedNodes', listener);
    rootNode.addEventListener('openStub', listener);
    rootNode.addEventListener('closeStub', listener);
    rootNode.addEventListener('copyPath', function (e) {
        var node = e.target;
        copiedElement.value = node.jsonNode.path.join('.');
    });
}
function showPaths() {
    if (!rootNode || !rootNode.getOpenPaths) {
        return;
    }
    pathsElement.value = rootNode.getOpenPaths().map(function (path) {
        return path.join('.');
    }).join('\n');
}
function querySelectorArray(selector) {
    var list = document.querySelectorAll(selector);
    var result = [];
    for (var i = 0; i < list.length; i++) {
        result.push(list[i]);
    }
    return result;
}
},{"../src":4}]},{},[3])
//# sourceMappingURL=652b9485934fffc4b5411ae89694ac4e.map