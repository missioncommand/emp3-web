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



var ozpIwc = ozpIwc || {};

/**
 * @module ozpIwc
 */

ozpIwc.Client = (function (util) {

    /**
     * This class will be heavily modified in the future.
     * @class Client
     * @namespace ozpIwc
     * @constructor
     * @uses ozpIwc.util.ApiPromiseMixin
     * @todo accept a list of peer URLs that are searched in order of preference
     * @param {Object} config
     * @param {String} config.peerUrl - Base URL of the peer server
     * @param {Object} config.params - Parameters that will be passed to the bus.
     * @param {String} config.params.log - The IWC bus logging level.  One of "NONE","DEFAULT","ERROR","INFO","DEBUG",
     *     or "ALL"
     * @param {Boolean} [config.autoConnect=true] - Whether to automatically find and connect to a peer
     */
    var Client = function (peerUrl, config) {

        var formattedConfig = formatConfig(peerUrl, config);

        if (formattedConfig.enhancedTimers) {
            util.enabledEnhancedTimers();
        }
        this.type = formattedConfig.type || "default";

        var self = this;
        util.addEventListener('beforeunload', function () {
            self.disconnect();
        });
        genPeerUrlCheck(this, formattedConfig.peerUrl);
        util.ApiPromiseMixin(this, formattedConfig.autoConnect);

        if (util.globalScope.SharedWorker) {
            registerIntentHandlers(this);
        }
    };

    //----------------------------------------------------------
    // Private Properties
    //----------------------------------------------------------
    //

    /**
     * Takes in the various Client parameter options
     * ([string]),([object]),(string,[object]) and formats the config.
     * This is done to not break semver and force updated Client code.
     * @method formatConfig
     * @private
     * @static
     * @param  {[String|Object]} param1 Either the peer url to connect to ,the
     *                                    config object, or undefined to use
     *                                    default connection
     * @param  {[Object]} param2  If peer url string provided in param1, param2
     *                             is the optional config object. If param1 is the
     *                             config object param2 is ignored
     * @return {Object}         Formatted config object
     */
    var formatConfig = function(param1, param2){
        var newConfig = {};
        if(typeof param2 === "object"){
            newConfig = param2;
        }

        if(typeof param1 === "object"){
            //If the legacy style of config
            newConfig = param1;
            newConfig.peerUrl = newConfig.peerUrl || util.scriptDomain;
        } else if(typeof param1 === "string") {
            // let the config object override the string url
            newConfig.peerUrl = newConfig.peerUrl || param1;
        } else {
            // default to assigning script's domain as IWC domain.
            newConfig.peerUrl = util.scriptDomain;
        }
        return newConfig;
    };
    /**
     * A utility method for handshaking the client's connection to the bus.
     * Resolves an external promise.
     * @method initPing
     * @private
     * @static
     * @param {Client} client
     * @param {Promise.resolve} resolve
     * @param {Promise.rej} reject
     */
    var initPing = function (client, resolve, reject) {
        client.send({dst: "$transport", type: client.type}).then(function (response) {
            resolve(response);
        }).catch(function (err) {
            reject(err);
        });
    };

    /**
     * A handler function generator. Creates the post message event "message" handler for the client for its Iframe.
     * Requires an external promise resolve/reject reference to call when the client's postMessage handler has connected
     * to the bus.
     *
     * @method genPostMessageHandler
     * @private
     * @static
     * @param {Client} client
     * @param {Promise.resolve} resolve
     * @param {Promise.rej} reject
     * @returns {Function}
     */
    var genPostMessageHandler = function (client, resolve, reject) {

        return function (event) {
            if (!client.peer || event.origin !== client.peerOrigin || event.source !== client.peer) {
                return;
            }
            try {
                var message = event.data;
                if (typeof(message) === 'string') {
                    message = JSON.parse(event.data);
                }
                // Calls APIPromiseMixin receive handler
                if (message.iwcInit && client.address === "$nobody") {
                    if(message.error) {
                        reject(message.error);
                    } else {
                        initPing(client, resolve, reject);
                    }
                } else {
                    client.receiveFromRouterImpl(message);
                    client.receivedBytes += (event.data.length * 2);
                    client.receivedPackets++;
                }
            } catch (e) {
                // ignore!
            }
        };
    };

    /**
     * Generates the Iframe for the client for IWC bus-domain communication.
     * Due to race condition issues with Chrome, this is an asynchronous task with a slight delay to prevent
     * broken bus connections with Chrome/SharedWorker.
     *
     * @method createIframeShim
     * @private
     * @static
     * @properties {Client} client
     */
    var createIframeShim = function (client, resolve, reject) {

        client.postMessageHandler = genPostMessageHandler(client, resolve, reject);
        util.addEventListener("message", client.postMessageHandler);

        setTimeout(function () {
            client.iframe = document.createElement("iframe");
            var url = client.peerUrl + "/iframe_peer.html";
            if (client.launchParams.log) {
                url += "?log=" + client.launchParams.log;
            }
            if (client.type) {
                url += "?type=" + client.type;
            }
            client.iframe.src = url;
            client.iframe.height = 1;
            client.iframe.width = 1;
            client.iframe.setAttribute("area-hidden", true);
            client.iframe.setAttribute("hidden", true);
            client.iframe.style.setProperty("display", "none", "important");
            document.body.appendChild(client.iframe);
            client.peer = client.iframe.contentWindow;

            client.iframe.addEventListener("load", function () {
                initPing(client, resolve, reject);
            });
        }, 200);
    };

    /**
     * Generates the Peer URL checking logic based on the data type received.
     * @method genPeerUrlCheck
     * @private
     * @static
     * @param {Client} client
     * @param {String|Array|Function} configUrl the url(s) to connect the client on. If function, the output of the
     *                                   function will be used.
     */
    var genPeerUrlCheck = function (client, configUrl) {
        if (typeof(configUrl) === "string") {
            client.peerUrlCheck = function (url) {
                if (typeof url !== 'undefined') {
                    return url;
                } else {
                    return configUrl;
                }

            };
        } else if (Array.isArray(configUrl)) {
            client.peerUrlCheck = function (url) {
                if (configUrl.indexOf(url) >= 0) {
                    return url;
                }
                return configUrl[0];
            };
        } else if (typeof(configUrl) === "function") {
            /**
             * @property peerUrlCheck
             * @type String
             */
            client.peerUrlCheck = configUrl;
        } else {
            throw new Error("PeerUrl must be a string, array of strings, or function");
        }
    };

    /**
     * Meta-data for registration to function with SharedWorkers.
     * @private
     * @static
     * @property sharedWorkerRegistrationData
     * @type {{contentType: string, entity: {label: string}}}
     */
    var sharedWorkerRegistrationData = {
        entity: {
            label: 'SharedWorker\'s intent handler'
        }
    };

    /**
     * A utility method for Clients to register to handle application & intent-chooser launching.
     * @method registerIntentHandlers
     * @private
     * @static
     * @param {Client} client
     */
    var registerIntentHandlers = function (client) {
        client.connect().then(function () {
            //-----------------------------------------
            // Intent Chooser Opening Intent Handler
            //-----------------------------------------
            var sharedWorkerIntentChooser = function (data) {
                var cfg = data.entity.config || {};
                util.openWindow(client.peerUrl + "/" + cfg.intentsChooserUri, {
                    "ozpIwc.peer": client.peerUrl,
                    "ozpIwc.intentSelection": cfg.intentSelection
                }, cfg.intentChooserFeatures);
            };
            var intentChooserResource = '/inFlightIntent/chooser/choose/' + client.address;
            client.intents().register(intentChooserResource, sharedWorkerRegistrationData, sharedWorkerIntentChooser);

            //-----------------------------------------
            // Application Launching Intent Handler
            //-----------------------------------------
            var sharedWorkerLauncher = function (data, inFlightIntent) {
                var cfg = data.entity || {};
                util.openWindow(cfg.url, {
                    "ozpIwc.peer": client.peerUrl,
                    "ozpIwc.inFlightIntent": inFlightIntent.resource
                });
                return {intentIncomplete: true};
            };
            var launcherResource = '/application/vnd.ozp-iwc-launch-data-v1+json/run/' + client.address;
            client.intents().register(launcherResource, sharedWorkerRegistrationData, sharedWorkerLauncher);


            //-----------------------------------------
            // Application Highlight Intent Handler
            //-----------------------------------------
            var highlightHandler = function (data, inFlightIntent) {
                util.pulseWindow(client);
                util.pulseTitle(client);
            };
            var hilightResource = '/application/ozp-iwc/highlight/' + client.address;
            client.intents().register(hilightResource, sharedWorkerRegistrationData, highlightHandler);
        }).catch(function(err) {
            // Supress the error here, the application will get it from its
            // connect() call.
        });
    };

    //----------------------------------------------------------
    // Public Properties
    //----------------------------------------------------------

    /**
     * Disconnects the client from the IWC bus.
     *
     * @method disconnect
     */
    Client.prototype.disconnect = function () {
        var resolve, reject;
        var retPromise = new Promise(function (res, rej) {
            resolve = res;
            reject = rej;
        });
        if (this.iframe) {
            this.iframe.src = "about:blank";
            var self = this;
            setTimeout(function () {
                if(self.iframe.remove){
                    self.iframe.remove();
                }
                self.iframe = null;
                resolve();
            }, 0);
        } else {
            reject();
        }

        return retPromise;
    };

    /**
     * Connects the client from the IWC bus.
     * Fires: {{#crossLink "ozpIwc.Client/connected:event"}}{{/crossLink}}
     *
     * @method connect
     */
    Client.prototype.connect = function () {
        if (!this.connectPromise) {
            var self = this;

            /**
             * Promise to chain off of for client connection asynchronous actions.
             * @property connectPromise
             * @type Promise
             */
            this.connectPromise = util.prerender().then(function () {
                // now that we know the url to connect to, find a peer element
                // currently, this is only via creating an iframe.
                self.peerUrl = self.peerUrlCheck(self.launchParams.peer);
                self.peerOrigin = util.determineOrigin(self.peerUrl);
                return self.createIframePeer();
            }).then(function (message) {
                self.address = message.dst;
                return self.afterConnected();
            });
        }
        return this.connectPromise;
    };

    /**
     * Creates an invisible iFrame Peer for IWC bus communication. Resolves when iFrame communication has been
     * initialized.
     *
     * @method createIframePeer
     * @returns {Promise}
     */
    Client.prototype.createIframePeer = function () {
        var self = this;
        return new Promise(function (resolve, reject) {
            // start listening to the bus and ask for an address

            // need at least the body tag to be loaded, so wait until it's loaded
            if (document.readyState === 'complete') {
                createIframeShim(self, resolve, reject);
            } else {
                util.addEventListener("load", function () {
                    createIframeShim(self, resolve, reject);
                });
            }
        });
    };

    /**
     * Client to Bus sending implementation. Not to be used directly.
     * @private
     * @method sendImpl
     * @param {ozpIwc.TransportPacket} packet
     */
    Client.prototype.sendImpl = function (packet) {
        util.safePostMessage(this.peer, packet, '*');
    };

    /**
     * Gathers the launch data passed to the opened application. Launch data can be passed as a query parameter, inside
     * window.name, or inside window.hash as long as it's key is "launchData".
     *
     * Promise resolve with the launchData object.
     *
     * @method getLaunchData
     * @returns {Promise}
     */
    Client.prototype.getLaunchData = function () {
        var self = this;
        return this.connect().then(function () {
            return self.launchParams.launchData;
        });
    };

    return Client;
}(ozpIwc.util));

