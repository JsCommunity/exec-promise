'use strict'

/* eslint-env mocha */

// ===================================================================

var execPromise = require('./')

// -------------------------------------------------------------------

var expect = require('must')
var sinon = require('sinon')

// -------------------------------------------------------------------

var logSymbols = require('log-symbols')

// ===================================================================

// TODO: test JSONification of non-string errors/values.
// TODO: test JavaScript errors (`new Error()`) are correctly handled.

describe('exec-promise', function () {
  var error, exit, print

  // Helper which runs execPromise with spies.
  var exec = function (fn) {
    var origError = console.error
    var origExit = process.exit
    var origLog = console.log

    console.error = error = sinon.spy()
    console.log = print = sinon.spy()
    process.exit = exit = sinon.spy()

    return execPromise(fn).finally(function () {
      console.error = origError
      console.log = origLog
      process.exit = origExit
    })
  }

  // ------------------------------------------------------------------

  it('forwards the process arguments starting from the 3rd one', function () {
    var arg0 = {}
    var arg1 = {}

    var origArgv = process.argv
    process.argv = [
      'node',
      'script.js',
      arg0,
      arg1
    ]

    var spy = sinon.spy()

    return exec(spy).finally(function () {
      process.argv = origArgv
    }).then(function () {
      var params = spy.args[0][0]
      expect(params).to.have.length(2)
      expect(params[0]).to.equal(arg0)
      expect(params[1]).to.equal(arg1)
    })
  })

  // ------------------------------------------------------------------

  it('when nothing is returned', function () {
    return exec(function () {
      return
    }).then(function () {
      expect(error.callCount).to.equal(0)

      expect(exit.callCount).to.equal(1)
      expect(exit.args[0]).to.eql([0])

      expect(print.callCount).to.equal(0)
    })
  })

  // ------------------------------------------------------------------

  it('when a string is returned', function () {
    var string = 'foo'

    return exec(function () {
      return string
    }).then(function () {
      expect(error.callCount).to.equal(0)

      expect(exit.callCount).to.equal(1)
      expect(exit.args[0]).to.eql([0])

      expect(print.callCount).to.equal(1)
      expect(print.args[0]).to.eql([string])
    })
  })

  // ------------------------------------------------------------------

  it('when an integer is thrown', function () {
    var code = 42

    return exec(function () {
      throw code
    }).then(function () {
      expect(error.callCount).to.equal(1)
      expect(error.args[0]).to.eql([logSymbols.error, '' + code])

      expect(exit.callCount).to.equal(1)
      expect(exit.args[0]).to.eql([1])

      expect(print.callCount).to.equal(0)
    })
  })

  // ------------------------------------------------------------------

  it('when a string is thrown', function () {
    var string = 'foo'

    return exec(function () {
      throw string
    }).then(function () {
      expect(error.callCount).to.equal(1)
      expect(error.args[0]).to.eql([logSymbols.error, string])

      expect(exit.callCount).to.equal(1)
      expect(exit.args[0]).to.eql([1])

      expect(print.callCount).to.equal(0)
    })
  })
})
