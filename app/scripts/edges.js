/*! This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/* global getColor */

'use strict';

(function () {
  var kernel = [
    [1,   2, 1],
    [2, -12, 2],
    [1,   2, 1]
  ];

  var calcBrightness = function (color) {
    // calculate pixel brightness
    // http://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color
    var brightness = (0.299 * color.red + 0.587 * color.green + 0.114 * color.blue);
    return brightness;
  };

  var range = (function () {
    var positiveSum = 0;
    var negativeSum = 0;
    for (var i = kernel.length - 1; i >= 0; i--) {
      for (var j = kernel[i].length - 1; j >= 0; j--) {
        if (kernel[i][j] > 0) {
          positiveSum += kernel[i][j];
        } else {
          negativeSum += kernel[i][j];
        }
      }
    }
    return [negativeSum * 255, positiveSum * 255];
  })();

  console.log(range);

  window.detectEdges = function (imageData, canvasWidth, canvasHeight, cb) {
    for (var y = 0; y < canvasHeight; y++) {
      for (var x = 0; x < canvasWidth; x++) {
        // get each pixel's brightness

        var color = getColor(imageData.data, x, y, canvasWidth);

        var sum = 0; // Kernel sum for this pixel
        for (var ky = -1; ky <= 1; ky++) {
          for (var kx = -1; kx <= 1; kx++) {
            // Calculate the adjacent pixel for this kernel point
            var adjacentColor = getColor(imageData.data, x + kx, y + ky, canvasWidth);
            if (!adjacentColor.red) {
              continue;
            }
            var val = calcBrightness(adjacentColor);
            // Multiply adjacent pixels based on the kernel values
            sum += kernel[ky+1][kx+1] * val;
          }
        }

        // Scale this based on the range to -1 to 1.
        sum = sum / range[0];
        // Let the calling code determine the threshold (for the next frame).
        // sum = Math.abs(Math.round(sum / 400) * 255);

        cb(x, y, color, sum);
      }
    }
  };
})();