var ozpIwc = ozpIwc || {};

/**
 * @module ozpIwc
 */

ozpIwc.Debugger = (function (Client, util) {
    /**
     * A modified ozpIwc client for debugging purposes
     * @class Debugger
     * @namespace ozpIwc
     * @constructor
     * @extends ozpIwc.Client
     */
    var Debugger = util.extend(Client, function (config) {
        config.type = "debugger";
        Client.apply(this, arguments);
        var self = this;
        this.events.on('receive', function (packet) {
            switch (packet.resource) {
                case "traffic":
                    self.events.trigger('traffic', packet);
                    break;
                default:
                    break;
            }
        });
    });

    //----------------------------------------------------------------------
    // Private Properties
    //----------------------------------------------------------------------

    var sendSelf = function (dbg, packet, cb) {
        return dbg.connect().then(function () {
            packet.dst = dbg.address;
            return dbg.send(packet, cb);
        });
    };

    //----------------------------------------------------------------------
    // Public Properties
    //----------------------------------------------------------------------

    /**
     * Enables logging of packets on the IWC bus. Calls the callback with the packet that passed through the IWC.
     *
     * Promise resolves with the ID needed to stop logging with cancelLogTraffic
     * @method logTraffic
     * @param {Function} cb
     * @returns {Promise} a promise that will resolve with the log's unique ID string.
     */
    Debugger.prototype.logTraffic = function (cb) {
        if (!cb) {
            return Promise.reject();
        }

        var unwrap = function (reply) {
            if (reply.entity && reply.entity.packet) {
                cb(reply.entity.packet);
            }
        };

        return sendSelf(this, {
            resource: "traffic",
            action: "start"
        }, unwrap).then(function (response) {
            return response.replyTo;
        });
    };

    /**
     * Disables a registration for packet logging from the IWC Bus.
     * @method cancelLogTraffic
     * @param {String} msgId the ID resolved from the logTraffic request
     * @returns {Promise}
     */
    Debugger.prototype.cancelLogTraffic = function (msgId) {
        if (!msgId) {
            return Promise.reject();
        }

        return sendSelf(this, {
            resource: "traffic",
            action: "stop",
            entity: {
                msgId: msgId
            }
        });
    };

    /**
     * Gathers the API Endpoint map from the IWC Bus
     * @method getApiEndpoints
     * @returns {Promise} a promise that will resolve with array of api endpoint data.
     */
    Debugger.prototype.getApiEndpoints = function () {
        return sendSelf(this, {resource: "apis", action: "getEndpoints"}).then(function (response) {
            return response.entity;
        });
    };

    /**
     * Gathers a snapshot of the metrics registry on the IWC Bus
     * @method getMetrics
     * @returns {Promise} a promise that will resolve with an array of metrics
     */
    Debugger.prototype.getMetrics = function () {
        return sendSelf(this, {resource: "metrics", action: "getAll"}).then(function (response) {
            return response.entity;
        });
    };

    /**
     * Gathers a snapshot of the IWC Bus config settings
     * @method getConfig
     * @returns {Promise} a promise that will resolve with an object of configurations
     */
    Debugger.prototype.getConfig = function () {
        return sendSelf(this, {resource: "config", action: "getAll"}).then(function (response) {
            return response.entity;
        });
    };

    return Debugger;
}(ozpIwc.Client, ozpIwc.util));

