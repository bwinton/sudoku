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
})();