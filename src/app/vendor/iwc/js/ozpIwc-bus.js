// If running in a worker, there is no window, rather only self.
// Reassign window to self in this environment
try {
    // For IE: Throws error on trying to reassign window
    if (!window) {
        /*jshint -W020 */
        window = self;
    }
}catch (e){
    // For Chrome/FF: window is undefined and throws error on checking if falsy
    window = self;
}
/*!
 * https://github.com/es-shims/es5-shim
 * @license es5-shim Copyright 2009-2015 by contributors, MIT License
 * see https://github.com/es-shims/es5-shim/blob/master/LICENSE
 */

// vim: ts=4 sts=4 sw=4 expandtab

// Add semicolon to prevent IIFE from being passed as argument to concatenated code.
;

// UMD (Universal Module Definition)
// see https://github.com/umdjs/umd/blob/master/returnExports.js
(function (root, factory) {
    'use strict';

    /* global define, exports, module */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
}(this, function () {

/**
 * Brings an environment as close to ECMAScript 5 compliance
 * as is possible with the facilities of erstwhile engines.
 *
 * Annotated ES5: http://es5.github.com/ (specific links below)
 * ES5 Spec: http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
 * Required reading: http://javascriptweblog.wordpress.com/2011/12/05/extending-javascript-natives/
 */

// Shortcut to an often accessed properties, in order to avoid multiple
// dereference that costs universally.
var ArrayPrototype = Array.prototype;
var ObjectPrototype = Object.prototype;
var FunctionPrototype = Function.prototype;
var StringPrototype = String.prototype;
var NumberPrototype = Number.prototype;
var array_slice = ArrayPrototype.slice;
var array_splice = ArrayPrototype.splice;
var array_push = ArrayPrototype.push;
var array_unshift = ArrayPrototype.unshift;
var array_concat = ArrayPrototype.concat;
var call = FunctionPrototype.call;

// Having a toString local variable name breaks in Opera so use to_string.
var to_string = ObjectPrototype.toString;

var isArray = Array.isArray || function isArray(obj) {
    return to_string.call(obj) === '[object Array]';
};

var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
var isCallable; /* inlined from https://npmjs.com/is-callable */ var fnToStr = Function.prototype.toString, tryFunctionObject = function tryFunctionObject(value) { try { fnToStr.call(value); return true; } catch (e) { return false; } }, fnClass = '[object Function]', genClass = '[object GeneratorFunction]'; isCallable = function isCallable(value) { if (typeof value !== 'function') { return false; } if (hasToStringTag) { return tryFunctionObject(value); } var strClass = to_string.call(value); return strClass === fnClass || strClass === genClass; };
var isRegex; /* inlined from https://npmjs.com/is-regex */ var regexExec = RegExp.prototype.exec, tryRegexExec = function tryRegexExec(value) { try { regexExec.call(value); return true; } catch (e) { return false; } }, regexClass = '[object RegExp]'; isRegex = function isRegex(value) { if (typeof value !== 'object') { return false; } return hasToStringTag ? tryRegexExec(value) : to_string.call(value) === regexClass; };
var isString; /* inlined from https://npmjs.com/is-string */ var strValue = String.prototype.valueOf, tryStringObject = function tryStringObject(value) { try { strValue.call(value); return true; } catch (e) { return false; } }, stringClass = '[object String]'; isString = function isString(value) { if (typeof value === 'string') { return true; } if (typeof value !== 'object') { return false; } return hasToStringTag ? tryStringObject(value) : to_string.call(value) === stringClass; };

var isArguments = function isArguments(value) {
    var str = to_string.call(value);
    var isArgs = str === '[object Arguments]';
    if (!isArgs) {
        isArgs = !isArray(value) &&
          value !== null &&
          typeof value === 'object' &&
          typeof value.length === 'number' &&
          value.length >= 0 &&
          isCallable(value.callee);
    }
    return isArgs;
};

/* inlined from http://npmjs.com/define-properties */
var defineProperties = (function (has) {
  var supportsDescriptors = Object.defineProperty && (function () {
      try {
          var obj = {};
          Object.defineProperty(obj, 'x', { enumerable: false, value: obj });
          for (var _ in obj) { return false; }
          return obj.x === obj;
      } catch (e) { /* this is ES3 */
          return false;
      }
  }());

  // Define configurable, writable and non-enumerable props
  // if they don't exist.
  var defineProperty;
  if (supportsDescriptors) {
      defineProperty = function (object, name, method, forceAssign) {
          if (!forceAssign && (name in object)) { return; }
          Object.defineProperty(object, name, {
              configurable: true,
              enumerable: false,
              writable: true,
              value: method
          });
      };
  } else {
      defineProperty = function (object, name, method, forceAssign) {
          if (!forceAssign && (name in object)) { return; }
          object[name] = method;
      };
  }
  return function defineProperties(object, map, forceAssign) {
      for (var name in map) {
          if (has.call(map, name)) {
            defineProperty(object, name, map[name], forceAssign);
          }
      }
  };
}(ObjectPrototype.hasOwnProperty));

//
// Util
// ======
//

/* replaceable with https://npmjs.com/package/es-abstract /helpers/isPrimitive */
var isPrimitive = function isPrimitive(input) {
    var type = typeof input;
    return input === null || (type !== 'object' && type !== 'function');
};

var ES = {
    // ES5 9.4
    // http://es5.github.com/#x9.4
    // http://jsperf.com/to-integer
    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToInteger */
    ToInteger: function ToInteger(num) {
        var n = +num;
        if (n !== n) { // isNaN
            n = 0;
        } else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
            n = (n > 0 || -1) * Math.floor(Math.abs(n));
        }
        return n;
    },

    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToPrimitive */
    ToPrimitive: function ToPrimitive(input) {
        var val, valueOf, toStr;
        if (isPrimitive(input)) {
            return input;
        }
        valueOf = input.valueOf;
        if (isCallable(valueOf)) {
            val = valueOf.call(input);
            if (isPrimitive(val)) {
                return val;
            }
        }
        toStr = input.toString;
        if (isCallable(toStr)) {
            val = toStr.call(input);
            if (isPrimitive(val)) {
                return val;
            }
        }
        throw new TypeError();
    },

    // ES5 9.9
    // http://es5.github.com/#x9.9
    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToObject */
    ToObject: function (o) {
        /* jshint eqnull: true */
        if (o == null) { // this matches both null and undefined
            throw new TypeError("can't convert " + o + ' to object');
        }
        return Object(o);
    },

    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToUint32 */
    ToUint32: function ToUint32(x) {
        return x >>> 0;
    }
};

//
// Function
// ========
//

// ES-5 15.3.4.5
// http://es5.github.com/#x15.3.4.5

var Empty = function Empty() {};

defineProperties(FunctionPrototype, {
    bind: function bind(that) { // .length is 1
        // 1. Let Target be the this value.
        var target = this;
        // 2. If IsCallable(Target) is false, throw a TypeError exception.
        if (!isCallable(target)) {
            throw new TypeError('Function.prototype.bind called on incompatible ' + target);
        }
        // 3. Let A be a new (possibly empty) internal list of all of the
        //   argument values provided after thisArg (arg1, arg2 etc), in order.
        // XXX slicedArgs will stand in for "A" if used
        var args = array_slice.call(arguments, 1); // for normal call
        // 4. Let F be a new native ECMAScript object.
        // 11. Set the [[Prototype]] internal property of F to the standard
        //   built-in Function prototype object as specified in 15.3.3.1.
        // 12. Set the [[Call]] internal property of F as described in
        //   15.3.4.5.1.
        // 13. Set the [[Construct]] internal property of F as described in
        //   15.3.4.5.2.
        // 14. Set the [[HasInstance]] internal property of F as described in
        //   15.3.4.5.3.
        var bound;
        var binder = function () {

            if (this instanceof bound) {
                // 15.3.4.5.2 [[Construct]]
                // When the [[Construct]] internal method of a function object,
                // F that was created using the bind function is called with a
                // list of arguments ExtraArgs, the following steps are taken:
                // 1. Let target be the value of F's [[TargetFunction]]
                //   internal property.
                // 2. If target has no [[Construct]] internal method, a
                //   TypeError exception is thrown.
                // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.
                // 5. Return the result of calling the [[Construct]] internal
                //   method of target providing args as the arguments.

                var result = target.apply(
                    this,
                    array_concat.call(args, array_slice.call(arguments))
                );
                if (Object(result) === result) {
                    return result;
                }
                return this;

            } else {
                // 15.3.4.5.1 [[Call]]
                // When the [[Call]] internal method of a function object, F,
                // which was created using the bind function is called with a
                // this value and a list of arguments ExtraArgs, the following
                // steps are taken:
                // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 2. Let boundThis be the value of F's [[BoundThis]] internal
                //   property.
                // 3. Let target be the value of F's [[TargetFunction]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.
                // 5. Return the result of calling the [[Call]] internal method
                //   of target providing boundThis as the this value and
                //   providing args as the arguments.

                // equiv: target.call(this, ...boundArgs, ...args)
                return target.apply(
                    that,
                    array_concat.call(args, array_slice.call(arguments))
                );

            }

        };

        // 15. If the [[Class]] internal property of Target is "Function", then
        //     a. Let L be the length property of Target minus the length of A.
        //     b. Set the length own property of F to either 0 or L, whichever is
        //       larger.
        // 16. Else set the length own property of F to 0.

        var boundLength = Math.max(0, target.length - args.length);

        // 17. Set the attributes of the length own property of F to the values
        //   specified in 15.3.5.1.
        var boundArgs = [];
        for (var i = 0; i < boundLength; i++) {
            boundArgs.push('$' + i);
        }

        // XXX Build a dynamic function with desired amount of arguments is the only
        // way to set the length property of a function.
        // In environments where Content Security Policies enabled (Chrome extensions,
        // for ex.) all use of eval or Function costructor throws an exception.
        // However in all of these environments Function.prototype.bind exists
        // and so this code will never be executed.
        bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this, arguments); }')(binder);

        if (target.prototype) {
            Empty.prototype = target.prototype;
            bound.prototype = new Empty();
            // Clean up dangling references.
            Empty.prototype = null;
        }

        // TODO
        // 18. Set the [[Extensible]] internal property of F to true.

        // TODO
        // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
        // 20. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
        //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
        //   false.
        // 21. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
        //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
        //   and false.

        // TODO
        // NOTE Function objects created using Function.prototype.bind do not
        // have a prototype property or the [[Code]], [[FormalParameters]], and
        // [[Scope]] internal properties.
        // XXX can't delete prototype in pure-js.

        // 22. Return F.
        return bound;
    }
});

// _Please note: Shortcuts are defined after `Function.prototype.bind` as we
// us it in defining shortcuts.
var owns = call.bind(ObjectPrototype.hasOwnProperty);

//
// Array
// =====
//

// ES5 15.4.4.12
// http://es5.github.com/#x15.4.4.12
var spliceNoopReturnsEmptyArray = (function () {
    var a = [1, 2];
    var result = a.splice();
    return a.length === 2 && isArray(result) && result.length === 0;
}());
defineProperties(ArrayPrototype, {
    // Safari 5.0 bug where .splice() returns undefined
    splice: function splice(start, deleteCount) {
        if (arguments.length === 0) {
            return [];
        } else {
            return array_splice.apply(this, arguments);
        }
    }
}, !spliceNoopReturnsEmptyArray);

var spliceWorksWithEmptyObject = (function () {
    var obj = {};
    ArrayPrototype.splice.call(obj, 0, 0, 1);
    return obj.length === 1;
}());
defineProperties(ArrayPrototype, {
    splice: function splice(start, deleteCount) {
        if (arguments.length === 0) { return []; }
        var args = arguments;
        this.length = Math.max(ES.ToInteger(this.length), 0);
        if (arguments.length > 0 && typeof deleteCount !== 'number') {
            args = array_slice.call(arguments);
            if (args.length < 2) {
                args.push(this.length - start);
            } else {
                args[1] = ES.ToInteger(deleteCount);
            }
        }
        return array_splice.apply(this, args);
    }
}, !spliceWorksWithEmptyObject);

// ES5 15.4.4.12
// http://es5.github.com/#x15.4.4.13
// Return len+argCount.
// [bugfix, ielt8]
// IE < 8 bug: [].unshift(0) === undefined but should be "1"
var hasUnshiftReturnValueBug = [].unshift(0) !== 1;
defineProperties(ArrayPrototype, {
    unshift: function () {
        array_unshift.apply(this, arguments);
        return this.length;
    }
}, hasUnshiftReturnValueBug);

// ES5 15.4.3.2
// http://es5.github.com/#x15.4.3.2
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
defineProperties(Array, { isArray: isArray });

// The IsCallable() check in the Array functions
// has been replaced with a strict check on the
// internal class of the object to trap cases where
// the provided function was actually a regular
// expression literal, which in V8 and
// JavaScriptCore is a typeof "function".  Only in
// V8 are regular expression literals permitted as
// reduce parameters, so it is desirable in the
// general case for the shim to match the more
// strict and common behavior of rejecting regular
// expressions.

// ES5 15.4.4.18
// http://es5.github.com/#x15.4.4.18
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/forEach

// Check failure of by-index access of string characters (IE < 9)
// and failure of `0 in boxedString` (Rhino)
var boxedString = Object('a');
var splitString = boxedString[0] !== 'a' || !(0 in boxedString);

var properlyBoxesContext = function properlyBoxed(method) {
    // Check node 0.6.21 bug where third parameter is not boxed
    var properlyBoxesNonStrict = true;
    var properlyBoxesStrict = true;
    if (method) {
        method.call('foo', function (_, __, context) {
            if (typeof context !== 'object') { properlyBoxesNonStrict = false; }
        });

        method.call([1], function () {
            'use strict';

            properlyBoxesStrict = typeof this === 'string';
        }, 'x');
    }
    return !!method && properlyBoxesNonStrict && properlyBoxesStrict;
};

defineProperties(ArrayPrototype, {
    forEach: function forEach(callbackfn /*, thisArg*/) {
        var object = ES.ToObject(this);
        var self = splitString && isString(this) ? this.split('') : object;
        var i = -1;
        var length = self.length >>> 0;
        var T;
        if (arguments.length > 1) {
          T = arguments[1];
        }

        // If no callback function or if callback is not a callable function
        if (!isCallable(callbackfn)) {
            throw new TypeError('Array.prototype.forEach callback must be a function');
        }

        while (++i < length) {
            if (i in self) {
                // Invoke the callback function with call, passing arguments:
                // context, property value, property key, thisArg object
                if (typeof T !== 'undefined') {
                    callbackfn.call(T, self[i], i, object);
                } else {
                    callbackfn(self[i], i, object);
                }
            }
        }
    }
}, !properlyBoxesContext(ArrayPrototype.forEach));

// ES5 15.4.4.19
// http://es5.github.com/#x15.4.4.19
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
defineProperties(ArrayPrototype, {
    map: function map(callbackfn/*, thisArg*/) {
        var object = ES.ToObject(this);
        var self = splitString && isString(this) ? this.split('') : object;
        var length = self.length >>> 0;
        var result = Array(length);
        var T;
        if (arguments.length > 1) {
            T = arguments[1];
        }

        // If no callback function or if callback is not a callable function
        if (!isCallable(callbackfn)) {
            throw new TypeError('Array.prototype.map callback must be a function');
        }

        for (var i = 0; i < length; i++) {
            if (i in self) {
                if (typeof T !== 'undefined') {
                    result[i] = callbackfn.call(T, self[i], i, object);
                } else {
                    result[i] = callbackfn(self[i], i, object);
                }
            }
        }
        return result;
    }
}, !properlyBoxesContext(ArrayPrototype.map));

// ES5 15.4.4.20
// http://es5.github.com/#x15.4.4.20
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter
defineProperties(ArrayPrototype, {
    filter: function filter(callbackfn /*, thisArg*/) {
        var object = ES.ToObject(this);
        var self = splitString && isString(this) ? this.split('') : object;
        var length = self.length >>> 0;
        var result = [];
        var value;
        var T;
        if (arguments.length > 1) {
            T = arguments[1];
        }

        // If no callback function or if callback is not a callable function
        if (!isCallable(callbackfn)) {
            throw new TypeError('Array.prototype.filter callback must be a function');
        }

        for (var i = 0; i < length; i++) {
            if (i in self) {
                value = self[i];
                if (typeof T === 'undefined' ? callbackfn(value, i, object) : callbackfn.call(T, value, i, object)) {
                    result.push(value);
                }
            }
        }
        return result;
    }
}, !properlyBoxesContext(ArrayPrototype.filter));

// ES5 15.4.4.16
// http://es5.github.com/#x15.4.4.16
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
defineProperties(ArrayPrototype, {
    every: function every(callbackfn /*, thisArg*/) {
        var object = ES.ToObject(this);
        var self = splitString && isString(this) ? this.split('') : object;
        var length = self.length >>> 0;
        var T;
        if (arguments.length > 1) {
            T = arguments[1];
        }

        // If no callback function or if callback is not a callable function
        if (!isCallable(callbackfn)) {
            throw new TypeError('Array.prototype.every callback must be a function');
        }

        for (var i = 0; i < length; i++) {
            if (i in self && !(typeof T === 'undefined' ? callbackfn(self[i], i, object) : callbackfn.call(T, self[i], i, object))) {
                return false;
            }
        }
        return true;
    }
}, !properlyBoxesContext(ArrayPrototype.every));

// ES5 15.4.4.17
// http://es5.github.com/#x15.4.4.17
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
defineProperties(ArrayPrototype, {
    some: function some(callbackfn/*, thisArg */) {
        var object = ES.ToObject(this);
        var self = splitString && isString(this) ? this.split('') : object;
        var length = self.length >>> 0;
        var T;
        if (arguments.length > 1) {
            T = arguments[1];
        }

        // If no callback function or if callback is not a callable function
        if (!isCallable(callbackfn)) {
            throw new TypeError('Array.prototype.some callback must be a function');
        }

        for (var i = 0; i < length; i++) {
            if (i in self && (typeof T === 'undefined' ? callbackfn(self[i], i, object) : callbackfn.call(T, self[i], i, object))) {
                return true;
            }
        }
        return false;
    }
}, !properlyBoxesContext(ArrayPrototype.some));

// ES5 15.4.4.21
// http://es5.github.com/#x15.4.4.21
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce
var reduceCoercesToObject = false;
if (ArrayPrototype.reduce) {
    reduceCoercesToObject = typeof ArrayPrototype.reduce.call('es5', function (_, __, ___, list) { return list; }) === 'object';
}
defineProperties(ArrayPrototype, {
    reduce: function reduce(callbackfn /*, initialValue*/) {
        var object = ES.ToObject(this);
        var self = splitString && isString(this) ? this.split('') : object;
        var length = self.length >>> 0;

        // If no callback function or if callback is not a callable function
        if (!isCallable(callbackfn)) {
            throw new TypeError('Array.prototype.reduce callback must be a function');
        }

        // no value to return if no initial value and an empty array
        if (length === 0 && arguments.length === 1) {
            throw new TypeError('reduce of empty array with no initial value');
        }

        var i = 0;
        var result;
        if (arguments.length >= 2) {
            result = arguments[1];
        } else {
            do {
                if (i in self) {
                    result = self[i++];
                    break;
                }

                // if array contains no values, no initial value to return
                if (++i >= length) {
                    throw new TypeError('reduce of empty array with no initial value');
                }
            } while (true);
        }

        for (; i < length; i++) {
            if (i in self) {
                result = callbackfn(result, self[i], i, object);
            }
        }

        return result;
    }
}, !reduceCoercesToObject);

// ES5 15.4.4.22
// http://es5.github.com/#x15.4.4.22
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduceRight
var reduceRightCoercesToObject = false;
if (ArrayPrototype.reduceRight) {
    reduceRightCoercesToObject = typeof ArrayPrototype.reduceRight.call('es5', function (_, __, ___, list) { return list; }) === 'object';
}
defineProperties(ArrayPrototype, {
    reduceRight: function reduceRight(callbackfn/*, initial*/) {
        var object = ES.ToObject(this);
        var self = splitString && isString(this) ? this.split('') : object;
        var length = self.length >>> 0;

        // If no callback function or if callback is not a callable function
        if (!isCallable(callbackfn)) {
            throw new TypeError('Array.prototype.reduceRight callback must be a function');
        }

        // no value to return if no initial value, empty array
        if (length === 0 && arguments.length === 1) {
            throw new TypeError('reduceRight of empty array with no initial value');
        }

        var result;
        var i = length - 1;
        if (arguments.length >= 2) {
            result = arguments[1];
        } else {
            do {
                if (i in self) {
                    result = self[i--];
                    break;
                }

                // if array contains no values, no initial value to return
                if (--i < 0) {
                    throw new TypeError('reduceRight of empty array with no initial value');
                }
            } while (true);
        }

        if (i < 0) {
            return result;
        }

        do {
            if (i in self) {
                result = callbackfn(result, self[i], i, object);
            }
        } while (i--);

        return result;
    }
}, !reduceRightCoercesToObject);

// ES5 15.4.4.14
// http://es5.github.com/#x15.4.4.14
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
var hasFirefox2IndexOfBug = Array.prototype.indexOf && [0, 1].indexOf(1, 2) !== -1;
defineProperties(ArrayPrototype, {
    indexOf: function indexOf(searchElement /*, fromIndex */) {
        var self = splitString && isString(this) ? this.split('') : ES.ToObject(this);
        var length = self.length >>> 0;

        if (length === 0) {
            return -1;
        }

        var i = 0;
        if (arguments.length > 1) {
            i = ES.ToInteger(arguments[1]);
        }

        // handle negative indices
        i = i >= 0 ? i : Math.max(0, length + i);
        for (; i < length; i++) {
            if (i in self && self[i] === searchElement) {
                return i;
            }
        }
        return -1;
    }
}, hasFirefox2IndexOfBug);

// ES5 15.4.4.15
// http://es5.github.com/#x15.4.4.15
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf
var hasFirefox2LastIndexOfBug = Array.prototype.lastIndexOf && [0, 1].lastIndexOf(0, -3) !== -1;
defineProperties(ArrayPrototype, {
    lastIndexOf: function lastIndexOf(searchElement /*, fromIndex */) {
        var self = splitString && isString(this) ? this.split('') : ES.ToObject(this);
        var length = self.length >>> 0;

        if (length === 0) {
            return -1;
        }
        var i = length - 1;
        if (arguments.length > 1) {
            i = Math.min(i, ES.ToInteger(arguments[1]));
        }
        // handle negative indices
        i = i >= 0 ? i : length - Math.abs(i);
        for (; i >= 0; i--) {
            if (i in self && searchElement === self[i]) {
                return i;
            }
        }
        return -1;
    }
}, hasFirefox2LastIndexOfBug);

//
// Object
// ======
//

// ES5 15.2.3.14
// http://es5.github.com/#x15.2.3.14

// http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
var hasDontEnumBug = !({ 'toString': null }).propertyIsEnumerable('toString'),
    hasProtoEnumBug = function () {}.propertyIsEnumerable('prototype'),
    hasStringEnumBug = !owns('x', '0'),
    dontEnums = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
    ],
    dontEnumsLength = dontEnums.length;

defineProperties(Object, {
    keys: function keys(object) {
        var isFn = isCallable(object),
            isArgs = isArguments(object),
            isObject = object !== null && typeof object === 'object',
            isStr = isObject && isString(object);

        if (!isObject && !isFn && !isArgs) {
            throw new TypeError('Object.keys called on a non-object');
        }

        var theKeys = [];
        var skipProto = hasProtoEnumBug && isFn;
        if ((isStr && hasStringEnumBug) || isArgs) {
            for (var i = 0; i < object.length; ++i) {
                theKeys.push(String(i));
            }
        }

        if (!isArgs) {
            for (var name in object) {
                if (!(skipProto && name === 'prototype') && owns(object, name)) {
                    theKeys.push(String(name));
                }
            }
        }

        if (hasDontEnumBug) {
            var ctor = object.constructor,
                skipConstructor = ctor && ctor.prototype === object;
            for (var j = 0; j < dontEnumsLength; j++) {
                var dontEnum = dontEnums[j];
                if (!(skipConstructor && dontEnum === 'constructor') && owns(object, dontEnum)) {
                    theKeys.push(dontEnum);
                }
            }
        }
        return theKeys;
    }
});

var keysWorksWithArguments = Object.keys && (function () {
    // Safari 5.0 bug
    return Object.keys(arguments).length === 2;
}(1, 2));
var originalKeys = Object.keys;
defineProperties(Object, {
    keys: function keys(object) {
        if (isArguments(object)) {
            return originalKeys(ArrayPrototype.slice.call(object));
        } else {
            return originalKeys(object);
        }
    }
}, !keysWorksWithArguments);

//
// Date
// ====
//

// ES5 15.9.5.43
// http://es5.github.com/#x15.9.5.43
// This function returns a String value represent the instance in time
// represented by this Date object. The format of the String is the Date Time
// string format defined in 15.9.1.15. All fields are present in the String.
// The time zone is always UTC, denoted by the suffix Z. If the time value of
// this object is not a finite Number a RangeError exception is thrown.
var negativeDate = -62198755200000;
var negativeYearString = '-000001';
var hasNegativeDateBug = Date.prototype.toISOString && new Date(negativeDate).toISOString().indexOf(negativeYearString) === -1;

defineProperties(Date.prototype, {
    toISOString: function toISOString() {
        var result, length, value, year, month;
        if (!isFinite(this)) {
            throw new RangeError('Date.prototype.toISOString called on non-finite value.');
        }

        year = this.getUTCFullYear();

        month = this.getUTCMonth();
        // see https://github.com/es-shims/es5-shim/issues/111
        year += Math.floor(month / 12);
        month = (month % 12 + 12) % 12;

        // the date time string format is specified in 15.9.1.15.
        result = [month + 1, this.getUTCDate(), this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds()];
        year = (
            (year < 0 ? '-' : (year > 9999 ? '+' : '')) +
            ('00000' + Math.abs(year)).slice((0 <= year && year <= 9999) ? -4 : -6)
        );

        length = result.length;
        while (length--) {
            value = result[length];
            // pad months, days, hours, minutes, and seconds to have two
            // digits.
            if (value < 10) {
                result[length] = '0' + value;
            }
        }
        // pad milliseconds to have three digits.
        return (
            year + '-' + result.slice(0, 2).join('-') +
            'T' + result.slice(2).join(':') + '.' +
            ('000' + this.getUTCMilliseconds()).slice(-3) + 'Z'
        );
    }
}, hasNegativeDateBug);

// ES5 15.9.5.44
// http://es5.github.com/#x15.9.5.44
// This function provides a String representation of a Date object for use by
// JSON.stringify (15.12.3).
var dateToJSONIsSupported = (function () {
    try {
        return Date.prototype.toJSON &&
            new Date(NaN).toJSON() === null &&
            new Date(negativeDate).toJSON().indexOf(negativeYearString) !== -1 &&
            Date.prototype.toJSON.call({ // generic
                toISOString: function () { return true; }
            });
    } catch (e) {
        return false;
    }
}());
if (!dateToJSONIsSupported) {
    Date.prototype.toJSON = function toJSON(key) {
        // When the toJSON method is called with argument key, the following
        // steps are taken:

        // 1.  Let O be the result of calling ToObject, giving it the this
        // value as its argument.
        // 2. Let tv be ES.ToPrimitive(O, hint Number).
        var O = Object(this);
        var tv = ES.ToPrimitive(O);
        // 3. If tv is a Number and is not finite, return null.
        if (typeof tv === 'number' && !isFinite(tv)) {
            return null;
        }
        // 4. Let toISO be the result of calling the [[Get]] internal method of
        // O with argument "toISOString".
        var toISO = O.toISOString;
        // 5. If IsCallable(toISO) is false, throw a TypeError exception.
        if (!isCallable(toISO)) {
            throw new TypeError('toISOString property is not callable');
        }
        // 6. Return the result of calling the [[Call]] internal method of
        //  toISO with O as the this value and an empty argument list.
        return toISO.call(O);

        // NOTE 1 The argument is ignored.

        // NOTE 2 The toJSON function is intentionally generic; it does not
        // require that its this value be a Date object. Therefore, it can be
        // transferred to other kinds of objects for use as a method. However,
        // it does require that any such object have a toISOString method. An
        // object is free to use the argument key to filter its
        // stringification.
    };
}

// ES5 15.9.4.2
// http://es5.github.com/#x15.9.4.2
// based on work shared by Daniel Friesen (dantman)
// http://gist.github.com/303249
var supportsExtendedYears = Date.parse('+033658-09-27T01:46:40.000Z') === 1e15;
var acceptsInvalidDates = !isNaN(Date.parse('2012-04-04T24:00:00.500Z')) || !isNaN(Date.parse('2012-11-31T23:59:59.000Z')) || !isNaN(Date.parse('2012-12-31T23:59:60.000Z'));
var doesNotParseY2KNewYear = isNaN(Date.parse('2000-01-01T00:00:00.000Z'));
if (!Date.parse || doesNotParseY2KNewYear || acceptsInvalidDates || !supportsExtendedYears) {
    // XXX global assignment won't work in embeddings that use
    // an alternate object for the context.
    /* global Date: true */
    /* eslint-disable no-undef */
    Date = (function (NativeDate) {
    /* eslint-enable no-undef */
        // Date.length === 7
        var DateShim = function Date(Y, M, D, h, m, s, ms) {
            var length = arguments.length;
            var date;
            if (this instanceof NativeDate) {
                date = length === 1 && String(Y) === Y ? // isString(Y)
                    // We explicitly pass it through parse:
                    new NativeDate(DateShim.parse(Y)) :
                    // We have to manually make calls depending on argument
                    // length here
                    length >= 7 ? new NativeDate(Y, M, D, h, m, s, ms) :
                    length >= 6 ? new NativeDate(Y, M, D, h, m, s) :
                    length >= 5 ? new NativeDate(Y, M, D, h, m) :
                    length >= 4 ? new NativeDate(Y, M, D, h) :
                    length >= 3 ? new NativeDate(Y, M, D) :
                    length >= 2 ? new NativeDate(Y, M) :
                    length >= 1 ? new NativeDate(Y) :
                                  new NativeDate();
            } else {
                date = NativeDate.apply(this, arguments);
            }
            // Prevent mixups with unfixed Date object
            defineProperties(date, { constructor: DateShim }, true);
            return date;
        };

        // 15.9.1.15 Date Time String Format.
        var isoDateExpression = new RegExp('^' +
            '(\\d{4}|[+-]\\d{6})' + // four-digit year capture or sign +
                                      // 6-digit extended year
            '(?:-(\\d{2})' + // optional month capture
            '(?:-(\\d{2})' + // optional day capture
            '(?:' + // capture hours:minutes:seconds.milliseconds
                'T(\\d{2})' + // hours capture
                ':(\\d{2})' + // minutes capture
                '(?:' + // optional :seconds.milliseconds
                    ':(\\d{2})' + // seconds capture
                    '(?:(\\.\\d{1,}))?' + // milliseconds capture
                ')?' +
            '(' + // capture UTC offset component
                'Z|' + // UTC capture
                '(?:' + // offset specifier +/-hours:minutes
                    '([-+])' + // sign capture
                    '(\\d{2})' + // hours offset capture
                    ':(\\d{2})' + // minutes offset capture
                ')' +
            ')?)?)?)?' +
        '$');

        var months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];

        var dayFromMonth = function dayFromMonth(year, month) {
            var t = month > 1 ? 1 : 0;
            return (
                months[month] +
                Math.floor((year - 1969 + t) / 4) -
                Math.floor((year - 1901 + t) / 100) +
                Math.floor((year - 1601 + t) / 400) +
                365 * (year - 1970)
            );
        };

        var toUTC = function toUTC(t) {
            return Number(new NativeDate(1970, 0, 1, 0, 0, 0, t));
        };

        // Copy any custom methods a 3rd party library may have added
        for (var key in NativeDate) {
            if (owns(NativeDate, key)) {
                DateShim[key] = NativeDate[key];
            }
        }

        // Copy "native" methods explicitly; they may be non-enumerable
        defineProperties(DateShim, {
            now: NativeDate.now,
            UTC: NativeDate.UTC
        }, true);
        DateShim.prototype = NativeDate.prototype;
        defineProperties(DateShim.prototype, {
            constructor: DateShim
        }, true);

        // Upgrade Date.parse to handle simplified ISO 8601 strings
        var parseShim = function parse(string) {
            var match = isoDateExpression.exec(string);
            if (match) {
                // parse months, days, hours, minutes, seconds, and milliseconds
                // provide default values if necessary
                // parse the UTC offset component
                var year = Number(match[1]),
                    month = Number(match[2] || 1) - 1,
                    day = Number(match[3] || 1) - 1,
                    hour = Number(match[4] || 0),
                    minute = Number(match[5] || 0),
                    second = Number(match[6] || 0),
                    millisecond = Math.floor(Number(match[7] || 0) * 1000),
                    // When time zone is missed, local offset should be used
                    // (ES 5.1 bug)
                    // see https://bugs.ecmascript.org/show_bug.cgi?id=112
                    isLocalTime = Boolean(match[4] && !match[8]),
                    signOffset = match[9] === '-' ? 1 : -1,
                    hourOffset = Number(match[10] || 0),
                    minuteOffset = Number(match[11] || 0),
                    result;
                if (
                    hour < (
                        minute > 0 || second > 0 || millisecond > 0 ?
                        24 : 25
                    ) &&
                    minute < 60 && second < 60 && millisecond < 1000 &&
                    month > -1 && month < 12 && hourOffset < 24 &&
                    minuteOffset < 60 && // detect invalid offsets
                    day > -1 &&
                    day < (
                        dayFromMonth(year, month + 1) -
                        dayFromMonth(year, month)
                    )
                ) {
                    result = (
                        (dayFromMonth(year, month) + day) * 24 +
                        hour +
                        hourOffset * signOffset
                    ) * 60;
                    result = (
                        (result + minute + minuteOffset * signOffset) * 60 +
                        second
                    ) * 1000 + millisecond;
                    if (isLocalTime) {
                        result = toUTC(result);
                    }
                    if (-8.64e15 <= result && result <= 8.64e15) {
                        return result;
                    }
                }
                return NaN;
            }
            return NativeDate.parse.apply(this, arguments);
        };
        defineProperties(DateShim, { parse: parseShim });

        return DateShim;
    }(Date));
    /* global Date: false */
}

// ES5 15.9.4.4
// http://es5.github.com/#x15.9.4.4
if (!Date.now) {
    Date.now = function now() {
        return new Date().getTime();
    };
}

//
// Number
// ======
//

// ES5.1 15.7.4.5
// http://es5.github.com/#x15.7.4.5
var hasToFixedBugs = NumberPrototype.toFixed && (
  (0.00008).toFixed(3) !== '0.000' ||
  (0.9).toFixed(0) !== '1' ||
  (1.255).toFixed(2) !== '1.25' ||
  (1000000000000000128).toFixed(0) !== '1000000000000000128'
);

var toFixedHelpers = {
  base: 1e7,
  size: 6,
  data: [0, 0, 0, 0, 0, 0],
  multiply: function multiply(n, c) {
      var i = -1;
      var c2 = c;
      while (++i < toFixedHelpers.size) {
          c2 += n * toFixedHelpers.data[i];
          toFixedHelpers.data[i] = c2 % toFixedHelpers.base;
          c2 = Math.floor(c2 / toFixedHelpers.base);
      }
  },
  divide: function divide(n) {
      var i = toFixedHelpers.size, c = 0;
      while (--i >= 0) {
          c += toFixedHelpers.data[i];
          toFixedHelpers.data[i] = Math.floor(c / n);
          c = (c % n) * toFixedHelpers.base;
      }
  },
  numToString: function numToString() {
      var i = toFixedHelpers.size;
      var s = '';
      while (--i >= 0) {
          if (s !== '' || i === 0 || toFixedHelpers.data[i] !== 0) {
              var t = String(toFixedHelpers.data[i]);
              if (s === '') {
                  s = t;
              } else {
                  s += '0000000'.slice(0, 7 - t.length) + t;
              }
          }
      }
      return s;
  },
  pow: function pow(x, n, acc) {
      return (n === 0 ? acc : (n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc)));
  },
  log: function log(x) {
      var n = 0;
      var x2 = x;
      while (x2 >= 4096) {
          n += 12;
          x2 /= 4096;
      }
      while (x2 >= 2) {
          n += 1;
          x2 /= 2;
      }
      return n;
  }
};

defineProperties(NumberPrototype, {
    toFixed: function toFixed(fractionDigits) {
        var f, x, s, m, e, z, j, k;

        // Test for NaN and round fractionDigits down
        f = Number(fractionDigits);
        f = f !== f ? 0 : Math.floor(f);

        if (f < 0 || f > 20) {
            throw new RangeError('Number.toFixed called with invalid number of decimals');
        }

        x = Number(this);

        // Test for NaN
        if (x !== x) {
            return 'NaN';
        }

        // If it is too big or small, return the string value of the number
        if (x <= -1e21 || x >= 1e21) {
            return String(x);
        }

        s = '';

        if (x < 0) {
            s = '-';
            x = -x;
        }

        m = '0';

        if (x > 1e-21) {
            // 1e-21 < x < 1e21
            // -70 < log2(x) < 70
            e = toFixedHelpers.log(x * toFixedHelpers.pow(2, 69, 1)) - 69;
            z = (e < 0 ? x * toFixedHelpers.pow(2, -e, 1) : x / toFixedHelpers.pow(2, e, 1));
            z *= 0x10000000000000; // Math.pow(2, 52);
            e = 52 - e;

            // -18 < e < 122
            // x = z / 2 ^ e
            if (e > 0) {
                toFixedHelpers.multiply(0, z);
                j = f;

                while (j >= 7) {
                    toFixedHelpers.multiply(1e7, 0);
                    j -= 7;
                }

                toFixedHelpers.multiply(toFixedHelpers.pow(10, j, 1), 0);
                j = e - 1;

                while (j >= 23) {
                    toFixedHelpers.divide(1 << 23);
                    j -= 23;
                }

                toFixedHelpers.divide(1 << j);
                toFixedHelpers.multiply(1, 1);
                toFixedHelpers.divide(2);
                m = toFixedHelpers.numToString();
            } else {
                toFixedHelpers.multiply(0, z);
                toFixedHelpers.multiply(1 << (-e), 0);
                m = toFixedHelpers.numToString() + '0.00000000000000000000'.slice(2, 2 + f);
            }
        }

        if (f > 0) {
            k = m.length;

            if (k <= f) {
                m = s + '0.0000000000000000000'.slice(0, f - k + 2) + m;
            } else {
                m = s + m.slice(0, k - f) + '.' + m.slice(k - f);
            }
        } else {
            m = s + m;
        }

        return m;
    }
}, hasToFixedBugs);

//
// String
// ======
//

// ES5 15.5.4.14
// http://es5.github.com/#x15.5.4.14

// [bugfix, IE lt 9, firefox 4, Konqueror, Opera, obscure browsers]
// Many browsers do not split properly with regular expressions or they
// do not perform the split correctly under obscure conditions.
// See http://blog.stevenlevithan.com/archives/cross-browser-split
// I've tested in many browsers and this seems to cover the deviant ones:
//    'ab'.split(/(?:ab)*/) should be ["", ""], not [""]
//    '.'.split(/(.?)(.?)/) should be ["", ".", "", ""], not ["", ""]
//    'tesst'.split(/(s)*/) should be ["t", undefined, "e", "s", "t"], not
//       [undefined, "t", undefined, "e", ...]
//    ''.split(/.?/) should be [], not [""]
//    '.'.split(/()()/) should be ["."], not ["", "", "."]

var string_split = StringPrototype.split;
if (
    'ab'.split(/(?:ab)*/).length !== 2 ||
    '.'.split(/(.?)(.?)/).length !== 4 ||
    'tesst'.split(/(s)*/)[1] === 't' ||
    'test'.split(/(?:)/, -1).length !== 4 ||
    ''.split(/.?/).length ||
    '.'.split(/()()/).length > 1
) {
    (function () {
        var compliantExecNpcg = typeof (/()??/).exec('')[1] === 'undefined'; // NPCG: nonparticipating capturing group

        StringPrototype.split = function (separator, limit) {
            var string = this;
            if (typeof separator === 'undefined' && limit === 0) {
                return [];
            }

            // If `separator` is not a regex, use native split
            if (!isRegex(separator)) {
                return string_split.call(this, separator, limit);
            }

            var output = [];
            var flags = (separator.ignoreCase ? 'i' : '') +
                        (separator.multiline ? 'm' : '') +
                        (separator.extended ? 'x' : '') + // Proposed for ES6
                        (separator.sticky ? 'y' : ''), // Firefox 3+
                lastLastIndex = 0,
                // Make `global` and avoid `lastIndex` issues by working with a copy
                separator2, match, lastIndex, lastLength;
            var separatorCopy = new RegExp(separator.source, flags + 'g');
            string += ''; // Type-convert
            if (!compliantExecNpcg) {
                // Doesn't need flags gy, but they don't hurt
                separator2 = new RegExp('^' + separatorCopy.source + '$(?!\\s)', flags);
            }
            /* Values for `limit`, per the spec:
             * If undefined: 4294967295 // Math.pow(2, 32) - 1
             * If 0, Infinity, or NaN: 0
             * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
             * If negative number: 4294967296 - Math.floor(Math.abs(limit))
             * If other: Type-convert, then use the above rules
             */
            var splitLimit = typeof limit === 'undefined' ?
                -1 >>> 0 : // Math.pow(2, 32) - 1
                ES.ToUint32(limit);
            match = separatorCopy.exec(string);
            while (match) {
                // `separatorCopy.lastIndex` is not reliable cross-browser
                lastIndex = match.index + match[0].length;
                if (lastIndex > lastLastIndex) {
                    output.push(string.slice(lastLastIndex, match.index));
                    // Fix browsers whose `exec` methods don't consistently return `undefined` for
                    // nonparticipating capturing groups
                    if (!compliantExecNpcg && match.length > 1) {
                        /* eslint-disable no-loop-func */
                        match[0].replace(separator2, function () {
                            for (var i = 1; i < arguments.length - 2; i++) {
                                if (typeof arguments[i] === 'undefined') {
                                    match[i] = void 0;
                                }
                            }
                        });
                        /* eslint-enable no-loop-func */
                    }
                    if (match.length > 1 && match.index < string.length) {
                        array_push.apply(output, match.slice(1));
                    }
                    lastLength = match[0].length;
                    lastLastIndex = lastIndex;
                    if (output.length >= splitLimit) {
                        break;
                    }
                }
                if (separatorCopy.lastIndex === match.index) {
                    separatorCopy.lastIndex++; // Avoid an infinite loop
                }
                match = separatorCopy.exec(string);
            }
            if (lastLastIndex === string.length) {
                if (lastLength || !separatorCopy.test('')) {
                    output.push('');
                }
            } else {
                output.push(string.slice(lastLastIndex));
            }
            return output.length > splitLimit ? output.slice(0, splitLimit) : output;
        };
    }());

// [bugfix, chrome]
// If separator is undefined, then the result array contains just one String,
// which is the this value (converted to a String). If limit is not undefined,
// then the output array is truncated so that it contains no more than limit
// elements.
// "0".split(undefined, 0) -> []
} else if ('0'.split(void 0, 0).length) {
    StringPrototype.split = function split(separator, limit) {
        if (typeof separator === 'undefined' && limit === 0) { return []; }
        return string_split.call(this, separator, limit);
    };
}

var str_replace = StringPrototype.replace;
var replaceReportsGroupsCorrectly = (function () {
    var groups = [];
    'x'.replace(/x(.)?/g, function (match, group) {
        groups.push(group);
    });
    return groups.length === 1 && typeof groups[0] === 'undefined';
}());

if (!replaceReportsGroupsCorrectly) {
    StringPrototype.replace = function replace(searchValue, replaceValue) {
        var isFn = isCallable(replaceValue);
        var hasCapturingGroups = isRegex(searchValue) && (/\)[*?]/).test(searchValue.source);
        if (!isFn || !hasCapturingGroups) {
            return str_replace.call(this, searchValue, replaceValue);
        } else {
            var wrappedReplaceValue = function (match) {
                var length = arguments.length;
                var originalLastIndex = searchValue.lastIndex;
                searchValue.lastIndex = 0;
                var args = searchValue.exec(match) || [];
                searchValue.lastIndex = originalLastIndex;
                args.push(arguments[length - 2], arguments[length - 1]);
                return replaceValue.apply(this, args);
            };
            return str_replace.call(this, searchValue, wrappedReplaceValue);
        }
    };
}

// ECMA-262, 3rd B.2.3
// Not an ECMAScript standard, although ECMAScript 3rd Edition has a
// non-normative section suggesting uniform semantics and it should be
// normalized across all browsers
// [bugfix, IE lt 9] IE < 9 substr() with negative value not working in IE
var string_substr = StringPrototype.substr;
var hasNegativeSubstrBug = ''.substr && '0b'.substr(-1) !== 'b';
defineProperties(StringPrototype, {
    substr: function substr(start, length) {
        var normalizedStart = start;
        if (start < 0) {
            normalizedStart = Math.max(this.length + start, 0);
        }
        return string_substr.call(this, normalizedStart, length);
    }
}, hasNegativeSubstrBug);

// ES5 15.5.4.20
// whitespace from: http://es5.github.io/#x15.5.4.20
var ws = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
    '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028' +
    '\u2029\uFEFF';
var zeroWidth = '\u200b';
var wsRegexChars = '[' + ws + ']';
var trimBeginRegexp = new RegExp('^' + wsRegexChars + wsRegexChars + '*');
var trimEndRegexp = new RegExp(wsRegexChars + wsRegexChars + '*$');
var hasTrimWhitespaceBug = StringPrototype.trim && (ws.trim() || !zeroWidth.trim());
defineProperties(StringPrototype, {
    // http://blog.stevenlevithan.com/archives/faster-trim-javascript
    // http://perfectionkills.com/whitespace-deviations/
    trim: function trim() {
        if (typeof this === 'undefined' || this === null) {
            throw new TypeError("can't convert " + this + ' to object');
        }
        return String(this).replace(trimBeginRegexp, '').replace(trimEndRegexp, '');
    }
}, hasTrimWhitespaceBug);

// ES-5 15.1.2.2
if (parseInt(ws + '08') !== 8 || parseInt(ws + '0x16') !== 22) {
    /* global parseInt: true */
    parseInt = (function (origParseInt) {
        var hexRegex = /^0[xX]/;
        return function parseInt(str, radix) {
            var string = String(str).trim();
            var defaultedRadix = Number(radix) || (hexRegex.test(string) ? 16 : 10);
            return origParseInt(string, defaultedRadix);
        };
    }(parseInt));
}

}));

/*!
 * https://github.com/es-shims/es5-shim
 * @license es5-shim Copyright 2009-2015 by contributors, MIT License
 * see https://github.com/es-shims/es5-shim/blob/master/LICENSE
 */

// vim: ts=4 sts=4 sw=4 expandtab

// Add semicolon to prevent IIFE from being passed as argument to concatenated code.
;

// UMD (Universal Module Definition)
// see https://github.com/umdjs/umd/blob/master/returnExports.js
(function (root, factory) {
    'use strict';

    /* global define, exports, module */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
  }
}(this, function () {

var call = Function.prototype.call;
var prototypeOfObject = Object.prototype;
var owns = call.bind(prototypeOfObject.hasOwnProperty);

// If JS engine supports accessors creating shortcuts.
var defineGetter;
var defineSetter;
var lookupGetter;
var lookupSetter;
var supportsAccessors = owns(prototypeOfObject, '__defineGetter__');
if (supportsAccessors) {
    /* eslint-disable no-underscore-dangle */
    defineGetter = call.bind(prototypeOfObject.__defineGetter__);
    defineSetter = call.bind(prototypeOfObject.__defineSetter__);
    lookupGetter = call.bind(prototypeOfObject.__lookupGetter__);
    lookupSetter = call.bind(prototypeOfObject.__lookupSetter__);
    /* eslint-enable no-underscore-dangle */
}

// ES5 15.2.3.2
// http://es5.github.com/#x15.2.3.2
if (!Object.getPrototypeOf) {
    // https://github.com/es-shims/es5-shim/issues#issue/2
    // http://ejohn.org/blog/objectgetprototypeof/
    // recommended by fschaefer on github
    //
    // sure, and webreflection says ^_^
    // ... this will nerever possibly return null
    // ... Opera Mini breaks here with infinite loops
    Object.getPrototypeOf = function getPrototypeOf(object) {
        /* eslint-disable no-proto */
        var proto = object.__proto__;
        /* eslint-enable no-proto */
        if (proto || proto === null) {
            return proto;
        } else if (object.constructor) {
            return object.constructor.prototype;
        } else {
            return prototypeOfObject;
        }
    };
}

// ES5 15.2.3.3
// http://es5.github.com/#x15.2.3.3

var doesGetOwnPropertyDescriptorWork = function doesGetOwnPropertyDescriptorWork(object) {
    try {
        object.sentinel = 0;
        return Object.getOwnPropertyDescriptor(object, 'sentinel').value === 0;
    } catch (exception) {
        return false;
    }
};

// check whether getOwnPropertyDescriptor works if it's given. Otherwise, shim partially.
if (Object.defineProperty) {
    var getOwnPropertyDescriptorWorksOnObject = doesGetOwnPropertyDescriptorWork({});
    var getOwnPropertyDescriptorWorksOnDom = typeof document === 'undefined' ||
    doesGetOwnPropertyDescriptorWork(document.createElement('div'));
    if (!getOwnPropertyDescriptorWorksOnDom || !getOwnPropertyDescriptorWorksOnObject) {
        var getOwnPropertyDescriptorFallback = Object.getOwnPropertyDescriptor;
    }
}

if (!Object.getOwnPropertyDescriptor || getOwnPropertyDescriptorFallback) {
    var ERR_NON_OBJECT = 'Object.getOwnPropertyDescriptor called on a non-object: ';

    /* eslint-disable no-proto */
    Object.getOwnPropertyDescriptor = function getOwnPropertyDescriptor(object, property) {
        if ((typeof object !== 'object' && typeof object !== 'function') || object === null) {
            throw new TypeError(ERR_NON_OBJECT + object);
        }

        // make a valiant attempt to use the real getOwnPropertyDescriptor
        // for I8's DOM elements.
        if (getOwnPropertyDescriptorFallback) {
            try {
                return getOwnPropertyDescriptorFallback.call(Object, object, property);
            } catch (exception) {
                // try the shim if the real one doesn't work
            }
        }

        var descriptor;

        // If object does not owns property return undefined immediately.
        if (!owns(object, property)) {
            return descriptor;
        }

        // If object has a property then it's for sure both `enumerable` and
        // `configurable`.
        descriptor = { enumerable: true, configurable: true };

        // If JS engine supports accessor properties then property may be a
        // getter or setter.
        if (supportsAccessors) {
            // Unfortunately `__lookupGetter__` will return a getter even
            // if object has own non getter property along with a same named
            // inherited getter. To avoid misbehavior we temporary remove
            // `__proto__` so that `__lookupGetter__` will return getter only
            // if it's owned by an object.
            var prototype = object.__proto__;
            var notPrototypeOfObject = object !== prototypeOfObject;
            // avoid recursion problem, breaking in Opera Mini when
            // Object.getOwnPropertyDescriptor(Object.prototype, 'toString')
            // or any other Object.prototype accessor
            if (notPrototypeOfObject) {
                object.__proto__ = prototypeOfObject;
            }

            var getter = lookupGetter(object, property);
            var setter = lookupSetter(object, property);

            if (notPrototypeOfObject) {
                // Once we have getter and setter we can put values back.
                object.__proto__ = prototype;
            }

            if (getter || setter) {
                if (getter) {
                    descriptor.get = getter;
                }
                if (setter) {
                    descriptor.set = setter;
                }
                // If it was accessor property we're done and return here
                // in order to avoid adding `value` to the descriptor.
                return descriptor;
            }
        }

        // If we got this far we know that object has an own property that is
        // not an accessor so we set it as a value and return descriptor.
        descriptor.value = object[property];
        descriptor.writable = true;
        return descriptor;
    };
    /* eslint-enable no-proto */
}

// ES5 15.2.3.4
// http://es5.github.com/#x15.2.3.4
if (!Object.getOwnPropertyNames) {
    Object.getOwnPropertyNames = function getOwnPropertyNames(object) {
        return Object.keys(object);
    };
}

// ES5 15.2.3.5
// http://es5.github.com/#x15.2.3.5
if (!Object.create) {

    // Contributed by Brandon Benvie, October, 2012
    var createEmpty;
    var supportsProto = !({ __proto__: null } instanceof Object);
                        // the following produces false positives
                        // in Opera Mini => not a reliable check
                        // Object.prototype.__proto__ === null

    // Check for document.domain and active x support
    // No need to use active x approach when document.domain is not set
    // see https://github.com/es-shims/es5-shim/issues/150
    // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
    /* global ActiveXObject */
    var shouldUseActiveX = function shouldUseActiveX() {
        // return early if document.domain not set
        if (!document.domain) {
            return false;
        }

        try {
            return !!new ActiveXObject('htmlfile');
        } catch (exception) {
            return false;
        }
    };

    // This supports IE8 when document.domain is used
    // see https://github.com/es-shims/es5-shim/issues/150
    // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
    var getEmptyViaActiveX = function getEmptyViaActiveX() {
        var empty;
        var xDoc;

        xDoc = new ActiveXObject('htmlfile');

        xDoc.write('<script><\/script>');
        xDoc.close();

        empty = xDoc.parentWindow.Object.prototype;
        xDoc = null;

        return empty;
    };

    // The original implementation using an iframe
    // before the activex approach was added
    // see https://github.com/es-shims/es5-shim/issues/150
    var getEmptyViaIFrame = function getEmptyViaIFrame() {
        var iframe = document.createElement('iframe');
        var parent = document.body || document.documentElement;
        var empty;

        iframe.style.display = 'none';
        parent.appendChild(iframe);
        /* eslint-disable no-script-url */
        iframe.src = 'javascript:';
        /* eslint-enable no-script-url */

        empty = iframe.contentWindow.Object.prototype;
        parent.removeChild(iframe);
        iframe = null;

        return empty;
    };

    /* global document */
    if (supportsProto || typeof document === 'undefined') {
        createEmpty = function () {
            return { __proto__: null };
        };
    } else {
        // In old IE __proto__ can't be used to manually set `null`, nor does
        // any other method exist to make an object that inherits from nothing,
        // aside from Object.prototype itself. Instead, create a new global
        // object and *steal* its Object.prototype and strip it bare. This is
        // used as the prototype to create nullary objects.
        createEmpty = function () {
            // Determine which approach to use
            // see https://github.com/es-shims/es5-shim/issues/150
            var empty = shouldUseActiveX() ? getEmptyViaActiveX() : getEmptyViaIFrame();

            delete empty.constructor;
            delete empty.hasOwnProperty;
            delete empty.propertyIsEnumerable;
            delete empty.isPrototypeOf;
            delete empty.toLocaleString;
            delete empty.toString;
            delete empty.valueOf;
            /* eslint-disable no-proto */
            empty.__proto__ = null;
            /* eslint-enable no-proto */

            var Empty = function Empty() {};
            Empty.prototype = empty;
            // short-circuit future calls
            createEmpty = function () {
                return new Empty();
            };
            return new Empty();
        };
    }

    Object.create = function create(prototype, properties) {

        var object;
        var Type = function Type() {}; // An empty constructor.

        if (prototype === null) {
            object = createEmpty();
        } else {
            if (typeof prototype !== 'object' && typeof prototype !== 'function') {
                // In the native implementation `parent` can be `null`
                // OR *any* `instanceof Object`  (Object|Function|Array|RegExp|etc)
                // Use `typeof` tho, b/c in old IE, DOM elements are not `instanceof Object`
                // like they are in modern browsers. Using `Object.create` on DOM elements
                // is...err...probably inappropriate, but the native version allows for it.
                throw new TypeError('Object prototype may only be an Object or null'); // same msg as Chrome
            }
            Type.prototype = prototype;
            object = new Type();
            // IE has no built-in implementation of `Object.getPrototypeOf`
            // neither `__proto__`, but this manually setting `__proto__` will
            // guarantee that `Object.getPrototypeOf` will work as expected with
            // objects created using `Object.create`
            /* eslint-disable no-proto */
            object.__proto__ = prototype;
            /* eslint-enable no-proto */
        }

        if (properties !== void 0) {
            Object.defineProperties(object, properties);
        }

        return object;
    };
}

// ES5 15.2.3.6
// http://es5.github.com/#x15.2.3.6

// Patch for WebKit and IE8 standard mode
// Designed by hax <hax.github.com>
// related issue: https://github.com/es-shims/es5-shim/issues#issue/5
// IE8 Reference:
//     http://msdn.microsoft.com/en-us/library/dd282900.aspx
//     http://msdn.microsoft.com/en-us/library/dd229916.aspx
// WebKit Bugs:
//     https://bugs.webkit.org/show_bug.cgi?id=36423

var doesDefinePropertyWork = function doesDefinePropertyWork(object) {
    try {
        Object.defineProperty(object, 'sentinel', {});
        return 'sentinel' in object;
    } catch (exception) {
        return false;
    }
};

// check whether defineProperty works if it's given. Otherwise,
// shim partially.
if (Object.defineProperty) {
    var definePropertyWorksOnObject = doesDefinePropertyWork({});
    var definePropertyWorksOnDom = typeof document === 'undefined' ||
        doesDefinePropertyWork(document.createElement('div'));
    if (!definePropertyWorksOnObject || !definePropertyWorksOnDom) {
        var definePropertyFallback = Object.defineProperty,
            definePropertiesFallback = Object.defineProperties;
    }
}

if (!Object.defineProperty || definePropertyFallback) {
    var ERR_NON_OBJECT_DESCRIPTOR = 'Property description must be an object: ';
    var ERR_NON_OBJECT_TARGET = 'Object.defineProperty called on non-object: ';
    var ERR_ACCESSORS_NOT_SUPPORTED = 'getters & setters can not be defined on this javascript engine';

    Object.defineProperty = function defineProperty(object, property, descriptor) {
        if ((typeof object !== 'object' && typeof object !== 'function') || object === null) {
            throw new TypeError(ERR_NON_OBJECT_TARGET + object);
        }
        if ((typeof descriptor !== 'object' && typeof descriptor !== 'function') || descriptor === null) {
            throw new TypeError(ERR_NON_OBJECT_DESCRIPTOR + descriptor);
        }
        // make a valiant attempt to use the real defineProperty
        // for I8's DOM elements.
        if (definePropertyFallback) {
            try {
                return definePropertyFallback.call(Object, object, property, descriptor);
            } catch (exception) {
                // try the shim if the real one doesn't work
            }
        }

        // If it's a data property.
        if ('value' in descriptor) {
            // fail silently if 'writable', 'enumerable', or 'configurable'
            // are requested but not supported
            /*
            // alternate approach:
            if ( // can't implement these features; allow false but not true
                ('writable' in descriptor && !descriptor.writable) ||
                ('enumerable' in descriptor && !descriptor.enumerable) ||
                ('configurable' in descriptor && !descriptor.configurable)
            ))
                throw new RangeError(
                    'This implementation of Object.defineProperty does not support configurable, enumerable, or writable.'
                );
            */

            if (supportsAccessors && (lookupGetter(object, property) || lookupSetter(object, property))) {
                // As accessors are supported only on engines implementing
                // `__proto__` we can safely override `__proto__` while defining
                // a property to make sure that we don't hit an inherited
                // accessor.
                /* eslint-disable no-proto */
                var prototype = object.__proto__;
                object.__proto__ = prototypeOfObject;
                // Deleting a property anyway since getter / setter may be
                // defined on object itself.
                delete object[property];
                object[property] = descriptor.value;
                // Setting original `__proto__` back now.
                object.__proto__ = prototype;
                /* eslint-enable no-proto */
            } else {
                object[property] = descriptor.value;
            }
        } else {
            if (!supportsAccessors) {
                throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
            }
            // If we got that far then getters and setters can be defined !!
            if ('get' in descriptor) {
                defineGetter(object, property, descriptor.get);
            }
            if ('set' in descriptor) {
                defineSetter(object, property, descriptor.set);
            }
        }
        return object;
    };
}

// ES5 15.2.3.7
// http://es5.github.com/#x15.2.3.7
if (!Object.defineProperties || definePropertiesFallback) {
    Object.defineProperties = function defineProperties(object, properties) {
        // make a valiant attempt to use the real defineProperties
        if (definePropertiesFallback) {
            try {
                return definePropertiesFallback.call(Object, object, properties);
            } catch (exception) {
                // try the shim if the real one doesn't work
            }
        }

        Object.keys(properties).forEach(function (property) {
            if (property !== '__proto__') {
                Object.defineProperty(object, property, properties[property]);
            }
        });
        return object;
    };
}

// ES5 15.2.3.8
// http://es5.github.com/#x15.2.3.8
if (!Object.seal) {
    Object.seal = function seal(object) {
        if (Object(object) !== object) {
            throw new TypeError('Object.seal can only be called on Objects.');
        }
        // this is misleading and breaks feature-detection, but
        // allows "securable" code to "gracefully" degrade to working
        // but insecure code.
        return object;
    };
}

// ES5 15.2.3.9
// http://es5.github.com/#x15.2.3.9
if (!Object.freeze) {
    Object.freeze = function freeze(object) {
        if (Object(object) !== object) {
            throw new TypeError('Object.freeze can only be called on Objects.');
        }
        // this is misleading and breaks feature-detection, but
        // allows "securable" code to "gracefully" degrade to working
        // but insecure code.
        return object;
    };
}

// detect a Rhino bug and patch it
try {
    Object.freeze(function () {});
} catch (exception) {
    Object.freeze = (function (freezeObject) {
        return function freeze(object) {
            if (typeof object === 'function') {
                return object;
            } else {
                return freezeObject(object);
            }
        };
    }(Object.freeze));
}

// ES5 15.2.3.10
// http://es5.github.com/#x15.2.3.10
if (!Object.preventExtensions) {
    Object.preventExtensions = function preventExtensions(object) {
        if (Object(object) !== object) {
            throw new TypeError('Object.preventExtensions can only be called on Objects.');
        }
        // this is misleading and breaks feature-detection, but
        // allows "securable" code to "gracefully" degrade to working
        // but insecure code.
        return object;
    };
}

// ES5 15.2.3.11
// http://es5.github.com/#x15.2.3.11
if (!Object.isSealed) {
    Object.isSealed = function isSealed(object) {
        if (Object(object) !== object) {
            throw new TypeError('Object.isSealed can only be called on Objects.');
        }
        return false;
    };
}

// ES5 15.2.3.12
// http://es5.github.com/#x15.2.3.12
if (!Object.isFrozen) {
    Object.isFrozen = function isFrozen(object) {
        if (Object(object) !== object) {
            throw new TypeError('Object.isFrozen can only be called on Objects.');
        }
        return false;
    };
}

// ES5 15.2.3.13
// http://es5.github.com/#x15.2.3.13
if (!Object.isExtensible) {
    Object.isExtensible = function isExtensible(object) {
        // 1. If Type(O) is not Object throw a TypeError exception.
        if (Object(object) !== object) {
            throw new TypeError('Object.isExtensible can only be called on Objects.');
        }
        // 2. Return the Boolean value of the [[Extensible]] internal property of O.
        var name = '';
        while (owns(object, name)) {
            name += '?';
        }
        object[name] = true;
        var returnValue = owns(object, name);
        delete object[name];
        return returnValue;
    };
}

}));

(function() {
var define, requireModule, require, requirejs;

(function() {
  var registry = {}, seen = {};

  define = function(name, deps, callback) {
    registry[name] = { deps: deps, callback: callback };
  };

  requirejs = require = requireModule = function(name) {
  requirejs._eak_seen = registry;

    if (seen[name]) { return seen[name]; }
    seen[name] = {};

    if (!registry[name]) {
      throw new Error("Could not find module " + name);
    }

    var mod = registry[name],
        deps = mod.deps,
        callback = mod.callback,
        reified = [],
        exports;

    for (var i=0, l=deps.length; i<l; i++) {
      if (deps[i] === 'exports') {
        reified.push(exports = {});
      } else {
        reified.push(requireModule(resolve(deps[i])));
      }
    }

    var value = callback.apply(this, reified);
    return seen[name] = exports || value;

    function resolve(child) {
      if (child.charAt(0) !== '.') { return child; }
      var parts = child.split("/");
      var parentBase = name.split("/").slice(0, -1);

      for (var i=0, l=parts.length; i<l; i++) {
        var part = parts[i];

        if (part === '..') { parentBase.pop(); }
        else if (part === '.') { continue; }
        else { parentBase.push(part); }
      }

      return parentBase.join("/");
    }
  };
})();

define("promise/all", 
  ["./utils","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    /* global toString */

    var isArray = __dependency1__.isArray;
    var isFunction = __dependency1__.isFunction;

    /**
      Returns a promise that is fulfilled when all the given promises have been
      fulfilled, or rejected if any of them become rejected. The return promise
      is fulfilled with an array that gives all the values in the order they were
      passed in the `promises` array argument.

      Example:

      ```javascript
      var promise1 = RSVP.resolve(1);
      var promise2 = RSVP.resolve(2);
      var promise3 = RSVP.resolve(3);
      var promises = [ promise1, promise2, promise3 ];

      RSVP.all(promises).then(function(array){
        // The array here would be [ 1, 2, 3 ];
      });
      ```

      If any of the `promises` given to `RSVP.all` are rejected, the first promise
      that is rejected will be given as an argument to the returned promises's
      rejection handler. For example:

      Example:

      ```javascript
      var promise1 = RSVP.resolve(1);
      var promise2 = RSVP.reject(new Error("2"));
      var promise3 = RSVP.reject(new Error("3"));
      var promises = [ promise1, promise2, promise3 ];

      RSVP.all(promises).then(function(array){
        // Code here never runs because there are rejected promises!
      }, function(error) {
        // error.message === "2"
      });
      ```

      @method all
      @for RSVP
      @param {Array} promises
      @param {String} label
      @return {Promise} promise that is fulfilled when all `promises` have been
      fulfilled, or rejected if any of them become rejected.
    */
    function all(promises) {
      /*jshint validthis:true */
      var Promise = this;

      if (!isArray(promises)) {
        throw new TypeError('You must pass an array to all.');
      }

      return new Promise(function(resolve, reject) {
        var results = [], remaining = promises.length,
        promise;

        if (remaining === 0) {
          resolve([]);
        }

        function resolver(index) {
          return function(value) {
            resolveAll(index, value);
          };
        }

        function resolveAll(index, value) {
          results[index] = value;
          if (--remaining === 0) {
            resolve(results);
          }
        }

        for (var i = 0; i < promises.length; i++) {
          promise = promises[i];

          if (promise && isFunction(promise.then)) {
            promise.then(resolver(i), reject);
          } else {
            resolveAll(i, promise);
          }
        }
      });
    }

    __exports__.all = all;
  });
define("promise/asap", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var browserGlobal = (typeof window !== 'undefined') ? window : {};
    var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
    var local = (typeof global !== 'undefined') ? global : (this === undefined? window:this);

    // node
    function useNextTick() {
      return function() {
        process.nextTick(flush);
      };
    }

    function useMutationObserver() {
      var iterations = 0;
      var observer = new BrowserMutationObserver(flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    function useSetTimeout() {
      return function() {
        local.setTimeout(flush, 1);
      };
    }

    var queue = [];
    function flush() {
      for (var i = 0; i < queue.length; i++) {
        var tuple = queue[i];
        var callback = tuple[0], arg = tuple[1];
        callback(arg);
      }
      queue = [];
    }

    var scheduleFlush;

    // Decide what async method to use to triggering processing of queued callbacks:
    if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
      scheduleFlush = useNextTick();
    } else if (BrowserMutationObserver) {
      scheduleFlush = useMutationObserver();
    } else {
      scheduleFlush = useSetTimeout();
    }

    function asap(callback, arg) {
      var length = queue.push([callback, arg]);
      if (length === 1) {
        // If length is 1, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        scheduleFlush();
      }
    }

    __exports__.asap = asap;
  });
define("promise/config", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var config = {
      instrument: false
    };

    function configure(name, value) {
      if (arguments.length === 2) {
        config[name] = value;
      } else {
        return config[name];
      }
    }

    __exports__.config = config;
    __exports__.configure = configure;
  });
define("promise/polyfill", 
  ["./promise","./utils","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    /*global self*/
    var RSVPPromise = __dependency1__.Promise;
    var isFunction = __dependency2__.isFunction;

    function polyfill() {
      var local;

      if (typeof global !== 'undefined') {
        local = global;
      } else if (typeof window !== 'undefined' && window.document) {
        local = window;
      } else {
        local = self;
      }

      var es6PromiseSupport = 
        "Promise" in local &&
        // Some of these methods are missing from
        // Firefox/Chrome experimental implementations
        "resolve" in local.Promise &&
        "reject" in local.Promise &&
        "all" in local.Promise &&
        "race" in local.Promise &&
        // Older version of the spec had a resolver object
        // as the arg rather than a function
        (function() {
          var resolve;
          new local.Promise(function(r) { resolve = r; });
          return isFunction(resolve);
        }());

      if (!es6PromiseSupport) {
        local.Promise = RSVPPromise;
      }
    }

    __exports__.polyfill = polyfill;
  });
define("promise/promise", 
  ["./config","./utils","./all","./race","./resolve","./reject","./asap","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __exports__) {
    "use strict";
    var config = __dependency1__.config;
    var configure = __dependency1__.configure;
    var objectOrFunction = __dependency2__.objectOrFunction;
    var isFunction = __dependency2__.isFunction;
    var now = __dependency2__.now;
    var all = __dependency3__.all;
    var race = __dependency4__.race;
    var staticResolve = __dependency5__.resolve;
    var staticReject = __dependency6__.reject;
    var asap = __dependency7__.asap;

    var counter = 0;

    config.async = asap; // default async is asap;

    function Promise(resolver) {
      if (!isFunction(resolver)) {
        throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
      }

      if (!(this instanceof Promise)) {
        throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
      }

      this._subscribers = [];

      invokeResolver(resolver, this);
    }

    function invokeResolver(resolver, promise) {
      function resolvePromise(value) {
        resolve(promise, value);
      }

      function rejectPromise(reason) {
        reject(promise, reason);
      }

      try {
        resolver(resolvePromise, rejectPromise);
      } catch(e) {
        rejectPromise(e);
      }
    }

    function invokeCallback(settled, promise, callback, detail) {
      var hasCallback = isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        try {
          value = callback(detail);
          succeeded = true;
        } catch(e) {
          failed = true;
          error = e;
        }
      } else {
        value = detail;
        succeeded = true;
      }

      if (handleThenable(promise, value)) {
        return;
      } else if (hasCallback && succeeded) {
        resolve(promise, value);
      } else if (failed) {
        reject(promise, error);
      } else if (settled === FULFILLED) {
        resolve(promise, value);
      } else if (settled === REJECTED) {
        reject(promise, value);
      }
    }

    var PENDING   = void 0;
    var SEALED    = 0;
    var FULFILLED = 1;
    var REJECTED  = 2;

    function subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      subscribers[length] = child;
      subscribers[length + FULFILLED] = onFulfillment;
      subscribers[length + REJECTED]  = onRejection;
    }

    function publish(promise, settled) {
      var child, callback, subscribers = promise._subscribers, detail = promise._detail;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        invokeCallback(settled, child, callback, detail);
      }

      promise._subscribers = null;
    }

    Promise.prototype = {
      constructor: Promise,

      _state: undefined,
      _detail: undefined,
      _subscribers: undefined,

      then: function(onFulfillment, onRejection) {
        var promise = this;

        var thenPromise = new this.constructor(function() {});

        if (this._state) {
          var callbacks = arguments;
          config.async(function invokePromiseCallback() {
            invokeCallback(promise._state, thenPromise, callbacks[promise._state - 1], promise._detail);
          });
        } else {
          subscribe(this, thenPromise, onFulfillment, onRejection);
        }

        return thenPromise;
      },

      'catch': function(onRejection) {
        return this.then(null, onRejection);
      }
    };

    Promise.all = all;
    Promise.race = race;
    Promise.resolve = staticResolve;
    Promise.reject = staticReject;

    function handleThenable(promise, value) {
      var then = null,
      resolved;

      try {
        if (promise === value) {
          throw new TypeError("A promises callback cannot return that same promise.");
        }

        if (objectOrFunction(value)) {
          then = value.then;

          if (isFunction(then)) {
            then.call(value, function(val) {
              if (resolved) { return true; }
              resolved = true;

              if (value !== val) {
                resolve(promise, val);
              } else {
                fulfill(promise, val);
              }
            }, function(val) {
              if (resolved) { return true; }
              resolved = true;

              reject(promise, val);
            });

            return true;
          }
        }
      } catch (error) {
        if (resolved) { return true; }
        reject(promise, error);
        return true;
      }

      return false;
    }

    function resolve(promise, value) {
      if (promise === value) {
        fulfill(promise, value);
      } else if (!handleThenable(promise, value)) {
        fulfill(promise, value);
      }
    }

    function fulfill(promise, value) {
      if (promise._state !== PENDING) { return; }
      promise._state = SEALED;
      promise._detail = value;

      config.async(publishFulfillment, promise);
    }

    function reject(promise, reason) {
      if (promise._state !== PENDING) { return; }
      promise._state = SEALED;
      promise._detail = reason;

      config.async(publishRejection, promise);
    }

    function publishFulfillment(promise) {
      publish(promise, promise._state = FULFILLED);
    }

    function publishRejection(promise) {
      publish(promise, promise._state = REJECTED);
    }

    __exports__.Promise = Promise;
  });
define("promise/race", 
  ["./utils","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    /* global toString */
    var isArray = __dependency1__.isArray;

    /**
      `RSVP.race` allows you to watch a series of promises and act as soon as the
      first promise given to the `promises` argument fulfills or rejects.

      Example:

      ```javascript
      var promise1 = new RSVP.Promise(function(resolve, reject){
        setTimeout(function(){
          resolve("promise 1");
        }, 200);
      });

      var promise2 = new RSVP.Promise(function(resolve, reject){
        setTimeout(function(){
          resolve("promise 2");
        }, 100);
      });

      RSVP.race([promise1, promise2]).then(function(result){
        // result === "promise 2" because it was resolved before promise1
        // was resolved.
      });
      ```

      `RSVP.race` is deterministic in that only the state of the first completed
      promise matters. For example, even if other promises given to the `promises`
      array argument are resolved, but the first completed promise has become
      rejected before the other promises became fulfilled, the returned promise
      will become rejected:

      ```javascript
      var promise1 = new RSVP.Promise(function(resolve, reject){
        setTimeout(function(){
          resolve("promise 1");
        }, 200);
      });

      var promise2 = new RSVP.Promise(function(resolve, reject){
        setTimeout(function(){
          reject(new Error("promise 2"));
        }, 100);
      });

      RSVP.race([promise1, promise2]).then(function(result){
        // Code here never runs because there are rejected promises!
      }, function(reason){
        // reason.message === "promise2" because promise 2 became rejected before
        // promise 1 became fulfilled
      });
      ```

      @method race
      @for RSVP
      @param {Array} promises array of promises to observe
      @param {String} label optional string for describing the promise returned.
      Useful for tooling.
      @return {Promise} a promise that becomes fulfilled with the value the first
      completed promises is resolved with if the first completed promise was
      fulfilled, or rejected with the reason that the first completed promise
      was rejected with.
    */
    function race(promises) {
      /*jshint validthis:true */
      var Promise = this;

      if (!isArray(promises)) {
        throw new TypeError('You must pass an array to race.');
      }
      return new Promise(function(resolve, reject) {
        var results = [], promise;

        for (var i = 0; i < promises.length; i++) {
          promise = promises[i];

          if (promise && typeof promise.then === 'function') {
            promise.then(resolve, reject);
          } else {
            resolve(promise);
          }
        }
      });
    }

    __exports__.race = race;
  });
define("promise/reject", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /**
      `RSVP.reject` returns a promise that will become rejected with the passed
      `reason`. `RSVP.reject` is essentially shorthand for the following:

      ```javascript
      var promise = new RSVP.Promise(function(resolve, reject){
        reject(new Error('WHOOPS'));
      });

      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```

      Instead of writing the above, your code now simply becomes the following:

      ```javascript
      var promise = RSVP.reject(new Error('WHOOPS'));

      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```

      @method reject
      @for RSVP
      @param {Any} reason value that the returned promise will be rejected with.
      @param {String} label optional string for identifying the returned promise.
      Useful for tooling.
      @return {Promise} a promise that will become rejected with the given
      `reason`.
    */
    function reject(reason) {
      /*jshint validthis:true */
      var Promise = this;

      return new Promise(function (resolve, reject) {
        reject(reason);
      });
    }

    __exports__.reject = reject;
  });
define("promise/resolve", 
  ["exports"],
  function(__exports__) {
    "use strict";
    function resolve(value) {
      /*jshint validthis:true */
      if (value && typeof value === 'object' && value.constructor === this) {
        return value;
      }

      var Promise = this;

      return new Promise(function(resolve) {
        resolve(value);
      });
    }

    __exports__.resolve = resolve;
  });
define("promise/utils", 
  ["exports"],
  function(__exports__) {
    "use strict";
    function objectOrFunction(x) {
      return isFunction(x) || (typeof x === "object" && x !== null);
    }

    function isFunction(x) {
      return typeof x === "function";
    }

    function isArray(x) {
      return Object.prototype.toString.call(x) === "[object Array]";
    }

    // Date.now is not available in browsers < IE9
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now#Compatibility
    var now = Date.now || function() { return new Date().getTime(); };


    __exports__.objectOrFunction = objectOrFunction;
    __exports__.isFunction = isFunction;
    __exports__.isArray = isArray;
    __exports__.now = now;
  });
requireModule('promise/polyfill').polyfill();
}());
var ozpIwc = ozpIwc || {};

/**
 * @module ozpIwc
 */

/**
 * @class util
 * @namespace ozpIwc
 * @static
 */
ozpIwc.util = (function (util) {

  /**
   * @param  {Object} globalScope
   * @static
   * @return {Object} reference to global scope, works in node,browser,workers.
   */
    util.globalScope = (function(){
      return this;
    })();


    /**
     * Generates a large hexidecimal string to serve as a unique ID.  Not a guid.
     *
     * @method generateId
     * @static
     * @return {String}
     */
    util.generateId = function () {
        return Math.floor(Math.random() * 0xffffffff).toString(16);
    };

    /**
     * Used to get the current epoch time.  Tests overrides this
     * to allow a fast-forward on time-based actions.
     *
     * @method now
     * @return {Number}
     */
    util.now = function () {
        return new Date().getTime();
    };

    /**
     * Applies the template using the supplied object for values
     *
     * @method resolveUriTemplate
     * @param {string} template The template to use
     * @param {Object} obj The object to get template paramters from
     * @param {Object} fallback A secondary object for parameters not contained by the first
     * @return {Number}
     */
    util.resolveUriTemplate = function (template, obj, fallback) {
        var converters = {
            "+": function (a) { return a;},
            "": function (a) { return encodeURIComponent(a);}
        };
        var t = template.replace(/\{([\+\#\.\/\;\?\&]?)(.+?)\}/g, function (match, type, name) {
            return converters[type](obj[name] || fallback[name]);
        });
        // look for the :// of the protocol
        var protocolOffset = t.indexOf("://");
        // if we found it, set the offset to the end.  otherwise, leave it
        // at -1 so that a leading "//" will be replaced, below
        if (protocolOffset > 0) {
            protocolOffset += 3;
        }

        // remove double // that show up after the protocolOffset
        return t.replace(/\/\//g, function (m, offset) {
            // only swap it after the protocol
            if (offset > protocolOffset) {
                return "/";
            } else {
                return m;
            }
        });
    };

    /**
     * A record of event listeners used in the given IWC context. Grouped by type.
     *
     * @property eventListeners
     * @static
     * @type {Object}
     */
    util.eventListeners = {};

    /**
     * Adds an event listener to the window and stores its listener in ozpIwc.util.eventListeners.
     *
     * @method addEventListener
     * @param {String} type the event to listen to
     * @param {Function} listener the callback to be used upon the event being emitted
     */
    util.addEventListener = function (type, listener) {
        var l = util.eventListeners[type];
        if (!l) {
            l = util.eventListeners[type] = [];
        }
        l.push(listener);
        util.globalScope.addEventListener(type, listener);
    };

    /**
     * Removes an event listener from the window and from ozpIwc.util.eventListeners
     * @param {String} type the event to remove the listener from
     * @param {Function} listener the callback to unregister
     */
    util.removeEventListener = function (type, listener) {
        var l = util.eventListeners[type];
        if (l) {
            util.eventListeners[type] = l.filter(function (v) { return v !== listener;});
        }
        util.globalScope.removeEventListener(type, listener);
    };

    /**
     * Removes all event listeners registered in ozpIwc.util.eventListeners
     * @param {String} type the event to remove the listener from
     * @param {Function} listener the callback to unregister
     * @param {Boolean} [useCapture] if true all events of the specified type will be dispatched to the registered
     *     listener before being dispatched to any EventTarget beneath it in the DOM tree. Events which are bubbling
     *     upward through the tree will not trigger a listener designated to use capture.
     */
    util.purgeEventListeners = function () {
        ozpIwc.util.object.eachEntry(util.eventListeners, function (type, listenerList) {
            listenerList.forEach(function (listener) {
                util.globalScope.removeEventListener(type, listener);
            });
        });
        util.eventListeners = {};
    };

    /**
     * Create a class with the given parent in it's prototype chain.
     *
     * @method extend
     * @param {Function} baseClass The class being derived from.
     * @param {Function} newConstructor The new base class.
     *
     * @return {Function} New Constructor with an augmented prototype.
     */
    util.extend = function (baseClass, newConstructor) {
        if (!baseClass || !baseClass.prototype) {
            ozpIwc.log.error("Cannot create a new class for ", newConstructor, " due to invalid baseclass:", baseClass);
            throw new Error("Cannot create a new class due to invalid baseClass.  Dependency not loaded first?");
        }
        newConstructor.prototype = Object.create(baseClass.prototype);
        newConstructor.prototype.constructor = newConstructor;
        return newConstructor;
    };

    /**
     * Invoke postMessage on a given window in a safe manner. Test whether the browser
     * supports structured clones, and stringifies the message if not. Catches
     * errors (especially attempts to send non-cloneable objects), and tries to
     * send a stringified copy of the message asa fallback.
     *
     * @param toWindow a window on which to invoke postMessage
     * @param msg the message to be sent
     * @param origin the target origin. The message will be sent only if it matches the origin of window.
     */
    util.safePostMessage = function (toWindow, msg, origin) {
        try {
            var data = msg;
            if (!util.structuredCloneSupport && typeof data !== 'string') {
                data = JSON.stringify(msg);
            }
            toWindow.postMessage(data, origin);
        } catch (e) {
            try {
                toWindow.postMessage(JSON.stringify(msg), origin);
            } catch (e) {
                ozpIwc.log.debug("Invalid call to postMessage: " + e.message);
            }
        }
    };


    /**
     * Detect browser support for structured clones. Returns quickly since it
     * caches the result. This method only determines browser support for structured
     * clones. Clients are responsible, when accessing capabilities that rely on structured
     * cloning, to ensure that objects to be cloned meet the criteria of the structured clone
     * algorithm. (See ozpIwc.util.safePostMessage for a method which handles attempts to
     * clone an invalid object.). NB: a bug in FF will cause file objects to be treated as
     * non-cloneable, even in FF versions that support structured clones.
     * (see https://bugzilla.mozilla.org/show_bug.cgi?id=722126).
     *
     * @private
     * @property {Boolean} structuredCloneSupport
     */
    util.structuredCloneSupport = (function () {
        var cloneSupport = 'postMessage' in util.globalScope;
        //If the browser doesn't support structured clones, it will call toString() on the object passed to postMessage.
        try {
            util.globalScope.postMessage({
                toString: function () {
                    cloneSupport = false;
                }
            }, "*");
        } catch (e) {
            //exception expected: objects with methods can't be cloned
            //e.DATA_CLONE_ERR will exist only for browsers with structured clone support, which can be used as an
            // additional check if needed
        }
        return cloneSupport;
    }());

    /**
     * Does a deep clone of a serializable object.  Note that this will not
     * clone unserializable objects like DOM elements, Date, RegExp, etc.
     *
     * @method clone
     * @param {Array|Object} value The value to be cloned.
     * @return {Array|Object}  a deep copy of the object
     */
    util.clone = function (value) {
        if (Array.isArray(value) || typeof(value) === 'object') {
            try {
                return JSON.parse(JSON.stringify(value));
            } catch (e) {
                ozpIwc.log.error(e);
            }
        } else {
            return value;
        }
    };

    /**
     * A regex method to parse query parameters.
     *
     * @method parseQueryParams
     * @param {String} query
     *
     */
    util.parseQueryParams = function (query) {
        query = query || util.globalScope.location.search;
        var params = {};
        var regex = /\??([^&=]+)=?([^&]*)/g;
        var match;
        while ((match = regex.exec(query)) !== null) {
            params[match[1]] = decodeURIComponent(match[2]);
        }
        return params;
    };

    /**
     * Adds params to the query string of the given url. Accepts objects, preformed query strings, and arrays of query
     * params.
     *
     * @method addQueryParams
     * @param {String} url
     * @param {String|Object|Array} params
     * @return {String}
     */
    util.addQueryParams = function (url, params) {
        if (typeof url !== "string") {
            throw new Error("url should be a string.");
        }

        var formattedParams = {};
        switch (typeof params) {
            case "object":
                // if in array form ["a=true","b=en_us",...]
                if (Array.isArray(params)) {
                    if (params.length === 0) {
                        return url;
                    }
                    for (var i in params) {
                        if (typeof params[i] === "string") {
                            var p = util.parseQueryParams(params[i]);
                            for (var j in p) {
                                formattedParams[j] = p[j];
                            }
                        }
                    }
                } else {
                    if (Object.keys(params).length === 0) {
                        return url;
                    }
                    // if in object form {a:true, b:"en_us",...}
                    formattedParams = params;
                }
                break;
            case "undefined":
                return url;

            default:
                if (params.length === 0) {
                    return url;
                }
                // if in string form "?a=true&b=en_us&..."
                formattedParams = util.parseQueryParams(params);
                break;
        }
        var hash = "";
        // Separate the hash temporarily (if exists)
        var hashSplit = url.split("#");
        if (hashSplit.length > 2) {
            throw new Error("Invalid url.");
        } else {
            url = hashSplit[0];
            hash = hashSplit[1] || "";
        }

        //if the url has no query params  we append the initial "?"
        if (url.indexOf("?") === -1) {
            url += "?";
        } else {
            url += "&";
        }
        //skip on first iteration
        var ampersand = "";
        for (var k in formattedParams) {
            url += ampersand + k + "=" + formattedParams[k];
            ampersand = "&";
        }

        if (hash.length > 0) {
            url += "#" + hash;
        }

        return url;
    };

    /**
     * A mapping for common protocols and their ports.
     * @property protocolPorts
     * @type {Object}
     */
    util.protocolPorts = {
        "http:": "80",
        "https:": "443",
        "ws:": "80",
        "wss:": "443"
    };

    /**
     * Determines the origin of a given url.
     * @method determineOrigin
     * @param url
     * @return {String}
     */
    util.determineOrigin = function (url) {
        var a = document.createElement("a");
        a.href = url;
        if (a.origin) {
            return a.origin;
        }
        var origin = a.protocol + "//" + a.hostname;
        /* Internet Explorer adds the port to urls in <a> tags created by a script, even
         * if it wasn't there to start with.  Thanks, IE!
         * https://connect.microsoft.com/IE/feedback/details/817343/ie11-scripting-value-of-htmlanchorelement-host-differs-between-script-created-link-and-link-from-document
         *
         * Other browsers seem to drop the port if it's the default, so we'll do the same.
         */

        if (a.port && util.protocolPorts[a.protocol] !== a.port) {
            origin += ":" + a.port;
        }
        return origin;
    };

    /**
     * Escapes regular expression characters in a string.
     * @method escapeRegex
     * @param {String} str
     * @return {String}
     */
    util.escapeRegex = function (str) {
        return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    };

    /**
     *
     * @method parseOzpUrl
     * @param {type} url
     * @return {ozpIwc.packet.Transport}
     */
    util.parseOzpUrl = function (url) {
        var m = /^(?:(?:web\+ozp|ozp):\/\/)?([0-9a-zA-Z](?:[-.\w])*)(\/[^?#]*)(\?[^#]*)?(#.*)?$/.exec(decodeURIComponent(url));
        if (m) {
            // an action of "get" is implied
            var packet = {
                'dst': m[1],
                'resource': m[2],
                'action': "get"
            };
            // TODO: parse the query params into fields

            return packet;
        }
        return null;
    };

    /**
     * Returns true if the specified packet meets the criteria of an IWC Packet.
     * @method isIwcPacket
     * @static
     * @param {ozpIwc.packet.Transport} packet
     * @return {Boolean}
     */
    util.isIWCPacket = function (packet) {
        if (typeof packet.src !== "string" || typeof packet.dst !== "string" ||
            typeof packet.ver !== "number" || typeof packet.msgId !== "string") {
            return false;
        } else {
            return true;
        }
    };

    /**
     * Returns the version of Internet Explorer or a -1
     * (indicating the use of another browser).
     * @return {number}
     */
    util.getInternetExplorerVersion = function () {
        var rv = -1; // Return value assumes failure.
        var ua, re;
        if (navigator.appName === 'Microsoft Internet Explorer') {
            ua = navigator.userAgent;
            re = /MSIE ([0-9]{1,}[\.0-9]{0,})/;
            if (re.exec(ua) !== null) {
                rv = parseFloat(RegExp.$1);
            }
        } else if (navigator.appName === 'Netscape') {
            ua = navigator.userAgent;
            re = /Trident\/.*rv:([0-9]{1,}[\.0-9]{0,})/;
            if (re.exec(ua) !== null) {
                rv = parseFloat(RegExp.$1);
            }
        }
        return rv;
    };

    /**
     * A promise that resolves when the document is past its prerender state.
     * @method prerender
     * @static
     * @return {Promise}
     */
    util.prerender = function () {
        if (util.runningInWorker) {
            return Promise.resolve();
        }

        return new Promise(function (resolve, reject) {
            if (document === undefined || document.visibilityState === undefined || (document.visibilityState !== "prerender" &&
                document.visibilityState !== "unload")) {
                resolve();
            } else {
                document.addEventListener("visibilitychange", function runOnce(e) {
                    if (document.visibilityState !== "prerender") {
                        document.removeEventListener(runOnce);
                        resolve();
                    }
                });
            }
        });
    };

    /**
     * A utility to determine if this code is running in a HTML5 Worker. Used to decide on browser technologies
     * to use.
     * @property {Boolean} runningInWorker
     * @static
     */
    util.runningInWorker = (typeof WorkerGlobalScope !== 'undefined' &&
            this instanceof WorkerGlobalScope);

    /**
     * Wraps window.open.  If the bus is running in a worker, then
     * it doesn't have access to the window object and needs help from
     * a participant.
     * @see window.open documentation for what the parameters actually do
     *
     * @method openWindow
     * @static
     * @param {String} url The URL to open in a new window
     * @param {String} windowName The window name to open with.
     * @param {String} [features] The window features.
     */
    util.openWindow = function (url, windowName, features) {
        if (typeof windowName === "object") {
            var str = "";
            for (var k in windowName) {
                str += k + "=" + encodeURIComponent(windowName[k]) + "&";
            }
            windowName = str;
        }
        try {
            util.globalScope.open(url, windowName, features);
        } catch (e) {
            //fallback for IE
            util.globalScope.open(url + "?" + windowName, null, features);
        }
    };

    /**
     * Returns a promise that will resolve after the given delay with any additional arguments passed
     * @param {Number} delay miliseconds to delay
     * @returns {Promise}
     */
    util.promiseDelay = function (delay) {
        return new Promise(function (res) {
            setTimeout(function () { res();}, delay);
        });
    };

    /**
     * Returns the specified default value if the given value is undefined. safer than "x = x || 500" because it checks
     * for being defined, rather than its truly/falsey value.

     * @method ifUndef
     * @static
     * @param {*} value
     * @param {*} defaultVal
     * @return {*}
     */
    util.ifUndef = function (value, defaultVal) {
        return (typeof value === 'undefined') ? defaultVal : value;
    };

    /**
     * IE 10 does not play well gathering location.origin.
     * 
     * @method getOrigin
     * @static
     * @return {String} The origin this script is running in
     */
    util.getOrigin = function() {
        if (!location.origin) {
          return location.protocol + "//" + location.hostname + (location.port ? ':' + location.port: '');
        }
        return location.origin;
    };
    return util;
}(ozpIwc.util || {}));

var ozpIwc = ozpIwc || {};

/**
 * @module ozpIwc
 */

/**
 * A Static collection of api to address/actions mapping.
 *
 * @class apiMap
 * @namespace ozpIwc
 * @static
 * @type {Object}
 */
ozpIwc.apiMap = {
    /**
     * @property data.api
     * @type Object
     */
    "data.api": {
        'address': 'data.api',
        'actions': ["get", "set", "delete", "watch", "unwatch", "list", "bulkGet", "collect", "addChild", "removeChild"]
    },

    /**
     * @property intents.api
     * @type Object
     */
    "intents.api": {
        'address': 'intents.api',
        'actions': ["get", "set", "delete", "watch", "unwatch", "list", "bulkGet", "collect", "register", "invoke", "broadcast"]
    },

    /**
     * @property names.api
     * @type Object
     */
    "names.api": {
        'address': 'names.api',
        'actions': ["get", "set", "delete", "watch", "unwatch", "list", "bulkGet", "collect"]
    },

    /**
     * @property system.api
     * @type Object
     */
    "system.api": {
        'address': 'system.api',
        'actions': ["get", "set", "delete", "watch", "unwatch", "list", "bulkGet", "collect", "launch"]
    },

    /**
     * @property locks.api
     * @type Object
     */
    "locks.api": {
        'address': 'locks.api',
        'actions': ["get", "watch", "unwatch", "list", "lock", "unlock", "collect", "bulkGet"]
    }
};

var ozpIwc = ozpIwc || {};
ozpIwc.util = ozpIwc.util || {};

/**
 * @module ozpIwc
 * @submodule ozpIwc.util
 */

ozpIwc.util.ApiPromiseMixin = (function (apiMap, log, util) {
    /**
     * @class ApiPromiseMixin
     * @namespace ozpIwc.util
     * @static
     * Augments a participant or connection that supports basic IWC communications
     * functions for sending and receiving.
     * @uses ozpIwc.util.Event
     * @param {ozpIwc.transport.participant.Base} participant
     * @param {Boolean} autoConnect
     */
    var ApiPromiseMixin = function (participant, autoConnect) {
        autoConnect = (typeof autoConnect === "undefined" || autoConnect);

        participant.address = participant.address || "$nobody";
        participant.connect = participant.connect || function () {
                participant.connectPromise = Promise.resolve();
                return participant.connectPromise;
            };

        if (!participant.events) {
            participant.events = new util.Event();
            participant.events.mixinOnOff(participant);
        }

        var mixins = ApiPromiseMixin.getCore();
        for (var i in mixins) {
            participant[i] = mixins[i];
        }

        participant.readLaunchParams(util.globalScope.name);
        participant.readLaunchParams(util.globalScope.location.search);
        participant.readLaunchParams(util.globalScope.location.hash);

        ApiPromiseMixin.registerEvents(participant);

        participant.constructApiFunctions();

        if (autoConnect) {
            participant.connect().catch(function(err) {
                // Supress the error here, the application will get it from its
                // connect() call.
            });
        }
    };

    /**
     * Registers event listeners for the participant.  Listens for the following events: disconnect.
     * @method registerEvents
     * @static
     * @param {ozpIwc.transport.participant.Base} participant
     */
    ApiPromiseMixin.registerEvents = function (participant) {
        participant.on("disconnect", function () {
            participant.promiseCallbacks = {};
            participant.registeredCallbacks = {};
            util.globalScope.removeEventListener("message", participant.postMessageHandler, false);
            participant.connectPromise = null;
        });
    };

    /**
     * A factory for the apiPromise functionality.
     *
     * @method getCore
     * @static
     * @return {Object}
     */
    ApiPromiseMixin.getCore = function () {
        return {

            /**
             * @property promiseCallbacks
             * @type Object
             * @default {}
             */
            promiseCallbacks: {},

            /**
             * @property msgIdSequence
             * @type Number
             * @default 0
             */
            msgIdSequence: 0,

            /**
             * @property receivedPackets
             * @type Number
             * @default 0
             */
            receivedPackets: 0,

            /**
             * @property receivedBytes
             * @type Number
             * @default 0
             */
            receivedBytes: 0,

            /**
             * @property sentPackets
             * @type Number
             * @default 0
             */
            sentPackets: 0,

            /**
             * @property sentBytes
             * @type Number
             * @default 0
             */
            sentBytes: 0,

            /**
             * The epoch time the Client was instantiated.
             * @property startTime
             * @type Number
             */
            startTime: util.now(),

            /**
             * A map of available apis and their actions.
             * @property apiMap
             * @type Object
             */
            apiMap: apiMap || {},

            /**
             * @property wrapperMap
             * @type Object
             * @default {}
             */
            wrapperMap: {},

            /**
             * @property preconnectionQueue
             * @type Array
             * @default []
             */
            preconnectionQueue: [],

            /**
             * @property launchParams
             * @type Object
             * @default {}
             */
            launchParams: {},

            /**
             * @property watchMsgMap
             * @type Object
             * @default {}
             */
            watchMsgMap: {},

            /**
             * @property registeredCallbacks
             * @type Object
             * @default {}
             */
            registeredCallbacks: {},

            /**
             * @property launchedIntents
             * @type Array
             * @default []
             */
            launchedIntents: [],

            /**
             * Returns whether or not the participant is connected to the IWC bus.
             *
             * @method isConnected
             * @return {Boolean}
             */
            isConnected: function () {
                return this.address !== "$nobody";
            },

            /**
             * Parses launch parameters based on the raw string input it receives.
             *
             * @method readLaunchParams
             * @param {String} rawString
             */
            readLaunchParams: function (rawString) {
                // of the form ozpIwc.VARIABLE=VALUE, where:
                //   VARIABLE is alphanumeric + "_"
                //   VALUE does not contain & or #
                var re = /ozpIwc.(\w+)=([^&#]+)/g;
                var m;
                while ((m = re.exec(rawString)) !== null) {
                    var params = decodeURIComponent(m[2]);
                    try {
                        params = JSON.parse(params);
                    } catch (e) {
                        // ignore the errors and just pass through the string
                    }
                    this.launchParams[m[1]] = params;
                }
            },

            /**
             * Receive a packet from the connected peer.  If the packet is a reply, then
             * the callback for that reply is invoked.  Otherwise, it fires a receive event
             *
             * Fires:
             *     - {{#crossLink "ozpIwc.Client/receive:event}}{{/crossLink}}
             *
             * @method receive
             * @protected
             * @param {ozpIwc.packet.Transport} packetContext
             */
            receiveFromRouterImpl: function (packetContext) {
                var handled = false;

                // If no packet, it is likely a $transport packet.
                var packet = packetContext.packet || packetContext;
                //Try and handle this packet as a reply message
                if (packet.replyTo && this.promiseCallbacks[packet.replyTo]) {

                    var replyCancel = false;
                    var replyDone = function () {
                        replyCancel = true;
                    };
                    this.promiseCallbacks[packet.replyTo](packet, replyDone);

                    if (replyCancel) {
                        this.cancelPromiseCallback(packet.replyTo);
                        handled = true;
                    }

                }

                //Try and handle this packet as callback message
                if (!handled && packet.replyTo && this.registeredCallbacks[packet.replyTo]) {

                    var registeredCancel = false;
                    var self = this;
                    var registeredDone = function () {
                        registeredCancel = true;

                        if (self.watchMsgMap[packet.replyTo] && self.watchMsgMap[packet.replyTo].action === "watch") {
                            self.api(self.watchMsgMap[packet.replyTo].dst).unwatch(self.watchMsgMap[packet.replyTo].resource);
                        }
                        self.cancelRegisteredCallback(packet.replyTo);
                    };

                    handled = this.registeredCallbacks[packet.replyTo](packet, registeredDone);
                }
                if (!handled) {
                    //Drop own packets
                    if (packet.src === this.address) {
                        return;
                    }

                    if (packet.dst === "$bus.multicast") {
                        //If not handle-able by the mixin, trigger "busPacket" for someone to handle
                        if (!handleBusPacket(this, packet)) {
                            this.events.trigger("busPacket", packetContext);
                        }
                    } else {
                        //Not bus packet, trigger "receive" for someone to handle
                        this.events.trigger("receive", packetContext);
                    }
                }
            },

            /**
             * Builds the client api calls from the values in client.apiMap
             *
             * @method constructApiFunctions
             */
            constructApiFunctions: function () {
                for (var api in this.apiMap) {
                    var apiObj = this.apiMap[api];
                    var apiFuncName = apiObj.address.replace('.api', '');

                    //prevent overriding client constructed fields, but allow updating of constructed APIs
                    if (!this.hasOwnProperty(apiFuncName) || this.apiMap[api].functionName === apiFuncName) {
                        // wrap this in a function to break the closure
                        // on apiObj.address that would otherwise register
                        // everything for the last api in the list
                        /*jshint loopfunc:true*/
                        (function (self, addr) {
                            self[apiFuncName] =  self.updateApi(addr);
                            self.apiMap[addr] = self.apiMap[addr] || {};
                            self.apiMap[addr].functionName = apiFuncName;
                        })(this, apiObj.address);
                    }
                }
            },

            /**
             * Calls the names.api to gather the /api/* resources to gain knowledge of available api actions of the
             * current bus.
             *
             * @method gatherApiInformation
             * @return {Promise}
             */
            gatherApiInformation: function () {
                var self = this;
                // gather api information
                return this.send({
                    dst: "names.api",
                    action: "get",
                    resource: "/api"
                }).then(function (reply) {
                    if (reply.response === 'ok') {
                        return reply.entity;
                    } else {
                        throw reply.response;
                    }
                }).then(function (apis) {
                    var promiseArray = [];
                    apis.forEach(function (api) {
                        var promise = self.send({
                            dst: "names.api",
                            action: "get",
                            resource: api
                        }).then(function (res) {
                            if (res.response === 'ok') {
                                var name = api.replace('/api/', '');
                                self.apiMap[name] = self.apiMap[name] || {};
                                self.apiMap[name].address = name;
                                self.apiMap[name].actions = res.entity.actions;
                            } else {
                                throw res.response;
                            }
                        });
                        promiseArray.push(promise);
                    });
                    return Promise.all(promiseArray);
                });
            },

            /**
             * Cancel a reply callback registration.
             * @method cancelPromiseCallback
             * @param (String} msgId The packet replyTo ID for which the callback was registered.
             *
             * @return {Boolean} True if the cancel was successful, otherwise false.
             */
            cancelPromiseCallback: function (msgId) {
                var success = false;
                if (msgId) {
                    delete this.promiseCallbacks[msgId];
                    success = true;
                }
                return success;
            },

            /**
             * Cancel a watch callback registration.
             *
             * @method cancelRegisteredCallback
             * @param (String} msgId The packet replyTo ID for which the callback was registered.
             *
             * @return {Boolean} True if the cancel was successful, otherwise false.
             */
            cancelRegisteredCallback: function (msgId) {
                var success = false;
                if (msgId) {
                    delete this.registeredCallbacks[msgId];
                    delete this.watchMsgMap[msgId];
                    success = true;
                }
                return success;
            },

            /**
             * Registers callbacks
             *
             * @method on
             * @param {String} event The event to call the callback on.
             * @param {Function} callback The function to be called.
             *
             */
            on: function (event, callback) {
                if (event === "connected" && this.isConnected()) {
                    callback(this);
                    return;
                }
                return this.events.on.apply(this.events, arguments);
            },

            /**
             * De-registers callbacks
             *
             * @method off
             * @param {String} event The event to call the callback on.
             * @param {Function} callback The function to be called.
             *
             */
            off: function (event, callback) {
                return this.events.off.apply(this.events, arguments);
            },

            /**
             * Handles intent invocation packets. Communicates back with the intents.api to operate the in flight
             * intent
             * state machine.
             *
             * @method intentInvocationHandling
             * @param resource {String} The resource of the packet that sent the intent invocation
             * @param inFlightIntent {Object} The in flight intent, used internally to operate the in flight intent
             *     state machine
             * @param callback {Function} The intent handler's callback function
             * @return {Promise}
             */
            intentInvocationHandling: function (packet, inFlightIntent, callback) {
                var self = this;
                var res;
                var promiseChain;
                callback = callback || function () {};
                inFlightIntent = inFlightIntent || {};
                if (inFlightIntent.entity) {
                    promiseChain = Promise.resolve(inFlightIntent);
                } else {
                    promiseChain = self.send({
                        dst: "intents.api",
                        action: "get",
                        resource: inFlightIntent.resource
                    });
                }
                return promiseChain.then(function (inFlightIntentRes) {
                    res = inFlightIntentRes;
                    if (res.entity.invokePacket.msgId === packet.msgId) {
                        callback(packet);
                        return Promise.reject("ownInvoke");
                    }
                    return self.send({
                        dst: "intents.api",
                        contentType: res.contentType,
                        action: "set",
                        resource: res.resource,
                        entity: {
                            handler: {
                                resource: packet.resource,
                                address: self.address
                            },
                            me: Date.now(),
                            state: "running"
                        }
                    });
                }).then(function () {
                    // Run the intent handler. Wrapped in a promise chain in case the callback itself is async.
                    return callback(res.entity, inFlightIntent);
                }).then(function (result) {
                    // Allow the callback to override the intent state (usefull for preventing intent resolution if
                    // chained operations are performed.
                    if (result && result.intentIncomplete) {
                        return Promise.resolve();
                    }
                    // Respond to the inflight resource
                    return self.send({
                        dst: "intents.api",
                        contentType: res.contentType,
                        action: "set",
                        resource: res.resource,
                        entity: {
                            reply: {
                                'entity': result || {},
                                'contentType': res.entity.intent.type
                            },
                            state: "complete"
                        }
                    });
                })['catch'](function (e) {
                    if (e === "ownInvoke") {
                        //Filter out own invocations (this occurs when watching an invoke state).
                        return;
                    }

                    console.error("Error in handling intent: ", e, " -- Reporting error on in-flight intent node:",
                        res.resource);
                    // Respond to the inflight resource
                    return self.send({
                        dst: "intents.api",
                        contentType: res.contentType,
                        action: "set",
                        resource: res.resource,
                        entity: {
                            reply: {
                                'entity': e.toString() || {},
                                'contentType': "text/plain"
                            },
                            state: "error"
                        }
                    });
                });
            },

            /**
             * Calls the specific api wrapper given an api name specified.
             * If the wrapper does not exist it is created.
             *
             * @method api
             * @param apiName {String} The name of the api.
             * @return {Function} returns the wrapper call for the given api.
             */
            api: function (apiName) {
                return this.wrapperMap[apiName] || this.updateApi(apiName);
            },
            /**
             * Updates the wrapper map for api use. Whenever functionality is added or removed from the apiMap the
             * updateApi must be called to reflect said changes on the wrapper map.
             *
             * @method updateApi
             * @param apiName {String} The name of the api
             * @return {Function} returns the wrapper call for the given api.
             */
            updateApi: function (apiName) {

                // wrapper is a function because pre 1.2.0 the syntax expected
                // api's to be accessed through a function. The function returns
                // itself so to support legacy but properties are on wrapper so
                // functional access is not neccessary. -KJK
                var wrapper = function() {
                    return wrapper;
                };

                this.wrapperMap[apiName] = wrapper;
                if (this.apiMap.hasOwnProperty(apiName)) {
                    var api = this.apiMap[apiName];
                    var apiWrapper = this;

                    /**
                     *  All message formatting calls sits inside the API wrapper's messageBuilder object. These
                     *  calls will return a formatted message ready to be sent.
                     *  (e.g: data().messageBuilder.set)
                     */
                    wrapper.messageBuilder = {};
                    wrapper.messageBuilder.bulkSend = function(messages, otherCallback) {
                        var packet = {
                            'dst': api.address,
                            'action': "bulkSend",
                            'resource': "/",
                            'entity': messages
                        };

                        return {
                            'packet': packet,
                            'callback': otherCallback
                        };
                    };

                    /**
                     * All function calls are on the root level of the API wrapper. These calls will format messages and
                     * then send them to the router.
                     * (e.g: data().set)
                     */
                    wrapper.bulkSend = (function(bulkMessageBuilder, client) {
                        return function (messages) {
                            var message = bulkMessageBuilder(messages);
                            return client.send(message.packet, message.callback);
                        };
                    })(wrapper.messageBuilder.bulkSend, this);

                    /**
                     * Iterate over all mapped function calls and augment their message formatter and function call.
                     */
                    for (var i = 0; i < api.actions.length; ++i) {
                        var action = api.actions[i];
                        wrapper.messageBuilder[action] = messageBuilderAugment(api.address, action, this);
                        wrapper[action] = augment(wrapper.messageBuilder[action], this);
                    }

                    /**
                     * Creates a reference to the api node, but auto applies the given resource
                     * as well as applies default packet properties.
                     *
                     * @class Reference
                     * @constructor
                     * @param  {String} resource      The resource path to reference
                     * @param  {Object} defaultPacket Default values for the packets sent to the node
                     * @return {Object}               an augmented reference to the api resource.
                     */
                    wrapper.Reference = function(resource, defaultPacket) {

                        this.resource = resource;
                        this.apiWrapper = apiWrapper;
                        this.defaultPacket = {
                            resource: this.resource
                        };
                        this.messageBuilder = {};
                        for (var j in defaultPacket) {
                            this.defaultPacket[j] = defaultPacket[j];
                        }

                        for (var i = 0; i < api.actions.length; ++i) {
                            var action = api.actions[i];
                            this.messageBuilder[action] = messageBuilderRefAugment(api.address, action, this.defaultPacket, this.apiWrapper);
                            this[action] = augment(this.messageBuilder[action], this);
                        }
                    };

                    /**
                     * A modified send for References. Returns only the direct
                     * entity of a response as apposed to the whole packet by
                     * default
                     * @method send
                     * @param  {Object|Function}   fields   packet properties for transmit
                     * @param  {Function} callback          callback function for watched functionality
                     * @return {Promise}    The promise to be resolved
                     */
                    wrapper.Reference.prototype.send = function (fields, callback) {
                        var self = this;
                        var entityPromiseRes, entityPromiseRej;
                        var promise = new Promise(function(res,rej) {
                            entityPromiseRes = res;
                            entityPromiseRej = rej;
                        });
                        var entityCallback = function(response,done) {
                            var value = (self.defaultPacket.fullCallback ) ?
                                    response : response.entity;

                            // If this is an intent invocation, collecting doesn't apply
                            // If its an update about an intent invocation trigger change
                            // If not collecting, only trigger on value change
                            if (response.response !== "complete" && response.response !== "update" && !response.invokePacket &&
                                !self.defaultPacket.collect) {

                                if (response.entity.newValue !== response.entity.oldValue){
                                    return callback(value, done, response);
                                }
                            } else {
                                return callback(value, done, response);
                            }
                        };

                        this.apiWrapper.send(fields, entityCallback, entityPromiseRes, entityPromiseRej);

                        return promise.then(function(response) {
                            return (self.defaultPacket.fullResponse) ? response : response.entity;
                        }, function(err) {
                            throw (self.defaultPacket.fullResponse) ? err : err.response;
                        });
                    };

                    /**
                     * Updates the default parameters of a Reference. Can be used
                     * to reassign defaults of a Reference
                     * @method updateDefaults
                     * @param  {Object} config configuration properties of Reference to update
                     * @return {Object}        The Reference
                     */
                    wrapper.Reference.prototype.updateDefaults = function(config) {
                        if (typeof config === "object") {
                            for (var i in config) {
                                this.defaultPacket[i] = config[i];
                            }
                        }
                        return this;
                    };
                }

                wrapper.apiName = apiName;
                return wrapper;
            },

            /**
             * Applies necessary properties to the packet to be transmitted through the router.
             *
             * @method fixPacket
             * @param {Object} fields
             * @return {Object}
             */
            fixPacket: function (fields) {
                var packet = {
                    ver: 1,
                    src: fields.src || this.address,
                    msgId: fields.msgId || "p:" + this.msgIdSequence++,
                    time: fields.time || new Date().getTime()
                };

                for (var k in fields) {
                    packet[k] = util.ifUndef(fields[k], packet[k]);
                }

                if (packet.src === "$nobody") {
                    packet.src = this.address;
                }

                return packet;
            },

            /**
             * Registers callbacks for API request callbacks and promises.
             *
             * @method registerResponses
             * @property {Object} packet
             * @property {Function} callback
             * @property {Function} promiseRes
             * @property {Function} promiseRej
             */
            registerResponses: function (packet, callback, promiseRes, promiseRej) {
                var self = this;
                if (callback) {
                    this.registeredCallbacks[packet.msgId] = function (reply, done) {

                        // We've received a message that was a promise response but we've aready handled our promise
                        // response.
                        if (/(ok).*/.test(reply.response) || /(bad|no).*/.test(reply.response)) {

                            // Do nothing and let it get sent to the event handler (this is to filter out registration
                            // of callback responses)
                            return false;
                        } else if (reply.entity && reply.entity.inFlightIntent) {
                            self.intentInvocationHandling(packet, reply.entity.inFlightIntent, callback);
                        } else {

                            // reply passed twice to adhere to
                            // References internal callback signature.
                            callback(reply, done, reply);
                        }
                        return true;
                    };
                }

                //respondOn "all", "error", or no value (default all) will register a promise callback.
                if (packet.respondOn !== "none") {
                    this.promiseCallbacks[packet.msgId] = function (reply, done) {
                        if (reply.src === "intents.api" &&
                            (packet.action === "invoke" && /(ok).*/.test(reply.response)) ||
                            (packet.action === "broadcast" && /(complete).*/.test(reply.response))) {
                            // dont sent the response to the promise
                        } else if (reply.src === "intents.api" && packet.action === "broadcast" && /(pending).*/.test(reply.response)) {
                            //Broadcast request acknowledged and prepares logic ot handle resolving once all runners
                            // finish.
                            if (self.registeredCallbacks[packet.msgId]) {
                                self.registeredCallbacks[packet.msgId].handlers = reply.entity.handlers || [];
                                self.registeredCallbacks[packet.msgId].pRes = promiseRes;
                                self.registeredCallbacks[packet.msgId].reply = reply;
                            }
                            done();
                        } else if (reply.src === "$transport" || /(ok).*/.test(reply.response) || /(complete).*/.test(reply.response)) {
                            done();
                            promiseRes(reply);
                        } else if (/(bad|no).*/.test(reply.response)) {
                            done();
                            promiseRej(reply);
                        } else {
                            // it was not a promise callback
                        }
                    };
                }

                if (packet.action === "watch") {
                    this.watchMsgMap[packet.msgId] = packet;
                } else if (packet.action === "unwatch" && packet.replyTo) {
                    this.cancelRegisteredCallback(packet.replyTo);
                }

                if (packet.action === "bulkSend") {
                    packet.entity.forEach(function (message) {
                        self.registerResponses(message.packet, message.callback, message.res, message.rej);
                    });
                }
            },
            /**
             * Sends a packet through the IWC.
             * Will call the participants sendImpl function.
             *
             * @method send
             * @param {Object} fields properties of the send packet..
             * @param {Function} callback The Callback for any replies. The callback will be persisted if it returns a
             *     truth-like
             * @param {Function} preexistingPromiseRes If this send already has a promise resolve registration, use it
             *     rather than make a new one.
             * @param {Function} preexistingPromiseRej If this send already has a promise reject registration, use it
             *     rather than make a new one. value, canceled if it returns a false-like value.
             */
            send: function (fields, callback, preexistingPromiseRes, preexistingPromiseRej) {
                if (this.sendingBlocked) {
                    return Promise.resolve({response: "dropped"});
                }
                var promiseRes = preexistingPromiseRes;
                var promiseRej = preexistingPromiseRej;
                var promise = new Promise(function (resolve, reject) {

                    if (!promiseRes && !promiseRej) {
                        promiseRes = resolve;
                        promiseRej = reject;
                    }
                });

                if (!(this.isConnected() || fields.dst === "$transport")) {
                    // when send is switched to promises, create the promise first and return it here, as well
                    this.preconnectionQueue.push({
                        'fields': fields,
                        'callback': callback,
                        'promiseRes': promiseRes,
                        'promiseRej': promiseRej
                    });
                    return promise;
                }
                var packet = this.fixPacket(fields);
                this.registerResponses(packet, callback, promiseRes, promiseRej);
                fixBulkSend(packet);
                this.sendImpl(packet);
                this.sentBytes += packet.length;
                this.sentPackets++;

                return promise;
            },

            /**
             * Generic handler for a bus connection to handle any queued messages & launch data after its connected.
             * @method afterConnected
             * @return {Promise}
             */
            afterConnected: function () {
                var self = this;
                // dump any queued sends, trigger that we are fully connected
                self.preconnectionQueue.forEach(function (p) {
                    self.send(p.fields, p.callback, p.promiseRes, p.promiseRej);
                });
                self.preconnectionQueue = [];
                if (!self.launchParams.inFlightIntent || self.internal) {
                    self.events.trigger("connected");
                    return Promise.resolve();
                }

                // fetch the inFlightIntent
                return self.intents().get(self.launchParams.inFlightIntent).then(function (response) {
                    // If there is an inflight intent that has not already been handled (i.e. page refresh driving to
                    // here)
                    if (response && response.entity && response.entity.intent) {
                        var launchParams = response.entity.entity || {};
                        if (response.response === 'ok') {
                            for (var k in launchParams) {
                                self.launchParams[k] = launchParams[k];
                            }
                        }
                        self.intents().set(self.launchParams.inFlightIntent, {
                            entity: {
                                state: "complete"
                            }
                        });

                        if (self.launchParams.launchData && self.launchParams.launchData.inFlightIntent) {
                            self.launchedIntents.push(self.launchParams.launchData.inFlightIntent);
                        }
                    }
                    self.events.trigger("connected");
                })['catch'](function (e) {
                    console.error(self.launchParams.inFlightIntent, " not handled, reason: ", e);
                    self.events.trigger("connected");
                });
            }

        };
    };
//---------------------------------------------------------
// Private Methods
//---------------------------------------------------------
    /**
     * Augmentation for Intents Api register. Automatically invokes a registration if the invoke was passed
     * into the application opening.
     * @method intentRegisterAugment
     * @private
     * @static
     * @param client
     * @param message
     */
    var intentRegisterAugment = function (client, message) {
        for (var i in client.launchedIntents) {
            var loadedResource = '/' + client.launchedIntents[i].entity.intent.type + '/' + client.launchedIntents[i].entity.intent.action;
            if (message.packet.resource === loadedResource) {
                client.intentInvocationHandling(message.packet, client.launchedIntents[i], message.callback);
                delete client.launchedIntents[i];
            }
        }
    };


    /**
     * Augmentation for Intents Api invoke. Wraps callback to remove the callback when reaching
     * error/complete state.
     * @method intentRegisterAugment
     * @private
     * @static
     * @param client
     * @param message
     */
    var intentInvokeAugment = function (message) {
        if (message.callback) {
            var wrappedCallback = message.callback;
            // Wrap the callback to make sure it is removed when the intent state machine stops.
            message.callback = function (reply, done) {
                wrappedCallback(reply, done);
                reply = reply || {};
                reply.entity = reply.entity || {};
                if (reply.entity.state === "error" || reply.entity.state === "complete") {
                    done();
                }
            };
        }
    };

    /**
     * Augmentation for Intents Api broadcast. Compiles the results of all intent handlers and then,
     * returns the responfixese in the promise resolution. Callback acts like invoke callback.
     * @method intentRegisterAugment
     * @private
     * @static
     * @param client
     * @param message
     */
    var intentBroadcastAugment = function (client, message) {
        var broadcastWrappedCallback = message.callback || function () {};
        var registeredCallbacks = client.registeredCallbacks;

        // Wrap the callback to filter out all of the "complete" messages from each handler sent
        // intended for a promise resolution. Also store all results for the promise resolution.
        message.callback = function (reply, done, fullReply) {
            if (!registeredCallbacks[fullReply.replyTo]) {
                return;
            }
            var callback = registeredCallbacks[fullReply.replyTo];
            var handlers = callback.handlers;
            var attemptResolve = function (resource) {
                var handlerIndex = handlers.indexOf(resource);
                if (handlerIndex > -1) {
                    handlers.splice(handlerIndex, 1);
                }
                if (handlers.length === 0) {
                    callback.reply.entity = callback.results;
                    callback.reply.response = "complete";
                    callback.pRes(callback.reply);
                    done();
                }
            };
            if (fullReply.response === "complete") {
                callback.results = callback.results || {};
                callback.results[fullReply.resource] = fullReply.entity;
                attemptResolve(fullReply.resource);

            } else if (fullReply.entity && fullReply.entity.state === "error" && client.registeredCallbacks[fullReply.replyTo]) {
                attemptResolve(fullReply.entity.handler.resource);
            } else {
                broadcastWrappedCallback(fullReply, done);
            }
        };
    };

    /**
     * Augmenters for Intent Api specific actions.
     * @method intentAugment
     * @private
     * @static
     * @param client
     * @param message {Object}
     */
    var intentAugment = function (client, message) {
        var clientRef = client.apiWrapper || client;
        switch (message.packet.action) {
            case "register":
                intentRegisterAugment(clientRef, message);
                break;
            case "invoke":
                intentInvokeAugment(message);
                break;
            case "broadcast":
                intentBroadcastAugment(clientRef, message);
                break;

        }
    };

    /**
     * Function generator. Generates API functions given a messageBuilder function.
     * @method augment
     * @private
     * @static
     * @param messageBuilder
     * @param client
     * @return {Function}
     */
    var augment = function (messageBuilder, client) {
        return function() {
            // Augmentation clarification: If using 1.2.0 references, messageBuilder
            // is generated in messageBuilderRefAugment and expects 2 parameters
            // (1) entity, (2) callback. Follows original messageBuilder in
            // handling callback as first parameter. -KJK
            var message = messageBuilder.apply(this,arguments);


            if (message.packet.dst === "intents.api") {
                intentAugment(client, message);
            }
            return client.send(message.packet, message.callback);
        };
    };



    /**
     * Function generator. Generates API message formatting functions for a client-destination-action
     * pairing. These are generated for bulk sending capabilities, since the message needs to be formatted
     * but not transmitted until desired.
     *
     * @method messageBuilderAugment
     * @private
     * @static
     * @param dst
     * @param action
     * @param client
     * @return {Function}
     */
    var messageBuilderAugment = function (dst, action, client) {
        return function (param1, param2, param3) {
            var callback = param3;
            var fragment = param2;

            if (typeof param2 === "function") {
                callback = param2;
                fragment = {};
            }

            var packet = {
                'dst': dst,
                'action': action,
                'resource': param1,
                'entity': {}
            };

            for (var k in fragment) {
                packet[k] = fragment[k];
            }

            var resolve, reject;
            var sendData = new Promise(function (res, rej) {
                resolve = res;
                reject = rej;
            });

            sendData.packet = client.fixPacket(packet);
            sendData.callback = callback;
            sendData.res = resolve;
            sendData.rej = reject;
            return sendData;
        };
    };

    /**
     * A factory for generating messages for a given API & Action.
     * @method messageBuilderRefAugment
     * @private
     * @static
     * @param  {String} dst           [description]
     * @param  {String} action        [description]
     * @param  {Object} defaultPacket [description]
     * @param  {Object} client        [description]
     * @return {Function}             Returns a funciton that when called returns formatted packet,callback, and promise resolution calls.
     */
    var messageBuilderRefAugment = function (dst, action, defaultPacket, client) {
        return function(param1, param2) {
            var body = param1;
            var callback = param2;

            // If a fragment isn't supplied argument #2 should be a callback (if supplied)
            if (typeof param1 === "function") {
                callback = param1;
                body = undefined;
            }

            var packet = defaultPacket;
            packet.dst = dst;
            packet.action = action;
            packet.entity = body;

            var resolve, reject;
            var sendData = new Promise(function (res, rej) {
                resolve = res;
                reject = rej;
            });

            sendData.packet = client.fixPacket(packet);
            sendData.callback = callback;
            sendData.res = resolve;
            sendData.rej = reject;
            return sendData;
        };
    };

    /**
     * Handles packets received with a destination of "$bus.multicast".
     * If the packet action isn't handled, the function will return falsy.
     *
     * @method handleBusPacket
     * @private
     * @static
     * @param {ozpIwc.api.base.Api} apiBase
     * @param {Object} packetContext
     * @return {*}
     */
    var handleBusPacket = function (mixer, packet) {
        switch (packet.action) {
            case "connect":
                mixer.events.trigger("addressConnects", packet.entity.address, packet);
                return true;
            case "disconnect":
                mixer.events.trigger("addressDisconnects", packet.entity.address, packet);
                return true;
        }
    };


    /**
     * A fix for bulkSend functionality, Filters out promise functionality
     * so structured clones apply to bulkSends.
     * @method fixBulkSend
     * @private
     * @static     *
     * @param  {Object} packet
     * @return {Object}        a reference to the packet.
     */
    var fixBulkSend = function(packet) {
        if (packet.action === "bulkSend") {
            packet.entity = packet.entity.map(function(message) {
                return {
                    packet: message.packet
                };
            });
        }
        return packet;
    };

    return ApiPromiseMixin;
}(ozpIwc.apiMap, ozpIwc.log, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.util = ozpIwc.util || {};

/**
 * @module ozpIwc
 * @submodule ozpIwc.util
 */

ozpIwc.util.CancelableEvent = (function () {

    /**
     * Convenient base for events that can be canceled.  Provides and manages
     * the properties canceled and cancelReason, as well as the member function
     * cancel().
     *
     * @class CancelableEvent
     * @constructor
     * @namespace ozpIwc.util
     * @param {Object} data Data that will be copied into the event
     */
    var CancelableEvent = function (data) {
        data = data || {};
        for (var k in data) {
            this[k] = data[k];
        }
        /**
         * @property canceled
         * @type {Boolean}
         */
        this.canceled = false;

        /**
         * @property cancelReason
         * @type {String}
         */
        this.cancelReason = null;
    };

    /**
     * Marks the event as canceled.
     * @method cancel
     * @param {String} reason A text description of why the event was canceled.
     *
     * @return {ozpIwc.util.CancelableEvent} Reference to self
     */
    CancelableEvent.prototype.cancel = function (reason) {
        reason = reason || "Unknown";
        this.canceled = true;
        this.cancelReason = reason;
        return this;
    };

    return CancelableEvent;
}());
var ozpIwc = ozpIwc || {};
ozpIwc.util = ozpIwc.util || {};

/**
 * @module ozpIwc
 * @submodule ozpIwc.util
 */

ozpIwc.util.Event = (function (util) {

    /**
     * An Event emitter/receiver class.
     * @class Event
     * @constructor
     * @namespace ozpIwc.util
     */
    var Event = function () {
        /**
         * A key value store of events.
         * @property events
         * @type {Object}
         * @default {}
         */
        this.events = {};
    };

    /**
     * Registers a handler for the the event.
     *
     * @method on
     * @param {String} event The name of the event to trigger on.
     * @param {Function} callback Function to be invoked.
     * @param {Object} [self] Used as the this pointer when callback is invoked.
     *
     * @return {Object} A handle that can be used to unregister the callback via
     * {{#crossLink "ozpIwc.util.Event/off:method"}}{{/crossLink}}
     */
    Event.prototype.on = function (event, callback, self) {
        var wrapped = callback;
        if (self) {
            wrapped = function () {
                callback.apply(self, arguments);
            };
            wrapped.ozpIwcDelegateFor = callback;
        }
        this.events[event] = this.events[event] || [];
        this.events[event].push(wrapped);
        return wrapped;
    };

    /**
     * Unregisters an event handler previously registered.
     *
     * @method off
     * @param {String} event
     * @param {Function} callback
     */
    Event.prototype.off = function (event, callback) {
        this.events[event] = (this.events[event] || []).filter(function (h) {
            return h !== callback && h.ozpIwcDelegateFor !== callback;
        });
    };

    /**
     * Fires an event that will be received by all handlers.
     *
     * @method
     * @param {String} eventName Name of the event.
     * @param {Object} event Event object to pass to the handlers.
     *
     * @return {Object} The event after all handlers have processed it.
     */
    Event.prototype.trigger = function (eventName) {
        //if no event data push a new cancelable event
        var args = Array.prototype.slice.call(arguments, 1);
        if (args.length < 1) {
            args.push(new util.CancelableEvent());
        }
        var handlers = this.events[eventName] || [];

        handlers.forEach(function handleEvent(h) {
            h.apply(this, args);
        });
        return args[0];
    };

    /**
     * Adds an {{#crossLink "ozpIwc.util.Event/off:method"}}on(){{/crossLink}} and
     * {{#crossLink "ozpIwc.util.Event/off:method"}}off(){{/crossLink}} function to the target that delegate to this
     * object.
     *
     * @method mixinOnOff
     * @param {Object} target Target to receive the on/off functions
     */
    Event.prototype.mixinOnOff = function (target) {
        var self = this;
        target.on = function () { return self.on.apply(self, arguments);};
        target.off = function () { return self.off.apply(self, arguments);};
    };

    return Event;
}(ozpIwc.util));

if (!(window.console && console.log)) {
    console = {
        log: function () {},
        debug: function () {},
        info: function () {},
        warn: function () {},
        error: function () {}
    };
}
var ozpIwc = ozpIwc || {};

/**
 * Logging functionality for the IWC.
 * @module ozpIwc
 */

/**
 * A logging wrapper for the ozpIwc namespace
 * @class log
 * @static
 * @namespace ozpIwc
 */
ozpIwc.log = (function () {
    /**
     * Gathers the stacktrace for an error.
     * @method getStackTrace
     * @private
     * @return {String}
     */
    var getStackTrace = function () {
        var obj = {};
        Error.captureStackTrace(obj, getStackTrace);
        return obj.stack;
    };

    return {
        /**
         * @property NONE
         * @type {Object}
         */
        NONE: {logLevel: true, severity: 0, name: "NONE"},

        /**
         * @property DEFAULT
         * @type {Object}
         */
        DEFAULT: {logLevel: true, severity: 1, name: "DEFAULT"},

        /**
         * @property ERROR
         * @type {Object}
         */
        ERROR: {logLevel: true, severity: 3, name: "ERROR"},

        /**
         * @property INFO
         * @type {Object}
         */
        INFO: {logLevel: true, severity: 6, name: "INFO"},

        /**
         * @property DEBUG
         * @type {Object}
         */
        DEBUG: {logLevel: true, severity: 7, name: "DEBUG"},

        /**
         * @property ALL
         * @type {Object}
         */
        ALL: {logLevel: true, severity: 10, name: "ALL"},

        /**
         * @property threshold
         * @type {Number}
         */
        threshold: 3,

        /**
         * Sets the threshold for the IWC's logger.
         * @method setThreshold
         * @param {Number|Object} level
         * @param {Number} [level.severity]
         */
        setThreshold: function (level) {
            if (typeof(level) === "number") {
                ozpIwc.log.threshold = level;
            } else if (typeof(level.severity) === "number") {
                ozpIwc.log.threshold = level.severity;
            } else {
                throw new TypeError("Threshold must be a number or one of the ozpIwc.log constants.  Instead got" + level);
            }
        },

        /**
         * A wrapper for log messages. Forwards to console.log if available.
         * @property log
         * @type {Function}
         */
        log: function (level) {
            if (level.logLevel === true && typeof(level.severity) === "number") {
                ozpIwc.log.logMsg(level, Array.prototype.slice.call(arguments, 1));
            } else {
                ozpIwc.log.logMsg(ozpIwc.log.DEFAULT, Array.prototype.slice.call(arguments, 0));
            }
        },

        /**
         * Logs the given message if the severity is above the threshold.
         * @method logMsg
         * @param {Number} level
         * @param {Arguments} args
         */
        logMsg: function (level, args) {
            if (level.severity > ozpIwc.log.threshold) {
                return;
            }

            // if no console, no logs.
            if (!console || !console.log) {
                return;
            }

            var msg = args.reduce(function (acc, val) {
                if (val instanceof Error) {
                    //"[" + val.name + "]" + val.message;
                    return acc + val.toString() + (val.stack ? (" -- " + val.stack) : "");
                } else if (typeof(val) === "object") {
                    return acc + JSON.stringify(val, null, 2);
                }
                return acc + val;
            }, "[" + level.name + "] ");

            console.log(msg);
        },

        /**
         * A wrapper for error messages.
         * @property error
         * @type {Function}
         */
        error: function () {
            ozpIwc.log.logMsg(ozpIwc.log.ERROR, Array.prototype.slice.call(arguments, 0));
        },

        /**
         * A wrapper for debug messages.
         * @property debug
         * @type {Function}
         */
        debug: function () {
            ozpIwc.log.logMsg(ozpIwc.log.DEBUG, Array.prototype.slice.call(arguments, 0));
        },

        /**
         * A wrapper for info messages.
         * @property info
         * @type {Function}
         */
        info: function () {
            ozpIwc.log.logMsg(ozpIwc.log.INFO, Array.prototype.slice.call(arguments, 0));
        }
    };

}());

var ozpIwc = ozpIwc || {};
ozpIwc.util = ozpIwc.util || {};

/**
 * @module ozpIwc
 * @submodule ozpIwc.util
 */

/**
 * @class object
 * @namespace ozpIwc.util
 * @static
 */
ozpIwc.util.object = (function () {
    return {
        /**
         * @method eachEntry
         * @param {Object} obj
         * @param {Function} fn
         * @param {Object} self
         * @return {Array}
         */
        eachEntry: function (obj, fn, self) {
            var rv = [];
            for (var k in obj) {
                rv.push(fn.call(self, k, obj[k], obj.hasOwnProperty(k)));
            }
            return rv;
        },

        /**
         * @method values
         * @param {Object} obj
         * @param {Function} filterFn
         * @return {Array}
         */
        values: function (obj, filterFn) {
            filterFn = filterFn || function (key, value) {
                    return true;
                };
            var rv = [];
            for (var k in obj) {
                if (filterFn(k, obj[k])) {
                    rv.push(obj[k]);
                }
            }
            return rv;
        }
    };
}());

var ozpIwc = ozpIwc || {};
ozpIwc.util = ozpIwc.util || {};

/**
 * @module ozpIwc
 * @submodule ozpIwc.util
 */


ozpIwc.util.PacketRouter = (function (log, util) {

    /**
     * A routing module for packet controlling via template matching and filtering.
     * @class PacketRouter
     * @namespace ozpIwc.util
     */
    var PacketRouter = function () {
        /**
         * The key on this table is the route action.
         * The value is an array of config objects of the form:
         *    action: from the route declaration
         *    resource: from the route declaration
         *    handler: the function from the route declaration
         *    uriTemplate: uriTemplate function
         * @property routes
         * @type {Object}
         */
        this.routes = {};

        /**
         * The route that matches all packet handling requests. Should defined route be able to handle a packet, this
         * route is called. Can be changed using the declareDefaultRoute method.
         *
         * @property defaultRoute
         * @return {Boolean} Returns false by default. Expected to be overriden by calling declareDefaultRoute.
         */
        this.defaultRoute = function () { return false; };

        /**
         * The default scope of the router.
         * @type {PacketRouter}
         */
        this.defaultSelf = this;
    };

    /**
     * Assigns a route to the Packet Router for the specific action. This route is taken by a packet if its resource
     * matches the routes resource template, passes any assigned filters. Additionally, a packet may only take one
     * route, if multiple possible routes are possible, the route which was declared earliest will handle the packet.
     *
     * @method declareRoute
     * @param {Object} config
     * @param {String} config.action The action this route is defined to (ex. "get", "set", "list", ...)
     * @param {String} config.resource The serialized uri template definition pertaining to the route (ex. "/foo",
     *     "/{id:\\d+}", "/{param1}/{param2}")
     * @param {Array} config.filters Any filters that better isolate the packet routing based on the context and packet
     *     properties
     * @param {Function} handler The resulting action to be taken should this route handle a packet.
     * @param {Object}handlerSelf The scope of the handler, the PacketRouter object holds the default scope if none is
     *     provided.
     *
     * @return {ozpIwc.util.PacketRouter}
     */
    PacketRouter.prototype.declareRoute = function (config, handler, handlerSelf) {
        if (!config || !config.action || !config.resource) {
            throw new Error("Bad route declaration: " + JSON.stringify(config, null, 2));
        }
        config.handler = handler;
        config.filters = config.filters || [];
        config.handlerSelf = handlerSelf;
        config.uriTemplate = PacketRouter.uriTemplate(config.resource);

        // @TODO FIXME var actions=ozpIwc.util.ensureArray(config.action);
        var actions = util.ensureArray(config.action);

        actions.forEach(function (a) {
            if (!this.routes.hasOwnProperty(a)) {
                this.routes[a] = [];
            }

            this.routes[a].push(config);
        }, this);
        return this;
    };

    /**
     * Recursively passes through all filters for the packet, calling the handler only if all filters pass.
     *
     * @method filterChain
     * @param {Object} packet
     * @param {Object} context
     * @param {Object} pathParams
     * @param {Object} routeSpec
     * @param {Array} filters
     * @return {Function|null} The handler function should all filters pass.
     */
    PacketRouter.prototype.filterChain = function (packet, context, pathParams, routeSpec, thisPointer, filters) {
        // if there's no more filters to call, just short-circuit the filter chain
        if (!filters.length) {
            return routeSpec.handler.call(thisPointer, packet, context, pathParams);
        }
        // otherwise, chop off the next filter in queue and return it.
        var currentFilter = filters.shift();
        var self = this;
        var filterCalled = false;
        var returnValue = currentFilter.call(thisPointer, packet, context, pathParams, function () {
            filterCalled = true;
            return self.filterChain(packet, context, pathParams, routeSpec, thisPointer, filters);
        });
        if (!filterCalled) {
            log.debug("Filter did not call next() and did not throw an exception", currentFilter);
        } else {
            log.debug("Filter returned ", returnValue);
        }
        return returnValue;
    };

    /**
     * Routes the given packet based on the context provided.
     *
     * @method routePacket
     * @param {Object} packet
     * @param {Object} context
     * @param {Object} routeOverrides - if it exists, this to determine the route instead of the packet
     * @return {*} The output of the route's handler. If the specified action does not have any routes false is
     *                    returned. If the specified action does not have a matching route the default route is applied
     */
    PacketRouter.prototype.routePacket = function (packet, context, thisPointer, routeOverrides) {
        routeOverrides = routeOverrides || {};
        var action = routeOverrides.action || packet.action;
        var resource = routeOverrides.resource || packet.resource;

        if (!action || !resource) {
            context.defaultRouteCause = "nonRoutablePacket";
            return this.defaultRoute.call(thisPointer, packet, context, {});
        }

        context = context || {};
        thisPointer = thisPointer || this.defaultSelf;
        if (!this.routes.hasOwnProperty(action)) {
            context.defaultRouteCause = "noAction";
            return this.defaultRoute.call(thisPointer, packet, context, {});
        }
        var actionRoutes = this.routes[action];
        for (var i = 0; i < actionRoutes.length; ++i) {
            var route = actionRoutes[i];
            if (!route) {
                continue;
            }
            var pathParams = route.uriTemplate(resource);
            if (pathParams) {
                thisPointer = route.handlerSelf || thisPointer;
                var filterList = route.filters.slice();
                return this.filterChain(packet, context, pathParams, route, thisPointer, filterList);
            }
        }
        // if we made it this far, then we know about the action, but there are no resources for it
        context.defaultRouteCause = "noResource";
        return this.defaultRoute.call(thisPointer, packet, context, {});

    };

    /**
     * Assigns the default route for the Packet Router.
     *
     * @method declareDefaultRoute
     * @param {Function} handler
     */
    PacketRouter.prototype.declareDefaultRoute = function (handler) {
        this.defaultRoute = handler;
    };

    /**
     * Generates a template function to deserialize a uri string based on the RegExp pattern provided.
     *
     * @method uriTemplate
     * @static
     * @param {String} pattern
     * @return {Function} If the uri does not meet the template criteria, null will be returned when the returned
     *                     function is invoked.
     */
    PacketRouter.uriTemplate = function (pattern) {
        var fields = [];
        var modifiedPattern = "^" + pattern.replace(/\{.+?\}|[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, function (match) {
                if (match.length === 1) {
                    return "\\" + match;
                }
                var colon = match.indexOf(":");

                if (colon > 0) {
                    fields.push(match.slice(1, colon));
                    return "(" + match.slice(colon + 1, -1) + ")";
                } else {
                    fields.push(match.slice(1, -1));
                    return "([^\/]+)";
                }
            }) + "$";
        var regex = new RegExp(modifiedPattern);

        return function (input) {
            var results = regex.exec(input);
            if (!results) {
                return null;
            }
            var obj = {};
            for (var i = 1; i < results.length; ++i) {
                obj[fields[i - 1]] = results[i];
            }
            return obj;
        };

    };

    /**
     * Augments the provided class with a class-level router
     * and routing functions on the prototype.  This allows the use of
     * "declareRoute" on the class to create routes for all instances of
     * that class.  All filters and handlers are evaluated using the
     * instance as "this".
     *
     * Defines:
     *    classToAugment.declareRoute(routeConfig,handler)
     *    classToAugment.prototype.routePacket(packet,context);
     *
     * If the instance has a "defaultRoute" member, it will be used as the
     * default route for packets.
     *
     * Example:
     *    ozpIwc.util.PacketRouter.mixin(MyClass);
     *
     *    MyClass.declareRoute({
     *       action: "get",
     *       resource: "/foo/{id}"
     *    },function (packet,context,pathParams) {
     *       console.log("Foo handler",packet,context,pathParams);
     *       return "foo handler";
     *    });
     *
     *    MyClass.prototype.defaultRoute=function(packet,context) {
     *      console.log("Default handler",packet,context,pathParams);
     *      return "default!";
     *    };
     *
     *    var instance=new MyClass();
     *
     *    var packet1={ resource: "/foo/123", action: "get", ...}
     *    var rv=instance.routePacket(packet1,{ bar: 2});
     *    // console output: Foo handler, packet1, {bar:2}, {id: 123}
     *    // rv === "foo handler"
     *
     *    var packet2={ resource: "/dne/123", action: "get", ...}
     *    rv=instance.routePacket(packet2,{ bar: 3});
     *    // console output: Default handler, packet2, {bar:3}
     *    // rv === "default!"
     *
     * @param {Type} classToAugment
     * @return {Type}
     */
    PacketRouter.mixin = function (classToAugment) {
        var packetRouter = new PacketRouter();

        var superClass = Object.getPrototypeOf(classToAugment.prototype);
        if (superClass && superClass.routePacket) {
            packetRouter.defaultRoute = function (packet, context) {
                return superClass.routePacket.apply(this, arguments);
            };
        } else {
            packetRouter.defaultRoute = function (packet, context) {
                if (this.defaultRoute) {
                    return this.defaultRoute.apply(this, arguments);
                } else {
                    return false;
                }
            };
        }
        classToAugment.declareRoute = function (config, handler) {
            packetRouter.declareRoute(config, handler);
        };

        classToAugment.prototype.routePacket = function (packet, context) {
            return packetRouter.routePacket(packet, context, this);
        };
    };

    return PacketRouter;

}(ozpIwc.log, ozpIwc.util));



/*
 * The MIT License (MIT) Copyright (c) 2012 Mike Ihbe
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial 
 * portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO 
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/*
 * Original code owned by Mike Ihbe.  Modifications licensed under same terms.
 */
var ozpIwc = ozpIwc || {};
ozpIwc.metric = ozpIwc.metric || {};
ozpIwc.metric.stats = ozpIwc.metric.stats || {};

/**
 * Statistics classes for the ozpIwc Metrics
 * @module ozpIwc.metric
 * @submodule ozpIwc.metric.stats
 */


ozpIwc.metric.stats = (function (stats) {

    /**
     * @property DEFAULT_POOL_SIZE
     * @type {Number}
     * @default 1028
     */
    stats.DEFAULT_POOL_SIZE = 1028;

    /**
     * @Class Sample
     * @namespace ozpIwc.metric.stats
     * @constructor
     */
    stats.Sample = function () {
        /**
         * @property values
         * @type Array
         */
        this.clear();
    };

    /**
     * Appends the value.
     * @method update
     * @param {Number} val
     */
    stats.Sample.prototype.update = function (val) {
        this.values.push(val);
    };

    /**
     * Clears the values.
     * @method clear
     */
    stats.Sample.prototype.clear = function () {
        this.values = [];
        this.count = 0;
    };

    /**
     * Returns the number of the values.
     * @method size
     * @return {Number}
     */
    stats.Sample.prototype.size = function () {
        return this.values.length;
    };

    /**
     * Returns the array of values.
     * @method getValues
     * @return {Array}
     */
    stats.Sample.prototype.getValues = function () {
        return this.values;
    };


    /**
     *  Take a uniform sample of size size for all values
     *  @class UniformSample
     *  @param {Number} [size=ozpIwc.metric.stats.DEFAULT_POOL_SIZE] - The size of the sample pool.
     */
    stats.UniformSample = ozpIwc.util.extend(stats.Sample, function (size) {
        stats.Sample.apply(this);
        this.limit = size || stats.DEFAULT_POOL_SIZE;
    });

    stats.UniformSample.prototype.update = function (val) {
        this.count++;
        if (this.size() < this.limit) {
            this.values.push(val);
        } else {
            var rand = parseInt(Math.random() * this.count);
            if (rand < this.limit) {
                this.values[rand] = val;
            }
        }
    };

    return stats;
}(ozpIwc.metric.stats));
// From http://eloquentjavascript.net/appendix2.html, 
// licensed under CCv3.0: http://creativecommons.org/licenses/by/3.0/
var ozpIwc = ozpIwc || {};
ozpIwc.metric = ozpIwc.metric || {};
ozpIwc.metric.stats = ozpIwc.metric.stats || {};

/**
 * Statistics classes for the ozpIwc Metrics
 * @module ozpIwc.metric
 * @submodule ozpIwc.metric.stats
 */

ozpIwc.metric.stats.BinaryHeap = (function () {
    /**
     * This acts as a ordered binary heap for any serializeable JS object or collection of such objects
     * <p>Borrowed from https://github.com/mikejihbe/metrics. Originally from from
     * http://eloquentjavascript.net/appendix2.html
     * <p>Licenced under CCv3.0
     *
     * @class BinaryHeap
     * @namespace ozpIwc.metric.stats
     * @param {Function} scoreFunction
     * @return {ozpIwc.metric.stats.BinaryHeap}
     */
    var BinaryHeap = function BinaryHeap(scoreFunction) {
        this.content = [];
        this.scoreFunction = scoreFunction;
    };

    BinaryHeap.prototype = {

        clone: function () {
            var heap = new BinaryHeap(this.scoreFunction);
            // A little hacky, but effective.
            heap.content = JSON.parse(JSON.stringify(this.content));
            return heap;
        },

        push: function (element) {
            // Add the new element to the end of the array.
            this.content.push(element);
            // Allow it to bubble up.
            this.bubbleUp(this.content.length - 1);
        },

        peek: function () {
            return this.content[0];
        },

        pop: function () {
            // Store the first element so we can return it later.
            var result = this.content[0];
            // Get the element at the end of the array.
            var end = this.content.pop();
            // If there are any elements left, put the end element at the
            // start, and let it sink down.
            if (this.content.length > 0) {
                this.content[0] = end;
                this.sinkDown(0);
            }
            return result;
        },

        remove: function (node) {
            var len = this.content.length;
            // To remove a value, we must search through the array to find
            // it.
            for (var i = 0; i < len; i++) {
                if (this.content[i] === node) {
                    // When it is found, the process seen in 'pop' is repeated
                    // to fill up the hole.
                    var end = this.content.pop();
                    if (i !== len - 1) {
                        this.content[i] = end;
                        if (this.scoreFunction(end) < this.scoreFunction(node)) {
                            this.bubbleUp(i);
                        }
                        else {
                            this.sinkDown(i);
                        }
                    }
                    return true;
                }
            }
            throw new Error("Node not found.");
        },

        size: function () {
            return this.content.length;
        },

        bubbleUp: function (n) {
            // Fetch the element that has to be moved.
            var element = this.content[n];
            // When at 0, an element can not go up any further.
            while (n > 0) {
                // Compute the parent element's index, and fetch it.
                var parentN = Math.floor((n + 1) / 2) - 1,
                    parent = this.content[parentN];
                // Swap the elements if the parent is greater.
                if (this.scoreFunction(element) < this.scoreFunction(parent)) {
                    this.content[parentN] = element;
                    this.content[n] = parent;
                    // Update 'n' to continue at the new position.
                    n = parentN;
                }
                // Found a parent that is less, no need to move it further.
                else {
                    break;
                }
            }
        },

        sinkDown: function (n) {
            // Look up the target element and its score.
            var length = this.content.length,
                element = this.content[n],
                elemScore = this.scoreFunction(element);

            while (true) {
                // Compute the indices of the child elements.
                var child2N = (n + 1) * 2, child1N = child2N - 1;
                // This is used to store the new position of the element,
                // if any.
                var swap = null;
                var child1Score = null;
                // If the first child exists (is inside the array)...
                if (child1N < length) {
                    // Look it up and compute its score.
                    var child1 = this.content[child1N];
                    child1Score = this.scoreFunction(child1);
                    // If the score is less than our element's, we need to swap.
                    if (child1Score < elemScore) {
                        swap = child1N;
                    }
                }
                // Do the same checks for the other child.
                if (child2N < length) {
                    var child2 = this.content[child2N],
                        child2Score = this.scoreFunction(child2);
                    if (child2Score < (swap === null ? elemScore : child1Score)) {
                        swap = child2N;
                    }
                }

                // If the element needs to be moved, swap it, and continue.
                if (swap !== null) {
                    this.content[n] = this.content[swap];
                    this.content[swap] = element;
                    n = swap;
                }
                // Otherwise, we are done.
                else {
                    break;
                }
            }
        }
    };

    return BinaryHeap;
}());
/*
 * The MIT License (MIT) Copyright (c) 2012 Mike Ihbe
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial 
 * portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO 
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/*
 * Original code owned by Mike Ihbe.  Modifications licensed under same terms.
 */

var ozpIwc = ozpIwc || {};
ozpIwc.metric = ozpIwc.metric || {};
ozpIwc.metric.stats = ozpIwc.metric.stats || {};

/**
 * Statistics classes for the ozpIwc Metrics
 * @module ozpIwc.metric
 * @submodule ozpIwc.metric.stats
 */


ozpIwc.metric.stats = (function (stats) {
    /**
     * @property DEFAULT_RESCALE_THRESHOLD
     * @type {Number}
     * @default 3600000
     */
    stats.DEFAULT_RESCALE_THRESHOLD = 60 * 60 * 1000; // 1 hour in milliseconds

    /**
     * @property DEFAULT_DECAY_ALPHA
     * @type {Number}
     * @default 0.015
     */
    stats.DEFAULT_DECAY_ALPHA = 0.015;

    /**
     * This acts as a ordered binary heap for any serializeable JS object or collection of such objects
     * <p>Borrowed from https://github.com/mikejihbe/metrics.
     * @class ExponentiallyDecayingSample
     * @namespace ozpIwc.metric.stats
     */
    stats.ExponentiallyDecayingSample = ozpIwc.util.extend(stats.Sample, function (size, alpha) {
        stats.Sample.apply(this);
        this.limit = size || stats.DEFAULT_POOL_SIZE;
        this.alpha = alpha || stats.DEFAULT_DECAY_ALPHA;
        this.rescaleThreshold = stats.DEFAULT_RESCALE_THRESHOLD;
    });

// This is a relatively expensive operation
    /**
     * @method getValues
     * @return {Array}
     */
    stats.ExponentiallyDecayingSample.prototype.getValues = function () {
        var values = [];
        var heap = this.values.clone();
        var elt;
        while ((elt = heap.pop()) !== undefined) {
            values.push(elt.val);
        }
        return values;
    };

    /**
     * @method size
     * @return {Number}
     */
    stats.ExponentiallyDecayingSample.prototype.size = function () {
        return this.values.size();
    };

    /**
     * @method newHeap
     * @return {ozpIwc.metric.stats.BinaryHeap}
     */
    stats.ExponentiallyDecayingSample.prototype.newHeap = function () {
        return new stats.BinaryHeap(function (obj) {return obj.priority;});
    };

    /**
     * @method now
     * @return {Number}
     */
    stats.ExponentiallyDecayingSample.prototype.now = function () {
        return ozpIwc.util.now();
    };

    /**
     * @method tick
     * @return {Number}
     */
    stats.ExponentiallyDecayingSample.prototype.tick = function () {
        return this.now() / 1000;
    };

    /**
     * @method clear
     */
    stats.ExponentiallyDecayingSample.prototype.clear = function () {
        this.values = this.newHeap();
        this.count = 0;
        this.startTime = this.tick();
        this.nextScaleTime = this.now() + this.rescaleThreshold;
    };

    /**
     * timestamp in milliseconds
     * @method update
     * @param {Number} val
     * @param {Number} timestamp
     */
    stats.ExponentiallyDecayingSample.prototype.update = function (val, timestamp) {
        // Convert timestamp to seconds
        if (timestamp === undefined) {
            timestamp = this.tick();
        } else {
            timestamp = timestamp / 1000;
        }
        var priority = this.weight(timestamp - this.startTime) / Math.random();
        var value = {val: val, priority: priority};
        if (this.count < this.limit) {
            this.count += 1;
            this.values.push(value);
        } else {
            var first = this.values.peek();
            if (first.priority < priority) {
                this.values.push(value);
                this.values.pop();
            }
        }

        if (this.now() > this.nextScaleTime) {
            this.rescale();
        }
    };

    /**
     * @method weight
     * @param {Number}time
     * @return {Number}
     */
    stats.ExponentiallyDecayingSample.prototype.weight = function (time) {
        return Math.exp(this.alpha * time);
    };

    /**
     * @method rescale
     */
    stats.ExponentiallyDecayingSample.prototype.rescale = function () {
        this.nextScaleTime = this.now() + this.rescaleThreshold;
        var oldContent = this.values.content;
        var newContent = [];
        var oldStartTime = this.startTime;
        this.startTime = this.tick();
        // Downscale every priority by the same factor. Order is unaffected, which is why we're avoiding the cost of
        // popping.
        for (var i = 0; i < oldContent.length; i++) {
            newContent.push({
                val: oldContent[i].val,
                priority: oldContent[i].priority * Math.exp(-this.alpha * (this.startTime - oldStartTime))
            });
        }
        this.values.content = newContent;
    };

    return stats;
}(ozpIwc.metric.stats));
/*
 * The MIT License (MIT) Copyright (c) 2012 Mike Ihbe
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial 
 * portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO 
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/*
 * Original code owned by Mike Ihbe.  Modifications licensed under same terms.
 */

var ozpIwc = ozpIwc || {};
ozpIwc.metric = ozpIwc.metric || {};
ozpIwc.metric.stats = ozpIwc.metric.stats || {};

/**
 * Statistics classes for the ozpIwc Metrics
 * @module ozpIwc.metric
 * @submodule ozpIwc.metric.stats
 */


ozpIwc.metric.stats = (function (stats) {
    /**
     * @property M1_ALPHA
     * @type {Number}
     * @default 1 - e^(-5/60)
     */
    stats.M1_ALPHA = 1 - Math.exp(-5 / 60);

    /**
     * @property M5_ALPHA
     * @type {Number}
     * @default 1 - e^(-5/60/5)
     */
    stats.M5_ALPHA = 1 - Math.exp(-5 / 60 / 5);

    /**
     * @property M15_ALPHA
     * @type {Number}
     * @default 1 - e^(-5/60/15)
     */
    stats.M15_ALPHA = 1 - Math.exp(-5 / 60 / 15);

    /**
     *  Exponentially weighted moving average.
     *  @method ExponentiallyWeightedMovingAverage
     *  @param {Number} alpha
     *  @param {Number} interval Time in milliseconds
     */
    stats.ExponentiallyWeightedMovingAverage = function (alpha, interval) {
        this.alpha = alpha;
        this.interval = interval || 5000;
        this.currentRate = null;
        this.uncounted = 0;
        this.lastTick = ozpIwc.util.now();
    };

    /**
     * @method update
     * @param n
     */
    stats.ExponentiallyWeightedMovingAverage.prototype.update = function (n) {
        this.uncounted += (n || 1);
        this.tick();
    };

    /**
     * Update the rate measurements every interval
     *
     * @method tick
     */
    stats.ExponentiallyWeightedMovingAverage.prototype.tick = function () {
        var now = ozpIwc.util.now();
        var age = now - this.lastTick;
        if (age > this.interval) {
            this.lastTick = now - (age % this.interval);
            var requiredTicks = Math.floor(age / this.interval);
            for (var i = 0; i < requiredTicks; ++i) {
                var instantRate = this.uncounted / this.interval;
                this.uncounted = 0;
                if (this.currentRate !== null) {
                    this.currentRate += this.alpha * (instantRate - this.currentRate);
                } else {
                    this.currentRate = instantRate;
                }
            }
        }
    };

    /**
     * Return the rate per second
     *
     * @return {Number}
     */
    stats.ExponentiallyWeightedMovingAverage.prototype.rate = function () {
        return this.currentRate * 1000;
    };

    return stats;
}(ozpIwc.metric.stats));
var ozpIwc = ozpIwc || {};
ozpIwc.metric = ozpIwc.metric || {};
ozpIwc.metric.types = ozpIwc.metric.types || {};

/**
 * @module ozpIwc.metric
 * @submodule ozpIwc.metric.types
 */

ozpIwc.metric.types.BaseMetric = (function () {
    /**
     * @Class BaseMetric
     * @namespace ozpIwc.metric.types
     */
    var BaseMetric = function () {
        /**
         * The value of the metric
         * @property value
         * @type Number
         * @default 0
         */
        this.value = 0;

        /**
         * The name of the metric
         * @property name
         * @type String
         * @default ""
         */
        this.name = "";

        /**
         * The unit name of the metric
         * @property unitName
         * @type String
         * @default ""
         */
        this.unitName = "";
    };

    /**
     * Returns the metric value
     * @method get
     * @return {Number}
     */
    BaseMetric.prototype.get = function () {
        return this.value;
    };

    /**
     * Sets the unit name if parameter provided. Returns the unit name if no parameter provided.
     * @method unit
     * @param {String} val
     * @return {ozpIwc.metric.types.BaseMetric|String}
     */
    BaseMetric.prototype.unit = function (val) {
        if (val) {
            this.unitName = val;
            return this;
        }
        return this.unitName;
    };

    return BaseMetric;
}());




var ozpIwc = ozpIwc || {};
ozpIwc.metric = ozpIwc.metric || {};
ozpIwc.metric.types = ozpIwc.metric.types || {};

/**
 * @module ozpIwc.metric
 * @submodule ozpIwc.metric.types
 */

ozpIwc.metric.types.Counter = (function (metricTypes, util) {

    /**
     * A counter running total that can be adjusted up or down.
     * Where a meter is set to a known value at each update, a
     * counter is incremented up or down by a known change.
     *
     * @class Counter
     * @namespace ozpIwc.metric.types
     * @extends ozpIwc.metric.types.BaseMetric
     */
    var Counter = util.extend(metricTypes.BaseMetric, function () {
        metricTypes.BaseMetric.apply(this, arguments);
        this.value = 0;
    });

    /**
     * @method inc
     * @param {Number} [delta=1]  Increment by this value
     * @return {Number} Value of the counter after increment
     */
    Counter.prototype.inc = function (delta) {
        return this.value += (delta ? delta : 1);
    };

    /**
     * @method dec
     * @param {Number} [delta=1]  Decrement by this value
     * @return {Number} Value of the counter after decrement
     */
    Counter.prototype.dec = function (delta) {
        return this.value -= (delta ? delta : 1);
    };

    return Counter;
}(ozpIwc.metric.types, ozpIwc.util));
var ozpIwc = ozpIwc || {};
ozpIwc.metric = ozpIwc.metric || {};
ozpIwc.metric.types = ozpIwc.metric.types || {};

/**
 * @module ozpIwc.metric
 * @submodule ozpIwc.metric.types
 */

ozpIwc.metric.types.Gauge = (function (metricTypes, util) {
    /**
     * @callback ozpIwc.metric.types.Gauge~gaugeCallback
     * @return {ozpIwc.metric.types.MetricsTree}
     */

    /**
     * A gauge is an externally defined set of metrics returned by a callback function
     *
     * @class Gauge
     * @namespace ozpIwc.metric.types
     * @extends ozpIwc.metric.types.BaseMetric
     * @param {ozpIwc.metric.types.Gauge~gaugeCallback} metricsCallback
     */
    var Gauge = util.extend(metricTypes.BaseMetric, function (metricsCallback) {
        metricTypes.BaseMetric.apply(this, arguments);
        this.callback = metricsCallback;
    });
    /**
     * Set the metrics callback for this gauge.
     *
     * @method set
     * @param {ozpIwc.metric.types.Gauge~gaugeCallback} metricsCallback
     *
     * @return {ozpIwc.metric.types.Gauge} this
     */
    Gauge.prototype.set = function (metricsCallback) {
        this.callback = metricsCallback;
        return this;
    };
    /**
     * Executes the callback and returns a metrics tree.
     *
     * @method get
     *
     * @return {ozpIwc.metric.types.MetricsTree}
     */
    Gauge.prototype.get = function () {
        if (this.callback) {
            return this.callback();
        }
        return undefined;
    };

    return Gauge;
}(ozpIwc.metric.types, ozpIwc.util));
var ozpIwc = ozpIwc || {};
ozpIwc.metric = ozpIwc.metric || {};
ozpIwc.metric.types = ozpIwc.metric.types || {};

/**
 * @module ozpIwc.metric
 * @submodule ozpIwc.metric.types
 */

ozpIwc.metric.types.Histogram = (function (metricTypes, metricStats, util) {
    /**
     * @class Histogram
     * @namespace ozpIwc.metric.types
     * @extends ozpIwc.metric.types.BaseMetric
     */
    var Histogram = util.extend(metricTypes.BaseMetric, function () {
        metricTypes.BaseMetric.apply(this, arguments);

        /**
         * @property sample
         * @type {ozpIwc.metric.stats.ExponentiallyDecayingSample}
         */
        this.sample = new metricStats.ExponentiallyDecayingSample();
        this.clear();
    });


    /**
     * @method clear
     */
    Histogram.prototype.clear = function () {
        this.sample.clear();
        this.min = this.max = null;
        this.varianceMean = 0;
        this.varianceM2 = 0;
        this.sum = 0;
        this.count = 0;
    };

    /**
     * @method mark
     * @param {Number} val
     * @param {Number} timestamp Current time in milliseconds.
     * @return {Number} Value of the counter after increment
     */
    Histogram.prototype.mark = function (val, timestamp) {
        timestamp = timestamp || util.now();

        this.sample.update(val, timestamp);

        this.max = (this.max === null ? val : Math.max(this.max, val));
        this.min = (this.min === null ? val : Math.min(this.min, val));
        this.sum += val;
        this.count++;

        var delta = val - this.varianceMean;
        this.varianceMean += delta / this.count;
        this.varianceM2 += delta * (val - this.varianceMean);

        return this.count;
    };

    /**
     * @method get
     * @return {{percentile10, percentile25, median, percentile75, percentile90, percentile95, percentile99,
 * percentile999, variance: null, mean: null, stdDev: null, count: *, sum: *, max: *, min: *}}
     */
    Histogram.prototype.get = function () {
        var values = this.sample.getValues().map(function (v) {
            return parseFloat(v);
        }).sort(function (a, b) {
            return a - b;
        });
        var percentile = function (p) {
            var pos = p * (values.length);
            if (pos >= values.length) {
                return values[values.length - 1];
            }
            pos = Math.max(0, pos);
            pos = Math.min(pos, values.length + 1);
            var lower = values[Math.floor(pos) - 1];
            var upper = values[Math.floor(pos)];
            return lower + (pos - Math.floor(pos)) * (upper - lower);
        };

        return {
            'percentile10': percentile(0.10),
            'percentile25': percentile(0.25),
            'median': percentile(0.50),
            'percentile75': percentile(0.75),
            'percentile90': percentile(0.90),
            'percentile95': percentile(0.95),
            'percentile99': percentile(0.99),
            'percentile999': percentile(0.999),
            'variance': this.count < 1 ? null : this.varianceM2 / (this.count - 1),
            'mean': this.count === 0 ? null : this.varianceMean,
            'stdDev': this.count < 1 ? null : Math.sqrt(this.varianceM2 / (this.count - 1)),
            'count': this.count,
            'sum': this.sum,
            'max': this.max,
            'min': this.min
        };
    };

    return Histogram;
}(ozpIwc.metric.types, ozpIwc.metric.stats, ozpIwc.util));
var ozpIwc = ozpIwc || {};
ozpIwc.metric = ozpIwc.metric || {};
ozpIwc.metric.types = ozpIwc.metric.types || {};

/**
 * @module ozpIwc.metric
 * @submodule ozpIwc.metric.types
 */

ozpIwc.metric.types.Meter = (function (metricTypes, metricStats, util) {

    /**
     * @class Meter
     * @namespace ozpIwc.metric.types
     * @extends ozpIwc.metric.types.BaseMetric
     */
    var Meter = util.extend(metricTypes.BaseMetric, function () {
        metricTypes.BaseMetric.apply(this, arguments);
        /**
         * @property m1Rate
         * @type {ozpIwc.metric.stats.ExponentiallyWeightedMovingAverage}
         */
        this.m1Rate = new metricStats.ExponentiallyWeightedMovingAverage(metricStats.M1_ALPHA);
        /**
         * @property m5Rate
         * @type {ozpIwc.metric.stats.ExponentiallyWeightedMovingAverage}
         */
        this.m5Rate = new metricStats.ExponentiallyWeightedMovingAverage(metricStats.M5_ALPHA);
        /**
         * @property m15Rate
         * @type {ozpIwc.metric.stats.ExponentiallyWeightedMovingAverage}
         */
        this.m15Rate = new metricStats.ExponentiallyWeightedMovingAverage(metricStats.M15_ALPHA);
        /**
         * @property startTime
         * @type {Number}
         */
        this.startTime = util.now();
        /**
         * @property value
         * @type {Number}
         * @default 0
         */
        this.value = 0;
    });

    /**
     * @method mark
     * @param {Number} [delta=1] - Increment by this value
     * @return {Number} - Value of the counter after increment
     */
    Meter.prototype.mark = function (delta) {
        delta = delta || 1;
        this.value += delta;
        this.m1Rate.update(delta);
        this.m5Rate.update(delta);
        this.m15Rate.update(delta);

        return this.value;
    };

    /**
     * @method get
     * @return {{rate1m: (Number), rate5m: (Number), rate15m: (Number), rateMean: number, count: (Number)}}
     */
    Meter.prototype.get = function () {
        return {
            'rate1m': this.m1Rate.rate(),
            'rate5m': this.m5Rate.rate(),
            'rate15m': this.m15Rate.rate(),
            'rateMean': this.value / (util.now() - this.startTime) * 1000,
            'count': this.value
        };
    };

    /**
     * @method tick
     */
    Meter.prototype.tick = function () {
        this.m1Rate.tick();
        this.m5Rate.tick();
        this.m15Rate.tick();
    };

    return Meter;
}(ozpIwc.metric.types, ozpIwc.metric.stats, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.metric = ozpIwc.metric || {};
ozpIwc.metric.types = ozpIwc.metric.types || {};

/**
 * @module ozpIwc.metric
 * @submodule ozpIwc.metric.types
 */

ozpIwc.metric.types.Timer = (function (metricTypes, util) {
    /**
     * @class Timer
     * @namespace ozpIwc
     * @extends ozpIwc.metric.types.BaseMetric
     * @type {Function}
     */
    var Timer = util.extend(metricTypes.BaseMetric, function () {
        metricTypes.BaseMetric.apply(this, arguments);
        /**
         * @property meter
         * @type {ozpIwc.metric.types.Meter}
         */
        this.meter = new metricTypes.Meter();

        /**
         * @property histogram
         * @type {ozpIwc.metric.types.Histogram}
         */
        this.histogram = new metricTypes.Histogram();
    });

    /**
     * @method mark
     * @param {Number} val
     * @param {Number} timestamp Current time in milliseconds.
     */
    Timer.prototype.mark = function (val, time) {
        this.meter.mark();
        this.histogram.mark(val, time);
    };

    /**
     * Starts the timer
     *
     * @method start
     * @return {Function}
     */
    Timer.prototype.start = function () {
        var self = this;
        var startTime = util.now();
        return function () {
            var endTime = util.now();
            self.mark(endTime - startTime, endTime);
        };
    };

    /**
     * Times the length of a function call.
     *
     * @method time
     * @param {Function}callback
     */
    Timer.prototype.time = function (callback) {
        var startTime = util.now();
        try {
            callback();
        } finally {
            var endTime = util.now();
            this.mark(endTime - startTime, endTime);
        }
    };

    /**
     * Returns a histogram of the timer metrics.
     *
     * @method get
     * @return {Object}
     */
    Timer.prototype.get = function () {
        var val = this.histogram.get();
        var meterMetrics = this.meter.get();
        for (var k in meterMetrics) {
            val[k] = meterMetrics[k];
        }
        return val;
    };

    return Timer;
}(ozpIwc.metric.types, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.metric = ozpIwc.metric || {};

/**
 * @module ozpIwc
 * @submodule ozpIwc.metric
 */

ozpIwc.metric.Registry = (function (metricTypes) {
    /**
     * A repository of metrics
     * @class Registry
     * @namespace ozpIwc.metric
     */
    var Registry = function () {
        /**
         * Key value store of metrics
         * @property metrics
         * @type Object
         */
        this.metrics = {};
        var self = this;
        this.gauge('registry.metrics.types').set(function () {
            return Object.keys(self.metrics).length;
        });

    };

//--------------------------------------------------
//          Private Methods
//--------------------------------------------------

    /**
     * Finds or creates the metric in the registry.
     * @method findOrCreateMetric
     * @private
     * @static
     * @param {ozpIwc.metric.Registry} registry Name of the metric.
     * @param {String} name Name of the metric.
     * @param {Function} Type The constructor of the requested type for this metric.
     * @return {Object} Null if the metric already exists of a different type. Otherwise a reference to
     * the metric.
     */
    var findOrCreateMetric = function (registry, name, Type) {
        var m = registry.metrics[name];
        if (!m) {
            m = registry.metrics[name] = new Type();
            m.name = name;
            return m;
        }
        if (m instanceof Type) {
            return m;
        } else {
            return null;
        }
    };

//--------------------------------------------------
//          Public Methods
//--------------------------------------------------

    /**
     * Joins the arguments together into a name.
     * @method makeName
     * @private
     * @param {String[]} args Array or the argument-like "arguments" value.
     * @return {String} the name.
     */
    Registry.prototype.makeName = function (args) {
        // slice is necessary because "arguments" isn't a real array, and it's what
        // is usually passed in, here.
        return Array.prototype.slice.call(args).join(".");
    };

    /**
     * Returns the counter instance(s) for the given name(s). If it does not exist it will be created.
     *
     * @method counter
     * @param {String} name Components of the name.
     *
     * @return {ozpIwc.metric.types.Counter}
     */
    Registry.prototype.counter = function (name) {
        return findOrCreateMetric(this, this.makeName(arguments), metricTypes.Counter);
    };

    /**
     * Returns the ozpIwc.metric.types.Meter instance(s) for the given name(s). If it does not exist it will be created.
     *
     * @method meter
     * @param {String} name Components of the name.
     *
     * @return {Object}
     */
    Registry.prototype.meter = function (name) {
        return findOrCreateMetric(this, this.makeName(arguments), metricTypes.Meter);
    };

    /**
     * Returns the ozpIwc.metric.types.Gauge instance(s) for the given name(s). If it does not exist it will be created.
     *
     * @method gauge
     * @param {String} name Components of the name.
     * @return {Object}
     */
    Registry.prototype.gauge = function (name) {
        return findOrCreateMetric(this, this.makeName(arguments), metricTypes.Gauge);
    };

    /**
     * Returns the ozpIwc.metric.types.Histogram instance(s) for the given name(s). If it does not exist it will be
     * created.
     *
     * @method histogram
     * @param {String} name Components of the name.
     *
     * @return {Object}
     */
    Registry.prototype.histogram = function (name) {
        return findOrCreateMetric(this, this.makeName(arguments), metricTypes.Histogram);
    };

    /**
     * Returns the ozpIwc.metric.types.Timer instance(s) for the given name(s). If it does not exist it will be created.
     *
     * @method timer
     * @param {String} name Components of the name.
     *
     * @return {Object}
     */
    Registry.prototype.timer = function (name) {
        return findOrCreateMetric(this, this.makeName(arguments), metricTypes.Timer);
    };

    /**
     * Registers an ozpIwc.metric.types object to the metric registry
     *
     * @method register
     * @param {String} name Components of the name.
     * @param {Object} metric
     *
     * @return {Object} The metric passed in.
     */
    Registry.prototype.register = function (name, metric) {
        this.metrics[this.makeName(name)] = metric;

        return metric;
    };

    /**
     * Converts the metric registry to JSON.
     *
     * @method toJson
     * @return {Object} JSON converted registry.
     */
    Registry.prototype.toJson = function () {
        var rv = {};
        for (var k in this.metrics) {
            var path = k.split(".");
            var pos = rv;
            while (path.length > 1) {
                var current = path.shift();
                pos = pos[current] = pos[current] || {};
            }
            pos[path[0]] = this.metrics[k].get();
        }
        return rv;
    };

    /**
     * Returns an array of all ozpIwc.metric.types objects in the registry
     * @method allMetrics
     * @return {Object[]}
     */
    Registry.prototype.allMetrics = function () {
        var rv = [];
        for (var k in this.metrics) {
            rv.push(this.metrics[k]);
        }
        return rv;
    };

    return Registry;
}(ozpIwc.metric.types || {}));

var ozpIwc = ozpIwc || {};

/**
 * @module ozpIwc
 * @submodule ozpIwc.util
 */

/**
 * @class util
 * @namespace ozpIwc
 * @static
 */
ozpIwc.util = (function (log, util) {

    /**
     * Sends an AJAX request. A promise is returned to handle the response.
     *
     * @method ajax
     * @namespace ozpIwc.util
     * @static
     * @param {Object} config
     * @param {String} config.method
     * @param {String} config.href
     * @param [Object] config.headers
     * @param {String} config.headers.name
     * @param {String} config.headers.value
     * @param {boolean} config.withCredentials
     *
     * @return {Promise}
     */
    util.ajax = function (config) {
        return new Promise(function (resolve, reject) {
            var writeMethods = ["PUT", "POST", "PATCH"];
            var request = new XMLHttpRequest();
            request.open(config.method, config.href, true);
            request.withCredentials = true;
            var setContentType = true;
            if (Array.isArray(config.headers)) {
                config.headers.forEach(function (header) {
                    if (header.name === "Content-Type") {
                        setContentType = false;
                    }
                    request.setRequestHeader(header.name, header.value);
                });
            }
            //IE9 does not default the Content-Type. Set it if it wasn't passed in.
            if (writeMethods.indexOf(config.method) >= 0 && setContentType) {
                request.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
            }

            /*
             /*
             * Setting username and password as params to open() (and setting request.withCredentials = true)
             * per the API does not work in FF. setting them explicitly in the Authorization header works
             * (but only for BASIC authentication as coded here). If the credentials are set in the open command,
             * FF will fail to make the request, even though the credentials are manually set in the Authorization header
             * */

            request.onload = function () {
                if (Math.floor(this.status / 100) === 2) {
                    var entity;
                    try {
                        entity = JSON.parse(this.responseText);
                    } catch (e) {
                        entity = this.reponseText || this.responseXML;
                    }

                    log.info("[AJAX] [" + config.method + "] [" + config.href + "] [RESOLVE]");
                    resolve({
                        "response": entity,
                        "header": util.ajaxResponseHeaderToJSON(this.getAllResponseHeaders()),
                        'url': this.responseURL
                    });
                } else {
                    log.info("[AJAX] [" + config.method + "] [" + config.href + "] [REJECT] (" + this.status + ")");
                    reject(this);
                }
            };

            request.ontimeout = function (e) {
                log.info("[AJAX] [" + config.method + "] [" + config.href + "] [REJECT] (" + e + ")");
                reject(this);
            };

            request.onerror = function (e) {
                log.info("[AJAX] [" + config.method + "] [" + config.href + "] [REJECT] (" + e + ")");
                reject(this);
            };

            log.info("[AJAX] [" + config.method + "] [" + config.href + "]");
            try {
                if ((config.method === "POST") || (config.method === "PUT")) {
                    request.send(config.data);
                }
                else {
                    request.send();
                }
            } catch (e) {
                reject(e);
            }
        });
    };


    /**
     * Takes the Javascript ajax response header (string) and converts it to JSON
     * @method ajaxResponseHeaderToJSON
     * @param {String} header
     *
     * @return {Object}
     */
    util.ajaxResponseHeaderToJSON = function (header) {
        var obj = {};
        header.split("\n").forEach(function (property) {
            var kv = property.split(":");
            if (kv.length === 2) {
                obj[kv[0].trim()] = kv[1].trim();
            }
        });

        return obj;
    };

    return util;
}(ozpIwc.log, ozpIwc.util || {}));
var ozpIwc = ozpIwc || {};
ozpIwc.util = ozpIwc.util || {};
/**
 * @module ozpIwc
 * @submodule ozpIwc.util
 */

ozpIwc.util.AjaxPersistenceQueue = (function (log, util) {
    /**
     * An AJAX queueing class that limits the amount of AJAX requests via the IWC by using ajax pools.
     *
     * @class AjaxPersistenceQueue
     * @namespace ozpIwc.util
     * @param {Object} config
     * @param {Number} config.poolSize
     * @constructor
     */
    var AjaxPersistenceQueue = function (config) {
        config = config || {};
        this.poolSize = config.poolSize || 1;

        this.syncPool = []; // The tail of the promise chain for each pool

        // populate the slots with resolved promises
        for (var i = 0; i < this.poolSize; ++i) {
            this.syncPool.push(Promise.resolve());
        }

        // a counter that round-robins the requests to persist among the slots
        this.nextSlot = 0;

        // maps the iwcUri to the promise that is saving it
        this.queuedSyncs = {};
    };

    /**
     * Calls the callback when a slot in the ajax sync pool becomes available.
     * Returns a promise that resolve when the slotted operation begins.
     * Rejects if the unique id is already slotted.
     *
     * @method acquireSlot
     * @private
     * @static
     * @param {AjaxPersistenceQueue} queue
     * @param {String|Number} uuid
     * @param {Function} cb
     * @returns {*}
     */
    var acquireSlot = function (queue, uuid, cb) {
        // If the slot requested is filled reject to notify caller.
        if (!queue.queuedSyncs[uuid]) {
            queue.nextSlot = (queue.nextSlot + 1) % queue.poolSize;
            queue.syncPool[queue.nextSlot] = queue.queuedSyncs[uuid] = queue.syncPool[queue.nextSlot].then(function () {
                return cb();
            }).then(function (resp) {
                delete queue.queuedSyncs[uuid];
                return resp;
            }, function (err) {
                delete queue.queuedSyncs[uuid];
                throw err;
            });
            return queue.queuedSyncs[uuid];
        } else {
            return queue.queuedSyncs[uuid];
        }


    };

    /**
     * A Promise wrapped implementation of AJAX PUT for an IWC node.
     *
     * @method syncNode
     * @private
     * @param {ozpIwc.api.base.Node} node
     * @return {Promise} Returns a promise that will resolve after AJAX is complete.
     */
    var syncNode = function (node) {
        var self = node.getSelfUri() || {};
        var uri = self.href;
        var contentType = self.type;

        //If the node cannot provide the needed information for sending to the server
        //continue silently and resolve.
        if (!uri) {
            return Promise.resolve();
        }
        if (node.deleted) {
            return util.ajax({
                href: uri,
                method: 'DELETE'
            });
        } else {
            var entity = node.serialize();
            if (typeof(entity) !== "string") {
                entity = JSON.stringify(entity);
            }
            log.debug("PUT " + uri, entity);
            return util.ajax({
                href: uri,
                method: 'PUT',
                data: entity,
                headers: [{
                    name: "Content-Type",
                    value: contentType
                }]
            }).then(function (result) {
                log.debug("  saving to " + uri, result);
                return result;
            }, function (error) {
                log.error("  FAILED saving to " + uri, error);
            });
        }
    };

    /**
     * FIXME: it's possible to have poolSize updates in flight for a rapidly changing node when the pool is lightly
     * utilized. The duplicate call will occur when all of these conditions are met:
     *     * An ajax request for the node is still active.
     *     * queueNode(n) is called
     *     * the new sync promise reaches the head of its pool queue
     *   Example with poolSize=3 and node "n"
     *     queueNode(n) -> assigns n to pool 1
     *        pool 1 -> starts AJAX call and clears queuedSyncs[n]
     *     queueNode(n) -> n is not queued, so assigns n to pool 2
     *        pool 2 -> starts AJAX call and clears queuedSyncs[n]
     *     queueNode(n) -> n is not queued, so assigns n to pool 3
     *        pool 3 -> starts AJAX call and clears queuedSyncs[n]
     *
     *
     * @method queueNode
     * @param {String} iwcUri
     * @param {ozpIwc.api.base.Node} node
     * @return {*}
     */
    AjaxPersistenceQueue.prototype.queueNode = function (iwcUri, node) {
        var slotCall = function () {
            return syncNode(node).catch(function () {
                log.info("[AJAX] [" + iwcUri + "] Ignoring persist, as one is already queued.");
            });
        };
        return acquireSlot(this, "Node:" + iwcUri, slotCall);
    };

    /**
     * An ajax sync pool wrapped AJAX call. Pools AJAX requests so requests do not get dropped
     * if too many connections are open.
     *
     * @method queueAjax
     * @param {Object} config
     * @param {String} config.href
     * @param {String} config.method
     *
     * @returns {Promise}
     */
    AjaxPersistenceQueue.prototype.queueAjax = function (config) {
        config = config || {};
        if (!config.href) {
            throw "Ajax queue requires href";
        }
        if (!config.method) {
            throw "Ajax queue requires method";
        }

        var resolve, reject;
        var retPromise = new Promise(function (res, rej) {
            resolve = res;
            reject = rej;
        });
        var slotCall = function () {
            return util.ajax(config).then(resolve, reject);
        };

        acquireSlot(this, config.method + ":" + config.href + ":" + Date.now(), slotCall);

        return retPromise;
    };

    return AjaxPersistenceQueue;
}(ozpIwc.log, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.util = ozpIwc.util || {};
/**
 * @module ozpIwc
 */

ozpIwc.util.AsyncAction = (function () {
    /**
     * A deferred action, but not in the sense of the Javascript standard.
     * @class AsyncAction
     * @constructor
     * @namespace ozpIwc.util
     */
    var AsyncAction = function () {
        /**
         * The result of the logic defered to.
         * @property resolution
         * @type string
         */
        /**
         * Key value store of the callbacks to the deferred action.
         * @property callbacks
         * @type Object
         */
        this.callbacks = {};
    };

    /**
     * Registers the callback to be called when the resolution matches the state. If resolution matches the state before
     * registration, the callback is fired rather than registered.
     *
     * @method when
     * @param {String} state
     * @param {Function} callback
     * @param {Object} self
     * @return {ozpIwc.AsyncAction}
     */
    AsyncAction.prototype.when = function (state, callback, self) {
        self = self || this;

        if (this.resolution === state) {
            callback.apply(self, this.value);
        } else {
            this.callbacks[state] = function () { return callback.apply(self, arguments); };
        }
        return this;
    };

    /**
     * Sets the deferred action's resolution and calls any callbacks associated to that state.
     *
     * @method resolve
     * @param {String} status
     * @return {ozpIwc.AsyncAction}
     */
    AsyncAction.prototype.resolve = function (status) {
        if (this.resolution) {
            throw "Cannot resolve an already resolved AsyncAction";
        }
        var callback = this.callbacks[status];

        /**
         * @property resolution
         * @type {String}
         */
        this.resolution = status;

        /**
         * @property value
         * @type Array
         */
        this.value = Array.prototype.slice.call(arguments, 1);

        if (callback) {
            callback.apply(this, this.value);
        }
        return this;
    };

    /**
     * Gives implementation of an AsyncAction a chained success registration.
     * @method success
     * @param {Function} callback
     * @param {Object} self
     * @example
     * var a = new ozpIwc.AsyncAction().success(function(){...}, this).failure(function(){...}, this);
     * @return {ozpIwc.AsyncAction}
     */
    AsyncAction.prototype.success = function (callback, self) {
        return this.when("success", callback, self);
    };

    /**
     * Gives implementation of an AsyncAction a chained failure registration.
     * @method success
     * @param {Function} callback
     * @param {Object} self
     * @example
     * var a = new ozpIwc.AsyncAction().success(function(){...}, this).failure(function(){...}, this);
     * @return {ozpIwc.AsyncAction}
     */
    AsyncAction.prototype.failure = function (callback, self) {
        return this.when("failure", callback, self);
    };

    /**
     * Returns an async action that resolves when all async Actions are resolved with their resolved values (if
     * applies).
     * @method all
     * @param {Array} asyncActions
     */
    AsyncAction.all = function (asyncActions) {
        asyncActions = ozpIwc.util.ensureArray(asyncActions || []);

        var returnAction = new AsyncAction();
        var count = asyncActions.length;
        var self = this;
        var results = [];

        if (asyncActions.length === 0) {
            return returnAction.resolve('success', []);
        }
        //Register a callback for each action's "success"
        asyncActions.forEach(function (action, index) {
            // If its not an asyncAction, pass it through as a result.
            if (!self.isAnAction(action)) {
                results[index] = action;
                if (--count === 0) {
                    returnAction.resolve('success', results);
                }
            } else {
                action
                    .success(function (result) {
                        results[index] = result;
                        //once all actions resolved, intermediateAction resolve
                        if (--count === 0) {
                            returnAction.resolve('success', results);
                        }
                    }, self)
                    .failure(function (err) {
                        //fail the returnAction if any fail.
                        returnAction.resolve('failure', err);
                    }, self);
            }
        });

        return returnAction;
    };

    /**
     * Returns true if the object is an AsyncAction, otherwise false.
     * @method isAnAction
     * @param {*} action
     * @return {Boolean}
     */
    AsyncAction.isAnAction = function (action) {
        return AsyncAction.prototype.isPrototypeOf(action);
    };

    return AsyncAction;
}());

var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.util = ozpIwc.util || {};
/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.base
 * @class ozpIwc.api.base.Api
 */

ozpIwc.util.halLoader = (function (api, log, util) {

    var Loader = {};


    //-----------------------------------------------
    // Public Methods
    //-----------------------------------------------

    Loader.load = function (path, headers, onResource) {
        var endpoint = api.endpoint(path);
        return loadRecurse(endpoint, "/", headers, onResource);
    };

    //-----------------------------------------------
    // Private Methods
    //-----------------------------------------------

    var loadRecurse = function (endpoint, path, headers, onResource) {

        return endpoint.get(path, headers).then(function (data) {
            data.response._embedded = data.response._embedded || {};
            data.response._links = data.response._links || {};
            data.response._links.self = data.response._links.self || {};
            data.response._links.self.type = data.response._links.self.type || data.header['Content-Type'];
            data.response._links.self.href = data.response._links.self.href || data.url;

            onResource(data.response);

            return handleEmbedded(endpoint, data.response._embedded, headers, onResource).then(function () {
                return handleLinks(endpoint, data.response._links, headers, onResource);
            });
        }).catch(function (err) {
            log.error(api.logPrefix + "[" + endpoint.name + "] [" + path + "] Failed to load: ", err.status);
        });
    };


    /**
     * Recursive HAL _embedded parser
     *
     * @method handleLinks
     * @private
     * @static
     * @param {ozpIwc.api.endpoint} endpoint
     * @param {Object} _embedded the _embedded object of the HAL resource
     */
    var handleEmbedded = function (endpoint, _embedded, headers, onResource) {
        var embeddedItems = util.ensureArray((_embedded && _embedded.item) || []);
        var embeddedGather = function (obj) {
            obj._links = obj._links || {};
            obj._links.self = obj._links.self || {};
            // We can only knowingly handle an embedded object if we know its type.
            if (obj._links.self.type) {
                onResource(endpoint, obj, headers);
                return handleEmbedded(endpoint, obj._embedded, headers, onResource).then(function () {
                    return handleLinks(endpoint, obj._links, headers, onResource);
                });
            } else {
                return Promise.resolve();
            }
        };
        return Promise.all(embeddedItems.map(embeddedGather));
    };


    /**
     * Recursive HAL _links parser
     *
     * @method handleLinks
     * @private
     * @static
     * @param {Api} api
     * @param {ozpIwc.api.endpoint} endpoint
     * @param {Object} _links the _links object of the HAL resource
     */
    var handleLinks = function (endpoint, _links, headers, onResource) {
        var linkedItems = util.ensureArray((_links && _links.item) || []);
        var unknownLinks = linkedItems.filter(function (link) {
            return util.object.values(api.data, function (k, node) {
                    node.self = node.self || {};
                    return node.self.href === link.href;
                }).length === 0;
        });

        var linkGather = function (obj) {
            var hdrs = headers.slice(0);
            if (obj.type) {
                hdrs.push({'name': "Accept", 'value': obj.type});
            }
            return loadRecurse(endpoint, obj.href, hdrs, onResource).catch(function (err) {
                log.info("failed to gather link: ", obj.href, " reason: ", err);
            });
        };

        if (unknownLinks.length) {
            log.info(api.logPrefix + " Processing " + unknownLinks.length + " linked items.");
        }

        return Promise.all(unknownLinks.map(linkGather));
    };

    return Loader;
}(ozpIwc.api, ozpIwc.log, ozpIwc.util));
var ozpIwc = ozpIwc || {};
ozpIwc.util = ozpIwc.util || {};

/**
 * @module ozpIwc
 * @submodule ozpIwc.util
 */

/**
 * @class mutex
 * @namespace ozpIwc.util
 * @static
 */
ozpIwc.util.mutex = (function (util) {
    var mutex = function (config) {
        config = config || {};
        if (!config.requester) {
            throw "A mutex requires a requester.";
        }
        var requester = config.requester;
        if (!config.resource) {
            throw "A resource is required to lock on.";
        }


        if (config.onUnlock) {
            config.requester.send({
                dst: "locks.api",
                action: "watch",
                resource: config.resource
            }, function (response, done) {
                response = response || {};
                response.entity = response.entity || {};
                response.entity.oldValue = response.entity.oldValue || {};
                response.entity.newValue = response.entity.newValue || {};
                var prevOwner = response.entity.oldValue.owner || {};
                var newOwner = response.entity.newValue.owner || {};

                if (prevOwner.src === requester.address && newOwner.src !== requester.address) {
                    config.onUnlock(response);
                    done();
                }
            });
        }
        return config.requester.send({
            dst: "locks.api",
            action: "lock",
            resource: config.resource
        });
    };

    return mutex;
}(ozpIwc.util));
(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var setImmediate;

    function addFromSetImmediateArguments(args) {
        tasksByHandle[nextHandle] = partiallyApplied.apply(undefined, args);
        return nextHandle++;
    }

    // This function accepts the same arguments as setImmediate, but
    // returns a function that requires no arguments.
    function partiallyApplied(handler) {
        var args = [].slice.call(arguments, 1);
        return function () {
            if (typeof handler === "function") {
                handler.apply(undefined, args);
            } else {
                (new Function("" + handler))();
            }
        };
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    task();
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function installNextTickImplementation() {
        setImmediate = function () {
            var handle = addFromSetImmediateArguments(arguments);
            process.nextTick(partiallyApplied(runIfPresent, handle));
            return handle;
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function () {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function (event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        setImmediate = function () {
            var handle = addFromSetImmediateArguments(arguments);
            global.postMessage(messagePrefix + handle, "*");
            return handle;
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function (event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        setImmediate = function () {
            var handle = addFromSetImmediateArguments(arguments);
            channel.port2.postMessage(handle);
            return handle;
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        setImmediate = function () {
            var handle = addFromSetImmediateArguments(arguments);
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
            return handle;
        };
    }

    function installSetTimeoutImplementation() {
        setImmediate = function () {
            var handle = addFromSetImmediateArguments(arguments);
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
            return handle;
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(new Function("return this")()));

var ozpIwc = ozpIwc || {};

/**
 * @module ozpIwc
 */

/**
 * @class util
 * @namespace ozpIwc
 * @static
 */
ozpIwc.util = (function (util) {

    /**
     * Invokes the callback handler on another event loop as soon as possible.
     *
     * @method setImmediate
     * @static
     */
    util.setImmediate = function (f) {
        util.globalScope.setImmediate(f);
    };

    /**
     * Returns true if every needle is found in the haystack.
     *
     * @method arrayContainsAll
     * @static
     * @param {Array} haystack The array to search.
     * @param {Array} needles All of the values to search.
     * @param {Function} [equal] What constitutes equality.  Defaults to a===b.
     *
     * @return {Boolean}
     */
    util.arrayContainsAll = function (haystack, needles, equal) {
        equal = equal || function (a, b) { return a === b;};
        return needles.every(function (needle) {
            return haystack.some(function (hay) {
                return equal(hay, needle);
            });
        });
    };

    /**
     * Returns true if the value every attribute in needs is equal to
     * value of the same attribute in haystack.
     *
     * @method objectContainsAll
     * @static
     * @param {Array} haystack The object that must contain all attributes and values.
     * @param {Array} needles The reference object for the attributes and values.
     * @param {Function} [equal] What constitutes equality.  Defaults to a===b.
     *
     * @return {Boolean}
     */
    util.objectContainsAll = function (haystack, needles, equal) {
        equal = equal || function (a, b) { return a === b;};

        for (var attribute in needles) {
            if (!equal(haystack[attribute], needles[attribute])) {
                return false;
            }
        }
        return true;
    };

    /**
     * IWC alert handler.
     * @todo fill with some form of modal popup regarding the alert.
     * @todo store a list of alerts to not notify if the user selects "don't show me this again" in the data.api
     *
     * @class alert
     * @param {String} message The string to display in the popup.
     * @param {Object} errorObject The object related to the alert to give as additional information
     */
    util.alert = function (message, errorObject) {
        /**
         * key-value store of alerts.
         * @todo this is not used in current version of alert.
         * @property alerts
         * @type {Object}
         */
        this.alerts = this.alerts || {};
        if (this.alerts[message]) {
            this.alerts[message].error = errorObject;
        } else {
            this.alerts[message] = {
                error: errorObject,
                silence: false
            };
        }
        if (!this.alerts[message].silence) {
            //TODO : trigger an angular/bootstrap modal alert to notify the user of the error.
            // on return of the alert:
            // set this.alerts[message].silence if the user silenced the alerts

            // Temporary placement: all alerts are silenced after first instance, but since this is not in data.api its
            // on an application basis.
            this.alerts[message].silence = true;
            ozpIwc.log.log(message, errorObject);
        }
    };

    /**
     * Solves a common pattern to handle data from a function which may return a single object or an array of objects
     * If given an array, returns the array.
     * If given a single object, returns the object as a single element in a list.
     *
     * @method ensureArray
     * @static
     * @param {Object} obj The object may be an array or single object
     *
     * @return {Array}
     */
    util.ensureArray = function (obj) {
        return Array.isArray(obj) ? obj : [obj];
    };

    /**
     * Ensures the variable passed in is an object. For error mitigation, if the variable is not an object, an empty
     * object is returned.
     * @method ensureObject
     * @param obj
     * @returns {*}
     */
    util.ensureObject = function (obj) {
        return (typeof obj === "object" && obj !== null) ? obj : {};
    };
    /**
     * A key for data transmission over localStorage.
     *
     * @property localStorageKey
     * @type {String}
     */
    util.localStorageKey = "ozp.iwc.transport.localStorage";

        /**
     * Returns an object representation of the content-type string
     * @method getFormattedContentType
     * @private
     * @static
     * @param {String} contentType
     * @returns {Object}
     */
    util.getFormattedContentType = function (contentType) {
        var result = {};
        if (typeof contentType === "string") {
            var contentTypeArr = contentType.split(";");
            if (contentTypeArr.length > 0) {
                result.name = contentTypeArr[0];
                for (var i = 1; i < contentTypeArr.length; i++) {
                    var kv = contentTypeArr[i].replace(" ", "").split('=');
                    if (kv[0] !== "name") {
                        try {
                            result[kv[0]] = JSON.parse(kv[1]);
                        } catch (e) {
                            // its not parseable so the value is a string
                            result[kv[0]] = kv[1];
                        }
                    }
                }
            }
        }
        return result;
    };


    /**
     * Returns the content-types for all node types in a node namespace.
     * @method genContentTypeMappings
     * @param {Object} nodeNamespace
     * @returns {Object}
     */
    util.genContentTypeMappings = function (nodeNamespace) {
        var formats = {};
        for (var i in nodeNamespace) {
            var contentType = nodeNamespace[i].serializedContentType;
            if (contentType) {
                var formatted = util.getFormattedContentType(contentType);
                formats[formatted.name] = formats[formatted.name] || {};
                if (formatted.version) {
                    formats[formatted.name][formatted.version] = nodeNamespace[i];
                } else {
                    formats[formatted.name] = nodeNamespace[i];
                }
            }
        }
        return formats;
    };

    return util;
}(ozpIwc.util || {}));

/**
 * Configs, override in iwc.conf.js and include prior to ozpIwc-bus.js.
 */
var ozpIwc = ozpIwc || {};
/**
 * An object of configuration variables for the IWC Bus.
 * @namespace ozpIwc
 * @property ozpIwc.config
 * @type {Object}
 */
ozpIwc.config = ozpIwc.config || {};


//If this is in a worker the config file needs to be loaded.
if (ozpIwc.util.runningInWorker) {
    importScripts('ozpIwc.conf.js');
}

/**
 * A configurable version string used by the debugger to give easy access to current IWC build. If modifying
 * IWC code outside of distribution, add version references to ozpIwc.conf.js for distinguishing, otherwise IWC
 * distrobution builds will update this default value.
 *
 * @namespace ozpIwc
 * @property ozpIwc.config.version
 * @type String
 * @default "1.0.10"
 */
ozpIwc.config.version = ozpIwc.util.ifUndef(ozpIwc.util.ifUndef(ozpIwc.config.version || "1.0.10"));

/**
 * A configurable log level for IWC internal messages. Only messages equal to, or less than the log level will be
 * written to the console:
 *  0  : NONE
 *  1  : DEFAULT
 *  3  : ERROR
 *  6  : INFO
 *  7  : DEBUG
 *  10 : ALL
 *
 * @namespace ozpIwc
 * @property ozpIwc.config.threshold
 * @type Number
 * @default 6
 */
ozpIwc.config.logLevel = ozpIwc.util.ifUndef(ozpIwc.config.logLevel || 6);

/**
 * A configurable time for bus consensus algorithms to use to determine an election rounds result.
 * @namespace ozpIwc
 * @property ozpIwc.config.consensusTimeout
 * @type Number
 * @default 3000
 */
ozpIwc.config.consensusTimeout = ozpIwc.util.ifUndef(ozpIwc.config.consensusTimeout || 3000);

/**
 * A configurable time for bus components to use for their heartbeat intervals.
 * @namespace ozpIwc
 * @property ozpIwc.config.heartBeatFrequency
 * @type Number
 * @default 20000
 */
ozpIwc.config.heartBeatFrequency = ozpIwc.util.ifUndef(ozpIwc.config.heartBeatFrequency || 20000);

/**
 * A configurable url for the root of api resources. Override with backend specific path in ozpIwc.conf.js.
 * @namespace ozpIwc
 * @property ozpIwc.config.apiRootUrl
 * @type String
 * @default "/"
 */
ozpIwc.config.apiRootUrl = ozpIwc.util.ifUndef(ozpIwc.config.apiRootUrl || "/");

/**
 * A configurable url for security policy loading. Override with backend specific path in ozpIwc.conf.js.
 * @namespace ozpIwc
 * @property ozpIwc.config.policyRootUrl
 * @type String
 * @default "/policy"
 */
ozpIwc.config.policyRootUrl = ozpIwc.util.ifUndef(ozpIwc.config.policyRootUrl || "/policy");

/**
 * A configurable prefix for link relations on resources.
 * @namespace ozpIwc
 * @property ozpIwc.config.linkRelPrefix
 * @type String
 * @default "ozp"
 */
ozpIwc.config.linkRelPrefix = ozpIwc.util.ifUndef(ozpIwc.config.linkRelPrefix || "ozp");

/**
 * A configurable url for the intent chooser's path. If a custom intent chooser is to be deployed, override this
 * variable in the ozpIwc.conf.js
 * @namespace ozpIwc
 * @property ozpIwc.config.intentsChooserUri
 * @type String
 * @default "intentsChooser.html"
 */
ozpIwc.config.intentsChooserUri = ozpIwc.util.ifUndef(ozpIwc.config.intentsChooserUri || "intentsChooser.html");

/**
 * A configuration flag for the iwc.conf.js file. If true, app/js/build-config/legacySupport.js configurations are used.
 * @namespace ozpIwc
 * @property ozpIwc.config.legacySupport
 * @type Boolean
 * @default true
 */
ozpIwc.config.legacySupport = ozpIwc.util.ifUndef(ozpIwc.config.legacySupport, true);

/**
 * A configuration flag for the iwc.conf.js file. If false, app/js/build-config/backendSupport.js configurations are
 * used.
 * @namespace ozpIwc
 * @property ozpIwc.config.backendSupport
 * @type Boolean
 * @default false
 */
ozpIwc.config.backendSupport = ozpIwc.util.ifUndef(ozpIwc.config.backendSupport, false);
ozpIwc.config.defaultContentTypes = ozpIwc.util.ifUndef(ozpIwc.config.requiredContentType, {});
ozpIwc.config.defaultContentTypes["ozp:data-item"] =
    ozpIwc.util.ifUndef(ozpIwc.config.defaultContentTypes["ozp:data-item"], "application/vnd.ozp-iwc-data-object+json;version=2");

/**
 * A configuration flag for the iwc.conf.js file. If true, app/js/bus/config/defaultWiring.js instantiates the Api
 * modules.
 * @namespace ozpIwc
 * @property ozpIwc.config.runApis
 * @type Boolean
 * @default true
 */
ozpIwc.config.runApis = ozpIwc.util.ifUndef(ozpIwc.config.runApis, true);

/**
 * A configuration flag for the iwc.conf.js file. If true, app/js/bus/config/defaultWiring.js allows connections to
 * ozpIwc clients in the same browsing window. Often set to false for the intent chooser/debugger as they are directly
 * connected to the bus.
 *
 * @namespace ozpIwc
 * @property ozpIwc.config.allowLocalClients
 * @type Boolean
 * @default true
 */
ozpIwc.config.allowLocalClients = ozpIwc.util.ifUndef(ozpIwc.config.allowLocalClients, true);

/**
 * A configuration flag for the iwc.conf.js file. If true, app/js/bus/config/defaultWiring.js will instantiate the
 * default components of the bus if false. Used for integration testing, not intended for end user modification.
 *
 * @namespace ozpIwc
 * @private
 * @property ozpIwc.config._testMode
 * @type Boolean
 * @default true
 */
ozpIwc.config._testMode = ozpIwc.util.ifUndef(ozpIwc.config._testMode, false);

/**
 * The absolute path for the bus's root location (ex. http://localhost:13000/).
 * Path is set automatically on bus instantiation, does not need to be set in iwc.conf.js
 *
 * @namespace ozpIwc
 * @private
 * @property ozpIwc.config._busRoot
 * @type String
 * @default "<Absolute root path of current browser URL>"
 */
ozpIwc.config._busRoot = ozpIwc.util.ifUndef(ozpIwc.config._busRoot, (function () {
    return ozpIwc.util.globalScope.location.protocol + "//" +
        ozpIwc.util.globalScope.location.host +
        ozpIwc.util.globalScope.location.pathname.replace(/[^\/]+$/, "");
})());


/**
 * Features for the intent chooser's window opener.
 *
 * @namespace ozpIwc
 * @private
 * @property ozpIwc.config.intentChooserFeatures
 * @type String
 * @default "width=330,height=500"
 */
ozpIwc.config.intentChooserFeatures = ozpIwc.util.ifUndef(ozpIwc.config.intentChooserFeatures, "width=330,height=500");

/**
 * Root location for owf7 legacy preferences should this bus support legacy widgets through the ozp-iwc-owf7-adapter.
 *
 * @namespace ozpIwc
 * @private
 * @property ozpIwc.config.owf7PrefsUrl
 * @type String
 * @default "/owf/prefs"
 */
ozpIwc.config.owf7PrefsUrl = ozpIwc.util.ifUndef(ozpIwc.config.owf7PrefsUrl, "/owf/prefs");

/**
 *
 * A configuration variable for the ozpIwc.config.js file. Denotes the max number of ajax requests that can
 * be open at any given time.
 * @namespace ozpIwc
 * @private
 * @property ozpIwc.config.ajaxPoolSize
 * @type Number
 * @default 1
 */
ozpIwc.config.ajaxPoolSize = ozpIwc.util.ifUndef(ozpIwc.config.ajaxPoolSize, 1);

/**
 * A configuration variable for the ozpIwc.config.js file. Templates for the IWC to use to map content-types to hrefs
 * for endpoints. This is usually served from the backend itself in the HAL data, but is also available to be set by
 * in the IWC.
 *
 * Mapping can be done between either href and type or endpoint/pattern and type:
 *
 *   {
 *      'ozp:data-item': {
 *          endpoint: "ozp:user-data",
 *          pattern: "/{+resource}",
 *          type:"application/vnd.ozp-iwc-data-object-v1+json"
 *      },
 *      'ozp:application-item': {
 *          href: "/marketplace/api/listing/{+resource}",
 *          type: "application/vnd.ozp-application-v1+json"
 *      }
 *   }
 *
 * @namespace ozpIwc
 * @private
 * @property ozpIwc.config.templates
 * @type Object
 * @default {}
 */
ozpIwc.config.templates = ozpIwc.util.ifUndef(ozpIwc.config.templates, {});

var ozpIwc = ozpIwc || {};
ozpIwc.policyAuth = ozpIwc.policyAuth || {};
ozpIwc.policyAuth.elements = ozpIwc.policyAuth.elements || {};

/**
 * @module ozpIwc.policyAuth
 * @submodule ozpIwc.policyAuth.elements
 */

ozpIwc.policyAuth.elements.SecurityAttribute = (function (util) {

    /**
     * A security attribute constructor for policyAuth use. Structured to be common to both bus-internal and api needs.
     * @class SecurityAttribute
     * @namespace ozpIwc.policyAuth.elements
     * @param {Object} [config]
     * @constructor
     */
    var SecurityAttribute = function (config) {
        config = config || {};

        /**
         * @property {Object} attributes
         */
        this.attributes = config.attributes || {};

        /**
         * @property {Function} comparator
         */
        this.comparator = config.comparator || this.comparator;
    };

    /**
     * Adds a value to the security attribute if it does not already exist. Constructs the attribute object if it does
     * not exist
     *
     * @method pushIfNotExist
     * @param {String} id
     * @param {String} val
     * @param {Function} [comp]
     */
    SecurityAttribute.prototype.pushIfNotExist = function (id, val, comp) {
        comp = comp || this.comparator;
        if (!val) {
            return;
        }
        var value = util.ensureArray(val);
        if (!this.attributes[id]) {
            this.attributes[id] = [];
            this.attributes[id] = this.attributes[id].concat(value);
        } else {
            for (var j in value) {
                var add = true;
                for (var i in this.attributes[id]) {
                    if (comp(this.attributes[id][i], value[j])) {
                        add = false;
                        break;
                    }
                }
                if (add) {
                    this.attributes[id].push(value[j]);
                }
            }
        }
    };

    /**
     * Clears the attributes given to an id.
     * @method clear
     * @param {String} id
     */
    SecurityAttribute.prototype.clear = function (id) {
        delete this.attributes[id];
    };

    /**
     * Clears all attributes.
     * @method clearAll
     */
    SecurityAttribute.prototype.clearAll = function () {
        this.attributes = {};
    };

    /**
     * Returns an object containing all of the attributes.
     * @method getAll
     * @return {Object}
     */
    SecurityAttribute.prototype.getAll = function () {
        return this.attributes;
    };

    /**
     *
     * Determines the equality of an object against a securityAttribute value.
     * @method comparator
     * @param {*} a
     * @param {*} b
     * @return {Boolean}
     */
    SecurityAttribute.prototype.comparator = function (a, b) {
        return a === b;
    };

    return SecurityAttribute;
}(ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.policyAuth = ozpIwc.policyAuth || {};
ozpIwc.policyAuth.points = ozpIwc.policyAuth.points || {};

/**
 * @module ozpIwc.policyAuth
 * @submodule ozpIwc.policyAuth.points
 */

ozpIwc.policyAuth.points.PDP = (function (policyAuth, util) {
    /**
     * System entity that evaluates applicable policy and renders an authorization decision.
     * @class PDP
     * @namespace ozpIwc.policyAuth.points
     *
     * @param {Object} [config]
     * @param {ozpIwc.policyAuth.points.PRP} [config.prp] Policy Repository Point for the PDP to gather policies from.
     * @param {ozpIwc.policyAuth.points.PIP} [config.pip] Policy Information Point for the PDP to gather attributes
     *     from.
     * @constructor
     */
    var PDP = function (config) {
        config = config || {};

        /**
         * Policy Repository Point
         * @property prp
         * @type {ozpIwc.policyAuth.points.PRP}
         * @default new ozpIwc.policyAuth.points.PRP()
         */
        this.prp = config.prp || new policyAuth.PRP();


        /**
         * Policy Information Point
         * @property pip
         * @type {ozpIwc.policyAuth.points.PIP}
         * @default new ozpIwc.policyAuth.points.PIP()
         */
        this.pip = config.pip || new policyAuth.PIP();

        /**
         * @property policySets
         * @type {Object}
         */
        this.policySets = config.policySets ||
            {
                'connectSet': ["policy://ozpIwc/connect"],
                'apiSet': ["policy://policy/apiNode"],
                'readSet': ["policy://policy/read"],
                'receiveAsSet': ["policy://policy/receiveAs"],
                'sendAsSet': ["policy://policy/sendAs"]
            };
    };


    /**
     * @method isPermitted
     * @param {Object} [request]
     * @param {Object | String} [request.subject]       The subject attributes or id performing the action.
     * @param {Object | String} [request.resource]      The resource attributes or id that is being acted upon.
     * @param {Object | String} [request.action]        The action attributes.  A string should be interpreted as the
     *                                                  value of the “action-id” attribute.
     * @param {Array<String>} [request.policies]        A list of URIs applicable to this decision.
     * @param {String} [request.combiningAlgorithm]    Only supports “deny-overrides”
     * @param {Object} [contextHolder]                  An object that holds 'securityAttribute' attributes to populate
     *     the PIP cache with for request/policy use.
     * @return {ozpIwc.util.AsyncAction} will resolve with 'success' if the policy gives a "Permit".
     *                                    rejects else wise. the async success will receive:
     * ```
     * {
     *     'result': <String>,
     *     'request': <Object> // a copy of the request passed in,
     *     'formattedRequest': <Object> // a copy of the formatted request (for PDP user caching)
     * }
     * ```
     */
    PDP.prototype.isPermitted = function (request) {
        var asyncAction = new util.AsyncAction();

        var self = this;
        //If there is no request information, its a trivial "Permit"
        if (!request) {
            return asyncAction.resolve('success', {
                'result': "Permit"
            });
        }
        request.combiningAlgorithm = request.combiningAlgorithm || this.defaultCombiningAlgorithm;


        var onError = function (err) {
            asyncAction.resolve('failure', err);
        };
        //Format the request
        policyAuth.points.utils.formatRequest(request, this.pip).success(function onFormattedRequest (formattedRequest) {

                // Get the policies from the PRP
                self.prp.getPolicies(formattedRequest.policies).success(function onGatheredPolicies (policies) {

                        var result = policyAuth.PolicyCombining[formattedRequest.combiningAlgorithm](policies, formattedRequest.category);
                        var response = {
                            'result': result,
                            'request': request,
                            'formattedRequest': formattedRequest
                        };
                        if (result === "Permit") {
                            asyncAction.resolve('success', response);
                        } else {
                            onError(response);
                        }
                    }).failure(onError);
            }).failure(onError);
        return asyncAction;
    };

    /**
     * The URN of the default combining algorithm to use when basing a decision on multiple policies.
     * @property defaultCombiningAlgorithm
     * @type {String}
     * @default "deny-overrides"
     */
    PDP.prototype.defaultCombiningAlgorithm = "deny-overrides";

    return PDP;
}(ozpIwc.policyAuth, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.policyAuth = ozpIwc.policyAuth || {};
ozpIwc.policyAuth.points = ozpIwc.policyAuth.points || {};

/**
 * @module ozpIwc.policyAuth.points
 */

ozpIwc.policyAuth.points.PIP = (function (policyAuth, util) {

    /**
     * Policy Information Point
     * @class PIP
     * @namespace ozpIwc.policyAuth.points
     * @extends ozpIwc.policyAuth.SecurityAttribute
     * @param {Object} config
     * @param {Object} config.attributes
     * @constructor
     */
    var PIP = util.extend(policyAuth.elements.SecurityAttribute, function (config) {
        policyAuth.elements.SecurityAttribute.apply(this, arguments);
    });


    /**
     * Returns an asyncAction that will resolve with the attributes stored at the given URN.
     *
     * @method getAttributes
     * @param {String} [subjectId] – The authenticated identity to get attributes for.
     * @return {ozpIwc.util.AsyncAction} – Resolves an object of the attributes of the subject.
     * @example URN "ozp:storage:myAttrs" may contain "ozp:iwc:loginTime" and "ozp:iwc:name".
     * getAttributes("ozp:storage:myAttrs") would resolve with the following:
     * ```
     * {
     *      'ozp:iwc:loginTime' : {
     *         'attributeValue': Array<Primative>
     *     },
     *      'ozp:iwc:name' : {
     *         'attributeValue': Array<Primative>
     *     }
     * }
     * ```
     */
    PIP.prototype.getAttributes = function (id) {
        var asyncAction = new util.AsyncAction();
        var self = this;

        if (this.attributes[id]) {
            return asyncAction.resolve('success', self.attributes[id]);
        } else {
            util.ajax({
                href: id,
                method: "GET"
            }).then(function (data) {
                if (typeof data !== "object") {
                    return asyncAction.resolve('failure', "Invalid data loaded from the remote PIP");
                }
                self.attributes[id] = {};
                for (var i in data) {
                    self.attributes[id][i] = util.ensureArray(data[i]);
                }
                asyncAction.resolve('success', self.attributes[id]);
            })['catch'](function (err) {
                asyncAction.resolve('failure', err);
            });
            return asyncAction;
        }

    };
    /**
     * Sets the desired attributes in the cache at the specified URN.
     *
     * @method grantAttributes
     * @param {String} [subjectId] – The recipient of attributes.
     * @param {object} [attributes] – The attributes to grant (replacing previous values, if applicable)
     */
    PIP.prototype.grantAttributes = function (subjectId, attributes) {
        var attrs = {};
        for (var i in attributes) {
            attrs[i] = util.ensureArray(attributes[i]);
        }
        this.attributes[subjectId] = attrs;
    };

    /**
     * Merges the attributes stored at the parentId urn into the given subject. All merge conflicts take the parent
     * attribute. Will resolve with the subject when completed.
     *
     * @method grantParent
     * @param {String} [subjectId] – The recipient of attributes.
     * @param {String} [parentSubjectId] – The subject to inherit attributes from.
     * @return {ozpIwc.util.AsyncAction} resolves with the subject and its granted attributes merged in.
     */
    PIP.prototype.grantParent = function (subjectId, parentId) {
        var asyncAction = new util.AsyncAction();
        this.attributes[subjectId] = this.attributes[subjectId] || {};
        var self = this;

        if (self.attributes[parentId]) {
            for (var i in self.attributes[parentId]) {
                self.attributes[subjectId][i] = self.attributes[subjectId][i] || [];
                for (var j in self.attributes[parentId][i]) {
                    if (self.attributes[subjectId][i].indexOf(self.attributes[parentId][i][j]) < 0) {
                        self.attributes[subjectId][i].push(self.attributes[parentId][i][j]);
                    }
                }
            }
            return asyncAction.resolve('success', self.attributes[subjectId]);

        } else {
            self.getAttributes(parentId)
                .success(function (attributes) {
                    for (var i in attributes) {
                        if (self.attributes[subjectId].indexOf(attributes[i]) < 0) {
                            self.attributes[subjectId].push(attributes[i]);
                        }
                    }
                    asyncAction.resolve('success', self.attributes[subjectId]);
                }).failure(function (err) {
                    asyncAction.resolve('failure', err);
                });
            return asyncAction;
        }
    };

    /**
     * For the given attribute name, figure out what the value of that attribute should be
     * given the two values.
     * @TODO Currently, this just promotes the two scalars to a bag
     *
     * @method combineAttributeValues
     * @param {type} attributeName
     * @param {type} value1
     * @param {type} value2
     * @return {Array}
     */
    PIP.prototype.combineAttributeValues = function (attributeName, value1, value2) {
        return [value1, value2];
    };

    /**
     * Creates an attribute set that's the union of the two given attribute sets
     *
     * @method attributeUnion
     * @param {object} attr1
     * @param {object} attr2
     * @return {object}
     */
    PIP.prototype.attributeUnion = function (attr1, attr2) {
        var rv = {};
        util.object.eachEntry(attr1, function (key, value) {
            if (Array.isArray(value)) {
                rv[key] = value.slice();
            } else {
                rv[key] = value;
            }
        });
        util.object.eachEntry(attr2, function (key, value) {
            if (!(key in rv)) {
                rv[key] = value;
            } else if (Array.isArray(rv[key])) {
                rv[key] = rv[key].concat(value);
            } else {
                rv[key] = this.combineAttributeValues(rv[key], value);
            }
        }, this);
        return rv;
    };

    return PIP;
}(ozpIwc.policyAuth, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.policyAuth = ozpIwc.policyAuth || {};
ozpIwc.policyAuth.points = ozpIwc.policyAuth.points || {};

/**
 * @module ozpIwc.policyAuth
 * @submodule ozpIwc.policyAuth.points
 */

ozpIwc.policyAuth.points.PRP = (function (policyAuth, util) {
    /**
     * Policy Repository Point
     * @class PRP
     * @namespace ozpIwc.policyAuth.points
     * @param [config]
     * @param {Array} [config.persistentPolicies]
     * @param {Object} [config.policyCache]
     * @constructor
     */
    var PRP = function (config) {
        config = config || {};

        /**
         * @property persistentPolicies
         * @type {Array}
         */
        this.persistentPolicies = config.persistentPolicies || [];

        /**
         * @property policyCache
         * @type {Object}
         */
        this.policyCache = config.policyCache || policyAuth.policies;
    };

    /**
     * Gathers policies by their URN. These policies may need formatting by the formatPolicies function to gather any
     * attribute data needed for the policy evaluation.
     * If a policy cannot be found, it is labeled as a "denyAll" policy and placed in the cache. Thus, making any
     * permission check using said policy always deny.
     *
     * @method getPolicy(policyURIs)
     * @param {String | Array<String> } [policyURIs] The subject attributes or id performing the action.
     * @param {String} [combiningAlgorithm] Defaults to “deny-overrides”.
     * @return {ozpIwc.util.AsyncAction} will resolve with an array of policy data.
     */
    PRP.prototype.getPolicies = function (policyURIs) {
        var asyncAction = new util.AsyncAction();
        policyURIs = policyURIs || [];
        policyURIs = util.ensureArray(policyURIs);
        var policies = [];

        var policiesToGather = this.persistentPolicies.concat(policyURIs);
        for (var i in policiesToGather) {
            if (this.policyCache[policiesToGather[i]]) {
                policies.push(util.clone(this.policyCache[policiesToGather[i]]));
            } else {
                var async = this.fetchPolicy(policiesToGather[i]);

                //Push the policy fetch to the array, when it resolves its value (policy) will be part of the array
                policies.push(async);
            }
        }

        // If there are no policies to check against, assume trivial and permit
        if (policies.length === 0) {
            return asyncAction.resolve('success', [policyAuth.policies.permitAll]);
        }

        return util.AsyncAction.all(policies);
    };


    /**
     * The URN of the default combining algorithm to use when basing a decision on multiple rules in a policy.
     * @TODO not used.
     * @property defaultCombiningAlgorithm
     * @type {String}
     * @default 'deny-overrides'
     */
    PRP.prototype.defaultCombiningAlgorithm = 'deny-overrides';

    /**
     * Fetches the requested policy and stores a copy of it in the cache. Returns a denyAll if policy is unobtainable.
     * @method fetchPolicy
     * @param {String} policyURI the uri to gather the policy from
     * @return {util.AsyncAction} will resolve with the gathered policy constructed as an ozpIwc.policyAuth.Policy.
     */
    PRP.prototype.fetchPolicy = function (policyURI) {
        var asyncAction = new util.AsyncAction();
        var self = this;
        util.ajax({
            'method': "GET",
            'href': policyURI
        }).then(function (data) {
            self.policyCache[policyURI] = self.formatPolicy(data.response);
            asyncAction.resolve('success', util.clone(self.policyCache[policyURI]));
        })['catch'](function (e) {
            //Note: failure resolves success because we force a denyAll policy.
            asyncAction.resolve('success', self.getDenyall(policyURI));
        });
        return asyncAction;
    };

    /**
     * Turns JSON data in to ozpIwc.policyAuth.Policy
     * @method formatPolicy
     * @param data
     * @return {ozpIwc.policyAuth.Policy}
     */
    PRP.prototype.formatPolicy = function (data) {
        return new policyAuth.Policy(data);
    };

    /**
     * Returns a policy that will always deny any request. Said policy is stored in the cache under the given URN
     * @param urn
     * @return {ozpIwc.policyAuth.Policy} a denyAll policy
     */
    PRP.prototype.getDenyall = function (urn) {
        if (this.policyCache[urn]) {
            return this.policyCache[urn];
        } else {
            this.policyCache[urn] = policyAuth.policies.denyAll;
            return this.policyCache[urn];
        }
    };

    return PRP;
}(ozpIwc.policyAuth, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.policyAuth = ozpIwc.policyAuth || {};
ozpIwc.policyAuth.points = ozpIwc.policyAuth.points || {};

/**
 * @module ozpIwc.policyAuth
 * @submodule ozpIwc.policyAuth.points
 */

/**
 * A static collection of utility methods for the ozpIwc.policyAuth.points namespace.
 * @class utils
 * @static
 * @namespace ozpIwc.policyAuth.points
 * @type {Object}
 */
ozpIwc.policyAuth.points.utils = (function (util) {
    /**
     * @method formatAttributes
     * @static
     * @param {Array} attributes
     * @param {ozpIwc.policyAuth.points.PIP} [pip]
     * @return {ozpIwc.util.AsyncAction}
     */
    var formatAttributes = function (attributes, pip) {
        var asyncAction = new util.AsyncAction();
        if (!pip) {
            return asyncAction.resolve("failure", "A PIP is required to format attributes.");
        }

        attributes = util.ensureArray(attributes);

        var asyncs = [];
        for (var i in attributes) {
            asyncs.push(formatAttribute(attributes[i], pip));
        }
        util.AsyncAction.all(asyncs).success(function (attrs) {
            var retObj = {};
            for (var i in attrs) {
                if (Object.keys(attrs[i]).length > 0) {
                    for (var j in attrs[i]) {
                        retObj[j] = attrs[i][j];
                    }
                }
            }
            asyncAction.resolve("success", retObj);
        });

        return asyncAction;
    };

    /**
     * Takes a URN, array of urns, object, array of objects, or array of any combination and fetches/formats to the
     * necessary structure to be used by a request of policy's category object.
     *
     * @method formatAttribute
     * @static
     * @param {String|Object|Array<String|Object>}attribute The attribute to format
     * @param {ozpIwc.policyAuth.points.PIP} [pip] Policy information point, uses ozpIwc.authorization.pip by default.
     * @return {ozpIwc.util.AsyncAction} returns an async action that will resolve with an object of the formatted
     *     attributes. each attribute is ID indexed in the object, such that the formatting of id
     *                               `ozp:iwc:node` which has attributes `a` and `b`would resolve as follows:
     *
     * ```
     *  {
     *      'ozp:iwc:node': {
     *          <attributeValue>: ['a','b']
     *      }
     *  }
     * ```
     *
     */
    var formatAttribute = function (attribute, pip) {
        var asyncAction = new util.AsyncAction();
        if (!pip) {
            return asyncAction.resolve("failure", "A PIP is required to format attributes.");
        }

        if (!attribute) {
            //do nothing and return an empty object.
            asyncAction.resolve('success', {});

        } else if (typeof attribute === "string") {
            // If its a string, use it as a key and fetch its attrs from PIP
            pip.getAttributes(attribute)
                .success(function (attr) {
                    //TODO check if is an array or string (APPLY RECURSION!)
                    asyncAction.resolve("success", attr);
                });

        } else if (Array.isArray(attribute)) {
            // If its an array, its multiple actions. Wrap as needed
            return formatAttributes(attribute, pip);

        } else if (typeof attribute === "object") {
            // If its an object, make sure each key's value is an array.
            var keys = Object.keys(attribute);
            for (var i in keys) {
                var tmp = attribute[keys[i]];
                if (['string', 'number', 'boolean'].indexOf(typeof attribute[keys[i]]) >= 0) {
                    attribute[keys[i]] = [tmp];
                }
                attribute[keys[i]] = attribute[keys[i]] || [];
            }
            asyncAction.resolve("success", attribute);
        }
        return asyncAction;
    };

    /**
     * Formats an action to be used by a request or policy. Actions are not gathered from the Policy Information Point.
     * Rather they are string values explaining the operation to be permitted. To comply with XACML, these strings are
     * wrapped in objects for easier comparison
     *
     * @method formatAction
     * @static
     * @param {String|Object|Array<String|Object>} action
     * @return {Object} An object of formatted actions indexed by the ozp action id `ozp:action:id`.
     *                   An example output for actions ['read','write'] is as follows:
     *
     * ```
     *  {
     *      'ozp:iwc:action': {
     *          <attributeValue>: ['read', 'write']
     *      }
     *  }
     * ```
     *
     */
    var formatAction = function (action) {

        var formatted = [];

        var objectHandler = function (object, formatted) {
            var values;
            // We only care about attributeValues
            if (object['ozp:iwc:action']) {
                values = object['ozp:iwc:action'];
            }
            if (Array.isArray(values)) {
                return arrayHandler(values, formatted);
            } else if (['string', 'number', 'boolean'].indexOf(typeof values) >= 0) {
                if (formatted.indexOf(values) < 0) {
                    formatted.push(values);
                }
            }
        };
        var arrayHandler = function (array, formatted) {
            for (var i in array) {
                if (typeof array[i] === 'string') {
                    if (formatted.indexOf(array[i]) < 0) {
                        formatted.push(array[i]);
                    }
                } else if (Array.isArray(array[i])) {
                    arrayHandler(array[i], formatted);
                } else if (typeof array[i] === 'object') {
                    objectHandler(array[i], formatted);
                }
            }
        };

        if (!action) {
            //do nothing and return an empty array
        } else if (typeof action === "string") {
            // If its a string, its a single action.
            formatted.push(action);
        } else if (Array.isArray(action)) {
            arrayHandler(action, formatted);
        } else if (typeof action === 'object') {
            objectHandler(action, formatted);
        }

        return {'ozp:iwc:action': formatted};
    };

    /**
     * Takes a request object and applies any context needed from the PIP.
     *
     * @method formatRequest
     * @static
     * @param {Object}          request
     * @param {String|Array<String>|Object}    request.subject URN(s) of attribute to gather, or formatted subject
     *     object
     * @param {String|Array<String>Object}     request.resource URN(s) of attribute to gather, or formatted resource
     *     object
     * @param {String|Array<String>Object}     request.action URN(s) of attribute to gather, or formatted action object
     * @param {String}                         request.combiningAlgorithm URN of combining algorithm
     * @param {Array<String|ozpIwc.policyAuth.Policy>}   request.policies either a URN or a formatted policy
     * @param {ozpIwc.policyAuth.points.PIP} [pip] custom policy information point for attribute gathering.
     * @return {ozpIwc.util.AsyncAction}  will resolve when all attribute formatting completes. The resolution will
     *     pass a formatted structured as so:
     * ```
     *  {
     *      'category':{
     *          'subject': {
     *              <AttributeId>: {
     *                  <AttributeValue>: Array<Primitive>
     *              }
     *          },
     *          'resource': {
     *              <AttributeId>: {
     *                  <AttributeValue>: Array<Primitive>
     *              }
     *          },
     *          'action': {
     *              "ozp:iwc:action": {
     *                  "attributeValues": Array<String>
     *              }
     *          }
     *      },
     *      'combiningAlgorithm': request.combiningAlgorithm,
     *      'policies': request.policies
     *  }
     * ```
     */
    var formatRequest = function (request, pip) {
        var asyncAction = new util.AsyncAction();
        if (!pip) {
            return asyncAction.resolve("failure", "A PIP is required to format requests.");
        }
        request = request || {};
        request.subject = request.subject || {};
        request.resource = request.resource || {};
        request.action = request.action || {};
        if (!request.combiningAlgorithm) {
            return asyncAction.resolve("failure", "request.combiningAlgorithm is required to format requests.");
        }
        var asyncs = [];

        var subjectAsync = formatAttribute(request.subject, pip);
        var resourceAsync = formatAttribute(request.resource, pip);
        var actions = formatAction(request.action);

        asyncs.push(subjectAsync, resourceAsync, actions);

        util.AsyncAction.all(asyncs)
            .success(function (gatheredAttributes) {
                var sub = gatheredAttributes[0];
                var res = gatheredAttributes[1];
                var act = gatheredAttributes[2];
                asyncAction.resolve('success', {
                    'category': {
                        "subject": sub,
                        "resource": res,
                        "action": act
                    },
                    'combiningAlgorithm': request.combiningAlgorithm,
                    'policies': request.policies
                });
            }).failure(function (err) {
                asyncAction.resolve('failure', err);
            });

        return asyncAction;
    };

    /**
     * Formats a category object. If needed the attribute data is gathered from the PIP.
     *
     * @method formatCategory
     * @static
     * @param {String|Array<String>|Object} category the category (subject,resource,action) to format
     * @param {String} categoryId the category name used to map to its corresponding attributeId (see PDP.mappedID)
     * @param {ozpIwc.policyAuth.points.PIP} [pip] custom policy information point for attribute gathering.
     * @return {ozpIwc.util.AsyncAction}  will resolve with a category object formatted as so:
     * ```
     *  {
     *      <AttributeId>: {
     *          <attributeValue>: {Array<Primative>}
     *      }
     *  }
     * ```
     *
     */
    var formatCategory = function (category, pip) {
        var asyncAction = new util.AsyncAction();
        if (!pip) {
            return asyncAction.resolve("failure", "A PIP is required to format requests.");
        }

        if (!category) {
            return asyncAction.resolve('success');
        }

        formatAttribute(category, pip)
            .success(function (attributes) {
                for (var i in attributes['ozp:iwc:permissions']) {
                    attributes[i] = attributes['ozp:iwc:permissions'][i];
                }
                delete attributes['ozp:iwc:permissions'];
                asyncAction.resolve('success', attributes);
            }).failure(function (err) {
                asyncAction.resolve('failure', err);
            });
        return asyncAction;
    };

    /**
     *
     * Category context handling for policy objects.
     * Takes object key-indexed categories for a policy
     * and returns an object key-indexed listing of formatted. Each category is keyed by its XACML URN. currently only
     * subject,resource, and action categories are supported.
     *
     * @method formatCategories
     * @static
     * @param {Object} categoryObj An object of categories to format.
     * @param {Object|String|Array<String|Object>}[categoryObj[<categoryId>]] A category to format
     * @param {ozpIwc.policyAuth.points.PIP} [pip] custom policy information point for attribute gathering.
     * @return {ozpIwc.util.AsyncAction} will resolve an object of categories be structured as so:
     * ```
     * {
     *   <categoryId> : {
     *      <AttributeId>:{
     *          <attributeValue> : Array<Primitive>
     *      },
     *      <AttributeId>:{
     *          <attributeValue> : Array<Primitive>
     *      }
     *   },
     *   <categoryId>: {...},
     *   ...
     * }
     * ```
     */
    var formatCategories = function (categoryObj, pip) {
        var asyncAction = new util.AsyncAction();
        if (!pip) {
            return asyncAction.resolve("failure", "A PIP is required to format requests.");
        }

        var categoryAsyncs = [];
        var categoryIndexing = {};
        for (var i in categoryObj) {
            categoryAsyncs.push(formatCategory(categoryObj[i], pip));
            categoryIndexing[i] = categoryAsyncs.length - 1;
        }
        util.AsyncAction.all(categoryAsyncs)
            .success(function (categories) {
                var map = {};
                var keys = Object.keys(categoryIndexing);
                for (var i in keys) {
                    map[keys[i]] = categories[categoryIndexing[keys[i]]] || {};
                }
                asyncAction.resolve('success', map);
            }).failure(function (err) {
                asyncAction.resolve('failure', err);
            });

        return asyncAction;
    };

    return {
        formatAttribute: formatAttribute,
        formatAttributes: formatAttributes,
        formatAction: formatAction,
        formatRequest: formatRequest,
        formatCategory: formatCategory,
        formatCategories: formatCategories
    };

}(ozpIwc.util));
var ozpIwc = ozpIwc || {};
ozpIwc.policyAuth = ozpIwc.policyAuth || {};

/**
 * @module ozpIwc.policyAuth
 */
/**
 * Attribute Based Access Control policies.
 * @class policies
 * @namespace ozpIwc.policyAuth
 * @static
 */
ozpIwc.policyAuth.policies = (function (policies, util) {

//---------------------------------------------------------
//  Private Methods
//---------------------------------------------------------
    /**
     * Determines if a request should be permitted by comparing its action to the requested policies action. Then
     * testing if the request subject passes all of the request resources.
     * @method defaultPolicy
     * @private
     * @param {Object} request
     * @param {Object} action
     * @return {String} NotApplicable, Deny, or Permit
     */
    var defaultPolicy = function (request, action) {
        action = util.ensureArray(action);
        if (!util.arrayContainsAll(action, request.action['ozp:iwc:action'])) {
            return "NotApplicable";
        } else if (!util.objectContainsAll(request.subject, request.resource, policies.implies)) {
            return "Deny";
        } else {
            return "Permit";
        }
    };

//---------------------------------------------------------
//  Public Methods
//---------------------------------------------------------
    /**
     * Returns `permit` when the request's object exists and is empty.
     *
     * @static
     * @method permitWhenObjectHasNoAttributes
     * @param request
     * @return {String}
     */
    policies.permitWhenObjectHasNoAttributes = function (request) {
        if (request.object && Object.keys(request.object).length === 0) {
            return "Permit";
        }
        return "Undetermined";
    };

    /**
     * Returns `permit` when the request's subject contains all of the request's object.
     *
     * @static
     * @method subjectHasAllObjectAttributes
     * @param request
     * @return {String}
     */
    policies.subjectHasAllObjectAttributes = function (request) {
        // if no object permissions, then it's trivially true
        if (!request.object) {
            return "Permit";
        }
        var subject = request.subject || {};
        if (util.objectContainsAll(subject, request.object, this.implies)) {
            return "Permit";
        }
        return "Deny";
    };

    /**
     * Returns `permit` for any scenario.
     *
     * @static
     * @method permitAll
     * @return {String}
     */
    policies.permitAll = function () {
        return "Permit";
    };


    /**
     * Returns `Deny` for any scenario.
     *
     * @static
     * @method denyAll
     * @return {String}
     */
    policies.denyAll = function () {
        return "Deny";
    };


    /**
     * Applies trivial logic to determining a subject's containing of object values
     * @static
     * @method implies
     * @param {Array} subjectVal
     * @param {Array} objectVal
     * @return {Boolean}
     */
    policies.implies = function (subjectVal, objectVal) {
        // no object value is trivially true
        if (objectVal === undefined || objectVal === null) {
            return true;
        }
        // no subject value when there is an object value is trivially false
        if (subjectVal === undefined || subjectVal === null) {
            return false;
        }

        // convert both to arrays, if necessary
        subjectVal = util.ensureArray(subjectVal);
        objectVal = util.ensureArray(objectVal);

        // confirm that every element in objectVal is also in subjectVal
        return util.arrayContainsAll(subjectVal, objectVal);
    };

    /**
     * Allows origins to connect that are included in the hard coded whitelist.
     * @method policy://ozpIwc/connect
     * @param request
     * @return {String}
     */
    policies['policy://ozpIwc/connect'] = function (request) {
        var policyActions = ['connect'];

        if (!util.arrayContainsAll(policyActions, request.action['ozp:iwc:action'])) {
            return "NotApplicable";
        } else {
            return "Permit";
        }
    };

    /**
     * Applies the sendAs policy requirements to a default policy. The given request must have an action of 'sendAs'.
     * @method policy://policy/sendAs
     * @param request
     * @param {Object} request.subject
     * @param {Object} request.resource
     * @return {String}
     */
    policies['policy://policy/sendAs'] = function (request) {
        return defaultPolicy(request, 'sendAs');
    };

    /**
     * Applies the receiveAs policy requirements to a default policy. The given request must have an action of
     * 'receiveAs'.
     * @method policy://policy/receiveAs
     * @param request
     * @param {Object} request.subject
     * @param {Object} request.resource
     * @return {String}
     */
    policies['policy://policy/receiveAs'] = function (request) {
        return defaultPolicy(request, 'receiveAs');
    };

    /**
     * Applies the read policy requirements to a default policy. The given request must have an action of 'read'.
     * @method policy://policy/read
     * @param request
     * @param {Object} request.subject
     * @param {Object} request.resource
     * @return {String}
     */
    policies['policy://policy/read'] = function (request) {
        return defaultPolicy(request, 'read');
    };

    /**
     * Applies the api access policy requirements to a default policy. The given request must have an action of
     * 'access'.
     * @method policy://policy/apiNode
     * @param request
     * @param {Object} request.subject
     * @param {Object} request.resource
     * @return {String}
     */
    policies['policy://policy/apiNode'] = function (request) {
        return defaultPolicy(request, 'access');
    };

    return policies;
}(ozpIwc.policyAuth.policies || {}, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.policyAuth = ozpIwc.policyAuth || {};

/**
 * @module ozpIwc.policyAuth
 */

/**
 * @class PolicyCombining
 * @namespace ozpIwc.policyAuth
 * @static
 */
ozpIwc.policyAuth.PolicyCombining = (function (PolicyCombining) {

    /**
     * @method deny-overrides
     * @static
     * @param {Object} policies
     * @param {Object} request
     */
    PolicyCombining['deny-overrides'] = function (policies, request) {
        var atLeastOneErrorD,
            atLeastOneErrorP,
            atLeastOneErrorDP,
            atLeastOnePermit = false;

        for (var i in policies) {
            var decision = policies[i](request);
            switch (decision) {
                case "Deny":
                    return "Deny";
                case "Permit":
                    atLeastOnePermit = true;
                    break;
                case "NotApplicable":
                    continue;
                case "Indeterminate{D}":
                    atLeastOneErrorD = true;
                    break;
                case "Indeterminate{P}":
                    atLeastOneErrorP = true;
                    break;
                case "Indeterminate{DP}":
                    atLeastOneErrorDP = true;
                    break;
                default:
                    continue;
            }
        }

        if (atLeastOneErrorDP) {
            return "Indeterminate{DP}";
        } else if (atLeastOneErrorD && (atLeastOneErrorP || atLeastOnePermit)) {
            return "Indeterminate{DP}";
        } else if (atLeastOneErrorD) {
            return "Indeterminate{D}";
        } else if (atLeastOnePermit) {
            return "Permit";
        } else if (atLeastOneErrorP) {
            return "Indeterminate{P}";
        }

        return "NotApplicable";
    };

    /**
     * @method permit-overrides
     * @todo
     */
    PolicyCombining['permit-overrides'] = function () {};

    /**
     * @method first-applicable
     * @todo
     */
    PolicyCombining['first-applicable'] = function () {};

    /**
     * @method only-one-applicable
     * @todo
     */
    PolicyCombining['only-one-applicable'] = function () {};

    /**
     * @method ordered-deny-overrides
     * @todo
     */
    PolicyCombining['ordered-deny-overrides'] = function () {};

    /**
     * @method ordered-permit-overrides
     * @todo
     */
    PolicyCombining['ordered-permit-overrides'] = function () {};

    /**
     * @method deny-unless-permit
     * @todo
     */
    PolicyCombining['deny-unless-permit'] = function () {};

    /**
     * @method permit-unless-deny
     * @todo
     */
    PolicyCombining['permit-unless-deny'] = function () {};

    return PolicyCombining;
}(ozpIwc.policyAuth.PolicyCombining || {}));
var ozpIwc = ozpIwc || {};
ozpIwc.network = ozpIwc.network || {};

/**
 * @module ozpIwc
 * @submodule ozpIwc.network
 */

ozpIwc.network.KeyBroadcastLocalStorageLink = (function (log, util) {
    /**
     * <p>This link connects peers using the HTML5 localstorage API.  It is a second generation version of
     * the localStorageLink that bypasses most of the garbage collection issues.
     *
     * <p> When a packet is sent, this link turns it to a string, creates a key with that value, and
     * immediately deletes it.  This still sends the storage event containing the packet as the key.
     * This completely eliminates the need to garbage collect the localstorage space, with the associated
     * mutex contention and full-buffer issues.
     *
     * @todo Compress the key
     *
     * @class KeyBroadcastLocalStorageLink
     * @namespace ozpIwc.network
     * @constructor
     *
     * @param {Object} [config] Configuration for this link
     * @param {ozpIwc.network.Peer} [config.peer=ozpIwc.defaultPeer] The peer to connect to.
     * @param {ozpIwc.metric.Registry} [config.metrics] The metric registry to put this modules metrics in. If no
     *     registry metrics not taken
     * @param {String} [config.prefix='ozpIwc'] Namespace for communicating, must be the same for all peers on the same
     *     network.
     * @param {String} [config.selfId] Unique name within the peer network.  Defaults to the peer id.
     * @param {Number} [config.maxRetries] Number of times packet transmission will retry if failed. Defaults to 6.
     * @param {Number} [config.queueSize] Number of packets allowed to be queued at one time. Defaults to 1024.
     * @param {Number} [config.fragmentSize] Size in bytes of which any TransportPacket exceeds will be sent in
     *     FragmentPackets.
     * @param {Number} [config.fragmentTime] Time in milliseconds after a fragment is received and additional expected
     * fragments are not received that the message is dropped.
     */
    var Link = function (config) {
        config = config || {};
        if (!config.peer) {
            throw Error("KeyBroadcastLocalStorageLink must be configured with a peer");
        }

        /**
         * Namespace for communicating, must be the same for all peers on the same network.
         * @property prefix
         * @type String
         * @default "ozpIwc"
         */
        this.prefix = config.prefix || 'ozpIwc';

        /**
         * The peer this link will connect to.
         * @property peer
         * @type ozpIwc.network.Peer
         */
        this.peer = config.peer;

        /**
         * Unique name within the peer network.  Defaults to the peer id.
         * @property selfId
         * @type String
         * @default ozpIwc.network.Peer.selfId
         */
        this.selfId = config.selfId || this.peer.selfId;


        /**
         * Metric registry to store metrics on this link.
         * @property metrics
         * @type {ozpIwc.metric.Registry}
         */
        this.metrics = config.metrics;

        if (this.metrics) {
            this.metricsPrefix = "keyBroadcastLocalStorageLink." + this.selfId;
            this.droppedFragmentsCounter = this.metrics.counter(this.metricsPrefix, 'fragmentsDropped');
            this.fragmentsReceivedCounter = this.metrics.counter(this.metricsPrefix, 'fragmentsReceived');

            this.packetsSentCounter = this.metrics.counter(this.metricsPrefix, 'packetsSent');
            this.packetsReceivedCounter = this.metrics.counter(this.metricsPrefix, 'packetsReceived');
            this.packetParseErrorCounter = this.metrics.counter(this.metricsPrefix, 'packetsParseError');
            this.packetsFailedCounter = this.metrics.counter(this.metricsPrefix, 'packetsFailed');

            this.latencyInTimer = this.metrics.timer(this.metricsPrefix, 'latencyIn');
            this.latencyOutTimer = this.metrics.timer(this.metricsPrefix, 'latencyOut');
        }
        /**
         * Milliseconds to wait before deleting this link's keys
         * @todo UNUSUED
         * @property myKeysTimeout
         * @type Number
         * @default 5000
         */
        this.myKeysTimeout = config.myKeysTimeout || 5000; // 5 seconds

        /**
         * Milliseconds to wait before deleting other link's keys
         * @todo UNUSUED
         * @property otherKeysTimeout
         * @type Number
         * @default 120000
         */
        this.otherKeysTimeout = config.otherKeysTimeout || 2 * 60000; // 2 minutes


        /**
         * The maximum number of retries the link will take to send a package. A timeout of
         * max(1, 2^( <retry count> -1) - 1) milliseconds occurs between send attempts.
         * @property maxRetries
         * @type Number
         * @default 6
         */
        this.maxRetries = config.maxRetries || 6;

        /**
         * Maximum number of packets that can be in the send queue at any given time.
         * @property queueSize
         * @type Number
         * @default 1024
         */
        this.queueSize = config.queueSize || 1024;

        /**
         * A queue for outgoing packets. If this queue is full further packets will not be added.
         * @property sendQueue
         * @type Array[]
         * @default []
         */
        this.sendQueue = this.sendQueue || [];

        /**
         * An array of temporarily held received packet fragments indexed by their message key.
         * @type Array[]
         * @default []
         */
        this.fragments = this.fragments || [];

        /**
         * Minimum size in bytes that a packet will broken into fragments.
         * @property fragmentSize
         * @type Number
         * @default 1310720
         */
        this.fragmentSize = config.fragmentSize || (5 * 1024 * 1024) / 2 / 2; //50% of 5mb, divide by 2 for utf-16
                                                                              // characters

        /**
         * The amount of time allotted to the Link to wait between expected fragment packets. If an expected fragment
         * is not received within this timeout the packet is dropped.
         * @property fragmentTimeout
         * @type Number
         * @default 1000
         */
        this.fragmentTimeout = config.fragmentTimeout || 1000; // 1 second

        //Add fragmenting capabilities
        String.prototype.chunk = function (size) {
            var res = [];
            for (var i = 0; i < this.length; i += size) {
                res.push(this.slice(i, i + size));
            }
            return res;
        };

        // Hook into the system
        var self = this;
        var packet;
        var receiveStorageEvent = function (event) {
            if (event.key !== util.localStorageKey) {
                return;
            }
            if (event.newValue) {
                try {
                    packet = JSON.parse(event.newValue);
                } catch (e) {
                    log.error("Parse error on " + event.newValue);
                    if (self.metrics) {
                        self.packetParseErrorCounter.inc();
                    }
                    return;
                }
                if (packet.data.fragment) {
                    self.handleFragment(packet);
                } else {
                    forwardToPeer(self, packet);
                }
            }
        };
        if (util.getInternetExplorerVersion() >= 0) {
            // IE can keep storage events between refreshes.  If we give it a second, it'll
            // dump all of them on the floor
            setTimeout(function () {
                util.addEventListener('storage', receiveStorageEvent);
            }, 500);
        } else {
            util.addEventListener('storage', receiveStorageEvent);
        }

        this.peer.on("send", function (event) {
            self.send(event.packet);
        });

        this.peer.on("beforeShutdown", function () {
            util.removeEventListener('storage', receiveStorageEvent);
        }, this);

    };

//--------------------------------------------------
//          Private Methods
//--------------------------------------------------
    /**
     * Passes the received packet to the local Peer component.
     * @method forwardToPeer
     * @private
     * @static
     * @param {ozpIwc.network.KeyBroadcastLocalStorageLink} link
     * @param {ozpIwc.packet.Transport} packet
     */
    var forwardToPeer = function (link, packet) {
        link.peer.receive(link.linkId, packet);
        if (link.metrics) {
            link.packetsReceivedCounter.inc();
        }
        if (packet.data.time) {
            if (link.metrics) {
                link.latencyInTimer.mark(util.now() - packet.data.time);
            }
        }
    };

    /**
     *  Stores a received fragment. When the first fragment of a message is received, a timer is set to destroy the
     * storage of the message fragments should not all messages be received.
     *
     * @method storeFragment
     * @private
     * @static
     * @param {ozpIwc.network.KeyBroadcastLocalStorageLink} link
     * @param {ozpIwc.packet.Network} packet NetworkPacket containing an {{#crossLink
     *     "ozpIwc.FragmentPacket"}}{{/crossLink}} as its data property
     *
     * @return {Boolean} result true if successful.
     */
    var storeFragment = function (link, packet) {
        if (!packet.data.fragment) {
            return null;
        }

        // NetworkPacket properties
        var sequence = packet.sequence;
        var srcPeer = packet.srcPeer;
        // FragmentPacket Properties
        var key = packet.data.msgId;
        var id = packet.data.id;
        var chunk = packet.data.chunk;
        var total = packet.data.total;

        if (key === undefined || id === undefined) {
            return null;
        }

        // If this is the first fragment of a message, add the storage object
        if (!link.fragments[key]) {
            link.fragments[key] = {};
            link.fragments[key].chunks = [];

            link.key = key;
            link.total = total;

            // Add a timeout to destroy the fragment should the whole message not be received.
            link.fragments[key].timeoutFunc = function () {
                if (link.metrics) {
                    link.droppedFragmentsCounter.inc(link.total);
                }
                delete link.fragments[link.key];
            };
        }

        // Restart the fragment drop countdown
        clearTimeout(link.fragments[key].fragmentTimer);
        link.fragments[key].fragmentTimer = setTimeout(link.fragments[key].timeoutFunc, link.fragmentTimeout);

        // keep a copy of properties needed for defragmenting, the last sequence & srcPeer received will be
        // reused in the defragmented packet
        link.fragments[key].total = total || link.fragments[key].total;
        link.fragments[key].sequence = (sequence !== undefined) ? sequence : link.fragments[key].sequence;
        link.fragments[key].srcPeer = srcPeer || link.fragments[key].srcPeer;
        link.fragments[key].chunks[id] = chunk;

        // If the necessary properties for defragmenting aren't set the storage fails
        if (link.fragments[key].total === undefined || link.fragments[key].sequence === undefined ||
            link.fragments[key].srcPeer === undefined) {
            return null;
        } else {
            if (link.metrics) {
                link.fragmentsReceivedCounter.inc();
            }
            return true;
        }
    };

    /**
     * Rebuilds the original packet sent across the keyBroadcastLocalStorageLink from the fragments it was broken up
     * into.
     *
     * @method defragmentPacket
     * @private
     * @static
     * @param {ozpIwc.packet.FragmentStore} fragments the grouping of fragments to reconstruct
     * @return {ozpIwc.packet.Network} result the reconstructed NetworkPacket with TransportPacket as its data
     *     property.
     */
    var defragmentPacket = function (fragments) {
        if (fragments.total !== fragments.chunks.length) {
            return null;
        }
        try {
            var result = JSON.parse(fragments.chunks.join(''));
            return {
                defragmented: true,
                sequence: fragments.sequence,
                srcPeer: fragments.srcPeer,
                data: result
            };
        } catch (e) {
            return null;
        }
    };

    /**
     * Places a packet in the {{#crossLink "ozpIwc.KeyBroadcastLocalStorageLink/sendQueue:property"}}{{/crossLink}}
     * if it does not already hold {{#crossLink "ozpIwc.KeyBroadcastLocalStorageLink/queueSize:property"}}{{/crossLink}}
     * amount of packets.
     *
     * @method queueSend
     * @private
     * @static
     * @param {ozpIwc.network.KeyBroadcastLocalStorageLink} link
     * @param {ozpIwc.packet.Transport} packet
     */
    var queueSend = function (link, packet) {
        if (link.sendQueue.length < link.queueSize) {
            link.sendQueue = link.sendQueue.concat(packet);
            while (link.sendQueue.length > 0) {
                attemptSend(link, link.sendQueue.shift());
            }
        } else {
            if (link.metrics) {
                link.packetsFailedCounter.inc();
            }
            log.error("Failed to write packet(len=" + packet.length + "):" + " Send queue full.");
        }
    };

    /**
     * Recursively tries sending the packet
     * {{#crossLink "ozpIwc.KeyBroadcastLocalStorageLink/maxRetries:property"}}{{/crossLink}} times.
     * The packet is dropped and the send fails after reaching max attempts.
     *
     * @method attemptSend
     * @private
     * @static
     *
     * @param {ozpIwc.network.KeyBroadcastLocalStorageLink} link
     * @param {ozpIwc.packet.Network} packet
     * @param {Number} [attemptCount] number of times attempted to send packet.
     */
    var attemptSend = function (link, packet, retryCount) {

        var sendStatus = link.sendImpl(packet);
        if (sendStatus) {
            retryCount = retryCount || 0;
            var timeOut = Math.max(1, Math.pow(2, (retryCount - 1))) - 1;

            if (retryCount < link.maxRetries) {
                retryCount++;
                // Call again but back off for an exponential amount of time.
                setTimeout(function () {
                    attemptSend(link, packet, retryCount);
                }, timeOut);
            } else {
                if (link.metrics) {
                    link.packetsFailedCounter.inc();
                }
                log.error("Failed to write packet(len=" + packet.length + "):" + sendStatus);
                return sendStatus;
            }
        }
    };

//--------------------------------------------------
//          Public Methods
//--------------------------------------------------
    /**
     * Handles fragmented packets received from the router. When all fragments of a message have been received,
     * the resulting packet will be passed on to the
     * {{#crossLink "ozpIwc.KeyBroadcastLocalStorageLink/peer:property"}}registered peer{{/crossLink}}.
     *
     * @method handleFragment
     * @param {ozpIwc.packet.Network} packet NetworkPacket containing an ozpIwc.FragmentPacket as its data property
     */
    Link.prototype.handleFragment = function (packet) {
        // Check to make sure the packet is a fragment and we haven't seen it
        if (this.peer.haveSeen(packet)) {
            return;
        }

        var key = packet.data.msgId;

        storeFragment(this, packet);

        var defragmentedPacket = defragmentPacket(this.fragments[key]);

        if (defragmentedPacket) {

            // clear the fragment timeout
            clearTimeout(this.fragments[key].fragmentTimer);

            // Remove the last sequence from the known packets to reuse it for the defragmented packet
            var packetIndex = this.peer.packetsSeen[defragmentedPacket.srcPeer].indexOf(defragmentedPacket.sequence);
            delete this.peer.packetsSeen[defragmentedPacket.srcPeer][packetIndex];

            forwardToPeer(this, defragmentedPacket);

            delete this.fragments[key];
        }
    };

    /**
     * Publishes a packet to other peers. If the sendQueue is full the send will not occur. If the TransportPacket is
     * larger than the {{#crossLink "ozpIwc.KeyBroadcastLocalStorageLink/fragmentSize:property"}}{{/crossLink}}, an
     * {{#crossLink "ozpIwc.FragmentPacket"}}{{/crossLink}} will be sent instead.
     *
     * @method send
     * @param {ozpIwc.packet.Network} packet
     */
    Link.prototype.send = function (packet) {
        var str;
        try {
            str = JSON.stringify(packet.data);
        } catch (e) {
            if (this.metrics) {
                this.packetsFailedCounter.inc();
            }
            var msgId = packet.msgId || "unknown";
            log.error("Failed to write packet(msgId=" + msgId + "):" + e.message);
            return;
        }

        if (str.length < this.fragmentSize) {
            queueSend(this, packet);
        } else {
            var fragments = str.chunk(this.fragmentSize);

            // Use the original packet as a template, delete the data and
            // generate new packets.
            var self = this;
            self.data = packet.data;
            delete packet.data;

            var fragmentGen = function (chunk, template) {

                template.sequence = self.peer.sequenceCounter++;
                template.data = {
                    fragment: true,
                    msgId: self.data.msgId,
                    id: i,
                    total: fragments.length,
                    chunk: chunk
                };
                return template;
            };

            // Generate & queue the fragments
            for (var i = 0; i < fragments.length; i++) {
                queueSend(this, fragmentGen(fragments[i], packet));
            }
        }
    };

    /**
     * Implementation of publishing packets to peers through localStorage. If the localStorage is full or a write
     * collision occurs, the send will not occur. Returns status of localStorage write, null if success.
     *
     * @todo move counter.inc() out of the impl and handle in attemptSend?
     * @method sendImpl
     * @param {ozpIwc.packet.Network} packet
     */
    Link.prototype.sendImpl = function (packet) {
        var sendStatus;
        try {
            var p = JSON.stringify(packet);
            localStorage.setItem(util.localStorageKey, p);
            if (this.metrics) {
                this.packetsSentCounter.inc();
            }
            if (packet.data.time) {
                if (this.metrics) {
                    this.latencyOutTimer.mark(util.now() - packet.data.time);
                }
            }
            localStorage.removeItem(util.localStorageKey);
            sendStatus = null;
        }
        catch (e) {
            if (e.message === "localStorage is null") {
                // Firefox about:config dom.storage.enabled = false : no mitigation with current links
                util.alert("Cannot locate localStorage. Contact your system administrator.", e);
            } else if (e.code === 18) {
                // cookies disabled : no mitigation with current links
                util.alert("Ozone requires your browser to accept cookies. Contact your system administrator.", e);
            } else {
                // If the error can't be mitigated, bubble it up
                sendStatus = e;
            }
        }
        finally {
            return sendStatus;
        }
    };

    return Link;
}(ozpIwc.log, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.network = ozpIwc.network || {};

/**
 * @module ozpIwc
 * @submodule ozpIwc.network
 */

ozpIwc.network.Peer = (function () {

    /**
     * The peer handles low-level broadcast communications between multiple browser contexts.
     * Links do the actual work of moving the packet to other browser contexts.  The links
     * call {{#crossLink "ozpIwc.network.Peer/receive:method"}}{{/crossLink}} when they need to deliver a packet to
     * this peer and hook the {{#crossLink "ozpIwc.network.Peer/send:method"}}{{/crossLink}} event in order to send
     * packets.
     * @class Peer
     * @namespace ozpIwc.network
     * @constructor
     * @param {Object} [config]
     * @param {ozpIwc.metric.Registry} [config.metrics] The metric registry to put this modules metrics in. If no
     *     registry metrics not taken
     * @uses ozpIwc.util.Event
     */
    var Peer = function (config) {
        config = config || {};

        /**
         * A generated random 4 byte id
         * @property selfId
         * @type String
         * @default {{#crossLink "ozpIwc.util/generateId:method"}}{{/crossLink}}
         */
        this.selfId = ozpIwc.util.generateId();

        this.metricPrefix = "peer." + this.selfId;

        /**
         * @TODO (DOC)
         * @property sequenceCounter
         * @type Number
         * @default 0
         */
        this.sequenceCounter = 0;

        /**
         * A history of packets seen from each peer. Each key is a peer name, each value is an array of the last 50
         * packet ids seen.
         * @property packetsSeen
         * @type Object
         * @default {}
         */
        this.packetsSeen = {};

        /**
         * @property knownPeers
         * @type Object
         * @default {}
         */
        this.knownPeers = {};

        /**
         * Metric registry to store metrics on this link.
         * @property metrics
         * @type {ozpIwc.metric.Registry}
         */
        this.metrics = config.metrics;

        /**
         * Eventing module for the Peer.
         * @property events
         * @type ozpIwc.util.Event
         * @default new ozpIwc.util.Event()
         */
        this.events = new ozpIwc.util.Event();
        this.events.mixinOnOff(this);

        var self = this;

        // Shutdown handling
        this.unloadListener = function () {
            self.shutdown();
        };
        ozpIwc.util.addEventListener('beforeunload', this.unloadListener);

    };

    /**
     * The peer has received a packet from other peers.
     * @event #receive
     *
     * @param {ozpIwc.packet.Network} packet
     * @param {String} linkId
     */


    /**
     * A cancelable event that allows listeners to override the forwarding of
     * a given packet to other peers.
     * @event #preSend
     * @extends ozpIwc.util.CancelableEvent
     *
     * @param {ozpIwc.packet.Network} packet
     */

    /**
     * Notifies that a packet is being sent to other peers.  Links should use this
     * event to forward packets to other peers.
     * @event #send
     *
     * @param {ozpIwc.packet.Network} packet
     */

    /**
     * Fires when the peer is being explicitly or implicitly shut down.
     * @event #beforeShutdown
     */

    /**
     * Number of sequence Id's held in an entry of {{#crossLink
     * "ozpIwc.network.Peer/packetsSeen:property"}}{{/crossLink}}
     * @property maxSeqIdPerSource
     * @static
     * @type Number
     * @default 500
     */
    Peer.maxSeqIdPerSource = 500;

    /**
     * Determine if the peer has already seen the packet in question.
     *
     * @method haveSeen
     * @param {ozpIwc.packet.Network} packet
     *
     * @return {Boolean}
     */
    Peer.prototype.haveSeen = function (packet) {
        // don't forward our own packets
        if (packet.srcPeer === this.selfId) {
            if (this.metrics) {
                this.metrics.counter(this.metricPrefix, 'droppedOwnPacket').inc();
            }
            return true;
        }
        var seen = this.packetsSeen[packet.srcPeer];
        if (!seen) {
            seen = this.packetsSeen[packet.srcPeer] = [];
        }

        // abort if we've seen the packet before
        if (seen.indexOf(packet.sequence) >= 0) {
            return true;
        }

        //remove oldest array members when truncate needed
        seen.unshift(packet.sequence);
        if (seen.length >= ozpIwc.network.Peer.maxSeqIdPerSource) {
            seen.length = ozpIwc.network.Peer.maxSeqIdPerSource;
        }
        return false;
    };

    /**
     * Used by routers to broadcast a packet to network.
     *
     * Fires:
     *   - {{#crossLink "ozpIwc.network.Peer/#preSend:event"}}{{/crossLink}}
     *   - {{#crossLink "ozpIwc.network.Peer/#send:event"}}{{/crossLink}}
     *
     * @method send
     * @param {ozpIwc.packet.Network} packet
     */
    Peer.prototype.send = function (packet) {
        var networkPacket = {
            srcPeer: this.selfId,
            sequence: this.sequenceCounter++,
            data: packet
        };

        var preSendEvent = new ozpIwc.util.CancelableEvent({'packet': networkPacket});

        this.events.trigger("preSend", preSendEvent);
        if (!preSendEvent.canceled) {
            if (this.metrics) {
                this.metrics.counter(this.metricPrefix, 'sent').inc();
            }
            if (this.metrics && packet.time) {
                this.metrics.timer(this.metricPrefix, 'latencyOut').mark(ozpIwc.util.now() - packet.time);
            }
            this.events.trigger("send", {'packet': networkPacket});
        } else if (this.metrics) {
            this.metrics.counter(this.metricPrefix, 'sendRejected').inc();
        }
    };

    /**
     * Called by the links when a new packet is received.
     *
     * Fires:
     *   - {{#crossLink "ozpIwc.network.Peer/#receive:event"}}{{/crossLink}}
     *
     * @method receive
     * @param {String} linkId
     * @param {ozpIwc.packet.Network} packet
     */
    Peer.prototype.receive = function (linkId, packet) {
        // drop it if we've seen it before
        if (this.haveSeen(packet)) {
            if (this.metrics) {
                this.metrics.counter(this.metricPrefix, 'dropped').inc();
            }
            return;
        }
        if (this.metrics) {
            this.metrics.counter(this.metricPrefix, 'received').inc();
        }
        if (this.metrics && packet.data.time) {
            this.metrics.timer(this.metricPrefix, 'latencyIn').mark(ozpIwc.util.now() - packet.data.time);
        }

        this.events.trigger("receive", {'packet': packet, 'linkId': linkId});
    };

    /**
     * Explicitly shuts down the peer.
     *
     * Fires:
     *   - {{#crossLink "ozpIwc.network.Peer/#receive:event"}}{{/crossLink}}
     *
     * @method shutdown
     */
    Peer.prototype.shutdown = function () {
        this.events.trigger("beforeShutdown");
        ozpIwc.util.removeEventListener('beforeunload', this.unloadListener);
    };

    return Peer;
}(ozpIwc));



var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
ozpIwc.transport.participant = ozpIwc.transport.participant || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.participant
 */


ozpIwc.transport.participant.Base = (function (log, policyAuth, transport, util) {

    /**
     * @class Base
     * @namespace ozpIwc.transport.participant
     * @constructor
     * @param {Object} [config]
     * @param {ozpIwc.metric.Registry} [config.metrics] The metric registry to put this modules metrics in. If no
     *     registry metrics not taken
     * @param {ozpIwc.policyAuth.PDP} config.authorization The authorization component for this module.
     * @mixes ozpIwc.security.Actor
     * @property {String} address The assigned address to this address.
     */
    var Base = function (config) {
        config = config || {};

        if (!config.authorization) {
            throw Error("Participant must be configured with an authorization module");
        }
        /**
         * An events module for the participant.
         * @property events
         * @type Event
         */
        this.events = new util.Event();
        this.events.mixinOnOff(this);

        /**
         * A key value store of the security attributes assigned to the participant.
         * @property permissions
         * @type ozpIwc.policyAuth.SecurityAttribute
         * @default {}
         */
        this.permissions = new policyAuth.elements.SecurityAttribute();

        /**
         * The message id assigned to the next packet if a packet msgId is not specified.
         * @property msgId
         * @type {Number}
         */
        this.msgId = 0;

        /**
         * A Metrics meter for packets sent from the participant.
         * @property sentPacketsmeter
         * @type ozpIwc.metric.types.Meter
         */

        /**
         * A Metrics meter for packets received by the participant.
         * @property receivedPacketMeter
         * @type ozpIwc.metric.types.Meter
         */

        /**
         * A Metrics meter for packets sent to the participant that did not pass authorization.
         * @property forbiddenPacketMeter
         * @type ozpIwc.metric.types.Meter
         */

        /**
         * Metric registry to store metrics on this link.
         * @property metrics
         * @type {ozpIwc.metric.Registry}
         */
        this.metrics = config.metrics;

        /**
         * Policy authorizing module.
         * @property authorization
         * @type {ozpIwc.policyAuth.PDP}
         */
        this.authorization = config.authorization;

        /**
         * The type of the participant.
         * @property participantType
         * @type String
         */
        this.participantType = this.constructor.name;

        /**
         * Content type for the Participant's heartbeat status packets.
         * @property heartBeatContentType
         * @type String
         * @default "application/vnd.ozp-iwc-address-v1+json"
         */
        this.heartBeatContentType = "application/vnd.ozp-iwc-address-v1+json";

        /**
         * The heartbeat status packet of the participant.
         * @property heartBeatStatus
         * @type Object
         */
        this.heartBeatStatus = {
            name: this.name,
            type: this.participantType || this.constructor.name
        };

        this.replyCallbacks = {};

        // Handle leaving Event Channel
        var self = this;
        util.addEventListener("beforeunload", function () {
            // Unload events can't use setTimeout's. Therefore make all sending happen with normal execution
            self.send = function (originalPacket, callback) {
                var packet = this.fixPacket(originalPacket);
                if (callback) {
                    self.replyCallbacks[packet.msgId] = callback;
                }
                transport.participant.Base.prototype.send.call(self, packet);

                return packet;
            };
            self.leaveEventChannel();
        });
    };

    /**
     * An AsyncAction to verify if this participant can receive the given packetContext
     * @method verifyReceiveAs
     * @param  {ozpIwc.packet.Transport} packetContext
     * @return {ozpIwc.util.AsyncAction} calls success if can receive.
     */
    Base.prototype.verifyReceiveAs = function (packetContext) {
        var receiveRequest = {
            'subject': this.permissions.getAll(),
            'resource': {'ozp:iwc:receiveAs': packetContext.packet.dst},
            'action': {'ozp:iwc:action': 'receiveAs'},
            'policies': this.authorization.policySets.receiveAsSet
        };

        return this.authorization.isPermitted(receiveRequest);
    };

    /**
     * An AsyncAction to format a received packetContext's permission.
     * @method formatRequest
     * @param  {ozpIwc.packet.Transport} packetContext
     * @return {ozpIwc.util.AsyncAction} calls success with the formated permissions.
     */
    Base.prototype.formatRequest = function(packetContext){
        return policyAuth.points.utils.formatCategory(
            packetContext.packet.permissions, this.authorization.pip);
    };

    /**
     * An AsyncAction to verify if this participant can read the given packetContext
     * @method verifyRead
     * @param  {ozpIwc.packet.Transport} packetContext
     * @return {ozpIwc.util.AsyncAction} calls success if can read.
     */
    Base.prototype.verifyRead = function (permissions) {
        var request = {
            'subject': this.permissions.getAll(),
            'resource': permissions || {},
            'action': {'ozp:iwc:action': 'read'},
            'policies': this.authorization.policySets.readSet
        };

        return this.authorization.isPermitted(request);
    };

    /**
     * An AsyncAction to verify if this participant can send the given packet
     * @method verifySendAs
     * @param  {ozpIwc.packet.Base} packet
     * @return {ozpIwc.util.AsyncAction} calls success if can send.
     */
    Base.prototype.verifySendAs = function (packet) {
        var request = {
            'subject': this.permissions.getAll(),
            'resource': {'ozp:iwc:sendAs': packet.src},
            'action': {'ozp:iwc:action': 'sendAs'},
            'policies': this.authorization.policySets.sendAsSet
        };
        return this.authorization.isPermitted(request);
    };

    /**
     * Mark the given received packetContext in the metrics.
     * @method markReceivePacket
     * @param  {ozpIwc.packet.Transport} packetContext
     */
    Base.prototype.markReceivePacket = function(packetContext){
        if (this.metrics) {
            this.receivedPacketsMeter.mark();
            if (packetContext.packet.time) {
                this.latencyInTimer.mark(util.now() - packetContext.packet.time);
            }
        }
    };

    /**
     * Mark the given sent packet in the metrics.
     * @method markSendPacket
     * @param  {ozpIwc.packet.Base} packet
     */
    Base.prototype.markSendPacket = function(packet){
        if (this.metrics) {
            this.sentPacketsMeter.mark();
            if (packet.time) {
                this.latencyOutTimer.mark(util.now() - packet.time);
            }
        }
    };

    /**
     * Processes packets sent from the router to the participant. If a packet does not pass authorization it is marked
     * forbidden.
     *
     * @method receiveFromRouter
     * @param {ozpIwc.PacketContext} packetContext
     * @return {Boolean} true if this packet could have additional recipients
     */
    Base.prototype.receiveFromRouter = function (packetContext) {
        var self = this;

        function onError(err) {
            if (self.metrics) {
                self.forbiddenPacketsMeter.mark();
                /** @todo do we send a "denied" message to the destination?  drop?  who knows? */
                self.metrics.counter("transport.packets.forbidden").inc();
            }
            log.error("failure", err);
        }

        this.verifyReceiveAs(packetContext).success(function canReceive () {
            self.formatRequest(packetContext).success(function validatedFormat (permissions) {
                self.verifyRead(permissions).success(function canRead () {
                    self.markReceivePacket(packetContext);
                    self.receiveFromRouterImpl(packetContext);
                }).failure(onError);
            }).failure(onError);
        }).failure(onError);
    };

    /**
     * Overridden by inherited Participants.
     *
     * @override
     * @method receiveFromRouterImple
     * @param packetContext
     * @return {Boolean}
     */
    Base.prototype.receiveFromRouterImpl = function (packetContext) {
        // doesn't really do anything other than return a bool and prevent "unused param" warnings
        return !packetContext;
    };

    /**
     * Connects the participant to a given router.
     *
     * Fires:
     *     - {{#crossLink "ozpIwc.transport.participant.Base/#connectedToRouter:event"}}{{/crossLink}}
     *
     * @method connectToRouter
     * @param {ozpIwc.transport.Router} router The router to connect to
     * @param {String} address The address to assign to the participant.
     */
    Base.prototype.connectToRouter = function (router, address) {
        this.address = address;
        this.router = router;
        this.msgId = 0;
        if (this.name) {
            this.metricRoot = "participants." + this.name + "." + this.address.split(".").reverse().join(".");
        } else {
            this.metricRoot = "participants." + this.address.split(".").reverse().join(".");
        }
        if (this.metrics) {
            this.sentPacketsMeter = this.metrics.meter(this.metricRoot, "sentPackets").unit("packets");
            this.receivedPacketsMeter = this.metrics.meter(this.metricRoot, "receivedPackets").unit("packets");
            this.forbiddenPacketsMeter = this.metrics.meter(this.metricRoot, "forbiddenPackets").unit("packets");
            this.latencyInTimer = this.metrics.timer(this.metricRoot, "latencyIn").unit("packets");
            this.latencyOutTimer = this.metrics.timer(this.metricRoot, "latencyOut").unit("packets");
        }
        this.namesResource = "/address/" + this.address;
        this.heartBeatStatus.address = this.address;
        this.heartBeatStatus.name = this.name;
        this.heartBeatStatus.type = this.participantType || this.constructor.name;

        this.events.trigger("connectedToRouter");
        this.joinEventChannel();
    };

    /**
     * Populates fields relevant to this packet if they aren't already set:
     * src, ver, msgId, and time.
     *
     * @method fixPacket
     * @param {ozpIwc.packet.Transport.packet} packet
     *
     * @return {ozpIwc.packet.Transport}
     */
    Base.prototype.fixPacket = function (packet) {
        // clean up the packet a bit on behalf of the sender
        packet.src = packet.src || this.address;
        packet.ver = packet.ver || 1;

        // if the packet doesn't have a msgId, generate one
        packet.msgId = packet.msgId || this.generateMsgId();

        // might as well be helpful and set the time, too
        packet.time = packet.time || util.now();
        return packet;
    };

    /**
     * Sends a packet to this participants router.  Calls fixPacket
     * before doing so.
     *
     * @method send
     * @param {ozpIwc.packet.Transport.packet} packet
     *
     * @return {ozpIwc.packet.Transport}
     */
    Base.prototype.send = function (packet) {
        var self = this;
        function onError (e) {
            log.error("Participant " + self.address + " failed to send a packet:", e, packet);
        }
        packet = self.fixPacket(packet);

        this.verifySendAs(packet).success(function canSend () {
            self.markSendPacket(packet);
            self.router.send(packet, self);
        }).failure(onError);

        return packet;
    };

    /**
     * Creates a message id for a packet by iterating {{#crossLink
     * "ozpIwc.transport.participant.Base.msgId"}}{{/crossLink}}
     *
     * @method generateMsgId
     * @return {string}
     */
    Base.prototype.generateMsgId = function () {
        return "i:" + this.msgId++;
    };

    /**
     * Sends a heartbeat packet to Participant's router.
     *
     * @method heartbeat
     */
    Base.prototype.heartbeat = function () {
        if (this.router) {
            var entity = this.heartBeatStatus;
            entity.time = util.now();

            return this.fixPacket({
                'dst': "names.api",
                'resource': this.namesResource,
                'action': "set",
                'entity': entity,
                'contentType': this.heartBeatContentType,
                'respondOn': "none"
            });
        }
    };

    /**
     * Adds this participant to the $bus.multicast multicast group.
     *
     * @method joinEventChannel
     * @return {Boolean}
     */
    Base.prototype.joinEventChannel = function () {
        if (this.router) {
            this.router.registerMulticast(this, ["$bus.multicast"]);
            this.send({
                dst: "$bus.multicast",
                action: "connect",
                entity: {
                    address: this.address,
                    participantType: this.participantType
                }
            });
            return true;
        } else {
            return false;
        }
    };

    /**
     * Remove this participant from the $bus.multicast multicast group.
     *
     * @method leaveEventChannel
     */
    Base.prototype.leaveEventChannel = function () {
        if (this.router) {
            this.send({
                dst: "$bus.multicast",
                action: "disconnect",
                entity: {
                    address: this.address,
                    participantType: this.participantType,
                    namesResource: this.namesResource
                }
            });
            //TODO not implemented
            //this.router.unregisterMulticast(this, ["$bus.multicast"]);
            return true;
        } else {
            return false;
        }

    };

    /**
     * Destroys this participant. The router will no longer reference it.
     * @method destroy
     */
    Base.prototype.destroy = function () {
        if (this.router && this.router.participants[this.address]) {
            delete this.router.participants[this.address];
        }
    };

    return Base;
}(ozpIwc.log, ozpIwc.policyAuth, ozpIwc.transport, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
ozpIwc.transport.participant = ozpIwc.transport.participant || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.participant
 */

ozpIwc.transport.participant.Internal = (function (transport, util) {

    /**
     * @class Internal
     * @namespace ozpIwc.transport.participant
     * @constructor
     * @extends ozpIwc.transport.participant.Base
     * @param {Object} config
     * @param {String} config.name The name of the participant.
     */
    var Internal = util.extend(transport.participant.Base, function (config) {
        config = config || {};
        transport.participant.Base.apply(this, arguments);
        /**
         * @property replyCallbacks
         * @type {Object}
         */
        this.replyCallbacks = {};

        /**
         * The type of the participant.
         * @property participantType
         * @type {String}
         * @default "internal"
         */
        this.participantType = "internal";

        /**
         * The name of the participant.
         * @property name
         * @type {String}
         * @default ""
         */
        this.name = config.name;

        var self = this;
        this.on("connectedToRouter", function () {
            self.permissions.pushIfNotExist('ozp:iwc:address', self.address);
            self.permissions.pushIfNotExist('ozp:iwc:sendAs', self.address);
            self.permissions.pushIfNotExist('ozp:iwc:receiveAs', self.address);
            if (self.metrics) {
                self.metrics.gauge(self.metricRoot, "registeredCallbacks").set(function () {
                    return getCallbackCount(self);
                });
            }
        });
    });

    /**
     * Gets the count of the registered reply callbacks.
     *
     * @method getCallbackCount
     * @private
     * @static
     * @param {ozpIwc.transport.participant.Internal} participant
     * @return {Number} The number of registered callbacks.
     */
    var getCallbackCount = function (participant) {
        if (!participant.replyCallbacks || !Object.keys(participant.replyCallbacks)) {
            return 0;
        }
        return Object.keys(participant.replyCallbacks).length;
    };

    /**
     * Cancels the callback corresponding to the given msgId.
     *
     * @method cancelCallback
     * @private
     * @static
     * @param {ozpIwc.transport.participant.Internal} participant
     * @param {Number} msgId
     *
     * @return {Boolean} returns true if successful.
     */
    var cancelCallback = function (participant, msgId) {
        var success = false;
        if (msgId) {
            delete participant.replyCallbacks[msgId];
            success = true;
        }
        return success;
    };


    /**
     * Handles packets received from the {{#crossLink "ozpIwc.transport.Router"}}{{/crossLink}} the participant is
     * registered to.
     *
     * Fires:
     *   - {{#crossLink "ozpIwc.transport.participant.Base/#receive:event"}}{{/crossLink}}
     *
     * @method receiveFromRouterImpl
     * @param {ozpIwc.transport.PacketContext} packetContext
     */
    Internal.prototype.receiveFromRouterImpl = function (packetContext) {
        var packet = packetContext.packet;
        if (packet.replyTo && this.replyCallbacks[packet.replyTo]) {
            var cancel = false;
            var done = function () {
                cancel = true;
            };
            this.replyCallbacks[packet.replyTo](packet, done);
            if (cancel) {
                cancelCallback(this, packet.replyTo);
            }
        } else {
            this.events.trigger("receive", packetContext);
        }
    };

    /**
     * Sends a packet to this participants router. Uses setImmediate to force messages out in queue order.
     *
     * @method send
     * @param {Object} originalPacket
     * @param {Function}callback
     * @return {ozpIwc.packet.Transport}
     */
    Internal.prototype.send = function (originalPacket, callback) {
        var packet = this.fixPacket(originalPacket);
        if (callback) {
            this.replyCallbacks[packet.msgId] = callback;
        }
        var self = this;
        var send = transport.participant.Base.prototype.send;
        //util.setImmediate(function () {
        send.call(self, packet);
        //});

        return packet;
    };


    return Internal;
}(ozpIwc.transport, ozpIwc.util));
var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
ozpIwc.transport.participant = ozpIwc.transport.participant || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.participant
 */



ozpIwc.transport.participant.SharedWorker = (function (log, transport, util) {
    /**
     * @class SharedWorker
     * @namespace ozpIwc.transport.participant
     * @extends ozpIwc.transport.participant.Base
     *
     * @param {Object} config
     * @param {String} config.origin
     * @param {Object} config.source
     * @param {Object} config.credentials
     * @param {Promise} [config.ready]
     */
    var SharedWorker = util.extend(transport.participant.Base, function (config) {
        transport.participant.Base.apply(this, arguments);

        /**
         * The origin of the Participant.
         * @property origin
         */
        /**
         * The name of the Participant.
         * @property name
         */
        this.origin = this.name = config.origin;

        /**
         * The MessageChannel port to communicate on
         * @property source
         * @type Window
         */
        this.port = config.port;

        /**
         * @property credentials
         * @type {Object}
         */
        this.credentials = config.credentials;

        /**
         * @property readyPromise
         * @type {Promise}
         */
        this.readyPromise = config.ready || Promise.resolve();

        /**
         * The type of the participant.
         * @property participantType
         * @type  String
         * @default "postMessageProxy"
         */
        this.participantType = "postMessageProxy";

        this.permissions.pushIfNotExist("ozp:iwc:origin", this.origin);

        this.on("connectedToRouter", function () {
            this.permissions.pushIfNotExist('ozp:iwc:address', this.address);
            this.permissions.pushIfNotExist('ozp:iwc:sendAs', this.address);
            this.permissions.pushIfNotExist('ozp:iwc:receiveAs', this.address);
        }, this);
        /**
         * @property heartBeatStatus.origin
         * @type String
         */
        this.heartBeatStatus.origin = this.origin;

        var self = this;
        var sharedWorkerReceiveMessage = function (e) {
            var data = e.data;
            if (typeof(data) === "string") {
                try {
                    data = JSON.parse(e.data);
                } catch (e) {
                    // may not be failure, whomever gets forwarded the message
                    // can choose to allow strings instead of objects.
                }
            }
            if (data && data.windowEvent) {
                self.handleWindowEvent(data.windowEvent);
            }
            self.forwardFromMessageChannel(data, e);
        };

        this.port.addEventListener("message", sharedWorkerReceiveMessage, false);
        util.safePostMessage(this.port, {iwcInit: true});
    });

//--------------------------------------------------
//          Private Methods
//--------------------------------------------------


//--------------------------------------------------
//          Public Methods
//--------------------------------------------------
    /**
     * The participant hijacks anything addressed to "$transport" and serves it
     * directly.  This isolates basic connection checking from the router, itself.
     *
     * @method handleTransportPacket
     * @static
     * @param {Object} packet
     */
    SharedWorker.prototype.handleTransportPacket = function (packet) {
        var reply = {
            'ver': 1,
            'dst': this.address,
            'src': '$transport',
            'replyTo': packet.msgId,
            'msgId': this.generateMsgId(),
            'entity': {
                "address": this.address
            }
        };

        var self = this;
        this.readyPromise.then(function () {
            self.sendToRecipient(reply);
        });
    };

    /**
     * Receives a packet on behalf of this participant and forwards it via SharedWorker.
     *
     * @method receiveFromRouterImpl
     * @param {ozpIwc.transport.PacketContext} packetContext
     */
    SharedWorker.prototype.receiveFromRouterImpl = function (packetContext) {
        this.sendToRecipient(packetContext.packet);
    };

    /**
     * Sends a message to the other end of our connection.  Wraps any string mangling
     * necessary by the SharedWorker implementation of the browser.
     *
     * @method sendToParticipant
     * @param {ozpIwc.packet.Transport} packet
     * @todo Only IE requires the packet to be stringified before sending, should use feature detection?
     */
    SharedWorker.prototype.sendToRecipient = function (packet) {
        util.safePostMessage(this.port, packet);
    };


    /**
     * Sends a packet received via SharedWorker to the Participant's router.
     *
     * @method forwardFromPostMessage
     * @todo track the last used timestamp and make sure we don't send a duplicate messageId
     * @param {ozpIwc.packet.Transport} packet
     * @param {Event} event
     */
    SharedWorker.prototype.forwardFromMessageChannel = function (packet, event) {
        var workerProxy = packet.proxyAs || {};

        if (typeof(packet) !== "object") {
            log.error("Unknown packet received: " + JSON.stringify(packet));
            return;
        }
        if (workerProxy.origin !== this.origin) {
            /** @todo participant changing origins should set off more alarms, probably */
            if (this.metrics) {
                this.metrics.counter("transport." + this.address + ".invalidSenderOrigin").inc();
            }
            log.error("Message sender does not match this worker's application origin.",
             "This worker's origin: [", this.origin, "] cannot accept sender origin: [", workerProxy.origin,"]");
            return;
        }

        packet = this.fixPacket(packet);

        // if it's addressed to $transport, hijack it
        if (packet.dst === "$transport") {
            this.handleTransportPacket(packet);
        } else {
            this.router.send(packet, this);
        }
    };

    /**
     * A handler for forwarded events from this participants corresponding window.
     * @TODO Currently just the event type is passed
     * @method handleWindowEvent
     * @param {String} eventType
     */
    SharedWorker.prototype.handleWindowEvent = function (eventType) {
        switch (eventType) {
            case "beforeunload":
                this.leaveEventChannel();
                this.destroy();
                break;
        }
    };

    return SharedWorker;
}(ozpIwc.log, ozpIwc.transport, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
ozpIwc.transport.participant = ozpIwc.transport.participant || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.participant
 */



ozpIwc.transport.participant.PostMessage = (function (log, transport, util) {
    /**
     * @class PostMessage
     * @namespace ozpIwc.transport.participant
     * @extends ozpIwc.transport.participant.Base
     *
     * @param {Object} config
     * @param {String} config.origin
     * @param {Object} config.source
     * @param {Object} config.credentials
     * @param {Promise} [config.ready]
     */
    var PostMessage = util.extend(transport.participant.Base, function (config) {
        transport.participant.Base.apply(this, arguments);

        /**
         * The origin of the Participant.
         * @property origin
         */
        /**
         * The name of the Participant.
         * @property name
         */
        this.origin = this.name = config.origin;

        /**
         * The window of the Participant.
         * @property source
         * @type Window
         */
        this.source = config.source;

        /**
         * @property credentials
         * @type {Object}
         */
        this.credentials = config.credentials;

        /**
         * @property readyPromise
         * @type {Promise}
         */
        this.readyPromise = config.ready || Promise.resolve();
        /**
         * The type of the participant.
         * @property participantType
         * @type  String
         * @default "postMessageProxy"
         */
        this.participantType = "postMessageProxy";

        this.permissions.pushIfNotExist("ozp:iwc:origin", this.origin);

        this.on("connectedToRouter", function () {
            this.permissions.pushIfNotExist('ozp:iwc:address', this.address);
            this.permissions.pushIfNotExist('ozp:iwc:sendAs', this.address);
            this.permissions.pushIfNotExist('ozp:iwc:receiveAs', this.address);
        }, this);
        /**
         * @property heartBeatStatus.origin
         * @type String
         */
        this.heartBeatStatus.origin = this.origin;

        util.safePostMessage(this.source, {iwcInit: true});
    });

//--------------------------------------------------
//          Private Methods
//--------------------------------------------------


//--------------------------------------------------
//          Public Methods
//--------------------------------------------------
    /**
     * The participant hijacks anything addressed to "$transport" and serves it
     * directly.  This isolates basic connection checking from the router, itself.
     *
     * @method handleTransportpacket
     * @param {ozpIwc.transport.packet.PostMessage} participant
     * @param {Object} packet
     */
    PostMessage.prototype.handleTransportPacket = function (packet) {
        var reply = {
            'ver': 1,
            'dst': this.address,
            'src': '$transport',
            'replyTo': packet.msgId,
            'msgId': this.generateMsgId(),
            'entity': {
                "address": this.address
            }
        };

        var self = this;
        this.readyPromise.then(function () {
            self.sendToRecipient(reply);
        });
    };
    /**
     * Receives a packet on behalf of this participant and forwards it via PostMessage.
     *
     * @method receiveFromRouterImpl
     * @param {ozpIwc.transport.PacketContext} packetContext
     */
    PostMessage.prototype.receiveFromRouterImpl = function (packetContext) {
        this.sendToRecipient(packetContext.packet);
    };

    /**
     * Sends a message to the other end of our connection.  Wraps any string mangling
     * necessary by the postMessage implementation of the browser.
     *
     * @method sendToParticipant
     * @param {ozpIwc.packet.Transport} packet
     * @todo Only IE requires the packet to be stringified before sending, should use feature detection?
     */
    PostMessage.prototype.sendToRecipient = function (packet) {
        util.safePostMessage(this.source, packet, this.origin);
    };


    /**
     * Sends a packet received via PostMessage to the Participant's router.
     *
     * @method forwardFromPostMessage
     * @todo track the last used timestamp and make sure we don't send a duplicate messageId
     * @param {ozpIwc.packet.Transport} packet
     * @param {Event} event
     */
    PostMessage.prototype.forwardFromPostMessage = function (packet, event) {
        if (typeof(packet) !== "object") {
            log.error("Unknown packet received: " + JSON.stringify(packet));
            return;
        }
        if (event.origin !== this.origin) {
            /** @todo participant changing origins should set off more alarms, probably */
            if (this.metrics) {
                this.metrics.counter("transport." + this.address + ".invalidSenderOrigin").inc();
            }
            return;
        }

        packet = this.fixPacket(packet);

        // if it's addressed to $transport, hijack it
        if (packet.dst === "$transport") {
            this.handleTransportPacket(packet);
        } else {
            this.router.send(packet, this);
        }
    };

    return PostMessage;
}(ozpIwc.log, ozpIwc.transport, ozpIwc.util));


var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
/**
 * @module ozpIwc
 * @submodule ozpIwc.transport
 */

ozpIwc.transport.Router = (function (ozpConfig, log, transport, util) {
    /**
     * @class Router
     * @namespace ozpIwc.transport
     * @constructor
     * @param {Object} [config]
     * @param {ozpIwc.metric.Registry} [config.metrics] The metric registry to put this modules metrics in. If no
     *     registry metrics not taken
     * @param {ozpIwc.policyAuth.PDP} config.authorization The authorization component for this module.
     * @param {ozpIwc.network.Peer} config.peer
     */

    var Router = function (config) {
        config = config || {};
        if (!config.peer) {
            throw Error("Router must be configured with a peer");
        }

        if (!config.authorization) {
            throw Error("Router must be configured with an authorization module");
        }

        /**
         * @property peer
         * @type ozpIwc.network.Peer
         */
        this.peer = config.peer;

        //this.nobodyAddress="$nobody";
        //this.routerControlAddress='$transport';
        var self = this;

        /**
         * @property selfId
         * @type String
         */
        this.selfId = util.generateId();

        /**
         * A key value store of all participants local to the router.
         * @property participants
         * @type Object
         * @default {}
         */
        this.participants = {};

        /**
         * Metric registry to store metrics on this link.
         * @property metrics
         * @type {ozpIwc.metric.Registry}
         */
        this.metrics = config.metrics;

        if (this.metrics) {
            this.metrics.gauge("transport.participants").set(function () {
                return Object.keys(self.participants).length;
            });
        }

        /**
         * Policy authorizing module.
         * @property authorization
         * @type {ozpIwc.policyAuth.PDP}
         */
        this.authorization = config.authorization;

        /**
         * Eventing module for the router.
         * @property events
         * @type ozpIwc.util.Event
         * @default ozpIwc.util.Event
         */
        this.events = new util.Event();
        this.events.mixinOnOff(this);

        // Wire up to the peer
        this.peer.on("receive", function (event) {
            self.receiveFromPeer(event.packet);
        });

        var checkFormat = function (event) {
            var message = event.packet;
            if (message.ver !== 1) {
                event.cancel("badVersion");
            }
            if (!message.src) {
                event.cancel("nullSource");
            }
            if (!message.dst) {
                event.cancel("nullDestination");
            }
            if (event.canceled && self.metrics) {
                self.metrics.counter("transport.packets.invalidFormat").inc();
            }
        };
        this.events.on("preSend", checkFormat);

        if (!config.disableBus) {
            this.participants["$bus.multicast"] = new transport.participant.Multicast({
                authorization: this.authorization,
                name: "$bus.multicast"
            });
        }
        /**
         * @property watchdog
         * @type ozpIwc.transport.participant.RouterWatchdog
         */
        this.watchdog = new transport.participant.RouterWatchdog({
            authorization: config.authorization,
            router: this,
            heartbeatFrequency: config.heartbeatFrequency || ozpConfig.heartBeatFrequency,
            autoConnect: false
        });
        this.registerParticipant(this.watchdog);
        this.recursionDepth = 0;
        if (this.metrics) {
            this.metrics.gauge('transport.router.participants').set(function () {
                return self.getParticipantCount();
            });
        }
    };

    /**
     * Gets the count of participants who have registered with the router.
     * @method getParticipantCount
     *
     * @return {Number} the number of registered participants
     */
    Router.prototype.getParticipantCount = function () {
        if (!this.participants || !Object.keys(this.participants)) {
            return 0;
        }
        return Object.keys(this.participants).length;

    };

    /**
     * @method shutdown
     */
    Router.prototype.shutdown = function () {
        this.watchdog.shutdown();
    };

    /**
     * Allows a listener to add a new participant.
     *
     * **Emits**: {{#crossLink "ozpIwc.transport.Router/preRegisterParticipant:event"}}{{/crossLink}}
     *
     * @method registerParticipant
     * @param {Object} participant the participant object that contains a send() function.
     * @param {Object} packet The handshake requesting registration.
     *
     * @return {String} returns participant id
     */
    Router.prototype.registerParticipant = function (participant, packet) {
        packet = packet || {};
        var address;
        do {
            address = util.generateId() + "." + this.selfId;
        } while (this.participants.hasOwnProperty(address));

        var registerEvent = new util.CancelableEvent({
            'packet': packet,
            'registration': packet.entity,
            'participant': participant
        });
        this.events.trigger("preRegisterParticipant", registerEvent);

        if (registerEvent.canceled) {
            // someone vetoed this participant
            log.info("registeredParticipant[DENIED] origin:" + participant.origin +
                " because " + registerEvent.cancelReason);
            return null;
        }

        this.participants[address] = participant;
        participant.connectToRouter(this, address);
        this.send(participant.heartbeat(), participant);
        var registeredEvent = new util.CancelableEvent({
            'packet': packet,
            'participant': participant
        });
        this.events.trigger("registeredParticipant", registeredEvent);

        //log.log("registeredParticipant["+participant_id+"] origin:"+participant.origin);
        return address;
    };

    /**
     * **Emits**: {{#crossLink "ozpIwc.transport.Router/preDeliver:event"}}{{/crossLink}}
     *
     * @method deliverLocal
     * @param {ozpIwc.packet.Transport} packet
     * @param {ozpIwc.transport.participant.Base} sendingParticipant
     */
    Router.prototype.deliverLocal = function (packet, sendingParticipant) {
        if (!packet) {
            throw "Cannot deliver a null packet!";
        }
        var localParticipant = this.participants[packet.dst];
        if (!localParticipant) {
            return;
        }
        this.recursionDepth++;
        if (this.recursionDepth > 10) {
            log.log("Recursing more than 10 levels deep on ", packet);
        }
        try {
            var packetContext = new transport.PacketContext({
                'packet': packet,
                'router': this,
                'srcParticipant': sendingParticipant,
                'dstParticipant': localParticipant
            });

            var preDeliverEvent = new util.CancelableEvent({
                'packet': packet,
                'dstParticipant': localParticipant,
                'srcParticipant': sendingParticipant
            });

            if (this.events.trigger("preDeliver", preDeliverEvent).canceled) {
                if (this.metrics) {
                    this.metrics.counter("transport.packets.rejected").inc();
                }
                return;
            }
            if (this.metrics) {
                this.metrics.counter("transport.packets.delivered").inc();
            }
            localParticipant.receiveFromRouter(packetContext);
        } finally {
            this.recursionDepth--;
        }
    };


    /**
     * Registers a participant for a multicast group
     *
     * **Emits**: {{#crossLink "ozpIwc.transport.Router/registerMulticast:event"}}{{/crossLink}}
     *
     * @method registerMulticast
     * @param {ozpIwc.transport.participant.Base} participant
     * @param {String[]} multicastGroups
     */
    Router.prototype.registerMulticast = function (participant, multicastGroups) {
        var self = this;
        multicastGroups.forEach(function (groupName) {
            var g = self.participants[groupName];
            if (!g) {
                g = self.participants[groupName] = new transport.participant.Multicast({
                    name: groupName,
                    authorization: self.authorization
                });
            }
            g.addMember(participant);
            if (participant.address) {
                var registeredEvent = new util.CancelableEvent({
                    'entity': {'group': groupName, 'address': participant.address}
                });
                participant.permissions.pushIfNotExist('ozp:iwc:sendAs', groupName);
                participant.permissions.pushIfNotExist('ozp:iwc:receiveAs', groupName);

                self.events.trigger("registeredMulticast", registeredEvent);
            } else {
                log.info("no address for " + participant.participantType + " " + participant.name + "with address " +
                    participant.address + " for group " + groupName);
            }
            //log.log("registered " + participant.participantType + " " + participant.name + "with address " +
            // participant.address + " for group " + groupName);
        });
        return multicastGroups;
    };

    /**
     * Used by participant listeners to route a message to other participants.
     *
     * **Emits**: {{#crossLink "ozpIwc.transport.Router/preSend:event"}}{{/crossLink}},
     *        {{#crossLink "ozpIwc.transport.Router/send:event"}}{{/crossLink}}
     *
     * @method send
     * @param {ozpIwc.packet.Transport} packet The packet to route.
     * @param {ozpIwc.transport.participant.Base} sendingParticipant Information about the participant that is
     *     attempting to send the packet.
     */
    Router.prototype.send = function (packet, sendingParticipant) {

        var preSendEvent = new util.CancelableEvent({
            'packet': packet,
            'participant': sendingParticipant
        });
        this.events.trigger("preSend", preSendEvent);

        if (preSendEvent.canceled) {
            if (this.metrics) {
                this.metrics.counter("transport.packets.sendCanceled");
            }
            return;
        }
        if (this.metrics) {
            this.metrics.counter("transport.packets.sent").inc();
        }
        this.deliverLocal(packet, sendingParticipant);
        this.events.trigger("send", {'packet': packet});
        this.peer.send(packet);
    };

    /**
     * Receive a packet from the peer.
     *
     * **Emits**: {{#crossLink "ozpIwc.transport.Router/prePeerReceive:event"}}{{/crossLink}}
     *
     * @param packet {ozpIwc.packet.Transport} the packet to receive
     */
    Router.prototype.receiveFromPeer = function (packet) {
        var now = Date.now();
        if (this.metrics) {
            this.metrics.counter("transport.packets.receivedFromPeer").inc();
            this.metrics.histogram("transport.packets.latency").mark(now - packet.data.time, now);
        }

        var peerReceiveEvent = new util.CancelableEvent({
            'packet': packet.data,
            'rawPacket': packet
        });
        this.events.trigger("prePeerReceive", peerReceiveEvent);

        if (!peerReceiveEvent.canceled) {
            this.deliverLocal(packet.data);
        }
    };

    return Router;
    /**
     * @event preRegisterParticipant
     * @param {ozpIwc.packet.Transport} [packet] The packet to be delivered
     * @param {object} registration Information provided by the participant about it's registration
     * @param {ozpIwc.transport.participant.Base} participant The participant that will receive the packet
     */

    /**
     * @event preSend
     * @param {ozpIwc.packet.Transport} packet The packet to be sent
     * @param {ozpIwc.transport.participant.Base} participant The participant that sent the packet
     */

    /**
     * @event preDeliver
     * @param {ozpIwc.packet.Transport} packet The packet to be delivered
     * @param {ozpIwc.transport.participant.Base} participant The participant that will receive the packet
     */

    /**
     * @event send
     * @param {ozpIwc.packet.Transport} packet The packet to be delivered
     */

    /**
     * @event prePeerReceive
     * @param {ozpIwc.packet.Transport} packet The packet to be delivered
     * @param {ozpIwc.packet.Network} rawPacket
     */
}(ozpIwc.config, ozpIwc.log, ozpIwc.transport, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
/**
 * @module ozpIwc
 * @submodule ozpIwc.transport
 */

ozpIwc.transport.consensus = ozpIwc.transport.consensus || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.consensus
 */

ozpIwc.transport.consensus.Base = (function (transport, util) {
    /**
     * A base-class for consensus modules.
     *
     * @class Base
     * @namespace ozpIwc.transport.consensus
     * @uses ozpIwc.util.Event
     * @param {Object} config
     * @param {String} config.name
     * @param {Function} config.routePacket
     * @param {ozpIwc.transport.participant.Base} [config.participant]
     * @param {ozpIwc.policyAuth.PDP} [config.authorization] The authorization component for this module.
     * @param {String} [config.consensusAddress]
     * @param {ozpIwc.transport.Router} [config.router]
     * @constructor
     */
    var Base = function (config) {
        config = config || {};
        var self = this;
        if (!config.name) {
            throw "Consensus module expects a name.";
        }
        if (!config.router) {
            throw "Consensus module expects a router.";
        }
        /**
         * name of the consensus module
         * @property name
         * @type {String}
         */
        this.name = config.name;

        /**
         * The communication module of this consensus module.
         * @property participant
         * @tyope {Object}
         */
        this.participant = config.participant || new transport.participant.Client({
                'internal': true,
                'router': config.router,
                'authorization': config.authorization,
                'name': config.name
            });

        /**
         * The messaging address common among all matching modules.
         * @property consensusAddress
         * @type {String}
         */
        this.consensusAddress = config.consensusAddress || this.name + ".consensus";

        /**
         * The router for which this modules participant communicates over
         * @property router
         */
        this.router = config.router;

        /**
         * An eventing module.
         * @property events
         * @type {ozpIwc.util.Event}
         */
        this.events = new util.Event();
        this.events.mixinOnOff(this);

        /**
         * The state of the module. (coordinator/member)
         * @property state
         * @type {string}
         */
        this.state = "unknown";
        this.participant.on("connectedToRouter", function () {
            self.participant.permissions.pushIfNotExist('ozp:iwc:address', [self.participant.address, self.consensusAddress]);
            self.participant.permissions.pushIfNotExist('ozp:iwc:sendAs', [self.participant.address, self.consensusAddress]);
            self.participant.permissions.pushIfNotExist('ozp:iwc:receiveAs', [self.participant.address, self.consensusAddress]);
        });

        this.routePacket = config.routePacket || this.routePacket;

        this.router.registerMulticast(this.participant, [this.consensusAddress]);
        this.participant.on("receive", this.routePacket, this);
    };

    /**
     * Packet routing functionality of the consensus module. Expected to be overridden by subclass.
     *
     * @method routePacket
     * @param {Object} packetContext
     */
    Base.prototype.routePacket = function (packetContext) {
        throw "routePacket is to be overridden by consensus implementation";
    };


    /**
     * Module becoming coordinator handler for the consensus module. Expected to be overridden by subclass.
     *
     * @method onBecomeCoordinator
     */
    Base.prototype.onBecomeCoordinator = function () {
        throw "onBecomeCoordinator is to be overridden by consensus implementation";
    };


    /**
     * Module becoming member handler for the consensus module. Expected to be overridden by subclass.
     *
     * @method onBecomeMember
     */
    Base.prototype.onBecomeMember = function () {
        throw "onBecomeMember is to be overridden by consensus implementation";
    };

    /**
     * Changes state of the consensus module. Triggers "changedState" event.
     *
     * @method changeState
     * @param {String} state
     */
    Base.prototype.changeState = function (state) {
        if (this.state !== state) {
            this.state = state;
            this.events.trigger("changedState", this.state);
        }
    };

    return Base;

}(ozpIwc.transport, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
ozpIwc.transport.consensus = ozpIwc.transport.consensus || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.consensus
 */


ozpIwc.transport.consensus.Bully = (function (consensus, ozpConfig, util) {
    /**
     * An implementation of the Bully Algorithm as a consensus module for the IWC.
     * Acknowledge(OK) message is not used in current implementation, rather a victory message is sent out on an
     * interval to notify other consensus modules whom the coordinator is.
     *
     * The consensusId is a negative reference to the time at which the bully was created. This means the oldest bully
     * module leads.
     *
     * @class Bully
     * @namespace ozpIwc.transport.consensus
     * @extends ozpIwc.transport.consensus.Base
     * @type {Function}
     */
    var Bully = util.extend(consensus.Base, function (config) {
        consensus.Base.apply(this, arguments);
        /**
         * Election rank of this module. Seniority rules.
         * @property consensusId
         * @type {Number}
         */
        this.consensusId = config.consensusId || -util.now();

        /**
         * How long this module waits before assuming the coordinator is down.
         * @property coordinatorTimeoutHeartbeat
         * @type {Number}
         */
        this.coordinatorTimeoutHeartbeat = config.heartbeat || ozpConfig.consensusTimeout;

        /**
         * How often this module broadcasts being the coordinator (if coordinator).
         * @property coordinatorTimeoutHeartbeat
         * @type {Number}
         */
        this.coordinatorIntervalHeartbeat = this.coordinatorTimeoutHeartbeat / 2;

        /**
         * Data passing functionality for those who use this module. Data passed into gatherLogs will be shared with
         * other matching modules if this module is the coordinator.
         *
         * @method gatherLogs
         * @type {Function}
         */
        this.gatherLogs = config.gatherLogs || function () {};

        var self = this;
        util.addEventListener("beforeunload", function () {
            self.shutdown();
            self.events.trigger("shutdown");
        });

        //Give some arbitrary time for the query to respond before kicking off an election
        restartCoordinatorTimeout(this);
        sendQueryMessage(this);
    });

    /**
     * Routes packets for the bully module. Packets with the following actions are accepted:
     *  - election
     *  - acknowledge
     *  - query
     *  - victory
     *
     * @method routePacket
     * @override
     * @param {ozpIwc.packet.Transport} packetContext
     */
    Bully.prototype.routePacket = function (packetContext) {
        var packet = packetContext.packet || {};

        //Accept packets sent out to this consensus module
        if (packet.dst === this.consensusAddress) {
            //But ignore own packets
            if (packet.src !== this.participant.address) {
                switch (packet.action) {
                    case "election":
                        onElectionMessage(this, packet);
                        break;
                    case "acknowledge":
                        onAckMessage(this, packet);
                        break;
                    case "victory":
                        onVictoryMessage(this, packet);
                        break;
                    case "query":
                        onQueryMessage(this, packet);
                        break;
                    default:
                        break;
                }
            }
        }

    };


//==================================================================
// Consensus message sending
//==================================================================
    /**
     * Sends an election message to other Bully Modules to determine a coordinator.
     *
     * @method sendElectionMessage
     */
    Bully.prototype.sendElectionMessage = function () {
        this.participant.send({
            'dst': this.consensusAddress,
            'action': "election",
            'entity': {
                'consensusId': this.consensusId
            },
            'respondOn': "none"
        });
    };

    ///**
    // * @TODO: Unused, a modified bully algorithm was implemented.
    // * Sends an acknowledge message to the consensusId that sent an election message to inform them that this module
    // out * ranks them. * * @method sendAckMessage * @private * @static * @param {ozpIwc.transport.consensus.Bully}
    // bully * @param {String}consensusSender */ var sendAckMessage = function (bully, consensusSender) {
    // bully.participant.send({ 'dst': bully.consensusAddress, 'action': "acknowledge", 'entity': { 'consensusId':
    // bully.consensusId, 'replyTo': { 'consensusId': consensusSender } } }); };

    /**
     * Sends a victory message to other bully modules informing them of this modules role as Coordinator.
     *
     * @method sendVictoryMessage
     * @private
     * @static
     * @param {ozpIwc.transport.consensus.Bully} bully
     */
    var sendVictoryMessage = function (bully) {
        var logs = bully.gatherLogs() || bully.logs;
        bully.participant.send({
            'dst': bully.consensusAddress,
            'action': "victory",
            'entity': {
                'consensusId': bully.consensusId,
                'logs': logs
            },
            'respondOn': "none"
        });
    };

    /**
     * Sends a query message to other bully modules. The Coordinator will hear this message and respond immediately with
     * a victory message to inform Coordinator status.
     *
     * @method sendQueryMessage
     * @private
     * @static
     * @param {ozpIwc.transport.consensus.Bully} bully
     */
    var sendQueryMessage = function (bully) {
        bully.participant.send({
            'dst': bully.consensusAddress,
            'action': "query",
            'entity': {
                'consensusId': bully.consensusId
            },
            'respondOn': "none"
        });
    };


//==================================================================
// Consensus message handling
//==================================================================
    /**
     * Handler function for receiving election messages. If the message sender is of lower rank than this module, this
     * module joins the election.
     *
     * @method onElectionMessage
     * @private
     * @static
     * @param {ozpIwc.transport.consensus.Bully} bully
     * @param {Object} packet
     */
    var onElectionMessage = function (bully, packet) {
        var entity = packet.entity;
        if (!entity.consensusId) {
            throw "Non-formatted election message received.";
        }
        var consensusId = entity.consensusId;

        if (entity.logs) {
            bully.logs = entity.logs;
        }
        // Ignore it if they out rank us.
        if (consensusId > bully.consensusId) {
            cancelElection(bully);
            restartCoordinatorTimeout(bully);
            return;
        }
        // Let them know that we out rank them.
        startElection(bully);
        restartCoordinatorTimeout(bully);
    };

    /**
     * Handler function for receiving acknowledge messages. If the acknowledge message is directed at this bully
     * module, it will cancel its election as a higher ranking module exists.
     *
     * @method onAckMessage
     * @private
     * @static
     * @param {ozpIwc.transport.consensus.Bully} bully
     * @param {Object} packet
     */
    var onAckMessage = function (bully, packet) {
        var entity = packet.entity;
        var replyTo = entity.replyTo || {};
        if (!replyTo.consensusId) {
            throw "Non-formatted acknowledge message received.";
        }
        var consensusId = replyTo.consensusId;

        // Ignore if it wasn't sent directly to me.
        if (consensusId !== bully.consensusId) {
            return;
        }

        //what do we do on ack?
        //cancel election timeout
        cancelElection(bully);
    };

    /**
     * Handler function for receiving victory messages. If the sender out ranks this module, the module will act as a
     * member of the module group and start a watchdog to start a new election if the coordinator goes silent.
     *
     * @method onVictoryMessage
     * @private
     * @static
     * @param {ozpIwc.transport.consensus.Bully} bully
     * @param {Object} packet
     */
    var onVictoryMessage = function (bully, packet) {
        var entity = packet.entity;
        if (!entity.consensusId) {
            throw "Non-formatted election message received.";
        }
        var consensusId = entity.consensusId;


        if (entity.logs) {
            bully.logs = entity.logs || bully.logs;
        }
        // Ignore it if they out rank us.
        if (consensusId > bully.consensusId) {
            if (entity.logs) {
                bully.events.trigger("receivedLogs", entity.logs);
                bully.logs = undefined;
            }
            cancelElection(bully);
            restartCoordinatorTimeout(bully);
            return;
        }
        //Rebel if needed.
        startElection(bully);

    };


    /**
     * Handler function for receiving query messages. If this module is the coordinator it will respond with a victory
     * message to inform sender that this module is the coordinator.
     *
     * @method onQueryMessage
     * @private
     * @static
     * @param {ozpIwc.transport.consensus.Bully} bully
     * @param {Object} packet
     */
    var onQueryMessage = function (bully, packet) {
        var entity = packet.entity;
        if (!entity.consensusId) {
            throw "Non-formatted election message received.";
        }

        // If this Bully is pumping out victory messages its the leader, otherwise don't respond
        if (bully.coordinatorInterval) {
            sendVictoryMessage(bully);
            return;
        }
    };


//==================================================================
// Consensus Coordinator timeout
//==================================================================
    /**
     * Restarts the watchdog for which the coordinator must respond before ending otherwise this module will start an
     * election.
     *
     * @method restartCoordinatorTimeout
     * @private
     * @static
     * @param {ozpIwc.transport.consensus.Bully} bully
     * @param {Number}[timeout]
     */
    var restartCoordinatorTimeout = function (bully, timeout, keepState) {
        timeout = timeout || bully.coordinatorTimeoutHeartbeat;
        clearTimeout(bully.coordinatorTimeout);
        if (!keepState) {
            bully.changeState("member");
        }
        bully.coordinatorTimeout = setTimeout(function () {
            bully.onCoordinatorTimeout();
        }, timeout);
    };

    /**
     * Handler function for when no response was made by the coordinator and its watchdog times out.
     *
     * @method onCoordinatorTimeout
     * @param timeout
     */
    Bully.prototype.onCoordinatorTimeout = function () {
        startElection(this);
    };


//==================================================================
// Coordinator functionality
//==================================================================
    /**
     * Handler function for when this module becomes coordinator of all active matching bully modules.
     *
     * @override
     * @method onBecomeCoordinator
     */
    Bully.prototype.onBecomeCoordinator = function () {
        var self = this;
        clearTimeout(this.coordinatorTimeout);
        clearInterval(this.coordinatorInterval);

        sendVictoryMessage(this);
        this.changeState("coordinator");
        this.coordinatorInterval = setInterval(function () {
            sendVictoryMessage(self);
        }, this.coordinatorIntervalHeartbeat);
    };

    Bully.prototype.shutdown = function () {
        if (this.state === "coordinator" || this.logs) {
            this.consensusId = -Number.MAX_VALUE;
            sendVictoryMessage(this);
        }
    };
//==================================================================
// Election control
//==================================================================
    /**
     * Makes this bully module start an election for the coordinator role.
     *
     * @method startElection
     * @private
     * @static
     * @param {ozpIwc.transport.consensus.Bully} bully
     * @param {Number} [timeout]
     */
    var startElection = function (bully, timeout) {
        timeout = timeout || (bully.coordinatorTimeoutHeartbeat * 2 / 3);
        clearTimeout(bully.electionTimeout);

        bully.electionTimeout = setTimeout(function () {
            bully.onBecomeCoordinator();
        }, timeout);

        bully.sendElectionMessage();
    };

    /**
     * Cancels this modules participation in the current election.
     *
     * @method cancelElection
     * @private
     * @static
     * @param {ozpIwc.transport.consensus.Bully} bully
     */
    var cancelElection = function (bully) {
        clearTimeout(bully.electionTimeout);
    };

    return Bully;

}(ozpIwc.transport.consensus, ozpIwc.config, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
ozpIwc.transport.listener = ozpIwc.transport.listener || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.listener
 */


ozpIwc.transport.listener.Base = (function (log, transport, util) {
    /**
     * Base class for Participant listeners. Should be inherited from for different browser transport components.
     *
     * @class Base
     * @namespace ozpIwc.transport.participant
     * @param {Object} [config]
     * @param {ozpIwc.transport.Router} [config.router]
     * @param {ozpIwc.metric.Registry} [config.metrics] The metric registry to put this modules metrics in. If no
     *     registry metrics not taken
     * @param {ozpIwc.policyAuth.PDP} [config.authorization] The authorization component for this module.
     */
    var Base = function (config) {
        config = config || {};
        if (!config.router) {
            throw "Listener requires a router.";
        }
        /**
         * @property Participants
         * @type ozpIwc.transport.participant.PostMessage[]
         */
        this.participants = [];

        /**
         * @property router
         * @type ozpIwc.transport.Router
         */
        this.router = config.router;

        /**
         * Policy authorizing module.
         * @property authorization
         * @type {ozpIwc.policyAuth.PDP}
         */
        this.authorization = config.authorization;

        /**
         * Metric registry to store metrics on this link.
         * @property metrics
         * @type {ozpIwc.metric.Registry}
         */
        this.metrics = config.metrics;

        /**
         * @property readyPromise
         * @type {Promise}
         */
        this.readyPromise = config.ready || Promise.resolve();

        var self = this;

        this.registration();

        if (this.metrics) {
            this.metrics.gauge('transport.listener.' + this.name + '.participants').set(function () {
                return self.getParticipantCount();
            });
        }
    };

    Base.prototype.name = "Base";
    Base.prototype.registration = function () {
        throw "Listener registration should be overriden by inheriting class.";
    };
    /**
     * Gets the count of known participants
     *
     * @method getParticipantCount
     *
     * @return {Number} the number of known participants
     */
    Base.prototype.getParticipantCount = function () {
        if (!this.participants) {
            return 0;
        }
        return this.participants.length;
    };

    /**
     * Finds the participant associated with the given window.  Unfortunately, this is an
     * o(n) algorithm, since there doesn't seem to be any way to hash, order, or any other way to
     * compare windows other than equality.
     *
     * @method findParticipant
     * @param {Object} source - the participant handle from message's event.source
     */
    Base.prototype.findParticipant = function (source) {
        for (var i = 0; i < this.participants.length; ++i) {
            if (this.participants[i].source === source) {
                return this.participants[i];
            }
        }
    };

    return Base;
}(ozpIwc.log, ozpIwc.transport, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
ozpIwc.transport.listener = ozpIwc.transport.listener || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.listener
 */


ozpIwc.transport.listener.PostMessage = (function (log, transport, util) {
    /**
     * Listens for PostMessage messages and forwards them to the respected Participant.
     *
     * @class PostMessage
     * @namespace ozpIwc.transport.participant
     * @extends ozpIwc.transport.participant.Base
     * @param {Object} [config]
     * @param {ozpIwc.transport.Router} [config.router]
     * @param {ozpIwc.metric.Registry} [config.metrics] The metric registry to put this modules metrics in. If no
     *     registry metrics not taken
     * @param {ozpIwc.policyAuth.PDP} [config.authorization] The authorization component for this module.
     * @param {Promise} [config.ready]
     */
    var PostMessage = util.extend(transport.listener.Base, function (config) {
        transport.listener.Base.apply(this, arguments);
    });


    /**
     * @property name
     * @type {String}
     */
    PostMessage.prototype.name = "PostMessage";



    /**
     * Checkes if the postMessage received packet is a valid packet and
     * forwards it to the local participant.
     * @private
     * @static
     * @method forwardPacket
     * @param  {ozpIwc.transport.Participant} participant [description]
     * @param  {ozpIwc.transport.PacketContext.packet} packet      [description]
     */
    var forwardPacket = function (participant, packet, event) {
        if (util.isIWCPacket(packet)) {
            participant.forwardFromPostMessage(packet, event);
        } else {
            log.debug("Packet does not meet IWC Packet criteria, dropping.", packet);
        }
    };

    /**
     * Creates an IWC participant given the receiving of a message from an
     * unknown sender (new participant).
     * Leverages the message event to gain information about the new participant.
     * @static
     * @private
     * @method genParticipant
     * @param  {ozpIwc.transport.listener.PostMessage} listener
     * @param  {Event} event    "message" event
     * @param  {ozpIwc.transport.PacketContext.packet} packet
     */
    var genParticipant = function(listener, event, packet) {
        var type = packet.type || "default";
        var participant;
        var config = {
            'authorization': listener.authorization,
            'origin': event.origin,
            'source': event.source,
            'router': listener.router,
            'credentials': packet.entity,
            'ready': listener.readyPromise
        };
        switch (type.trim().toLowerCase()) {
            case "debugger":
                participant = new transport.participant.PMDebugger(config);
                break;
            case "default":
                participant = new transport.participant.PostMessage(config);
                break;
        }

        if (participant && !participant.invalid) {
            listener.router.registerParticipant(participant, packet);
            listener.participants.push(participant);
            return participant;
        }
    };

    /**
     * When receiving a "message" event from an unknown source, check against
     * the permissions to see if a participant can be made for the sender.
     * Returns an asyncAction that will succeed if the permissions allow.
     * @static
     * @private
     * @method verifyParticipant
     * @param  {ozpIwc.transport.listener.PostMessage} listener
     * @param  {Event} event    [description]
     * @return {ozpIwc.util.AsyncAction} will call success if participant is
     * allowed to be created.
     */
    var verifyParticipant = function(listener, event){
        var request = {
            'subject': {'ozp:iwc:origin': event.origin},
            'action': {'ozp:iwc:action': 'connect'},
            'policies': listener.authorization.policySets.connectSet
        };
        return listener.authorization.isPermitted(request);
    };
    /**
     * @method registration
     * @override
     */
    PostMessage.prototype.registration = function () {
        var listener = this;
        util.addEventListener("message", function (event) {
            var participant = listener.findParticipant(event.source);
            var packet = event.data;
            if (event.source === util.globalScope) {
                // the IE profiler seems to make the window receive it's own postMessages
                // ... don't ask.  I don't know why
                return;
            }
            if (typeof(event.data) === "string") {
                try {
                    packet = JSON.parse(event.data);
                } catch (e) {
                    // assume that it's some other library using the bus and let it go
                    return;
                }
            }
            // if this is a window who hasn't talked to us before, sign them up
            if (!participant) {
                verifyParticipant(listener, event).success(function() {
                    participant = genParticipant(listener, event, packet);
                    if(participant){
                        forwardPacket(participant, packet, event);
                    }
                }).failure(function (err) {
                    log.error("Failed to connect. Could not authorize:", err);
                });
            } else {
                forwardPacket(participant, packet, event);
            }

        });
    };

    return PostMessage;

}(ozpIwc.log, ozpIwc.transport, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
ozpIwc.transport.listener = ozpIwc.transport.listener || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.participant
 */


ozpIwc.transport.listener.SharedWorker = (function (log, transport, util) {
    /**
     * Listens for Message Port PostMessage messages from outside the Shared Web Worker and forwards them to the
     *     respected Participant.
     *
     * @class SharedWorker
     * @namespace ozpIwc.transport.listener
     * @extends ozpIwc.transport.participant.Base
     * @param {Object} [config]
     * @param {ozpIwc.transport.Router} [config.router]
     * @param {ozpIwc.metric.Registry} [config.metrics] The metric registry to put this modules metrics in. If no
     *     registry metrics not taken
     * @param {ozpIwc.policyAuth.PDP} [config.authorization] The authorization component for this module.
     */
    var SharedWorker = util.extend(transport.listener.Base, function (config) {
        transport.listener.Base.apply(this, arguments);
    });


    /**
     * @property name
     */
    SharedWorker.prototype.name = "SharedWorker";

    /**
     * @method registration
     * @override
     */
    SharedWorker.prototype.registration = function () {
        util.addEventListener("connect", connectHandlerGen(this), false);
    };

    /**
     * A handler for participant connect events to the listener.
     * @method connectHandlerGen
     * @private
     * @param {SharedWorker} listener
     */
    var connectHandlerGen = function (listener) {
        return function (event) {
            var port = event.ports[0];

            var config = {
                'authorization': listener.authorization,
                'router': listener.router,
                'port': port,
                'ready': listener.readyPromise
            };

            port.addEventListener('message', messageHandlerGen(listener, port, config));
            port.start();
        };
    };

    /**
     * Generates an init message handler for the sharedWorkerListener's connection of a participant.
     * Handler destroyed after first message (connect message) as the participant opens its own message handler.
     * @method messageHandlerGen
     * @param {SharedWorker} listener
     * @param {Window} port
     * @param {Object} config
     * @returns {Function}
     */
    var messageHandlerGen = function (listener, port, config) {
        return function initMsg(evt) {

            // If the first message received is not noting the type of participant to create, kill the connection
            // The first message notifies (1) the type of participant and (2)
            // the origin that opened the IWC connection.
            if (evt.data && typeof(evt.data.type) === "string") {
                var type = evt.data.type.trim();
                config.origin = evt.data.proxyAs.origin.trim();
                var participant;
                switch (type.toLowerCase()) {
                    case "debugger":
                        participant = new transport.participant.SWDebugger(config);
                        break;
                    default:
                        participant = new transport.participant.SharedWorker(config);
                        break;
                }
                if (participant && !participant.invalid) {
                    listener.router.registerParticipant(participant);
                    listener.participants.push(participant);
                }
            }
            port.removeEventListener('message', initMsg);
        };
    };

    return SharedWorker;
}(ozpIwc.log, ozpIwc.transport, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
/**
 * @module ozpIwc
 * @submodule ozpIwc.transport
 */



ozpIwc.transport.PacketContext = (function (util) {
    /**
     * @class PacketContext
     * @namespace ozpIwc.transport
     * @param {Object} config
     * @param {ozpIwc.packet.Transport} config.packet
     * @param {ozpIwc.transport.Router} config.router
     * @param {ozpIwc.transport.participant.Base} [config.srcParticpant]
     * @param {ozpIwc.transport.participant.Base} [config.dstParticpant]
     */
    var PacketContext = function (config) {
        /**
         * @property packet
         * @type ozpIwc.packet.Transport
         */

        /**
         * @property router
         * @type ozpIwc.transport.Router
         */

        /**
         * @property [srcParticipant]
         * @type ozpIwc.transport.participant.Base
         */

        /**
         * @property [dstParticipant]
         * @type ozpIwc.transport.participant.Base
         */
        for (var i in config) {
            this[i] = config[i];
        }
    };

    /**
     * Formats a response packet,
     *
     * @method makeReplyTo
     * @param {Object} response
     * @param {Number} [response.ver]
     * @param {Number} [response.time]
     * @param {String} [response.replyTo]
     * @param {String} [response.src]
     * @param {String} [response.dst]
     * @return {Object}
     */
    PacketContext.prototype.makeReplyTo = function (response) {
        var now = new Date().getTime();
        response.ver = response.ver || 1;
        response.time = response.time || now;
        response.replyTo = response.replyTo || this.packet.msgId;
        response.src = response.src || this.packet.dst;
        response.dst = response.dst || this.packet.src;
        response.respondOn = response.respondOn || "none";
        return response;
    };

    /**
     * Sends the given response to the sender of this context if the packet respondOn criteria is met.
     *
     * @method replyTo
     * @param {ozpIwc.packet.Transport} response
     * @return {ozpIwc.packet.Transport} the packet that was sent
     */
    PacketContext.prototype.replyTo = function (response) {

        if (shouldReply(this, response)) {
            response = this.makeReplyTo(response);

            if (this.dstParticipant) {
                this.dstParticipant.send(response);
            } else {
                response.msgId = response.msgId || util.now();
                this.router.send(response);
            }
            return response;
        }
    };

    /**
     * Returns true if this packet be replied to based on its respondOn.
     *
     * @method shouldReply
     * @private
     * @static
     * @param {ozpIwc.transport.PacketContext} context
     * @param {Object} response
     * @return {Boolean}
     */
    var shouldReply = function (context, response) {
        context.packet = context.packet || {};
        context.packet.respondOn = context.packet.respondOn || "all";

        switch (context.packet.respondOn) {
            case "none":
                return false;
            case "error":
                return /(bad|no).*/.test(response.response);
            default: // "all"
                return true;
        }
    };

    return PacketContext;
}(ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
ozpIwc.transport.participant = ozpIwc.transport.participant || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.participant
 */

ozpIwc.transport.participant.Client = (function (transport, util) {

    /**
     * A participant for the client's communication needs.
     * @class Client
     * @namespace ozpIwc.transport.participant
     *
     * @constructor
     * @extends ozpIwc.transport.participant.Base
     * @uses ozpIwc.util.ApiPromiseMixin
     * @param {Object} config
     * @param {ozpIwc.metric.Registry} [config.metrics] The metric registry to put this modules metrics in. If no
     *     registry metrics not taken
     * @param {String} config.name The name of the participant.
     * @param {Boolean} [config.internal=false] Is this participant internal to the bus or used in a client.
     */
    var Client = util.extend(transport.participant.Base, function (config) {
        config = config || {};
        if (!config.router) {
            throw "Client Participant requires a router.";
        }

        transport.participant.Base.apply(this, arguments);
        /**
         * The type of the participant.
         * @property participantType
         * @type {String}
         * @default "internal"
         */
        this.participantType = "internalClient";

        /**
         * Notes if this is a client participant internal to the bus.
         * @property internal
         * @type {Boolean}
         * @default false
         */
        this.internal = config.internal || false;
        /**
         * The name of the participant.
         * @property name
         * @type {String}
         * @default ""
         */
        this.name = config.name;

        /**
         * Metric registry to store metrics on this link.
         * @property metrics
         * @type {ozpIwc.metric.Registry}
         */
        this.metrics = config.metrics;

        /**
         * The router to connect to.
         * @property router
         * @type {ozpIwc.transport.Router}
         */
        this.router = config.router;
        var self = this;
        this.on("connectedToRouter", function () {
            self.permissions.pushIfNotExist('ozp:iwc:address', self.address);
            self.permissions.pushIfNotExist('ozp:iwc:sendAs', self.address);
            self.permissions.pushIfNotExist('ozp:iwc:receiveAs', self.address);

            if (this.metrics) {
                this.metrics.gauge(self.metricRoot, "registeredCallbacks").set(function () {
                    if (!self.replyCallbacks || !Object.keys(self.replyCallbacks)) {
                        return 0;
                    }
                    return Object.keys(self.replyCallbacks).length;
                });
            }
        });

        util.ApiPromiseMixin(this, config.autoConnect);
    });


    /**
     * Connects the client from the IWC bus.
     * Fires:
     *     - {{#crossLink "ozpIwc.Client/#connected"}}{{/crossLink}}
     *
     * @method connect
     */
    Client.prototype.connect = function () {

        if (!this.connectPromise) {
            var self = this;
            /**
             * Promise to chain off of for client connection asynchronous actions.
             * @property connectPromise
             *
             * @type Promise
             */
            this.connectPromise = new Promise(function (resolve, reject) {
                resolve(self.router.registerParticipant(self));
            }).then(function (addr) {
                    return self.afterConnected(addr);
                });
        }

        return this.connectPromise;
    };
    /**
     * Send functionality for the Client type Participant.
     *
     * @method sendImpl
     * @param {ozpIwc.packet.Transport} packet
     */
    Client.prototype.sendImpl = transport.participant.Base.prototype.send;

    return Client;
}(ozpIwc.transport, ozpIwc.util));
var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
ozpIwc.transport.participant = ozpIwc.transport.participant || {};
ozpIwc.wiring = ozpIwc.wiring || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.participant
 */


ozpIwc.transport.participant = (function (log, ozpConfig, participant, transport, util, wiring) {

    var debuggerGen = function (Base) {
        /**
         * An abstract Debugger participant. Used by a factory to generate transport specific debuggers.
         *
         * @class Debugger
         * @namespace ozpIwc.transport.participant
         * @constructor
         * @abstract
         *
         */
        var Debugger = util.extend(Base, function (config) {
            var localOrigin = util.getOrigin();
            if(config.origin !== localOrigin){
                var error = "Debugger participants are only permitted on" +
                " Bus-domain applications. Debugger creation attempted from " +
                "Application-domain: [" + config.origin  +
                "] while Bus-domain is: [" + localOrigin + "]";
                log.error(error);

                this.invalid = true;
                util.safePostMessage(config.port, {
                    iwcInit: true,
                    error: error
                });
                return;
            }

            Base.apply(this, arguments);
            this.name = "DebuggerParticipant";
            this.router = config.router;
            this.peer = this.router.peer;
            var self = this;
            this.logging = {
                enabled: false,
                watchList: {},
                notifyListeners: function (event) {
                    for (var i in self.logging.watchList) {
                        debuggerResponse(self, {
                            response: "changed",
                            replyTo: self.logging.watchList[i].msgId,
                            entity: event
                        });
                    }
                }
            };

            this.on("receive", this.handleReceivePacket);
        });

        //----------------------------------------------------------------
        // Private Methods
        //----------------------------------------------------------------
        /**
         * A utility for the debugger to respond to whom sent it a packet.
         * @method debuggerResponse
         * @private
         * @static
         * @param {Debugger} participant
         * @param {ozpIwc.Transport.PacketContext} packet
         */
        var debuggerResponse = function (participant, packet) {
            packet = packet || {};
            packet.src = packet.src || participant.address;
            packet.response = packet.response || "ok";
            packet = participant.fixPacket(packet);
            participant.sendToRecipient(packet);
        };

        //----------------------------------------------------------------
        // dst: $transport, resource: traffic
        //----------------------------------------------------------------
        /**
         * Handler method for $transport packets of resource "traffic".
         * @method handleTrafficPacket
         * @private
         * @static
         * @param participant
         * @param packet
         */
        var handleTrafficPacket = function (participant, packet) {
            switch (packet.action.trim().toLowerCase()) {
                case "start":
                    enableLogging(participant, packet);
                    break;

                case "stop":
                    disableLogging(participant, packet);
                    break;
            }
        };


        //----------------------------------------------------------------
        // dst: $transport, resource: traffic, action: start
        //----------------------------------------------------------------

        /**
         *
         * Starts the debugger participant sending packet logs.
         * @method enableLogging
         * @private
         * @static
         * @param {Debugger} participant
         * @param {ozpIwc.transport.PacketContext} packet
         */
        var enableLogging = function (participant, packet) {
            participant.logging.watchList[packet.msgId] = packet;

            if (!participant.logging.enabled) {
                participant.logging.enabled = true;
                participant.peer.on("receive", participant.logging.notifyListeners);
                participant.peer.on("send", participant.logging.notifyListeners);
            }

            debuggerResponse(participant, {replyTo: packet.msgId});
        };

        /**
         * Stops the debugger participant from sending packet logs.
         * @method disableLogging
         * @private
         * @static
         * @param {Debugger} participant
         * @param {ozpIwc.transport.PacketContext} packet
         */
        var disableLogging = function (participant, packet) {
            packet = packet || {};
            packet.entity = packet.entity || {};
            if (packet.entity.msgId && participant.logging.watchList[packet.entity.msgId]) {
                delete participant.logging.watchList[packet.entity.msgId];
            }
            if (participant.logging.enabled && Object.keys(participant.logging.watchList).length === 0) {
                participant.logging.enabled = false;
                participant.peer.off("receive", participant.logging.notifyListeners);
                participant.peer.off("send", participant.logging.notifyListeners);
            }

            debuggerResponse(participant, {replyTo: packet.msgId});

        };

        //----------------------------------------------------------------
        // dst: $transport, resource: apis
        //----------------------------------------------------------------
        /**
         * Routing of $transport packets for the resource "apis"
         * @method handleApiPacket
         * @private
         * @static
         * @param {Debugger} participant
         * @param {ozpIwc.transport.PacketContext} packet
         */
        var handleApiPacket = function (participant, packet) {
            switch (packet.action.trim().toLowerCase()) {
                case "getendpoints":
                    handleEndpointGather(participant, packet);
                    break;
            }
        };

        //----------------------------------------------------------------
        // dst: $transport, resource: apis, action: getEndpoint
        //----------------------------------------------------------------
        /**
         * A handler for the $transport packet action "getEndpoints" on resource "apis"
         * @method handleEndpointGather
         * @private
         * @static
         * @param {Debugger} participant
         * @param {ozpIwc.transport.PacketContext} packet
         */
        var handleEndpointGather = function (participant, packet) {
            // Wait until the initial endpoint gather has resolved to get endpoint paths.
            var promise = wiring.endpointInitPromise || Promise.resolve();
            promise.then(function () {
                var data = [];
                for (var i in wiring.apis) {
                    var api = wiring.apis[i];
                    for (var j in api.endpoints) {
                        var ep = api.endpoints[j];
                        var endpoint = ozpIwc.api.endpoint(ep.link);
                        data.push({
                            'name': api.name,
                            'rel': endpoint.name,
                            'path': endpoint.baseUrl
                        });
                    }
                }
                debuggerResponse(participant, {replyTo: packet.msgId, entity: data});
            });
        };


        //----------------------------------------------------------------
        // dst: $transport, resource: metrics
        //----------------------------------------------------------------
        /**
         * Routing of $transport packets for the resource "metrics"
         * @method handleMetricPacket
         * @private
         * @static
         * @param {Debugger} participant
         * @param {ozpIwc.transport.PacketContext} packet
         */
        var handleMetricPacket = function (participant, packet) {
            switch (packet.action.trim().toLowerCase()) {
                case "getall":
                    handleMetricGather(participant, packet);
                    break;
            }
        };
        //----------------------------------------------------------------
        // dst: $transport, resource: metrics, action: getAll
        //----------------------------------------------------------------
        /**
         * A handler for the $transport packet action "getAll" on resource "metrics"
         * @method handleEndpointGather
         * @private
         * @static
         * @param {Debugger} participant
         * @param {ozpIwc.transport.PacketContext} packet
         */
        var handleMetricGather = function (participant, packet) {
            var metrics = wiring.metrics.allMetrics();
            for (var i in metrics) {
                metrics[i].value = metrics[i].get();
            }
            debuggerResponse(participant, {replyTo: packet.msgId, entity: metrics});
        };

        //----------------------------------------------------------------
        // dst: $transport, resource: config
        //----------------------------------------------------------------
        /**
         * Routing of $transport packets for the resource "config"
         * @method handleConfigPacket
         * @private
         * @static
         * @param {Debugger} participant
         * @param {ozpIwc.transport.PacketContext} packet
         */
        var handleConfigPacket = function (participant, packet) {
            switch (packet.action.trim().toLowerCase()) {
                case "getall":
                    handleConfigGather(participant, packet);
                    break;
            }
        };
        //----------------------------------------------------------------
        // dst: $transport, resource: config, action: getAll
        //----------------------------------------------------------------
        /**
         * A handler for the $transport packet action "getAll" on resource "config".
         * Sends a copy of the ozpIwc.config to the client-side debugger.
         * @method handleConfigGather
         * @private
         * @static
         * @param {Debugger} participant
         * @param {ozpIwc.transport.PacketContext} packet
         */
        var handleConfigGather = function (participant, packet) {
            debuggerResponse(participant, {replyTo: packet.msgId, entity: ozpConfig});
        };
        //----------------------------------------------------------------------
        // Public Properties
        //----------------------------------------------------------------------

        /**
         * Handles $transport packets from the participant.
         * @method handleTransportPacket
         * @override
         * @param {Object} packet
         * @param {Event} event
         */
        Debugger.prototype.handleReceivePacket = function (packet, event) {
            if (typeof(packet.resource) !== "string") {
                transport.participant.SharedWorker.prototype.handleTransportPacket.call(this, packet);
                return;
            }

            switch (packet.resource.trim().toLowerCase()) {
                case "metrics":
                    handleMetricPacket(this, packet);
                    break;
                case "traffic":
                    handleTrafficPacket(this, packet);
                    break;
                case "apis":
                    handleApiPacket(this, packet);
                    break;
                case "config":
                    handleConfigPacket(this, packet);
                    break;
                default:
                    break;
            }
        };
        /**
         * Receives a packet on behalf of this participant and forwards it via SharedWorker.
         *
         * @method receiveFromRouterImpl
         * @param {ozpIwc.transport.PacketContext} packetContext
         */
        Debugger.prototype.receiveFromRouterImpl = function (packetContext) {
            // If the source address was the client connected to the participant handle its specific request.
            // Routed through router to apply policies (otherwise would have hijacked on the MessageChannel receive).
            if (packetContext.packet.src === packetContext.packet.dst) {
                this.handleReceivePacket(packetContext.packet);
            } else {
                this.sendToRecipient(packetContext.packet);
            }
        };

        return Debugger;

    };

    participant.SWDebugger = debuggerGen(participant.SharedWorker);
    participant.PMDebugger = debuggerGen(participant.PostMessage);

    return participant;
}(ozpIwc.log, ozpIwc.config, ozpIwc.transport.participant || {}, ozpIwc.transport, ozpIwc.util, ozpIwc.wiring));

var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
ozpIwc.transport.participant = ozpIwc.transport.participant || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.participant
 */


ozpIwc.transport.participant.Multicast = (function (transport, util) {
    /**
     * A participant to handle multicast communication on the IWC.
     *
     * @class Multicast
     * @namespace ozpIwc.transport.participant
     * @extends ozpIwc.transport.participant.Base
     * @constructor
     *
     * @param {String} name The name of the participant.
     */
    var Multicast = util.extend(transport.participant.Base, function (config) {

        /**
         * The address of the participant.
         * @property address
         * @type String
         */
        this.address = config.name;

        /**
         * The name of the participant.
         * @property name
         * @type String
         */
        this.name = config.name;

        /**
         * The type of the participant
         * @property participantType
         * @type String
         * @default "multicast"
         */
        this.participantType = "multicast";

        transport.participant.Base.apply(this, arguments);

        /**
         * Array of Participants that are part of the multicast group.
         * @property members
         * @type ozpIwc.transport.participant.Base[]
         * @default []
         */
        this.members = [];

        /**
         * The participants resource path for the Names API.
         * @property namesResource
         * @type String
         * @default "/multicast/"
         */
        this.namesResource = "/multicast/" + this.name;

        /**
         * Content type for the Participant's heartbeat status packets.
         * @property heartBeatContentType
         * @type String
         * @default "application/vnd.ozp-iwc-multicast-address-v1+json"
         */
        this.heartBeatContentType = "application/vnd.ozp-iwc-multicast-address-v1+json";

        /**
         *
         * @property heartBeatStatus.members
         * @type Array
         * @default []
         */
        this.heartBeatStatus.members = [];

        /**
         * Fires when the participant has connected to its router.
         * @event #connectedToRouter
         */
        this.on("connectedToRouter", function () {
            this.namesResource = "/multicast/" + this.name;
        }, this);

        //At creation the multicast participant knows what it can sendAs/receiveAs
        this.permissions.pushIfNotExist('ozp:iwc:address', config.name);
        this.permissions.pushIfNotExist('ozp:iwc:sendAs', config.name);
        this.permissions.pushIfNotExist('ozp:iwc:receiveAs', config.name);
    });

    /**
     * Receives a packet on behalf of the multicast group.
     *
     * @method receiveFromRouterImpl
     *
     * @param {ozpIwc.packet.Transport} packet
     * @return {Boolean} always false.
     */
    Multicast.prototype.receiveFromRouterImpl = function (packet) {
        if (this.metrics) {
            this.receivedPacketsMeter.mark();
        }
        this.members.forEach(function multicastRoute (m) {
            // as we send to each member, update the context to make it believe that it's the only recipient
            packet.dstParticipant = m;
            m.receiveFromRouter(packet);
        });
        return false;
    };

    /**
     * Adds a member to the multicast group.
     *
     * @method addMember
     *
     * @param {ozpIwc.transport.participant.Base} participant
     */
    Multicast.prototype.addMember = function (participant) {
        this.members.push(participant);
        this.heartBeatStatus.members.push(participant.address);
    };

    return Multicast;
}(ozpIwc.transport, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
ozpIwc.transport.participant = ozpIwc.transport.participant || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.participant
 */


ozpIwc.transport.participant.MutexClient = (function (transport, util) {
    /**
     * A Client participant that adheres to mutual exclusion on the IWC Bus based on its **name**. If another mutex
     * client controls the lock, outbound requests of this client will be dropped. Adhering to distributed practices,
     * during a transition of lock ownership all mutex clients related to the lock will queue outbound requests.
     *
     * @class MutexClient
     * @namespace ozpIwc.transport.participant
     * @extends ozpIwc.transport.participant.Client
     * @constructor
     *
     * @param {String} name The name of the participant.
     */
    var MutexClient = util.extend(transport.participant.Client, function (config) {
        config = config || {};
        if (!config.name) {
            throw "Cannot instantiate a MutexClient without a name.";
        }
        transport.participant.Client.apply(this, arguments);
        /**
         * The type of the participant
         * @property participantType
         * @type String
         * @default "multicast"
         */
        this.participantType = "MutexClient";

        this.onLock = config.onLock || function () {};
        this.onRelease = config.onRelease || function () {};

        requestOwnership(this);
    });


    /**
     * Remove this participant from the $bus.multicast multicast group.
     *
     * @method leaveEventChannel
     */
    MutexClient.prototype.leaveEventChannel = function () {
        this.events.trigger("shutdown");

        if (this.router) {
            this.send({
                dst: "$bus.multicast",
                action: "disconnect",
                entity: {
                    address: this.address,
                    participantType: this.participantType,
                    namesResource: this.namesResource
                }
            });
            return true;
        } else {
            return false;
        }

    };
    MutexClient.prototype.relock = function () {
        if (this.lockPromise) {
            return;
        }
        requestOwnership(this);
    };
    //-----------------------------------------------------
    // Private Methods
    //-----------------------------------------------------
    var requestOwnership = function (mutexClient) {
        if (mutexClient.lockPromise) {
            return;
        }
        mutexClient.lockPromise = util.mutex({
            requester: mutexClient,
            resource: "/mutex/" + mutexClient.name,
            onUnlock: function () {
                mutexClient.lockPromise = undefined;
                mutexClient.onRelease();
            }
        }).then(mutexClient.onLock);
    };


    return MutexClient;
}(ozpIwc.transport, ozpIwc.util));
var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
ozpIwc.transport.participant = ozpIwc.transport.participant || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.participant
 */


ozpIwc.transport.participant.RouterWatchdog = (function (transport, util) {
    /**
     * @class RouterWatchdog
     * @namespace ozpIwc.transport.participant
     * @extends ozpIwc.transport.participant.Internal
     */
    var RouterWatchdog = util.extend(transport.participant.Client, function (config) {
        transport.participant.Client.apply(this, arguments);
        this.internal = true;

        /**
         * The type of the participant.
         * @property participantType
         * @type String
         */
        this.participantType = "routerWatchdog";

        /**
         * Frequency of heartbeats
         * @property heartbeatFrequency
         * @type Number
         * @defualt 10000
         */
        this.heartbeatFrequency = config.heartbeatFrequency || 10000;

        /**
         * Fired when connected to the router.
         * @event #connectedToRouter
         */
        this.on("connectedToRouter", setupWatches, this);

        var self = this;
        this.on("beforeunload", function () {
            self.leaveEventChannel();
        });
    });

    /**
     * Removes this participant from the $bus.multicast multicast group.
     *
     * @method leaveEventChannel
     * @override
     */
    RouterWatchdog.prototype.leaveEventChannel = function () {
        // handle anything before leaving.
        if (this.router) {

            this.send({
                dst: "$bus.multicast",
                action: "disconnect",
                entity: {
                    address: this.address,
                    participantType: this.participantType,
                    namesResource: this.namesResource
                }
            });

            this.send({
                dst: "$bus.multicast",
                action: "disconnect",
                entity: {
                    address: this.router.selfId,
                    namesResource: "/router/" + this.router.selfId
                }
            });
            //TODO not implemented
            //this.router.unregisterMulticast(this, ["$bus.multicast"]);
            return true;
        } else {
            return false;
        }

    };
    /**
     * Sets up the watchdog for all participants connected to the router. Reports heartbeats based on
     * {{#crossLink "ozpIwc.RouterWatchdogParticipant/heartbeatFrequency:property"}}{{/crossLink}}
     * @method setupWatches
     * @private
     */
    var setupWatches = function () {
        this.name = this.router.selfId;
        var self = this;
        var heartbeat = function () {
            var packets = [];
            var p = self.names().messageBuilder.set("/router/" + self.router.selfId, {
                contentType: "application/vnd.ozp-iwc-router-v1+json",
                entity: {
                    'address': self.router.selfId,
                    'participants': self.router.getParticipantCount(),
                    'time': util.now()
                },
                respondOn: "none"
            });
            packets.push(p);

            for (var k in self.router.participants) {
                var participant = self.router.participants[k];
                participant.heartBeatStatus.time = util.now();
                if (participant instanceof transport.participant.Multicast) {
                    /*jshint loopfunc:true*/
                    participant.members.forEach(function (member) {
                        p = self.names().messageBuilder.set(participant.namesResource + "/" + member.address, {
                            'entity': member.heartBeatStatus,
                            'contentType': participant.heartBeatContentType,
                            'respondOn': "none"
                        });
                        packets.push(p);
                    });
                } else {

                    packets.push({
                        packet: participant.heartbeat(),
                        callback: undefined,
                        res: function () {},
                        rej: function () {}
                    });
                }
            }

            // Send all heartbeats at once
            self.names().bulkSend(packets);

        };

        /**
         * The timer for the heartBeat
         * @property timer
         * @type window.setInterval
         */
        this.timer = setInterval(heartbeat, this.heartbeatFrequency);
        heartbeat();
    };

    /**
     * Removes the watchdog.
     * @method shutdown
     */
    RouterWatchdog.prototype.shutdown = function () {
        clearInterval(this.timer);
    };

    return RouterWatchdog;
}(ozpIwc.transport, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
/**
 * @module ozpIwc
 * @submodule ozpIwc.api
 */


/**
 * @class api
 * @static
 * @namespace ozpIwc
 */
ozpIwc.api = (function (api) {
    /**
     * Initializes the Endpoint Registry with the api root path.
     *
     * @method initEndpoints
     * @static
     * @param {String} apiRoot
     */
    api.initEndpoints = function (config) {
        config = config || {};

        var registry = new api.EndpointRegistry(config);
        /**
         * A static method for gathering an endpoint from the EndpointRegistry.
         * @method endpoint
         * @static
         * @param {String} name the endpoint name to gather
         * @returns {ozpIwc.api.Endpoint}
         */
        api.endpoint = function (name) {
            return registry.endpoint(name);
        };

        /**
         * A static method for gathering the uri template of an endpoint name in the EndpointRegistry
         * @param {String} name
         * @returns {Object}
         */
        api.uriTemplate = function (name) {
            return registry.template[name];
        };

        api.endpointPromise = registry.loadPromise;

        return api.endpointPromise;
    };

    /**
     * Creates a subclass of base api and adds some static helper functions.
     *
     * @method createApi
     * @static
     * @param {Object} config
     * @param {String} config.name
     * @param {ozpIwc.transport.Router} config.router
     * @param {Function} init the constructor function for the class
     * @return {Object} A new API class that inherits from the base api class.
     */
    api.createApi = function (name, init) {

        var createdApi = ozpIwc.util.extend(api.base.Api, function () {

            //Hijack the arguments and set the api name if not given in the config
            var config = arguments[0];
            config.name = config.name || name;

            api.base.Api.apply(this, [config]);
            return init.apply(this, arguments);
        });
        ozpIwc.util.PacketRouter.mixin(createdApi);
        createdApi.useDefaultRoute = function (actions, resource) {
            resource = resource || "{resource:.*}";
            actions = ozpIwc.util.ensureArray(actions);
            actions.forEach(function (a) {
                var filterFunc = api.filter.standard.forAction(a);
                createdApi.declareRoute({
                        action: a,
                        resource: resource,
                        filters: (filterFunc ? filterFunc() : [])
                    }, api.base.Api.defaultHandler[a]
                );
            });
        };

        createdApi.declareRoute({
            action: ["bulkSend"],
            resource: "{resource:.*}",
            filters: []
        }, function (packet, context, pathParams) {
            var messages = packet.entity || [];

            messages.forEach(function (message) {
                var packetContext = new ozpIwc.transport.PacketContext({
                    'packet': message.packet,
                    'router': this.router,
                    'srcParticipant': message.packet.src,
                    'dstParticipant': this.address
                });
                this.receivePacketContext(packetContext);
            }, this);
            return {response: "ok"};
        });
        return createdApi;
    };

    return api;
}(ozpIwc.api));
var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
/**
 * @module ozpIwc
 * @submodule ozpIwc.api
 */
/**
 * @class Lifespan
 * @static
 * @namespace ozpIwc
 */
ozpIwc.api.Lifespan = (function (Lifespan) {


    /**
     * A object formatter for the node's lifespan. If passed as just a string, format it to the object notation.
     * @method getLifespan
     * @static
     * @param {Object} node
     * @param {object} config
     * @return {Object|undefined}
     */
    Lifespan.getLifespan = function (node, config) {
        if (!config || !config.lifespan) {
            return;
        }
        if (typeof config.lifespan === "string") {
            var type = config.lifespan;
            config.lifespan = {
                'type': type
            };
        }
        if (!config.lifespan.type) {
            return;
        }

        var lifespanObj = config.lifespan;
        lifespanObj.type = lifespanObj.type.charAt(0).toUpperCase() + lifespanObj.type.slice(1);

        if (lifespanObj.type === "Bound") {
            if (!lifespanObj.addresses) {
                if (!config.src) {
                    return;
                }
                lifespanObj.addresses = [config.src];
            }
            if (node.lifespan && node.lifespan.type === "Bound") {
                node.lifespan.addresses = node.lifespan.addresses || [];
                node.lifespan.addresses.forEach(function (address) {
                    if (lifespanObj.addresses.indexOf(address) === -1) {
                        lifespanObj.addresses.push(address);
                    }
                });
            }
        }
        return lifespanObj;
    };


    /**
     * Returns the lifespan functionality given the lifespan object given.
     * @method getLifespanFunctionality
     * @static
     * @param {Object} lifespanObj
     * @param {String} lifespanObj.type
     * @return {{shouldPersist: Function, shouldDelete: Function}|*}
     */
    Lifespan.getLifespanFunctionality = function (lifespanObj) {

        switch (lifespanObj.type) {
            case "Ephemeral":
                return Lifespan.ephemeralFunctionality;
            case "Persistent":
                return Lifespan.persistentFunctionality;
            case "Bound":
                return Lifespan.boundFunctionality;
            default:
                throw new Error("Received a malformed Lifespan, resource will be dropped: ", lifespanObj);
        }
    };

    /**
     * Functionality for ephemeral lifespans.
     * @method ephemeralFunctionality
     * @static
     * @type {{shouldPersist: Function, shouldDelete: Function}}
     */
    Lifespan.ephemeralFunctionality = {
        shouldPersist: function () { return false; },
        shouldDelete: function () { return false; }
    };

    /**
     * Functionality for persistant lifespans.
     * @method ephemeralFunctionality
     * @static
     * @type {{shouldPersist: Function, shouldDelete: Function}}
     */
    Lifespan.persistentFunctionality = {
        shouldPersist: function () { return true; },
        shouldDelete: function () { return false; }
    };


    /**
     * Functionality for bound lifespans.
     * @method ephemeralFunctionality
     * @static
     * @type {{shouldPersist: Function, shouldDelete: Function}}
     */
    Lifespan.boundFunctionality = {
        shouldPersist: function () { return false; },
        shouldDelete: function (lifespan, address) {
            var len = address.length;
            lifespan.addresses = lifespan.addresses || [];
            lifespan.addresses = lifespan.addresses.filter(function (addr) {
                return (addr.substr(-len) !== address);
            });

            return (lifespan.addresses.length === 0);
        }
    };

    /**
     * Creates a persistent lifespan object
     * @Class Persistent
     * @namespace ozpIwc.api.Lifespan
     * @constructor
     */
    Lifespan.Persistent = function () {
        this.type = "Persistent";
    };

    /**
     * Creates an ephemeral lifespan object
     * @Class Ephemeral
     * @namespace ozpIwc.api.Lifespan
     * @constructor
     */
    Lifespan.Ephemeral = function () {
        this.type = "Ephemeral";
    };

    /**
     * Creates a bound lifespan object
     * @Class Bound
     * @namespace ozpIwc.api.Lifespan
     * @property {Object} config
     * @property {String[]} config.addresses
     * @constructor
     *
     */
    Lifespan.Bound = function (config) {
        config = config || {};
        this.type = "Bound";
        this.addresses = config.addresses || [];
    };

    return Lifespan;
}(ozpIwc.api.Lifespan || {}));
var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
/**
 * @module ozpIwc
 * @submodule ozpIwc.api
 */

ozpIwc.api.Endpoint = (function (util) {
    /**
     * @class Endpoint
     * @namespace ozpIwc.api
     * @param {ozpIwc.api.EndpointRegistry} endpointRegistry Endpoint name
     * @constructor
     */
    var Endpoint = function (endpointRegistry) {

        /**
         * @property endpointRegistry
         * @type ozpIwc.api.EndpointRegistry
         */
        this.endpointRegistry = endpointRegistry;
        this.ajaxQueue = endpointRegistry.ajaxQueue;
    };


    //----------------------------------------
    // Content Type formatting helpers
    //----------------------------------------
    /**
     * removes whitespace of the given content-type.
     * @method trimWhiteSpace
     * @private
     * @tatic
     * @param ct
     * @returns {*}
     */
    var trimWhiteSpace = function (ct) {
        return ct.replace(/ /g, '');
    };

    /**
     * Sets the template content-type as the preferred content type in the Accept header.
     * Returns formatted header array.
     * @method preferContentType
     * @private
     * @static
     * @param contentType
     * @param endpoint
     * @param headers
     * @returns {*}
     */
    var preferContentType = function (contentType, endpoint, headers) {
        contentType = contentType.replace(/ /g, '');

        if (headers.length === 0) {
            //Also add this endpoint's content type as we want to accept lists of lists of resources.
            headers.push({'name': "Accept", 'value': contentType});
        } else {
            var filterCt = function (ct) {
                return (ct.replace(/ /g, '') !== contentType);
            };
            for (var i in headers) {
                if (headers[i].name === "Accept") {
                    if (headers[i].value) {
                        var arr = headers[i].value.split(',').map(trimWhiteSpace);

                        var filtered = arr.filter(filterCt);
                        filtered.unshift(contentType);

                        headers[i].value = filtered.join(',');
                    } else {
                        headers[i].value = contentType;
                    }
                }
            }
        }
        return headers;
    };

    /**
     * Appends the endpoint type if it exists and not already in the Accept header.
     * Returns formatted header array.
     * @method appendEndpointType
     * @private
     * @static
     * @param endpoint
     * @param headers
     * @returns {Array}
     */
    var appendEndpointType = function (endpoint, headers) {
        if (headers.length === 0) {
            headers.push({'name': "Accept", 'value': endpoint.type});
        } else {
            for (var i in headers) {
                if (headers[i].name === "Accept") {
                    if (headers[i].value) {
                        var arr = headers[i].value.split(',').map(trimWhiteSpace);

                        if (arr.indexOf(endpoint.type) === -1) {
                            arr.push(endpoint.type);
                        }
                        headers[i].value = arr.join(',');
                    } else {
                        headers[i].value = endpoint.type;
                    }
                }
            }
        }
        return headers;
    };

    /**
     * Returns necessary Accept headers for a given endpoint path. Mixes accept header of the path with any supplied
     * Accept headers.
     *
     * @method templateContentType
     * @static
     * @private
     * @param {Endpoint} endpoint
     * @param {String} path
     * @param {Array} headers
     * @returns {Array}
     */
    var templateContentType = function (endpoint, path, headers) {
        headers = headers || [];
        var contentType = endpoint.findContentType(path);

        if (contentType) {
            headers = preferContentType(contentType, endpoint, headers);
        }
        if (endpoint.type) {
            headers = appendEndpointType(endpoint, headers);
        }
        return headers;
    };

    /**
     * Performs an AJAX request of GET for specified resource href.
     *
     * @method get
     * @param {String} resource
     * @param [Object] requestHeaders
     * @param {String} requestHeaders.name
     * @param {String} requestHeaders.value
     *
     * @return {Promise}
     */
    Endpoint.prototype.get = function (resource, requestHeaders) {
        var self = this;
        resource = resource || '';
        return this.endpointRegistry.loadPromise.then(function () {
            //If a template states the content type to gather let it be enforced

            var templateHeaders = templateContentType(self, resource, requestHeaders);

            if (!self.endpointRegistry.loaded) {
                throw Error("Endpoint " + self.endpointRegistry.apiRoot + " could not be reached. Skipping GET of " + resource);
            }

            if (resource === '/' || resource === '') {
                resource = self.baseUrl;
            }
            if (!resource) {
                return Promise.reject("no url assigned to endpoint " + self.name);
            }
            return self.ajaxQueue.queueAjax({
                href: resource,
                method: 'GET',
                headers: templateHeaders
            });
        });
    };

    /**
     *
     * Performs an AJAX request of PUT for specified resource href.
     *
     * @method put
     * @param {String} resource
     * @param {Object} data\
     * @param [Object] requestHeaders
     * @param {String} requestHeaders.name
     * @param {String} requestHeaders.value
     *
     * @return {Promise}
     */
    Endpoint.prototype.put = function (resource, data, requestHeaders) {
        var self = this;

        return this.endpointRegistry.loadPromise.then(function () {


            if (resource.indexOf(self.baseUrl) !== 0) {
                resource = self.baseUrl + resource;
            }

            return self.ajaxQueue.queueAjax({
                href: resource,
                method: 'PUT',
                data: data,
                headers: requestHeaders
            });
        });
    };

    /**
     *
     * Performs an AJAX request of DELETE for specified resource href.
     *
     * @method put
     * @param {String} resource
     * @param [Object] requestHeaders
     * @param {String} requestHeaders.name
     * @param {String} requestHeaders.value
     *
     * @return {Promise}
     */
    Endpoint.prototype.delete = function (resource, data, requestHeaders) {
        var self = this;

        return this.endpointRegistry.loadPromise.then(function () {

            if (!self.baseUrl) {
                throw Error("The server did not define a relation of type " + this.name + " for retrivieving " + resource);
            }
            if (resource.indexOf(self.baseUrl) !== 0) {
                resource = self.baseUrl + resource;
            }
            return self.ajaxQueue.queueAjax({
                href: resource,
                method: 'DELETE',
                headers: requestHeaders
            });
        });
    };

    /**
     * Sends AJAX requests to PUT the specified nodes into the endpoint.
     * @todo PUTs each node individually. Currently sends to a fixed api point switch to using the node.self endpoint
     * @todo    and remove fixed resource
     * @method saveNodes
     * @param {ozpIwc.CommonApiValue[]} nodes
     */
    Endpoint.prototype.saveNodes = function (nodes) {
        var resource = "/data";
        for (var node in nodes) {
            var nodejson = JSON.stringify(nodes[node]);
            this.put((nodes[node].self || resource), nodejson);
        }
    };

    /**
     * Checks the path against the endpoint templates to see if an enforced content type exists. Returns
     * the content type if a match is found.
     * @method findContentType
     * @param {String} path
     * @returns {String}
     */
    Endpoint.prototype.findContentType = function (path) {
        for (var i in this.endpointRegistry.template) {
            var check = this.endpointRegistry.template[i].isMatch(path) ||
                this.endpointRegistry.template[i].isMatch(path.substring(path.indexOf(ozpIwc.config.apiRootUrl)));
            if (check) {
                return this.endpointRegistry.template[i].type;
            }
        }
    };

    return Endpoint;
}(ozpIwc.util));
var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.EndpointRegistry = (function (api, log, util) {
    /**
     * @class EndpointRegistry
     * @namespace ozpIwc.api
     * @constructor
     *
     * @param {Object} config
     * @param {String} config.apiRoot the root of the api path.
     */
    var EndpointRegistry = function (config) {
        config = config || {};
        if (!config.ajaxQueue) {
            throw "Endpoints require AjaxPersistenceQueue.";
        }

        var apiRoot = config.apiRoot || '/api';

        /**
         * The root path of the specified apis
         * @property apiRoot
         * @type String
         * @default '/api'
         */
        this.apiRoot = apiRoot;


        /**
         * @property ajaxQueue
         * @type {ozpIwc.util.AjaxPersistenceQueue}
         */
        this.ajaxQueue = config.ajaxQueue;

        /**
         * The collection of api endpoints
         * @property endPoints
         * @type Object
         * @default {}
         */
        this.endPoints = {};

        /**
         * The collection of uri templates for endpoints.
         * @property template
         * @type Object
         * @default {}
         */
        this.template = {};

        var self = this;

        /**
         * An AJAX GET request fired at the creation of the Endpoint Registry to gather endpoint data.
         * @property loadPromise
         * @type Promise
         */
        this.loadPromise = this.ajaxQueue.queueAjax({
            href: apiRoot,
            method: 'GET'
        }).then(function (data) {
            self.loaded = true;
            var payload = data.response || {};
            payload._links = payload._links || {};
            payload._embedded = payload._embedded || {};

            //Generate any endpoints/templates from _links
            for (var linkEp in payload._links) {
                if (linkEp !== 'self') {
                    var link = payload._links[linkEp];
                    if (Array.isArray(payload._links[linkEp])) {
                        link = payload._links[linkEp][0].href;
                    }
                    if (link.templated) {
                        generateTemplate(self, {
                            name: linkEp,
                            type: link.type,
                            href: link.href
                        });
                    } else {
                        self.endpoint(linkEp).baseUrl = link.href;
                        self.endpoint(linkEp).type = link.type;
                    }
                }
            }

            //Generate any endpoints/templates from _embedded links
            for (var embEp in payload._embedded) {
                var embSelf = payload._embedded[embEp]._links.self;
                self.endpoint(embEp).baseUrl = embSelf.href;
                self.endpoint(embEp).type = embSelf.type;
            }

            //Generate any templates from the ozpIwc.conf.js file
            for (var i in config.templates) {
                var template = ozpIwc.config.templates[i];
                var url = false;

                if (template.endpoint && template.pattern) {
                    var baseUrl = self.endpoint(template.endpoint).baseUrl;
                    if (baseUrl) {
                        url = baseUrl + template.pattern;
                    }
                }

                if (!url) {
                    url = template.href;
                }

                generateTemplate(self, {
                    name: i,
                    href: url,
                    type: template.type
                });
            }

            // UGLY HAX
            var dataURL = self.endpoint("ozp:user-data").baseUrl;
            if (!self.template["ozp:data-item"] && dataURL) {
                generateTemplate(self, {
                    name: "ozp:data-item",
                    href: dataURL + "/{+resource}",
                    type: api.data.node.Node.serializedContentType
                });
            }

            if (!self.template["ozp:application-item"]) {
                generateTemplate(self, {
                    name: "ozp:application-item",
                    href: self.endpoint().endpointRegistry.apiRoot + "/listing/{+resource}",
                    type: api.system.node.ApplicationNode.serializedContentType
                });
            }
            //END HUGLY HAX
        })['catch'](function (err) {
            log.debug(Error("Endpoint " + self.apiRoot + " " + err.statusText + ". Status: " + err.status));
            self.loaded = false;
        });
    };

    /**
     * Creates a template in the given registry given a name, href, and type.
     * @method generateTemplate
     * @private
     * @static
     * @param {EndpointRegistry} registry
     * @param {Object} config
     * @param {String} config.href
     * @param {String} config.name
     * @param {String} config.type
     */
    var generateTemplate = function (registry, config) {
        config = config || {};
        if (typeof config.href !== "string") {
            return;
        }

        registry.template[config.name] = {
            href: config.href,
            type: config.type,
            isMatch: util.PacketRouter.uriTemplate(config.href)
        };
    };

    /**
     * Finds or creates an input with the given name.
     *
     * @method endpoint
     * @param {String} name
     * @return {ozpIwc.api.Endpoint}
     */
    EndpointRegistry.prototype.endpoint = function (name) {
        var endpoint = this.endPoints[name];
        if (!endpoint) {
            endpoint = this.endPoints[name] = new api.Endpoint(this);
            endpoint.name = name;
        }
        return endpoint;
    };

    return EndpointRegistry;
}(ozpIwc.api, ozpIwc.log, ozpIwc.util));
var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
/**
 * @module ozpIwc
 * @submodule ozpIwc.api
 */

ozpIwc.api.base = ozpIwc.api.base || {};
/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.base
 */

ozpIwc.api.base.Api = (function (api, log, transport, util) {
    /**
     * The base class for APIs. Use {{#crossLink "ozpIwc.api.createApi"}}{{/crossLink}} to subclass
     * this.
     *
     * Leader State Management
     * =======================
     * The base API uses locks.api to always have a single leader at a time.  An api instance goes
     * through a linear series of states:  member -> loading -> leader
     * * __member__ does not service requests
     * * __loading__ is a transitory state between acquiring the leader lock and being ready to serve requests
     * * __leader__ actively serves requests and broadcasts a death scream upon shutdown
     *
     * The member state has two substates-- ready and dormant
     *  * __ready__ queues requests in case it has to become leader.  switches back to dormant on discovering a leader
     *  * __dormant__ silently drops requests.  Upon hearing a deathScream, it switches to ready.
     * @class Api
     * @namespace ozpIwc.api.base
     * @uses ozpIwc.util.Event
     * @constructor
     * @param {Object} config
     * @param {String} config.name The api address (e.g. "names.api")
     * @param {ozpIwc.transport.participant.Client} [config.participant= new ozpIwc.transport.participant.Client()] The
     *     connection to use for communication
     * @param {ozpIwc.policyAuth.PDP} config.authorization The authorization component for this module.
     * @param {ozpIwc.transport.Router} config.router The router to connect to
     */
    var Api = function (config) {
        var self = this;

        if (!config.name) {
            throw Error("API must be configured with a name");
        }
        if (!config.router) {
            throw Error("API must be configured with a router");
        }
        if (!config.authorization) {
            throw Error("API must be configured with an authorization module");
        }

        /**
         * Policy authorizing module.
         * @property authorization
         * @type {ozpIwc.policyAuth.PDP}
         */
        this.authorization = config.authorization;

        /**
         * @property name
         * @type {String}
         */
        this.name = config.name;

        /**
         * @property coordinationAddress
         * @type {String}
         */
        this.coordinationAddress = "coord." + this.name;


        /**
         * @property events
         * @type {ozpIwc.util.Event}
         */
        this.events = new util.Event();
        this.events.mixinOnOff(this);

        /**
         * @property endpoints
         * @type {Array}
         */
        this.endpoints = [];

        /**
         * @property data
         * @type {Object}
         */
        this.data = {};

        /**
         * @property watchers
         * @type {Object}
         */
        this.watchers = {};

        /**
         * @property collectors
         * @type {Array}
         */
        this.collectors = [];

        /**
         * @property changeList
         * @type {Object}
         */
        this.changeList = {};

        /**
         * @property leaderState
         * @type {String}
         */
        this.leaderState = "member";

        /**
         * @property participant
         * @type {ozpIwc.transport.participant.Client|*}
         */
        this.participant = config.participant || new transport.participant.MutexClient({
                'internal': true,
                'router': config.router,
                'authorization': config.authorization,
                'name': config.name,
                'onLock': function () {
                    //@TODO wanted to have state passed on lock resolution but race conditions arose.
                    self.onLock();
                },
                'onRelease': function () {
                    self.onRelease();
                }

            });
        this.participant.on("receive", this.receivePacketContext, this);
        this.participant.on("shutdown", this.shutdown, this);

        /**
         * @property router
         * @type {ozpIwc.transport.Router}
         */
        this.router = config.router;
        this.router.registerMulticast(this.participant, [this.name, this.coordinationAddress]);

        /**
         * @property logPrefix
         * @type {String}
         */
        this.logPrefix = "[" + this.name + "/" + this.participant.address + "] ";

        /**
         * @property ajaxQueue
         * @type {ozpIwc.util.AjaxPersistenceQueue}
         */
        this.ajaxQueue = config.ajaxQueue;


        //The API is initialized into a ready state waiting for the lock's api to grant it control.
        this.transitionToMemberReady();
    };
//--------------------------------------------------
//          Public Methods
//--------------------------------------------------

//--------------------------------------------------
// API state initialization methods
//--------------------------------------------------
    /**
     * Called when the API has become the leader, but before it starts
     * serving data.  Receives the deathScream of the previous leader
     * if available, otherwise undefined.
     *
     * __Intended to be overridden by subclasses__
     *
     * Subsclasses can override this to load data from the server.
     *
     * @method initializeData
     * @param {object} deathScream
     * @return {Promise} a promise that resolves when all data is loaded.
     */
    Api.prototype.initializeData = function (deathScream) {
        var getEndpoints = !deathScream;


        deathScream = deathScream || {watchers: {}, collectors: [], data: []};
        this.watchers = deathScream.watchers;
        this.collectors = deathScream.collectors;
        deathScream.data.forEach(function (packet) {
            var selfLink = packet.self || {};
            this.createNode({resource: packet.resource, contentType: selfLink.type}).deserializeLive(packet);
        }, this);

        this.updateCollections();
        if (getEndpoints && this.endpoints) {

            var self = this;
            var onResource = function (resource) {
                self.loadedResourceHandler(resource);
            };
            return Promise.all(this.endpoints.map(function (u) {
                return util.halLoader.load(u.link, u.headers, onResource).catch(function (err) {
                    log.error(self.logPrefix, "load from endpoint failed. Reason: ", err);
                });
            }));
        } else {
            return Promise.resolve();
        }
    };

    /**
     * A handler method for the API to process a resource loaded from an endpoint.
     * Extracts the type field of the resources self link (HAL) to determine the type of node to create and store
     * in the api's data object.
     *
     * @method loadedResourceHandler
     * @param {Object} resource
     */
    Api.prototype.loadedResourceHandler = function (resource) {
        resource = resource || {};
        resource._links = resource._links || {};
        var selfLink = resource._links.self || {};
        var NodeType = this.findNodeType(selfLink.type);
        if (NodeType) {
            try {
                this.createNode({
                    serializedEntity: resource,
                    contentType: selfLink.type
                }, NodeType);
            } catch (e) {
                log.info(this.logPrefix + "[" + selfLink.type + "] [" + selfLink.href + "] No node created from resource, reason: ", e.message);
            }
        } else {
            log.info(this.logPrefix + "[" + selfLink.type + "] [" + selfLink.href + "] No node created from resource, reason: no node type for this content-type.");
        }
    };

//--------------------------------------------------
// API state relinquishing methods
//--------------------------------------------------

    /**
     * Create the data that needs to be handed off to the new leader.
     *
     * __Intended to be overridden by subclasses__
     *
     * Subsclasses can override this if they need to add additional
     * handoff data.  This MUST be a synchronous call that returns immediately.
     *
     * @method createDeathScream
     * @return {Object} the data that will be passed to the new leader
     */
    Api.prototype.createDeathScream = function () {
        return {
            watchers: this.watchers,
            collectors: this.collectors,
            data: util.object.eachEntry(this.data, function (k, v) {
                return v.serializeLive();
            }),
            timestamp: util.now()
        };
    };

    /**
     * Shuts down the api, issuing a deathscream and releasing the lock, if possible.
     * @method shutdown
     * @return
     */
    Api.prototype.shutdown = function () {
        if (this.leaderState === "leader") {
            this.broadcastDeathScream(this.createDeathScream());
        } else if (this.leaderState === "member" && this.deathScream) {
            this.broadcastDeathScream(this.deathScream);
        }

        //@TODO: The api deathscream would be included with the unlock but race conditions caused this to not be
        // completed yet.
        this.participant.send({
            dst: "locks.api",
            resource: "/mutex/" + this.name,
            action: "unlock"
            //entity: { state: (this.leaderState === "leader") ? this.createDeathScream() : undefined}
        });
    };

//--------------------------------------------------
// Node creation/modification methods
//--------------------------------------------------

    /**
     * Generates a unique key with the given prefix.
     * @param {String} prefix
     * @return {String}
     */
    Api.prototype.createKey = function (prefix) {
        prefix = prefix || "";
        var key;
        do {
            key = prefix + util.generateId();
        } while (key in this.data);
        return key;
    };

    /**
     * A handler function for when a node is created. Can be overridden by inherited APIs.
     * @method onNodeCreated
     * @param {ozpIwc.api.base.Node} node
     */
    Api.prototype.onNodeCreated = function (node) {
        //Whenever a node is created update the collector's lists.
        this.updateCollections();
    };

    /**
     * A handler function called after a node is changed but before it's watchers are notified. Can be overridden by
     * inherited APIs.
     * @method onNodeChanged
     * @param {Object} node
     * @param {Object} entity
     * @param {Object} packetContext
     */
    Api.prototype.onNodeChanged = function (node, entity, packetContext) {
        //var culprit = packetContext.src;
        var lifespanFns = api.Lifespan.getLifespanFunctionality(node.lifespan);
        if (lifespanFns.shouldPersist() && this.ajaxQueue) {
            this.ajaxQueue.queueNode(this.name + "/" + node.resource, node);
        }
    };

    /**
     * Gathers the desired preference from the data API.
     * @method getPreference
     * @param {String} prefName
     * @return {Promise}
     */
    Api.prototype.getPreference = function (prefName) {
        return this.participant.send({
            dst: "data.api",
            resource: "/ozp/iwc/" + this.name + "/" + prefName,
            action: "get"
        }).then(function (reply) {
            return reply.entity;
        });
    };


    /**
     * Maps a content-type to an IWC Node type. Overriden in APIs.
     * @method findNodeType
     * @param {Object} contentTypeObj an object-formatted content-type
     * @param {String} contentTypeObj.name the content-type without any variables
     * @param {Number} [contentTypeObj.version] the version of the content-type.
     * @returns {undefined}
     */
    Api.prototype.findNodeType = function (contentTypeObj) {
        return undefined;
    };

    /**
     * Creates a node appropriate for the given config, puts it into this.data,
     * and fires off the right events.
     *
     * @method createNode
     * @param {Object} config The node configuration.
     * @return {ozpIwc.api.base.Node}
     */
    Api.prototype.createNode = function (config, NodeType) {
        NodeType = NodeType || this.findNodeType(config.contentType);

        var n = this.createNodeObject(config, NodeType);
        if (n) {
            this.data[n.resource] = n;
            this.events.trigger("createdNode", n);
            return n;
        }
    };


    /**
     * Creates a node appropriate for the given config.  This does
     * NOT add the node to this.data.  Default implementation returns
     * a plain ozpIwc.api.base.Node.
     *
     * __Intended to be overridden by subclasses__
     *
     * Subsclasses can override this for custom node types that may vary
     * from resource to resource.
     *
     * @method createNodeObject
     * @param {Object} config The node configuration configuration.
     * @param {Function} NodeType The contructor call for the given node type to be created.
     * @return {ozpIwc.api.base.Node}
     */
    Api.prototype.createNodeObject = function (config, NodeType) {
        if (NodeType) {
            return new NodeType(config);
        } else {
            return new api.base.Node(config);
        }
    };
//--------------------------------------------------
// Distributed Computing: Mutex lock on handling API requests/holding active state
//--------------------------------------------------

    /**
     * A handler method for the API's acquisition of the mutex.
     *  * An api will initialize any state passed on from the last leader (received as a broadcasted deathscream).
     *  * If no initial state passed and backend connnectivity is configured, the backend will be reached for
     * persistent state.
     *  * Handle any requests during the transition to being the active API.
     *  * Call the API's onStart method to handle any custom API init functionality.
     * @method onLock
     */
    Api.prototype.onLock = function () {
        this.transitionToLoading()
            .then(this.transitionToLeader.bind(this))
            .then(this.onStart.bind(this))
            .catch(function (e) {
                log.error("Error registering for leader mutex [address=" + this.participant.address +
                    ",api=" + this.name + "]", e);
                this.shutdown();
            });
    };

    /**
     * A handler method for the API's release of the mutex.
     * @method onRelease
     */
    Api.prototype.onRelease = function () {
        this.onStop();
        this.transitionFromLeader();
        this.participant.relock();
    };

    /**
     * Called when the API begins operation as leader. To be overriden by inherited APIs.
     * @method onStart
     */
    Api.prototype.onStart = function () {
        //overridden
    };

    /**
     * Called when the API ends operation as leader. To be overriden by inherited APIs.
     * @method onStart
     */
    Api.prototype.onStop = function () {
        //overridden
    };
//--------------------------------------------------
// Distributed Computing: Leadership management state machine
//--------------------------------------------------

    /**
     * @method transitionToLoading
     * @private
     * @return {Promise} a promise that resolves when all data is loaded.
     */
    Api.prototype.transitionToLoading = function () {
        if (this.leaderState !== "member") {
            return Promise.reject(this.logPrefix + "transition to loading called in an invalid state:", this.leaderState);
        }
        log.debug(this.logPrefix + "transitioning to loading");

        this.leaderState = "loading";
        return this.initializeData(this.deathScream);
    };

    /**
     * @method transitionToLeader
     * @private
     */
    Api.prototype.transitionToLeader = function () {
        if (this.leaderState !== "loading") {
            return Promise.reject(this.logPrefix + "transition to loading called in an invalid state:", this.leaderState);
        }
        log.debug(this.logPrefix + "transitioning to leader");

        this.deathScream = undefined;
        this.leaderState = "leader";
        this.broadcastLeaderReady();
        this.deliverRequestQueue();
        enableHandlers(this);
        log.info(this.logPrefix + " Now operating");

        return Promise.resolve();
    };

    /**
     * @method transitionFromLeader
     */
    Api.prototype.transitionFromLeader = function () {
        if (this.leaderState !== "leader") {
            return Promise.reject(this.logPrefix + "transition to loading called in an invalid state:", this.leaderState);
        }
        log.debug(this.logPrefix + "relinquishing leadership.");

        var deathScream = this.createDeathScream();
        this.broadcastDeathScream(deathScream);
        this.leaderState = "member";
        return this.transitionToMemberReady(deathScream);
    };

    /**
     * @method transitionToMemberReady
     * @private
     * @param {Object} deathScream
     * @return {Promise}
     */
    Api.prototype.transitionToMemberReady = function (deathScream) {
        if (this.leaderState !== "member") {
            return;
        }
        this.deathScream = deathScream;
        disableHandlers(this);
        this.enableRequestQueue();
        return Promise.resolve();
    };

    /**
     * @method transitionToMemberDormant
     * @private
     * @return {Promise}
     */
    Api.prototype.transitionToMemberDormant = function () {
        if (this.leaderState !== "member") {
            return;
        }
        this.deathScream = undefined;
        this.flushRequestQueue();
        return Promise.resolve();
    };

//--------------------------------------------------
// Distributed computing: leadership state broadcasting
//--------------------------------------------------

    /**
     * Broadcasts to other instances of this API on the bus that it is ready to lead.
     * @method broadcastLeaderReady
     */
    Api.prototype.broadcastLeaderReady = function () {
        this.participant.send({
            dst: this.coordinationAddress,
            action: "announceLeader"
        });
    };

    /**
     * Broadcasts to other instances of this API on the bus this APIs state.
     * @method broadcastDeathScream
     * @param {Object} deathScream the state data to pass on.
     */
    Api.prototype.broadcastDeathScream = function (deathScream) {
        this.participant.send({
            dst: this.coordinationAddress,
            action: "deathScream",
            entity: deathScream
        });
    };


//--------------------------------------------------
// Data Management Utils
//--------------------------------------------------

    /**
     * Authorize the request for the given node.
     *
     * @method checkAuthorization
     * @param {ozpIwc.api.base.Node} node
     * @param {Object} context
     * @param {ozpIwc.packet.Transport} packet
     * @param {String} action
     * @return {undefined}
     */
    Api.prototype.checkAuthorization = function (node, context, packet, action) {
        //@TODO: actually implement checking the authorization...
        return true;
    };

    /**
     * Returns a list of nodes that start with the given prefix.
     *
     * @method matchingNodes
     * @param {String} prefix
     * @return {ozpIwc.api.base.Node[]} a promise that resolves when all data is loaded.
     */
    Api.prototype.matchingNodes = function (prefix) {
        return util.object.values(this.data, function (k, node) {
            return node.resource.indexOf(prefix) === 0 && !node.deleted;
        });
    };

    /**
     * Gathers the collection resource data for a node given its pattern only
     * if it is in the collectors list
     * @method getCollectionResources
     * @param {Object} node
     * @return {Array}
     */
    Api.prototype.getCollectionResources = function (node) {
        return this.getCollectionData(node).map(function (matchedNode) {
            return matchedNode.resource;
        });
    };

    Api.prototype.getCollectionData = function (node) {
        if (this.collectors.indexOf(node.resource) > -1) {
            return this.matchingNodes(node.pattern).filter(function (matchedNode) {
                // ignore deleted nodes
                return !matchedNode.deleted;
            });
        } else {
            return [];
        }
    };
//--------------------------------------------------
// Watch Functionality
//--------------------------------------------------

    /**
     * Marks that a node has changed and that change notices may need to
     * be sent out after the request completes.
     *
     * @method markForChange
     * @param {ozpIwc.api.base.Node} nodes...
     */
    Api.prototype.markForChange = function (/*varargs*/) {
        for (var i = 0; i < arguments.length; ++i) {
            if (Array.isArray(arguments[i])) {
                this.markForChange(arguments[i]);
            } else {
                var resource = arguments[i].resource || "" + arguments[i];
                // if it's already marked, skip it
                if (this.changeList.hasOwnProperty(resource)) {
                    continue;
                }

                var n = this.data[resource];

                this.changeList[resource] = n ? n.snapshot() : {};
            }
        }
    };

    /**
     * Marks that a node has changed and that change notices may need to
     * be sent out after the request completes.
     *
     * @method addWatcher
     * @param {String} resource name of the resource to watch
     * @param {Object} watcher
     * @param {String} watcher.resource name of the resource to watch
     * @param {String} watcher.src Address of the watcher
     * @param {String | Number} watcher.replyTo The conversation id that change notices will go to
     */
    Api.prototype.addWatcher = function (resource, watcher) {
        var watchList = this.watchers[resource];
        if (!Array.isArray(watchList)) {
            watchList = this.watchers[resource] = [];
        }

        watchList.push(watcher);
    };

    /**
     * Removes mark that a node has changed and that change notices may need to
     * be sent out after the request completes.
     *
     * @method removeWatcher
     * @param {String} resource name of the resource to unwatch
     * @param {Object} watcher
     * @param {String} watcher.src Address of the watcher
     * @param {String | Number} watcher.replyTo The conversation id that change notices will go to
     */
    Api.prototype.removeWatcher = function (resource, watcher) {
        var watchList = this.watchers[resource];
        if (watchList) {
            this.watchers[resource] = watchList.filter(function (watch) {
                return !(watch.src === watcher.src && watch.replyTo === watcher.msgId);
            });
        }
    };


    /**
     * Adds the given node to the collector list. It's collection list will be updated on api data changes.
     * @method addCollector
     * @param {Object} node
     */
    Api.prototype.addCollector = function (node) {
        var index = this.collectors.indexOf(node.resource);
        if (index < 0) {
            this.collectors.push(node.resource);
        }
        updateCollectionNode(this, node);
   };


    /**
     * Removes the given node from the collector list. It's collection list will no longer be updated on api data
     * changes.
     * @method removeCollector
     * @param {Object} node
     */
    Api.prototype.removeCollector = function (node) {
        var index = this.collectors.indexOf(node.resource);
        if (index > -1) {
            this.collectors.splice(index, 1);
        }
    };


    /**
     * Itterates over all collectors of the API for updates
     * @method updateCollections
     */
    Api.prototype.updateCollections = function () {
        for (var i in this.collectors) {
            var collectorNode = this.data[this.collectors[i]];
            updateCollectionNode(this, collectorNode);
        }
    };


//--------------------------------------------------
// Bus Packet Routing
//--------------------------------------------------
    /**
     * Sends packets of data from this API to other parts of the IWC bus.
     *
     * @param {Object} fragment
     * @return {Promise}
     */
    Api.prototype.send = function (fragment) {
        fragment.src = this.name;
        return this.participant.send(fragment);
    };

    /**
     * Routes a packet received from the participant.
     *
     * @method receivePacketContext
     * @property {Object} packetContext
     * @private
     */
    Api.prototype.receivePacketContext = function (packetContext) {
        if (packetContext.packet.dst === this.coordinationAddress) {
            return receiveCoordinationPacket(this, packetContext);
        } else {
            return receiveRequestPacket(this, packetContext);
        }
    };

//--------------------------------------------------
// API Request Handling (routes loaded from routes.js)
//--------------------------------------------------


    /**
     * Any request packet that does not match a route ends up here.  By default,
     * it replies with BadAction, BadResource, or BadRequest, as appropriate.
     *
     * @method receivePacketContext
     * @param {ozpIwc.packet.Transport} packet
     * @param {ozpIwc.transport.PacketContext} context
     */
    Api.prototype.defaultRoute = function (packet, context) {
        switch (context.defaultRouteCause) {
            case "nonRoutablePacket": // packet doesn't have an action/resource, so ignore it
                return;
            case "noAction":
                throw new api.error.BadActionError(packet);
            case "noResource":
                throw new api.error.BadResourceError(packet);
            default:
                throw new api.error.BadRequestError(packet);
        }
    };

    /**
     * Enables the API's request queue, all requests will be held until deliverRequestQueue or flushRequestQueue is
     * called.
     * @method enableRequestQueue
     * @private
     */
    Api.prototype.enableRequestQueue = function () {
        this.isRequestQueueing = true;
        this.requestQueue = [];
    };

    /**
     * Routes all queued packets and turns off request queueing.
     * @method deliverRequestQueue
     * @private
     */
    Api.prototype.deliverRequestQueue = function (after) {
        after = after || 0;
        this.isRequestQueueing = false;
        console.log("DELIVERING QUEUE:", this.name, this.requestQueue);
        this.requestQueue.forEach(function quededHandler (request) {
            if (request.packet.time > after) {
                receiveRequestPacket(this, request);
            }
        }, this);
        this.requestQueue = [];
    };

    /**
     * Empties the queue of requests without processing and turns off queuing.
     * @method flushRequestQueue
     * @private
     */
    Api.prototype.flushRequestQueue = function () {
        console.log("FLUSHING QUEUE:", this.name, this.requestQueue);
        this.isRequestQueueing = false;
        this.requestQueue = [];
    };

    /**
     * Enables API's sending queue. This is to prevent an API from communicating given some state (Used for consensus
     * initialization).
     *
     * @method enableSendQueue
     * @private
     */
    Api.prototype.enableSendQueue = function () {
        this.isSendQueueing = true;
        this.sendQueue = [];
    };

    /**
     * Delivers and disables API's sending queue.
     *
     * @method deliverSendQueue
     * @private
     */
    Api.prototype.deliverSendQueue = function () {
        this.isSendQueueing = false;
        this.sendQueue.forEach(this.participant.send, this.participant);
        this.sendQueue = [];
    };

    /**
     * Empties and disables API's sending queue.
     *
     * @method flushSendQueue
     * @private
     */
    Api.prototype.flushSendQueue = function () {
        this.isSendQueueing = false;
        this.sendQueue = [];
    };


//--------------------------------------------------
// Bus event handlers
//--------------------------------------------------
    /**
     * A handler function called when a participant has disconnected from the bus.
     * Each node in the API is checked to see if its lifespan was tied to said participant, and if the lifespan deems
     * necessary, removes the node.
     * Can be overridden by inherited APIs.
     * @method onClientDisconnect
     * @param {String} address
     */
    Api.prototype.onClientDisconnect = function (address) {
        removeDeadWatchers(this, address);

        var self = this;
        util.object.eachEntry(self.data, function (resource, node) {
            var lifespanFns = api.Lifespan.getLifespanFunctionality(node.lifespan);
            if (lifespanFns.shouldDelete(node.lifespan, address)) {
                self.markForChange(node);
                node.markAsDeleted();
            }
        });
        resolveChangedNodes(this);
    };
    /**
     * A handler function called when a participant connects to the bus. Intended to be overridden by inheriting APIs.
     * @param address
     */
    Api.prototype.onClientConnect = function (address) {
        //Does nothing should be overridden by inherited APIs
    };


//--------------------------------------------------
//          Private Methods
//--------------------------------------------------

    var enableHandlers = function (apiBase) {
        apiBase.on("createdNode", apiBase.onNodeCreated, apiBase);
        apiBase.on("changed", apiBase.onNodeChanged, apiBase);
        apiBase.participant.on("addressDisconnects", apiBase.onClientDisconnect, apiBase);
        apiBase.participant.on("addressConnects", apiBase.onClientConnect, apiBase);
    };

    var disableHandlers = function (apiBase) {
        apiBase.off("createdNode", apiBase.onNodeCreated);
        apiBase.off("changed", apiBase.onNodeChanged);
        apiBase.participant.off("addressDisconnects", apiBase.onClientDisconnect);
        apiBase.participant.off("addressConnects", apiBase.onClientConnect);
    };

    /**
     * A static utility method that notifies watchers of changes of the resource since the given snapshot.
     * @method resolveChangedNode
     * @private
     * @static
     * @param {ozpIwc.api.base.Api} apiBase
     * @param {String} resource
     * @param {Object} snapshot
     * @param {Object} packetContext
     */
    var resolveChangedNode = function (apiBase, resource, snapshot, packetContext) {
        var node = apiBase.data[resource];
        var watcherList = apiBase.watchers[resource] || [];

        if (!node) {
            return;
        }

        var changes = node.changesSince(snapshot);
        if (!changes) {
            return;
        }

        var permissions = apiBase.authorization.pip.attributeUnion(
            changes.oldValue.permissions,
            changes.newValue.permissions
        );

        var entity = {
            oldValue: changes.oldValue.entity,
            newValue: changes.newValue.entity,
            oldCollection: changes.oldValue.collection,
            newCollection: changes.newValue.collection,
            deleted: node.deleted
        };

        apiBase.events.trigger("changed", node, entity, packetContext);

        watcherList.forEach(function notifyWatcher (watcher) {
            // @TODO allow watchers to changes notifications if they have permission to either the old or new, not just
            // both
            apiBase.participant.send({
                'src': apiBase.participant.name,
                'dst': watcher.src,
                'replyTo': watcher.replyTo,
                'response': 'changed',
                'respondOn': 'none',
                'resource': node.resource,
                'permissions': permissions,
                'contentType': node.contentType,
                'entity': entity
            });
        });
    };

    /**
     * A static utility method called after an api request is complete to send out change notifications.
     *
     * @method resolveChangedNodes
     * @private
     * @static
     * @param {ozpIwc.api.base.Api} apiBase
     * @param {Object} packetContext the packet that caused this change.
     */
    var resolveChangedNodes = function (apiBase, packetContext) {
        apiBase.updateCollections();
        util.object.eachEntry(apiBase.changeList, function resolveChange (resource, snapshot) {
            resolveChangedNode(apiBase, resource, snapshot, packetContext);
        });
        apiBase.changeList = {};
    };

    /**
     * A static utility method that removes the collector node from the collectors list if deleted.
     * Removes references to nodes in the given collectors collection property if said referenced node is deleted.
     * Adds newly created nodes to the collection property if said node's resource matches the collection nodes pattern
     * property.
     *
     * @method updateCollectionNode
     * @private
     * @static
     * @param {ozpIwc.api.base.Api} apiBase
     * @param {Object} cNode the collector node to update
     */
    var updateCollectionNode = function (apiBase, cNode) {
        if (!cNode) {
            return;
        }
        //If the collection node is deleted, stop collecting for it.
        if (cNode.deleted) {
            apiBase.removeCollector(cNode.resource);
            return;
        }


        var updatedCollection = apiBase.matchingNodes(cNode.pattern).filter(function (node) {
            return !node.deleted;
        }).map(function (node) {
            return node.resource;
        });

        cNode.collection = cNode.collection || [];
        if (!util.arrayContainsAll(cNode.collection, updatedCollection) || !util.arrayContainsAll(updatedCollection, cNode.collection)) {
            apiBase.markForChange(cNode);
            cNode.collection = updatedCollection;
            cNode.version++;
        }
    };


    /**
     * If the the given address is watching a resource, it will be removed from the watch list. Router addresses will
     * remove all of its participants watch registrations.
     *
     * @method removeDeadWatchers
     * @private
     * @static
     * @param {ozpIwc.api.base.Api} apiBase
     * @param {String} address
     */
    var removeDeadWatchers = function (apiBase, address) {
        var len = address.length;
        util.object.eachEntry(apiBase.watchers, function removeDead (resource, array) {
            for (var i in array) {
                if (array[i].src.substr(-len) === address) {
                    array.splice(i, 1);
                }
            }
        });
    };

    /**
     * Handles packets received regarding leadership actions.
     * @method receiveCoordinationPacket
     * @private
     * @static
     * @param {ozpIwc.api.base.Api} apiBase
     * @param {Object} packetContext
     * @return {Promise}
     */
    var receiveCoordinationPacket = function (apiBase, packetContext) {
        var packet = packetContext.packet;
        switch (packet.action) {
            case "announceLeader":
                return apiBase.transitionToMemberDormant();
            case "deathScream":
                return apiBase.transitionToMemberReady(packet.entity);
            default:
                log.error("Unknown coordination packet: ", packet);
                return Promise.reject(new Error("Unknown action: " + packet.action + " in " + JSON.stringify(packetContext)));
        }
    };

    /**
     * Routes a request to the proper handler and takes care of overhead
     * such as change requests.
     *
     * @method receivePacketContext
     * @private
     * @static
     * @property {ozpIwc.api.base.Api} apiBase
     * @property {Object} packetContext
     */
    var receiveRequestPacket = function (apiBase, packetContext) {
        var packet = packetContext.packet;

        if (apiBase.isRequestQueueing) {
            apiBase.requestQueue.push(packetContext);
            return;
        }
        if (apiBase.leaderState !== "leader") {
            return;
        }

        try {
            packetContext.node = apiBase.data[packet.resource];
            var packetFragment = apiBase.routePacket(packet, packetContext);
            if (packetFragment) {
                packetFragment.response = packetFragment.response || "ok";
                packetContext.replyTo(packetFragment);
            }
            resolveChangedNodes(apiBase, packetContext);
        } catch (e) {
            if (!e || !e.errorAction) {
                log.error(apiBase.logPrefix, "Unexpected error: ", e, " packet= ", packet);
            }
            var errorFragment = {
                'src': apiBase.name,
                'response': e.errorAction || "errorUnknown",
                'entity': e.message
            };
            packetContext.replyTo(errorFragment);
        }

    };

    return Api;
}(ozpIwc.api, ozpIwc.log, ozpIwc.transport, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.base = ozpIwc.api.base || {};
/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.base
 */


ozpIwc.api.base.Node = (function (api, ozpConfig, util) {
    /**
     * The base class for an api node.
     *
     * @class Node
     * @namespace ozpIwc.api.base
     * @constructor
     * @param {Object} config
     * @param {String} config.resource
     * @param {String[]} config.allowedContentTypes
     * @param {Object} config.entity
     * @param {String} config.contentType
     * @param {Number} config.version
     * @param {String} config.self
     * @param {String} config.serializedEntity
     * @param {String} config.serializedContentType
     */
    var Node = function (config) {
        config = config || {};

        /**
         * @property resource
         * @type String
         */
        this.resource = config.resource;

        /**
         * @property allowedContentTypes
         * @type Array
         */
        this.allowedContentTypes = config.allowedContentTypes;

        /**
         * @property entity
         * @type Object
         */
        this.entity = config.entity;

        /**
         * @property contentType
         * @type String
         */
        this.contentType = config.contentType || Node.serializedContentType;

        /**
         * @property uriTemplate
         * @type String
         */
        // used if() to allow for subclasses to set the uriTemplate on the prototype
        // setting the field, even to undefined, would mask the prototype's value
        if (config.uriTemplate) {
            this.uriTemplate = config.uriTemplate;
        }

        /**
         * @property permissions
         * @type Object
         * @default {}
         */
        this.permissions = {};

        /**
         * @property version
         * @type Number
         * @default 0
         */
        this.version = config.version || 1;

        /**
         * @property lifespan
         * @type Boolean
         * @default false
         */
        var lifespanParsed = api.Lifespan.getLifespan(this, config);
        if (lifespanParsed) {
            if (lifespanParsed.type === "Bound" && !lifespanParsed.addresses) {
                lifespanParsed.addresses = [config.src];
            }
            this.lifespan = lifespanParsed;
        } else {
            this.lifespan = new api.Lifespan.Ephemeral();
        }

        /**
         * @property deleted
         * @type Boolean
         * @default true
         */
        this.deleted = false;

        /**
         * String to match for collection.
         * @property pattern
         * @type String
         */
        this.pattern = config.pattern;

        /**
         * @property collection
         * @type Array
         * @default []
         */
        this.collection = [];

        /**
         * @property self - The url backing this node
         * @type String
         */
        this.self = config.self || {};
        this.self.type = this.self.type || this.contentType;

        if (config.serializedEntity) {
            this.deserialize(config.serializedEntity, config.contentType);
        }

        if (!this.resource) {
            throw new Error("Base Node requires a resource");
        }
    };

    /**
     * Gathers the self uri from the uriTemplate property if it does not already exist.
     * @method getSelfUri
     * @return {String}
     */
    Node.prototype.getSelfUri = function () {
        if (this.self && this.self.href) {
            return this.self;
        }
        if (this.uriTemplate && api.uriTemplate) {
            var template = api.uriTemplate(this.uriTemplate);
            if (template) {
                this.self = {
                    href: util.resolveUriTemplate(template.href, this),
                    type: template.type
                };
                return this.self;
            }
        }
    };

    /**
     * Serialize the node to a form that conveys both persistent and
     * ephemeral state of the object to be handed off to a new API
     * leader.
     *
     * __Intended to be overridden by subclasses__
     * @method serializeLive
     * @return {Object}
     */
    Node.prototype.serializeLive = function () {
        return this.toPacket({
            deleted: this.deleted,
            contentType: this.contentType,
            pattern: this.pattern,
            collection: this.collection,
            lifespan: this.lifespan,
            allowedContentTypes: this.allowedContentTypes,
            self: this.self
        });
    };

    /**
     * Set the node using the state returned by serializeLive.
     *
     * __Intended to be overridden by subclasses__
     *
     * @method deserializeLive
     * @param {Object} serializedForm The data returned from serializeLive
     * @return {Object} the content type of the serialized data
     */
    Node.prototype.deserializeLive = function (serializedForm, serializedContentType) {
        serializedForm.contentType = serializedForm.contentType || serializedContentType;
        this.set(serializedForm);
        if (serializedForm._links && serializedForm._links.self) {
            this.self = serializedForm._links.self;
        }
        if (!this.resource) {
            this.resource = serializedForm.resource || this.resourceFallback(serializedForm);
        }
        this.self = serializedForm.self || serializedForm._links.self || this.self;
        this.deleted = serializedForm.deleted;
        this.lifespan = serializedForm.lifespan;
        this.allowedContentTypes = serializedForm.allowedContentTypes;
        this.pattern = serializedForm.pattern;
        this.collection = serializedForm.collection;
    };


    /**
     * If a resource path isn't given, this takes the best guess at assigning it.
     * Overriden by subclasses.
     *
     * @method deserializeResourceFromContentType
     * @param serializedForm
     */
    Node.prototype.deserializeResourceFromContentType = function (serializedForm) {
        if (serializedForm._links && serializedForm._links.self) {
            this.resource = serializedForm._links.self.href.replace(ozpConfig.apiRootUrl, "");
        }
    };

    /**
     * Serializes the node for persistence to the server.
     *
     * __Intended to be overridden by subclasses__
     *
     * @method serialize
     * @return {String} a string serialization of the object
     */
    Node.prototype.serialize = function () {
        return JSON.stringify({
            entity: this.entity,
            resource: this.resource,
            self: this.self
        });
    };

    /**
     * The content type of the data returned by serialize()
     * @Property {string} serializedContentType
     */
    Node.serializedContentType = "application/json";

    /**
     * Sets the api node from the serialized form.
     *
     * __Intended to be overridden by subclasses__
     *
     * @method deserialize
     * @param {String} data A string serialization of the object
     * @param {String} contentType The contentType of the object
     * @return {Object}
     */
    Node.prototype.deserialize = function (data, contentType) {
        if (typeof(data) === "string") {
            data = JSON.parse(data);
        }
        data = data || {};
        data._links = data._links || {};

        this.self = data.self || data._links.self || this.self;
        this.contentType = contentType;
        this.pattern = data.pattern;
        this.version = data.version || this.version;
        this.permissions = data.permissions || {};
        this.collection = data.collection || [];

        this.entity = this.deserializedEntity(data, contentType);

        if (!this.resource && !this.useIwcSelf()) {
            this.resource = this.resourceFallback(data);
        }
    };

    /**
     * Gathers api node's entity from the serialized form.
     *
     * __Intended to be overridden by subclasses__
     *
     * @method deserializedEntity
     * @param {Object} data
     */
    Node.prototype.deserializedEntity = function (data) {
        return data.entity;
    };

    /**
     * A static helper function for setting the resource of a node if it has an "ozp:iwcSelf" link.
     * Returns true if the resource was set.
     * @method useIwcSelf
     * @static
     * @returns {boolean}
     */
    Node.prototype.useIwcSelf = function () {
        if (this.self["ozp:iwcSelf"]) {
            this.resource = this.self["ozp:iwcSelf"].href.replace(/web\+ozp:\/\/[^/]+/, "");
            return true;
        }
    };

    /**
     * If a resource path isn't given, this takes the best guess at assigning it.
     * @method resourceFallback
     * @param serializedForm
     */
    Node.prototype.resourceFallback = function (serializedForm) {
        return serializedForm.resource;
    };

    /**
     * Turns this value into a packet.
     *
     * @method toPacket
     * @param {ozpIwc.packet.Transport} [base] Fields to be merged into the packet.
     * @return {ozpIwc.packet.Transport}
     */
    Node.prototype.toPacket = function (base) {
        base = base || {};
        base.entity = util.clone(this.entity);
        base.lifespan = this.lifespan;
        base.contentType = this.contentType;
        base.permissions = this.permissions;
        base.eTag = this.version;
        base.resource = this.resource;
        base.pattern = this.pattern;
        base.collection = this.collection;
        return base;
    };


    /**
     * Sets a data based upon the content of the packet.  Automatically updates the content type,
     * permissions, entity, and updates the version.
     *
     * @method set
     * @param {ozpIwc.packet.Transport} packet
     */
    Node.prototype.set = function (packet) {
        if (!Array.isArray(packet.permissions)) {
            for (var i in packet.permissions) {
                //If a permission was passed, wipe its value and set it to the new value;
                this.permissions.clear(i);
                this.permissions.pushIfNotExist(i, packet.permissions[i]);
            }
        }
        this.lifespan = api.Lifespan.getLifespan(this, packet) || this.lifespan;
        this.contentType = packet.contentType || this.contentType;
        this.entity = util.ifUndef(packet.entity, this.entity);
        this.pattern = packet.pattern || this.pattern;
        this.deleted = false;
        if (packet.eTag) {
            this.version = packet.eTag;
        } else {
            this.version++;
        }
    };

    /**
     * Clears the entity of the node and marks as deleted.
     * @method markAsDeleted
     * @param {ozpIwc.packet.Transport} packet
     */
    Node.prototype.markAsDeleted = function (packet) {
        this.version++;
        this.deleted = true;
        this.entity = undefined;
        this.pattern = undefined;
        this.collection = undefined;
    };

    /**
     * Adds a new watcher based upon the contents of the packet.
     *
     * @method addWatch
     * @param {ozpIwc.packet.Transport} watch
     */
    Node.prototype.addWatch = function (watch) {
        this.watchers.push(watch);
    };

    /**
     * Removes all watchers who's packet matches that which is passed in.
     * @method removeWatch
     * @param {ozpIwc.packet.Transport} filter
     */
    Node.prototype.removeWatch = function (filter) {
        this.watchers = this.watchers.filter(filter);
    };


    /**
     * Generates a point-in-time snapshot of this value that can later be sent to
     * {@link ozpIwc.CommonApiValue#changesSince} to determine the changes made to the value.
     * This value should be considered opaque to consumers.
     *
     * <p> For API subclasses, the default behavior is to simply call toPacket().  Subclasses
     * can override this, but should likely override {@link ozpIwc.CommonApiValue#changesSince}
     * as well.
     *
     * @method snapshot
     * @return {ozpIwc.packet.Transport}
     */
    Node.prototype.snapshot = function () {
        return this.toPacket();
    };

    /**
     * From a given snapshot, create a change notifications.  This is not a delta, rather it's
     * change structure.
     * <p> API subclasses can override if there are additional change notifications.
     *
     * @method changesSince
     * @param {object} snapshot The state of the value at some time in the past.
     * @return {Object} A record of the current value and the value of the snapshot.
     */
    Node.prototype.changesSince = function (snapshot) {
        if (snapshot.eTag === this.version) {
            return null;
        }
        return {
            'newValue': this.toPacket(),
            'oldValue': snapshot
        };
    };

    return Node;
}(ozpIwc.api, ozpIwc.config, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.base = ozpIwc.api.base || {};
/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.base
 * @class ozpIwc.api.base.Api
 */

ozpIwc.api.base.Api = (function (Api) {

//===============================================================
// Default Routes and Subclass Helpers
//===============================================================
    /**
     * A collection of default action handlers for an API.
     * @property defaultHandler
     * @static
     * @type {Object}
     */
    Api.defaultHandler = {
        "get": function (packet, context, pathParams) {
            var p = context.node.toPacket();
            p.collection = this.getCollectionResources(p);
            return p;
        },
        "set": function (packet, context, pathParams) {
            context.node.set(packet);
            return {
                response: "ok",
                entity: context.node.entity
            };
        },
        "delete": function (packet, context, pathParams) {
            if (context.node) {
                context.node.markAsDeleted(packet);
                this.removeCollector(context.node);
            }

            return {response: "ok"};
        },
        "list": function (packet, context, pathParams) {
            var pattern = packet.pattern || packet.resource;

            // If listing on a node, list its children
            if(context.node){
                pattern = context.node.pattern;
            }

            var entity = this.matchingNodes(pattern).filter(function (node) {
                return !node.deleted;
            }).map(function (node) {
                return node.resource;
            });
            return {
                "contentType": "application/json",
                "entity": entity
            };
        },
        "bulkGet": function (packet, context, pathParams) {
            var self = this;
            var entity = this.matchingNodes(packet.resource).map(function (node) {
                var p = node.toPacket();
                p.collection = self.getCollectionResources(p);
                return p;
            });
            // TODO: roll up the permissions of the nodes, as well
            return {
                "contentType": "application/json",
                "entity": entity
            };
        },
        "collect": function (packet, context, pathParams) {
            this.addCollector(context.node);
            var p = context.node.toPacket();
            // collect gathers the children elements rather than its own
            p.entity = this.getCollectionData(context.node);
            return p;
        },
        "watch": function (packet, context, pathParams) {

            this.addWatcher(packet.resource, {
                src: packet.src,
                replyTo: packet.msgId
            });

            if (!context.node) {
                return {response: "ok"};
            } else {
                return context.node.toPacket();
            }
        },
        "unwatch": function (packet, context, pathParams) {
            this.removeWatcher(packet.resource, packet);

            //If no one is watching the resource any more, remove its collector if it has one to speed things up.
            if (this.watchers[packet.resource] && this.watchers[packet.resource].length === 0) {
                this.removeCollector(packet.resource);
            }

            return {response: "ok"};
        }
    };

    /**
     * A list of all of the default actions.
     * @property allActions
     * @static
     * @type {String[]}
     */
    Api.allActions = Object.keys(Api.defaultHandler);

    return Api;
}(ozpIwc.api.base.Api || {}));

var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.error = ozpIwc.api.error || {};
/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.error
 */
ozpIwc.api.error.BaseError = (function (util) {
    /**
     * A base class for IWC error objects.
     *
     * @class BaseError
     * @extends Error
     * @namespace ozpIwc.api.error
     * @constructor
     *
     * @type {Function}
     * @param {String} action The action of the error.
     * @param {String} message The message corresponding to the error.
     */
    var BaseError = util.extend(Error, function (action, message) {
        Error.call(this, message);

        /**
         * The name of the error.
         * @property name
         * @type {String}
         */
        this.name = "ApiError";

        /**
         * The action of the error.
         * @property errorAction
         * @type {String}
         */
        this.errorAction = action;

        /**
         * The message corresponding to the error.
         * @property message
         * @type {String}
         */
        this.message = message;
    });

    /**
     * Stringifies the error.
     *
     * @method toString
     * @return {String}
     */
    BaseError.prototype.toString = function () {
        return this.name + ":" + JSON.stringify(this.message);
    };

    /**
     * Creates a subclass of the ApiError with the given error name prefix.
     *
     * @method subclass
     * @param response
     * @return {Function}
     */
    BaseError.subclass = function (response) {
        return util.extend(BaseError, function (message) {
            BaseError.call(this, response, message);
            this.name = response + "Error";
        });
    };

    return BaseError;

}(ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.error = ozpIwc.api.error || {};
/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.error
 */

ozpIwc.api.error = (function (error) {
    /**
     * Thrown when an invalid action is called on an api.
     *
     * @class BadActionError
     * @namespace ozpIwc.api.error
     * @extends ozpIwc.api.error.BaseError
     */
    error.BadActionError = error.BaseError.subclass("badAction");

    /**
     * Thrown when an invalid resource is called on an api.
     *
     * @class BadResourceError
     * @namespace ozpIwc.api.error
     * @extends ozpIwc.api.error.BaseError
     */
    error.BadResourceError = error.BaseError.subclass("badResource");

    /**
     * Thrown when an invalid request is made against an api.
     *
     * @class BadRequestError
     * @namespace ozpIwc.api.error
     * @extends ozpIwc.api.error.BaseError
     */
    error.BadRequestError = error.BaseError.subclass("badRequest");

    /**
     * Thrown when an invalid contentType is used in a request against an api.
     *
     * @class BadContentError
     * @namespace ozpIwc.api.error
     * @extends ozpIwc.api.error.BaseError
     */
    error.BadContentError = error.BaseError.subclass("badContent");

    /**
     * Thrown when the action or entity is not valid for the resource's state.
     *
     * @class BadStateError
     * @namespace ozpIwc.api.error
     * @extends ozpIwc.api.error.BaseError
     */
    error.BadStateError = error.BaseError.subclass("badState");

    /**
     * Thrown when no action is given in a request against an api.
     *
     * @class NoActionError
     * @namespace ozpIwc.api.error
     * @extends ozpIwc.api.error.BaseError
     */
    error.NoActionError = error.BaseError.subclass("noAction");

    /**
     * Thrown when no resource is given in a request against an api.
     *
     * @class NoResourceError
     * @namespace ozpIwc.api.error
     * @extends ozpIwc.api.error.BaseError
     * @static
     */
    error.NoResourceError = error.BaseError.subclass("noResource");

    /**
     * Thrown if an api request packets ifTag exists but does not match the node's version property.
     *
     * @class NoMatchError
     * @namespace ozpIwc.api.error
     * @extends ozpIwc.api.error.BaseError
     */
    error.NoMatchError = error.BaseError.subclass("noMatch");

    /**
     * Thrown when an api request is not permitted.
     *
     * @class NoPermissionError
     * @namespace ozpIwc.api.error
     * @extends ozpIwc.api.error.BaseError
     */
    error.NoPermissionError = error.BaseError.subclass("noPermission");

    return error;
}(ozpIwc.api.error));
var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.filter = ozpIwc.api.filter || {};
/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.filter
 */

/**
 * @class ozpIwc.api.filter.Function
 * @type {Function}
 * @param {type} packet
 * @param {type} context
 * @param {type} pathParams
 * @param {type} next
 * @return {Function} a call to the next filter
 */

/**
 * A collection of basic filter generation functions.
 *
 * @class base
 * @namespace ozpIwc.api.filter
 * @static
 */

ozpIwc.api.filter.base = (function (api, util) {

    var base = {
        /**
         * Returns a filter function with the following features:
         * Stores the resource in context.node, creating it via the api's
         * @method createResource
         * @return {ozpIwc.api.filter.Function}
         */
        createResource: function (NodeType) {
            if (NodeType) {
                return function createTypedResource (packet, context, pathParams, next) {
                    if (!context.node) {
                        context.node = this.data[packet.resource] = new NodeType({
                            resource: packet.resource,
                            pattern: packet.pattern,
                            lifespan: packet.lifespan,
                            src: packet.src
                        });
                    } else if (context.node.deleted) {
                        context.node.set({
                            resource: packet.resource,
                            pattern: packet.pattern,
                            lifespan: packet.lifespan,
                            src: packet.src
                        });
                    }
                    return next();
                };
            } else {
                return function createBaseResource (packet, context, pathParams, next) {
                    if (!context.node) {
                        context.node = this.createNode({
                            resource: packet.resource,
                            contentType: packet.contentType,
                            pattern: packet.pattern,
                            lifespan: packet.lifespan,
                            src: packet.src
                        });
                    }
                    if (!context.node) {
                        throw new api.error.BadContentError({
                            'provided': packet.contentType
                        });
                    }
                    return next();
                };
            }
        },

        /**
         * Returns a filter function with the following features:
         * Adds the resource as a collector to the API, it will now get updates based on its pattern property.
         * @method checkCollect
         * @return {ozpIwc.api.filter.Function}
         */
        checkCollect: function () {

            return function checkCollect (packet, context, pathParams, next) {
                var pattern = packet.pattern;
                // If no pattern supplied in the packet determine the
                // default pattern
                if (!pattern) {
                    if (packet.resource === "/") {
                        pattern = packet.resource;
                    } else if (packet.resource) {
                        pattern = packet.resource + "/";
                    } else {
                        pattern = "/";
                    }
                }

                // If the node exists and a new pattern is provided, update
                // the pattern
                if (context.node && packet.pattern) {
                    if (context.node.pattern !== packet.pattern) {
                        context.node.set({
                            pattern: packet.pattern
                        });
                    }
                } else if (context.node && !context.node.pattern) {
                    //If the node exists and it doesn't have a pattern set it
                    context.node.set({
                        pattern: pattern
                    });
                }

                // If no node and a collect is set, generate the node
                if (!context.node && packet.collect) {
                    context.node = this.createNode({
                        resource: packet.resource,
                        pattern: pattern
                    });
                }

                // If collect was set (node now exists)
                if (packet.collect) {
                    this.addCollector(context.node);
                }

                return next();
            };
        },

        /**
         * Returns a filter function with the following features:
         * Stores the resource in context.node or throws NoResourceError if it does not exist.
         * @method requireResource
         * @return {ozpIwc.api.filter.Function}
         */
        requireResource: function () {
            return function requireResource (packet, context, pathParams, next) {
                if (!context.node || context.node.deleted) {
                    throw new api.error.NoResourceError(packet);
                }
                return next();
            };
        },

        /**
         * Returns a filter function with the following features:
         * Checks that the subject within the context is authorized for the action on the resource node.
         * @method checkAuthorization
         * @return {ozpIwc.api.filter.Function}
         */
        checkAuthorization: function (action) {
            return function checkAuthorization (packet, context, pathParams, next) {
                this.checkAuthorization(context.node, context, packet, action || packet.action);
                return next();
            };
        },

        /**
         * An empty filter
         *
         * @method nullFilter
         * @param packet
         * @param context
         * @param pathParams
         * @param next
         * @return {ozpIwc.api.filter.Function} a call to the next filter
         */
        nullFilter: function (packet, context, pathParams, next) {
            return next();
        },

        /**
         * Returns a filter function with the following features:
         * Checks that the content type is one that is authorized for the api resource.
         * @method checkContentType
         * @return {ozpIwc.api.filter.Function}
         */
        checkContentType: function (contentType) {
            if (!contentType) {
                return base.nullFilter;
            }
            contentType = util.ensureArray(contentType);
            return function checkContentType (packet, context, pathParams, next) {
                if (!contentType.some(function (t) {
                        return t === packet.contentType ||
                            (Object.prototype.toString.call(contentType) === '[object RegExp]' &&
                            t.test(packet.contentType));
                    })
                ) {
                    throw new api.error.BadContentError({
                        'provided': packet.contentType,
                        'allowedTypes': contentType
                    });
                }
                return next();
            };
        },

        /**
         * Returns a filter function with the following features:
         * Marks the resource as changed.
         * @method markResourceAsChanged
         * @return {ozpIwc.api.filter.Function}
         */
        markResourceAsChanged: function () {
            return function markResourceAsChanged (packet, context, pathParams, next) {
                this.markForChange(packet);
                return next();
            };
        },

        /**
         * Returns a filter function with the following features:
         * If the packet does not contain a pattern property create one from the packet resource + "/". This filter is
         * to be used only in node creation as it can overwrite the nodes pattern property if different than resource +
         * "/".
         * @method fixPattern
         * @return {ozpIwc.api.filter.Function}
         */
        fixPattern: function () {
            return function fixPattern (packet, context, pathParams, next) {
                var pattern;
                if (context.node) {
                    pattern = context.node.pattern;
                }
                if (packet.resource) {
                    packet.pattern = packet.pattern || pattern || packet.resource + "/";
                }
                return next();
            };
        },

        /**
         * Returns a filter function with the following features:
         * Checks the version of the packet against the context.
         * @method checkVersion
         * @return Function}
         */
        checkVersion: function () {
            return function checkVersion (packet, context, pathParams, next) {
                // if there is no resource node, then let the request through
                if (packet.ifTag && packet.ifTag !== context.node.version) {
                    throw new api.error.NoMatchError({
                        expectedVersion: packet.ifTag,
                        actualVersion: context.node.version
                    });
                }
                return next();
            };
        }
    };

    return base;
}(ozpIwc.api, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.filter = ozpIwc.api.filter || {};
/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.filter
 */

/**
 * Wrappers that return the list of filters for the standard actions supported by the base api.
 *
 * @class standard
 * @namespace ozpIwc.api.filter
 * @static
 */
ozpIwc.api.filter.standard = (function (filter) {
    var standard = {
        /**
         * Returns the filter collection generator for the given action.
         * @method forAction
         * @param {String} a
         * @return {Function}
         */
        forAction: function (a) {
            return standard[a + "Filters"];
        },

        /**
         * Filters for the set action.
         * @method setFilters
         * @param nodeType
         * @param contentType
         * @return {Function[]} array of filters
         */
        setFilters: function (nodeType, contentType) {
            return [
                filter.base.checkAuthorization(),
                filter.base.createResource(nodeType),
                filter.base.checkContentType(contentType),
                filter.base.checkVersion(),
                filter.base.checkCollect(),
                filter.base.markResourceAsChanged()
            ];
        },

        /**
         * Filters for the delete action.
         * @method deleteFilters
         * @return {Function[]} array of filters
         */
        deleteFilters: function () {
            return [
                filter.base.checkAuthorization(),
                filter.base.checkVersion(),
                filter.base.markResourceAsChanged()
            ];
        },

        /**
         * Filters for the get action.
         * @method getFilters
         * @return {Function[]} array of filters
         */
        getFilters: function () {
            return [
                filter.base.requireResource(),
                filter.base.checkAuthorization(),
                filter.base.checkCollect()
            ];
        },
        watchFilters: function() {
            return [
                filter.base.checkAuthorization(),
                filter.base.checkCollect()
            ];
        },
        collectFilters: function(nodeType, contentType) {
            return [
                filter.base.checkAuthorization(),
                filter.base.createResource(nodeType),
                filter.base.checkContentType(contentType),
                filter.base.checkVersion(),
                filter.base.checkCollect()
            ];
        },
        /**
         * Filters for set-like actions that need to mark the resource as a collector.
         * @method getFilters
         * @return {Function[]} array of filters
         */
        createAndCollectFilters: function (nodeType, contentType) {
            return [
                filter.base.checkAuthorization(),
                filter.base.createResource(nodeType),
                filter.base.checkCollect(),
                filter.base.checkContentType(contentType),
                filter.base.checkVersion()
            ];
        }
    };

    return standard;
}(ozpIwc.api.filter));

var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.locks = ozpIwc.api.locks || {};

/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.locks
 */

ozpIwc.api.locks.Api = (function (api, log, ozpConfig, transport, util) {

    /**
     * The Locks Api. Treats each node as an individual mutex, creating a queue to access/own the resource.
     * Subclasses the {{#crossLink "ozpIwc.api.base.Api"}}{{/crossLink}}. Utilizes the
     * {{#crossLink "ozpIwc.api.locks.Node"}}{{/crossLink}} which subclasses the
     * {{#crossLink "ozpIwc.CommonApiValue"}}{{/crossLink}}.
     *
     * @class Api
     * @namespace ozpIwc.api.locks
     * @extends ozpIwc.api.base.Api
     * @uses ozpIwc.util.PacketRouter, ozpIwc.util.Event
     * @constructor
     *
     * @type {Function}
     */
    var Api = util.extend(api.base.Api, function (config) {
        if (!config.router) {
            throw Error("API must be configured with a router.");
        }
        if (!config.authorization) {
            throw Error("API must be configured with an authorization module.");
        }
        this.name = "locks.api";
        this.coordinationAddress = "coord." + this.name;
        this.events = new util.Event();
        this.events.mixinOnOff(this);
        this.router = config.router;
        this.endpoints = [];
        this.data = {};
        this.watchers = {};
        this.collectors = [];
        this.changeList = {};
        this.authorization = config.authorization;

        //Start queueing and queue until either:
        // (1) state comes in a victor message or
        // (2) become leader. whichever is first
        this.enableRequestQueue();
        this.enableSendQueue();

        consensusConfiguration(this, config.consensusMember);
        participantConfiguration(this);

        this.logPrefix = "[" + this.name + "/" + this.participant.address + "] ";

        //This is poor form, but the apiBase behavior for locks should let everyone write.
        this.leaderState = "loading";
        this.transitionToLeader();

        var self = this;
        util.addEventListener("beforeunload", function () {
            self.shutdown();
        });
    });
    util.PacketRouter.mixin(Api);

//--------------------------------------------------
//          Private Methods
//--------------------------------------------------
    /**
     * The Locks Api uses the Bully Consensus module to determine leadership.
     *
     * @method consensusConfiguration
     * @private
     * @static
     * @param {ozpIwc.api.locks.Api} api
     * @param {Object} [consensusMember]
     */
    var consensusConfiguration = function (api, consensusMember) {
        api.consensusMember = consensusMember || new transport.consensus.Bully({
                'name': api.name,
                'authorization': api.authorization,
                'router': api.router,
                'gatherLogs': function () {
                    return api.createDeathScream();
                }
            });
        api.consensusMember.on("receivedLogs", handleLogs, api);
        api.consensusMember.on("changedState", handleConsensusState, api);

        //If we're using a shared worker we won't have to elect a leader, its always the same one.
        if (util.runningInWorker) {
            api.consensusMember.participant.connect().then(function () {
                api.consensusMember.onBecomeCoordinator();
            });
        }
    };

    /**
     * For Api call handling, the Locks Api uses a clientParticipant.
     *
     * @method participantConfiguration
     * @private
     * @static
     * @param {api.locks.Api} api
     */
    var participantConfiguration = function (api) {
        api.participant = new transport.participant.Client({
            'internal': true,
            'authorization': api.authorization,
            'router': api.router,
            'name': api.name
        });
        api.participant.on("receive", function (packetContext) {
            api.receivePacketContext(packetContext);
        });

        api.participant.on("addressDisconnects", api.unlockAll, api);
        api.router.registerMulticast(api.participant, [api.name]);
        if (api.consensusMember.state === "coordinator") {
            api.deliverRequestQueue();
        }
    };

    /**
     * If the Locks Api object has not been initialized, it will initialize with the data passed in to the handleLogs
     * function.
     *
     * @method handleLogs
     * @private
     * @param {Object}data
     */
    var handleLogs = function (data) {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        var logTimestamp = data.timestamp;
        this.initializeData(data);
        this.deliverRequestQueue(logTimestamp);
    };

    /**
     * When the Consensus Module changes state, the Locks Api behaves differently. It's participant will only send
     * outbound messages if it is the "Coordinator".
     *
     * @method handleConsensusState
     * @private
     * @param {String} state
     */
    var handleConsensusState = function (state) {
        log.debug("[" + this.participant.address + "] State: ", state);
        switch (state) {
            case "coordinator":
                this.deliverRequestQueue();
                this.deliverSendQueue();
                break;
            default:
                this.participant.sendingBlocked = true;
                this.flushSendQueue();
                break;
        }
    };

//--------------------------------------------------
//          Public Methods
//--------------------------------------------------
    /**
     * Transitions the Lock Api's leader state to leader if its state currently is "loading". Broadcasts leader ready
     * event.
     * @method transitionToLeader
     */
    Api.prototype.transitionToLeader = function () {
        if (this.leaderState !== "loading") {
            log.error(this.logPrefix + "transition to leader called in an invalid state:", this.leaderState);
            return;
        }
        log.debug(this.logPrefix + "transitioning to leader");
        this.leaderState = "leader";
        this.broadcastLeaderReady();
    };

    /**
     * Unlocks All queued locks for the given address in the Locks Api.
     *
     * @TODO: Right now cycles through Every node, keep a map of addresses to nodes to unlock.
     *
     * @method unlockAll
     * @param {String} address
     */
    Api.prototype.unlockAll = function (address) {
        var self = this;
        util.object.eachEntry(this.data, function (k, v) {
            self.updateLock(v, v.unlock({
                src: address
            }));
        });
    };

    /**
     * Iterates over all node's and cleans out any rouge locks queue'd for no-longer/non-existent addresses.
     *
     * @method cleanup
     */
    Api.prototype.cleanup = function () {
        var addrMap = {};
        util.object.eachEntry(this.data, function (k, v) {
            var queue = v.entity.queue || [];
            queue.forEach(function (entry) {
                addrMap[entry.src] = true;
            });
        });

        var self = this;
        this.participant.names().bulkGet("/address").then(function (reply) {
            reply.entity.forEach(function (node) {
                if (node.entity.time && node.entity.time + ozpConfig.heartBeatFrequency > util.now()) {
                    addrMap[node.entity.address] = false;
                }
            });
        }).then(function () {
            util.object.eachEntry(addrMap, function (k, v) {
                if (v) {
                    self.unlockAll(k);
                }
            });
        });
    };

    /**
     * Override the default node type to be a Locks Api Value.
     *
     * @override
     * @method createNodeObject
     * @param {type} config
     * @return {ozpIwc.api.data.node}
     */
    Api.prototype.createNodeObject = function (config) {
        return new api.locks.Node(config);
    };


    /**
     * Shuts down the api, issuing a deathscream and releasing the lock, if possible.
     *
     * @method shutdown
     * @return
     */
    Api.prototype.shutdown = function () {
        this.participant.send({
            dst: "locks.api",
            resource: "/mutex/" + this.name,
            action: "unlock"
        });
    };

//====================================================================
// Default Route
//====================================================================
    Api.useDefaultRoute = function (actions, resource) {
        resource = resource || "{resource:.*}";
        actions = util.ensureArray(actions);
        var self = this;
        actions.forEach(function (a) {
            var filterFunc = api.filter.standard.forAction(a);
            self.declareRoute({
                    action: a,
                    resource: resource,
                    filters: (filterFunc ? filterFunc() : [])
                }, api.base.Api.defaultHandler[a]
            );
        });
    };

    Api.useDefaultRoute(["bulkGet", "list", "get", "watch", "unwatch"]);
//====================================================================
// Bulk Send
//====================================================================
    Api.declareRoute({
        action: ["bulkSend"],
        resource: "{resource:.*}",
        filters: []
    }, function (packet, context, pathParams) {
        var messages = packet.entity || [];
        var self = this;

        messages.forEach(function (message) {
            var packetContext = new transport.PacketContext({
                'packet': message.packet,
                'router': self.router,
                'srcParticipant': message.packet.src,
                'dstParticipant': self.address
            });
            self.receiveRequestPacket(packetContext);
        });
        return {response: "ok"};
    });

//====================================================================
// Lock
//====================================================================
    Api.declareRoute({
        action: "lock",
        resource: "/mutex/{name}",
        filters: api.filter.standard.setFilters(api.locks.Node)
    }, function (packet, context, pathParams) {
        if (context.node) {
            this.updateLock(context.node, context.node.lock({
                src: packet.src,
                msgId: packet.msgId
            }));
        }
    });

//====================================================================
// Unlock
//====================================================================
    Api.declareRoute({
        action: "unlock",
        resource: "/mutex/{name}",
        filters: api.filter.standard.setFilters(api.locks.Node)
    }, function (packet, context, pathParams) {
        packet.entity = packet.entity || {};
        log.debug("[locks.api" + context.node.resource + "][UNLOCK]: ", packet.src);
        if (context.node) {
            this.updateLock(context.node, context.node.unlock({
                src: packet.entity.src || packet.src,
                msgId: packet.entity.msgId || packet.msgId,
                entity: packet.entity.state || context.node.entity.state
            }));
        }
    });


//====================================================================
// Lock/Unlock Utility
//====================================================================
    /**
     * Notifies the owner of the node's lock/unlock.
     *
     * @method updateLock
     * @param {ozpIwc.ApiValue} node
     * @param {Object} newOwner
     */
    Api.prototype.updateLock = function (node, newOwner) {
        if (newOwner) {
            log.debug("[locks.api" + node.resource + "][NEW LEADER]", newOwner);
            var pkt = {
                'dst': newOwner.src,
                'src': this.participant.name,
                'replyTo': newOwner.msgId,
                'response': 'ok',
                'resource': node.resource,
                'entity': node.entity.state
            };

            if (this.isSendQueueing) {
                this.sendQueue.push(pkt);
            } else {
                this.participant.send(pkt);
            }
        }
    };

    return Api;
}(ozpIwc.api, ozpIwc.log, ozpIwc.config, ozpIwc.transport, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.locks = ozpIwc.api.locks || {};

/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.locks
 */

ozpIwc.api.locks.Node = (function (api, util) {
    /**
     * @class Node
     * @namespace ozpIwc.api.locks
     * @extends ozpIwc.api.base.node
     *
     * @constructor
     * @param {Object} config
     * @param {String[]} config.allowedContentTypes a list of content types this Locks Api value will accept.
     */
    var Node = util.extend(api.base.Node, function (config) {
        api.base.Node.apply(this, arguments);
        this.entity = {
            owner: null,
            queue: []
        };
    });

    /**
     * Pushes the ozpIwc.packet.Transport onto the mutex queue. If it is the first element in the queue, the packet's
     * sender will take control of the node.
     *
     * @method lock
     * @param {ozpIwc.packet.Transport} packet
     * @return {Object|null} should the lock action set a new owner it will be returned, else null will be returned.
     */
    Node.prototype.lock = function (packet) {
        this.entity.queue = this.entity.queue || [];

        for (var i in this.entity.queue) {
            var current = this.entity.queue[i];
            //Skip over duplicates (for newly joined instances of locks)
            if (current.src === packet.src && current.msgId === packet.msgId) {
                return null;
            }
        }

        this.entity.queue.push(packet);
        this.entity.owner = this.entity.owner || {};
        if (!util.objectContainsAll(this.entity.owner, this.entity.queue[0])) {
            this.entity.owner = this.entity.queue[0];
            if (packet.eTag) {
                this.version = packet.eTag;
            } else {
                this.version++;
            }
            return this.entity.owner;
        }
        return null;
    };

    /**
     * Removes all ozpIwc.packet.Transports in the queue that match the given packet. Should this remove the owner of
     * the mutex, the next remaining packet's sender will take control.
     *
     * @method unlock
     * @param {ozpIwc.packet.Transport} packet
     * @return {Object|null} should the unlock action set a new owner it will be returned, else null will be returned.
     */
    Node.prototype.unlock = function (packet) {
        this.entity.queue = this.entity.queue.filter(function (q) {
            return !util.objectContainsAll(q, packet);
        });

        this.entity.state = packet.entity || this.entity.state;

        if (!util.objectContainsAll(this.entity.owner, this.entity.queue[0])) {
            this.entity.owner = this.entity.queue[0];
            if (packet.eTag) {
                this.version = packet.eTag;
            } else {
                this.version++;
            }
            return this.entity.owner;
        } else if (this.entity.queue.length === 0) {
            if (packet.eTag) {
                this.version = packet.eTag;
            } else {
                this.version++;
            }
            this.entity.owner = null;
        }
        return null;
    };

    return Node;
}(ozpIwc.api, ozpIwc.util));
var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.data = ozpIwc.api.data || {};
/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.data
 */


ozpIwc.api.data.Api = (function (api, ozpConfig, util) {
    /**
     * The Data Api.
     * Subclasses the {{#crossLink "ozpIwc.api.base.Api"}}{{/crossLink}}.
     *
     * @class Api
     * @namespace ozpIwc.api.data
     * @extends ozpIwc.api.base.Api
     * @constructor
     * @param {Object} config
     * @param {String} [config.name="data.api"]
     * @param {ozpIwc.transport.Router} config.router
     */
    var Api = api.createApi("data.api", function (config) {
        this.endpoints = config.endpoints || [{link: ozpConfig.linkRelPrefix + ":user-data", headers: []}];
        this.contentTypeMappings = util.genContentTypeMappings(api.data.node);
    });


//--------------------------------------------------
// Node creation/modification methods
//--------------------------------------------------
    /**
     * Maps a content-type to an IWC Node type.
     * Overridden to check for a template specified content-type for the data api nodes.
     * @method findNodeType
     * @param {Object} contentTypeObj an object-formatted content-type
     * @param {String} contentTypeObj.name the content-type without any variables
     * @param {Number} [contentTypeObj.version] the version of the content-type.
     * @returns {undefined}
     */
    Api.prototype.findNodeType = function (contentType) {
        var formattedContentType = util.getFormattedContentType(contentType);
        if (!formattedContentType.name) {
            var template = api.uriTemplate('ozp:data-item') || {};
            formattedContentType = util.getFormattedContentType(template.type);
        }

        var type = this.contentTypeMappings[formattedContentType.name];
        if (type) {
            if (formattedContentType.version) {
                return type[formattedContentType.version];
            } else {
                return type;
            }
        }
        return api.data.node.NodeV2;
    };

    /**
     * Creates a node appropriate for the given config.  This does
     * NOT add the node to this.data.
     *
     * If no node type, no node created (does not use default node type).
     *
     * @method createNodeObject
     * @param {Object} config The node configuration configuration.
     * @param {Function} NodeType The contructor call for the given node type to be created.
     * @return {ozpIwc.api.base.Node}
     */
    Api.prototype.createNodeObject = function (config, NodeType) {
        if (NodeType) {
            return new NodeType(config);
        }
    };

    return Api;
}(ozpIwc.api, ozpIwc.config, ozpIwc.util));
var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.data = ozpIwc.api.data || {};
ozpIwc.api.data.node = ozpIwc.api.data.node || {};

/**
 * @module ozpIwc.api.data
 * @submodule ozpIwc.api.data.node
 */

ozpIwc.api.data.node.Node = (function (api, util) {
    /**
     * @class Node
     * @namespace ozpIwc.api.data.node
     * @extends ozpIwc.api.base.Node
     * @constructor
     */
    var Node = util.extend(api.base.Node, function (config) {
        api.base.Node.apply(this, arguments);

        // If there was no specified lifespan in the creation, override to Persistent.
        if (!config.lifespan) {
            this.lifespan = new api.Lifespan.Persistent();
        }

        this.contentType = Node.serializedContentType;
    });

    /**
     * @property uriTemplate
     * @type {string}
     */
    Node.prototype.uriTemplate = "ozp:data-item";

    /**
     * Serializes the node for persistence to the server.
     *
     * @method serialize
     * @return {String}
     */
    Node.prototype.serialize = function () {
        return JSON.stringify({
            key: this.resource,
            entity: this.entity,
            collection: this.collection,
            pattern: this.pattern,
            contentType: this.contentType,
            permissions: this.permissions,
            version: this.version,
            self: this.self
        });
    };

    /**
     * The content type of the data returned by serialize()
     *
     * @method serializedContentType
     * @static
     * @return {string}
     */
    Node.serializedContentType = "application/vnd.ozp-iwc-data-object-v1+json";

    /**
     * Sets the api node from the serialized form.
     *
     * @method deserializedEntity
     * @param {Object} data
     * @param {String} contentType
     */
    Node.prototype.deserializedEntity = function (data, contentType) {
        if (typeof data.entity === "string") {
            try {
                return JSON.parse(data.entity);
            } catch (e) {
                return data.entity;
            }
        } else {
            return data.entity;
        }
    };

    /**
     * Sets the api node from the serialized form.
     * Deserializes permissions and versions ontop of base implementation.
     *
     * @method deserialize
     * @param {String} data A string serialization of the object
     * @param {String} contentType The contentType of the object
     * @return {Object}
     */
    Node.prototype.deserialize = function (data, contentType) {
        try {
            data = JSON.parse(data);
        } catch (e) {

        }
        api.base.Node.prototype.deserialize.apply(this, [data.entity, contentType]);

        if (typeof this.permissions === "string") {
            this.permissions = JSON.parse(this.permissions);
        }

        if (typeof this.version === "string") {
            this.version = JSON.parse(this.version);
        }
    };
    /**
     * If a resource path isn't given, this takes the best guess at assigning it.
     * @override
     * @method resourceFallback
     * @param {Object} serializedForm
     * @return {String}
     */
    Node.prototype.resourceFallback = function (serializedForm) {
        if (serializedForm.key) {
            return ((serializedForm.key.charAt(0) === "/") ? "" : "/") + serializedForm.key;
        }
    };

    return Node;
}(ozpIwc.api, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.data = ozpIwc.api.data || {};
ozpIwc.api.data.node = ozpIwc.api.data.node || {};

/**
 * @module ozpIwc.api.data
 * @submodule ozpIwc.api.data.node
 */

ozpIwc.api.data.node.NodeV2 = (function (api, util) {
    /**
     * A data Api Node class for content-type "application/vnd.ozp-iwc-data-object+json;version=2".
     * @class Nodev2
     * @namespace ozpIwc.api.data.node
     * @extends ozpIwc.api.base.Node
     * @constructor
     */
    var Node = util.extend(api.data.node.Node, function (config) {
        api.data.node.Node.apply(this, arguments);
        this.contentType = Node.serializedContentType;
    });

    /**
     * Formats the node for persistence to the server.
     *
     * @method serialize
     * @return {Object}
     */
    Node.prototype.serialize = function () {
        /*jshint camelcase: false */
        return {
            key: this.resource,
            entity: JSON.stringify(this.entity),
            content_type: this.contentType,
            version: this.version,
            pattern: this.pattern,
            collection: util.ensureArray(this.collection),
            permissions: util.ensureObject(this.permissions)
        };
    };

    /**
     * The content type of the data returned by serialized()
     *
     * @method serializedContentType
     * @static
     * @return {string}
     */
    Node.serializedContentType = "application/vnd.ozp-iwc-data-object+json;version=2";

    /**
     * Sets the api node from the serialized form.
     * Deserializes permissions and versions ontop of base implementation.
     *
     * @method deserialize
     * @param {String} data A string serialization of the object
     * @param {String} contentType The contentType of the object
     * @return {Object}
     */
    Node.prototype.deserialize = function (data, contentType) {
        api.base.Node.prototype.deserialize.apply(this, arguments);

        if (typeof this.permissions === "string") {
            this.permissions = JSON.parse(this.permissions);
        }

        if (typeof this.version === "string") {
            this.version = JSON.parse(this.version);
        }
    };

    /**
     * Sets the api node from the serialized form.
     *
     * @method deserializedEntity
     * @param {Object} data
     */
    Node.prototype.deserializedEntity = function (data) {
        /*jshint camelcase: false */
        data = data || {};
        return JSON.parse(data.entity);
    };

    /**
     * If a resource path isn't given, this takes the best guess at assigning it.
     * @override
     * @method resourceFallback
     * @return {String}
     */
    Node.prototype.resourceFallback = function () {
        if (this.self.href) {
            var baseUrl = api.endpoint("ozp:user-data").baseUrl;
            while (baseUrl.slice(-1) === "/") {
                baseUrl = baseUrl.slice(0, -1);
            }
            if (this.self.href.indexOf(baseUrl) === 0) {
                return this.self.href.replace(baseUrl, "");
            }
        }
    };

    return Node;
}(ozpIwc.api, ozpIwc.util));
var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.data = ozpIwc.api.data || {};
/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.data
 * @class ozpIwc.api.data.Api
 */

ozpIwc.api.data.Api = (function (api, DataApi) {

    // Default handlers are fine for all common actions
    DataApi.useDefaultRoute(api.base.Api.allActions);

//---------------------------------------------------------
// Add/Remove Child Functionality
//---------------------------------------------------------
    //-----------------------------------------------------
    // Filters
    //-----------------------------------------------------

    /**
     * A filter for adding children nodes to the data api. assigns the parent node a pattern & sets it as a collector.
     * @method addChildFilters
     * @private
     * @static
     * @return {function[]}
     */
    var addChildFilters = function () {
        var childData = {};
        var filters = api.filter.standard.createAndCollectFilters(api.data.node.Node);

        //Stash the child's pattern for now and create the parent.
        filters.unshift(function (packet, context, pathParams, next) {
            childData.pattern = packet.pattern;
            childData.lifespan = packet.lifespan;
            packet.pattern = undefined;
            packet.lifespan = undefined;
            return next();
        });
        //Make sure the parent node has it's pattern set then replace the childs pattern at the end of the filter chain
        filters.push(function (packet, context, pathParams, next) {
            packet.pattern = childData.pattern;
            packet.lifespan = childData.lifespan;
            return next();
        });
        return filters;
    };

    //-----------------------------------------------------
    // Routes
    //-----------------------------------------------------

    DataApi.declareRoute({
        action: ["addChild"],
        resource: "{resource:.*}",
        filters: addChildFilters()
    }, function (packet, context, pathParams) {
        var key = this.createKey(context.node.pattern);
        packet.resource = key;
        packet.pattern = packet.pattern || key + "/";
        var childNode = this.createNode({
            resource: key,
            lifespan: packet.lifespan,
            src: packet.src
        }, api.data.node.Node);

        // mark the parent as a collector
        this.addCollector(context.node);
        this.markForChange(childNode);
        childNode.set(packet);

        return {
            response: "ok",
            entity: {
                resource: childNode.resource
            }
        };
    });

    DataApi.declareRoute({
        action: ["removeChild"],
        resource: "{resource:.*}",
        filters: api.filter.standard.deleteFilters()
    }, function (packet, context, pathParams) {
        if (packet.entity && packet.entity.resource) {
            packet.resource = packet.entity.resource;
            context.node = this.data[packet.resource];
            if (context.node) {
                this.markForChange(context.node);
                context.node.markAsDeleted(packet);
            }
        }
        return {response: "ok"};
    });

    return DataApi;
}(ozpIwc.api, ozpIwc.api.data.Api || {}));

var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.intents = ozpIwc.api.intents || {};

/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.intents
 */


ozpIwc.api.intents.Api = (function (api, log, ozpConfig, util) {
    /**
     * The Intents Api.
     * Subclasses the {{#crossLink "ozpIwc.api.base.Api"}}{{/crossLink}}.
     *
     * @class Api
     * @namespace ozpIwc.api.intents
     * @extends ozpIwc.api.base.Api
     * @constructor
     * @param {Object} config
     * @param {String} [config.name="intents.api"]
     * @param {ozpIwc.transport.Router} config.router
     */
    var Api = api.createApi("intents.api", function (config) {
        this.endpoints = config.endpoints || [{link: ozpConfig.linkRelPrefix + ":intent", headers: []}];
        this.contentTypeMappings = util.genContentTypeMappings(api.intents.node);
    });

//--------------------------------------------------
// API state initialization methods
//--------------------------------------------------
    Api.prototype.initializeData = function (deathScream) {
        deathScream = deathScream || {watchers: {}, collectors: [], data: []};
        this.watchers = deathScream.watchers;
        this.collectors = deathScream.collectors;
        deathScream.data.forEach(function (packet) {
            if (packet.resource.indexOf("/inFlightIntent") === 0) {
                packet.entity = packet.entity || {};
                packet.entity.dState = packet.entity.state;
                packet.entity.state = "deserialize";
                this.createNode({
                    resource: packet.resource, invokePacket: {},
                    handlerChoices: [0, 1],
                    state: "deserialize"
                }, api.intents.InFlightNode).deserializeLive(packet);
            } else {
                this.createNode({resource: packet.resource}).deserializeLive(packet);
            }
        }, this);

        this.updateCollections();
        if (this.endpoints) {
            var self = this;
            var onResource = function (resource) {
                self.loadedResourceHandler(resource);
            };
            return Promise.all(this.endpoints.map(function (u) {
                return util.halLoader.load(u.link, u.headers, onResource).catch(function (err) {
                    log.error(self.logPrefix, "load from endpoint failed. Reason: ", err);
                });
            }));
        } else {
            return Promise.resolve();
        }
    };

//--------------------------------------------------
// Node creation/modification methods
//--------------------------------------------------
    /**
     * Maps a content-type to an IWC Node type. Overriden in APIs.
     * @method findNodeType
     * @param {Object} contentTypeObj an object-formatted content-type
     * @param {String} contentTypeObj.name the content-type without any variables
     * @param {Number} [contentTypeObj.version] the version of the content-type.
     * @returns {undefined}
     */
    Api.prototype.findNodeType = function (contentType) {
        var formattedContentType = util.getFormattedContentType(contentType);
        var type = this.contentTypeMappings[formattedContentType.name];
        if (type) {
            if (formattedContentType.version) {
                return type[formattedContentType.version];
            } else {
                return type;
            }
        }
    };


//---------------------------------------------------------
// Intent Invocation Methods
//---------------------------------------------------------
    /**
     * Notifies the invoker when the state of the in flight intent changes.
     * @method updateInvoker
     * @static
     * @private
     * @param {ozpIwc.api.intents.Api} api
     * @param node
     */
    var updateInvoker = function (api, node) {
        var response = node.entity.reply || {};
        return api.send({
            dst: node.entity.invokePacket.src,
            replyTo: node.entity.invokePacket.msgId,
            response: "update",
            entity: {
                request: node.entity.entity,
                response: response.entity,
                handler: node.entity.handler,
                state: node.entity.state,
                status: node.entity.status
            }
        });
    };

    /**
     * A handler for invoke calls. Creates an inFlight-intent node and kicks off the inflight state machine.
     *
     * @method invokeIntentHandler
     * @param {Object} packet
     * @param {String} type
     * @param {String} action
     * @param {Object[]} handlers
     * @param {String} pattern
     * @return {Promise}
     */
    Api.prototype.invokeIntentHandler = function (packet, type, action, handlers, pattern) {
        var inflightNode = new api.intents.node.InFlightNode({
            resource: this.createKey("/inFlightIntent/"),
            src: packet.src,
            invokePacket: packet,
            type: type,
            action: action,
            handlerChoices: handlers,
            pattern: pattern
        });

        this.data[inflightNode.resource] = inflightNode;
        this.addCollector(inflightNode);
        updateInvoker(this, inflightNode);
        this.data[inflightNode.resource] = api.intents.FSM.transition(inflightNode);
        return this.handleInflightIntentState(inflightNode);
    };

    /**
     * Handles the current state of the state machine.
     * If "choosing", the intent chooser will open.
     * If "delivering", the api will send the intent to the chosen handler
     * If "complete", the api will send the intent handler's reply back to the invoker and mark the inflight intent as
     * deleted.
     * @param {Object} inflightNode
     * @return {*}
     */
    Api.prototype.handleInflightIntentState = function (inflightNode) {
        switch (inflightNode.entity.state) {
            case "choosing":
                return this.handleChoosing(inflightNode);
            case "delivering":
                this.handleDelivering(inflightNode);
                break;
            case "complete":
                this.handleComplete(inflightNode);
                break;
            case "error":
                this.handleError(inflightNode);
                break;
            default:
                updateInvoker(this, inflightNode);
                break;
        }
        return Promise.resolve(inflightNode);
    };

    /**
     * A handler for the "choosing" state of an in-flight intent node.
     * @method handleChoosing
     * @param node
     * @return {Promise} Resolves when either a preference is gathered or the intent chooser is opened.
     */
    Api.prototype.handleChoosing = function (node) {
        var self = this;

        var useRegisteredChooser = function (intentNode) {

            var tryChooser = function (chooser) {
                var packet = util.clone(chooser.entity.invokeIntent);
                packet.entity = packet.entity || {};
                packet.src = packet.src || packet.dst;
                packet.replyTo = chooser.entity.replyTo;
                packet.entity.inFlightIntent = intentNode.toPacket();
                packet.entity.force = (util.getInternetExplorerVersion() === 11);
                if (util.runningInWorker) {
                    packet.entity.config = ozpConfig;
                    packet.entity.config.intentSelection = "intents.api" + node.resource;
                }

                return self.invokeIntentHandler(packet, '/inFlightIntent/chooser', 'choose', [chooser], '/inFlightIntent/chooser/choose/').then(function (inFlightNode) {
                    //This is because we are manually using the packetRouter route.
                    inFlightNode.entity = inFlightNode.entity || {};

                    if (inFlightNode.entity.state === "complete") {
                        return true;
                    } else if (inFlightNode.entity.state === "error") {
                        throw "err";
                    } else {
                        var res, rej;
                        var promise = new Promise(function (resolve, reject) {
                            res = resolve;
                            rej = reject;
                        });
                        var onComplete = function (node) {
                            if (node.resource === inFlightNode.resource) {
                                api.intents.FSM.off("complete", onComplete);
                                res(true);
                            }
                        };
                        var onError = function (node) {
                            if (node.resource === inFlightNode.resource) {
                                api.intents.FSM.off("error", onError);
                                rej("err");
                            }
                        };
                        api.intents.FSM.on("complete", onComplete);
                        api.intents.FSM.on("error", onError);
                        return promise;
                    }
                });
            };

            var itterChoosers = function (choosers) {
                if (choosers.length > 0) {
                    return tryChooser(choosers[0]).then(function () {
                        return Promise.resolve();
                    }).catch(function (err) {
                        choosers.shift();
                        return itterChoosers(choosers);
                    });
                } else {
                    return Promise.reject("no choosers.");
                }
            };

            var invokersChooser = self.matchingNodes('/inFlightIntent/chooser/choose/' + intentNode.entity.invokePacket.src);
            var registeredChoosers = self.matchingNodes('/inFlightIntent/chooser/choose/');

            return itterChoosers(invokersChooser).catch(function(err) {
                return itterChoosers(registeredChoosers);
            });
        };

        var showChooser = function (err) {
            log.info("Picking chooser because", err);
            return useRegisteredChooser(node).catch(function (err) {

                if (util.getInternetExplorerVersion() !== 11) {
                    log.info("launching popup chooser because: ", err);
                    if (!util.runningInWorker) {
                        util.openWindow(ozpConfig.intentsChooserUri, {
                            "ozpIwc.peer": ozpConfig._busRoot,
                            "ozpIwc.intentSelection": "intents.api" + node.resource
                        }, ozpConfig.intentChooserFeatures);
                    }
                } else {
                    log.error("Failed to handle intent choosing: Internet Explorer 11 is not supported" +
                        " for the default intent chooser.");
                    node = api.intents.FSM.transition(node, {state: "error"});
                }

                return node;
            });
        };

        updateInvoker(this, node);
        return this.getPreference(node.entity.invokePacket.src + "/" + node.entity.intent.type + "/" + node.entity.intent.action).then(function (handlerResource) {
            if (handlerResource in self.data) {
                node = api.intents.FSM.transition(node, {
                    entity: {
                        state: "delivering",
                        'handler': {
                            'resource': handlerResource,
                            'reason': "remembered"
                        }
                    }
                });
                updateInvoker(self, node);
                return self.handleInflightIntentState(node);
            } else {
                return showChooser();
            }
        }).catch(showChooser);
    };

    /**
     *  A handler for the "delivering" state of an in-flight intent node.
     *  Sends a packet to the chosen handler.
     *
     *  @TODO should resolve on response from the handler that transitions the node to "running".
     *
     * @method handleDelivering
     * @param {ozpIwc.api.base.Node} node
     */
    Api.prototype.handleDelivering = function (node) {
        var handlerNode = this.data[node.entity.handler.resource];

        var packet = util.clone(handlerNode.entity.invokeIntent);
        packet.entity = packet.entity || {};
        packet.replyTo = handlerNode.entity.replyTo;
        packet.entity.inFlightIntent = node.toPacket();
        log.debug(this.logPrefix + "delivering intent:", packet);
        updateInvoker(this, node);
        // TODO: packet permissions
        return this.send(packet);
    };

    /**
     * A handler for the "complete" state of an in-flight intent node.
     * Sends notification to the invoker that the intent was handled & deletes the in-flight intent node as it is no
     * longer needed.
     *
     * @method handleComplete
     * @param {ozpIwc.api.base.Node} node
     */
    Api.prototype.handleComplete = function (node) {
        if (node.entity.invokePacket && node.entity.invokePacket.src && node.entity.reply) {
            this.send({
                dst: node.entity.invokePacket.src,
                replyTo: node.entity.invokePacket.msgId,
                contentType: node.entity.reply.contentType,
                response: "complete",
                resource: node.entity.handler.resource,
                entity: node.entity.reply.entity
            });
            updateInvoker(this, node);
        }
        node.markAsDeleted();
    };
    /**
     * A handler for the "error" state of an in-flight intent node.
     * Sends notification to the invoker that the intent was handled & deletes the in-flight intent node as it is no
     * longer needed.
     *
     * @method handleError
     * @param {ozpIwc.api.base.Node} node
     */
    Api.prototype.handleError = function (node) {
        if (node.entity.invokePacket && node.entity.invokePacket.src) {
            this.send({
                dst: node.entity.invokePacket.src,
                replyTo: node.entity.invokePacket.msgId,
                contentType: node.entity.reply.contentType,
                response: "noResult",
                resource: node.entity.handler.resource,
                entity: node.entity.reply.entity
            });
            updateInvoker(this, node);
        }
        node.markAsDeleted();
    };

    return Api;

}(ozpIwc.api, ozpIwc.log, ozpIwc.config, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.intents = ozpIwc.api.intents || {};

/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.intents
 */


ozpIwc.api.intents.FSM = (function (api, util) {
    /**
     * A Finite State Machine for in-flight intent resources. This state machine is static and manipulates the apiNodes
     * it receives given the packet context received.
     * @class FSM
     * @namespace ozpIwc.api.intents
     * @uses ozpIwc.util.Event
     * @static
     * @type {Object}
     */
    var FSM = {};

    FSM.events = new util.Event();
    FSM.events.mixinOnOff(FSM);

//===============================================
// States.
// Called with node as scope.
//===============================================
    /**
     * A collection of states in the FSM. Each state is a function that is called when a node transitions to it via
     * ozpIwc.InFlightFSM.transition.
     * Each state function is called with the node's scope.
     *
     * @property states
     * @type {Object}
     */
    FSM.states = {};

    /**
     * The initial state.
     * This state immediately determines the next state of the node based on the number of handler choices it contains.
     *
     * @method init
     * @return {Object}
     */
    FSM.states.init = function () {
        var choices = this.entity.handlerChoices;
        var nextEntity = {};

        if (!choices || choices === []) {
            nextEntity.state = "error";
            nextEntity.error = "noChoices";
            return FSM.transition(this, {entity: nextEntity});
        }

        if (Array.isArray(choices)) {
            //If there is only 1 choice & its a launcher, enforce the popup to choose it (similar to Windows chooser
            // feel).
            var onlyLauncher = (choices.length === 1 && choices[0] && choices[0].entity && choices[0].entity.invokeIntent &&
            choices[0].entity.invokeIntent.action === "launch");
            if (choices.length === 1 && !onlyLauncher) {
                nextEntity.handler = {
                    resource: choices[0].resource,
                    reason: "onlyOne"
                };
                nextEntity.state = "delivering";
            } else {
                nextEntity.state = "choosing";
            }
        } else if (typeof choices === "object") {
            nextEntity.handler = {
                resource: choices.resource,
                reason: "onlyOne"
            };
            nextEntity.state = "delivering";
        } else {
            nextEntity.state = "error";
            nextEntity.error = "unknown choices.";
        }

        return FSM.transition(this, {entity: nextEntity});
    };

    /**
     * The error handling state.
     * This state is called when unexpected state changes and missing data occurs in the state
     * machine.
     *
     * @method error
     * @param {Object} entity The entity of the request packet received by the Api.
     * @return {ozpIwc.api.base.Node}
     */
    FSM.states.error = function (entity) {
        var reply = entity.reply || {};
        reply.entity = reply.entity || "Unknown Error.";
        reply.contentType = reply.contentType || "text/plain";

        this.entity = this.entity || {};
        this.entity.reply = reply;
        this.entity.state = "error";
        this.version++;
        return FSM.stateEvent(this);
    };

    /**
     * The delivering state.
     * The node is in a delivering state when it's registered handler is called to operate on the
     * intent data. The register handler will respond with "running" to signify it has received the request.
     *
     * @method delivering
     * @param {Object} entity The entity of the request packet received by the Api.
     * @return {ozpIwc.api.base.Node}
     */
    FSM.states.delivering = function (entity) {
        if (!entity.handler || !entity.handler.resource || !entity.handler.reason) {
            throw new api.error.BadStateError("Choosing state requires a resource and reason");
        }
        this.entity.handler = entity.handler;
        this.entity.state = "delivering";
        this.version++;
        return FSM.stateEvent(this);
    };

    /**
     * The running state.
     * The node is in a running state when the registered handler has received the request data. The
     * node will transition to the "complete" state upon receiving a response from the handler's operation.
     * @TODO currently running/complete are sent at once and no data is returned. When these states are sent the intent
     *     is handled.
     *
     * @method running
     * @param {Object} entity The entity of the request packet received by the Api.
     * @return {ozpIwc.api.base.Node}
     */
    FSM.states.running = function (entity) {
        if (!entity.handler || !entity.handler.address) {
            throw new api.error.BadContentError("Entity lacks a 'handler.address' field");
        }
        this.entity.handler.address = entity.handler.address;
        this.entity.state = "running";
        this.version++;
        return FSM.stateEvent(this);
    };

    /**
     * The choosing state.
     * The node is in a choosing state when:
     *  (1) the intent chooser is opened.
     *  (2) the api is gathering the preference-stored designated handler.
     *
     * The node will transition to delivering once the handler has been chosen.
     *
     * @method choosing
     * @return {ozpIwc.api.base.Node}
     */
    FSM.states.choosing = function () {
        this.entity.state = "choosing";
        this.version++;
        return FSM.stateEvent(this);
    };

    /**
     * The Complete state.
     * Once the intent has been handled or canceled the node will transition to the complete state. From here the API
     * will mark the node for deletion as it is no longer needed.
     *
     * @method complete
     * @param {Object} entity The entity of the request packet received by the Api.
     * @return {ozpIwc.api.base.Node}
     */
    FSM.states.complete = function (entity) {
        this.entity.reply = entity.reply;
        this.entity.state = "complete";
        this.version++;
        return FSM.stateEvent(this);
    };


//===============================================
//State Transitions
//===============================================
    /**
     * A collection of state transitions for the Finite State machine. The first level of properties represent current
     * state and the second level represents states that can be transitioned to.
     *
     * @property stateTransitions
     * @type {Object}
     */
    FSM.stateTransitions = {
        "init": {
            "init": FSM.states.init,
            "error": FSM.states.error,
            "delivering": FSM.states.delivering,
            "choosing": FSM.states.choosing
        },
        "choosing": {
            "error": FSM.states.error,
            "delivering": FSM.states.delivering,
            "complete": FSM.states.complete
        },
        "delivering": {
            "error": FSM.states.error,
            "running": FSM.states.running,
            "complete": FSM.states.complete
        },
        "running": {
            "error": FSM.states.error,
            "complete": FSM.states.complete
        },
        "complete": {},
        "error": {}
    };

    /**
     * The transition utility function. This determines if the requested state change from the packet is valid, then
     * calls the state transition and returns the modified node for storage.
     * @method transition
     * @param {ozpIwc.api.base.Node} node
     * @param {ozpIwc.PacketContext} [packet] If not provided, FSM assumes initial state transition.
     * @return {ozpIwc.api.base.Node}
     */
    FSM.transition = function (node, packet) {
        packet = packet || {entity: {state: "init"}};
        if (!packet.entity || !packet.entity.state) {
            throw new api.error.BadContentError("Entity lacks a 'state' field");
        }
        if (node.deleted) {
            throw new api.error.BadContentError("Already handled.");
        }
        var transist = FSM.stateTransitions[node.entity.state];
        if (!transist) {
            // we're in a bad state.  pretty much unrecoverable
            return FSM.states.error.call(node, {
                entity: {
                    error: "Inflight intent is in an invalid state.  Cannot proceed.",
                }
            });
        }

        transist = transist[packet.entity.state];
        if (!transist) {
            throw new api.error.BadStateError("In-flight intent cannot transition from " +
                node.entity.state + " to " + packet.entity.state);
        }

        return transist.call(node, packet.entity);
    };

    /**
     * Triggers node's state event and returns the node.
     * @method stateReturn
     * @param node
     * @return {ozpIwc.api.base.Node}
     */
    FSM.stateEvent = function (node) {
        if (node.entity && node.entity.state) {
            FSM.events.trigger(node.entity.state, node);
        }
        return node;
    };

    return FSM;
}(ozpIwc.api, ozpIwc.util));
var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.intents = ozpIwc.api.intents || {};
ozpIwc.api.intents.node = ozpIwc.api.intents.node || {};

/**
 * @module ozpIwc.api.intents
 * @submodule ozpIwc.api.intents.node
 */


ozpIwc.api.intents.node.DefinitionNode = (function (api, log, util) {
    /**
     }
     * @class DefinitionNode
     * @namespace ozpIwc.api.intents.node
     * @extends ozpIwc.api.base.Node
     * @constructor
     */
    var DefinitionNode = util.extend(api.base.Node, function (config) {

        // Take the supplied data for anything that matches in the super class,
        // such as resource.
        api.base.Node.apply(this, arguments);
        this.contentType = DefinitionNode.serializedContentType;
        /**
         * @property lifespan
         * @type {ozpIwc.api.Lifespan.Bound}
         */
        this.lifespan = new api.Lifespan.Ephemeral();
        /**
         * @property entity
         * @type {Object}
         */
        this.entity = config.entity || {};

    });

    /**
     * The content type of the data returned by serialize()
     *
     * @method serializedContentType
     * @static
     * @return {string}
     */
    DefinitionNode.serializedContentType = "application/vnd.ozp-iwc-intent-definition-v1+json";

    return DefinitionNode;
}(ozpIwc.api, ozpIwc.log, ozpIwc.util));
var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.intents = ozpIwc.api.intents || {};
ozpIwc.api.intents.node = ozpIwc.api.intents.node || {};

/**
 * @module ozpIwc.api.intents
 * @submodule ozpIwc.api.intents.node
 */


ozpIwc.api.intents.node.HandlerNode = (function (api, log, util) {
    /**
     }
     * @class HandlerNode
     * @namespace ozpIwc.api.intents.node
     * @extends ozpIwc.api.base.Node
     * @constructor
     */
    var HandlerNode = util.extend(api.base.Node, function (config) {
        // Take the supplied data for anything that matches in the super class,
        // such as resource.
        api.base.Node.apply(this, arguments);
        this.contentType = HandlerNode.serializedContentType;
        /**
         * @property lifespan
         * @type {ozpIwc.api.Lifespan.Bound}
         */
        this.lifespan = new api.Lifespan.Bound({
            'addresses': [config.src]
        });
        /**
         * @property entity
         * @type {Object}
         */
        this.entity = config.entity || {};

    });

    /**
     * The content type of the data returned by serialize()
     *
     * @method serializedContentType
     * @static
     * @return {string}
     */
    HandlerNode.serializedContentType = "application/vnd.ozp-iwc-intent-handler-v1+json";
    /**
     * Handles writing new data to the handler node.
     * @override
     * @method set
     * @param {Object} packet
     */
    HandlerNode.prototype.set = function (packet) {
        var dst = packet.src;
        if (packet.entity && packet.entity.invokeIntent && packet.entity.invokeIntent.dst) {
            dst = packet.entity.invokeIntent.dst;
        }
        if (!dst && !(this.entity && this.entity.invokeIntent)) {
            log.error("Handler lacks a invokeIntent.dst", packet);
            throw new api.error.BadContentError("Intent handler must supply invokeIntent.dst");
        }

        api.base.Node.prototype.set.apply(this, arguments);
        this.entity.invokeIntent = this.entity.invokeIntent || {};
        this.entity.invokeIntent.dst = dst;

        //We need to know what callback to call on the client.
        this.entity.replyTo = packet.msgId;
    };

    return HandlerNode;
}(ozpIwc.api, ozpIwc.log, ozpIwc.util));
var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.intents = ozpIwc.api.intents || {};
ozpIwc.api.intents.node = ozpIwc.api.intents.node || {};

/**
 * @module ozpIwc.api.intents
 * @submodule ozpIwc.api.intents.node
 */


ozpIwc.api.intents.node.InFlightNode = (function (api, util) {
    /**
     }
     * @class InFlightNode
     * @namespace ozpIwc.api.intents.node
     * @extends ozpIwc.api.base.Node
     * @constructor
     */
    var InFlightNode = util.extend(api.base.Node, function (config) {
        config = config || {};

        // Take the supplied data for anything that matches in the super class,
        // such as resource.
        api.base.Node.apply(this, arguments);
        this.contentType = InFlightNode.serializedContentType;
        /**
         * @property lifespan
         * @type {ozpIwc.api.Lifespan.Bound}
         */
        this.lifespan = new api.Lifespan.Bound({
            'addresses': [config.src]
        });

        if (!config.invokePacket) {
            throw new api.error.BadContentError("In flight intent requires an invocation packet");
        }
        if (!config.handlerChoices || Array.isArray(config.handlerChoices) && config.handlerChoices.length === 0) {
            throw new api.error.NoResourceError("No handlers available");
        }
        /**
         * Extra information that isn't captured already by the base class, or that isn't captured adequately.
         *
         * @property entity
         * @type {Object}
         */
        this.entity = {
            'intent': {
                'type': config.type,
                'action': config.action
            },
            'invokePacket': config.invokePacket,
            'contentType': config.invokePacket.contentType,
            'entity': config.invokePacket.entity || {},
            'state': "init",
            'status': "ok",
            'handlerChoices': config.handlerChoices,
            'handler': {
                'resource': null,
                'address': null
            },
            'reply': null
        };
    });

    /**
     * The content type of the data returned by serialize()
     *
     * @method serializedContentType
     * @static
     * @return {string}
     */
    InFlightNode.serializedContentType = "application/vnd.ozp-inflight-intent-v1+json";
    return InFlightNode;
}(ozpIwc.api, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.intents = ozpIwc.api.intents || {};
/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.intents
 * @class ozpIwc.api.intents.Api
 */

ozpIwc.api.intents.Api = (function (api, IntentsApi, log) {

//---------------------------------------------------------
// Default Routes
//---------------------------------------------------------
    // turn on bulkGet and list for everything
    IntentsApi.useDefaultRoute(["bulkGet", "list"]);
    IntentsApi.useDefaultRoute(["watch", "unwatch", "delete"], "/inFlightIntent/{id}");
    IntentsApi.useDefaultRoute(["get", "delete", "watch", "unwatch"], "/{major}/{minor}/{action}/{handlerId}");
    IntentsApi.useDefaultRoute(["get", "delete", "watch", "unwatch"], "/{major}/{minor}/{action}");
    IntentsApi.useDefaultRoute(["watch", "unwatch", "get"], "/");
    IntentsApi.useDefaultRoute(["watch", "unwatch", "get"], "/{major}");
    IntentsApi.useDefaultRoute(["watch", "unwatch", "get"], "/{major}/{minor}");

//---------------------------------------------------------
// Filters
//---------------------------------------------------------
    /**
     * A route filter for creating an intent definition (/{major}/{minor}/{action}) if it does not exist.
     * @method registerDefinitionFilter
     * @private
     * @static
     * @return {*}
     */
    var registerDefinitionFilter = function () {
        var setDefinition = function (packet, context, pathParams, next) {
            this.addCollector(context.node);
            return next();
        };

        var filters = api.filter.standard.setFilters(api.intents.node.DefinitionNode);
        filters.unshift(api.filter.base.fixPattern());
        filters.push(setDefinition);

        return filters;
    };

    /**
     * A route filter for creating an intent definition node (/{major}/{minor}/{action}) if it does not exist, then
     * creates an intent handler node with the specified handlerId ({major}/{minor}/{action}/{handlerId})
     * @method registerHandlerFilter
     * @private
     * @static
     * @return {*}
     */
    var registerHandlerFilter = function () {
        var generateDefinitionResource = function (packet, context, pathParams, next) {
            packet.resource = "/" + pathParams.major + "/" + pathParams.minor + "/" + pathParams.action;
            context.node = this.data[packet.resource];
            return next();
        };

        var generateHandlerResource = function (packet, context, pathParams, next) {
            packet.resource = "/" + pathParams.major + "/" + pathParams.minor + "/" + pathParams.action + "/" +
                pathParams.handlerId;
            packet.pattern = "";
            context.node = this.data[packet.resource];
            return next();
        };

        var definitionFilter = registerDefinitionFilter();
        definitionFilter.unshift(generateDefinitionResource);

        definitionFilter.push(generateHandlerResource);

        return definitionFilter;
    };

//---------------------------------------------------------
// Routes
//---------------------------------------------------------

    //-----------------------------------------------------
    // In Flight Intents
    //-----------------------------------------------------
    IntentsApi.declareRoute({
        action: "set",
        resource: "/inFlightIntent/{id}",
        filters: api.filter.standard.setFilters(api.intents.node.InFlightNode)
    }, function (packet, context, pathParams) {
        context.node = api.intents.FSM.transition(context.node, packet);
        return this.handleInflightIntentState(context.node).then(function () {
            return {response: "ok"};
        });
    });

    //-----------------------------------------------------
    // Intent Types
    //-----------------------------------------------------
    IntentsApi.declareRoute({
        action: ["set", "delete"],
        resource: "/{major}/{minor}",
        filters: []
    }, function (packet, context, pathParams) {
        throw new api.error.NoPermissionError(packet);
    });

    IntentsApi.declareRoute({
        action: "get",
        resource: "/{major}/{minor}",
        filters: []
    }, function (packet, context, pathParams) {
        if (context.node) {
            // the following needs to be included, possibly via override of toPacket();
            //'invokeIntent': childNode
            return context.node.toPacket();
        } else {
            return {
                response: "ok",
                entity: {
                    "type": pathParams.major + "/" + pathParams.minor,
                    "actions": this.matchingNodes(packet.resource).map(function (n) {
                        return n.entity.action;
                    })
                }
            };
        }
    });

    //-----------------------------------------------------
    // Intent Definitions
    //-----------------------------------------------------
    IntentsApi.declareRoute({
        action: "register",
        resource: "/{major}/{minor}/{action}",
        filters: registerDefinitionFilter()
    }, function (packet, context, pathParams) {

        var childNode = this.createNode({
            'resource': this.createKey(context.node.resource + "/"),
            'src': packet.src
        }, api.intents.node.HandlerNode);
        childNode.set(packet);

        log.debug(this.logPrefix + " registered ", context.node);
        return {
            'response': 'ok',
            'entity': {
                'resource': childNode.resource
            }
        };
    });

    /**
     * A route for intent action invocations.
     * Will launch direct for user input if multiple options.
     */
    IntentsApi.declareRoute({
        action: "invoke",
        resource: "/{major}/{minor}/{action}",
        filters: api.filter.standard.getFilters()
    }, function (packet, context, pathParams) {
        return this.invokeIntentHandler(
            packet,
            pathParams.major + "/" + pathParams.minor,
            pathParams.action,
            this.matchingNodes(context.node.pattern),
            context.node.pattern
        );
    });

    IntentsApi.declareRoute({
        action: "broadcast",
        resource: "/{major}/{minor}/{action}",
        filters: api.filter.standard.getFilters()
    }, function (packet, context, pathParams) {
        for (var i  in context.node.collection) {
            this.invokeIntentHandler(
                packet,
                pathParams.major + "/" + pathParams.minor,
                pathParams.action,
                this.matchingNodes(context.node.collection[i]),
                context.node.collection[i]
            );
        }

        return {
            response: "pending",
            entity: {
                handlers: context.node.collection
            }
        };
    });

    //-----------------------------------------------------
    // Intent Handlers
    //-----------------------------------------------------
    IntentsApi.declareRoute({
        action: "invoke",
        resource: "/{major}/{minor}/{action}/{handlerId}",
        filters: []
    }, function (packet, context, pathParams) {
        return this.invokeIntentHandler(
            packet,
            pathParams.major + "/" + pathParams.minor,
            pathParams.action,
            context.node,
            undefined
        );
    });

    IntentsApi.declareRoute({
        action: "set",
        resource: "/{major}/{minor}/{action}/{handlerId}",
        filters: api.filter.standard.setFilters(api.intents.HandlerNode)
    }, function (packet, context, pathParams) {
        context.node.set(packet);
        return {"response": "ok"};
    });

    /**
     * Registration handler when a handlerId is specified
     */
    IntentsApi.declareRoute({
        action: "register",
        resource: "/{major}/{minor}/{action}/{handlerId}",
        filters: registerHandlerFilter()
    }, function (packet, context, pathParams) {
        var childNode = this.createNode({
            'resource': packet.resource,
            'src': packet.src
        }, api.intents.node.HandlerNode);
        childNode.set(packet);

        log.debug(this.logPrefix + " registered ", context.node);
        return {
            'response': 'ok',
            'entity': {
                'resource': childNode.resource
            }
        };
    });

    return IntentsApi;
}(ozpIwc.api, ozpIwc.api.intents.Api || {}, ozpIwc.log));

var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.names = ozpIwc.api.names || {};

/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.names
 */

ozpIwc.api.names.Api = (function (api, apiMap, log, ozpConfig, util) {
    /**
     * The Names Api. Collects information about current IWC state, Manages names, aliases, and permissions through the
     * IWC. Subclasses the {{#crossLink "ozpIwc.api.base.Api"}}{{/crossLink}}.
     *
     * @class Api
     * @namespace ozpIwc.api.names
     * @extends ozpIwc.api.base.Api
     * @constructor
     * @param {Object} config
     * @param {String} [config.name="names.api"]
     * @param {ozpIwc.transport.Router} config.router
     */
    var Api = api.createApi("names.api", function (config) {
        this.contentTypeMappings = util.genContentTypeMappings(api.names.node);
        for (var key in apiMap) {
            var apiObj = apiMap[key];
            var resourceName = '/api/' + apiObj.address;
            this.data[resourceName] = new api.base.Node({
                resource: resourceName,
                entity: {'actions': apiObj.actions},
                contentType: 'application/vnd.ozp-iwc-api-v1+json'
            });
        }
    });

//--------------------------------------------------
// Distributed Computing: Mutex lock on handling API requests/holding active state
//--------------------------------------------------

    /**
     * Called when the API begins operation as leader. Registers interval checks on nodes for non-responsiveness.
     * @method onStart
     */
    Api.prototype.onStart = function () {
        var self = this;
        setInterval(function () {self.checkForNonresponsives();}, ozpConfig.heartBeatFrequency);
    };

//--------------------------------------------------
// Bus event handlers
//--------------------------------------------------
    /**
     * A handler for the names Api receiving notification of a disconnection from the bus. Calls the base Api
     * handler then the names API will check all nodes based on the router ID (portion of address after ".") and remove
     * all records pertaining to that router (all connections closed).
     *
     * @method onClientDisconnect
     * @param {String} address
     */
    Api.prototype.onClientDisconnect = function (address) {
        api.base.Api.prototype.onClientDisconnect.apply(this, arguments);
        var len = address.length;
        var self = this;
        util.object.eachEntry(this.data, function (k, v) {
            if (k.substr(-len) === address) {
                self.markForChange(v);
                v.markAsDeleted();
            }
        });
    };

//--------------------------------------------------
// Node creation/modification methods
//--------------------------------------------------

    /**
     * Names API resources are not loaded from server, thus use the default IWC Node structure by default.
     * @override
     * @method createNodeObject
     * @param {type} config
     * @return {ozpIwc.api.base.Node}
     */
    Api.prototype.createNodeObject = function (config, NodeType) {
        if (NodeType) {
            return new NodeType(config);
        } else {
            return new api.base.Node(config);
        }
    };

    /**
     * Cycles through all /address/{address} resources and disconnects them from the bus if they have not responded in
     * the last 2 heartbeats.
     *
     * @method checkForNonresponsives
     */
    Api.prototype.checkForNonresponsives = function () {
        var self = this;
        this.matchingNodes("/address").forEach(function (node) {
            var delta = util.now() - node.entity.time;

            if (delta > 3 * ozpConfig.heartBeatFrequency) {
                log.log("[" + node.resource + "] [Removing] Time since update:", util.now() - node.entity.time);
                self.participant.send({
                    "dst": "$bus.multicast",
                    "action": "disconnect",
                    "entity": node.entity
                });
                node.markAsDeleted();
            }
        });
    };

    return Api;
}(ozpIwc.api, ozpIwc.apiMap, ozpIwc.log, ozpIwc.config, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.names = ozpIwc.api.names || {};

/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.names
 */

ozpIwc.api.names.Node = (function (api, util) {

    /**
     * Names Node. Inherits Base Node.
     * @class Node
     * @namespace ozpIwc.api.names
     * @extends ozpIwc.api.base.Node
     * @constructor
     */
    var Node = util.extend(api.base.Node, function (config) {
        // Take the supplied data for anything that matches in the super class,
        // such as resource.
        api.base.Node.apply(this, arguments);

        /**
         * @property lifespan
         * @type {ozpIwc.api.Lifespan.Bound}
         */
        this.lifespan = new api.Lifespan.Bound({
            'addresses': [config.src]
        });

        /**
         * @property entity
         * @type {Object}
         */
        this.entity = config.entity || {};

    });

    return Node;
}(ozpIwc.api, ozpIwc.util));
var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.names = ozpIwc.api.names || {};
/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.names
 * @class ozpIwc.api.names.Api
 */

ozpIwc.api.names.Api = (function (api, NamesApi) {

//---------------------------------------------------------
// Default Routes
//---------------------------------------------------------
    // Default handlers are fine for list, bulkGet, watch, and unwatch with any properly formed resource
    NamesApi.useDefaultRoute(["list", "bulkGet"], "{c:/}");
    NamesApi.useDefaultRoute(["list", "bulkGet"], "{c:/(?:api|address|multicast|router).*}");
    NamesApi.useDefaultRoute(["get", "delete", "watch", "unwatch"], "/api/{addr}");
    NamesApi.useDefaultRoute(["get", "delete", "watch", "unwatch"], "/address/{addr}");
    NamesApi.useDefaultRoute(["get", "delete", "watch", "unwatch"], "/multicast/{group}");
    NamesApi.useDefaultRoute(["get", "delete", "watch", "unwatch"], "/multicast/{group}/{memberAddr}");
    NamesApi.useDefaultRoute(["get", "delete", "watch", "unwatch"], "/router/{addr}");

//---------------------------------------------------------
// Routes
//---------------------------------------------------------
    //-----------------------------------------------------
    // Address, Multicast, and Router resources
    //-----------------------------------------------------
    NamesApi.declareRoute({
        action: ["set", "delete"],
        resource: "/{collection:api|address|multicast|router}",
        filters: []
    }, function (packet, context, pathParams) {
        throw new api.error.NoPermissionError(packet);
    });

    NamesApi.declareRoute({
        action: "get",
        resource: "/{collection:api|address|multicast|router}",
        filters: []
    }, function (packet, context, pathParams) {
        return {
            "contentType": "application/json",
            "entity": this.matchingNodes(packet.resource).map(function (node) {
                return node.resource;
            })
        };
    });
    //-----------------------------------------------------
    // Api resources
    //-----------------------------------------------------
    NamesApi.declareRoute({
        action: "set",
        resource: "/api/{addr}",
        filters: api.filter.standard.setFilters(api.base.Node, "application/vnd.ozp-iwc-api-v1+json")
    }, function (packet, context, pathParams) {
        // validate that the entity is an address
        context.node.set(packet);
        return {response: "ok"};
    });

    //-----------------------------------------------------
    // Address resources
    //-----------------------------------------------------
    NamesApi.declareRoute({
        action: "set",
        resource: "/address/{addr}",
        filters: api.filter.standard.setFilters(api.names.Node, "application/vnd.ozp-iwc-address-v1+json")
    }, function (packet, context, pathParams) {
        // validate that the entity is an address
        context.node.set(packet);
        return {response: "ok"};
    });

    //-----------------------------------------------------
    // Multicast resources
    //-----------------------------------------------------
    NamesApi.declareRoute({
        action: "set",
        resource: "/multicast/{addr}",
        filters: api.filter.standard.setFilters(api.base.Node, "application/vnd.ozp-iwc-multicast-address-v1+json")
    }, function (packet, context, pathParams) {
        // validate that the entity is an address
        context.node.set(packet);
        return {response: "ok"};
    });

    NamesApi.declareRoute({
        action: "set",
        resource: "/multicast/{group}/{member}",
        filters: api.filter.standard.setFilters(api.names.Node, "application/vnd.ozp-iwc-multicast-address-v1+json")
    }, function (packet, context, pathParams) {
        // validate that the entity is an address
        context.node.set(packet);
        return {response: "ok"};
    });

    //-----------------------------------------------------
    // Router resources
    //-----------------------------------------------------
    NamesApi.declareRoute({
        action: "set",
        resource: "/router/{addr}",
        filters: api.filter.standard.setFilters(api.names.Node, "application/vnd.ozp-iwc-router-v1+json")
    }, function (packet, context, pathParams) {
        // validate that the entity is an address

        //
        context.node.set(packet);
        return {response: "ok"};
    });
    return NamesApi;
}(ozpIwc.api, ozpIwc.api.names.Api || {}));
var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.system = ozpIwc.api.system || {};

/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.system
 */

ozpIwc.api.system.Api = (function (api, log, ozpConfig, util) {
    /**
     * The System Api. Provides reference data of registered applications, versions, and information about the current
     * user through the IWC. Subclasses the {{#crossLink "ozpIwc.api.base.Api"}}{{/crossLink}}.
     *
     * @class Api
     * @namespace ozpIwc.api.system
     * @extends ozpIwc.api.base.Api
     * @constructor
     * @param {Object} config
     * @param {String} [config.name="system.api"]
     * @param {ozpIwc.transport.Router} config.router
     */
    var Api = api.createApi("system.api", function (config) {
        // The stock initializeData should do fine for us here as we're not using
        // any special subclasses for these items.  Might have to revisit this at
        // some point.
        /**
         * @property endpoints
         * @type {Object[]}
         */
        this.endpoints = config.endpoints || [
                {link: ozpConfig.linkRelPrefix + ":user", headers: []},
                {link: ozpConfig.linkRelPrefix + ":system", headers: []},
                {link: ozpConfig.linkRelPrefix + ":application", headers: []}
            ];

        this.contentTypeMappings = util.genContentTypeMappings(api.system.node);
        this.on("createdNode", this.updateIntents, this);
    });

//--------------------------------------------------
// Distributed Computing: Mutex lock on handling API requests/holding active state
//--------------------------------------------------

    /**
     * Called when the API begins operation as leader. Registers launching intent if not running in a worker.
     * @method onStart
     */
    Api.prototype.onStart = function () {
        //The system API cant launch applications directly from a worker, ozpIwc.Client's register in that case.
        if (!util.runningInWorker) {
            log.debug("System.api registering for the launch intent");
            var registerData = {
                'lifespan': "ephemeral",
                'entity': {
                    'type': "application/vnd.ozp-iwc-launch-data-v1+json",
                    'action': "run",
                    'label': "Open in new tab",
                    'invokeIntent': {
                        'dst': "system.api",
                        'action': 'invoke',
                        'resource': "/launchNewWindow"
                    }
                }
            };
            return this.participant.intents().register("/application/vnd.ozp-iwc-launch-data-v1+json/run/system.api",
                registerData).catch(function (error) {
                    log.error("System.api failed to register for launch intent: ", error);
                });
        }
    };


//--------------------------------------------------
// Node creation/modification methods
//--------------------------------------------------
    /**
     * Maps a content-type to an IWC System Node type.
     * @method findNodeType
     * @param {Object} contentTypeObj an object-formatted content-type
     * @param {String} contentTypeObj.name the content-type without any variables
     * @param {Number} [contentTypeObj.version] the version of the content-type.
     * @returns {undefined}
     */
    Api.prototype.findNodeType = function (contentType) {
        var formattedContentType = util.getFormattedContentType(contentType);
        var type = this.contentTypeMappings[formattedContentType.name];
        if (type) {
            if (formattedContentType.version) {
                return type[formattedContentType.version];
            } else {
                return type;
            }
        }
    };

    /**
     * Override the default node type to be a System Node.
     * @override
     * @method createNodeObject
     * @param {type} config
     * @param {Function} NodeType
     * @return {ozpIwc.api.system.Node}
     */
    Api.prototype.createNodeObject = function (config, NodeType) {
        if (NodeType) {
            return new NodeType(config);
        }
    };

    /**
     * Updates intents API registrations for the given system api application.
     * @method updateIntents
     * @param {Object} node
     * @return {Promise}
     */
    Api.prototype.updateIntents = function (node) {
        if (!node.entity || !node.entity.intents) {
            return;
        }
        var packets = [];

        // build out the messages for intent registrations but don't send, we are sending in bulk.
        node.entity.intents.forEach(function (i) {
            var icon = i.icon || (node.entity && node.entity.icons && node.entity.icons.small) ? node.entity.icons.small : '';
            var label = i.label || node.entity.name;
            var resource = "/" + i.type + "/" + i.action + "/system.api" + node.resource.replace(/\//g, '.');
            var payload = {
                'lifespan': "ephemeral",
                'entity': {
                    'type': i.type,
                    'action': i.action,
                    'icon': icon,
                    'label': label,
                    '_links': node.entity._links,
                    'invokeIntent': {
                        'action': 'launch',
                        'dst': 'system.api',
                        'resource': node.resource
                    }
                }
            };

            packets.push(this.participant.intents().messageBuilder.register(resource, payload));
        }, this);

        //Send out all intent messages in bulk
        return this.participant.intents().bulkSend(packets).then(function (response) {
            // After getting the ok on the bulk message, wait for each individual message to resolve
            return Promise.all(packets);
        });

    };


    return Api;
}(ozpIwc.api, ozpIwc.log, ozpIwc.config, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.system = ozpIwc.api.system || {};
ozpIwc.api.system.node = ozpIwc.api.system.node || {};

/**
 * @module ozpIwc.api.system
 * @submodule ozpIwc.api.system.node
 */


ozpIwc.api.system.node.ApplicationNode = (function (api, util) {
    /**
     * @class ApplicationNode
     * @namespace ozpIwc.api.system.node
     * @extends ozpIwc.api.base.Node
     * @constructor
     */
    var Node = util.extend(api.base.Node, function (config) {
        api.base.Node.apply(this, arguments);
    });

    /**
     * The content type of the data returned by serialize()
     * @Property {string} serializedContentType
     */
    Node.serializedContentType = "application/vnd.ozp-application-v1+json";

    /**
     * Sets the api node from the serialized form.
     *
     *
     * @method deserializedEntity
     * @param {Object} data
     */
    Node.prototype.deserializedEntity = function (data) {
        var blacklist = ["_embedded", "_links"];
        var entity = {};
        for (var i in data) {
            if (data.hasOwnProperty(i) && blacklist.indexOf(i) === -1) {
                entity[i] = data[i];
            }
        }
        return entity;
    };

    /**
     * If a resource path isn't given, this takes the best guess at assigning it.
     * @override
     * @method resourceFallback
     * @param serializedForm
     * @return String
     */
    Node.prototype.resourceFallback = function (serializedForm) {
        /*jshint camelcase: false */
        if (serializedForm.unique_name) {
            return "/application/" + serializedForm.unique_name;
        } else if (serializedForm.id) {
            return "/application/" + serializedForm.id;
        }
    };

    return Node;
}(ozpIwc.api, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.system = ozpIwc.api.system || {};
ozpIwc.api.system.node = ozpIwc.api.system.node || {};


/**
 * @module ozpIwc.api.system
 * @submodule ozpIwc.api.system.node
 */


ozpIwc.api.system.node.ApplicationNodeV2 = (function (api, util) {
    /**
     * @class ApplicationNodeV2
     * @namespace ozpIwc.api.system.node
     * @extends ozpIwc.api.base.Node
     * @constructor
     */
    var Node = util.extend(api.system.node.ApplicationNode, function (config) {
        api.system.node.ApplicationNode.apply(this, arguments);
    });

    /**
     * The content type of the data returned by serialize()
     * @Property {string} serializedContentType
     */
    Node.serializedContentType = "application/vnd.ozp-iwc-application+json;version=2";

    /**
     * Sets the api node from the serialized form.
     *
     * @method deserializedEntity
     * @param {Object} data
     */
    Node.prototype.deserializedEntity = function (data) {
        /*jshint camelcase: false */
        data = data || {};
        data.small_icon = data.small_icon || {};
        return {
            id: data.id,
            name: data.title,
            launchUrls: {
                default: data.launch_url
            },
            icons: {
                small: data.small_icon.url
            },
            intents: util.ensureArray(data.intents)
        };
    };

    return Node;
}(ozpIwc.api, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.system = ozpIwc.api.system || {};
ozpIwc.api.system.node = ozpIwc.api.system.node || {};

/**
 * @module ozpIwc.api.system
 * @submodule ozpIwc.api.system.node
 */


ozpIwc.api.system.node.SystemNode = (function (api, util) {
    /**
     * @class SystemNode
     * @namespace ozpIwc.api.system.node
     * @extends ozpIwc.api.base.Node
     * @constructor
     */
    var Node = util.extend(api.base.Node, function (config) {
        api.base.Node.apply(this, arguments);
    });


    /**
     * The content type of the data returned by serialize()
     * @Property {string} serializedContentType
     */
    Node.serializedContentType = "application/vnd.ozp-iwc-system-v1+json";

    /**
     * Sets the api node from the serialized form.
     *
     * @method deserializedEntity
     * @param {Object} data
     */
    Node.prototype.deserializedEntity = function (data) {
        /*jshint camelcase: false */
        data = data || {};

        return {
            name: data.name,
            version: data.version
        };
    };

    /**
     * If a resource path isn't given, this takes the best guess at assigning it.
     * @override
     * @method resourceFallback
     * @return String
     */
    Node.prototype.resourceFallback = function () {
        return "/system";
    };

    return Node;
}(ozpIwc.api, ozpIwc.util));
var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.system = ozpIwc.api.system || {};
ozpIwc.api.system.node = ozpIwc.api.system.node || {};

/**
 * @module ozpIwc.api.system
 * @submodule ozpIwc.api.system.node
 */


ozpIwc.api.system.node.SystemNodeV2 = (function (api, util) {
    /**
     * The same schema as SystemNode, but content type naming scheme changed.
     * @class UserNodeV2
     * @namespace ozpIwc.api.system.node
     * @extends ozpIwc.api.system.node.SystemNode
     * @constructor
     */
    var Node = util.extend(api.system.node.SystemNode, function (config) {
        api.system.node.SystemNode.apply(this, arguments);
    });


    /**
     * The content type of the data returned by serialize()
     * @Property {string} serializedContentType
     */
    Node.serializedContentType = "application/vnd.ozp-iwc-system+json;version=2";

    return Node;
}(ozpIwc.api, ozpIwc.util));
var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.system = ozpIwc.api.system || {};
ozpIwc.api.system.node = ozpIwc.api.system.node || {};

/**
 * @module ozpIwc.api.system
 * @submodule ozpIwc.api.system.node
 */


ozpIwc.api.system.node.UserNode = (function (api, util) {
    /**
     * @class UserNode
     * @namespace ozpIwc.api.system.node
     * @extends ozpIwc.api.base.Node
     * @constructor
     */
    var Node = util.extend(api.base.Node, function (config) {
        api.base.Node.apply(this, arguments);
    });


    /**
     * The content type of the data returned by serialize()
     * @Property {string} serializedContentType
     */
    Node.serializedContentType = "application/vnd.ozp-profile-v1+json";

    /**
     * Sets the api node from the serialized form.
     *
     * @method deserializedEntity
     * @param {Object} data
     */
    Node.prototype.deserializedEntity = function (data) {
        /*jshint camelcase: false */
        data = data || {};

        return {
            displayName: data.displayName,
            id: data.id,
            username: data.username
        };
    };

    /**
     * If a resource path isn't given, this takes the best guess at assigning it.
     * @override
     * @method resourceFallback
     * @return String
     */
    Node.prototype.resourceFallback = function () {
        return "/user";
    };

    return Node;
}(ozpIwc.api, ozpIwc.util));
var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.system = ozpIwc.api.system || {};
ozpIwc.api.system.node = ozpIwc.api.system.node || {};

/**
 * @module ozpIwc.api.system
 * @submodule ozpIwc.api.system.node
 */


ozpIwc.api.system.node.UserNodeV2 = (function (api, util) {
    /**
     * The same schema as UserNode, but content type naming scheme changed.
     * @class UserNodeV2
     * @namespace ozpIwc.api.system.node
     * @extends ozpIwc.api.system.node.UserNode
     * @constructor
     */
    var Node = util.extend(api.system.node.UserNode, function (config) {
        api.system.node.UserNode.apply(this, arguments);
    });


    /**
     * The content type of the data returned by serialize()
     * @Property {string} serializedContentType
     */
    Node.serializedContentType = "application/vnd.ozp-iwc-user+json;version=2";

    /**
     * Sets the api node from the serialized form.
     *
     * @method deserializedEntity
     * @param {Object} data
     */
    Node.prototype.deserializedEntity = function (data) {
        /*jshint camelcase: false */
        data = data || {};

        return {
            displayName: data.display_name,
            id: data.id,
            username: data.username
        };
    };
    return Node;
}(ozpIwc.api, ozpIwc.util));
var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.system = ozpIwc.api.system || {};
/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.system
 * @class ozpIwc.api.system.Api
 */

ozpIwc.api.system.Api = (function (api, SystemApi, log, ozpConfig, util) {

//---------------------------------------------------------
// Default Routes
//---------------------------------------------------------
    SystemApi.useDefaultRoute(["bulkGet", "list"]);
    SystemApi.useDefaultRoute(["get", "watch", "unwatch"], "/user");
    SystemApi.useDefaultRoute(["get", "watch", "unwatch"], "/system");
    SystemApi.useDefaultRoute(["get", "watch", "unwatch"], "/application/{id}");
//---------------------------------------------------------
// Routes
//---------------------------------------------------------

    //-----------------------------------------------------
    // application collection
    //-----------------------------------------------------
    SystemApi.declareRoute({
        action: "get",
        resource: "/{collection:application}",
        filters: []
    }, function (packet, context, pathParams) {
        return {
            "contentType": "application/json",
            "entity": this.matchingNodes(packet.resource).map(function (node) {
                return node.resource;
            })
        };
    });

    //-----------------------------------------------------
    // user resource
    //-----------------------------------------------------
    SystemApi.declareRoute({
        action: ["set", "delete"],
        resource: "/user",
        filters: []
    }, function (packet, context, pathParams) {
        throw new api.error.BadActionError(packet);
    });

    //-----------------------------------------------------
    // system resource
    //-----------------------------------------------------
    SystemApi.declareRoute({
        action: ["set", "delete"],
        resource: "/system",
        filters: []
    }, function (packet, context, pathParams) {
        throw new api.error.BadActionError(packet);
    });

    //-----------------------------------------------------
    // application listing resources
    //-----------------------------------------------------
    SystemApi.declareRoute({
        action: ["set", "delete"],
        resource: "/application/{id}",
        filters: []
    }, function (packet, context, pathParams) {
        throw new api.error.BadActionError(packet);
    });

    SystemApi.declareRoute({
        action: ["launch"],
        resource: "/application/{id}",
        filters: api.filter.standard.getFilters()
    }, function (packet, context, pathParams) {
        log.debug(this.logPrefix + " launching ", packet.entity);
        var entity = {
            "url": context.node.entity.launchUrls.default,
            "applicationId": context.node.resource,
            "launchData": packet.entity,
            "id": context.node.entity.id
        };
        var resource = "/application/vnd.ozp-iwc-launch-data-v1+json/run";

        if (util.runningInWorker) {
            resource += "/";

            //if this is launching a routed intent make the source of the intent invoke open it.
            if (packet.entity && packet.entity.inFlightIntent && packet.entity.inFlightIntent.entity &&
                packet.entity.inFlightIntent.entity.invokePacket &&
                packet.entity.inFlightIntent.entity.invokePacket.src) {
                resource += packet.entity.inFlightIntent.entity.invokePacket.src;
            } else {
                resource += packet.src;
            }
        }

        this.participant.send({
            dst: "intents.api",
            action: "invoke",
            resource: resource,
            entity: entity
        });
        return {response: "ok"};
    });

    SystemApi.declareRoute({
        action: ["invoke"],
        resource: "/launchNewWindow",
        filters: []
    }, function (packet, context, pathParams) {
        log.debug(this.logPrefix + " handling launch data ", packet.entity);
        if (packet.entity && packet.entity.inFlightIntent) {
            util.openWindow(packet.entity.inFlightIntent.entity.entity.url, {
                "ozpIwc.peer": ozpConfig._busRoot,
                "ozpIwc.inFlightIntent": packet.entity.inFlightIntent.resource
            });
            return {'response': "ok"};
        } else {
            return {'response': "badResource"};
        }

    });

    return SystemApi;
}(ozpIwc.api, ozpIwc.api.system.Api || {}, ozpIwc.log, ozpIwc.config, ozpIwc.util));

/**
 * If backend support is disabled the following functionality changes:
 *
 * - API endpoint communication is removed //@TODO stub in Promise resolutions
 * - API endpoints are removed
 *
 */
if (!ozpIwc.config.backendSupport) {
    /**
     * APIs that use endpoints do a check on their endpoint property to go out and gather.
     * If set to an empty array the endpoints will not be gathered.
     *
     * @namespace ozpIwc
     * @property endpointConfig
     * @private
     * @type Object
     */
    ozpIwc.endpointConfig = {
        'dataApi': [],
        'systemApi': [],
        'intentsApi': []
    };
}

/**
 * If legacy applications are supported (OWF 7) the following functionality changes:
 *
 * - Structured Clone Support is removed.
 *
 */
if (ozpIwc.config.legacySupport) {
    ozpIwc.util.structuredCloneSupport = function () {
        return false;
    };
}

/**
 * baseInit.js contains any bus component instantiation that does not have a configuration flag that can toggle
 * behavior. defaultWiring.js follows baseInit.js in load order.
 */
var ozpIwc = ozpIwc || {};
ozpIwc.wiring = (function (config, wiring, log) {
    // Configure logging, take precedence of query param over config param.
    var params = ozpIwc.util.parseQueryParams();

    log.setThreshold(ozpIwc.config.logLevel);
    if (params.log) {
        try {
            console.log("Setting log level to ", params.log);
            log.setThreshold(ozpIwc.log[params.log.toUpperCase()]);
        } catch (e) {
            // just ignore it and leave the default level
        }
    }

    // Initialize metrics
    wiring.metrics = new ozpIwc.metric.Registry();

    // Initialize authorization
    wiring.authorization = new ozpIwc.policyAuth.points.PDP({
        'pip': new ozpIwc.policyAuth.points.PIP(),
        'prp': new ozpIwc.policyAuth.points.PRP(),
        'setsEndpoint': config.policyRootUrl
    });

    wiring.ajaxQueue = new ozpIwc.util.AjaxPersistenceQueue({
        poolSize: config.ajaxPoolSize
    });

    return wiring;

})(ozpIwc.config, ozpIwc.wiring || {}, ozpIwc.log);
var ozpIwc = ozpIwc || {};
ozpIwc.wiring = ozpIwc.wiring || {};
/**
 * @module ozpIwc
 */

/**
 * The instantiated wiring for the IWC bus.
 * @class wiring
 * @static
 * @namespace ozpIwc
 */
ozpIwc.wiring = (function (wiring, api, transport, network, config, util) {
    // Instantiate default wiring if not in integration test mode (default false)
    if (!config._testMode) {
        var markReady = function () {};
        var busInit = function () {markReady();};

        wiring.endpointInitPromise = api.initEndpoints({
            apiRoot: config.apiRootUrl,
            ajaxQueue: wiring.ajaxQueue,
            templates: config.templates
        });
        wiring.peer = new network.Peer({
            metrics: wiring.metrics
        });

        //Dont use localStorage if using a Shared Web Worker
        if (!util.runningInWorker) {
            wiring.link = new network.KeyBroadcastLocalStorageLink({
                metrics: wiring.metrics,
                peer: wiring.peer
            });
        }

        wiring.router = new transport.Router({
            authorization: wiring.authorization,
            metrics: wiring.metrics,
            peer: wiring.peer,
            heartbeatFrequency: config.heartBeatFrequency
        });

        // Enable post message participants (default true)
        if (config.allowLocalClients) {
            wiring.listeners = wiring.listeners || {};
            if (!util.runningInWorker) {
                wiring.listeners.postMessage = new transport.listener.PostMessage({
                    authorization: wiring.authorization,
                    router: wiring.router,
                    ready: new Promise(function (resolve) {
                        markReady = resolve;
                    })
                });
            } else {
                wiring.listeners.sharedWorker = new transport.listener.SharedWorker({
                    authorization: wiring.authorization,
                    router: wiring.router,
                    ready: new Promise(function (resolve) {
                        markReady = resolve;
                    })
                });
            }
        }

        // Configure APIs post prerender (default true)
        if (config.runApis) {
            busInit = function () {
                ozpIwc.endpointConfig = ozpIwc.endpointConfig || {};
                wiring.apis = wiring.apis || {};
                wiring.apis.locks = new api.locks.Api({
                    'authorization': wiring.authorization,
                    'router': wiring.router
                });
                wiring.apis.names = new api.names.Api({
                    'authorization': wiring.authorization,
                    'router': wiring.router
                });
                wiring.apis.data = new api.data.Api({
                    'authorization': wiring.authorization,
                    'endpoints': ozpIwc.endpointConfig.dataApi,
                    'router': wiring.router,
                    'ajaxQueue': wiring.ajaxQueue
                });
                wiring.apis.intents = new api.intents.Api({
                    'authorization': wiring.authorization,
                    'endpoints': ozpIwc.endpointConfig.intentsApi,
                    'router': wiring.router,
                    'ajaxQueue': wiring.ajaxQueue
                });
                wiring.apis.system = new api.system.Api({
                    'authorization': wiring.authorization,
                    'endpoints': ozpIwc.endpointConfig.systemApi,
                    'router': wiring.router,
                    'ajaxQueue': wiring.ajaxQueue
                });

                markReady();
            };
        }

        ozpIwc.util.prerender().then(busInit);
    }

    return wiring;
})(ozpIwc.wiring, ozpIwc.api, ozpIwc.transport, ozpIwc.network, ozpIwc.config, ozpIwc.util);

//# sourceMappingURL=ozpIwc-bus.js.map