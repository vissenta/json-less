/**
 * @author Michał Żaloudik <michal.zaloudik@redcart.pl>
 */
"use strict";
const Benchmark = require('benchmark');
const suite = new Benchmark.Suite;
const JSONLess = require(__dirname + '/../index.js');
const date = new Date();
const objId = require('mongodb').ObjectID();
const values = [
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
		a: 'a',
		b: 'b'
	},
	date,
	[
		1,
		date,
		'c'
	],
	{
		a: 'a',
		b: 2,
		c: date,
		d: 'date'
	},
	objId,
	[
		1,
		objId,
		'c'
	],
	{
		a: 'a',
		b: 2,
		c: objId,
		d: 'date'
	}
];
const strings = [
	'null',
	'true',
	'false',
	'[]',
	'{}',
	'-1',
	'0',
	'1',
	'-1.23',
	'1.23',
	'"simple string"',
	'[1,2,3]',
	'{"a":"a","b":"b"}',
	'{"$type":"Date","$value":"2017-06-13T14:49:41.074Z"}',
	'[1,{"$type":"Date","$value":"2017-06-13T14:49:41.074Z"},"c"]',
	'{"a":"a","b":2,"c":{"$type":"Date","$value":"2017-06-13T14:49:41.074Z"},"d":"date"}',
	'"593ffb858dc15855cafc9373"',
	'[1,"593ffb858dc15855cafc9373","c"]',
	'{"a":"a","b":2,"c":"593ffb858dc15855cafc9373","d":"date"}'
];
const length = strings.length;
suite.add('JSON.stringify', function () {
	for (let i = 0; i < length; i++) {
		JSON.stringify(values[i]);
	}
}).add('JSONLess.stringify', function () {
	for (let i = 0; i < length; i++) {
		JSONLess.stringify(values[i]);
	}
}).add('JSON.parse', function () {
	for (let i = 0; i < length; i++) {
		JSON.parse(strings[i]);
	}
}).add('JSONLess.parse', function () {
	for (let i = 0; i < length; i++) {
		JSONLess.parse(strings[i]);
	}
}).on('cycle', function (event) {
	console.log(String(event.target));
}).run({'async': true});