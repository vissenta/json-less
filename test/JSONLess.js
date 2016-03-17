/**
 * @author Michał Żaloudik <michal.zaloudik@redcart.pl>
 */
"use strict";
var inspect = require('util').inspect, assert = require('assert'), mongodb = require('mongodb');
var JSONLess = require(__dirname + '/../index.js');
var date = new Date();
var objId = new mongodb.ObjectID();
describe('Various data', () => {
	before(() => {
		JSONLess.addHandler(mongodb.ObjectID, (cls, value) => {
			return value.toString();
		}, (cls, value) => {
			return new cls(value);
		});
	});
	var tests = [
		null,
		true,
		false,
		[],
		{},
		-1,
		0,
		1,
		-1.23,
		1.23,
		"simple string",
		[
			1,
			2,
			3
		],
		{
			a : 'a',
			b : 'b'
		},
		date,
		[
			1,
			date,
			'c'
		],
		{
			a : 'a',
			b : 2,
			c : date,
			d : 'date'
		},
		objId,
		[
			1,
			objId,
			'c'
		],
		{
			a : 'a',
			b : 2,
			c : objId,
			d : 'date'
		}
	];
	tests.forEach((test, key) => {
		it('#' + key, () => {
			var replaced = JSONLess.stringify(test);
			var revived = JSONLess.parse(replaced);
			assert.deepEqual(revived, test);
		});
	});
});
describe('Circular protection', () => {
	it('Circular object', () => {
		assert.throws(() => {
			var circular = {};
			circular.circularRef = circular;
			JSONLess.stringify(circular);
		}, TypeError, 'Converting circular structure to JSONLess');
	});
	it('Circular array', () => {
		assert.throws(() => {
			var circular = [];
			circular.push(circular);
			JSONLess.stringify(circular);
		}, TypeError, 'Converting circular structure to JSONLess');
	});
});
