/**
 * @author Michał Żaloudik <michal.zaloudik@redcart.pl>
 */
"use strict";
const assert = require("assert"), mongodb = require("mongodb");
const JSONLess = require(__dirname + "/../index.js");
const date = new Date("2017-06-13T14:49:41.074Z");
const objId = new mongodb.ObjectID("593ffb858dc15855cafc9373");
const tests = [
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
		a: "a",
		b: "b"
	},
	date,
	[
		1,
		date,
		"c"
	],
	{
		a: "a",
		b: 2,
		date: date,
		d: "date"
	},
	objId,
	[
		1,
		objId,
		"c"
	],
	{
		a: "a",
		b: 2,
		oid: objId,
		d: "date"
	},
	/so\/me/i,
	Infinity,
	-Infinity
];
const strings = [
	"null",
	"true",
	"false",
	"[]",
	"{}",
	"-1",
	"0",
	"1",
	"-1.23",
	"1.23",
	"\"simple string\"",
	"[1,2,3]",
	"{\"a\":\"a\",\"b\":\"b\"}",
	"{\"$type\":\"Date\",\"$value\":\"2017-06-13T14:49:41.074Z\"}",
	"[1,{\"$type\":\"Date\",\"$value\":\"2017-06-13T14:49:41.074Z\"},\"c\"]",
	"{\"a\":\"a\",\"b\":2,\"date\":{\"$type\":\"Date\",\"$value\":\"2017-06-13T14:49:41.074Z\"},\"d\":\"date\"}",
	"{\"$type\":\"ObjectID\",\"$value\":\"593ffb858dc15855cafc9373\"}",
	"[1,{\"$type\":\"ObjectID\",\"$value\":\"593ffb858dc15855cafc9373\"},\"c\"]",
	"{\"a\":\"a\",\"b\":2,\"oid\":{\"$type\":\"ObjectID\",\"$value\":\"593ffb858dc15855cafc9373\"},\"d\":\"date\"}",
	"{\"$type\":\"RegExp\",\"$value\":{\"pattern\":\"so\\\\/me\",\"flags\":\"i\"}}",
	"{\"$type\":\"Infinity\",\"$value\":\"+\"}",
	"{\"$type\":\"Infinity\",\"$value\":\"-\"}"
];
describe("Various data", () => {
	before(() => {
		JSONLess.addHandler(mongodb.ObjectID, (cls, value) => {
			return value.toString();
		}, (cls, value) => {
			return new cls(value);
		});
	});
	tests.forEach((test, key) => {
		it("stringify #" + key, () => {
			const replaced = JSONLess.stringify(test);
			assert.deepEqual(replaced, strings[key]);
		});
		it("parse #" + key, () => {
			const revived = JSONLess.parse(strings[key]);
			assert.deepEqual(revived, tests[key]);
		});
	});
});
describe("Circular protection", () => {
	it("Circular object", () => {
		assert.throws(() => {
			const circular = {};
			circular.circularRef = circular;
			JSONLess.stringify(circular);
		}, TypeError, "Converting circular structure to JSONLess");
	});
	it("Circular array", () => {
		assert.throws(() => {
			const circular = [];
			circular.push(circular);
			JSONLess.stringify(circular);
		}, TypeError, "Converting circular structure to JSONLess");
	});
});
describe("Undefined values", () => {
	it("Array", () => {
		assert.strictEqual(JSONLess.stringify([
			1,
			undefined,
			3
		]), "[1,null,3]");
	});
	it("Object", () => {
		assert.strictEqual(JSONLess.stringify({
			a: 1,
			b: undefined,
			c: 3
		}), `{"a":1,"c":3}`);
		assert.strictEqual(JSONLess.stringify({
			a: undefined,
			b: 2,
			c: 3
		}), `{"b":2,"c":3}`);
	});
});
