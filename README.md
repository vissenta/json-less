# JSONLess
[![Build Status](https://travis-ci.org/ponury-kostek/json-less.svg?branch=master)](https://travis-ci.org/ponury-kostek/json-less)
[![Coverage Status](https://coveralls.io/repos/github/ponury-kostek/json-less/badge.svg?branch=master)](https://coveralls.io/github/ponury-kostek/json-less?branch=master)
[![npm version](https://badge.fury.io/js/json-less.svg)](https://badge.fury.io/js/json-less)
[![npm](https://img.shields.io/npm/dt/json-less.svg)]()

## How it works

JSONLess replaces objects like Date into ```{$type: 'Date', $value : '2016-03-04T07:33:03.000Z'}``` before value is stringify and after parse it will revive original object instance

## Usage

Use it exacly in the same way as regular JSON

### stringify
```javascript
JSONLess.stringify({name : 'object with not scalar values', date : new Date()});
// '{"name":"object with not scalar values","date":{"$type":"Date","$value":"2016-03-04T07:33:03.000Z"}}'
```

### parse

```javascript
JSONLess.parse('{"name":"object with not scalar values","date":{"$type":"Date","$value":"2016-03-04T07:33:03.000Z"}}');
// { name: 'object with not scalar values', date: Thu Mar 04 2016 08:33:03 GMT+0100 (CET) }
```

### addHandler

```javascript
JSONLess.addHandler(Date, (cls, value) => {
	return value.toJSON();
}, (cls, value) => {
	return new cls(value);
});
```
now we have added support for Date type

### API docs

See [JSONLess github.io pages](http://ponury-kostek.github.io/json-less/)
