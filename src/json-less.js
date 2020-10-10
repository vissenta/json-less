/**
 * @author Michał Żaloudik <michal.zaloudik@redcart.pl>
 * Based on https://github.com/douglascrockford/JSON-js
 */
"use strict";
const handlers = require('./handlers')

module.exports.__handlers = handlers.__handlers;
const parse = require("./parse");
const stringify = require("./stringify");
module.exports.parse = parse;
module.exports.stringify = stringify;
module.exports.addHandler = handlers.addHandler;

// Date
handlers.addHandler(Date, (cls, value) => value.toJSON(), (cls, value) => new cls(value));
handlers.addHandler(RegExp, (cls, value) => {
	const parts = value.toString().split("/");
	const flags = parts.pop();
	parts.shift();
	const pattern = parts.join("/");
	return {
		pattern,
		flags
	};
}, (cls, value) => new cls(value.pattern, value.flags));
