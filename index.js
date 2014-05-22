'use strict';

//====================================================================

var Promise = require('bluebird');

//====================================================================

var extend = (function (has) {
  has = has.call.bind(has);
  return function (dst, src) {
    var i, n, k;
    for (i = 1, n = arguments.length; i < n; ++i) {
      src = arguments[i];
      for (k in src) {
        if (has(src, k)) {
          dst[k] = src[k];
        }
      }
    }
    return dst;
  };
})(Object.prototype.hasOwnProperty);

var isNumber, isString;
(function (toS) {
  toS = toS.call.bind(toS);
  var _ = function (ref) {
    ref = toS(ref);
    return function (val) {
      return toS(val) === ref;
    };
  };

  isNumber = _(0);
  isString = _('');
})(Object.prototype.toString);

//====================================================================

var defaults = {
  exit: process.exit,
  print: console.log,
  error: console.error,
};

var onSuccess = function (value) {
  if (value !== undefined)
  {
    if (!isString(value))
    {
      value = JSON.stringify(value);
    }

    this.print(value);
  }

  this.exit(0);
};

var onError = function (error) {
  var exitCode = 1;

  if (isNumber(error))
  {
    exitCode = error;
  }
  else
  {
    // Special case for Error objects which cannot be JSONified.
    if (error.stack)
    {
      error = error.stack;
    }

    if (!isString(error))
    {
      error = JSON.stringify(error);
    }

    this.error(error);
  }

  this.exit(exitCode);
};

//====================================================================

module.exports = function (fn, args, opts) {
  if (!args)
  {
    args = process.argv.slice(2);
  }

  return Promise.try(fn, [args]).bind(
    extend({}, defaults, opts)
  ).then(onSuccess, onError).bind();
};
