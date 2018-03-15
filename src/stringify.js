/**
 * @author Michał Żaloudik <ponury.kostek@gmail.com>
 */
"use strict";
const __handlers = require("./json-less").__handlers;
let stringify_stack = [];

/**
 * Converts JavaScript value to JSON string
 * @static
 * @param value
 */
function stringify(value) {
	stringify_stack = [];
	return stringify_str("", {"": value});
}

const stringify_rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
const stringify_meta = {
	"\b": "\\b",
	"\t": "\\t",
	"\n": "\\n",
	"\f": "\\f",
	"\r": "\\r",
	"\"": "\\\"",
	"\\": "\\\\"
};

/**
 *
 * @param string
 * @returns {string}
 */
function stringify_quote(string) {
	stringify_rx_escapable.lastIndex = 0;
	return stringify_rx_escapable.test(string) ? "\"" + string.replace(stringify_rx_escapable, function (a) {
		const c = stringify_meta[a];
		return typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
	}) + "\"" : "\"" + string + "\"";
}

/**
 *
 * @param key
 * @param holder
 * @returns {*}
 */
function stringify_str(key, holder) {
	let i;          // The loop counter.
	let k;          // The member key.
	let v;          // The member value.
	let length;
	let value = holder[key];
	if (value && typeof value === "object") {
		const type = value.constructor.name;
		const handler = __handlers[type];
		if (handler !== undefined) {
			value = {
				$type: type,
				$value: handler.replacer(handler.cls, value)
			};
		} else if (typeof value.toJSON === "function") {
			value = value.toJSON(key);
		}
	}
	switch (typeof value) {
		case "string":
			return stringify_quote(value);
		case "number":
			return isFinite(value) ? String(value) : "null";
		case "boolean":
		case "null":
			return String(value);
		case "object":
			if (!value) {
				return "null";
			}
			if (~stringify_stack.indexOf(value)) {
				throw new TypeError("Converting circular structure to JSONLess");
			}
			stringify_stack.push(value);
			if (value instanceof Array) {
				length = value.length;
				v = "";
				for (i = 0; i < length;) {
					v += stringify_str(i, value) || "null";
					i += 1;
					if (i < length) {
						v += ",";
					}
				}
				stringify_stack.pop();
				return "[" + v + "]";
			}
			let _v = "";
			const keys = Object.keys(value);
			length = keys.length;
			for (i = 0; i < length;) {
				k = keys[i];
				i += 1;
				v = stringify_str(k, value);
				if (v) {
					_v += stringify_quote(k) + ":" + v;
					if (i < length) {
						_v += ",";
					}
				}
			}
			stringify_stack.pop();
			return "{" + _v + "}";
	}
}

module.exports = stringify;
