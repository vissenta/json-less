/**
 * @author Michał Żaloudik <ponury.kostek@gmail.com>
 */
"use strict";
const __handlers = require("./json-less").__handlers;
const parse_escapee = {
	"\"": "\"",
	"\\": "\\",
	"/": "/",
	b: "\b",
	f: "\f",
	n: "\n",
	r: "\r",
	t: "\t"
};
let parse_at;     // The index of the current character
let parse_ch;     // The current character
let parse_text;

function parse_next(c) {
	// If a c parameter is provided, verify that it matches the current character.
	if (c && c !== parse_ch) {
		parse_error("Expected '" + c + "' instead of '" + parse_ch + "'");
	}
	// Get the next character. When there are no more characters,
	// return the empty string.
	parse_ch = parse_text.charAt(parse_at);
	parse_at += 1;
	return parse_ch;
}

/**
 *
 * @param m
 */
function parse_error(m) {
	throw {
		name: "SyntaxError",
		message: m,
		at: parse_at,
		text: parse_text
	};
}

/**
 *
 * @returns {number|*}
 */
function parse_number() {
	let value;
	let string = "";
	if (parse_ch === "-") {
		string = "-";
		parse_next("-");
	}
	while (parse_ch >= "0" && parse_ch <= "9") {
		string += parse_ch;
		parse_next();
	}
	if (parse_ch === ".") {
		string += ".";
		while (parse_next() && parse_ch >= "0" && parse_ch <= "9") {
			string += parse_ch;
		}
	}
	if (parse_ch === "e" || parse_ch === "E") {
		string += parse_ch;
		parse_next();
		if (parse_ch === "-" || parse_ch === "+") {
			string += parse_ch;
			parse_next();
		}
		while (parse_ch >= "0" && parse_ch <= "9") {
			string += parse_ch;
			parse_next();
		}
	}
	value = +string;
	if (!isFinite(value)) {
		parse_error("Bad number");
	} else {
		return value;
	}
}

/**
 *
 * @returns {string}
 */
function parse_string() {
	let hex;
	let i;
	let value = "";
	let uffff;
	if (parse_ch === "\"") {
		while (parse_next()) {
			if (parse_ch === "\"") {
				parse_next();
				return value;
			}
			if (parse_ch === "\\") {
				parse_next();
				if (parse_ch === "u") {
					uffff = 0;
					for (i = 0; i < 4; i += 1) {
						hex = parseInt(parse_next(), 16);
						if (!isFinite(hex)) {
							break;
						}
						uffff = uffff * 16 + hex;
					}
					value += String.fromCharCode(uffff);
				} else if (typeof parse_escapee[parse_ch] === "string") {
					value += parse_escapee[parse_ch];
				} else {
					break;
				}
			} else {
				value += parse_ch;
			}
		}
	}
	parse_error("Bad string");
}

/**
 *
 */
function parse_white() {
	while (parse_ch && parse_ch <= " ") {
		parse_next();
	}
}

/**
 *
 * @returns {boolean|null}
 */
function parse_word() {
	switch (parse_ch) {
		case "t":
			parse_next("t");
			parse_next("r");
			parse_next("u");
			parse_next("e");
			return true;
		case "f":
			parse_next("f");
			parse_next("a");
			parse_next("l");
			parse_next("s");
			parse_next("e");
			return false;
		case "n":
			parse_next("n");
			parse_next("u");
			parse_next("l");
			parse_next("l");
			return null;
	}
	parse_error("Unexpected '" + parse_ch + "'");
}

/**
 *
 * @returns {Array}
 */
function parse_array() {
	const arr = [];
	if (parse_ch === "[") {
		parse_next("[");
		parse_white();
		if (parse_ch === "]") {
			parse_next("]");
			return arr;   // empty array
		}
		while (parse_ch) {
			arr[arr.length] = parse_value();
			parse_white();
			if (parse_ch === "]") {
				parse_next("]");
				return arr;
			}
			parse_next(",");
			parse_white();
		}
	}
	parse_error("Bad array");
}

/**
 *
 * @returns {Object}
 */
function parse_object() {
	if (parse_ch === "{") {
		const obj = {};
		parse_next("{");
		parse_white();
		if (parse_ch === "}") {
			parse_next("}");
			return obj;   // empty object
		}
		while (parse_ch) {
			const key = parse_string();
			parse_white();
			parse_next(":");
			if (Object.hasOwnProperty.call(obj, key)) {
				parse_error("Duplicate key '" + key + "'");
			}
			obj[key] = parse_value();
			parse_white();
			if (parse_ch === "}") {
				parse_next("}");
				if (obj.$type) {
					if (obj.$type === "Infinity") {
						return obj.$value === "-" ? -Infinity : Infinity;
					}
					const handler = __handlers[obj.$type];
					if (handler !== undefined) {
						return handler.reviver(handler.cls, obj.$value);
					}
				}
				return obj;
			}
			parse_next(",");
			parse_white();
		}
	}
	parse_error("Bad object");
}

/**
 *
 * @returns {*}
 */
function parse_value() {
	parse_white();
	switch (parse_ch) {
		case "{":
			return parse_object();
		case "[":
			return parse_array();
		case "\"":
			return parse_string();
		case "-":
			return parse_number();
		default:
			return (parse_ch >= "0" && parse_ch <= "9") ? parse_number() : parse_word();
	}
}

/**
 *
 * @param {string} source
 * @returns {*}
 */
function parse(source) {
	let result;
	parse_text = source;
	parse_at = 0;
	parse_ch = " ";
	result = parse_value();
	parse_white();
	if (parse_ch) {
		parse_error("Syntax error");
	}
	return result;
}

module.exports = parse;
