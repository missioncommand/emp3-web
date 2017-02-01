dragwin = (function() {

  var publicInterface,
    instances = {},
    minWidth = 100,
    minHeight = 90,
    frameSrc = "js/dependancies/frame.html",
    dragIconUri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAWklEQVQoz5WPwQ2AMAwDL8zQJRiCIXj0w4CsaT6tKGpFEj+tc2KDI0lF0gGcAJsHA7uZFaBmLt9puH2bKy1qXN2bAn9w895AAK5u5+XoKDyO9mp8R0fhPjqtB6nCYm7/R8qZAAAAAElFTkSuQmCC";




  function applyArgs(args) {
      var template = {
        title: "Untitled",
        domId: "default",
        width: 275,
        height: 300,
        content: "",
        sandbox: false,
        remove: function() {
          $("#" + this.domId).remove();
          delete instances[this];
        },
        hide: function() {
          $("#" + this.domId).hide();
        },
        show: function() {
          $("#" + this.domId).show();
        }
      };
      if (args) {
        if (args.hasOwnProperty("title")) {
          template.title = args.title;
        }
        if (args.hasOwnProperty("content")) {
          template.content = args.content;
        }
        if (args.hasOwnProperty("domId")) {
          template.domId = args.domId;
        }
        if (args.hasOwnProperty("x")) {
          template.x = args.x;
        }
        if (args.hasOwnProperty("y")) {
          template.y = args.y;
        }
        if (args.hasOwnProperty("width")) {
          template.width = args.width;
        }
        if (args.hasOwnProperty("height")) {
          template.height = args.height;
        }
        if (args.hasOwnProperty("sandbox")) {
          template.sandbox = args.sandbox;
        }
      }
      return template;
    }


    // Create the HMTL template string for the window
  function generateHTML(args) {
    var ht = [];
    ht.push('<div id="' + args.domId + '" class="mdl-card mdl-shadow--2dp" style="position: absolute; background-color: #FFFFFF; z-index:9999; color: #151515;margin:0px;padding:0px;min-width:' + minWidth + 'px;min-height:' + minHeight + 'px;width:' + args.width + 'px; height: ' + args.height + 'px; buser-select:none;-webkit-user-select:none;">');
    ht.push(' <div id="' + args.dragId + '" title="Press and drag to move window" style="cursor: move; height: 32px;line-height: 32px; padding: 1px; color:#151515; overflow: hidden;user-select:none;-webkit-user-select:none;">');
    ht.push('     <span id="' + args.titleId + '" style=" position: abosulte; top:2px; max-width: 90%; left: 15px; padding-left: 10px; user-select:none;-webkit-user-select:none;"><strong>'+args.title+'</strong></span>');
    ht.push('     <button id="' + args.closeId + '" title="Click to close window" class="mdl-button mdl-js-button mdl-button--icon" style=" position: absolute; top: 1px; right: 1px"><i class="material-icons">close</i></button>');
    ht.push(' </div>');
    ht.push(' <div title="Press and drag to resize window" id="' + args.resizeId + '" style="cursor: nwse-resize; position: absolute; right:1px;bottom:1px;height:12px; width:12px; background-image: url(\'' + dragIconUri + '\') "></div>');
    ht.push(' <div style="position: absolute; background-color: #ffffff; color:#151515; overflow: hidden; padding:0px;left:5px;top:34px;right:5px;bottom:18px;">');
    if (args.hasOwnProperty("sandbox") && args.sandbox === true) {
      ht.push('     <iframe sandbox="allow-forms allow-pointer-lock allow-popups allow-scripts" style="position: absolute; left: 0px; top: 0px; width: 100%; height: 100%;" id="' + args.contentId + '" src="'+args.src+'"></iframe>');
    } else {
      ht.push('     <iframe sandbox="allow-forms allow-pointer-lock allow-popups allow-scripts allow-same-origin" style="position: absolute; left: 0px; top: 0px; width: 100%; height: 100%;" id="' + args.contentId + '" src="'+args.src+'"></iframe>');
    }
    ht.push(' </div>');
    ht.push(' <iframe class="iframeshim" frameborder="0" scrolling="no">');
    ht.push(' </iframe>');
    ht.push('</div>');
    return ht.join("");
  }

  function applyResize(event, args) {
      var tar = $('#' + args.domId);
      var pos = tar.position();
      var left = pos.left;
      var top = pos.top;


      tar.width((event.pageX - left) + 5);
      tar.height((event.pageY - top) + 5);
    }
    // Add the DOM events for resizing the window
  function applyResizeEvents(args) {
    //var draggable = document.getElementById(args.domId);
    var dragTarget = document.getElementById(args.resizeId);
    dragTarget.addEventListener('touchmove', function(event) {
      var touch = event.targetTouches[0];
      var tar = $('#' + args.domId);
      var pos = tar.position();
      var left = pos.left;
      var top = pos.top;

      tar.width(touch.pageX - left);
      tar.height(touch.pageY - top);
      // Place element where the finger is
      // draggable.style.left = (touch.pageX - 125) + 'px';
      // draggable.style.top = (touch.pageY - 15) + 'px';
      event.preventDefault();
    }, false);

    $('#' + args.resizeId).mousedown(function() {
      $('#' + args.contentId).css("pointer-events", "none");
      $('body').mousemove(function(event) {
        applyResize(event, args);
      });

      $('body').mouseup(function(event) {
        $('body').unbind('mousemove');
        $('body').unbind('mouseup');
        $('#' + args.contentId).css("pointer-events", "auto");
        $('#' + args.contentId).unbind('mousemove');

        applyResize(event, args);

      });
    });
  }

  // Add the DOM events for dragging of the window
  function applyEvents(args) {

    $('#' + args.contentId).attr('tabindex', -1).focus();
    var draggable = document.getElementById(args.domId);
    var dragTarget = document.getElementById(args.dragId);

    dragTarget.addEventListener('touchmove', function(event) {
      var touch = event.targetTouches[0];
      // Place element where the finger is
      draggable.style.left = (touch.pageX - 125) + 'px';
      draggable.style.top = (touch.pageY - 15) + 'px';
      event.preventDefault();
    }, false);
    $('#' + args.dragId).on('mousedown', function(e) {
      $('#' + args.contentId).css("pointer-events", "none");
      var pos = $('#' + args.domId).position();
      var left = pos.left;
      var top = pos.top;
      var lDiff = left - e.pageX;
      var tDiff = top - e.pageY;
      $("#" + args.domId).on('mousemove', function(e) {
        $("#" + args.domId).offset({
          top: (e.pageY + tDiff),
          left: (e.pageX + lDiff)
        });
      });
      e.preventDefault();
    }).on('mouseup', function() {
      $('#' + args.contentId).css("pointer-events", "auto");
      $("#" + args.domId).off('mousemove');
    });

    $("#" + args.closeId).on("click", function() {
      $("#" + args.domId).hide();
    });

    applyResizeEvents(args);
  }

  // Determine where aroud the mouse location to make the window appear so that it does not go off-screen
  function calculatePosition(x, y, wid, hgt) {
      var xpadding = 30;
      var ypadding = 30;

      var w = window.innerWidth;
      var h = window.innerHeight;
      // make the window vertically centered on clicked feature
      y = y - (hgt / 2);
      // apply hozontal padding so window is to right of feature
      x = x + xpadding;
      // Make sure the pop up does not appear off screen
      if (x > (w - wid)) {
        // try swapping to left side of feature
        x = x - (wid + (xpadding * 2));
      }
      if (y > (h - hgt)) {
        y = h - (hgt + 30);
      }
      // Make sure the window header always stays visbile even if window is smaller than the pop ups minimum width or height
      if (wid + xpadding > w) {


        xpadding = (w - wid) / 2;
        if (xpadding < 0) {
          xpadding = 0;
        }
      }
      if (x < xpadding) {
        x = xpadding;
      }
      if (hgt + ypadding > h) {
        ypadding = (h - hgt) / 2;
        if (ypadding < 0) {
          ypadding = 0;
        }
      }
      if (y < ypadding) {
        y = ypadding;
      }
    
      return {
        x: x,
        y: y
      };
    }

    
    // Create a new window
  function createInstance(args) {
    var instance,
      html;
    instance = applyArgs(args);

    instance.dragId = "dragTar" + getUUID();
    instance.contentId = "cnt" + getUUID();
    instance.closeId = "close" + getUUID();
    instance.resizeId = "resize" + getUUID();
    instance.titleId = "title" + getUUID();
    instance.src = args.src;
    html = generateHTML(instance);
    $("body").append(html);

    
    var pos = calculatePosition(args.x, args.y, instance.width, instance.height);
    $('#' + args.domId).offset({
      top: pos.y,
      left: pos.x
    });

    applyEvents(instance);
    instances[instance] = instance;
    return instance;
  }

  $(window).resize(function() {
    var winInstance,
      w = window.innerWidth,
      h = window.innerHeight,
      pos,
      left,
      top;
    for (winInstance in instances) {
      if (instances.hasOwnProperty(winInstance)) {
        pos = $('#' + winInstance.domId).position();
        left = pos.left;
        top = pos.top;
        if (left > (w - 50)) {
          left = w - 100;
        }
        if (top > (h - 50)) {
          top = h - 100;
        }
        $("#" + winInstance.domId).offset({
          top: top,
          left: left
        });
      }
    }
  });

  publicInterface = {
    create: function(args) {
      return createInstance(args);
    }
  };

  

  return publicInterface;
}());