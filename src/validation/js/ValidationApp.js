/* global empConfig */

// Import required modules
import * as React from 'react';
import {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {guid} from './util/UUIDGen';

import {Map, Navbar, About} from './components/app';

// Import containers
import ControlPanel from './components/ControlPanel';
import Results from './containers/Results';

import Settings from './components/Settings';

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
      isResultsOpen: false,
      isSettingsOpen: false,
      resizing: false, // Used for dragging
      ghostWidth: 325, //
      width: 325,
      windows: [],
      activeScript: '',
      activeMap: 'map0',
      mapContainers: 1 // Defaults to one
    };

    toastr.options.closeButton = true;
    toastr.options.preventDuplicates = false;
    toastr.options.positionClass = 'notification-toast-top-right';

    this.resizeComponents = this.resizeComponents.bind(this);
    this.executeScript = this.executeScript.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.createOverlay = this.createOverlay.bind(this);
    this.hideResults = this.hideResults.bind(this);
    this.showResults = this.showResults.bind(this);
    this.toggleSettings = this.toggleSettings.bind(this);
    this.mapGoto = this.mapGoto.bind(this);
    this.addMapContainer = this.addMapContainer.bind(this);
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

  componentWillReceiveProps(props) {
    if (props.maps.length < this.state.mapContainers) {
      this.setState({mapContainers: Math.max(props.maps.length, 1)});
    }
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

    this.setState({ghostWidth: Math.round(offset)});
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
      window.console.error(err);
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

  addMapContainer() {
    if (this.state.mapContainers < 4) {
      this.setState({mapContainers: this.state.mapContainers + 1});
    } else {
      toastr.warning('Cannot exceed 4 maps', 'Map Limit');
    }
  }

  render() {
    const ghostbar =
      <div id='ghostbar' className='dragbar' style={{
        left: this.state.ghostWidth + 'px',
        opacity: this.state.resizing ? '0.5' : 0
      }}>
      </div>;

    const dragbar = (
      <div id='dragbar' className='dragbar'
           onMouseDown={this.handleDragBarMouseDown.bind(this)}
           style={{left: (this.state.width + 3) + 'px'}}>
      </div>);

    // Set up grid of maps
    let baseMapStyle = {position: 'absolute', top: 0, bottom: 0, left: 0, right: 0};

    const mapContainers = [];
    for (let iMap = 0; iMap < this.state.mapContainers; iMap++) {
      let mapId = 'map' + iMap;
      let mapStyle = _.clone(baseMapStyle);

      // Remember iMap is offset by 1
      if (this.state.mapContainers === 4) {
        // map0,1 on top; map2,3 on the bottom
        mapStyle.top = iMap >= 2 ? '50%' : 0;
        mapStyle.bottom = iMap >= 2 ? 0 : '50%';

        // map0,3 are on the left, map1,3 on the right
        if (iMap === 0 || iMap === 2) {
          mapStyle.left = 0;
          mapStyle.right = '50%';
        } else {
          mapStyle.left = '50%';
          mapStyle.right = 0;
        }

      } else if (this.state.mapContainers > 1) {
        // map0 on top; map1,2 on the bottom
        mapStyle.top = iMap >= 1 ? '50%' : 0;
        mapStyle.bottom = iMap >= 1 ? 0 : '50%';

        if (iMap === 0 || this.state.mapContainers < 3) {
          mapStyle.left = 0;
          mapStyle.right = 0;
        } else if (iMap === 1) {
          mapStyle.left = 0;
          mapStyle.right = '50%';
        } else {
          mapStyle.left = '50%';
          mapStyle.right = 0;
        }
      }

      mapContainers.push(<Map mapId={mapId}
                              key={'mapContainer_' + iMap}
                              style={mapStyle}/>);
    }

    return (
      <div className='mdl-layout mdl-js-layout'>
        <Navbar {...this.props}
                goto={this.mapGoto}
                showResults={this.showResults}
                toggleSettings={() => this.setState({isSettingsOpen: !this.state.isSettingsOpen})}
                toggleAbout={() => this.setState({isAboutOpen: !this.state.isAboutOpen})}
                isSettingsOpen={this.state.isSettingsOpen}
                addMapContainer={this.addMapContainer}
                createOverlay={this.createOverlay}
                executeScript={this.executeScript}
                setActiveScript={scriptName => this.setState({activeScript: scriptName})}
                activeScript={this.state.activeScript}/>

        { /** Modals */ }
        <Results isResultsOpen={this.state.isResultsOpen}
                 hideResults={this.hideResults}/>

        <About isOpen={this.state.isAboutOpen}
               close={() => this.setState({isAboutOpen: false})}/>

        {ghostbar}
        {dragbar}

        <div id='contentPane'>
          <div id='sidebar' style={{width: this.state.width + 'px'}} className='mdl-layout__content'>
            <ControlPanel id='controlPanel'
                          {...this.props}/>
          </div>

          <div id='mapsPanel' style={{
            left: (this.state.width + 6) + 'px',
            opacity: this.state.isSettingsOpen ? 0 : 1
          }}>

            {mapContainers}

          </div>

          <div id='settingsPanel' style={{
            left: (this.state.width + 6) + 'px',
            opacity: this.state.isSettingsOpen ? 1 : 0,
            zIndex: this.state.isSettingsOpen ? 100 : -100
          }}>
            {this.state.isSettingsOpen ? <Settings /> : null}
          </div>
        </div>
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
