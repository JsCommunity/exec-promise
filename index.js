'use strict';

//====================================================================

var _ = require('lodash');
var Promise = require('bluebird');

//====================================================================

var defaults = {
  exit: process.exit,
  print: console.log,
  error: console.error,
};

var onSuccess = function (value) {
  if (value !== undefined)
  {
    if (!_.isString(value))
    {
      value = JSON.stringify(value);
    }

    this.print(value);
  }

  this.exit(0);
};

var onError = function (error) {
  var exitSuccess = 1;

  if (_.isNumber(error))
  {
    exitSuccess = error;
  }
  else
  {
    // Special case for Error objects which cannot be JSONified.
    if (error.stack)
    {
      error = error.stack;
    }

    if (!_.isString(error))
    {
      error = JSON.stringify(error);
    }

    this.error(error);
  }

  this.exit(exitSuccess);
};

//====================================================================

module.exports = function (fn, args, opts) {
  if (!args)
  {
    args = process.argv.slice(2);
  }

  return Promise.try(fn, [args]).bind(
    _.extend({}, defaults, opts)
  ).then(onSuccess, onError).bind();
};
