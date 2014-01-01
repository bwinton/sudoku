/*! This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/* global camera */

'use strict';

$(function () {

  var getColor = function (data, x, y, width) {
    var offset = (y * width + x) * 4;
    return {
      red: data[offset],
      green: data[offset + 1],
      blue: data[offset + 2],
      alpha: data[offset + 3]
    };
  };

  var setColor = function (data, x, y, width, color) {
    var offset = (y * width + x) * 4;
    data[offset] = color.red;
    data[offset + 1] = color.green;
    data[offset + 2] = color.blue;
    data[offset + 3] = color.alpha;
  };

  var calcBrightness = function (color) {
    // calculate pixel brightness
    // http://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color
    var brightness = (0.299 * color.red + 0.587 * color.green + 0.114 * color.blue);
    return brightness;
  }

  var kernel = [
    [3,   3, 3],
    [3, -27, 3],
    [3,   3, 3]
  ];

  var onFrame = function (canvas) {
    var context = canvas.getContext('2d');
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;
    var imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);

    var outContext = $('#tempResult')[0].getContext('2d');
    var outData = outContext.getImageData(0, 0, canvasWidth, canvasHeight);


    for (var y = 0; y < canvasHeight; y++) {
      for (var x = 0; x < canvasWidth; x++) {
        // get each pixel's brightness

        var color = getColor(imageData.data, x, y, canvasWidth);
        var brightness = calcBrightness(color);
  
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

        var outColor = {
          red: color.red,
          green: Math.max(color.green, sum),
          blue: color.blue,
          alpha: color.alpha
        };

        setColor(outData.data, x, y, canvasWidth, outColor);
      }
    }
    outContext.putImageData(outData, 0, 0);
  };

  camera.init({
    onFrame: onFrame,

    onSuccess: function() {
      // stream succesfully started, yay!
      console.log('Stream Started!');
      $('#info').slideUp();
      $('#tempResult').fadeIn();
    },

    onError: function(error) {
      // something went wrong on initialization
      console.log('Stream Failed!', error);
      $('#info').toggle();
      $('#notSupported').fadeIn();
    },

    onNotSupported: function() {
      // instruct the user to get a better browser
      console.log('Not Supported!');
      $('#info').toggle();
      $('#notSupported').fadeIn();
    }
  });
});