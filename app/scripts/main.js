/*! This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/* global camera */

'use strict';

$(function () {

  var onFrame = function (canvas) {
    var context = canvas.getContext('2d');
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;
    var imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);

    var outContext = $('#tempResult')[0].getContext('2d');
    var outData = outContext.getImageData(0, 0, canvasWidth, canvasHeight);

    detectEdges(imageData, outData, canvasWidth, canvasHeight);

    outContext.putImageData(outData, 0, 0);

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