var ozpIwc = ozpIwc || {};
ozpIwc.util = ozpIwc.util || {};
/**
 * @module ozpIwc
 * @submodule ozpIwc.util
 */

ozpIwc.util = (function (util) {
    //----------------------------------------------------------------
    // Private properties
    //----------------------------------------------------------------
    var guid = util.generateId();
    var timerId = 0;
    var timerCallbacks = {};
    var timerWorker;
    var runLoc = "local";
    var enhancedTimersEnabled = false;

    var getTimerId = function () {
        return guid + ":" + timerId++;
    };

    var useLocalTimers = function () {
        return runLoc === "local";
    };

    var setLocalTimers = function () {
        runLoc = "local";
        for (var i in timerCallbacks) {
            if (timerCallbacks[i].type === "setInterval" && timerCallbacks[i].loc === "sharedWorker") {
                timerWorker.port.postMessage({
                    type: "clearInterval",
                    id: timerCallbacks[i].id
                });
                timerCallbacks[i].loc = "local";
                timerCallbacks[i].locId = setInterval(timerCallbacks[i].callback, timerCallbacks[i].time, timerCallbacks[i].args);
            }
        }
    };

    var setSharedWorkerTimers = function () {
        runLoc = "sharedWorker";
        for (var i in timerCallbacks) {
            if (timerCallbacks[i].type === "setInterval" && timerCallbacks[i].time < 1000 && timerCallbacks[i].loc === "local") {
                clearInterval(timerCallbacks[i].locId);
                timerCallbacks[i].loc = "sharedWorker";
                timerWorker.port.postMessage({
                    type: timerCallbacks[i].type,
                    id: timerCallbacks[i].id,
                    loc: timerCallbacks[i].loc,
                    time: timerCallbacks[i].time
                });
            }
        }
    };

    var clearCalls = function (type) {
        return function (id) {
            if (!enhancedTimersEnabled || !timerCallbacks[id]) {
                return clearInterval(id);
            } else if (timerCallbacks[id].loc === "local") {
                clearInterval(timerCallbacks[id].locId);
                timerCallbacks[id] = undefined;
            } else {
                timerWorker.port.postMessage({
                    type: type,
                    id: timerCallbacks[id].id
                });
                timerCallbacks[id] = undefined;
            }
        };
    };

    //----------------------------------------------------------------
    // Public methods
    //----------------------------------------------------------------

    /**
     * Creates connection the shared web worker and toggles util.setInterval and util.setTimeout to offload to the
     * shared web worker when the window goes hidden.
     * @method enableEnhancedTimers
     */
    util.enabledEnhancedTimers = function () {
        if (util.globalScope.SharedWorker) {
            timerWorker = new SharedWorker('/js/ozpIwc.timer.js');

            timerWorker.port.addEventListener('message', function (evt) {
                console.log(evt);
                var timer = evt.data;
                var registered = timerCallbacks[timer.id];
                if (registered) {
                    registered.callback.call(util.globalScope, registered.args);

                    if (timer.type === "setTimeout") {
                        timerCallbacks[timer.id] = null;
                    }
                }
            });

            document.addEventListener("visibilitychange", function runOnce(e) {
                switch (document.visibilityState) {
                    case "visible":
                        setLocalTimers();
                        break;
                    case "hidden":
                        setSharedWorkerTimers();
                        break;
                }
            });

            enhancedTimersEnabled = true;
            timerWorker.port.start();
        }
    };

    /**
     * A wrapper around the window.setTimeout function, if the window is hidden this offloads to the shared worker
     * if possible to avoid timer clamping.
     *
     * @method setTimeout
     * @param {Function} cb The function to call after the time has passed
     * @param {Number} time How long to wait to call the callback.
     * @returns {Number|String} The id associated with the timeout.
     */
    util.setTimeout = function (cb, time) {
        if (!enhancedTimersEnabled || useLocalTimers() || time && time >= 1000) {
            return setTimeout(cb, time);
        }
        var timer = {
            type: "setTimeout",
            time: time,
            id: getTimerId(),
            callback: cb,
            args: Array.prototype.slice.call(arguments, 2)
        };

        timerCallbacks[timer.id] = timer;
        timerWorker.port.postMessage(timer);
        return timer.id;
    };

    /**
     * A wrapper around the window.setImmediate function, if the window is hidden this offloads to the shared worker
     * if possible to avoid timer clamping.
     *
     * @method setTimeout
     * @param {Function} cb The function to call after the time has passed
     * @param {Number} time How often to call the callback.
     * @returns {Number|String} The id associated with the timeout.
     */
    util.setInterval = function (cb, time) {
        if (!enhancedTimersEnabled) {
            return setInterval(cb, time);
        }

        var timer = {
            type: "setInterval",
            time: time,
            id: getTimerId(),
            callback: cb,
            args: Array.prototype.slice.call(arguments, 2)
        };

        if (useLocalTimers() || time && time >= 1000) {
            timer.loc = "local";
            timer.locId = setInterval(cb, time);
            timerCallbacks[timer.id] = timer;
            return timer.locId;
        }

        timer.loc = "sharedWorker";
        timerCallbacks[timer.id] = timer;

        timerWorker.port.postMessage(timer);
        return timer.id;
    };

    /**
     * A wrapper around the window.clearInterval function. If the interval to clear is offloaded to the shared web
     * worker notification must be sent to it to stop updating.
     * @method clearInterval
     * @param {Number|String} id
     */
    util.clearInterval = clearCalls("clearInterval");

    /**
     * A wrapper around the window.clearTimeout function.If the timeout to clear is offloaded to the shared web
     * worker notification must be sent to it to stop it from firing.
     * @method clearInterval
     * @param {Number|String} id
     */
    util.clearTimeout = clearCalls("clearTimeout");

    util.scriptDomain = (function(){
        var scripts = document.getElementsByTagName('script');
        var path = scripts[scripts.length-1].src.split('?')[0];
        // the iframe_peer is a dir above the bus code.
        return path.split('/').slice(0,-2).join('/');
    }());


    /**
     * A css injection to produce the util.pulseWindow animation
     */
     var css =
     ".ozp-iwc-pulse {  " +
         "pointer-events: none; " +
         "position: fixed; " +
         "top: 0; " +
         "left: 0; " +
         "z-index: 5; " +
         "width: 100%; " +
         "height: 100%; " +
         "-webkit-animation: ozp-iwc-pulse 1s linear; " +
         "-moz-animation: ozp-iwc-pulse 1s linear; " +
         "-ms-animation: ozp-iwc-pulse 1s linear; " +
         "animation: ozp-iwc-pulse 1s linear; " +
     "}" +
     '@keyframes "ozp-iwc-pulse" {' +
         "0% {background: rgba(210, 88, 40, 0);} " +
         "25% {background: rgba(210, 88, 40, 0.9);} " +
         "50% {background: rgba(210, 88, 40, 0.5);} " +
         "75% {background: rgba(210, 88, 40, 0.9);} " +
         "100% {background: rgba(210, 88, 40, 0);} " +
     "}" +

     '@-moz-keyframes "ozp-iwc-pulse" {' +
         "0% {background: rgba(210, 88, 40, 0);} " +
         "25% {background: rgba(210, 88, 40, 0.9);} " +
         "50% {background: rgba(210, 88, 40, 0.5);} " +
         "75% {background: rgba(210, 88, 40, 0.9);} " +
         "100% {background: rgba(210, 88, 40, 0);} " +
     "}" +

     '@-webkit-keyframes "ozp-iwc-pulse" {' +
         "0% {background: rgba(210, 88, 40, 0);} " +
         "25% {background: rgba(210, 88, 40, 0.9);} " +
         "50% {background: rgba(210, 88, 40, 0.5);} " +
         "75% {background: rgba(210, 88, 40, 0.9);} " +
         "100% {background: rgba(210, 88, 40, 0);} " +
     "}" +
     '@-ms-keyframes "ozp-iwc-pulse" {' +
         "0% {background: rgba(210, 88, 40, 0);} " +
         "25% {background: rgba(210, 88, 40, 0.9);} " +
         "50% {background: rgba(210, 88, 40, 0.5);} " +
         "75% {background: rgba(210, 88, 40, 0.9);} " +
         "100% {background: rgba(210, 88, 40, 0);} " +
     "}";
     var head = document.head || document.getElementsByTagName('head')[0];
     var style = document.createElement('style');

     style.type = 'text/css';
     if (style.styleSheet){
       style.styleSheet.cssText =css;
     } else {
       style.appendChild(document.createTextNode(css));
     }

     head.appendChild(style);

     /**
      * Pulses the Client's browser window with a non-intrusive flashing overlay.
      * @static
      * @method pulseWindow
      * @param  {Object} client
      */
      util.pulseWindow = function(client){
        var overlay = document.getElementById("ozpIwcOverlay."+client.address);
        if(!overlay){
            overlay = document.createElement('div');
            overlay.id = "ozpIwcOverlay."+client.address;
            overlay.className = "ozp-iwc-pulse";
            document.body.appendChild(overlay);
            setTimeout(function(){
                overlay.parentNode.removeChild(overlay);
            },1010);
        }
    };

    var isAnimating = false;
    /**
     * Temporarily changes the Client's browser window title to the given
     * message.
     * @static
     * @method pulseTitle
     * @param  {Object} client
     * @param  {String} message The message to put as the title
     */
    util.pulseTitle = function(client, message) {
        if(!isAnimating){
            isAnimating = true;
            var oldTitle = document.title;
            var animTitle = message || "IWC Selected";
            var setAnim = function(){
                document.title = animTitle;
            };
            var setOrig = function(){
                document.title = oldTitle;
            };

            setAnim();
            setTimeout(function(){
                setOrig();
                isAnimating = false;
            }, 1000);
        }
    };

    return util;
}(ozpIwc.util));

//# sourceMappingURL=ozpIwc-client.js.map