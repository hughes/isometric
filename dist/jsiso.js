requirejs.config({
    baseUrl: "jsiso",
    paths: {
      canvasControl: 'canvas/Control',
      canvasInput: 'canvas/Input',
    }
});
define("../config", function(){});

/*  
Copyright (c) 2013 Iain Hamilton

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. 
*/

define('canvas/Control',[],function() {

  // Private properties for Control

  var canvasElement = null;

  var width = null;
  var height = null;

  /**
   * Checks if browser supports the canvas context 2d
   * @return {Boolean}
   */
  function _supported () {
    var elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d'));
  }


  function _getRatio() {
    var ctx = document.createElement("canvas").getContext("2d"),
    dpr = window.devicePixelRatio || 1,
    bsr = ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio || 1;
    return dpr / bsr;
  }

 
  function _create(name, w, h, style, element, usePixelRatio) {
    var pxRatio = 1;
    var canvasType = null;
    if (_supported()) {
      if (usePixelRatio) {
        pxRatio = _getRatio();
      }
      width = w;
      height = h;
      canvasElement = document.createElement('canvas');
      canvasElement.id = name;
      canvasElement.tabindex = "1";
      for (var s in style) {
        canvasElement.style[s] = style[s];
      }
      console.log(usePixelRatio);
      canvasType = '2d';
      canvasElement.style.width = w + "px";
      canvasElement.style.height = h + "px";
      canvasElement.width = w * pxRatio || window.innerWidth;
      canvasElement.height = h * pxRatio || window.innerHeight;
      canvasElement.getContext(canvasType).setTransform(pxRatio, 0, 0, pxRatio, 0, 0);
      if (!element) {
        // Append Canvas into document body
        return document.body.appendChild(canvasElement).getContext(canvasType);
      }
      else {
        // Place canvas into passed through body element
        return document.getElementById(element).appendChild(canvasElement).getContext(canvasType);
      }
    }
    else {
      // Create an HTML element displaying that Canvas is not supported :(
      var noCanvas = document.createElement("div");
      noCanvas.style.color = "#FFF";
      noCanvas.style.textAlign = "center";
      noCanvas.innerHTML = "Sorry, you need to use a more modern browser. We like: <a href='https://www.google.com/intl/en/chrome/browser/'>Chrome</a> &amp; <a href='http://www.mozilla.org/en-US/firefox/new/'>Firefox</a>";
      return document.body.appendChild(noCanvas);
    }
  }

  function _style(setting, value) {
    canvasElement.style[setting] = value;
  }

  /**
  * Fullscreens the Canvas object
  */
  function _fullScreen() {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    canvasElement.style.width = window.innerWidth + "px";
    canvasElement.style.height = window.innerHeight + "px";
    canvasElement.height = window.innerHeight;
    canvasElement.width = window.innerWidth;
    canvasElement.style.position = "absolute";
    canvasElement.style.zIndex = 100;
    
    window.onresize = function(e){
      _update(0, 0);
      //I think we need a repaint here.
    };
    window.top.scrollTo(0, 1);
  }


  /**
  * Update the Canvas object dimensions
  * @param {Number} width
  * @param {Number} height
  */
  function _update(w, h) {
    canvasElement.width = w || window.innerWidth;
    canvasElement.height = h || window.innerHeight;
  }


  /**
  * Return the created HTML Canvas element when it is called directly
  * @return {HTML} Canvas element
  */
  function canvas() {
    return canvasElement;
  }


  // ----
  // -- Public properties for Control
  // ----
  canvas.create = _create;
  canvas.fullScreen = _fullScreen;
  canvas.update = _update;
  canvas.style = _style;


  // Return Canvas Object
  return canvas;
});
/*  
Copyright (c) 2013 Iain Hamilton

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. 
*/



/*** 

jsiso/canvas/Input

Simplifies adding multiple input methods
for canvas interaction

***/
define('canvas/Input',[],function() {

// Return Input Class

  return function(doc, canvas) {

    // Private properties for Input

    /**
    * Used for getting keyboard interaction keycodes
    * @param {Event} Event
    * @param {Function} Callback function
    * @param {Boolean} If the key is down or up
    * @return {Function} callback({Number} keycode, {Boolean} pressed)
    */
    function _keyboardInput(e, callback, pressed) {
      var keyCode;
      if(e === null) {
        keyCode = window.e.keyCode;
      }
      else {
        keyCode = e.keyCode;
      }
      callback(keyCode, pressed, e);
    }


    /**
    * Used for getting touch screen coordinates
    * @param {Event} Event
    * @param {Function} Callback function
    * @param {Boolean} If the screen is being touched
    * @return {Function} callback({Object} X & Y touch coordinates, {Boolean} pressed)
    */
    function _mobileInput(e, callback, pressed) {
      var coords = {};
      if (pressed) {
        coords.x = e.touches[0].pageX - canvas.offsetLeft;
        coords.y = e.touches[0].pageY - canvas.offsetTop;
      }
      callback(coords, pressed);
    }


    /**
    * Used for getting mouse click coordinates
    * @param {Event} Event
    * @param {Function} Callback function
    * @return {Function} callback({Object} X & Y mouse coordinates)
    */
    function _mouseInput(e, callback) {
      var coords = {};
      coords.x = e.pageX - canvas.offsetLeft;
      coords.y = e.pageY - canvas.offsetTop;
      callback(coords);
    }


    /**
    * Performs the callback function when screen orientation change is detected
    * @param {Function} Callback function
    * @return {Function} callback()
    */
    function _orientationChange(callback) {
      window.addEventListener("orientationchange", function() {
        callback();
      }, false);
    }


    // ----
    // -- Public properties for Input
    // ----

    return {

      /**
      * Public method for adding keyboard input
      * @param {Function} Callback function
      */
      keyboard: function(callback) {
        // Callback returns 2 paramaters:
        // -- Pressed keycode
        // -- True if button is down / False if button is up
        doc.onkeydown = function(event) {
          _keyboardInput(event, callback, true);
        };
        doc.onkeyup = function(event) {
          _keyboardInput(event, callback, false);
        };
      },


      /**
      * Public method for adding orientation detection
      * @param {Function} Callback function
      */
      orientationChange: function(callback) {
        // Callback returns if orientation of screen is changed
        _orientationChange(callback);
      },


      /**
      * Public method for adding mobile touch detection
      * @param {Function} Callback function
      */
      mobile: function(callback) {
        var touchendCoords = {};
        // Callback returns when screen is touched and when screen touch ends
        canvas.addEventListener('touchstart', function(event) {
          event.preventDefault();
          _mobileInput(event, function(coords, pressed) {
            touchendCoords = coords;
            callback(coords, pressed);
          }, true);
        }, false);
        canvas.addEventListener('touchend', function(event) {
          event.preventDefault();
          callback(touchendCoords, false);
        });
      },


      /**
      * Public method for adding mouse click detection
      * @param {Function} Callback function
      */
      mouse_action: function(callback) {
        // Callback returns on mouse down
        canvas.addEventListener('mousedown', function(event) {
          event.preventDefault();
          _mouseInput(event, callback);
        }, false);
      },


      /**
      * Public method for adding mouse move detection
      * @param {Function} Callback function
      */
      mouse_move: function(callback) {
        // Callback returns when mouse is moved
        canvas.addEventListener('mousemove', function(event) {
          event.preventDefault();
          _mouseInput(event, callback);
        }, false);
      }

    };

  };

});
/*  
Copyright (c) 2013 - 2015 Iain Hamilton

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. 
*/


