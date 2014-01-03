/*! This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/* global camera, setColor, detectEdges, hough */

'use strict';

$(function () {

  var capture = false;

  $('#tempResult').click(function () {
    console.log('Capturing!');
    capture = !capture;
    return false;
  });

  var houghResults = null;

  var drawLines = function (canvas, context, houghFuncs, log) {
    if (houghResults) {
      context.strokeStyle = '#00FF00';
      context.lineWidth = 2;
      context.beginPath();

      for (var result in houghResults.slice(0, 5)) {
        var data = houghResults[result];
        if (log) {
          console.log(houghFuncs.format(data));
        }
        var parsed = houghFuncs.parse(data);
        var rho = parsed[0];
        var theta = parsed[1];

        // TODO: 1) Why is rho so often 0?
        var x = rho / Math.sin(theta);
        var y = rho / Math.cos(theta);
        if (theta === 0 || theta === 180) {
          x = 0;
        }
        if (theta === 90) {
          y = canvas.height;
        }

        if (log) {
          console.log('Plotting ' + x + ',' + y);
        }

        if (x < 0) {
          context.moveTo(0, y);
          context.lineTo(canvas.width, canvas.width * y / -x + y);
        } else if (y < 0) {
          context.moveTo(x, 0);
          context.lineTo(canvas.height * x / -y + x, canvas.height);
        } else {
          context.moveTo(x,0);
          context.lineTo(0,y);
        }

      }
      context.closePath();
      context.stroke();
    }
  };

  var onFrame = function (canvas) {
    var context = canvas.getContext('2d');
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;
    var imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);

    var outContext = $('#tempResult')[0].getContext('2d');
    var outData = outContext.getImageData(0, 0, canvasWidth, canvasHeight);

    var houghFuncs = hough(canvasWidth, canvasHeight);

    if (!capture) {
      outContext.putImageData(imageData, 0, 0);
      drawLines(canvas, outContext, houghFuncs);
      return;
    }
    detectEdges(imageData, canvasWidth, canvasHeight, function (x, y, color, sum) {
      var outColor = {
        red: color.red,
        green: Math.max(color.green, sum),
        blue: color.blue,
        alpha: color.alpha
      };

      setColor(outData.data, x, y, canvasWidth, outColor);
      houghFuncs.accumulate(x, y, color, sum);
    });
    // capture = !capture;
    houghResults = houghFuncs.done();
    outContext.putImageData(outData, 0, 0);
    drawLines(canvas, outContext, houghFuncs, true);
  };

  camera.init({
    onFrame: onFrame,
    fps: 2,

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