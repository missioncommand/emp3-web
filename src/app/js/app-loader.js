/*global com, emp, emp3, window */
var emp3appLoader = (function() {

    this.launchedWindows = {};
    this.seaStar = com.octabits.starfish.hub;

    this.launchTool = function(args) {
        var url = args.url;
        var width = 250;
        if (args.hasOwnProperty("width")) {
            width = args.width;
        }
        var height = 400;
        if (args.hasOwnProperty("height")) {
            height = args.height;
        }
        if (args.url && args.url.indexOf("?") !== -1) {
            url += "&empenv=" + args.environment;
        } else {
            url += "?empenv=" + args.environment;
        }


        var toolWin = dragwin.create({
            title: args.title,
            src: url,
            domId: getUUID(),
            x: 25,
            y: 25,
            width: width,
            height: height,
            sandbox: false
        });
        return toolWin;
    }

    this.launchApp = function(args) {
        var popupwin;
        var width = 250;
        var height = 400;
        var baseUrl = args.url.trim();
        var that = this;
        if (baseUrl.indexOf("?") !== -1) {
            baseUrl += "&empenv=" + args.environment;
        } else {
            baseUrl += "?empenv=" + args.environment;
        }

        if (args.hasOwnProperty("width")) {
            width = args.width;
        }

        if (args.hasOwnProperty("height")) {
            height = args.height;
        }

        if (args.environment !== "starfish") {

            if (this.launchedWindows[baseUrl]) {
                this.launchedWindows[baseUrl].focus();
            } else {

                popupwin = window.open(baseUrl, "_blank", "height=" + args.height + ",width=" + args.width + ",left=" + args.x + ",top=" + args.y + ",resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=yes"); // + ", titlebar = 0, menubar = 0, location = 0, status = 0 ");
                this.launchedWindows[baseUrl] = popupwin;
                popupwin.onload = function() {
                    that.launchedWindows[baseUrl] = popupwin;
                    popupwin.onbeforeunload = function() {
                        delete that.launchedWindows[baseUrl];
                    };
                };
            }
        } else {

           popupwin = this.seaStar.arm.grow({
                url: baseUrl,
                debug: false

            }).popupwin;
        }
        return popupwin;

    };
    this.closeApp = function(url) {

        this.seaStar.arm.sever({
            url: url
        });
    };
    this.loadAppList = function(url, callback) {

        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', url, true); // Replace 'my_data' with the path to your file
        xobj.onreadystatechange = function() {
            if (xobj.readyState === 4 && xobj.status == "200") {
                // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                callback(xobj.responseText);
            }
        };
        xobj.send(null);
    };
    return this;
}());
