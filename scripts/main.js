/*! This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/* global camera, setColor, getIntercepts, detectEdges, hough */

'use strict';

$(function () {

  var firstRun = true;
  var capture = false;

  $('#tempResult').click(function () {
    console.log('Capturing!');
    capture = !capture;
    return false;
  });

  // var houghResults = null;
  // houghResults = [
  //   {count:2, rho:200, theta:-89 / 180 * Math.PI},
  //   {count:2, rho:200, theta:-45 / 180 * Math.PI},
  //   {count:2, rho:200, theta:0 / 180 * Math.PI},
  //   {count:2, rho:200, theta:45 / 180 * Math.PI},
  //   {count:2, rho:200, theta:90 / 180 * Math.PI}
  // ];

  // var drawLines = function (canvas, context, log) {
  //   if (houghResults) {
  //     var width = canvas.width;
  //     var height = canvas.height;
  //     context.strokeStyle = '#0000FF';
  //     context.lineWidth = 2;
  //     context.beginPath();

  //     for (var result in houghResults) {
  //       var data = houghResults[result];
  //       // if (log) {
  //       //   console.log(JSON.stringify(data));
  //       // }
  //       var intercepts = getIntercepts(data.rho, data.theta, {width:width, height:height});
  //       // if (log) {
  //       //   console.log('Drawing line from (' + intercepts[0].x + ',' + intercepts[0].y + ') ' +
  //       //               'to (' + intercepts[1].x + ',' + intercepts[1].y + ').');
  //       // }
  //       context.moveTo(intercepts[0].x, intercepts[0].y);
  //       context.lineTo(intercepts[1].x, intercepts[1].y);
  //     }
  //     context.closePath();
  //     context.stroke();
  //   }
  // };

  var cutoff = 0.33;
  var sums = [];

  var outContext;
  var outData;
  // var houghFuncs;

  var onFrame = function (canvas) {
    var context = canvas.getContext('2d');
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;
    var imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);

    if (!capture) {
      // for (var result in accums) {
      //   var outColor = {
      //     red: 255,
      //     green: 0,
      //     blue: 0,
      //     alpha: 255
      //   };
      //   setColor(imageData.data, result[0], result[1], canvas.width, outColor);
      // }
      outContext.putImageData(imageData, 0, 0);
      // drawLines(canvas, outContext, firstRun);
      firstRun = false;
      return;
    }
    // capture = false;
    console.log('Actually capturing!');
    detectEdges(imageData, canvasWidth, canvasHeight, function (x, y, color, sum) {
      var outColor = {
        red: color.red,
        green: color.green,
        blue: color.blue,
        alpha: color.alpha
      };
      sums.push(sum);
      if (sum > cutoff) {
        outColor.green = 255;
      }

      setColor(outData.data, x, y, canvasWidth, outColor);
      // houghFuncs.accumulate(x, y, sum);
    });

    // var points = [[0,0], [0,15], [0,10], [0,470]];
    // points.forEach(function (element) {
    //   houghFuncs.accumulate(element[0], element[1], true);
    // });

    sums.sort(function(a, b) {
      return b - a;
    });
    cutoff = sums[Math.round(sums.length / 15)];
    sums = [];
    // houghResults = houghFuncs.done().slice(0, 6);
    // for (result in accums) {
    //   var outColor = {
    //     red: 255,
    //     green: 0,
    //     blue: 0,
    //     alpha: 0
    //   };
    //   setColor(outData.data, result[0], result[1], canvas.width, outColor);
    // }
    outContext.putImageData(outData, 0, 0);
    // drawLines(canvas, outContext, true);
    // drawLines(canvas, outContext);
  };

  camera.init({
    onFrame: onFrame,
    fps: 60,

    onSuccess: function(video) {
      // stream succesfully started, yay!
      console.log('Stream Started!');
      $('#info').slideUp();
      $('#tempResult').fadeIn();
      outContext = $('#tempResult')[0].getContext('2d');
      outData = outContext.getImageData(0, 0, video.width, video.height);
      // houghFuncs = hough(video.width, video.height);
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
