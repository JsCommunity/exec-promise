'use strict';

//====================================================================

var execPromise = require('./');

//--------------------------------------------------------------------

var expect = require('chai').expect;
var sinon = require('sinon');

//====================================================================

// TODO: test JSONification of non-string errors/values.
// TODO: test JavaScript errors (`new Error()`) are correctly handled.

describe('exec-promise', function () {
  // Helper which runs execPromise with spies.
  var exec = function (fn, args) {
    var opts = {
      error: sinon.spy(),
      exit: sinon.spy(),
      print: sinon.spy(),
    };

    return execPromise(fn, args, opts).bind(opts);
  };

  //------------------------------------------------------------------

  it('forwards the parameters', function () {
    var param0 = {};
    var param1 = {};

    var spy = sinon.spy();

    return exec(spy, [param0, param1]).then(function () {
      var params = spy.args[0][0];
      expect(params).to.have.length(2);
      expect(params[0]).to.equal(param0);
      expect(params[1]).to.equal(param1);
    });
  });

  //------------------------------------------------------------------

  it('when nothing is returned', function () {
    return exec(function () {
      return;
    }).then(function () {
      expect(this.error.callCount).to.equal(0);

      expect(this.exit.callCount).to.equal(1);
      expect(this.exit.args[0]).to.deep.equal([0]);

      expect(this.print.callCount).to.equal(0);
    });
  });

  //------------------------------------------------------------------

  it('when a string is returned', function () {
    var string = 'foo';

    return exec(function () {
      return string;
    }).then(function () {
      expect(this.error.callCount).to.equal(0);

      expect(this.exit.callCount).to.equal(1);
      expect(this.exit.args[0]).to.deep.equal([0]);

      expect(this.print.callCount).to.equal(1);
      expect(this.print.args[0]).to.deep.equal([string]);
    });
  });

  //------------------------------------------------------------------

  it('when an integer is thrown', function () {
    var code = 42;

    return exec(function () {
      throw code;
    }).then(function () {
      expect(this.error.callCount).to.equal(0);

      expect(this.exit.callCount).to.equal(1);
      expect(this.exit.args[0]).to.deep.equal([code]);

      expect(this.print.callCount).to.equal(0);
    });
  });

  //------------------------------------------------------------------

  it('when a string is thrown', function () {
    var string = 'foo';

    return exec(function () {
      throw string;
    }).then(function () {
      expect(this.error.callCount).to.equal(1);
      expect(this.error.args[0]).to.deep.equal([string]);

      expect(this.exit.callCount).to.equal(1);
      expect(this.exit.args[0]).to.deep.equal([1]);

      expect(this.print.callCount).to.equal(0);
    });
  });
});
