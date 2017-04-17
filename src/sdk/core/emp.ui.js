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

emp.ui.images = emp.ui.images || {};
emp.ui.images.addPoint = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAABZMAAAWTAHSlqqMAAAAB3RJTUUH4AcbDgse/M10DgAAAHRJREFUKM+lk7sNwCAMRF8oIhZhrCzDGozAPIgueyTNpSFS/pHMXeHq/DnbcIUIiIioiKXFiAi8QnhEQp9MCP8kLD/CneWc4L/ivYPDjBYGB0zYMNHctLAOiAUYDZVXB8zGtmcHZKM4d7nduefuC+u6beNXbdM++oIo31XPAAAAAElFTkSuQmCC";
emp.ui.images.editPoint = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAABZMAAAWTAHSlqqMAAAAB3RJTUUH4AcbCywyEhtoYwAAAL1JREFUOMutlbENgzAQAM8veZLQhwGyA0IKPaPRg4TYwQNAbyZJk+aJCASUxH+dbfn0tv/fjgOy6+MClEAB5Do9AgPQx8nPn/a5A1ED3DgnAPVW7DayO9DyG1WcfLcT/inbSd3qmJE0sjj5WXTQkE4D4Iyie0UpmhpWlKJ5ZkUhq6S1IBeMES0nK0bR2rRiEKA3FPaixR0MZGFdKbWBsF4eBY2ySpBVSxszb19veagL2Zd3GrTDdKcdO/ULeAI20UWMOU+gkAAAAABJRU5ErkJggg==";
emp.ui.images.rotationPoint = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAABZMAAAWTAHSlqqMAAAAB3RJTUUH4AcbDi85qC8gwwAAALdJREFUOMutlcENgzAMRV+8Sj0AA3QHhNTcMxr3IiF2yAAMALv0YioKBdHG7xakPJnE/gkcME3cgAaogco+j8AA9KrM3/aFA1EL3DknA2krDhvZA3jyG1GVbif8U7aThtVvTpShqsxii5ZyWoDgVN27SrHW8KIR6zMvalk1rQeV4IzYOHkxis2mF4MAvaOwFxvu7CDL60lJDsK0XApWZSyQxSXG3ONLPuOCDtCLZ5otYbrTxC59Al5VfTZ6ch2UlQAAAABJRU5ErkJggg==";
emp.ui.images.distancePoint = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAABZMAAAWTAHSlqqMAAAAB3RJTUUH4AcbDh0gITTccgAAALtJREFUOMutlcENgzAMAC9epQzAAN0BITV/vkzkL/8iIXbIAAxQdunHVBQKahvfL4lychLbCRzQtu0FqIEKKG16AkZgUNX5075wIOqAK+ckoNmKw0Z2A+78RlTVfif8U7aThtUxH+RRqOosNujIpwMITtG9ohRLDS9qsTzzopJV0npQCs6IlZMXk1htejEKMDgKB7HiTg6ytK6UxkHYLI+CRRkzZHFpY+7t6y0PbaH48k6TdZj+tGPnfgFPQlpF6xKlJb8AAAAASUVORK5CYII=";
emp.ui.images.radius = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAABZMAAAWTAHSlqqMAAAAB3RJTUUH4AcbDigNxtpCsQAAALpJREFUOMutlcENgzAMAC9epQzAAN0BIRW/GY03RULskAEYoOzSj6lSKKhtfL8kyslJbCdwQN/3F6AGKqC06RmYgFFVl0/7woGoA66cE4F2Kw4b2Q248xuNqg474Z+ynTQkx3yQR6Gqi9igI58OIDhF94pSLDW8qMXyzItKkqT1oBScESsnL2ax2vRiEmB0FI5ixR0dZDGtlNZB2K6PgkXZZMiatY25t6+3PLSF4ss7jdZhhtOOnfsFPAGgz0IcOI0txAAAAABJRU5ErkJggg==";
emp.ui.images.defaultPoint = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAkCAYAAACTz/ouAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAWTAAAFkwB0paqjAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAVbSURBVEiJrZZ7bFVVFsZ/a+/TF8VCW1QU5GFbQpMp6GREwBgkUZkoiqIz6mCIE4fMP0Jb6itBo6iJf2hLFXxm1IoEMAOCiRJkFF+lNNgBB5hWkGJpebZ4e7Etpb1nn+UfWLyH9rbF+CUnOVnrW9931j5nr7OF/jEemCsit4qXdAWqlwAg0qx+rFFVPwY+ABoSCUiC+OUY8yyqD4gxXFowXUdMuNqmZV4MQGdrCyf37XQn9mw3qoEi8jZB8CRwfDAGt4mxa5OGDE3+4wNLvPw7/0lyekafT9HdforaDa+zq+J5F+tsP6OB+yuwqT+DhxB5edz1tzPzqZWSSLiXUVuUrUvna+O2j1RVFwKv9uRsHO8ORCom3VskM5a8JV5K6qDEAWxKKjk33iPd7VFprt1xC7AT2B/fwSgx9vvxM+em3PTc+wbpvXKR+j38dLgegIzROWTlFPR2UmXL43cHDV9/2KmBywOOnVUypiI5bej9f9vYYFMuygzVNFVvpqqs2I82fufFx4ePzfevW1zujb725hD/zKkfWX3neBc70/EuQfCgBcYBb/9pwTNm9DU3hsj/W/UCnz/zd7raW7ehWgyUAGVAZVd7dMz+Te+NSUpLZ+Sk6edqvNQhAOZIzWeTgQoDzBFjNH/OP0LijVWbqF7xGKCl6twMYANw5Jdrgzr/etDy6uWP0lS9OVSbP2cBIkaA241YO/uyq2aQkpEVIm0vL/HF2krgEUB7LzgKlIi1VVXLFvvxidThIxg5+bpAxM42Ymxedm6BiSe0NtQRbfzOU+eXJhDvQaDOL40eqvOih/aFEtm5k614doJR5y4dMuKyUPLUr+SafsRDnGhj2CD94stR50YaUGO85ETFiUbJgByTlAxgjBgb7YyER8jwcRN7bqcMwmAKQObYiaFgR8tRxNiIURfsaq6tCUIGYyeSlVvgi/VKBujCiPVKsvMm+8PGTAglWupqAnWxXUbVfXL826/obouGCNMWvuhp4KYCywiPlB5YYJkGbsq0RaWhTdjV1srx3ZWo6hYLHFa0OHVYtsRvmIzROSSlpcvhHZ9OFevdggZtQCuQAcwW472D6h3TCl+UvFnzQs61H7zG4epPAmBBz6hYlXpR1j33rT/gJQ8dFiI3VW9me/li19pQF+oic1y+m1a0zF4xdVaI390WZfXcK/2ujlNrCIL5Pes7Royt+8NfHhoyvbi8j9WAn47UE6nfC0BWTgEZo67sk7etrJD/r3vltAYuH2iMf4ElYswLd63cJdm5k/osHgg/HtjN+vlXqwbBw5ydWcTv4OUi9oeqskL3m9SBbWWLnIj9AVjeE4s36A5crPjozi9sw1cfXrB4w5cbObbzSxu4WBEQ64n3+sbF2v+kjxh1w73r9ns2KWVQ4i7Wxdq7J/gdJ49+oc6/KT5nzierc4UdzU2y9/2XB/30e9a+REdzk6jzC8/P9TIAalX1zZp/Pe1Onzw2oPjpk8f471tLnaq+AdQOxgDgCRfrav/mjSf6G9UA7Hh9ibpYdzvwZF/5RAYRdW7pvo/eoaUu8cRuqf2GfR9XoM5/GohciAHACox3sLJ0oUP7aESVyrJFToypB15JJNKfQUxdrKh5b7U9uHVdr2T91n/TvLfaqnOhz/J8DPhDEbFb0rIumXnf+gPeLycG/DOnWXNXrt8Zad6q6mb1V99fBwCousLOyAnZvabsXGz36lI6IydE1RUNVD9YrLDJKf68jYd03sZDapNSHHHj4PdApljbmvfn+4PcWfMCMbYVyByw6gLxMCIBIgFnT3i/O5LF2oNibT2Q8BhyPryBKefQrc4Vc/Yg1j3Yop8B18MsO8rbNb0AAAAASUVORK5CYII=";
/**
 * Renders the map background prior to the map loading, also setting the div default style for the map.
 *
 * @param {Object} args Parameters are passed as members of the args object.
 * @param {String} args.instanceId The map's instance id that this will set up.
 * @param {String} args.domContainer The map's div id.
 * @param {boolean} args.record Whether or not to show the recording buttons.
 */
emp.ui.renderContainer = function(args) {
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
emp.ui.record = function() {
  var record = document.getElementById('emp_record');
  var stop = document.getElementById('emp_stop');
  record.disabled = true;
  stop.disabled = false;

  emp.recorder.record();
};

/**
 * Stops recording calls
 */
emp.ui.stop = function() {
  var record = document.getElementById('emp_record');
  var stop = document.getElementById('emp_stop');
  record.disabled = false;
  stop.disabled = true;
  emp.recorder.stop();
};

/**
 * Exports calls to the downloads folder
 */
emp.ui.save = function() {
  emp.recorder.save();
};

/**
 * Clears the existing calls from the record stack
 */
emp.ui.clear = function() {
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
