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
  var thetaSteps = 90;

  var myWorker = new Worker('scripts/houghWorker.js');
  var houghContext;
  var houghData;

  myWorker.onmessage = function (message) {
    console.log('Called back by the worker!', message.data.type);
    if (message.data.type === 'done') {
      for (var i = 0; i < message.data.accumulator.length; i++) {
        if (message.data.accumulator[i] >= 0xFF) {
          message.data.accumulator[i] |= 0x77;
        }
        if (message.data.accumulator[i] >= 0xFFFF) {
          message.data.accumulator[i] |= 0x7777;
        }
        message.data.accumulator[i] |= 0xFF000000;
      }
      houghData = new ImageData(
        new Uint8ClampedArray(message.data.accumulator.buffer),
        houghData.width, houghData.height);
      houghContext.putImageData(houghData, 0, 0);
    }
  };

  window.hough = function (canvasWidth, canvasHeight) {
    var maxRho = Math.floor(Math.sqrt(canvasWidth*canvasWidth + canvasHeight*canvasHeight) * 2);
    window.accums = [];

    houghContext = $('#houghResult')[0].getContext('2d');
    houghData = houghContext.getImageData(0, 0, maxRho, thetaSteps);
    houghContext.putImageData(houghData, 0, 0);

    myWorker.postMessage({type: 'start', maxRho: maxRho});

    return {
      accumulate: function (x, y, sum) {
        myWorker.postMessage({type: 'accumulate', x: x, y: y, sum: sum});
      },
      done: function () {
        myWorker.postMessage({type: 'done'});
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
