require=function(r,e,n){function t(n,o){function i(r){return t(i.resolve(r))}function f(e){return r[n][1][e]||e}if(!e[n]){if(!r[n]){var c="function"==typeof require&&require;if(!o&&c)return c(n,!0);if(u)return u(n,!0);var l=new Error("Cannot find module '"+n+"'");throw l.code="MODULE_NOT_FOUND",l}i.resolve=f;var s=e[n]=new t.Module(n);r[n][0].call(s.exports,i,s,s.exports)}return e[n].exports}function o(r){this.id=r,this.bundle=t,this.exports={}}var u="function"==typeof require&&require;t.isParcelRequire=!0,t.Module=o,t.modules=r,t.cache=e,t.parent=u;for(var i=0;i<n.length;i++)t(n[i]);return t}({13:[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var t="{".charCodeAt(0),e="}".charCodeAt(0),r="[".charCodeAt(0),o="]".charCodeAt(0),a=":".charCodeAt(0),n=",".charCodeAt(0),i='"'.charCodeAt(0),s="'".charCodeAt(0),h=" ".charCodeAt(0),d="\t".charCodeAt(0),p="\n".charCodeAt(0),f="\b".charCodeAt(0),c="\r".charCodeAt(0),u="\f".charCodeAt(0),l="\\".charCodeAt(0),y="/".charCodeAt(0),b="-".charCodeAt(0),g="+".charCodeAt(0),v=".".charCodeAt(0),I="e".charCodeAt(0),j="E".charCodeAt(0),A=[h,d,p,c],w="0123456789".split("").map(function(t){return t.charCodeAt(0)}),N="null".split("").map(function(t){return t.charCodeAt(0)}),C="true".split("").map(function(t){return t.charCodeAt(0)}),x="false".split("").map(function(t){return t.charCodeAt(0)}),m=function(){function t(t,e,r){this.path=[],this.parser=t,this.index=e,this.path=r}return t.prototype.getObjectKeys=function(t,e){if(void 0===t&&(t=0),"object"!==this.type)throw new Error("Unsupported method on non-object "+this.type);O(t,e);var r={path:this.path,objectKeys:[],start:t,limit:e};return this.parser.parseObject(this.index,r),r.objectKeys},t.prototype.getByIndex=function(t){var e;if("object"===this.type&&(e=this.getObjectNodes(t,1)).length)return e[0];if("array"===this.type&&(e=this.getArrayNodes(t,1)).length)return e[0]},t.prototype.getByKey=function(t){if("object"===this.type){var e={path:this.path,objectKey:t};return this.parser.parseObject(this.index,e),e.objectNodes?e.objectNodes[0]:void 0}if("array"===this.type)return this.getByIndex(parseInt(t))},t.prototype.getByPath=function(t){if(t&&t.length){for(var e,r=t.slice(),o=this;void 0!==(e=r.shift())&&o;)o=o.getByKey(e);return o}},t.prototype.getObjectNodes=function(t,e){if(void 0===t&&(t=0),"object"!==this.type)throw new Error("Unsupported method on non-object "+this.type);O(t,e);var r={path:this.path,objectNodes:[],start:t,limit:e};return this.parser.parseObject(this.index,r),r.objectNodes},t.prototype.getArrayNodes=function(t,e){if(void 0===t&&(t=0),"array"!==this.type)throw new Error("Unsupported method on non-array "+this.type);O(t,e);var r={path:this.path,arrayNodes:[],start:t,limit:e};return this.parser.parseArray(this.index,r),r.arrayNodes},t.prototype.getValue=function(){return this.parser.parseNative(this.index,this.index+this.chars)},t}();exports.BufferJsonNodeInfo=m;var k=function(){function h(t){if(t instanceof ArrayBuffer)this.data=new Uint16Array(t);else if("string"==typeof t&&"undefined"!=typeof TextEncoder)this.data=(new TextEncoder).encode(t);else if("string"==typeof t){this.data=new Uint16Array(new ArrayBuffer(2*t.length));for(var e=0;e<t.length;e++)this.data[e]=t.charCodeAt(e)}}return h.prototype.getRootNodeInfo=function(){var t=this.skipIgnored(0),e={path:[],nodeInfo:new m(this,t,[])};return t===this.parseValue(t,e,!1)?null:e.nodeInfo},h.prototype.parseValue=function(e,o,a){void 0===a&&(a=!0);var n=this.data[e];if(function(t){return t===i||t===s}(n))return this.parseString(e,o);if(function(t){return t===b||-1!==w.indexOf(t)}(n))return this.parseNumber(e,o);if(n===t)return this.parseObject(e,o);if(n===r)return this.parseArray(e,o);if(n===C[0])return this.parseToken(e,C,o);if(n===x[0])return this.parseToken(e,x,o);if(n===N[0])return this.parseToken(e,N,o);if(a)throw new Error("parse value unknown token "+E(n)+" at "+e)},h.prototype.parseObject=function(t,r){for(var o=t+1,i=0,s=[],h=[];o<=this.data.length;){if(o===this.data.length)throw new Error("parse object incomplete at end");if(o=this.skipIgnored(o),this.data[o]===e){o++;break}var d=f(i);if(o=this.parseString(o,d),d&&r&&r.objectKeys&&s.push(d.value),o=this.skipIgnored(o),this.data[o]!==a)throw new Error("parse object unexpected token "+E(this.data[o])+" at "+o+". Expected :");o++,o=this.skipIgnored(o);var p=null;if(d&&r&&(r.objectNodes||d.value===r.objectKey)&&(p={path:r.path,nodeInfo:new m(this,o,r.path.concat([d.value]))}),o=this.parseValue(o,p),o=this.skipIgnored(o),p&&r.objectNodes)h.push(p.nodeInfo);else if(p&&void 0!==r.objectKey)return void(r.objectNodes=[p.nodeInfo]);if(i++,this.data[o]===n)o++;else if(this.data[o]!==e)throw new Error("parse object unexpected token "+E(this.data[o])+" at "+o+". Expected , or }")}function f(t){return!r||r.start&&t<r.start||r.limit&&t>=r.start+r.limit?null:r&&(r.objectKeys||r.objectNodes||void 0!==r.objectKey)?{path:r.path,value:null}:null}return r&&r.nodeInfo&&(r.nodeInfo.type="object",r.nodeInfo.length=i,r.nodeInfo.chars=o-t),r&&r.objectKeys&&(r.objectKeys=s),r&&r.objectNodes&&(r.objectNodes=h),o},h.prototype.parseArray=function(t,e){for(var r,a=t+1,i=0;a<=this.data.length;){if(a===this.data.length)throw new Error("parse array incomplete at end");if(a=this.skipIgnored(a),this.data[a]===o){a++;break}var s=null;if(r=i,!e||e.start&&r<e.start||e.limit&&r>=e.start+e.limit||!e.arrayNodes||(s={path:e.path,nodeInfo:new m(this,a,e.path.concat([i.toString()]))}),a=this.parseValue(a,s),s&&e.arrayNodes.push(s.nodeInfo),a=this.skipIgnored(a),i++,this.data[a]===n)a++;else if(this.data[a]!==o)throw new Error("parse array unexpected token "+E(this.data[a])+" at "+a+". Expected , or ]")}return e&&e.nodeInfo&&(e.nodeInfo.type="array",e.nodeInfo.length=i,e.nodeInfo.chars=a-t),a},h.prototype.parseString=function(t,e){var r=t,o=this.data[r]===i?i:s,a=!1,n=0;for(r++;r<=this.data.length;r++){if(r===this.data.length)throw new Error("parse string incomplete at end");if(!a&&this.data[r]===o){r++;break}(a=this.data[r]===l&&!a)||n++}return e&&e.nodeInfo&&(e.nodeInfo.type="string",e.nodeInfo.length=n,e.nodeInfo.chars=r-t),e&&void 0!==e.value&&(e.value=JSON.parse(E(this.data.subarray(t,r)))),r},h.prototype.parseNumber=function(t,e){var r=t;return this.data[r]===b&&r++,r=this.parseDigits(r),this.data[r]===v&&(r++,r=this.parseDigits(r)),this.data[r]!==j&&this.data[r]!==I||(r++,this.data[r]!==g&&this.data[r]!==b||r++,r=this.parseDigits(r)),e&&e.nodeInfo&&(e.nodeInfo.type="number",e.nodeInfo.chars=r-t),e&&void 0!==e.value&&(e.value=JSON.parse(E(this.data.subarray(t,r)))),r},h.prototype.parseDigits=function(t){for(;-1!==w.indexOf(this.data[t]);t++);return t},h.prototype.parseToken=function(t,e,r){for(var o=t,a=0;a<e.length;a++){if(this.data[o]!==e[a])throw new Error("Unexpected token "+E(this.data[o])+" at "+o+". Expected "+E(e));o++}var n=E(this.data.subarray(t,o));return r&&r.nodeInfo&&(r.nodeInfo.type="null"===n?"null":"boolean",r.nodeInfo.chars=o-t),r&&void 0!==r.value&&(r.value=JSON.parse(n)),o},h.prototype.parseNative=function(t,e){return JSON.parse(E(this.data.subarray(t,e)))},h.prototype.skipIgnored=function(t){for(var e=t;e<this.data.length;e++)if(-1===A.indexOf(this.data[e]))return e},h}();function E(t){return"number"==typeof t&&(t=[t]),String.fromCharCode.apply(null,t)}function O(t,e){if(isNaN(t)||t<0)throw new Error("Invalid start "+t);if(e&&e<0)throw new Error("Invalid limit "+e)}exports.BufferJsonParser=k;
},{}],14:[function(require,module,exports) {
"use strict";function e(n,a,p){var r=[];return!n.path.length||"all"!==p&&"keys"!==p||t(a,n.path[n.path.length-1],function(e,t){r.push({path:n.path,key:e,length:t})}),"object"===n.type?n.getObjectNodes().forEach(function(t){r.push.apply(r,e(t,a,p))}):"array"===n.type?n.getArrayNodes().forEach(function(t){r.push.apply(r,e(t,a,p))}):"all"!==p&&"values"!==p||t(a,String(n.getValue()),function(e,t){r.push({path:n.path,value:e,length:t})}),r}function t(e,t,n){for(var a=new RegExp(e,"g"),p=null;null!==(p=a.exec(t));)n(p.index,p[0].length)}Object.defineProperty(exports,"__esModule",{value:!0}),exports.searchJsonNodes=e,exports.forEachMatchFromString=t;
},{}],10:[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=require("./buffer-json-parser"),t=require("./json-node-search"),n=function(){function n(e,t){this.options={objectNodesLimit:50,arrayNodesLimit:50,labelAsPath:!1,linkLabelCopyPath:"Copy path",linkLabelExpandAll:"Expand all"},this.rootNode=e,t&&Object.assign(this.options,t)}return n.elementFromData=function(t,o){return new n(new e.BufferJsonParser(t).getRootNodeInfo(),o).getRootElement()},n.prototype.getRootElement=function(){if(this.rootNode){var e=this.getNodeElement(this.rootNode);return e.classList.add("json-node-root"),e}return null},n.prototype.getNodeElement=function(e){var t=document.createElement("div");t.classList.add("json-node"),t.jsonNode=e;var n=this.getNodeHeader(e);return t.appendChild(n),t.headerElement=n,this.attachInteractivity(t,e),t},n.prototype.attachInteractivity=function(e,t){var n=this;e.isNodeOpen=function(){return!!n.isOpenableNode(t)&&e.headerElement.classList.contains("json-node-open")},e.openNode=function(){n.isOpenableNode(t)&&n.openNode(e)},e.closeNode=function(){n.isOpenableNode(t)&&n.closeNode(e)},e.toggleNode=function(){e.isNodeOpen()?e.closeNode():e.openNode()},e.openPath=function(o){return n.isOpenableNode(t)?n.openPath(e,o,!0):null},e.openAll=function(o,i){return void 0===o&&(o=1/0),void 0===i&&(i="first"),n.isOpenableNode(t)?n.openAll(e,o,i):0},e.getOpenPaths=function(o){return void 0===o&&(o=!0),n.isOpenableNode(t)?n.getOpenPaths(e,o):[]},e.openBySearch=function(t,o,i){return void 0===o&&(o=1),void 0===i&&(i="all"),n.openBySearch(e,t,o,i)},e.highlight=function(t){n.highlightNode(e,t)}},n.prototype.attachClickToggleListener=function(e){var t=this;e.addEventListener("click",function(n){n.preventDefault();var o=t.findNodeElement(e);o&&t.isOpenableNode(o.jsonNode)&&(o.isNodeOpen()?t.closeNode(o,!0):t.openNode(o,!0))})},n.prototype.isOpenableNode=function(e){return("array"===e.type||"object"===e.type)&&e.length},n.prototype.closeNode=function(e,t){void 0===t&&(t=!1),e.isNodeOpen()&&e.childrenElement&&(e.headerElement.classList.remove("json-node-open"),e.removeChild(e.childrenElement),e.childrenElement=null,t&&this.dispatchNodeEvent("closeNode",e))},n.prototype.highlightNode=function(e,t){var n=this.getNodeHeader(e.jsonNode,t);e.headerElement.parentElement.replaceChild(n,e.headerElement)},n.prototype.getHighlightedText=function(e,n){var o=document.createDocumentFragment();if(!n)return o.appendChild(document.createTextNode(e)),o;var i=0;return t.forEachMatchFromString(n,e,function(t,n){i<t&&o.appendChild(document.createTextNode(e.substring(i,t)));var d=document.createElement("mark");d.appendChild(document.createTextNode(e.substr(t,n))),o.appendChild(d),i=t+n}),i!==e.length&&o.appendChild(document.createTextNode(e.substring(i,e.length))),o},n.prototype.openBySearch=function(e,n,o,i){if(!n)return this.closeNode(e,!0),null;for(var d=this,a=t.searchJsonNodes(e.jsonNode,n,i),r={matches:a,index:0,navigateTo:function(t){this.index=t;var o=d.openSearchMatch(e,this.matches[t]);o&&(o.highlight(n),o.scrollIntoView(!1))},next:function(){this.navigateTo(this.index+1>=this.matches.length?0:this.index+1)},previous:function(){this.navigateTo(this.index-1<0?this.matches.length:this.index-1)}},l=Math.min(a.length,o),s=0;s<l&&s<o;s++){var p=this.openSearchMatch(e,a[s]);p&&p.highlight(n)}return this.dispatchNodeEvent("openedNodes",e),r},n.prototype.openSearchMatch=function(e,t){if(void 0!==t.key&&t.path.length){if(t.path.length){var n=this.openPath(e,t.path.slice(0,-1));if(n)return this.openKey(n,t.path[t.path.length-1])}}else if(void 0!==t.value)return this.openPath(e,t.path);return null},n.prototype.getOpenPaths=function(e,t){var n=[];if(!e.isNodeOpen())return n;for(var o=e.childrenElement.children,i=this.getVisibleChildren(o),d=0;d<i.length;d++){var a=i[d];a.isNodeOpen()&&n.push.apply(n,this.getOpenPaths(a,t))}var r=this.getPaginationLimit(e.jsonNode);if(!n.length&&r)for(d=0;d<o.length;d++){var l=o[d];if(l.isNodeOpen()&&l.childrenElement&&l.childrenElement.children.length){var s=l.childrenElement.children[0];s.jsonNode&&n.push(s.jsonNode.path)}}return n.length||n.push(e.jsonNode.path),n},n.prototype.openNode=function(e,t){void 0===t&&(t=!1),e.isNodeOpen()||(e.headerElement.classList.add("json-node-open"),e.childrenElement=this.getPaginatedNodeChildren(e),e.appendChild(e.childrenElement),t&&this.dispatchNodeEvent("openNode",e))},n.prototype.dispatchNodeEvent=function(e,t){var n;document.createEvent?(n=document.createEvent("Event")).initEvent(e,!0,!1):n=new Event(e,{bubbles:!0,cancelable:!1}),t.dispatchEvent(n)},n.prototype.openKey=function(e,t){var n=e.jsonNode,o=null,i=-1;if("object"===n.type){if(-1===(i=n.getObjectKeys().indexOf(t)))return null;if(e.openNode(),n.length>this.options.objectNodesLimit){var d=Math.floor(i/this.options.objectNodesLimit);(a=e.childrenElement.children[d])&&(a.openNode(),i-=d*this.options.objectNodesLimit,o=a.childrenElement.children)}else o=e.childrenElement.children}if("array"===n.type){if(i=parseInt(t),isNaN(i)||i>=n.length||i<0)return null;if(e.openNode(),n.length>this.options.arrayNodesLimit){var a;d=Math.floor(i/this.options.arrayNodesLimit);(a=e.childrenElement.children[d])&&(a.openNode(),i-=d*this.options.arrayNodesLimit,o=a.childrenElement.children)}else o=e.childrenElement.children}if(o&&i>=0&&i<o.length){var r=o[i];return r.jsonNode?r:null}return null},n.prototype.openPath=function(e,t,n){if(void 0===n&&(n=!1),!t.length)return this.openNode(e,n),e;for(var o=e,i=0;i<t.length;i++){if(!o)return null;(o=this.openKey(o,t[i]))&&o.openNode()}return n&&this.dispatchNodeEvent("openedNodes",e),o},n.prototype.openAll=function(e,t,n,o){void 0===o&&(o=!1),e.openNode();var i=1;if(t<=1||!e.childrenElement)return i;var d=t===1/0?1/0:t-1;return i+=this.openAllChildren(e.childrenElement.children,d,n),o&&this.dispatchNodeEvent("openedNodes",e),i},n.prototype.openAllChildren=function(e,t,n){for(var o=0,i=0;i<e.length;i++){var d=e[i];if(d.jsonNode)o+=d.openAll(t,n);else if(d.openNode){if("none"===n)return o;if(d.openNode(),d.childrenElement&&(o+=this.openAllChildren(d.childrenElement.children,t,n)),"first"===n)return o}}return o},n.prototype.getPaginationLimit=function(e){return"array"===e.type&&e.length>this.options.arrayNodesLimit?this.options.arrayNodesLimit:"object"===e.type&&e.length>this.options.objectNodesLimit?this.options.objectNodesLimit:0},n.prototype.getVisibleChildren=function(e){for(var t=[],n=0;n<e.length;n++){var o=e[n];o.jsonNode?t.push(o):o.openNode&&o.isNodeOpen()&&o.childrenElement&&t.push.apply(t,this.getVisibleChildren(o.childrenElement.children))}return t},n.prototype.getPaginatedNodeChildren=function(e){var t=this,n=e.jsonNode,o=document.createElement("div");o.classList.add("json-node-children");var i=this.getPaginationLimit(n);if(i)for(var d=0;d<n.length;d+=i)o.appendChild(this.getPaginationStub(n,d,i));else this.getChildNodes(n,0,i).forEach(function(e){o.appendChild(t.getNodeElement(e))});return o},n.prototype.getChildNodes=function(e,t,n){return"object"===e.type?e.getObjectNodes(t,n):"array"===e.type?e.getArrayNodes(t,n):[]},n.prototype.getPaginationStub=function(e,t,n){var o=this,i=document.createElement("div");i.classList.add("json-node-stub");var d=document.createElement("a");d.href="javascript:",d.classList.add("json-node-stub-toggler"),i.headerElement=d,this.generateAccessor(d);var a=Math.min(e.length,t+n)-1,r=document.createElement("span");return r.classList.add("json-node-label"),r.appendChild(document.createTextNode("["+t+" ... "+a+"]")),d.appendChild(r),i.appendChild(d),d.addEventListener("click",function(d){d.preventDefault(),i.isNodeOpen()?o.closePaginationStub(i,!0):o.openPaginationStub(i,o.getChildNodes(e,t,n),!0)}),i.isNodeOpen=function(){return d.classList.contains("json-node-open")},i.openNode=function(){i.isNodeOpen()||o.openPaginationStub(i,o.getChildNodes(e,t,n))},i.closeNode=function(){i.isNodeOpen()&&o.closePaginationStub(i)},i.toggleNode=function(){i.isNodeOpen()?i.closeNode():i.openNode()},i},n.prototype.closePaginationStub=function(e,t){void 0===t&&(t=!1),e.childrenElement&&(e.headerElement.classList.remove("json-node-open"),e.removeChild(e.childrenElement),e.childrenElement=null,t&&this.dispatchNodeEvent("closeStub",e))},n.prototype.openPaginationStub=function(e,t,n){var o=this;void 0===n&&(n=!1),e.headerElement.classList.add("json-node-open");var i=document.createElement("div");i.classList.add("json-node-children"),e.childrenElement=i,t.forEach(function(e){i.appendChild(o.getNodeElement(e))}),e.appendChild(i),n&&this.dispatchNodeEvent("openStub",e)},n.prototype.getNodeHeader=function(e,t){void 0===t&&(t=null);var n=document.createElement("div");if(n.classList.add("json-node-header"),n.classList.add("json-node-"+e.type),"object"===e.type||"array"===e.type){var o=document.createElement("a");o.classList.add("json-node-toggler"),o.href="javascript:",e.length&&(this.attachClickToggleListener(o),this.generateAccessor(o)),this.generateLabel(o,e,t),this.generateTypeInfo(o,e),n.appendChild(o)}else this.generateLabel(n,e,t),this.generateValue(n,e,t),this.generateTypeInfo(n,e);return this.generateLinks(n,e),n},n.prototype.generateAccessor=function(e){var t=document.createElement("span");t.classList.add("json-node-accessor"),e.appendChild(t)},n.prototype.generateTypeInfo=function(e,t){var n=document.createElement("span");n.classList.add("json-node-type"),"object"===t.type?n.appendChild(document.createTextNode("Object("+t.length+")")):"array"===t.type?n.appendChild(document.createTextNode("Array["+t.length+"]")):n.appendChild(document.createTextNode(t.type)),e.appendChild(n)},n.prototype.generateLabel=function(e,t,n){if(t.path.length){var o=document.createElement("span");o.classList.add("json-node-label"),this.options.labelAsPath?o.appendChild(this.getHighlightedText(t.path.join("."),n)):o.appendChild(this.getHighlightedText(t.path[t.path.length-1],n)),e.appendChild(o),e.appendChild(document.createTextNode(": "))}},n.prototype.generateValue=function(e,t,n){var o=document.createElement("span");o.classList.add("json-node-value"),o.appendChild(this.getHighlightedText(JSON.stringify(t.getValue()),n)),e.appendChild(o)},n.prototype.generateLinks=function(e,t){var n,o=this;this.isOpenableNode(t)&&this.options.linkLabelExpandAll&&((n=e.appendChild(document.createElement("a"))).classList.add("json-node-link"),n.href="javascript:",n.appendChild(document.createTextNode(this.options.linkLabelExpandAll)),n.addEventListener("click",function(t){t.preventDefault();var n=o.findNodeElement(e);n&&o.isOpenableNode(n.jsonNode)&&o.openAll(n,1/0,"first",!0)}));t.path.length&&this.options.linkLabelCopyPath&&((n=e.appendChild(document.createElement("a"))).classList.add("json-node-link"),n.href="javascript:",n.appendChild(document.createTextNode(this.options.linkLabelCopyPath)),n.addEventListener("click",function(n){n.preventDefault();var i=document.createElement("input");i.type="text",i.value=t.path.join(".");var d=o.findNodeElement(e);o.dispatchNodeEvent("copyPath",d),e.appendChild(i),i.select();try{document.execCommand("copy")||console.warn("Unable to copy path to clipboard")}catch(n){console.error("Unable to copy path to clipboard",n)}e.removeChild(i)}))},n.prototype.findNodeElement=function(e){for(;e&&!e.jsonNode;)e=e.parentElement;return e},n}();exports.BigJsonViewer=n;
},{"./buffer-json-parser":13,"./json-node-search":14}],11:[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0});
},{}],9:[function(require,module,exports) {
"use strict";function e(e){for(var r in e)exports.hasOwnProperty(r)||(exports[r]=e[r])}Object.defineProperty(exports,"__esModule",{value:!0}),e(require("./big-json-viewer")),e(require("./json-node-info")),e(require("./buffer-json-parser"));
},{"./big-json-viewer":10,"./json-node-info":11,"./buffer-json-parser":13}],6:[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=require("../src"),t={simpleData:{element1:"str",element2:1234,element3:[23,43,!0,!1,null,{name:"special"},{}],element4:[],element5:"this should be some long text\nwith line break",element6:{name:"Hero",age:32,birthday:{year:1986,month:4,day:30}}},largeData:function(){for(var e=new Array(Math.floor(1e3*Math.random())),t=0;t<e.length;t++)if(e[t]=Math.random(),e[t]<.2&&(e[t]="hey "+e[t]),e[t]>.8){e[t]={};for(var n=Math.floor(1e3*Math.random()),a=0;a<n;a++)e[t]["entry-"+a]=Math.random()}return e}()},n=document.getElementById("code"),a=document.getElementById("viewer"),o=document.getElementById("paths"),r=document.getElementById("copied"),d=document.getElementById("search"),l=document.getElementById("searchInfo"),i=document.getElementById("rootNode");function c(e){var t=JSON.stringify(e,null,2);n.value=t,u(t),m()}function u(t){a.children.length&&a.removeChild(a.children[0]);try{(i=e.BigJsonViewer.elementFromData(t)).id="rootNode",a.appendChild(i),i.openAll(1),s()}catch(e){console.error("BigJsonViewer error",e);var n=document.createElement("div");n.classList.add("alert","alert-danger"),n.appendChild(document.createTextNode(e.toString())),a.appendChild(n)}}function s(){var e=function(e){console.log("event",e.type),m()};i.addEventListener("openNode",e),i.addEventListener("closeNode",e),i.addEventListener("openedNodes",e),i.addEventListener("openStub",e),i.addEventListener("closeStub",e),i.addEventListener("copyPath",function(e){var t=e.target;r.value=t.jsonNode.path.join(".")})}function m(){i&&i.getOpenPaths&&(o.value=i.getOpenPaths().map(function(e){return e.join(".")}).join("\n"))}Array.from(document.querySelectorAll("[data-load]")).forEach(function(e){var n=e.getAttribute("data-load");t[n]&&!e.loadListener&&(e.loadListener=!0,e.addEventListener("click",function(e){e.preventDefault(),c(t[n])}))}),n.addEventListener("input",function(e){console.log("show data based on input"),u(n.value)}),d.addEventListener("input",function(e){if(i.closeNode(),d.value.length>=2){var t=i.openBySearch(new RegExp(d.value,"i"));l.textContent=t.matches.length+" matches";var n=l.appendChild(document.createElement("a"));n.href="javascript:",n.addEventListener("click",function(e){e.preventDefault(),t.previous()}),n.textContent="Prev";var a=l.appendChild(document.createElement("a"));a.href="javascript:",a.addEventListener("click",function(e){e.preventDefault(),t.next()}),a.textContent="Next"}else i.openBySearch(null),l.textContent=""}),c(t.simpleData);
},{"../src":9}]},{},[6])