if (!window.emp) {
    window.emp = {};
}

/**
 * Mechanism for recording all calls made and exporting them for playback or debugging purposes.
 */
emp.recorder = (function() {
  var log = [];
  var recording = false;

  var publicInterface = {

    /**
     * Starts recording messages sent to the recorder.
     */
    record: function() {
      recording = true;
    },

    /**
     * Stops recording messages sent to the recorder.
     */
    stop: function() {
      recording = false;
    },

    /**
     * Log a message to be recorded.
     *
     * @param entry A single message.
     * @param entry.timeStamp The time the message was recorded.
     * @param entry.message The message that was recorded.
     */
    log: function(entry) {

      if (recording) {        
        log.push(entry);
      }
    },

    /**
     * Saves recorded messages to a file.
     */
    save: function() {
      var dataStr = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({results:log}, 0, 2));
      var recorderElem = document.getElementById('recorderElem');
      recorderElem.setAttribute("href", dataStr);
      recorderElem.setAttribute("download", "results.json");
      recorderElem.click();
    },

    /**
     * Clears recorded messages.
     */
    clear: function() {
      log = [];
    }
  };

  return publicInterface;
}());
