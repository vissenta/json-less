/**
 * @author Michał Żaloudik <michal.zaloudik@redcart.pl>
 */
"use strict";
var utls = require('utls');
/**
 * @author Michał Żaloudik <michal.zaloudik@redcart.pl>
 */
class JSONLess {
	/**
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
			value = JSONLess.revive(value);
		}
		return value;
	}

	/**
	 * @static
	 * @param value
	 * @param replacer
	 * @param space
	 */
	static stringify(value, replacer, space) {
		if (utls.getType(value) === 'Array') {
			value = JSONLess.replace(value);
		} else if (typeof value === 'object') {
			value = JSONLess.replace(value);
		}
		return JSON.stringify(value, replacer, space)
	}

	/**
	 * @static
	 * @param value
	 * @returns {*}
	 */
	static replace(value) {
		return utls.traverse(value, v => [
			'Array',
			'Object'
		].indexOf(utls.getType(v)) === -1, _replace);
	}

	/**
	 * @static
	 * @param value
	 * @returns {*}
	 */
	static revive(value) {
		return utls.traverse(value, v => [
			'Array',
			'Object'
		].indexOf(utls.getType(v)) !== -1, _revive);
	}
}
/**
 *
 * @param {*} value
 * @param {String|Number|undefined} key
 * @param {Array|Object} origin
 * @returns {*}
 * @private
 */
function _replace(value, key, origin) {
	var type = utls.getType(value);
	switch (type) {
		case 'Date':
		case 'ObjectID':
		case 'ObjectId':
			value = {
				'$type' : type,
				'$value' : value.toString()
			};
			break;
		default:
			break;
	}
	return value;
}
/**
 *
 * @param {*} value
 * @param {String|Number|undefined} key
 * @param {Array|Object} origin
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
			switch (value['$type']) {
				case 'ObjectID':
				case 'ObjectId':
					var ObjectID = require('mongodb').ObjectID;
					value = new ObjectID(value['$value']);
					break;
				case 'Date':
					value = new Date(value['$value']);
					break;
				default:
					break;
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
module.exports = JSONLess;
