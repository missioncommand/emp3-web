///////////////////////////////////////////////////////////////////////////////
// workerLoader.js
//
// Copyright (c) 2014 General Dynamics Inc.
// The Government has the right to use, modify, reproduce,
// release, perform, display ,or disclose this computer
// software or computer software documentation without restriction.
//
///////////////////////////////////////////////////////////////////////////////

var window;
var document;
var console;

var dojoConfig = null;

self.addEventListener("message", function (message){
    if(message.data.type === "loaderInit"){

        var i, scripts = [];
        dojoConfig = message.data.dojoConfig;
        importScripts.apply(null, dojoConfig.layers);

        if (message.data.loadScripts) {
            for(i = 0; i < message.data.loadScripts.length; i++) {

               scripts.push('../../' + message.data.loadScripts[i]);
            }

            importScripts.apply(null, scripts);
        }
    }
    else if (message.data.type === 'workerName') {

        // console polyfill to allow the webworker to have console logging cability
        // which is redirected back to the main window for output
        //
        // setting console after script loading as it breaks sym-renderer

        console = {
            _sendMessage: function(type, msg){
                self.postMessage({
                    type: "console",
                    consoleType: type,
                    value: msg
                });
            },
            log: function(msg){
                console._sendMessage("log", msg);
            },
            error: function(msg){
                console._sendMessage("error", msg);
            },
            warn: function(msg){
                console._sendMessage("warn", msg);
            },
            info: function(msg){
                console._sendMessage("info", msg);
            }
        };

        require([message.data.name], function(Module) {
            var w = new Module(message.data.initArg);
        });
    }

}, false);
