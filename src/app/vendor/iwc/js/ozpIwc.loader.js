if (window.SharedWorker) {
    var worker = new SharedWorker('js/ozpIwc-bus.js');
    var isInit = true;

    // Receive messages from the client and forward to the IWC Bus (shared worker)
    window.addEventListener('message', function (evt) {
        var payload = evt.data;

        if(typeof payload === "string"){
            try{
                payload = JSON.parse(payload);
            } catch (e){
                return;
            }
        }

        // MessageChannel wont see the original origin. Proxy it.
        payload.proxyAs = {
            origin: evt.origin
        };

        worker.port.postMessage(payload);

        if (isInit) {
            isInit = false;
            worker.port.start();
        }
    });

    // When the client is closing, notify the shared worker so the IWC bus can clean up references
    window.addEventListener('beforeunload', function (evt) {
        worker.port.postMessage({windowEvent: evt.type});
    });

    // Receive messages from the the IWC Bus (shared worker) and forward to the client
    worker.port.addEventListener('message', function (evt) {
        window.parent.postMessage(evt.data, "*");
    });

} else {

    // Fallback on loading individual bus instances
    (function () {
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src = 'js/ozpIwc-bus.js';
        var x = document.getElementsByTagName('script')[0];
        x.parentNode.insertBefore(s, x);
    })();
}
