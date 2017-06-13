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
 *
 * @param key
 * @param value
 * @returns {*}
 */
function replacer(key, value) {
	const type = utls.getType(this[key]);
	if (typeof __handlers[type] === 'object') {
		return {
			$type : type,
			$value : __handlers[type].replacer(__handlers[type].cls, this[key])
		};
	}
	return value;
}
/**
 *
 * @param key
 * @param value
 * @returns {*}
 */
function reviver(key, value) {
	if (typeof value === 'object' && value !== null) {
		if (value.$type && value.$value && __handlers[value.$type]) {
			return __handlers[value.$type].reviver(__handlers[value.$type].cls, value.$value);
		}
	}
	return value;
}
/**
 * Adds type handler
 * @static
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
