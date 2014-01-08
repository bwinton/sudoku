/*! This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/* global chai, describe, it, hough, getIntercepts */

'use strict';

chai.use(function (_chai) {
  var Assertion = _chai.Assertion;
  // language chain method
  Assertion.addMethod('like', function (expected) {
    var obj = this._obj;

    if (obj &&
        obj.hasOwnProperty('count') &&
        obj.hasOwnProperty('rho') &&
        obj.hasOwnProperty('theta')) {
      obj.count.should.equal(expected.count, 'count');
      obj.rho.should.equal(expected.rho, 'rho');
      obj.theta.should.be.closeTo(expected.theta / 180 * Math.PI, 0.01, 'theta');
    } else if (obj &&
               obj.hasOwnProperty('x') &&
               obj.hasOwnProperty('y')) {
      obj.x.should.be.closeTo(expected.x, 0.0000000000001, 'x');
      obj.y.should.be.closeTo(expected.y, 0.0000000000001, 'y');
    }
  });
});

(function () {
  describe('Hough:', function () {
    var houghFuncs = hough(0, 0);
    var gatherResults = function (points) {
      houghFuncs = hough(640, 480);
      points.forEach(function (element) {
        houghFuncs.accumulate(element[0], element[1], true);
      });
      return houghFuncs.done();
    };
    var printResults = function (results) {
      console.log(results.filter(function (result) {
        return result.count >= 2;
      }).map(function (result) {
        return houghFuncs.format(result);
      }).join('\n'));
    };
    printResults([]);

    it('should calculate vertical lines', function () {
      var results = gatherResults([[630,10], [630,470]]);
      results[0].should.be.like({count:2, rho:630, theta:0});

      results = gatherResults([[15,0], [15,15]]);
      results[0].should.be.like({count:2, rho:15, theta:0});
    });

    it('should have a horizontal line', function () {
      var results = gatherResults([[10,15], [630,15]]);
      results[0].should.be.like({count:2, rho:15, theta:90});

      results = gatherResults([[15,15], [30,15]]);
      results[0].should.be.like({count:2, rho:15, theta:90});

      results = gatherResults([[10,480], [630,480]]);
      results[0].should.be.like({count:2, rho:480, theta:90});

      results = gatherResults([[620,480], [630,480]]);
      // printResults(results);
      results[0].should.be.like({count:2, rho:480, theta:90});
    });

    it('should have a diagonal line like \\', function () {
      var results = gatherResults([[15,15], [400,400]]);
      results[0].should.be.like({count:2, rho:0, theta:-45});

      results = gatherResults([[15,15], [30,30]]);
      results[0].should.be.like({count:2, rho:0, theta:-44});

      results = gatherResults([[640,10], [630,0]]);
      // printResults(results);
      results[0].should.be.like({count:2, rho:468, theta:-42});
    });

    it('should have a diagonal line like /', function () {
      var results = gatherResults([[600,0], [200,400]]);
      results[0].should.be.like({count:2, rho:424, theta:45});

      results = gatherResults([[15,30], [30,15]]);
      results[0].should.be.like({count:2, rho:31, theta:45});

      results = gatherResults([[630,480], [640,470]]);
      // printResults(results);
      results[0].should.be.like({count:2, rho:780, theta:47});

      results = gatherResults([[640,0], [630,10]]);
      // printResults(results);
      results[0].should.be.like({count:2, rho:428, theta:48});
    });

  });

  describe('ImageUtil:', function () {
    var houghResults = null;
    houghResults = [
      // Rho can vary between 0? and 800 (a.k.a. √(640² + 480²))
      // Theta can vary between -89º to 90º.
    ];
    var canvas = {width: 640, height: 480};

    // {count:2, rho:300, theta:-89 / 180 * Math.PI},
    it('-89º should be straight across-ish', function () {
      var intercepts = getIntercepts(300, -89 / 180 * Math.PI, canvas, true);
      intercepts[0].should.be.like({x:0, y:300});
      intercepts[1].should.be.like({x:canvas.width, y:300});
    });

    it('-45º should be like \\', function () {
      var intercepts = getIntercepts(300, - Math.PI / 4, canvas);
      intercepts[0].should.be.like({x:424, y:0});
      intercepts[1].should.be.like({x:canvas.width, y:216});
    });

    it('0º should be straight up and down', function () {
      var intercepts = getIntercepts(300, 0, canvas);
      intercepts[0].should.be.like({x:300, y:0});
      intercepts[1].should.be.like({x:300, y:canvas.height});
    });

    it('45º should be like /', function () {
      var intercepts = getIntercepts(300, Math.PI / 4, canvas);
      intercepts[0].should.be.like({x:424, y:0});
      intercepts[1].should.be.like({x:0, y:424});
    });

    it('90º should be straight across', function () {
      var intercepts = getIntercepts(300, Math.PI / 2, canvas);
      intercepts[0].should.be.like({x:0, y:300});
      intercepts[1].should.be.like({x:canvas.width, y:300});
    });

    return false;

  });
})();
