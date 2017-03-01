'use strict'

/* eslint-env jest */

// ===================================================================

require('native-promise-only')
var logSymbols = require('log-symbols')

var execPromise = require('./')

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

    console.error = error = jest.fn()
    console.log = print = jest.fn()
    process.exit = exit = jest.fn()

    return execPromise(fn).then(
      function (value) {
        console.error = origError
        console.log = origLog
        process.exit = origExit

        return value
      },
      function (reason) {
        console.error = origError
        console.log = origLog
        process.exit = origExit

        throw reason
      }
    )
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

    var spy = jest.fn()

    return exec(spy).then(
      function (value) {
        process.argv = origArgv
        return value
      },
      function (reason) {
        process.argv = origArgv
        throw reason
      }
    ).then(function () {
      var params = spy.mock.calls[0][0]
      expect(params.length).toBe(2)
      expect(params[0]).toBe(arg0)
      expect(params[1]).toBe(arg1)
    })
  })

  // ------------------------------------------------------------------

  it('when nothing is returned', function () {
    return exec(function () {}).then(function () {
      expect(error.mock.calls.length).toBe(0)

      expect(exit.mock.calls.length).toBe(1)
      expect(exit.mock.calls[0]).toEqual([0])

      expect(print.mock.calls.length).toBe(0)
    })
  })

  // ------------------------------------------------------------------

  it('when a string is returned', function () {
    var string = 'foo'

    return exec(function () {
      return string
    }).then(function () {
      expect(error.mock.calls.length).toBe(0)

      expect(exit.mock.calls.length).toBe(1)
      expect(exit.mock.calls[0]).toEqual([0])

      expect(print.mock.calls.length).toBe(1)
      expect(print.mock.calls[0]).toEqual([string])
    })
  })

  // ------------------------------------------------------------------

  it('when an integer is thrown', function () {
    var code = 42

    return exec(function () {
      throw code
    }).then(function () {
      expect(error.mock.calls.length).toBe(1)
      expect(error.mock.calls[0]).toEqual([logSymbols.error, '' + code])

      expect(exit.mock.calls.length).toBe(1)
      expect(exit.mock.calls[0]).toEqual([1])

      expect(print.mock.calls.length).toBe(0)
    })
  })

  // ------------------------------------------------------------------

  it('when a string is thrown', function () {
    var string = 'foo'

    return exec(function () {
      throw string
    }).then(function () {
      expect(error.mock.calls.length).toBe(1)
      expect(error.mock.calls[0]).toEqual([logSymbols.error, string])

      expect(exit.mock.calls.length).toBe(1)
      expect(exit.mock.calls[0]).toEqual([1])

      expect(print.mock.calls.length).toBe(0)
    })
  })
})