define('img/load',[],function() {

  /**
  * Loads an array of images or an array of spritesheets for using within JsIso
  * @param  {Array} graphics an array of objects specifying the image locations and optional spritesheet settings
  * @return {Promise.<Array>}          Returns images in an array for using once fulfilled
  */
  /* Example:
  [{
    graphics: ["img/sground.png"],
    spritesheet: { // OPTIONAL spritesheet is optional for images to be auto split up
      width: 24, 
      height: 24, 
      offsetX: 0, // OPTIONAL
      offsetY: 0, // OPTIONAL
      spacing: 0, // OPTIONAL
      firstgid: 0 // OPTIONAL
    }
  }]
  */

  return function(graphics) {

/**
 * Breaks up a solid image into smaller images via canvas and returns the individual sprite graphics and individual ones
 * @param  {Object} spritesheet contains the spritesheet image and required paramaters for measuring the individual image locations for cropping
 * @return {Promise.<Array>}             Returns seperated spritesheet images in array for using once fulfilled
 */
    function _splitSpriteSheet(spritesheet) {
      return new Promise(function(resolve, reject) {
        var loaded = 0; // Images total the preloader has loaded
        var loading = 0; // Images total the preloader needs to load
        
        var images = [];
        var ctx = document.createElement('canvas');
        var tileManip;
        var imageFilePathArray = [];
        var spriteID = (spritesheet.firstgid || 0);
        var tileRow;
        var tileCol;
        var spritesheetCols = Math.floor(spritesheet.files[spritesheet.dictionary[0]].width / (spritesheet.width));
        var spritesheetRows = Math.floor(spritesheet.files[spritesheet.dictionary[0]].height / (spritesheet.height));
        loading +=  spritesheetCols * spritesheetRows;
        ctx.width = spritesheet.width;
        ctx.height = spritesheet.height;
        tileManip = ctx.getContext('2d');
        for (var i = 0; i < spritesheetRows; i++) {
          for (var j = 0; j < spritesheetCols; j++) {
            tileManip.drawImage(spritesheet.files[spritesheet.dictionary[0]], j * (spritesheet.width + spritesheet.offsetX  + spritesheet.spacing) + spritesheet.spacing, i * (spritesheet.height + spritesheet.offsetY + spritesheet.spacing) + spritesheet.spacing,  spritesheet.width + spritesheet.offsetX - spritesheet.spacing, spritesheet.height  + spritesheet.offsetY - spritesheet.spacing, 0, 0, spritesheet.width, spritesheet.height);
            imageFilePathArray[spriteID] = spriteID;
            images[spriteID] = new Image();
            images[spriteID].src = ctx.toDataURL();
            tileManip.clearRect (0, 0, spritesheet.width, spritesheet.height);
            images[spriteID].onload = function () {
              loaded ++;
              if (loaded === loading) {
                resolve({files: images, dictionary: imageFilePathArray});
              }
            };
            spriteID ++;
          }
        }
      });
    }

    /**
     * Takes an individual set of graphics whether a singular image, an array of images, or spritesheet and loads it for using within JsIso
     * @param  {Object} graphic a single graphic set with the optional spritesheet paramaters for preloading
     * @return {Promite.<Array>}         Contains the loaded images for use
     */
    function _imgPromise(graphic) {
      return new Promise(function(resolve, reject) {

        var loaded = 0; // Images total the preloader has loaded
        var loading = 0; // Images total the preloader needs to load

        var images = [];
        loading += graphic.graphics.length;
       
        graphic.graphics.map(function(img) {
          imgName = img;
          if (graphic.removePath === undefined || graphic.removePath === true) {
            imgName = img.split("/").pop();
          }
          images[imgName] = new Image();
          images[imgName].src = img;
          images[imgName].onload = function() {
            loaded ++;
            if (loaded === loading && !graphic.spritesheet) {
              resolve({files: images, dictionary: graphic.graphics});
            }
            else {
              if (graphic.spritesheet) {
                _splitSpriteSheet({
                  files: images,
                  dictionary: graphic.graphics,
                  width: graphic.spritesheet.width,
                  height: graphic.spritesheet.height,
                  offsetX: (graphic.spritesheet.offsetX || 0),
                  offsetY: (graphic.spritesheet.offsetY || 0),
                  spacing: (graphic.spritesheet.spacing || 0),
                  firstgid: (graphic.spritesheet.firstgid || 0)
                }).then(function(response) {
                  resolve(response);
                });
              }
            }
          };
        });
        if (graphic.removePath === undefined || graphic.removePath === true) {
          for (var i = 0; i < graphic.graphics.length; i++) {
            graphic.graphics[i] = graphic.graphics[i].split("/").pop();
          }
        }
      });
    }

    if (Object.prototype.toString.call(graphics) === '[object Array]') {
      var promises = [];
      for (var i = 0; i < graphics.length; i++) {
        promises.push(_imgPromise(graphics[i]));
      }
      return Promise.all(promises);
    }
    else {
      return _imgPromise(graphics);
    }

  };
});
/*  
Copyright (c) 2013 - 2015 Iain Hamilton

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. 
*/


define('json/load',[],function() {

  /**
  * Loads an array of JSON response paths
  * @param  {Array} contains strings of the JSON response locations
  * @return {Promise.<Array>}          Returns JOSN data in an array for using once fulfilled
  */
  return function (paths) {


/**
 * Loads a single path that contains a JSON response
 * @param  {String} path JSON response location
 * @return {Promise.<Object>}      contains the loaded JSON
 */
    function _jsonPromise(path) {
       return new Promise(function(resolve, reject) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", path, true);
        xmlhttp.send();
        xmlhttp.onload = function() {
          if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            resolve(JSON.parse(xmlhttp.responseText));
          }
          else {
            reject();
          }
        };
      });
    }

    if (typeof paths !== "string") {
      var promises = [];
      for (var i = 0; i < paths.length; i++) {
        promises.push(_jsonPromise(paths[i]));
      }
      return Promise.all(promises);
    }
    else {
      return _jsonPromise(paths);
    }
  };
});
/*  
Copyright (c) 2013 Iain Hamilton

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. 
*/


define('particles/Effect',[],function() {
  return function(emitter) {

    var emitters = [emitter];
    this.pause = false;

    return {
      AddEmitter: function (emitter) {
        emitters.push(emitter);
      },

      Draw: function (x, y, scale) {
        if (!this.pause) {
          for (var i = 0, tmpTotal = emitters.length; i < tmpTotal; i++) {
            if (!emitters[i].loaded) {
              emitters[i].x = x;
              emitters[i].y = y;
              emitters[i].Load();
            }
            if (scale) {
              emitters[i].Scale(scale);
            }
            emitters[i].ShiftTo(x, y);
            emitters[i].Draw();
          }
        }
      }
    };
  };
});
/*  
Copyright (c) 2013 Iain Hamilton

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. 

- Author : Iain M Hamilton - <iain@beakable.com> - http://www.beakable.com

  Twitter: @beakable

*/

/** jsiso/utils simple common functions used throughout JsIso **/

define('utils',[],function() {

  return {

    roundTo: function (num, dec) {
      return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
    },

    rand: function (l, u) {
      return Math.floor((Math.random() * (u - l + 1)) + l);
    },

    remove: function (from, to) {
      var rest = this.slice((to || from) + 1 || this.length);
      this.length = from < 0 ? this.length + from : from;
      return this.push.apply(this, rest);
    },

    range: function(from, to) {
      return {from: from, to: to};
    },

    flipTwoDArray: function(arrayLayout, direction) {
      var tempArray = [],
          tempLine = [],
          i, j;
      if (direction === "horizontal") {
        for (i = arrayLayout.length - 1 ; i >= 0; i--) {
           for (j = 0; j < arrayLayout[i].length; j++) {
            tempLine.push(arrayLayout[i][j]);
          }
          tempArray.push(tempLine);
          tempLine = [];
        }
        return tempArray;
      }
      else if (direction === "vertical") {
        for (i = 0; i < arrayLayout.length; i++) {
           for (j = arrayLayout[i].length - 1; j >= 0; j--) {
            tempLine.push(arrayLayout[i][j]);
          }
          tempArray.push(tempLine);
          tempLine = [];
        }
        return tempArray;
      }
    },

    rotateTwoDArray: function(arrayLayout, direction) {
      var tempArray = [],
          tempLine = [],
          i, j;
      var w = arrayLayout.length;
      var h = (arrayLayout[0] ? arrayLayout[0].length : 0);
      if (direction === "left") {
        for (i = 0; i < h; i++) {
          for (j = 0; j < w; j++) {
            if (!tempArray[i]) {
              tempArray[i] = [];
            }
            tempArray[i][j] = arrayLayout[w - j - 1][i];
          }
        }
        return tempArray;
      }
      else if (direction === "right") {
        for (i = 0; i < h; i++) {
          for (j = 0; j < w; j++) {
            if (!tempArray[i]) {
              tempArray[i] = [];
            }
            tempArray[i][j] = arrayLayout[j][h - i - 1];
          }
        }
        return tempArray;
      }
    },

    lineSplit: function(ctx, text, width) {
      var textLines = [];
      var elements = "";
      var line = "";
      var tempLine = "";
      var lastword = null;
      if(ctx.measureText(text).width > width) {
        elements = text.split(" ");
        for (var i = 0; i < elements.length; i++) {
          tempLine += elements[i] + " ";
          if (ctx.measureText(tempLine).width < width) {
            line += elements[i] + " ";
            lastword = elements[i];
          }
          else {
            if (lastword && lastword !== elements[i]) { // Prevent getitng locked in a large word
              i --;
              textLines.push(line);
            }
            else {
              textLines.push(tempLine);
            }
            line = "";
            tempLine = "";
          }
        }
      }
      else{
        textLines[0] = text;
      }
      if (line !== "") {
        textLines.push(line);
      }
      return textLines;
    }

  };

});
/*  
Copyright (c) 2014 Iain Hamilton

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. 
*/

define('particles/Particle',[
  'utils'
],

function(utils) {

  return function () {


    var age = 0;

    return {
    
      active: false, // draw or not

      drawdelay: -1, // how old before the particle can start drawing

      life: 0,    // particle lifespan

      fade: 0.01,   // fade speed

      r: 255,       // red intensity

      g: 0,         // green intensity

      b: 0,         // blue intensity

      x: 0.0,       // x position

      y: 0.0,       // y position

      xi: 0.1,      // x axis speed

      yi: 0.0,      // y axis speed

      xg: 0.0,      // x gravity strength

      yg: 0.0,      // y gravity strength

      radius: 5.0,  // particle radius

      slowdown: 2.0, // particle speed slowdown

      minxb: -1,     // min x axis boundry

      maxxb: 999999, // max x axis boundry

      minyb: -1,     // min y axis boundry

      maxyb: 999999, // max y axis boundry

      Draw: function(context) {

        if (this.active) {

          if (this.drawdelay == -1 || age >= this.drawdelay) {

            // Determine alpha based on life

            var alpha = this.life > 1.0 ? 1 : this.life < 0.0 ? 0 : this.life;

            var rgbstr = "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + utils.roundTo(alpha, 1) + ")";

            var rgbbgstr = "rgba(" +  Math.floor(this.r / 3) +  ", " +  Math.floor(this.g / 3) +  ", " +  Math.floor(this.b / 3) +  ", 0)";

            // Draw the particle

            if (Number(this.x) !== undefined &&  Number(this.y) !== undefined) {
              
              if (this.x > this.minxb || this.x < this.maxxb || this.y > this.minyb || this.y < this.maxyb) {
                var p = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
                p.addColorStop(0, rgbstr);
                p.addColorStop(1, rgbbgstr);
                context.fillStyle = p;
                context.fillRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
              }


              // Update the position base on speed and direction

              this.x += this.xi / (this.slowdown * 100);

              this.y -= this.yi / (this.slowdown * 100); // canvas negative is up so flip the sign

              // Apply gravity to the speed and direction

              this.xi += this.xg;

              this.yi += this.yg;

              // Update the life based on fade

              this.life -= this.fade;

              this.radius -= (this.radius / 1) * this.fade;

              /// Kill dead or out of bound particles

              if (this.life <= 0) {

                  this.active = false;

              }
            }
          }

          // Increment the particle age
          age++;
        }
      }
    };
  };
});
/*  
Copyright (c) 2014 Iain Hamilton

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. 
*/

