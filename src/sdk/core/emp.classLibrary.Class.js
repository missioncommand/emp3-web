/**
 * @namespace classLibrary
 * @memberof emp
 */
emp.classLibrary = emp.classLibrary || {};

/**
 * emp.Util contains various utility functions used throughout the code.
 * @namespace Util
 * @memberof emp.classLibrary
 */
emp.classLibrary.Util = {
  /**
   *
   * @param dest
   * @returns {*}
   */
  extend: function(dest) { // (Object[, Object, ...]) ->
    var sources = Array.prototype.slice.call(arguments, 1),
      i, j, len, src;

    for (j = 0, len = sources.length; j < len; j++) {
      src = sources[j] || {};
      for (i in src) {
        if (src.hasOwnProperty(i)) {
          dest[i] = src[i];
        }
      }
    }
    return dest;
  },
  /**
   *
   * @param fn
   * @param obj
   * @returns {Function}
   */
  bind: function(fn, obj) { // (Function, Object) -> Function
    var args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : null;
    return function() {
      return fn.apply(obj, args || arguments);
    };
  },
  /**
   *
   * @param obj
   * @param method
   * @param context
   * @returns {boolean}
   */
  invokeEach: function(obj, method, context) {
    var i, args;

    if (typeof obj === 'object') {
      args = Array.prototype.slice.call(arguments, 3);

      for (i in obj) {
        method.apply(context, [i, obj[i]].concat(args));
      }
      return true;
    }

    return false;
  },
  /**
   *
   * @param fn
   * @param time
   * @param context
   * @returns {wrapperFn}
   */
  limitExecByInterval: function(fn, time, context) {
    var lock, execOnUnlock;

    return function wrapperFn() {
      var args = arguments;

      if (lock) {
        execOnUnlock = true;
        return;
      }

      lock = true;

      setTimeout(function() {
        lock = false;

        if (execOnUnlock) {
          wrapperFn.apply(context, args);
          execOnUnlock = false;
        }
      }, time);

      fn.apply(context, args);
    };
  },

  /**
   * Returns false
   * @returns {boolean}
   */
  falseFn: function() {
    return false;
  },

  /**
   *
   * @param num
   * @param digits
   * @returns {number}
   */
  formatNum: function(num, digits) {
    var pow = Math.pow(10, digits || 5);
    return Math.round(num * pow) / pow;
  },
  /**
   *
   * @param str
   * @returns {*}
   */
  trim: function(str) {
    return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
  },
  /**
   *
   * @param str
   */
  splitWords: function(str) {
    return emp.classLibrary.Util.trim(str).split(/\s+/);
  },
  /**
   *
   * @param obj
   * @param options
   * @returns {*}
   */
  setOptions: function(obj, options) {
    obj.options = emp.classLibrary.Util.extend({}, obj.options, options);
    return obj.options;
  },
  /**
   *
   * @param obj
   * @param existingUrl
   * @param uppercase
   * @returns {string}
   */
  getParamString: function(obj, existingUrl, uppercase) {
    var params = [];
    for (var i in obj) {
      params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
    }
    return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
  },
  /**
   *
   * @param str
   * @param data
   */
  template: function(str, data) {
    return str.replace(/\{ *([\w_]+) *\}/g, function(str, key) {
      var value = data[key];
      if (value === undefined) {
        throw new Error('No value provided for variable ' + str);
      } else if (typeof value === 'function') {
        value = value(data);
      }
      return value;
    });
  },
  /**
   *
   */
  isArray: Array.isArray || function(obj) {
    return (Object.prototype.toString.call(obj) === '[object Array]');
  }
};

/*
 * emp.Class powers the OOP facilities of the library.
 * Thanks to John Resig and Dean Edwards for inspiration!
 */

emp.classLibrary.Class = function() { };

emp.classLibrary.Class.extend = function(props) {

  // extended class with the new prototype
  var NewClass = function() {

    // call the constructor
    if (this.initialize) {
      this.initialize.apply(this, arguments);
    }

    // call all constructor hooks
    if (this._initHooks) {
      this.callInitHooks();
    }
  };

  // instantiate class without calling constructor
  var F = function() { };
  F.prototype = this.prototype;

  var proto = new F();
  proto.constructor = NewClass;

  NewClass.prototype = proto;

  //inherit parent's statics
  for (var i in this) {
    if (this.hasOwnProperty(i) && i !== 'prototype') {
      NewClass[i] = this[i];
    }
  }

  // mix static properties into the class
  if (props.statics) {
    emp.classLibrary.Util.extend(NewClass, props.statics);
    delete props.statics;
  }

  // mix includes into the prototype
  if (props.includes) {
    emp.classLibrary.Util.extend.apply(null, [proto].concat(props.includes));
    delete props.includes;
  }

  // merge options
  if (props.options && proto.options) {
    props.options = emp.classLibrary.Util.extend({}, proto.options, props.options);
  }

  // mix given properties into the prototype
  emp.classLibrary.Util.extend(proto, props);

  proto._initHooks = [];

  var parent = this;
  // jshint camelcase: false
  NewClass.__super__ = parent.prototype;

  // add method for calling all hooks
  proto.callInitHooks = function() {

    if (this._initHooksCalled) {
      return;
    }

    if (parent.prototype.callInitHooks) {
      parent.prototype.callInitHooks.call(this);
    }

    this._initHooksCalled = true;

    for (var i = 0, len = proto._initHooks.length; i < len; i++) {
      proto._initHooks[i].call(this);
    }
  };

  return NewClass;
};


// method for adding properties to prototype
emp.classLibrary.Class.include = function(props) {
  emp.classLibrary.Util.extend(this.prototype, props);
};

// merge new default options to the Class
emp.classLibrary.Class.mergeOptions = function(options) {
  emp.classLibrary.Util.extend(this.prototype.options, options);
};

// add a constructor hook
emp.classLibrary.Class.addInitHook = function(fn) { // (Function) || (String, args...)
  var args = Array.prototype.slice.call(arguments, 1);

  var init = typeof fn === 'function' ? fn : function() {
    this[fn].apply(this, args);
  };

  this.prototype._initHooks = this.prototype._initHooks || [];
  this.prototype._initHooks.push(init);
};
