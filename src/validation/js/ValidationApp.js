// Import required modules
import * as React from 'react';
import {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {guid} from './util/UUIDGen';
import {Map, Navbar} from './components/app';

// Import containers
import ControlPanel from './components/ControlPanel';
import Results from './containers/Results';

import Settings from './components/Settings';

import {CoordinatesWindow} from './components/windows';

// Import actions
import {addError, addResult, clearResults} from './actions/ResultActions';
import {nextTest, prevTest, clearTest} from './actions/TestActions';
import {addMap, removeMap, clearMaps} from './actions/MapActions';
import {addOverlay, addOverlays, removeOverlay, removeOverlays, clearOverlays} from './actions/OverlayActions';
import {addFeature, addFeatures, removeFeature, removeFeatures, clearFeatures} from './actions/FeatureActions';
import {addMapService, removeMapServices, clearMapServices} from './actions/MapServiceActions';
import {
  addEventListenerCallback,
  appendEventListenerCallbackMessage,
  removeEventListenerCallback,
  clearEventListenerCallbackMessage
} from './actions/EventListenerCallbackActions';
import {addCamera} from './actions/CameraActions';
import {addLookAt} from './actions/LookAtActions';

class ValidationApp extends Component {

  // React functions and events ========================================================================================
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      isResultsOpen: false,
      isSettingsOpen: false,
      resizing: false,
      lastResults: null,
      ghostWidth: 300,
      width: 300,
      windows: [],
      createMapPending: false,
      activeScript: '',
      activeMap: 'map0'
    };

    toastr.options.closeButton = true;
    toastr.options.preventDuplicates = false;
    toastr.options.positionClass = 'notification-toast-top-right';

    this.resizeComponents = this.resizeComponents.bind(this);
    this.executeScript = this.executeScript.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.createMap = this.createMap.bind(this);
    this.createOverlay = this.createOverlay.bind(this);
    this.hideResults = this.hideResults.bind(this);
    this.showResults = this.showResults.bind(this);
    this.toggleSettings = this.toggleSettings.bind(this);
    this.mapGoto = this.mapGoto.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  componentDidUpdate() {
    // This upgrades all upgradable components (i.e. with 'mdl-js-*' class)
    componentHandler.upgradeDom();
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  // EMP functions =====================================================================================================
  showResults() {
    this.setState({isResultsOpen: true});
  }

  hideResults() {
    this.setState({isResultsOpen: false});
  }

  handleDragBarMouseDown(ev) {
    ev.preventDefault();
    this.setState({resizing: true});
    document.addEventListener('mousemove', this.resizeComponents);
  }

  /**
   * DOMEvent handler
   */
  handleMouseUp() {
    if (this.state.resizing === true) {
      this.setState({resizing: false, width: this.state.ghostWidth});
      document.removeEventListener('mousemove', this.resizeComponents);
    }
  }

  /**
   * Hide/show the settings panel
   */
  toggleSettings() {
    this.setState({isSettingsOpen: !this.state.isSettingsOpen});
  }

  /**
   * Listener function for resizing the panels
   * @param ev
   */
  resizeComponents(ev) {
    ev.preventDefault();
    let offset = ev.pageX;
    if (offset < 150) {
      offset = 150;
    } else if (offset > window.innerWidth - 400) {
      offset = window.innerWidth - 400;
    }

    this.setState({ghostWidth: (Math.round(offset / 10) * 10)});
  }

  /**
   * Creates a new map in the map panel to a maximum of four maps
   * @param {object} [bounds]
   * @param {number} [mapEngineId]
   * @param {boolean} [silent=false] If set, it will suppress any output from displaying in the results dialog
   * @param {boolean} [recorder=false]
   */
  createMap(bounds, mapEngineId, silent = false, recorder = false, brightness = 50,
    midDistanceThreshold = 20000, farDistanceThreshold = 600000) {
    var config = empConfig;

    if (typeof empConfig.recorder !== 'undefined') {
      recorder = empConfig.recorder;
    }

    const {maps, addResult, addCamera, addMap, addError} = this.props;
    const toastrTitle = 'Create Map';
    if (config.engines.length === 0) {
      toastr.warning('No engines are specified in the config');
      return;
    }
    if (this.state.createMapPending) {
      toastr.warning('Map creation already in progress, please wait for it to complete before adding additional maps', toastrTitle);
      return;
    }
    if (maps.length >= 4) {
      toastr.warning('Current limit of 4 maps', toastrTitle);
      return;
    }
    try {
      let engine = _.find(config.engines, {mapEngineId: mapEngineId || config.startMapEngineId});
      empConfig.startMapEngineId = engine.mapEngineId;
      let containerId = 'map' + parseInt(maps.length);
      let environment = config.environment;
      let envOverride = false;
      (function () {
        var urlEnv = emp.util.getParameterByName('empenv');
        if (urlEnv !== null) {
          environment = urlEnv;
          switch (environment) {
            case "iwc":
            case "starfish":
            case "owf":
              envOverride = true;
              break;
          }
        }
      }());

      const mapDefinition = {
        bounds: bounds,
        environment: environment,
        engine: engine,
        recorder: recorder,
        backgroundBrightness: brightness,
        midDistanceThreshold: midDistanceThreshold,
        farDistanceThreshold: farDistanceThreshold,
        onSuccess: args => {
          toastr.success('Map created successfully', toastrTitle);
          addResult(args, 'emp3.api.Map Constructor');
          addCamera(map.getCamera());
          this.setState({
            isLoading: false,
            createMapPending: false
          });

          addMap(map);

          let coordinatesWindow = (
            <CoordinatesWindow map={map}
                               key={map.geoId + '_coords'}
                               style={{
                                 position: 'absolute',
                                 bottom: this.state.windows.length * 50,
                                 left: (this.state.width + 6) + 'px'
                               }}/>
          );

          let newWindows = [...this.state.windows, coordinatesWindow];
          this.setState({windows: newWindows});

          if (!silent) {
            this.setState({lastResults: args});
          }
        },
        onError: err => {
          toastr.error('Map creation failed', toastrTitle);
          addError(err, 'emp3.api.Map Constructor');
          this.setState({
            createMapPending: false,
            lastResults: err
          });
        }
      };

      if (envOverride === false) {
        // We only want to spawn a local map instance if we are using standalone embedded browser environment which is the default here
        mapDefinition.container = containerId;
      }
      emp3.api.global.configuration.urlProxy = config.urlProxy;
      const map = new emp3.api.Map(mapDefinition);
      toastr.info('Map creation pending', toastrTitle);
      this.setState({createMapPending: true});
    } catch (e) {
      this.setState({createMapPending: false});
      toastr.error(e.message, 'Map creation failed: Critical');
      addError(e.message, 'emp3.api.Map Constructor: Critical');
    }
  }

  /**
   * Convenience function
   */
  createOverlay() {
    const {maps, addOverlay, addResult} = this.props;

    const toastrTitle = 'Create Overlay';
    if (maps.length < 1) {
      toastr.warning('Please create initial map', toastrTitle);
      return;
    }

    const args = {geoId: guid(), name: 'Quick Overlay'};
    const overlay = new emp3.api.Overlay({name: 'Quick Overlay'});

    addOverlay(overlay);
    addResult(args, 'Quick Create Overlay');

    const selectedMap = _.first(maps);

    selectedMap.addOverlay({
      overlay: overlay,
      onSuccess: args => {
        addResult(args, 'createOverlay');
        toastr.success('Create Overlay Successful');
      },
      onError: args => {
        this.addError(args, 'createOverlay');
        toastr.error('Create Overlay Failed');
      }
    });
  }

  executeScript() {
    const {scripts, maps} = this.props;
    let script = _.find(scripts, {name: this.state.activeScript}).script;

    let match, replacement, foundObject;
    const objectHash = {};

    let mapPattern = /map([0-3])\./;

    while (mapPattern.test(script)) {
      match = script.match(mapPattern);
      foundObject = _.find(maps, {container: 'map' + match[1]});
      if (foundObject) {
        replacement = 'map' + match[1];
        objectHash[replacement] = foundObject;
        script = script.replace(mapPattern, 'objectHash["' + replacement + '"].');
      } else {
        toastr.error('Could not find specified map');
        return;
      }
    }

    try {
      eval(script);
      toastr.success('Script executed');
    } catch (err) {
      toastr.error(err.message, 'Failed executing script');
      console.error(err);
    }
  }

  /**
   * Uses the currently selected map
   * @param {string} coords lon,lat format coordinates2
   */
  mapGoto(coords) {
    const {maps} = this.props;
    let map = _.find(maps, {container: this.state.activeMap});
    coords = coords.split(',');
    map.setCamera({
      camera: new emp3.api.Camera({
        longitude: coords[0] ? parseFloat(coords[0]) : undefined,
        latitude: coords[1] ? parseFloat(coords[1]) : undefined,
        altitude: coords[2] ? parseFloat(coords[2]) : undefined
      })
    });
  }

  render() {
    const {maps, addFeature, addOverlay} = this.props;

    const ghostbar =
      <div id='ghostbar' className='dragbar' style={{
        left: this.state.ghostWidth + 'px',
        opacity: this.state.resizing ? '0.5' : 0
      }}>
      </div>;

    const dragbar =
      <div id='dragbar' className='dragbar'
           onMouseDown={this.handleDragBarMouseDown.bind(this)}
           style={{left: (this.state.width + 3) + 'px'}}>
      </div>;

    let numMaps = maps.length;
    if (this.state.createMapPending) {
      numMaps += 1;
    }

    let topRowStyle = {height: '100%', width: '100%'};
    let bottomRowStyle = {height: '50%', width: '100%'};
    switch (numMaps) {
      case 2: {
        topRowStyle.height = '50%';
        break;
      }
      case 3: {
        topRowStyle.height = '50%';
        topRowStyle.width = '50%';
        break;
      }
      case 4: {
        topRowStyle.height = '50%';
        topRowStyle.width = '50%';
        bottomRowStyle.width = '50%';
        break;
      }
    }

    const renderedMaps = [];
    for (let iMap = 0; iMap < (maps.length + 1); iMap++) {
      let mapId = 'map' + iMap;
      let mapStyle = _.clone(iMap < 2 ? topRowStyle : bottomRowStyle);
      if (maps.length > 1) {
        mapStyle.backgroundColor = (mapId === this.state.activeMap) ? 'green' : 'transparent';
      }

      renderedMaps.push(<Map id={mapId}
                             maps={maps}
                             addOverlay={addOverlay}
                             addFeature={addFeature}
                             key={'mapContainer_' + iMap}
                             style={mapStyle}
                             selectMap={() => this.setState({activeMap: mapId})}/>);
    }

    return (
      <div className='mdl-layout mdl-js-layout'>
        <Navbar {...this.props}
                goto={this.mapGoto}
                showResults={this.showResults}
                toggleSettings={() => this.setState({isSettingsOpen: !this.state.isSettingsOpen})}
                isSettingsOpen={this.state.isSettingsOpen}
                createMap={this.createMap}
                createOverlay={this.createOverlay}
                executeScript={this.executeScript}
                setActiveScript={scriptName => this.setState({activeScript: scriptName})}
                activeScript={this.state.activeScript}/>

        <Results isResultsOpen={this.state.isResultsOpen}
                 hideResults={this.hideResults}/>

        {ghostbar}
        {dragbar}

        <div id='contentPane'>
          <div id='sidebar' style={{width: this.state.width + 'px'}} className='mdl-layout__content'>
            <ControlPanel id='controlPanel'
                          {...this.props}
                          createMap={this.createMap}/>
          </div>

          <div id='mapsPanel' style={{
            left: (this.state.width + 6) + 'px',
            opacity: this.state.isSettingsOpen ? 0 : 1
          }}>
            {renderedMaps.length === 1 ? <div style={{
              position: 'absolute',
              top: '40%',
              textAlign: 'center',
              left: 0, right: 0
            }}>
              <div style={{margin: '8px'}}><h4>Extensible Map Platform 3 (EMP3) Validation Tool</h4></div>
              { _.map(empConfig.engines, engine => {
                return (<div key={engine.mapEngineId} className="mdl-grid">
                  <button
                    className="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--4-col mdl-cell--4-offset"
                    onClick={() => this.createMap({
                      west: 40,
                      east: 50,
                      north: 50,
                      south: 40
                    }, engine.mapEngineId)}>
                    {engine.mapEngineId.substring(0, engine.mapEngineId.length - 9)}
                  </button>
                </div>);
              })}
            </div> : null}
            {renderedMaps}
          </div>

          <div id='settingsPanel' style={{
            left: (this.state.width + 6) + 'px',
            opacity: this.state.isSettingsOpen ? 1 : 0,
            zIndex: this.state.isSettingsOpen ? 100 : -100
          }}>
            {this.state.isSettingsOpen ? <Settings /> : null}
          </div>
        </div>

        {/* Non-standard rendered things */}
        {this.state.windows}
      </div>
    );
  }
}

ValidationApp.propTypes = {
  addCamera: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired,
  addEventListenerCallback: PropTypes.func.isRequired,
  addFeature: PropTypes.func.isRequired,
  addFeatures: PropTypes.func.isRequired,
  addMap: PropTypes.func.isRequired,
  addMapService: PropTypes.func.isRequired,
  addOverlay: PropTypes.func.isRequired,
  addOverlays: PropTypes.func.isRequired,
  addResult: PropTypes.func.isRequired,
  appendEventListenerCallbackMessage: PropTypes.func.isRequired,
  clearEventListenerCallbackMessage: PropTypes.func.isRequired,
  clearFeatures: PropTypes.func.isRequired,
  clearMaps: PropTypes.func.isRequired,
  clearMapServices: PropTypes.func.isRequired,
  clearOverlays: PropTypes.func.isRequired,
  clearTest: PropTypes.func.isRequired,
  eventListeners: PropTypes.object.isRequired,
  features: PropTypes.array.isRequired,
  maps: PropTypes.array.isRequired,
  mapServices: PropTypes.array.isRequired,
  nextTest: PropTypes.func.isRequired,
  overlays: PropTypes.array.isRequired,
  lookAts: PropTypes.array,
  cameras: PropTypes.array,
  prevTest: PropTypes.func.isRequired,
  removeEventListenerCallback: PropTypes.func.isRequired,
  removeFeature: PropTypes.func.isRequired,
  removeFeatures: PropTypes.func.isRequired,
  removeMap: PropTypes.func.isRequired,
  removeMapServices: PropTypes.func.isRequired,
  removeOverlay: PropTypes.func.isRequired,
  removeOverlays: PropTypes.func.isRequired,
  scripts: PropTypes.array // TODO move scripts and the entire navbar out into its own widget
};

const mapStateToProps = state => {
  return {
    eventListeners: state.eventListeners,
    features: state.features,
    maps: state.maps,
    mapServices: state.mapServices,
    overlays: state.overlays,
    scripts: state.scripts,
    cameras: state.cameras,
    lookAts: state.lookAts
  };
};

const mapDispatchToProps = dispatch => {
  return {
    addMap: (map) => {
      dispatch(addMap(map));
    },
    removeMap: (mapId) => {
      dispatch(removeMap(mapId));
    },
    clearMaps: () => {
      dispatch(clearMaps());
    },
    addError: (error, source) => {
      dispatch(addError(error, source));
    },
    addResult: (result, source) => {
      dispatch(addResult(result, source));
    },
    nextTest: () => {
      dispatch(nextTest());
    },
    prevTest: () => {
      dispatch(prevTest());
    },
    clearTest: () => {
      dispatch(clearTest());
    },
    addOverlay: (overlay) => {
      dispatch(addOverlay(overlay));
    },
    addOverlays: (overlay) => {
      dispatch(addOverlays(overlay));
    },
    removeOverlay: (overlay) => {
      dispatch(removeOverlay(overlay));
    },
    removeOverlays: (overlay) => {
      dispatch(removeOverlays(overlay));
    },
    clearOverlays: () => {
      dispatch(clearOverlays());
    },
    addFeature: (feature) => {
      dispatch(addFeature(feature));
    },
    addFeatures: (features) => {
      dispatch(addFeatures(features));
    },
    removeFeature: (feature) => {
      dispatch(removeFeature(feature));
    },
    removeFeatures: (features) => {
      dispatch(removeFeatures(features));
    },
    clearFeatures: () => {
      dispatch(clearFeatures());
    },
    addMapService: (mapService) => {
      dispatch(addMapService(mapService));
    },
    removeMapServices: (mapServices) => {
      dispatch(removeMapServices(mapServices));
    },
    clearMapServices: () => {
      dispatch(clearMapServices());
    },
    addEventListenerCallback: (eventType, callback) => {
      dispatch(addEventListenerCallback(eventType, callback));
    },
    clearEventListenerCallbackMessage: () => {
      dispatch(clearEventListenerCallbackMessage());
    },
    appendEventListenerCallbackMessage: (eventType, message) => {
      dispatch(appendEventListenerCallbackMessage(eventType, message));
    },
    removeEventListenerCallback: (eventType, callback) => {
      dispatch(removeEventListenerCallback(eventType, callback));
    },
    addCamera: camera => {
      dispatch(addCamera(camera));
    },
    addLookAt: lookAt => {
      dispatch(addLookAt(lookAt));
    },
    clearResults: () => {
      dispatch(clearResults());
    }
  };
};

const ValidationContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(DragDropContext(HTML5Backend)(ValidationApp));

export default ValidationContainer;
