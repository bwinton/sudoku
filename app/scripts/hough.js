/*! This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

'use strict';

// At this point, I've got the edges, so I should:
// 1) run the Hough Transform,
//   a) Create an accumulator array of π by sqrt(width^2 + height^2).
//   b) For each edge point,
//   c)   for each Θ between 0 and π,
//   d)     Calculate r = x*cos(Θ) + y*sin(Θ)
//   e)     Add one to the accumulator at Θ,r.
// 2) get the four brightest lines (four highest-valued points in the accumulator)
// 3) find their intersections, and
// 4) plot the four lines between their intersections!  :)

// Todo: Precalculate the cosine and sine tables.

(function () {
  var thetaSteps = 72; // width.
  var rhoBucket = 10; // height.
  var cos = [];
  var sin = [];

  for (var i = 0; i < thetaSteps; i++) {
    var theta = i / thetaSteps * Math.PI;
    cos[i] = Math.cos(theta);
    sin[i] = Math.sin(theta);
  }

  var makeAccumulator = function (maxRho) {
    var buffer = new ArrayBuffer(thetaSteps * maxRho);
    return new Uint16Array(buffer);
  };

  window.hough = function (canvasWidth, canvasHeight) {
    var maxRho = Math.floor(Math.sqrt(canvasWidth*canvasWidth + canvasHeight*canvasHeight) / rhoBucket) + 1;
    var accumulator = makeAccumulator(maxRho);
    var totalTime = 0;
    var count = 0;

    var parse = function (result) {
      var index = result[1];
      var rho = Math.floor(index / thetaSteps) * rhoBucket;
      var thetaIndex = index % thetaSteps;
      var theta = thetaIndex / thetaSteps * Math.PI;
      return [rho, theta];
    };

    return {
      accumulate: function (x, y, color, sum) {
        if (sum) {
          count++;
          var t1 = Date.now();
          for (var i = 0; i < thetaSteps; i++) {
            var r = x * cos[i] + y * sin[i] / rhoBucket;
            accumulator[Math.floor(r * thetaSteps + i)]++;
          }
          var t2 = Date.now();
          totalTime += t2-t1;
        }
      },
      done: function () {
        var t1 = Date.now();
        var results = Array.apply( [], accumulator );
        var t2 = Date.now();
        results = results.map(function (e, i) {
          return [e, i];
        }).sort(function(a, b) {
          return b[0] - a[0];
        });
        var t3 = Date.now();
        console.log('Accumulator time: ' + (totalTime / count));
        console.log('Done time:' + (t2 - t1) + ', ' + (t3 - t2));
        return results;
      },
      format: function (result) {
        var count = result[0];
        var index = parse(result);
        var rho = index[0];
        var theta = Math.round(index[1] / Math.PI * 180);
        return result[1] + ' (' + theta + 'deg x ' + rho + 'px) = ' + count + ' occurrences.';
      },
      parse: parse
    };

  };

})();