define('particles/Emitter',[
  'particles/Particle',
  'utils'
],

function(Particle, utils) {

  return function(ctx, x, y, pcount, loop, xboundRange, yboundRange) {

    return {
      particles: [],

      xshiftOffset: 0,

      yshiftOffset: 0,

      loaded: false,

      xOffset: 0,

      yOffset: 0,

      pause: false,

      composite: 'lighter',

      xRange: utils.range(0, 0),

      yRange: utils.range(0, 0),

      drawdelayRange: utils.range(-1, -1),

      lifeRange: utils.range(1, 1), // 0.000 - 1.000

      fadeRange: utils.range(1, 1), // 0.000 - 1.000

      redRange: utils.range(255, 255), // 0 - 255

      greenRange: utils.range(0, 0), // 0 - 255

      blueRange: utils.range(0, 0), // 0 - 255

      xiRange: utils.range(10, 10),

      yiRange: utils.range(10, 10),

      xgRange: utils.range(0, 0),

      ygRange: utils.range(0, 0),

      slowdownRange: utils.range(1, 1), // 0.000

      radiusRange: utils.range(10, 10),

      scale: 1,

      x: x,

      y: y,

      Load: function(x, y) {
        this.particles = [];
        for (var i = 0; i < pcount; i++) {
          this.particles.push(this.CreateParticle(false, false, x, y));
        }
        this.loaded = true;
      },

      ShiftTo: function (x, y) {
        this.ShiftBy(x - this.x, y - this.y);
      },

      Scale: function (scale) {
        this.scale = scale;
      },

      ShiftBy: function (xoffset, yoffset) {
        this.xshiftOffset += xoffset;
        this.yshiftOffset += yoffset;
        this.x += xoffset;
        this.y += yoffset;
      },

      Draw: function (x, y) {
        if (x) { this.x = x; }
        if (y) { this.y = y; }
        if (this.loaded && !this.pause) {
          ctx.save();

          ctx.globalCompositeOperation = this.composite;

          for (var i = 0, tmpsize = this.particles.length; i < tmpsize; i++) {

            this.particles[i].x += this.xshiftOffset;

            this.particles[i].y += this.yshiftOffset;

            this.particles[i].Draw(ctx);

            if (loop && loop !== "false" && !this.particles[i].active) {

              this.particles[i] = this.CreateParticle(this.particles[i], true);

            }

          }

          ctx.restore();

          this.xshiftOffset = 0;
          this.yshiftOffset = 0;

        }

      },

      CreateParticle: function(reload, draw, x , y) {

        var p;
        if (reload) {
          p = reload;
        }
        else {
          p = new Particle();
        }
        if (draw || loop === false || loop === "false") {
          p.active = true;
          if (x) {
            p.x = x + utils.rand(this.xRange.from * this.scale, this.xRange.to * this.scale) + this.xOffset * this.scale;
          }
          else {
            p.x = this.x + utils.rand(this.xRange.from * this.scale, this.xRange.to * this.scale) + this.xOffset * this.scale;
          }
          if (y) {
            p.y = y + utils.rand(this.yRange.from * this.scale, this.yRange.to * this.scale) + this.yOffset * this.scale;
          }
          else {
            p.y = this.y + utils.rand(this.yRange.from * this.scale, this.yRange.to * this.scale) + this.yOffset * this.scale;
          }

          p.drawdelay = 0;

          p.life = utils.rand(this.lifeRange.from * 1000, this.lifeRange.to * 1000) / 1000;

          p.fade = utils.rand(this.fadeRange.from * 1000, this.fadeRange.to * 1000) / 1000;

          p.r = utils.rand(this.redRange.from, this.redRange.to);

          p.b = utils.rand(this.blueRange.from, this.blueRange.to);

          p.g = utils.rand(this.greenRange.from, this.greenRange.to);

          p.xi = utils.rand(this.xiRange.from * this.scale, this.xiRange.to * this.scale);

          p.yi = utils.rand(this.yiRange.from * this.scale, this.yiRange.to * this.scale);

          p.xg = utils.rand(this.xgRange.from * this.scale, this.xgRange.to * this.scale);

          p.yg = utils.rand(this.ygRange.from * this.scale, this.ygRange.to * this.scale);

          p.slowdown = utils.rand(this.slowdownRange.from * 1000, this.slowdownRange.to * 1000) / 1000;

          p.radius = utils.rand(this.radiusRange.from * this.scale, this.radiusRange.to * this.scale);

          p.minxb = xboundRange.from * this.scale;

          p.maxxb = xboundRange.to * this.scale;

          p.minyb = yboundRange.from * this.scale;

          p.maxyb = yboundRange.to * this.scale;
        }
        return p;
      }

      };
    };
});
/*  
Copyright (c) 2013 Iain Hamilton

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. 
*/

define('particles/EffectLoader',[
  'particles/Emitter',
  'particles/Effect',
  'utils'
],

function(Emitter, Effect, utils) {

  function _get(name, ctx, xBoundRange, yBoundRange) {

    switch (String(name)) {

      case 'fire':

        var fire = new Emitter(ctx, 0, 0, 20, true, xBoundRange, yBoundRange);

        fire.xRange = utils.range(-22, 18);

        fire.yRange = utils.range(0, 0);

        fire.lifeRange = utils.range(0.8, 1);

        fire.fadeRange = utils.range(0.02, 0.08);

        fire.redRange = utils.range(175, 255);

        fire.greenRange = utils.range(0, 150);

        fire.blueRange = utils.range(0, 0);

        fire.xiRange = utils.range(-10, 10);

        fire.yiRange = utils.range(0, 0);

        fire.xgRange = utils.range(-10, 10);

        fire.ygRange = utils.range(10, 10);

        fire.slowdownRange = utils.range(0.5, 1);

        fire.radiusRange = utils.range(20, 30);

        fire.composite = 'lighter';

        fire.xOffset = 43;

        fire.yOffset = 30;

        effect = new Effect(fire);

      break;

      case 'well':

        var well = new Emitter(ctx, 0, 0, 20, true, xBoundRange, yBoundRange);

        well.xRange = utils.range(-22, 18);

        well.yRange = utils.range(0, 0);

        well.lifeRange = utils.range(0.8, 1);

        well.fadeRange = utils.range(0.02, 0.08);

        well.redRange = utils.range(10, 20);

        well.greenRange = utils.range(10, 30);

        well.blueRange = utils.range(120, 120);

        well.xiRange = utils.range(-10, 10);

        well.yiRange = utils.range(0, 0);

        well.xgRange = utils.range(-4, 4);

        well.ygRange = utils.range(-10, -10);

        well.slowdownRange = utils.range(0.5, 1);

        well.radiusRange = utils.range(3, 5);

        well.composite = 'lighter';

        well.xOffset = 46;

        well.yOffset = 54;

        var wellB = new Emitter(ctx, 0, 0, 20, true, xBoundRange, yBoundRange);

        wellB.xRange = utils.range(-22, 18);

        wellB.yRange = utils.range(0, 0);

        wellB.lifeRange = utils.range(0.8, 1);

        wellB.fadeRange = utils.range(0.02, 0.08);

        wellB.redRange = utils.range(10, 20);

        wellB.greenRange = utils.range(10, 30);

        wellB.blueRange = utils.range(120, 120);

        wellB.xiRange = utils.range(-10, 10);

        wellB.yiRange = utils.range(0, 0);

        wellB.xgRange = utils.range(-4, 4);

        wellB.ygRange = utils.range(- 10, -10);

        wellB.slowdownRange = utils.range(0.5, 1);

        wellB.radiusRange = utils.range(3, 5);

        wellB.composite = 'lighter';

        wellB.xOffset = 31;

        wellB.yOffset = 99;

        effect = new Effect(well);

        effect.AddEmitter(wellB);

      break;

      case 'wcandle':

        var wallcandle = new Emitter(ctx, 0, 0, 20, true, xBoundRange, yBoundRange);

        wallcandle.xRange = utils.range(0, 0);

        wallcandle.yRange = utils.range(1, 1);

        wallcandle.lifeRange = utils.range(0.8, 1);

        wallcandle.fadeRange = utils.range(0.02, 0.08);

        wallcandle.redRange = utils.range(175, 255);

        wallcandle.greenRange = utils.range(0, 150);

        wallcandle.blueRange = utils.range(0, 0);

        wallcandle.xiRange = utils.range(0, 0);

        wallcandle.yiRange = utils.range(0, 0);

        wallcandle.xgRange = utils.range(0, 0);

        wallcandle.ygRange = utils.range(1, 1);

        wallcandle.slowdownRange = utils.range(0.5, 1);

        wallcandle.radiusRange = utils.range(1, 7);

        wallcandle.composite = 'lighter';

        wallcandle.xOffset = 45;

        wallcandle.yOffset = 55;

        effect = new Effect(wallcandle);

      break;

      case 'candleFire':

        var candles = [];

        var candlePositions = [[44, 17], [60, 12], [77, 29]];

        for (var i = 0; i < 3; i++) {

          var candle = new Emitter(ctx, 0, 0, 20, true, xBoundRange, yBoundRange);

          candle.xRange = utils.range(0, 0);

          candle.yRange = utils.range(1, 1);

          candle.lifeRange = utils.range(0.8, 1);

          candle.fadeRange = utils.range(0.02, 0.08);

          candle.redRange = utils.range(175, 255);

          candle.greenRange = utils.range(0, 150);

          candle.blueRange = utils.range(0, 0);

          candle.xiRange = utils.range(0, 0);

          candle.yiRange = utils.range(0, 0);

          candle.xgRange = utils.range(0, 0);

          candle.ygRange = utils.range(1, 1);

          candle.slowdownRange = utils.range(0.5, 1);

          candle.radiusRange = utils.range(1, 7);

          candle.composite = 'lighter';

          candle.xOffset = candlePositions[i][0];

          candle.yOffset = candlePositions[i][1];

          candles.push(candle);

        }

        effect = new Effect(candles[0]);

        effect.AddEmitter(candles[1]);

        effect.AddEmitter(candles[2]);

      break;

      case 'rain':

        var rain = new Emitter(ctx, 0, 0, 100, true, xBoundRange, yBoundRange);

        rain.xRange = utils.range(0, 420);

        rain.yRange = utils.range(-100, 10);

        rain.lifeRange = utils.range(0.8, 1.4);

        rain.fadeRange = utils.range(0.01, 0.08);

        rain.redRange = utils.range(0, 150);

        rain.greenRange = utils.range(0, 150);

        rain.blueRange = utils.range(175, 200);

        rain.xiRange = utils.range(0, 420);

        rain.yiRange = utils.range(-10, -10);

        rain.xgRange = utils.range(0, 50);

        rain.ygRange = utils.range(-40, -50);

        rain.slowdownRange = utils.range(0.5, 1);

        rain.radiusRange = utils.range(7, 10);

        rain.composite = 'lighter';

        effect = new Effect(rain);

      break;

    }
    return effect || {};
  }

  return function() {

    return {
      getEffect: function(name, ctx, xBoundRange, yBoundRange) {
        return _get(name, ctx, xBoundRange, yBoundRange);
      }
    };

  };
});
/*  
Copyright (c) 2013 Iain Hamilton & Edward Smyth

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. 
*/

