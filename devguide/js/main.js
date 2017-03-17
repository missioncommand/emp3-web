var tryitsrc = "examples/default.js";
(function() {
  'use strict';
  var titleBase = "<a  onclick=\"loadNodeByKey('" + doctoc[0].key + "');\" style=\"color: #FFF;\"></a>";
  var cardTop = '<div class="mdl-grid" style=""><div id="container" class="mdl-cell mdl-cell--12-col" style="max-width: 1024px; margin: auto auto;"><div class="mdl-card mdl-shadow--2dp" style="padding: 24px; width: 100%">';
  var cardBottom = " </div> </div>";

  function loadComplete() {
    $("#loadingContent").hide();
    $("#generalContent").scrollTop(0);
  }

  function loadStart() {
    $("#loadingContent").show();
  }

  function renderGeneral(node) {
    var isHtml = false;

    if (node.key !== "") {

      location.hash = node.key;
      // check if we are loading an html document.  If not assume it is Markdown
      if ((node.key.indexOf(".html") !== -1) || (node.key.indexOf(".htm") !== -1)) {
        isHtml = true;
      }

      $("#generalContent").load(node.key, function(response, status) {
        loadComplete();
        if (status !== "error") {
          if (!isHtml) {

            var htmlContent = marked(response);
            $("#generalContent").html(cardTop + htmlContent + cardBottom);
          }
        } else {
          renderGeneral({
            key: "pages/under-construction.html",
            title: "Sorry, this link is not working",
            data: {}
          });
        }
      });
      loadStart();
    }
  }

  function breadCrumbify(node) {
    var addition = "";
    if (node !== undefined && node !== null && node.hasOwnProperty("parent") && node.parent !== undefined && node.parent !== null) {
      //addition = " / " + parent.title;
      if (node.hasOwnProperty("parent")) {
        addition += breadCrumbify(node.parent);
      }
    }
    if (node.title !== "root") {
      addition += " <i class=\"material-icons\" style=\"line-height: 22px;vertical-align: middle;\">keyboard_arrow_right</i> " + "<a style=\"color: #FFF;\" onclick=\"loadNodeByKey('" + node.key + "');\">" + node.title + "</a>";
    }
    return addition;
  }

  function renderFrame(node) {
    $('#genericFrame').attr('src', node.key);
  }

  function loadContent(node) {
    if (node.data.hasOwnProperty("frame")) {
      $("#topTitle").html(titleBase + breadCrumbify(node));
      renderFrame(node);
      $("#generalContent").hide();
      $("#tabbedContent").hide();
      $("#frameContent").show();

    } else if (node.data.hasOwnProperty("external")) {

      window.open(node.key);


    } else {
      $("#topTitle").html(titleBase + breadCrumbify(node));
      $("#generalContent").show();
      $("#tabbedContent").hide();
      $("#frameContent").hide();
      renderGeneral(node);
    }

  }

  $(function() {

    if (!document.addEventListener) {
      var message = "You are using a browser that does not support modern web capabilities.  Please use a browser such as Firefox, Chrome, Safari, or IE 9(or newer) to view this page.";
      $("body").html('<p style="color: #FF0000">' + message + '</p>');
    } else {
      $.ui.fancytree.debug("Using fancytree " + $.ui.fancytree.version);
      // attach to all instances
      $("#tree")
        .fancytree({
          source: doctoc,
          checkbox: false,
          selectMode: 1,
          icons: false,
          minExpandLevel: 1,
          click: function(event, data) {
            loadContent(data.node);
          }
        });
      setTimeout(function() {
        var defaultView = location.hash;
        if (defaultView !== "") {
          defaultView = defaultView.replace("#", "");
          loadNodeByKey(defaultView, loadContent);
        } else {
          loadNodeByKey(doctoc[0].key, loadContent);
        }
      }, 500);
    }
  });

}());
// Activates a specific tree node by the key and triggers the same load sequence as if the user clicked on that node in the tree

function loadNodeByKey(key, callback) {
  var node = $("#tree").fancytree("getTree").getNodeByKey(key);
  node.setActive();
  callback(node);
}

function showToaster(message) {

  'use strict';
  var snackbarContainer = document.querySelector('#toaster');

  var data = {message: message};
  snackbarContainer.MaterialSnackbar.showSnackbar(data);

}
