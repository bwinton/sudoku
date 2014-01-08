/*! This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/* global camera, setColor, getIntercepts, detectEdges, hough */

'use strict';

$(function () {

  var capture = false;

  $('#tempResult').click(function () {
    console.log('Capturing!');
    capture = !capture;
    return false;
  });

  var houghResults = null;
  houghResults = [
    {count:2, rho:200, theta:90 / 180 * Math.PI},
    {count:2, rho:200, theta:135 / 180 * Math.PI},
    {count:2, rho:200, theta:180 / 180 * Math.PI},
    {count:2, rho:200, theta:225 / 180 * Math.PI}
  ];

  var drawLines = function (canvas, context) {
    if (houghResults) {
      var width = canvas.width;
      var height = canvas.height;
      context.strokeStyle = '#00FF00';
      context.lineWidth = 2;
      context.beginPath();

      for (var result in houghResults.slice(0, 5)) {
        var data = houghResults[result];
        var intercepts = getIntercepts(data.rho, data.theta, {width:width, height:height});
        context.moveTo(intercepts[0].x, intercepts[0].y);
        context.lineTo(intercepts[1].x, intercepts[1].y);
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
    var red = {
      red: 255,
      green: 0,
      blue: 0,
      alpha: 255
    };

    if (!capture) {
      for (var i = 0; i <= canvasHeight; i++) {
        setColor(imageData.data, i, i, canvasWidth, red);
        setColor(imageData.data, i, i+1, canvasWidth, red);
      }
      outContext.putImageData(imageData, 0, 0);
      outContext.strokeStyle = '#0000FF';
      outContext.lineWidth = 2;
      outContext.beginPath();
      outContext.moveTo(0,0);
      outContext.lineTo(canvasWidth,canvasHeight);
      outContext.closePath();
      outContext.stroke();

      drawLines(canvas, outContext);
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
      // houghFuncs.accumulate(x, y, sum);
    });
    // capture = !capture;
    // houghResults = houghFuncs.done();
    for (var j = 0; j < canvasHeight; j++) {
      setColor(outData.data, j, j, canvasWidth, red);
      setColor(outData.data, j, j+1, canvasWidth, red);
    }
    outContext.putImageData(outData, 0, 0);
    drawLines(canvas, outContext);
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