/***

  jsiso/pathdind/pathfind

  Using the A* Pathfind method
  
  item: - The item being tracked, allows us to assign a webworker to them
  s: start  array [x,y]
  e: end array [x,y] 
  m: map array of map tiles
    - 0 = Clear
    - 1 or bigger = block

***/
define('pathfind/pathfind',['module'], function(self) {

  var workers = [];

  return function (id, start, end, map, diagonal, force) {

    if (workers[id] === undefined) {
      workers[id] = (new Worker(self.uri.replace("pathfind.js", "worker.js?") + Math.random()));
    }

    return new Promise(function(resolve, reject) {

      if (start[0] != end[0] || start[1] != end[1]) {

        var pathfind = {
          worker: workers[id], // Fix to get web worker path from any location
          end: end,
          path: undefined,
          active: false
        };

        // Event Listener
        pathfind.worker.addEventListener('message', function(e) {
          if (typeof e.data[0] !== 'function') {
            pathfind.active = false;
            pathfind.path = e.data;
            resolve(e.data); // Pass data to resolve function
          }
        }, false);

        var pathfindWorker = function (p) {
            if (!p.active) {
              p.end = end;
              p.active = true;
              p.worker.postMessage({s: start, e: end, m: map, d: diagonal}); // Initiate WebWorker  
            }
          };

        // Check if end location is same as previous loop
        if ((force !== undefined && !force) && pathfind.end[0] == end[0] && pathfind.end[1] == end[1] && pathfind.path !== undefined) {

          // Loop through current path
          for (var i = 0, len = pathfind.path.length; i < len; i++) {
            if (pathfind.path[i].x == start[0] && pathfind.path[i].y == start[1]) {
              pathfind.path.splice(0, i);
              resolve(pathfind.path);
              return true;
            }
          }

          // If location not located
          pathfindWorker(pathfind);

        }
        else {
          pathfind.end = end;
          pathfind.path = undefined;

          // Perform Search
          pathfindWorker(pathfind);
        }

      } else {
        workers[id].terminate();
        workers[id] = undefined;
        return false; // No need for pathfind required
      }
    });
  };
});
/*  
Copyright (c) 2013 Iain Hamilton & Edward Smyth

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. 
*/

/*
	Pathfind Worker
*/

self.addEventListener('message', function(evt) {

	// Initial passed values
	var s = evt.data.s,
		e = evt.data.e,
		m = evt.data.m,
		d = (evt.data.d === false) ? false : true; // Allow Diagonal Movement

	/*
		Nodes -
		x: x position
		y: y position
		p: Index of the parent node (Stored in closed array)
		g: Cost from start to current node
		h: Heuristic cost from current node to destination
		f: Cost from start to desination going through current node
	*/
	var node = function (x, y, p, g, h, f) {
		this.x = x;
		this.y = y;
		this.p = p;
		this.g = g;
		this.h = h;
		this.f = f;
	};


	/*
		Heuristic - Estimated movement cost from current square to end position
	*/
	var heuristic = function (current, end) {

		var x = current.x - end.x,
			y = current.y - end.y;

		return Math.pow(x, 2) + Math.pow(y, 2);
	};

	/*
		Difference
	*/
	var diff = function (a, b) {
		return Math.abs((a > b)? a-b : b-a);
	};


	// Set-up Nodes
	s = new node(s[0], s[1], -1, -1, -1, -1); // Start Node
	e = new node(e[0], e[1], -1, -1, -1, -1); // End Node

	/* 
		Set-up Variables
	*/
	var cols = m.length-1, // Get number of rows from map
		rows = m[0].length-1, // Number of columns from map
		o = [], // Open Nodes
		c = [], // Closed Nodes
		mn = new Array(rows*cols), // Store open/closed nodes
		g = 0,
		h = heuristic(s, e),
		f = g + h;

	// Place start node onto list of open nodes
	o.push(s);


	// Initiate Search Loop, keep going while there are nodes in the open list
	while (o.length > 0) {

		// Locate Best Node
		var best = {
				c: o[0].f,
				n: 0
			};

		for (var i = 1, len = o.length; i < len; i++) {
			if (o[i].f < best.c) {
				best.c = o[i].f;
				best.n = i;
			}
		}

		// Set current to best
		var current  = o[best.n];

		// Check if end point has been reached
		if (current.x === e.x && current.y === e.y) {

			var path = [{x: e.x, y: e.y}]; // Create Path 
			// Loop back through parents to complete the path
			while (current.p !== -1) {
				current = c[current.p];
				path.unshift({x: current.x, y: current.y});
			}
			self.postMessage(path); // Return the path
			return true;
		}

		// Remove current node from open list
		o.splice(best.n, 1);
		mn[current.x + current.y * rows * cols] = false; // Set bit to closed

		c.push(current);
		// Search new nodes in all directions
		for (var x = Math.max(0, current.x-1), lenx = Math.min(cols, current.x+1); x <= lenx; x++) {
			for (var y = Math.max(0, current.y-1), leny = Math.min(rows, current.y+1); y <= leny; y++) {
				if (d || (diff(current.x, x) + diff(current.y, y)) <= 1) {

					// Check if location square is open
					if (Number(m[x][y]) === 0) {

						// Check if square is in closed list
						if (mn[x + y * rows * cols] === false) {
							continue;
						}

						// If square not in open list use it
						if (mn[x + y * rows * cols] !== true) {
							var n = new node(x, y, c.length-1, -1, -1, -1); // Create new node
							n.g = current.g + Math.floor(Math.sqrt(Math.pow(n.x - current.x, 2) + Math.pow(n.y-current.y, 2)));
							n.h = heuristic(n, e);
							n.f = n.g + n.h;

							o.push(n); // Push node onto open list

							mn[x + y * rows * cols] = true; // Set bit into open list
						}

					}
				}
			}
		}
	}

	self.postMessage([]); // No Path Found!
	return true;
}, false);
define("pathfind/worker", function(){});

