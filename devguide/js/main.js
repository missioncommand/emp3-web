var tryitsrc = "examples/default.js";
(function() {
    var titleBase = "<a  onclick=\"loadNodeByKey('" + doctoc[0].key + "');\" style=\"color: #FFF;\"></a>";
    var cardTop = '<div class="mdl-grid" style="max-width: 1024px;"><div id="container" class="mdl-cell mdl-cell--12-col" style="max-width: 1024px;"><div class="mdl-card mdl-shadow--2dp" style="padding: 24px;">';
    var cardBottom = " </div> </div>";

    function renderOverview(node) {
        var isHtml = false,
            isRemote = false;
        if (node.key !== undefined && node.key !== null && node.key !== "") {
            if (node.key.indexOf(".html") !== -1) {
                isHtml = true;
            }
            if (node.key.indexOf("http") !== -1) {
                isRemote = true;
            }
            location.hash = node.key;
            if (isHtml) {
                //$("#overviewPanel").html("<iframe style=\"width: 100%; height: 100%\" src=\"" + node.key + "\"></iframe>");
                $("#overviewPanel").load(node.key, function(response, status, xhr) {
                    loadComplete();
                    if (status !== "error") {
                        if (isHtml && isRemote === false) {

                            // Append Material Design JavaScript to any MDL lite elements
                            componentHandler.upgradeAllRegistered();
                        } else {
                            var htmlContent = marked(response);
                            $("#overviewPanel").html(htmlContent);
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
            } else {
                $("#overviewPanel").load(node.key, function(response, status, xhr) {
                    if (status == "error") {
                        $("#overviewPanel").html("Unable to load file: ");
                    } else {
                        // Append Material Design JavaSript to any MDL lite elements
                        //componentHandler.upgradeAllRegistered();
                        var htmlContent = marked(response);
                        $("#overviewPanel").html(cardTop + htmlContent + cardBottom);
                    }
                });
            }
        } else if (node.data.hasOwnProperty("description")) {
            $("#overviewPanel").html("<h2>" + node.title + "</h2>" + node.data.description);
        }
    }

    function loadComplete(success, message) {
        $("#loadingContent").hide();
        $("#generalContent").scrollTop(0);
    }

    function loadStart(message) {
        $("#loadingContent").show();
    }

    function renderGeneral(node) {
        var isHtml = false,
            isRemote = false;
        if (node.key !== "") {
            //setFrameSrc(data.node.key);
            location.hash = node.key;
            // check if we are loading an html document.  If not assume it is Markdown
            if (node.key.indexOf(".html") !== -1) {
                isHtml = true;
            }
            // Check to see if we are loading relative content or a remote resource we dont control
            if (node.key.indexOf("http") !== -1) {
                isRemote = true;
            }
            $("#generalContent").load(node.key, function(response, status, xhr) {
                loadComplete();
                if (status !== "error") {
                    if (isHtml && isRemote === false) {


                        // Append Material Design JavaSript to any MDL lite elements
                        componentHandler.upgradeAllRegistered();
                    } else {
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
    var targetId = "";

    function renderWeb(node) {

        var frameSrc = node.data.web,
            srcArr;
        targetId = "";
        if (node.data.hasOwnProperty("web")) {
            if (node.data.web.indexOf("#") != -1) {
                srcArr = node.data.web.split("#");
                frameSrc = srcArr[0];
                targetId = "#" + srcArr[1];
            }
        }

        function scrollToPos(target) {
            $('#webFrame').each(function() {
                var tarDiv = $('#' + target, this.contentWindow.document || this.contentDocument);
                $(this.contentWindow.document || this.contentDocument).scrollTop(tarDiv.offset().top);

            });
        }

        $('#webFrame').on("load", function() {
            $('#webFrame').each(function() {
                if (targetId !== "") {
                    var tarDiv = $(targetId, this.contentWindow.document || this.contentDocument);
                    $(this.contentWindow.document || this.contentDocument).scrollTop(tarDiv.offset().top);
                }
            });
        });
        $('#webFrame').attr('src', frameSrc);
    }

    function renderSmart(node) {
        $('#smartFrame').attr('src', node.data.smart);
        //$("#smartPanel").html("<iframe style=\"width: 100%; height: 100%\" src=\"" + node.data.smart + "\"></iframe>");
    }

    function renderFrame(node) {
        $('#genericFrame').attr('src', node.key);
    }

    function loadContent(node) {
        $("#topTitle").html(titleBase + breadCrumbify(node));
        if (node.data && node.data.hasOwnProperty("tryitsrc")) {
            tryitsrc = node.data.tryitsrc;
        }
        if (node.data.hasOwnProperty("web")) {
            //renderOverview(node);
            renderWeb(node);
            renderSmart(node);
            $("#generalContent").hide();
            $("#tabbedContent").show();
            $("#frameContent").hide();

        } else if (node.data.hasOwnProperty("frame")) {
            renderFrame(node);
            $("#generalContent").hide();
            $("#tabbedContent").hide();
            $("#frameContent").show();

        } else {
            $("#generalContent").show();
            $("#tabbedContent").hide();
            $("#frameContent").hide();
            renderGeneral(node);
        }
    }

    $(function() {
        var DT; // = $.ui.fancytree;
        if (!document.addEventListener) {
            var message = "You are using a browser that does not support modern web capabilities.  Please use a browser such as Firefox, Chrome, Safari, or IE 9(or newer) to view this page.";
            alert(message);
            $("body").html('<p style="color: #FF0000">' + message + '</p>');
        } else {
            $.ui.fancytree.debug("Using fancytree " + $.ui.fancytree.version);
            // attach to all instances
            DT = $("#tree")
                .fancytree({
                    source: doctoc,
                    checkbox: false,
                    selectMode: 1,
                    icons: false,
                    minExpandLevel: 1,
                    activate: function(event, data) {
                        loadContent(data.node);
                    },
                    dblclick: function(event, data) {
                        // loadContent(data.node);
                    }
                });
            setTimeout(function() {
                var defaultView = location.hash; //queryStringUtil.getParameterByName("view");

                if (defaultView !== "") {
                    defaultView = defaultView.replace("#", "");
                    loadNodeByKey(defaultView);

                } else {

                    loadNodeByKey(doctoc[0].key);

                }
            }, 500);


        }


    });

}());
// Activates a specific tree node by the key and triggers the same load sequence as if the user clicked on that node in the tree

function loadNodeByKey(key) {
    $("#tree").fancytree("getTree").getNodeByKey(key).setActive();
}

function showToaster(message) {

    'use strict';
    //window['counter'] = 0;
    var snackbarContainer = document.querySelector('#toaster');

    var data = { message: message };
    snackbarContainer.MaterialSnackbar.showSnackbar(data);

}
