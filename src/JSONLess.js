/**
 * @author Michał Żaloudik <michal.zaloudik@redcart.pl>
 */
"use strict";
const utls = require('utls');
const __handlers = {};
/**
 * @author Michał Żaloudik <michal.zaloudik@redcart.pl>
 */
module.exports = {
	parse : parse,
	stringify : stringify,
	addHandler : addHandler
};
/**
 * Converts JavaScript value to JSON string
 * @static
 * @param value
 */
function stringify(value) {
	return JSON.stringify(value, replacer)
}
/**
 * Parse JSON string
 * @static
 * @param string
 */
function parse(string) {
	return JSON.parse(string, reviver);
}
/**
 * @private
 * @param key
 * @param value
 * @returns {*}
 */
function replacer(key, value) {
	const type = utls.getType(this[key]);
	const handler = __handlers[type];
	if (handler !== undefined) {
		return {
			$type : type,
			$value : handler.replacer(handler.cls, this[key])
		};
	}
	return value;
}
/**
 * @private
 * @param key
 * @param value
 * @returns {*}
 */
function reviver(key, value) {
	if (typeof value === 'object' && value !== null) {
		const handler = __handlers[value.$type];
		if (value.$type && value.$value && handler) {
			return handler.reviver(handler.cls, value.$value);
		}
	}
	return value;
}
/**
 * Adds type handler
 * @param {*} cls
 * @param {Function} replacer
 * @param {Function} reviver
 */
function addHandler(cls, replacer, reviver) {
	__handlers[utls.getType(cls)] = {
		cls : cls,
		replacer : replacer,
		reviver : reviver
	};
}
// Date
addHandler(Date, (cls, value) => {
	return value.toJSON();
}, (cls, value) => {
	return new cls(value);
});
