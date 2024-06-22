/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./pkg/index.js":
/*!**********************!*\
  !*** ./pkg/index.js ***!
  \**********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("var __dirname = \"/\";\nlet imports = {};\nimports['__wbindgen_placeholder__'] = module.exports;\nlet wasm;\nconst { TextDecoder, TextEncoder } = __webpack_require__(Object(function webpackMissingModule() { var e = new Error(\"Cannot find module 'util'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));\n\nlet cachedUint8Memory0 = null;\n\nfunction getUint8Memory0() {\n    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {\n        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);\n    }\n    return cachedUint8Memory0;\n}\n\nfunction getArrayU8FromWasm0(ptr, len) {\n    ptr = ptr >>> 0;\n    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);\n}\n\nconst heap = new Array(128).fill(undefined);\n\nheap.push(undefined, null, true, false);\n\nfunction getObject(idx) { return heap[idx]; }\n\nlet heap_next = heap.length;\n\nfunction dropObject(idx) {\n    if (idx < 132) return;\n    heap[idx] = heap_next;\n    heap_next = idx;\n}\n\nfunction takeObject(idx) {\n    const ret = getObject(idx);\n    dropObject(idx);\n    return ret;\n}\n\nlet cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });\n\ncachedTextDecoder.decode();\n\nfunction getStringFromWasm0(ptr, len) {\n    ptr = ptr >>> 0;\n    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));\n}\n\nfunction addHeapObject(obj) {\n    if (heap_next === heap.length) heap.push(heap.length + 1);\n    const idx = heap_next;\n    heap_next = heap[idx];\n\n    heap[idx] = obj;\n    return idx;\n}\n/**\n*/\nmodule.exports.initialize = function() {\n    wasm.initialize();\n};\n\nlet cachedUint32Memory0 = null;\n\nfunction getUint32Memory0() {\n    if (cachedUint32Memory0 === null || cachedUint32Memory0.byteLength === 0) {\n        cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);\n    }\n    return cachedUint32Memory0;\n}\n\nlet WASM_VECTOR_LEN = 0;\n\nfunction passArray32ToWasm0(arg, malloc) {\n    const ptr = malloc(arg.length * 4, 4) >>> 0;\n    getUint32Memory0().set(arg, ptr / 4);\n    WASM_VECTOR_LEN = arg.length;\n    return ptr;\n}\n\nlet cachedInt32Memory0 = null;\n\nfunction getInt32Memory0() {\n    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {\n        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);\n    }\n    return cachedInt32Memory0;\n}\n\nfunction getArrayI32FromWasm0(ptr, len) {\n    ptr = ptr >>> 0;\n    return getInt32Memory0().subarray(ptr / 4, ptr / 4 + len);\n}\n/**\n* @param {Int32Array} arr\n* @returns {Int32Array}\n*/\nmodule.exports.compact = function(arr) {\n    try {\n        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);\n        const ptr0 = passArray32ToWasm0(arr, wasm.__wbindgen_malloc);\n        const len0 = WASM_VECTOR_LEN;\n        wasm.compact(retptr, ptr0, len0);\n        var r0 = getInt32Memory0()[retptr / 4 + 0];\n        var r1 = getInt32Memory0()[retptr / 4 + 1];\n        var v2 = getArrayI32FromWasm0(r0, r1).slice();\n        wasm.__wbindgen_free(r0, r1 * 4, 4);\n        return v2;\n    } finally {\n        wasm.__wbindgen_add_to_stack_pointer(16);\n    }\n};\n\n/**\n* @param {Int32Array} arr\n*/\nmodule.exports.sort = function(arr) {\n    var ptr0 = passArray32ToWasm0(arr, wasm.__wbindgen_malloc);\n    var len0 = WASM_VECTOR_LEN;\n    wasm.sort(ptr0, len0, addHeapObject(arr));\n};\n\nlet cachedTextEncoder = new TextEncoder('utf-8');\n\nconst encodeString = (typeof cachedTextEncoder.encodeInto === 'function'\n    ? function (arg, view) {\n    return cachedTextEncoder.encodeInto(arg, view);\n}\n    : function (arg, view) {\n    const buf = cachedTextEncoder.encode(arg);\n    view.set(buf);\n    return {\n        read: arg.length,\n        written: buf.length\n    };\n});\n\nfunction passStringToWasm0(arg, malloc, realloc) {\n\n    if (realloc === undefined) {\n        const buf = cachedTextEncoder.encode(arg);\n        const ptr = malloc(buf.length, 1) >>> 0;\n        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);\n        WASM_VECTOR_LEN = buf.length;\n        return ptr;\n    }\n\n    let len = arg.length;\n    let ptr = malloc(len, 1) >>> 0;\n\n    const mem = getUint8Memory0();\n\n    let offset = 0;\n\n    for (; offset < len; offset++) {\n        const code = arg.charCodeAt(offset);\n        if (code > 0x7F) break;\n        mem[ptr + offset] = code;\n    }\n\n    if (offset !== len) {\n        if (offset !== 0) {\n            arg = arg.slice(offset);\n        }\n        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;\n        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);\n        const ret = encodeString(arg, view);\n\n        offset += ret.written;\n        ptr = realloc(ptr, len, offset, 1) >>> 0;\n    }\n\n    WASM_VECTOR_LEN = offset;\n    return ptr;\n}\n\nmodule.exports.__wbindgen_copy_to_typed_array = function(arg0, arg1, arg2) {\n    new Uint8Array(getObject(arg2).buffer, getObject(arg2).byteOffset, getObject(arg2).byteLength).set(getArrayU8FromWasm0(arg0, arg1));\n};\n\nmodule.exports.__wbindgen_object_drop_ref = function(arg0) {\n    takeObject(arg0);\n};\n\nmodule.exports.__wbindgen_string_new = function(arg0, arg1) {\n    const ret = getStringFromWasm0(arg0, arg1);\n    return addHeapObject(ret);\n};\n\nmodule.exports.__wbg_debug_7d879afce6cf56cb = function(arg0, arg1, arg2, arg3) {\n    console.debug(getObject(arg0), getObject(arg1), getObject(arg2), getObject(arg3));\n};\n\nmodule.exports.__wbg_error_8e3928cfb8a43e2b = function(arg0) {\n    console.error(getObject(arg0));\n};\n\nmodule.exports.__wbg_error_696630710900ec44 = function(arg0, arg1, arg2, arg3) {\n    console.error(getObject(arg0), getObject(arg1), getObject(arg2), getObject(arg3));\n};\n\nmodule.exports.__wbg_info_80803d9a3f0aad16 = function(arg0, arg1, arg2, arg3) {\n    console.info(getObject(arg0), getObject(arg1), getObject(arg2), getObject(arg3));\n};\n\nmodule.exports.__wbg_log_151eb4333ef0fe39 = function(arg0, arg1, arg2, arg3) {\n    console.log(getObject(arg0), getObject(arg1), getObject(arg2), getObject(arg3));\n};\n\nmodule.exports.__wbg_warn_5d3f783b0bae8943 = function(arg0, arg1, arg2, arg3) {\n    console.warn(getObject(arg0), getObject(arg1), getObject(arg2), getObject(arg3));\n};\n\nmodule.exports.__wbg_new_abda76e883ba8a5f = function() {\n    const ret = new Error();\n    return addHeapObject(ret);\n};\n\nmodule.exports.__wbg_stack_658279fe44541cf6 = function(arg0, arg1) {\n    const ret = getObject(arg1).stack;\n    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);\n    const len1 = WASM_VECTOR_LEN;\n    getInt32Memory0()[arg0 / 4 + 1] = len1;\n    getInt32Memory0()[arg0 / 4 + 0] = ptr1;\n};\n\nmodule.exports.__wbg_error_f851667af71bcfc6 = function(arg0, arg1) {\n    let deferred0_0;\n    let deferred0_1;\n    try {\n        deferred0_0 = arg0;\n        deferred0_1 = arg1;\n        console.error(getStringFromWasm0(arg0, arg1));\n    } finally {\n        wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);\n    }\n};\n\nmodule.exports.__wbindgen_throw = function(arg0, arg1) {\n    throw new Error(getStringFromWasm0(arg0, arg1));\n};\n\nconst path = Object(function webpackMissingModule() { var e = new Error(\"Cannot find module 'path'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }())(__dirname, 'index_bg.wasm');\nconst bytes = Object(function webpackMissingModule() { var e = new Error(\"Cannot find module 'fs'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }())(path);\n\nconst wasmModule = new WebAssembly.Module(bytes);\nconst wasmInstance = new WebAssembly.Instance(wasmModule, imports);\nwasm = wasmInstance.exports;\nmodule.exports.__wasm = wasm;\n\n\n\n//# sourceURL=webpack://fasterdash/./pkg/index.js?");

/***/ }),

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("var _pkg_index_js__WEBPACK_IMPORTED_MODULE_0___namespace_cache;\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _pkg_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pkg/index.js */ \"./pkg/index.js\");\n\nconst {\n  initialize,\n  compact,\n  sort,\n} = /*#__PURE__*/ (_pkg_index_js__WEBPACK_IMPORTED_MODULE_0___namespace_cache || (_pkg_index_js__WEBPACK_IMPORTED_MODULE_0___namespace_cache = __webpack_require__.t(_pkg_index_js__WEBPACK_IMPORTED_MODULE_0__, 2)));\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (/*#__PURE__*/ (_pkg_index_js__WEBPACK_IMPORTED_MODULE_0___namespace_cache || (_pkg_index_js__WEBPACK_IMPORTED_MODULE_0___namespace_cache = __webpack_require__.t(_pkg_index_js__WEBPACK_IMPORTED_MODULE_0__, 2))));\n\n\n//# sourceURL=webpack://fasterdash/./index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 			}
/******/ 			def['default'] = () => (value);
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./index.js");
/******/ 	
/******/ })()
;