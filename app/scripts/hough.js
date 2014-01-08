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

(function () {
  var thetaSteps = 180;
  var cos = [];
  var sin = [];

  for (var i = 0; i < thetaSteps; i++) {
    var theta = ((i + 1) / thetaSteps - 0.5) * Math.PI;
    cos[i] = Math.cos(theta);
    sin[i] = Math.sin(theta);
  }

  var makeAccumulator = function (maxRho) {
    return new Uint16Array(thetaSteps * maxRho);
  };

  var getArray = function (accumulator) {
    var results = [];
    for (var i = 0; i < accumulator.length; i++) {
      results.push(accumulator[i]);
    }
    return results;
  };

  window.hough = function (canvasWidth, canvasHeight) {
    var maxRho = Math.floor(Math.sqrt(canvasWidth*canvasWidth + canvasHeight*canvasHeight) * 2);
    var accumulator = makeAccumulator(maxRho);
    var totalTime = 0;
    var count = 0;

    return {
      accumulate: function (x, y, sum) {
        if (sum) {
          count++;
          var t1 = Date.now();
          for (var i = 0; i < thetaSteps; i++) {
            var r = x * cos[i] + y * sin[i];
            var bucket = Math.floor(i * maxRho + (r + maxRho / 2));
            // var theta = Math.round(((i + 1) / thetaSteps - 0.5) * 180);
            // console.log('theta=' + theta,
            //   'cos=' + cos[i], 'sin=' + sin[i], 'r=' + r,
            //   'i=' + i, 'floor=' + i * maxRho,
            //   'bucket=' + bucket);
            accumulator[bucket]++;
          }
          var t2 = Date.now();
          totalTime += t2-t1;
        }
      },
      done: function () {
        var t1 = Date.now();
        var results = getArray(accumulator).map(function (count, bucket) {
          return [count, bucket];
        }).filter(function (result) {
          return result[0];
        }).sort(function(a, b) {
          if (b[0] === a[0]) {
            return b[1] - a[1];
          }
          return b[0] - a[0];
        }).map(function (result) {
          var count = result[0];
          var bucket = result[1];
          var rho = (bucket % maxRho) - maxRho / 2;
          var thetaIndex = Math.floor(bucket / maxRho);
          var theta = ((thetaIndex + 1) / thetaSteps - 0.5) * Math.PI;
          return {count: count, rho: rho, theta: theta};
        });
        var t2 = Date.now();
        // console.log('Accumulator time: ' + (totalTime / count));
        // console.log('Done time:' + (t2 - t1));
        return results;
      },
      format: function (result) {
        var count = result.count;
        var rho = result.rho;
        var theta = Math.round((result.theta / Math.PI) * 180);
        return ' (' + theta + 'deg x ' + rho + 'px) = ' + count + ' occurrences.';
      }
    };

  };

})();
