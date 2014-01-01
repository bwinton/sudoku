/*! This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/* global camera */

'use strict';

$(function () {

  var getColorAtOffset = function (data, offset) {
    return {
      red: data[offset],
      green: data[offset + 1],
      blue: data[offset + 2],
      alpha: data[offset + 3]
    };
  };

  var setColorAtOffset = function (data, offset, color) {
    data[offset] = color.red;
    data[offset + 1] = color.green;
    data[offset + 2] = color.blue;
    data[offset + 3] = color.alpha;
  };

  var onFrame = function (canvas) {
    var contrastFactor = 1.0;

    var context = canvas.getContext('2d');
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;
    console.log(canvasWidth, canvasHeight);
    var imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);

    var outContext = $('#tempResult')[0].getContext('2d');


    for (var y = 0; y < canvasHeight; y++) {
      for (var x = 0; x < canvasWidth; x++) {
        // get each pixel's brightness

        var offset = (y * canvasWidth + x) * 4;

        var color = getColorAtOffset(imageData.data, offset);
  
        // calculate pixel brightness
        // http://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color
        var brightness = (0.299 * color.red + 0.587 * color.green + 0.114 * color.blue) / 255;
        brightness = Math.round(brightness * contrastFactor);
        brightness = brightness * 255;
        // Grey
        var greyColor = {
          red: brightness,
          green: brightness,
          blue: brightness,
          alpha: color.alpha
        };
        setColorAtOffset(imageData.data, offset, greyColor);
      }
    }
    outContext.putImageData(imageData, 0, 0);
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