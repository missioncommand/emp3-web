var emp = window.emp || {};

/**
 * Namespace used by all UI components
 * @namespace ui
 * @memberof emp
 */
emp.ui = emp.ui || {};
emp.ui.consts = {
  IFRAME_SHIM: '<iframe class="emp_iframeshim" frameborder="0" scrolling="no"><html><head></head><body></body></html></iframe>'
};

/**
 * Renders the map background prior to the map loading, also setting the div default style for the map.
 *
 * @param {Object} args Parameters are passed as members of the args object.
 * @param {String} args.instanceId The map's instance id that this will set up.
 * @param {String} args.domContainer The map's div id.
 * @param {boolean} args.record Whether or not to show the recording buttons.
 */
emp.ui.renderContainer = function (args) {
  var domCont,
    instanceId = args.instanceId,
    domTargetId = args.domContainer,
    instanceContainer;

  var styleStrings = {
    loadingPanel: "height:100%;overflow: hidden;z-index: 9989;display:flex;align-items: center; justify-content: center;",
    emp: 'color: #FFFFFF;text-align:center;',
    loader: '',
    absmax: ';position: absolute; top: 0px; bottom: 0px; left: 0px; right: 0px; overflow: hidden;',
    instanceStyle: "position:relative;width:100%; height:100%;overflow: hidden; background-color:#616161",
    containerStyle: '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }' +
    '.circle { width: 100px; height: 100px; position: absolute; top: 200px; left: 0; bottom: 0; right: 0; margin: auto; background-color: #717171; border-radius: 50%; }' +
    '.inner-circle { width: 92%; height: 92%; background: #616161; border-radius: 50%; margin: auto; vertical-align: middle; position: absolute; top: 0; left: 0; bottom: 0; right: 0; }' +
    '.spinner { height: 0; width: 0; border-radius: 50%; border: 50px solid transparent; border-right-color: rgba(255, 255, 255, 0.3); -webkit-animation: spin 1.6s infinite;' +
    ' -moz-animation: spin 1.6s infinite; -o-animation: spin 1.6s infinite; animation: spin 1.6s infinite; }',
    recorder: "position: absolute; top: 35px; left: 100px; overflow: hidden; width: 100px height: 100px z-index: 10500; background-color: yellow"
  };

  instanceContainer = document.createElement('div');
  instanceContainer.id = instanceId;
  instanceContainer.setAttribute("style", styleStrings.instanceStyle);

  var loadingPanel, flexStart, flexEnd, loadingPanelStatus, messageHolder, spinner, innerSpinner, innerCircle,
    loadingMessageSpan, loadingStatus, styleTag, instanceMap, head;

  head = document.head || document.getElementsByTagName('head')[0];
  styleTag = document.createElement('style');

  styleTag.type = 'text/css';
  if (styleTag.styleSheet) {
    styleTag.setAttribute("style", styleStrings.containerStyle);
  } else {
    styleTag.appendChild(document.createTextNode(styleStrings.containerStyle));
  }

  head.appendChild(styleTag);

  // Create a panel to display the loading progress of EMP
  loadingPanel = document.createElement('div');
  loadingPanel.id = instanceId + '_loadingPanel';
  loadingPanel.setAttribute("style", styleStrings.loadingPanel);

  // Flex start
  flexStart = document.createElement("div");
  flexStart.style.alignSelf = "flex-start";

  // Create the status display panel
  loadingPanelStatus = document.createElement("div");
  loadingPanelStatus.id = instanceId + "_loadingPanelStatus";

  messageHolder = document.createElement("div");
  messageHolder.id = instanceId + '_messageHolder';
  messageHolder.setAttribute("style", styleStrings.emp);

  loadingMessageSpan = document.createElement('span');
  loadingMessageSpan.id = instanceId + "_loadingMessage";

  loadingStatus = document.createElement('div');
  loadingStatus.id = instanceId + "_loadingStatus";

  // Create the spinner
  spinner = document.createElement("div");
  spinner.id = instanceId + "_loadSpinner";
  spinner.className = "circle";

  innerSpinner = document.createElement("div");
  innerSpinner.className = "spinner";

  innerCircle = document.createElement("div");
  innerCircle.className = "inner-circle";

  // Flex end
  flexEnd = document.createElement("div");
  flexEnd.style.alignSelf = "flex-end";

  // Map container itself
  instanceMap = document.createElement("div");
  instanceMap.id = instanceId + "_map";
  instanceMap.setAttribute("style", styleStrings.absmax);

  // Assemble the page
  instanceContainer.appendChild(loadingPanel);
    loadingPanel.appendChild(flexStart);
    loadingPanel.appendChild(loadingPanelStatus);
      loadingPanelStatus.appendChild(messageHolder);
        messageHolder.appendChild(loadingMessageSpan);
          loadingMessageSpan.appendChild(document.createTextNode("Loading Map"));
        messageHolder.appendChild(document.createElement('br'));
        messageHolder.appendChild(loadingStatus);
          loadingStatus.appendChild(document.createTextNode("Fetching configuration..."));
      loadingPanelStatus.appendChild(spinner);
        spinner.appendChild(innerSpinner);
        spinner.appendChild(innerCircle);
    loadingPanel.appendChild(flexEnd);
  instanceContainer.appendChild(instanceMap);

  // only show the debugging recorder if the recorder parameter is set.
  if (args.recorder) {
    emp.recorder.record();

    var recorder = document.createElement("div");
    recorder.setAttribute("style", styleStrings.recorder);

    var recordButton = document.createElement("button");
    recordButton.id = "emp_record";
    recordButton.disabled = true;
    recordButton.onclick = emp.ui.record;
    recordButton.style.backgroundColor = "green";
    recordButton.appendChild(document.createTextNode("RECORD"));
    
    var stopButton = document.createElement("button");
    stopButton.id = "emp_stop";
    stopButton.onclick = emp.ui.stop;
    stopButton.style.backgroundColor = "red";
    stopButton.appendChild(document.createTextNode("STOP"));
    
    var saveButton = document.createElement("button");
    saveButton.id = "emp_save";
    saveButton.onclick = emp.ui.save;
    saveButton.style.backgroundColor = "blue";
    saveButton.appendChild(document.createTextNode("SAVE"));
    
    var clearButton = document.createElement("button");
    clearButton.id = "emp_clear";
    clearButton.onclick = emp.ui.clear;
    clearButton.style.backgroundColor = "yellow";
    clearButton.appendChild(document.createTextNode("CLEAR"));

    var saveAnchor = document.createElement('a');
    saveAnchor.href = "#";
    saveAnchor.id = "recorderElem";

    recorder.appendChild(recordButton);
    recorder.appendChild(stopButton);
    recorder.appendChild(saveButton);
    recorder.appendChild(clearButton);
    recorder.appendChild(saveAnchor);

    instanceContainer.appendChild(recorder);
  }

  if (domTargetId) {
    domCont = document.getElementById(domTargetId);
  }

  if (domCont) {
    domCont.appendChild(instanceContainer);
  } else {
    document.body.appendChild(instanceContainer);
  }

  return instanceId;
};

/**
 * Begins recording calls
 */
emp.ui.record = function () {
  var record = document.getElementById('emp_record');
  var stop = document.getElementById('emp_stop');
  record.disabled = true;
  stop.disabled = false;

  emp.recorder.record();
};

/**
 * Stops recording calls
 */
emp.ui.stop = function () {
  var record = document.getElementById('emp_record');
  var stop = document.getElementById('emp_stop');
  record.disabled = false;
  stop.disabled = true;
  emp.recorder.stop();
};

/**
 * Exports calls to the downloads folder
 */
emp.ui.save = function () {
  emp.recorder.save();
};

/**
 * Clears the existing calls from the record stack
 */
emp.ui.clear = function () {
  emp.recorder.clear();
};

/**
 * Source Tag for all UI originated transactions
 * @type {String}
 * @constant
 */
emp.ui.SOURCE = "emp-core-ui";
emp.ui.config = {};
emp.ui.config.lang = "enUS";