/*  Copyright (c) 2014 Iain Hamilton

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

define('tile/Camera',[], function() {
  return function () {

    var mapLayers;

    var mapWidth;
    var mapHeight;

    var scaledMapWidth;
    var scaledMapHeight;

    var tileWidth;
    var tileHeight;
    var screenWidth;
    var screenHeight;


    var mapOffsetX;
    var mapOffsetY;

    var curZoom;
    var startX = 0;
    var startY = 0;
    var focusX = 0;
    var focusY = 0;
    var rangeX = 0;
    var rangeY = 0;
    
    var isometric = false;

    var xyNextPos = {};

    var lockToScreen = false; // if set to True, tile maps larger than screen will not scroll off screen boundary

    function _setup(layers, mapW, mapH, tileW, tileH, screenW, screenH, curZ, lts) {
      mapLayers = layers;
      mapWidth = mapW;
      mapHeight = mapH;
      tileWidth = tileW;
      tileHeight = tileH;
      curZoom = curZ || 1;
      screenWidth = screenW;
      screenHeight = screenH;
      scaledMapWidth = mapWidth / tileW;
      scaledMapWidth = scaledMapWidth * (tileW * curZoom);
      scaledMapHeight = mapHeight / tileW;
      scaledMapHeight = scaledMapHeight * (tileH * curZoom);
      if (lts) {
        lockToScreen = lts;
      }
      return {
        startX: startX,
        startY: startY,
        pinFocusX: focusX,
        pinFocusY: focusY
      };
    }

    function _getXYCoords(x, y) {
      var positionY, positionX;
      if (!isometric) {
        positionY = Math.round((y - (tileHeight * curZoom) / 2)/ (tileHeight * curZoom));
        positionX = Math.round((x - (tileWidth * curZoom) / 2)/ (tileWidth * curZoom));
      }
      else {
        positionY = (2 * (y - mapOffsetY) - x + mapOffsetX) / 2;
        positionX = x + positionY - mapOffsetX - (tileHeight * curZoom);
        positionY = Math.round(positionY / (tileHeight * curZoom));
        positionX = Math.round(positionX / (tileHeight * curZoom));
      }
      return {x: positionX, y: positionY};
    }

    function _setFocus(posX, posY, cameraRangeX, cameraRangeY, setZoom) {
      var xyMapOffset;
      var i;

      if (setZoom !== undefined) {
        curZoom = setZoom;
        scaledMapWidth = mapWidth / tileWidth;
        scaledMapWidth = scaledMapWidth * (tileWidth * curZoom);
        scaledMapHeight = mapHeight / tileHeight;
        scaledMapHeight = scaledMapHeight * (tileHeight * curZoom);
        screenHeight = Math.round(window.innerHeight / (tileHeight * curZoom));
        screenWidth = Math.round(window.innerWidth / (tileWidth * curZoom));
      }
      rangeX = cameraRangeX || rangeX;
      rangeY = cameraRangeY || rangeY;
      startX = Math.round(posX - screenWidth / 2);
      startY = Math.round(posY - screenHeight / 2);

      if (!lockToScreen) {
        if (startX < 0) {
          startX = 0;
        }
        if (startY < 0) {
          startY = 0;
        }
      }

      if (screenHeight * tileHeight > scaledMapHeight) {
        for (i = 0; i < mapLayers.length; i++) {
          mapLayers[i].setOffset(null, Math.round(screenHeight * (tileHeight * curZoom) / 2 - scaledMapHeight / 2));
        }
      }
      else {
        for (i = 0; i < mapLayers.length; i++) {
          if (startY < 0) {
            mapLayers[i].setOffset(null, Math.round(-(tileHeight * curZoom) * posY + (posY * (tileHeight * curZoom))));
          }
          else {
            if (lockToScreen && startY + screenHeight > scaledMapHeight / tileHeight) {
              mapLayers[i].setOffset(null, -(Math.round(scaledMapHeight / tileHeight) - screenHeight) * tileHeight + tileHeight);
            }
            else {
              mapLayers[i].setOffset(null, Math.round(-(tileHeight * curZoom) * posY + (screenHeight / 2 * (tileHeight * curZoom))));
            }
          }
        }
      }
      if (screenWidth * tileWidth > scaledMapWidth) {
        for (i = 0; i < mapLayers.length; i++) {
          mapLayers[i].setOffset(Math.round(screenWidth * (tileWidth * curZoom) / 2 - scaledMapWidth / 2), null);
        }
      }
      else {
        for (i = 0; i < mapLayers.length; i++) {
          if (startX < 0) {
            mapLayers[i].setOffset(Math.floor(screenWidth * (tileWidth * curZoom) / 2 - scaledMapWidth / 2), null);
          }
          else {
            if (lockToScreen && startX + screenWidth > scaledMapWidth / tileWidth) {
              mapLayers[i].setOffset(-(Math.floor(scaledMapWidth / tileWidth)  - screenWidth) * tileWidth, null);
            }
            else {
              mapLayers[i].setOffset(Math.round(-(tileWidth * curZoom) * posX + (screenWidth / 2 * (tileWidth * curZoom))), null);
            }
          }
        }
      }

      xyMapOffset = mapLayers[0].getOffset();

      focusX = posX * (curZoom * tileWidth) + xyMapOffset.x;
      focusY = posY * (curZoom * tileHeight) + xyMapOffset.y;
      xyNextPos = _getXYCoords(focusX - xyMapOffset.x, focusY - xyMapOffset.y);
      var startXNew = Math.floor(xyNextPos.x - rangeX / 2);
      var startYNew = Math.floor(xyNextPos.y - rangeY / 2);
      if (!lockToScreen) {
        if (startXNew < 0) {
          startXNew = 0;
        }
        if (startYNew < 0) {
          startYNew = 0;
        }
      }
      /*if (startXNew + screenWidth > scaledMapWidth / (tileWidth * curZoom)) {
        startXNew = scaledMapWidth / (tileWidth * curZoom) - screenWidth;
      }
      if (startYNew + screenHeight > scaledMapHeight / (tileHeight * curZoom)) {
        startYNew = scaledMapHeight / (tileHeight * curZoom) - screenHeight;
      }*/
      return {
        startX: startXNew,
        startY: startYNew,
        pinFocusX: Math.floor(focusX),
        pinFocusY: Math.floor(focusY),
        tileX: Math.floor(posX),
        tileY: Math.floor(posY)
      };
    }

    // direction: "up", "down", "left", "right" - distance: int
    function _move(direction, distance) {
      var xyMapOffset = mapLayers[0].getOffset();
      xyNextPos = _getXYCoords(focusX - xyMapOffset.x, focusY - xyMapOffset.y);
      switch(direction) {
        case "up":
          if (!lockToScreen || (lockToScreen && xyNextPos.y - 1 <= startY + screenHeight / 2 && focusY < (screenHeight / 2 * tileHeight) && xyMapOffset.y <= 0)) {
            for (i = 0; i < mapLayers.length; i++) {
              mapLayers[i].move("up", distance);
            }
          }
          else {
            focusY -= distance;
          }
        break;
        case "down":
          if (!lockToScreen || (lockToScreen && xyNextPos.y >= screenHeight / 2 && focusY > (screenHeight / 2 * tileHeight) && xyMapOffset.y >= -mapHeight + tileHeight + focusY + (screenHeight / 2 * tileHeight))) {
            for (i = 0; i < mapLayers.length; i++) {
              mapLayers[i].move("down", distance);
            }
          }
          else {
            focusY += distance;
          }
        break;
        case "left":
          if (!lockToScreen || (lockToScreen && xyNextPos.x - 1 <= startX + screenWidth / 2 && focusX < (screenWidth / 2 * tileWidth) && xyMapOffset.x <= 0)) {
            for (i = 0; i < mapLayers.length; i++) {
              mapLayers[i].move("left", distance);
            }
          }
          else {
            focusX -= distance;
          }
        break;
        case "right":
          if (!lockToScreen || (lockToScreen && xyNextPos.x >= screenWidth / 2 && xyMapOffset.x >= -mapWidth + focusX + (screenWidth / 2 * tileWidth))) {
            for (i = 0; i < mapLayers.length; i++) {
              mapLayers[i].move("right", distance);
            }
          }
          else {
            focusX += distance;
          }
        break;
      }
      startX = xyNextPos.x - rangeX / 2;
      startY = xyNextPos.y - rangeY / 2;

      return {
        startX: Math.floor(startX),
        startY: Math.floor(startY),
        pinFocusX: Math.floor(focusX),
        pinFocusY: Math.floor(focusY),
        tileX: Math.floor(xyNextPos.x),
        tileY: Math.floor(xyNextPos.y)
      };
      // Returns where to start drawing the tiles from.
      // pinFocus represents a precise location withn the map.
    }

    return {
      setup: function(mapLayers, mapWidth, mapHeight, tileWidth, tileHeight, screenWidth, screenHeight, curZoom, lockToScreen) {
        return _setup(mapLayers, mapWidth, mapHeight, tileWidth, tileHeight, screenWidth, screenHeight, curZoom, lockToScreen);
      },

      setFocus: function(posX, posY, rangeX, rangeY, setZoom) {
        return _setFocus(posX, posY, rangeX, rangeY, setZoom);
      },

      setPinFocusY: function(y) {
        focusY = y;
        return {
          startX: Math.floor(startX),
          startY: Math.floor(startY),
          pinFocusX: focusX,
          pinFocusY: focusY,
          tileX: Math.floor(xyNextPos.x),
          tileY: Math.floor(xyNextPos.y)
        };
      },

      setPinFocusX: function(x) {
        focusX = x;
        return {
          startX: Math.floor(startX),
          startY: Math.floor(startY),
          pinFocusX: focusX,
          pinFocusY: focusY,
          tileX: Math.floor(xyNextPos.x),
          tileY: Math.floor(xyNextPos.y)
        };
      },

      getFocus: function() {
        return {
          startX: Math.floor(startX),
          startY: Math.floor(startY),
          pinFocusX: focusX,
          pinFocusY: focusY,
          tileX: Math.floor(xyNextPos.x),
          tileY: Math.floor(xyNextPos.y)
        };
      },

      move: function(direction, distance, setZoom) {
        return _move(direction, distance, setZoom);
      }
      
    };
  };
});
/*  Copyright (c) 2014 Iain Hamilton

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

define('tile/Field',[
  'particles/EffectLoader',
  'particles/Emitter',
  'utils'
],

function(EffectLoader, Emitter, utils) {
  return function(ctx, mapWidth, mapHeight, mapLayout) {

    var title = "";
    var zeroIsBlank = false;
    var stackTiles = false;
    var stackTileGraphic = null;
    var drawX = 0;
    var drawY = 0;

    var tileHeight = 0;
    var tileWidth = 0;

    var heightMap = null;
    var lightMap = null;
    var lightX = null;
    var lightY = null;

    var heightOffset = 0;
    var heightShadows = null;
    var shadowSettings = null;

    var shadowDistance = null;

    var heightMapOnTop = false;

    var particleEffects = null;

    var curZoom = 1;
    var mouseUsed = false;
    var applyInteractions = false;
    var focusTilePosX = 0;
    var focusTilePosY = 0;

    var alphaWhenFocusBehind =  {}; // Used for applying alpha to objects infront of focus 

    var tilesHide = null;
    var hideSettings = null;

    var particleTiles =null;
    var particleMap = [];
    var particleMapHolder = [];

    var isometric = true;

    var tileImages = [];
    var tileImagesDictionary = [];

    function _setup(settings) {
      tileWidth = settings.tileWidth;
      tileHeight = settings.tileHeight;
      lightMap = settings.lightMap;
      shadowDistance = settings.shadowDistance;
      title = settings.title;
      zeroIsBlank = settings.zeroIsBlank;
      applyInteractions = settings.applyInteractions;

      if (settings.particleMap) {
        _particleTiles(settings.particleMap);
      }
      if (settings.layout) {
        mapLayout = settings.layout;
      }

      if (settings.graphics) {
        tileImages = settings.graphics;
      }
      if (settings.graphicsDictionary) {
        tileImagesDictionary = settings.graphicsDictionary;
      }
      if (settings.isometric !== undefined) {
        isometric = settings.isometric;
      }

      if (settings.shadow) {
        _applyHeightShadow(true, settings.shadow);
      }

      if (settings.heightMap) {
        _stackTiles(settings.heightMap);
      }

      if(settings.particleEffects) {
        particleEffects = settings.particleEffects;
      }
      
      if (settings.width) {
        var row = [];
        var col = 0;

        mapLayout = [];
        for (var i = 0; i < settings.layout.length; i++) {
          col ++;
          if (col !== settings.width) {
            row.push(settings.layout[i]);
          }
          else {
            row.push(settings.layout[i]);
            mapLayout.push(row);
            row = [];
            col = 0;

          }
        }
      }
      
      alphaWhenFocusBehind = settings.alphaWhenFocusBehind;
    }

    // Used for drawing horizontal shadows on top of tiles or RGBA tiles when color value is passed
    function _drawHorizontalColorOverlay(xpos, ypos, graphicValue, stack, resizedTileHeight) {

      if (!isometric) {
        ctx.fillStyle = 'rgba' + graphicValue;
        ctx.beginPath();
        ctx.moveTo(xpos, ypos);
        ctx.lineTo(xpos + (tileWidth * curZoom), ypos);
        ctx.lineTo(xpos + (tileWidth * curZoom), ypos + (tileHeight * curZoom));
        ctx.lineTo(xpos, ypos + (tileHeight * curZoom));
        ctx.fill();
      }
      else {
        var tileOffset;
        if (tileHeight < resizedTileHeight) {
          tileOffset = (tileHeight - resizedTileHeight) * curZoom;
        }
        else {
          tileOffset = (resizedTileHeight - tileHeight) * curZoom;
        }
        ctx.fillStyle = 'rgba' + graphicValue;
        ctx.beginPath();
        ctx.moveTo(xpos, ypos + ((stack - 1) * (tileOffset)) + (tileHeight * curZoom) / 2);
        ctx.lineTo(xpos + (tileHeight * curZoom), ypos + ((stack - 1) * (tileOffset)));
        ctx.lineTo(xpos + (tileHeight * curZoom) * 2, ypos + ((stack - 1) * (tileOffset)) + (tileHeight * curZoom) / 2);
        ctx.lineTo(xpos + (tileHeight * curZoom), ypos + ((stack - 1) * (tileOffset)) + (tileHeight * curZoom));
        ctx.fill();
      }

    }


    // Used for drawing vertical shadows on top of tiles in isometric view if switched on
    function _drawVeritcalColorOverlay(shadowXpos, shadowYpos, graphicValue, currStack, nextStack, resizedTileHeight, shadowSettings) {
      var  shadowHeight = tileHeight - shadowSettings.offset || 1;
      ctx.fillStyle = 'rgba' + graphicValue;
      ctx.beginPath();
      ctx.moveTo(shadowXpos + (tileHeight * curZoom), shadowYpos + ((currStack - 1) * ((tileHeight - resizedTileHeight) * curZoom)));
      ctx.lineTo(shadowXpos + (tileHeight * curZoom), shadowYpos - ((nextStack - 1) * ((shadowHeight) / ((shadowHeight) / shadowSettings.offset)  * curZoom)));
      ctx.lineTo(shadowXpos + (tileHeight * curZoom) * 2, shadowYpos - ((nextStack - 1) * (shadowHeight) / ((shadowHeight) / shadowSettings.offset) * curZoom) + (tileHeight * curZoom) / 2);
      ctx.lineTo(shadowXpos + (tileHeight * curZoom) * 2, shadowYpos + ((currStack - 1) * ((tileHeight - resizedTileHeight) * curZoom)) + (tileHeight * curZoom) / 2);
      ctx.fill();
    }


    // Used for drawing particle effects applied to tiles
    function _drawParticles(xpos, ypos, i, j, stack, distanceLighting, distanceLightingSettings, resizedTileHeight) {
      if (particleMap[i] && particleMap[i][j] !== undefined && Number(particleMap[i][j]) !== 0) {
        if (!distanceLightingSettings || ( distanceLightingSettings && distanceLighting < distanceLightingSettings.darkness)) {
          if (!particleMapHolder[i]) {
            particleMapHolder[i] = [];
          }
          if (!particleMapHolder[i][j]) {
            if (particleEffects && particleEffects[particleMap[i][j]]) {
              particleMapHolder[i][j] = new Emitter(ctx, 0, 0, particleEffects[particleMap[i][j]].pcount, particleEffects[particleMap[i][j]].loop, utils.range(0, mapHeight), utils.range(0, mapWidth));
              for (var partK in particleEffects[particleMap[i][j]]) {
                particleMapHolder[i][j][partK] = particleEffects[particleMap[i][j]][partK];
              }
              particleMapHolder[i][j].Load();
            }
            else {
              particleMapHolder[i][j] = new EffectLoader().getEffect(particleMap[i][j], ctx, utils.range(0, mapHeight), utils.range(0, mapWidth));
            }
          }
          particleMapHolder[i][j].Draw(xpos, ypos + ((stack - 1) * (tileHeight - heightOffset - tileHeight)) * curZoom - (resizedTileHeight  - tileHeight) * curZoom, curZoom);
        }
      }
    }

    function _draw(i, j, tileImageOverwite) {

      var xpos, ypos;
      i = Math.round(i);
      j = Math.round(j);
      if (i < 0) { return; }
      if (j < 0) { return; }
      if (i > mapLayout.length - 1) {
        return;
      }
      if (mapLayout[i] && j > mapLayout[i].length - 1) {
        return;
      }
      var resizedTileHeight;
      var stackGraphic = null;

      var graphicValue = (mapLayout[i] ? mapLayout[i][j] : 0);
      var distanceLighting = null;
      var distanceLightingSettings;
      var k = 0;

      var stack = 0;
      if (heightMap) {
        stack = Math.round(Number(heightMap[i][j]));
        k = stack;
      }

      if (shadowDistance) {
        distanceLightingSettings = {
          distance: shadowDistance.distance,
          darkness: shadowDistance.darkness,
          color: shadowDistance.color
        };
        distanceLighting = Math.sqrt((Math.round(i - lightX) * Math.round(i - lightX)) + (Math.round(j - lightY) * Math.round(j - lightY)));
        if (lightMap) {
          var lightDist = 0;
          var lightI;
          var lightJ;
          // Calculate which light source is closest
          for (var light = 0; light < lightMap.length; light++) {
            lightI = Math.round(i - lightMap[light][0]);
            lightJ = Math.round(j - lightMap[light][1]);
            lightDist = Math.sqrt(lightI * lightI + lightJ * lightJ);
            if(distanceLighting / (distanceLightingSettings.darkness * distanceLightingSettings.distance) > lightDist / (lightMap[light][2] * lightMap[light][3])) {
              distanceLighting = lightDist;
              distanceLightingSettings.distance = lightMap[light][2];
              distanceLightingSettings.darkness = lightMap[light][3];
            }
          }
        }
        if(distanceLighting > distanceLightingSettings.distance){
          distanceLighting = distanceLightingSettings.distance;
        }
        distanceLighting =  distanceLighting / (distanceLightingSettings.darkness * distanceLightingSettings.distance);
      }
      if ((!zeroIsBlank) || (zeroIsBlank && graphicValue) || tileImageOverwite) {
        if (zeroIsBlank) {
          if (Number(graphicValue) >= 0) {
            graphicValue--;
          }
        }
        if(tilesHide && graphicValue >= hideSettings.hideStart && graphicValue <= hideSettings.hideEnd) {
          stackGraphic = tileImages[hideSettings.planeGraphic];
        }
        else if(tileImageOverwite) {
          stackGraphic = tileImageOverwite;
        }
        else {
          if (stackTileGraphic) {
            stackGraphic = stackTileGraphic;
          }
          else {
            if (Number(graphicValue) >= 0) {
              stackGraphic = tileImages[tileImagesDictionary[graphicValue]];
            }
            else {
              stackGraphic = undefined;
            }
          }
        }
        
        resizedTileHeight = 0;
        if (stackGraphic) {
          resizedTileHeight =  stackGraphic.height / (stackGraphic.width / tileWidth);
        }
        if (!isometric) {
          xpos = i * (tileHeight * curZoom) + drawX;
          ypos = j * (tileWidth  * curZoom) + drawY;
        }
        else {
          xpos = (i - j) * (tileHeight * curZoom) + drawX;
          ypos = (i + j) * (tileWidth / 4 * curZoom) + drawY;
        }

        if (!stackTiles) {

          // If no heightmap for this tile

          if (!distanceLightingSettings || ( distanceLightingSettings && distanceLighting < distanceLightingSettings.darkness)) {
            if (tileImageOverwite) {

              // Draw the overwriting image insetad of tile

              ctx.drawImage(tileImageOverwite, 0, 0, stackGraphic.width, stackGraphic.height, xpos, (ypos + ((tileHeight - resizedTileHeight) * curZoom)), (tileWidth * curZoom), (resizedTileHeight * curZoom));
            }
            else {

              // Draw the tile image
              ctx.save();
              if (alphaWhenFocusBehind && alphaWhenFocusBehind.apply === true) {
                if ((i === focusTilePosX + 1 && j === focusTilePosY + 1) || (i === focusTilePosX && j === focusTilePosY + 1) || (i === focusTilePosX + 1 && j === focusTilePosY)) {
                  if (alphaWhenFocusBehind.objectApplied && ((alphaWhenFocusBehind.objectApplied === null || alphaWhenFocusBehind.objectApplied && (resizedTileHeight * curZoom) > alphaWhenFocusBehind.objectApplied.height * curZoom))) {
                    ctx.globalAlpha = 0.6;
                  }
                }
              }

              if (Number(graphicValue) >= 0) {
                // tile has a graphic ID
                if (stackGraphic !== undefined) {
                  ctx.drawImage(stackGraphic, 0, 0, stackGraphic.width, stackGraphic.height, xpos, (ypos + ((tileHeight - resizedTileHeight) * curZoom)), (tileWidth * curZoom), (resizedTileHeight * curZoom));
                }
              }
              else if (graphicValue != - 1) {
                // tile is an RGBA value
                _drawHorizontalColorOverlay(xpos, ypos, graphicValue, k, resizedTileHeight);
              }

              ctx.restore();
            }
          }
        }
        else {
          
          if (heightMapOnTop) {

            // If tile is to be placed on top of heightmap 

            if (!distanceLightingSettings || ( distanceLightingSettings && distanceLighting < distanceLightingSettings.darkness)) {
              if (tileImageOverwite) {

                // Draw overwriting image on top of height map
                  
                ctx.drawImage(tileImageOverwite, 0, 0, tileImageOverwite.width, tileImageOverwite.height, xpos, ypos + ((stack - 1) *(tileHeight - heightOffset - tileHeight)) * curZoom - (resizedTileHeight  - tileHeight) * curZoom, (tileWidth * curZoom), (resizedTileHeight * curZoom));
              }
              else {

                // Draw the tile image on top of height map

                if (Number(graphicValue) >= 0) {

                  ctx.save();
                  if (alphaWhenFocusBehind && alphaWhenFocusBehind.apply === true) {
                    if ((i === focusTilePosX + 1 && j === focusTilePosY + 1) || (i === focusTilePosX && j === focusTilePosY + 1) || (i === focusTilePosX + 1 && j === focusTilePosY)) {
                      if (alphaWhenFocusBehind.objectApplied && (alphaWhenFocusBehind.objectApplied === null || (alphaWhenFocusBehind.objectApplied && (resizedTileHeight * curZoom) > alphaWhenFocusBehind.objectApplied.height * curZoom))) {
                        ctx.globalAlpha = 0.6;
                      }
                    }
                  }
                  ctx.drawImage(stackGraphic, 0, 0, stackGraphic.width, stackGraphic.height, xpos, ypos + ((stack - 1) * (tileHeight - heightOffset - tileHeight)) * curZoom - (resizedTileHeight  - tileHeight) * curZoom, (tileWidth * curZoom), (resizedTileHeight * curZoom));
                  ctx.restore();
                }
                else if (graphicValue != - 1) {
                  _drawHorizontalColorOverlay(xpos, ypos, graphicValue, stack, resizedTileHeight);
                }
              }
            }
          }
          else {

            // If tile is to be repeated for heightmap

            for (k = 0; k <= stack; k++) {

              if (!distanceLightingSettings || ( distanceLightingSettings && distanceLighting < distanceLightingSettings.darkness)) {
                if (tileImageOverwite) {

                  // If there is an overwrite image

                  ctx.drawImage(tileImageOverwite, 0, 0, tileImageOverwite.width, tileImageOverwite.height, xpos, ypos + (k * ((tileHeight - heightOffset - resizedTileHeight) * curZoom)), (tileWidth * curZoom), (resizedTileHeight * curZoom));
                }
                else{
                  if (stackTileGraphic) {
                    if (k !== stack) {

                      // Repeat tile graphic till it's reach heightmap max
                      if (stackGraphic) {
                        ctx.drawImage(stackGraphic, 0, 0, stackGraphic.width, stackGraphic.height, xpos, ypos + (k * ((tileHeight - heightOffset - resizedTileHeight) * curZoom)), (tileWidth * curZoom), (resizedTileHeight * curZoom));
                      }

                    }
                    else {

                      if (Number(graphicValue) >= 0) {
                        // reset stackGraphic

                        stackGraphic = tileImages[tileImagesDictionary[graphicValue]];
                        ctx.drawImage(stackGraphic, 0, 0, stackGraphic.width, stackGraphic.height, xpos, ypos + ((k - 1) * ((tileHeight - heightOffset - resizedTileHeight) * curZoom)), (tileWidth * curZoom), (stackGraphic.height / (stackGraphic.width / tileWidth) * curZoom));
                      }
                      else if (graphicValue != - 1) {
                        _drawHorizontalColorOverlay(xpos, ypos, graphicValue, k, resizedTileHeight);
                      }

                    }
                  }
                  else {

                    // No stack graphic specified so draw tile at top
                    if (k === stack) {
                      if (Number(graphicValue) >= 0) {
                        ctx.drawImage(stackGraphic, 0, 0, stackGraphic.width, stackGraphic.height, xpos, ypos + (k * ((tileHeight - heightOffset - resizedTileHeight) * curZoom)), (tileWidth * curZoom), (resizedTileHeight * curZoom));
                      }
                      else if (graphicValue != - 1) {
                        _drawHorizontalColorOverlay(xpos, ypos, graphicValue, stack, resizedTileHeight);
                      }
                    }
                    else {
                      ctx.drawImage(stackGraphic, 0, 0, stackGraphic.width, stackGraphic.height, xpos, ypos + (k * ((tileHeight - heightOffset - resizedTileHeight) * curZoom)), (tileWidth * curZoom), (resizedTileHeight * curZoom));
                    }
                  }
                }
              }
            }
            ctx.restore();
          }
        }
      }

      if (heightShadows) {
        var nextStack = 0;
        var currStack = 0;
        var shadowXpos = 0;
        var shadowYpos = 0;

        if (heightMap) {

          nextStack = Math.round(Number(heightMap[i][j - 1]));
          currStack = Math.round(Number(heightMap[i][j]));

          if (currStack < nextStack) {
            shadowXpos = (i - j) * (tileHeight * curZoom) + drawX;
            shadowYpos = (i + j) * (tileWidth / 4 * curZoom) + drawY;

            // Apply Horizontal shadow created from stacked tiles
            if (shadowSettings.horizontalColor) {
              if (!distanceLightingSettings  || (distanceLighting < distanceLightingSettings.darkness)) {
                _drawHorizontalColorOverlay(shadowXpos, shadowYpos, (typeof shadowSettings.verticalColor === 'string' ? shadowSettings.verticalColor : shadowSettings.verticalColor[i][j]), currStack, resizedTileHeight);
              }
            }
            // Apply Vertical shadow created from stacked tiles
            if (shadowSettings.verticalColor) {
              if (!distanceLightingSettings  || (distanceLighting < distanceLightingSettings.darkness)) {
                _drawVeritcalColorOverlay(shadowXpos, shadowYpos, (typeof shadowSettings.horizontalColor === 'string' ? shadowSettings.horizontalColor : shadowSettings.horizontalColor[i][j]), currStack, nextStack, resizedTileHeight, shadowSettings);
              }
            }
          }
        }
        else {

          // Shadows without height map e.g. Object Shadows

          currStack = Math.round(Number(mapLayout[i][j - 1]));
          if(currStack > 0) {
            shadowXpos = (i - j) * (tileHeight * curZoom) + drawX;
            shadowYpos = (i + j) * (tileWidth / 4 * curZoom) + drawY;
            _drawHorizontalColorOverlay(shadowXpos, shadowYpos, (typeof shadowSettings.verticalColor === 'string' ? shadowSettings.verticalColor : shadowSettings.verticalColor[i][j]), k, resizedTileHeight);
          }
        }
      }
      if (distanceLightingSettings) {
        if (distanceLightingSettings.color !== false) {
          -- k;
          if (distanceLighting < distanceLightingSettings.darkness) {

            // Apply distance shadows from light source
            if (stackGraphic !== undefined || (zeroIsBlank && stackGraphic !== 0)) {
              _drawHorizontalColorOverlay(xpos, ypos, ('(' + distanceLightingSettings.color + ',' + distanceLighting + ')'), k, resizedTileHeight);
            }
          }
        }
      }
      if (mouseUsed && applyInteractions) {
        if (i === focusTilePosX && j === focusTilePosY) {
          // Apply mouse over tile coloring
          _drawHorizontalColorOverlay(xpos, ypos, ('(255, 255, 120, 0.7)'), k - 1, resizedTileHeight);
        }
      }
      if (particleTiles) {
        // Draw Particles
        _drawParticles(xpos, ypos, i, j, k, distanceLighting, distanceLightingSettings, resizedTileHeight);
      }
    }

    function _stackTiles(settings) {
      stackTiles = true;
      if (settings.heightTile) {
        stackTileGraphic = settings.heightTile;
      }
      heightMap = settings.map;
      heightOffset = settings.offset;
      heightMapOnTop = settings.heightMapOnTop || false;
    }

    function _particleTiles(map) {
      particleTiles = true;
      particleMap = map;
    }

    function _setLight(posX, posY) {
      lightX = posX;
      lightY = posY;
    }

    function _getLayout() {
      return mapLayout;
    }

    function _setLayout(data, width) {
      if (width) {
        var row = [];
        var col = 0;

        mapLayout = [];
        for (var i = 0; i < data.length; i++) {
          col ++;
          if (col !== width) {
            row.push(data[i]);
          }
          else {
            row.push(data[i]);
            mapLayout.push(row);
            row = [];
            col = 0;
          }
        }
      }
      else {
        mapLayout = data;
      }
    }

    function _getHeightLayout() {
      return heightMap;
    }

    function _getTile(posX, posY) {
      if (mapLayout[posX] && mapLayout[posX][posY]) {
        return mapLayout[posX][posY];
      }
      return null;
    }

    function _getHeightMapTile(posX, posY) {
      return heightMap[posX][posY];
    }

    function _setZoom(dir) {
      if (Number(dir)) {
        curZoom = dir;
      }
      else if (dir === "in") {
        if (curZoom  + 0.1 <= 1) {
          curZoom += 0.1;
        }
        else {
          curZoom = 1;
        }
      }else if (dir === "out") {
        if (curZoom - 0.1 > 0.1) {
          curZoom -= 0.1;
        }
        else {
          curZoom = 0.1;
        }
      }
    }

    function _adjustLight(setting, increase) {
      if (increase) {
        shadowDistance.distance += setting;
      }
      else {
        shadowDistance.distance -= setting;
      }
    }

    function _getTilePos(x, y) {
      var  xpos, ypos;
      if (!isometric) {
        xpos = x * (tileHeight * curZoom) + drawX;
        ypos = y * (tileWidth  * curZoom) + drawY;
      }
      else {
        xpos = (x - y) * (tileHeight * curZoom) + drawX;
        ypos = (x + y) * (tileWidth / 4 * curZoom) + drawY;
      }
      return {x: xpos, y: ypos};
    }

    function _getXYCoords(x, y) {
      var positionY, positionX;
      if (!isometric) {
        positionY = Math.round((y - (tileWidth * curZoom) / 2)/ (tileWidth * curZoom));
        positionX = Math.round((x - (tileHeight * curZoom) / 2)/ (tileHeight * curZoom));
      }
      else {
        positionY = (2 * (y - drawY) - x + drawX) / 2;
        positionX = x + positionY - drawX - (tileHeight * curZoom);
        positionY = Math.round(positionY / (tileHeight * curZoom));
        positionX = Math.round(positionX / (tileHeight * curZoom));
      }
      return({x: positionX, y: positionY});
    }

    function _applyMouseFocus(x, y) {
      mouseUsed = true;
      if (!isometric) {
        focusTilePosY = Math.round((y - (tileWidth * curZoom) / 2)/ (tileWidth * curZoom));
        focusTilePosX = Math.round((x - (tileHeight * curZoom) / 2)/ (tileHeight * curZoom));
      }
      else {
        focusTilePosY = (2 * (y - drawY) - x + drawX) / 2;
        focusTilePosX = x + focusTilePosY - drawX - (tileHeight * curZoom);
        focusTilePosY = Math.round(focusTilePosY / (tileHeight * curZoom));
        focusTilePosX = Math.round(focusTilePosX / (tileHeight * curZoom));
      }
      return({x: focusTilePosX, y: focusTilePosY});
    }

    function _setTile(x, y, val) {
      if (!mapLayout[x]) {
        mapLayout[x] = [];
      }
      mapLayout[x][y] = val;

    }

    function _setHeightmapTile(x, y, val) {
      heightMap[x][y] = val;
    }

    function _tileInView(tileX, tileY) {
      var distanceLighting = Math.sqrt((Math.round(tileX - lightX) * Math.round(tileX - lightX)) + (Math.round(tileY - lightY) * Math.round(tileY - lightY)));
      if (lightMap) {
        var lightDist = 0;
        // Calculate which light source is closest
        for (var light = 0; light < lightMap.length; light++) {
          lightI = Math.round(tileX - lightMap[light][0]);
          lightJ = Math.round(tileY - lightMap[light][1]);
          lightDist = Math.sqrt(lightI * lightI + lightJ * lightJ);
          if(distanceLighting / (shadowDistance.darkness * shadowDistance.distance) > lightDist / (light[2] * light[3])) {
            distanceLighting = lightDist;
          }
        }
      }
      if(distanceLighting / (shadowDistance.darkness * shadowDistance.distance) > shadowDistance.darkness){
        return false;
      }
      return true;
    }

    function _setParticlemapTile(x, y, val) {
      if(!particleMap[x]) {
        particleMap[x] = [];
      }
      particleMap[x][y] = val;
    }

    function _setLightmap(lightmapArray) {
      lightMap = lightmapArray;
    }

    function _applyFocus(xPos, yPos) {
      focusTilePosX = xPos;
      focusTilePosY = yPos;
    }

    function _align(position, screenDimension, size, offset) {
      switch(position) {
        case "h-center":
          if (isometric) {
            drawX = (screenDimension / 2) - ((tileWidth / 4  * size) * curZoom) / (size / 2);
          }
          else {
            drawX = (screenDimension / 2) - ((tileWidth/2  * size) * curZoom);
          }
        break;
        case "v-center":
          drawY = (screenDimension / 2) - ((tileHeight/2 * size) * curZoom) - ((offset * tileHeight) * curZoom) / 4;
        break;
      }
    }

    function _hideGraphics(toggle, settings) {
      tilesHide = toggle;
      if (settings) {
        hideSettings = settings;
      }
    }

    function _applyHeightShadow(toggle, settings) {
      if (toggle) {
        if(settings || shadowSettings) {
          heightShadows = true;
        }
      }
      else{
        if(settings || shadowSettings) {
          heightShadows = false;
        }
      }
      if (settings) {
        shadowSettings = settings;
      }
    }

    function _flip(setting) {
      if (stackTiles) {
        heightMap = utils.flipTwoDArray(heightMap, setting);
      }
      if (particleTiles) {
      // -- particleMap = utils.flipTwoDArray(particleMap, setting);
      }
      mapLayout = utils.flipTwoDArray(mapLayout, setting);

    }

    function _rotate(setting) {
      if (stackTiles) {
        heightMap = utils.rotateTwoDArray(heightMap, setting);
      }
      if (particleTiles) {
      // -- particleMap = utils.rotateTwoDArray(particleMap, setting);
      }
      mapLayout = utils.rotateTwoDArray(mapLayout, setting);
    }

    return {

      setup: function(settings) {
        return _setup(settings);
      },

      draw: function(tileX, tileY, tileImageOverwite) {
        return _draw(tileX, tileY, tileImageOverwite);
      },

      stackTiles: function(settings) {
        return _stackTiles(settings);
      },

      particleTiles: function(map) {
        return _particleTiles(map);
      },

      getLayout: function() {
        return _getLayout();
      },

      setLayout: function(data, width) {
        _setLayout(data, width);
      },

      getHeightLayout: function() {
        return _getHeightLayout();
      },

      getTitle: function() {
        return title;
      },

      getTile: function(tileX, tileY) {
        return Number(_getTile(tileX, tileY));
      },

      getHeightMapTile: function(tileX, tileY) {
        return Number(_getHeightMapTile(tileX, tileY));
      },

      setTile: function(tileX, tileY, val) {
        _setTile(tileX, tileY, val);
      },

      setHeightmapTile: function(tileX, tileY, val) {
        _setHeightmapTile(tileX, tileY, val);
      },

      setZoom: function(direction) {
        // in || out
        return _setZoom(direction);
      },

      setLight: function(tileX, tileY) {
        return _setLight(tileX, tileY);
      },

      setLightmap: function(lightmap) {
        _setLightmap(lightmap);
      },

      setParticlemapTile: function(tileX, tileY, val) {
        _setParticlemapTile(tileX, tileY, val);
      },

      clearParticlemap: function() {
        particleMap = [];
      },

      getXYCoords: function(XPosition, YPosition) {
        return _getXYCoords(XPosition, YPosition);
      },

      applyMouseFocus: function(mouseXPosition, mouseYPosition) {
        return _applyMouseFocus(mouseXPosition, mouseYPosition);
      },

      applyFocus: function(tileX, tileY) {
        return _applyFocus(tileX, tileY);
      },

      align: function(position, screenDimension, size, offset) {
        return _align(position, screenDimension, size, offset);
      },

      hideGraphics: function(toggle, settings) {
        return _hideGraphics(toggle, settings);
      },

      tileInView: function(tileX, tileY) {
        return _tileInView(tileX, tileY);
      },

      applyHeightShadow: function(toggle, settings) {
        return _applyHeightShadow(toggle, settings);
      },

      rotate: function(direction) {
        // left || right
        return _rotate(direction);
      },

      flip: function(direction) {
        // horizontal || vertical
        return _flip(direction);
      },

      toggleGraphicsHide: function(toggle) {
        if (tilesHide !== null) {
          _hideGraphics(toggle);
        }
      },

      toggleHeightShadow: function(toggle) {
        if (heightShadows !== null) {
          _applyHeightShadow(toggle);
        }
      },

      setLightness: function(setting) {
        shadowDistance.distance = setting;
      },

      adjustLightness: function(setting, increase) {
        _adjustLight(setting, increase);
      },

      setOffset: function(x, y) {
        if (x !== null) {
          drawX = x;
        }
        if (y !== null) {
          drawY = y;
        }
      },

      getTilePos: function(x, y) {
        return _getTilePos(x, y);
      },

      getOffset: function() {
        return {x: drawX, y: drawY};
      },

      getLightness: function() {
        return shadowDistance.distance;
      },

      move: function(direction, distance) {
        // left || right || up || down
        var particle, subPart;

        distance = distance || tileHeight;
        if (isometric) {
          if (direction === "up") {
            drawY += distance / 2 * curZoom;
            drawX += distance * curZoom;
          }
          else if (direction === "down") {
            drawY += distance / 2 * curZoom;
            drawX -= distance * curZoom;
          }
          else if (direction === "left") {
            drawY -= distance / 2 * curZoom;
            drawX -= distance * curZoom;
          }
          else if (direction === "right") {
            drawY -= distance / 2 * curZoom;
            drawX += distance * curZoom;
          }
        }
        else {
          if (direction === "up") {
            drawY += distance * curZoom;
            // Offset moving for particle effect particles
            for (particle in particleMapHolder) {
              for (subPart in particleMapHolder[particle]) {
                particleMapHolder[particle][subPart].ShiftBy(0, distance * curZoom);
              }
            }
          }
          else if (direction === "down") {
            drawY -= distance * curZoom;
            // Offset moving for particle effect particles
            for (particle in particleMapHolder) {
              for (subPart in particleMapHolder[particle]) {
                particleMapHolder[particle][subPart].ShiftBy(0, -distance * curZoom);
              }
            }
          }
          else if (direction === "left") {
            drawX += distance * curZoom;
            // Offset moving for particle effect particles
            for (particle in particleMapHolder) {
              for (subPart in particleMapHolder[particle]) {
                particleMapHolder[particle][subPart].ShiftBy(distance * curZoom, 0);
              }
            }
          }
          else if (direction === "right") {
            drawX -= distance * curZoom;
            // Offset moving for particle effect particles
            for (particle in particleMapHolder) {
              for (subPart in particleMapHolder[particle]) {
                particleMapHolder[particle][subPart].ShiftBy(-distance * curZoom, 0);
              }
            }
          }
        }
      }
    };
  };
});
/*  Copyright 2013 Iain Hamitlon

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */
    
function url(){
	this._path = function(part) {
			var url = window.location.href;
			var url_parts = url.split('/');
			return url_parts[part+3];

	} 
}
;
define("url/url", function(){});

