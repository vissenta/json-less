/**
 * @author Michał Żaloudik <michal.zaloudik@redcart.pl>
 * Based on https://github.com/douglascrockford/JSON-js
 */
"use strict";
const __handlers = {};
module.exports.__handlers = __handlers;
const parse = require("./parse");
const stringify = require("./stringify");
module.exports.parse = parse;
module.exports.stringify = stringify;
module.exports.addHandler = addHandler;

/**
 * Adds type handler
 * @param {*} cls
 * @param {Function} replacer
 * @param {Function} reviver
 */
function addHandler(cls, replacer, reviver) {
	if (typeof cls !== "function") {
		throw new TypeError("'cls' must be class/function");
	}
	if (typeof replacer !== "function") {
		throw new TypeError("'replacer' must be function");
	}
	if (typeof reviver !== "function") {
		throw new TypeError("'reviver' must be function");
	}
	__handlers[cls.name] = {
		cls: cls,
		replacer: replacer,
		reviver: reviver
	};
}

// Date
addHandler(Date, (cls, value) => value.toJSON(), (cls, value) => new cls(value));
addHandler(RegExp, (cls, value) => {
	const parts = value.toString().split("/");
	const flags = parts.pop();
	parts.shift();
	const pattern = parts.join("/");
	return {
		pattern,
		flags
	};
}, (cls, value) => new cls(value.pattern, value.flags));
