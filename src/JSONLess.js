/**
 * @author Michał Żaloudik <michal.zaloudik@redcart.pl>
 */
"use strict";
var utls = require('utls');
var __handlers = {};
/**
 * @author Michał Żaloudik <michal.zaloudik@redcart.pl>
 */
class JSONLess {
	/**
	 * Parse JSON string
	 * @static
	 * @param text
	 * @param reviver
	 */
	static parse(text, reviver) {
		var value = JSON.parse(text, reviver);
		if ([
				'Array',
				'Object'
			].indexOf(utls.getType(value)) !== -1) {
			value = utls.traverse(value, v => [
				'Array',
				'Object'
			].indexOf(utls.getType(v)) !== -1, _revive);
		}
		return value;
	}

	/**
	 * Converts JavaScript value to JSON string
	 * @static
	 * @param value
	 * @param replacer
	 * @param space
	 */
	static stringify(value, replacer, space) {
		if(utls.isCircular(value)) {
			throw new Error();
		}
		if (utls.getType(value) === 'Array' || typeof value === 'object') {
			value = utls.traverse(value, v => [
				'Array',
				'Object'
			].indexOf(utls.getType(v)) === -1, _replace);
		}
		return JSON.stringify(value, replacer, space)
	}

	/**
	 * Adds type handler
	 * @static
	 * @param {*} cls
	 * @param {Function} replacer
	 * @param {Function} reviver
	 */
	static addHandler(cls, replacer, reviver) {
		__handlers[utls.getType(cls)] = {
			cls : cls,
			replacer : replacer,
			reviver : reviver
		};
	}
}
/**
 *
 * @param {*} value
 * @param {String|Number|undefined} key
 * @param {Array|Object|undefined} origin
 * @returns {*}
 * @private
 */
function _replace(value, key, origin) {
	var type = utls.getType(value);
	if (typeof __handlers[type] === 'object') {
		value = {
			$type : type,
			$value : __handlers[type].replacer(__handlers[type].cls, value)
		};
	}
	return value;
}
/**
 *
 * @param {*} value
 * @param {String|Number|undefined} key
 * @param {Array|Object|undefined} origin
 * @returns {*}
 * @private
 */
function _revive(value, key, origin) {
	if (utls.getType(value) === 'Array') {
		value.forEach((item, key) => {
			if ([
					'Array',
					'Object'
				].indexOf(utls.getType(item)) !== -1) {
				value[key] = utls.traverse(item, v => [
					'Array',
					'Object'
				].indexOf(utls.getType(v)) !== -1, _revive);
			} else {
				value[key] = item;
			}
		});
	} else {
		if (value['$type'] !== undefined && value['$value'] !== undefined) {
			if (typeof __handlers[value['$type']] === 'object') {
				value = __handlers[value['$type']].reviver(__handlers[value['$type']].cls, value['$value']);
			}
		} else {
			Object.getOwnPropertyNames(value).forEach((key) => {
				if ([
						'Array',
						'Object'
					].indexOf(utls.getType(value[key])) !== -1) {
					value[key] = utls.traverse(value[key], v => [
						'Array',
						'Object'
					].indexOf(utls.getType(v)) !== -1, _revive);
				}
			});
		}
	}
	return value;
}
// Date
JSONLess.addHandler(Date, (cls, value) => {
	return value.toJSON();
}, (cls, value) => {
	return new cls(value);
});
module.exports = JSONLess;
