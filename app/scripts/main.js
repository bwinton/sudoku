/*! This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

'use strict';

$(function () {

  var bound = function (value, interval) {
    return Math.max(interval[0], Math.min(interval[1], value));
  };

  var getColorAtOffset = function (data, offset) {
    return {
      red: data[offset],
      green: data[offset + 1],
      blue: data[offset + 2],
      alpha: data[offset + 3]
    };
  };

  var onFrame = function (canvas) {
    var rv = [];
    var contrastFactor = 99197/33405;

    var context = canvas.getContext('2d');
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;
    var imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);

    for (var y = 0; y < canvasHeight; y++) {
      for (var x = 0; x < canvasWidth; x++) {
        // get each pixel's brightness

        var offset = (y * canvasWidth + x) * 4;

        var color = getColorAtOffset(imageData.data, offset);
  
        // increase the contrast of the image so that the ASCII representation looks better
        // http://www.dfstudios.co.uk/articles/image-processing-algorithms-part-5/
        var contrastedColor = {
          red: bound(Math.floor((color.red - 128) * contrastFactor) + 128, [0, 255]),
          green: bound(Math.floor((color.green - 128) * contrastFactor) + 128, [0, 255]),
          blue: bound(Math.floor((color.blue - 128) * contrastFactor) + 128, [0, 255]),
          alpha: color.alpha
        };

        // calculate pixel brightness
        // http://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color
        var brightness = (0.299 * contrastedColor.red + 0.587 * contrastedColor.green + 0.114 * contrastedColor.blue) / 255;
        rv.push(brightness);
      }
    }

    console.log(rv);
  };

  camera.init({
    width: 160, // default: 640
    height: 120, // default: 480
    mirror: true,  // default: false

    onFrame: onFrame,

    onSuccess: function() {
      // stream succesfully started, yay!
      console.log('Stream Started!');
      $('#info').slideUp();
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