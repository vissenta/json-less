const __handlers = {};

/**
 * Adds type handler
 * @param {*} cls
 * @param {Function} replacer
 * @param {Function} reviver
 */
function addHandler(cls, replacer, reviver) {
	if (typeof cls !== "function") {
		throw new TypeError("'cls' must be class/function");
	}
	if (typeof replacer !== "function") {
		throw new TypeError("'replacer' must be function");
	}
	if (typeof reviver !== "function") {
		throw new TypeError("'reviver' must be function");
	}
	__handlers[cls.name] = {
		cls: cls,
		replacer: replacer,
		reviver: reviver
	};
}

exports.addHandler = addHandler
exports.__handlers = __handlers

module.exports = {
    __handlers,
    addHandler
}