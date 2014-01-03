/*! This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/* global getColor */

'use strict';

(function () {
  var kernel = [
    [1,   3, 1],
    [3, -16, 3],
    [1,   3, 1]
  ];

  var calcBrightness = function (color) {
    // calculate pixel brightness
    // http://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color
    var brightness = (0.299 * color.red + 0.587 * color.green + 0.114 * color.blue);
    return brightness;
  };

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
            var val = calcBrightness(adjacentColor);
            // Multiply adjacent pixels based on the kernel values
            sum += kernel[ky+1][kx+1] * val;
          }
        }

        sum = Math.round(sum / 255) * 255;

        cb(x, y, color, sum);
      }
    }
  };
})();