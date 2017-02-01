var ozpIwc = ozpIwc || {};
ozpIwc.worker = ozpIwc.worker || {};
/**
 * Various scripts loaded into webWorkers to enhance the IWCs performance
 * @module ozpIwc
 * @submodule ozpIwc.worker
 */

/**
 * A webWorker to mock timeouts for IWC Client users. When browser tabs are inactive, timers are raised to a minimum of
 * 1 second. This will prevent that so that IWC Actions are not throttled. Loaded via a Blob, or through a
 * worker-runnable script ozpIwc.timer.js.
 *
 * Not intended to be ran in the IWC code directly, this is opened in a separate web worker.
 * Inspiration from MIT Licensed  https://github.com/turuslan/HackTimer.
 *
 * @namespace ozpIwc.worker
 * @method timerThrottleUnlock
 */
ozpIwc.worker.timerThrottleUnlock = function () {
    var timerRegistrations = {};


    self.addEventListener('connect', function (evt) {
        var port = evt.ports[0];

        port.addEventListener('message', function (evt) {
            console.log(evt);
            evt.data = evt.data || {};
            var timer = evt.data;

            // silently give up if not formatted right
            if (!timer.hasOwnProperty("id") || !timer.type) {
                return;
            }

            timer.time = timer.time || 0;

            //Take all requested timer types and instantiate them in the worker where inactive limits do not apply.
            switch (timer.type) {
                case "setTimeout":
                    timerRegistrations[timer.id] = setTimeout(function () {
                        port.postMessage(timer);
                        timerRegistrations[timer.id] = null;
                    }, timer.time);
                    break;

                case "clearTimeout":
                    self.clearTimeout(timerRegistrations[timer.id]);
                    timerRegistrations[timer.id] = null;
                    break;

                case "setInterval":
                    timerRegistrations[timer.id] = self.setInterval(function () {
                        port.postMessage(timer);
                    }, timer.time);
                    break;

                case "clearInterval":
                    self.clearInterval(timerRegistrations[timer.id]);
                    timerRegistrations[timer.id] = null;
                    break;
            }
        }, false);
        port.start();

    })
};

ozpIwc = ozpIwc || {};
ozpIwc.worker = ozpIwc.worker || {};

(function () {ozpIwc.worker.timerThrottleUnlock();}());
//# sourceMappingURL=ozpIwc.timer.js.map