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
			return JSON.stringify(value);
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
					_v += JSON.stringify(k) + ":" + v;
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
