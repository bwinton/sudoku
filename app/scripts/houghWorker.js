/*! This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

'use strict';

var thetaSteps = 90;
var rhoBucket = 10;
var cos = [];
var sin = [];

for (var i = 0; i < thetaSteps; i++) {
  var theta = ((i + 1) / thetaSteps - 0.5) * Math.PI;
  cos[i] = Math.cos(theta);
  sin[i] = Math.sin(theta);
}

var makeAccumulator = function (maxRho) {
  return new Uint32Array(thetaSteps * maxRho);
};

var groupBuckets = function (bucket, maxRho) {
  var rho = (bucket % maxRho) - maxRho / 2;
  var thetaIndex = Math.floor(bucket / maxRho);

  rho = Math.floor(rho / rhoBucket) * rhoBucket;

  var rv = Math.floor(thetaIndex * maxRho + (rho + maxRho / 2));
  return rv;
};


var accumulator;
var maxRho;

onmessage = function (message) {
  if (message.data.type === 'start') {
    console.log(message.data);
    maxRho = message.data.maxRho;
    accumulator = makeAccumulator(maxRho);
    return;
  }

  if (message.data.type === 'accumulate') {
    var x = message.data.x;
    var y = message.data.y;
    var sum = message.data.sum;
    if (sum) {
      for (var i = 0; i < thetaSteps; i++) {
        var r = x * cos[i] + y * sin[i];
        var bucket = Math.floor(i * maxRho + (r + maxRho / 2));
        accumulator[bucket] += 1000;
      }
      // postMessage({type: 'accumulator', accumulator: accumulator});
    }
    return;
  }

  if (message.data.type === 'done') {
    postMessage({type: 'done', accumulator: accumulator});
    return;
  }

  return;

  return {
    done: function () {
      var results = [];
      var latestResult = [0,0];

      for (var i = 0; i < accumulator.length; i++) {
        var bucket = i;
        var count = accumulator[i];
        var newBucket = groupBuckets(bucket, maxRho);
        if (newBucket === latestResult[1]) {
          latestResult[0] += count;
        } else {
          results.push(latestResult);
          latestResult = [count, newBucket];
        }
      }
      results.push(latestResult);

      results = results.filter(function (result) {
        return result[0] && result[1] === 27990;
      }).sort(function(a, b) {
        if (b[0] === a[0]) {
          return b[1] - a[1];
        }
        return b[0] - a[0];
      }).map(function (result) {
        if (!window.topResult) {
          window.topResult = result;
        }
        var count = result[0];
        var bucket = result[1];
        var rho = (bucket % maxRho) - maxRho / 2;
        var thetaIndex = Math.floor(bucket / maxRho);
        var theta = ((thetaIndex + 1) / thetaSteps - 0.5) * Math.PI;
        return {count: count, rho: rho, theta: theta};
      });
      return results;
    }
  };

};
