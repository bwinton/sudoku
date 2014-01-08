/*! This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

'use strict';

// Pixel Manipulation Functions.

(function () {
  window.getColor = function (data, x, y, width) {
    var offset = (y * width + x) * 4;
    return {
      red: data[offset],
      green: data[offset + 1],
      blue: data[offset + 2],
      alpha: data[offset + 3]
    };
  };

  window.setColor = function (data, x, y, width, color) {
    var offset = (y * width + x) * 4;
    data[offset] = color.red;
    data[offset + 1] = color.green;
    data[offset + 2] = color.blue;
    data[offset + 3] = color.alpha;
  };

  window.getIntercepts = function (rho, theta, canvas, log) {
    var cos = Math.cos(theta);
    var sin = Math.sin(theta);
    var x = rho * cos;
    var y = rho * sin;
    if (log) {
      console.log('Plotting ' + rho + '@' + (theta/Math.PI*180) + ' as '+ x + ',' + y);
      console.log('cos=' + cos, 'sin=' + sin);
    }

    // calculate 0,y1; max,y2; x1,0; x2;max and
    // pick the ones that are all positive!
    var x0 = x + y / cos * sin;
    var xMax = x - (canvas.height - y) / cos * sin;
    var y0 = y + x / sin * cos;
    var yMax = y - (canvas.width - x) / sin * cos;
    if (log) {
      console.log('Proposed X: (' + x0 + ',0) ' +
                  '(' + xMax + ',' + canvas.height + ')');
      console.log('Proposed Y: (0,' + y0 + ') ' +
                  '(' + canvas.width + ',' + yMax + ')');
    }

    var top;
    if (x0 >= 0 && x0 <= canvas.width) {
      top = {x:x0, y:0};
    } else if (xMax >= 0 && xMax <= canvas.width) {
      top = {x:xMax, y:canvas.height};
    }

    var left;
    if (y0 >= 0 && y0 <= canvas.width) {
      left = {x:0, y:y0};
    } else if (yMax >= 0 && yMax <= canvas.width) {
      left = {x:canvas.width, y:yMax};
    }

    if (Math.round(cos * 10000000) === 0) {
      // Handle horizontal lines.
      top = {x:0, y:y};
      left = {x:canvas.width, y:y};
    }
    if (Math.round(sin * 10000000) === 0) {
      // Handle vertical lines.
      top = {x:x, y:0};
      left = {x:x, y:canvas.height};
    }

    if (log) {
      console.log('Going with:', JSON.stringify([top, left]));
    }

    top = {x:Math.round(top.x), y:Math.round(top.y)};
    left = {x:Math.round(left.x), y:Math.round(left.y)};
    return [top, left];
  };
})();