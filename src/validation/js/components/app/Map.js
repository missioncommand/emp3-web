import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {findDOMNode} from 'react-dom';
import {DropTarget} from 'react-dnd';
import {DragItems} from '../../constants/DragItems';
import {CoordinatesWindow} from '../windows';

import {addMap} from '../../actions/MapActions';
import {addResult, addError} from '../../actions/ResultActions';
import {addFeature} from '../../actions/FeatureActions';
import {addOverlay} from '../../actions/OverlayActions';


/**
 * Make calls to multiple maps simultaneously
 * @constructor
 */
function MapCoordinator() {
  this.handlers = {};
}

MapCoordinator.prototype = {
  /**
   * @param prop
   * @param fn
   */
  subscribe: function(prop, fn) {
    if (!(prop in this.handlers)) {
      this.handlers[prop] = [];
    }
    this.handlers[prop].push(fn);
  },
  /**
   *
   * @param prop
   * @param fn
   */
  unsubscribe: function(prop, fn) {
    this.handlers[prop] = this.handlers[prop].filter(
      function(item) {
        if (item !== fn) {
          return item;
        }
      }
    );
  },
  /**
   *
   * @param prop
   * @param o
   * @param thisObj
   */
  fire: function(prop, o, thisObj) {
    var scope = thisObj || window;
    this.handlers[prop].forEach(function(fn) {
      fn.apply(scope, o);
    });
  }
};

const mapCoordinator = new MapCoordinator();

//======================================================================================================================
class MapSelection extends Component {
  constructor(props) {
    super(props);

    this.waitForConfig = this.waitForConfig.bind(this);
  }

  componentDidMount() {
    this.waitForConfig();
  }

  /**
   * This fixes the load time on the config object
   */
  waitForConfig() {
    if (!empConfig.engines) {
      setTimeout(this.waitForConfig, 50);
    } else {
      componentHandler.upgradeDom();
      this.forceUpdate();
    }
  }

  render() {
    const {selectEngine} = this.props;

    return (
      <div className="mdl-grid">
        <div className="mdl-layout-spacer"/>
        <span className="mdl-layout-title">Select Map Engine</span>
        <div className="mdl-layout-spacer"/>
        { _.map(empConfig.engines, engine => {
          return (<div key={engine.mapEngineId} className="mdl-cell mdl-cell--12-col mdl-grid mdl-grid--no-spacing">
            <button
              className="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--4-col mdl-cell--4-offset"
              onClick={selectEngine.bind(this, engine.mapEngineId)}>
              {engine.mapEngineId.substring(0, engine.mapEngineId.length - 9)}
            </button>
          </div>);
        })}
      </div>
    );
  }
}

MapSelection.propTypes = {
  selectEngine: PropTypes.func
};

//======================================================================================================================
const spec = {
  drop: (props, monitor, component) => {
    if (monitor.didDrop()) {
      return;
    }

    const {addFeature, addOverlay, maps, mapId} = props;

    const clientOffset = monitor.getClientOffset();
    const componentRect = findDOMNode(component).getBoundingClientRect();
    const featureArgs = {...monitor.getItem()}; // use a copy

    /** @type emp3.api.Map */
    const map = _.find(maps, {container: mapId});

    let standard = featureArgs.symbolStandard || '2525c';
    let basicSymbol = armyc2.c2sd.renderer.utilities.SymbolUtilities.getBasicSymbolID(featureArgs.symbolCode, standard);
    let symbolDef = armyc2.c2sd.renderer.utilities.SymbolDefTable.getSymbolDef(basicSymbol, standard === '2525b' ? 0 : 1);

    let stepBounds = map.getBounds();
    let step = (stepBounds.east - stepBounds.west) / 10 || 1;

    let origin = map.containerToGeo({
      x: clientOffset.x - componentRect.left,
      y: clientOffset.y - componentRect.top
    });

    featureArgs.positions = [origin];

    let nextPoint, finalPoint;

    if (symbolDef && symbolDef.maxPoints) {
      switch (Math.min(symbolDef.maxPoints, 5)) {
        case 5:
          for (let i = 1; i < 4; i++) {
            nextPoint = _.clone(origin);

            if (i % 2 !== 0) {
              nextPoint.latitude += step;
            }

            nextPoint.longitude += i * step;
            featureArgs.positions.push(nextPoint);
          }
          finalPoint = _.clone(nextPoint);
          finalPoint.latitude -= 2 * step;
          featureArgs.positions.push(finalPoint);
          break;
        case 4:
        case 3:
        case 2:
        case 1:
        default:
          for (let i = 1; i < Math.min(symbolDef.maxPoints, 5); i++) {
            nextPoint = _.clone(origin);

            if (i % 2 !== 0) {
              nextPoint.latitude += step;
            }

            nextPoint.longitude += i * step;
            featureArgs.positions.push(nextPoint);
          }
      }
    }

    // TODO check for type (primitives, features...)
    for (let prop in featureArgs) {
      if (featureArgs.hasOwnProperty(prop)) {
        if (featureArgs[prop] === '') {
          featureArgs[prop] = undefined;
        }
      }
    }

    let newFeature = new emp3.api.MilStdSymbol(featureArgs);

    const addFeatureToApp = () => {
      addFeature(newFeature);
    };

    map.getAllOverlays({
      onSuccess: (cbArgs) => {
        if (cbArgs.overlays.length) {
          // Just add it to the first overlay
          cbArgs.overlays[0].addFeature({
            feature: newFeature,
            onSuccess: addFeatureToApp
          });
        } else {
          let overlay = new emp3.api.Overlay({name: 'sandbox', geoId: 'sandbox_' + mapId});
          map.addOverlay({
            overlay: overlay,
            onSuccess: () => {
              addOverlay(overlay);
              overlay.addFeature({
                feature: newFeature,
                onSuccess: addFeatureToApp
              });
            }
          });
        }
      }
    });

    return {dropped: true};
  },
  canDrop: props => {
    const {maps, mapId} = props;

    // If the map exists we can drop
    return Boolean(_.find(maps, {container: mapId}));
  }
};

const collect = (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  };
};

class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hideSelector: false,
      mapId: ''
    };
  }

  componentWillReceiveProps(props) {
    let hideSelector = false;
    if (props.maps.length) {
      props.maps.forEach(map => {
        if (map.container === props.mapId) {
          hideSelector = true;
        }
      });
    }
    this.setState({hideSelector: hideSelector});
  }

  /**
   * Creates a new map in the map panel to a maximum of four maps
   * @param {number} [mapEngineId]
   */
  createMap(mapEngineId) {
    let bounds = {
        north: 50,
        south: 40,
        east: 50,
        west: 40
      },
      recorder = false,
      brightness = 50,
      midDistanceThreshold = 2e4,
      farDistanceThreshold = 6e5;
    const {mapId, addMap, addResult, addError} = this.props;

    let config = empConfig;

    if (typeof empConfig.recorder !== 'undefined') {
      recorder = empConfig.recorder;
    }

    if (config.engines.length === 0) {
      toastr.warning('No engines are specified in the config', 'EMP3 Validation');
      return;
    }

    try {
      let engine = _.find(config.engines, {mapEngineId: mapEngineId || config.startMapEngineId});
      empConfig.startMapEngineId = engine.mapEngineId;
      let containerId = mapId;
      let environment = config.environment;
      let envOverride = false;
      (function() {
        let urlEnv = emp.util.getParameterByName('empenv');
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

      let map;
      const registerMapCallback = () => {
        addMap(map);
      };

      const mapDefinition = {
        bounds: bounds,
        environment: environment,
        engine: engine,
        recorder: recorder,
        backgroundBrightness: brightness,
        midDistanceThreshold: midDistanceThreshold,
        farDistanceThreshold: farDistanceThreshold,
        onSuccess: args => {
          toastr.success('Map created successfully', 'Map Creation');
          addResult(args, 'emp3.api.Map Constructor');

          // Register the map with the application
          registerMapCallback();
        },
        onError: err => {
          toastr.error('Map creation failed', 'Map Creation');
          addError(err, 'emp3.api.Map Constructor');
        }
      };

      if (envOverride === false) {
        // We only want to spawn a local map instance if we are using standalone embedded browser environment which is the default here
        mapDefinition.container = containerId;
      }
      emp3.api.global.configuration.urlProxy = config.urlProxy;

      map = new emp3.api.Map(mapDefinition);
      toastr.info('Map creation pending', 'Map Creation');
    } catch (e) {
      toastr.error(e.message, 'Map creation failed: Critical');
      addError(e.message, 'emp3.api.Map Constructor: Critical');
    }
  }

  render() {
    const {connectDropTarget, mapId, style, maps} = this.props;
    const map = _.find(maps, {container: mapId});

    return (
      <div className="map" style={style}>
        {/* Map or a map selection dialog */}
        {connectDropTarget(
          <div id={mapId} style={{height: '100%', width: '100%'}}>
            {this.state.hideSelector || map ? null :
              <div style={{height: '100%'}}>
                <div style={{height: '40%'}}/>
                <MapSelection
                  selectEngine={(engine) => this.setState({hideSelector: true}, () => this.createMap(engine))}/>
              </div>
            }
          </div>)}

        {/* Coordinates for the map or nothing */}
        {map ? <CoordinatesWindow map={map}
                                  ref={"coords"}
                                  style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0
                                  }}
                                  id={map.geoId + '_coordsWindow'}/> : null }
      </div>
    );
  }
}

Map.propTypes = {
  maps: PropTypes.array,
  connectDropTarget: PropTypes.func,
  isOver: PropTypes.bool,
  canDrop: PropTypes.bool,
  style: PropTypes.object,
  mapId: PropTypes.string.isRequired,
  addResult: PropTypes.func,
  addError: PropTypes.func,
  addMap: PropTypes.func,
  addOverlay: PropTypes.func
};

Map.defaultProps = {
  style: {
    height: "100%",
    width: "100%"
  }
};

const mapStateToProps = state => {
  return {
    maps: state.maps
  };
};

const mapDispatchToProps = dispatch => {
  return {
    addError: (err, title) => {
      dispatch(addError(err, title));
    },
    addResult: (result, title) => {
      dispatch(addResult(result, title));
    },
    addMap: (map) => {
      // Ignore certain functions that will conflict with each other or are redundant
      let ignoredFuncs = [
        'apply',
        'patchProps',
        'readyCheck',
        'getCamera',
        'getBounds',
        'getLookAt',
        'editFeature',
        'drawFeature'
      ];

      for (let prop in map) {
        if (typeof map[prop] === "function" && !_.includes(ignoredFuncs, prop)) {
          let origFunc = map[prop];

          // Replace the function with a call to the coordinator to fire the stored function
          map[prop] = function() {
            // The coordinator is now responsible for firing the function
            mapCoordinator.fire(prop, arguments);
          };

          // Store the original function
          mapCoordinator.subscribe(prop, origFunc.bind(map));
        }
      }


      dispatch(addMap(map));
    },
    addOverlay: overlay => {
      dispatch(addOverlay(overlay));
    },
    addFeature: feature => {
      dispatch(addFeature(feature));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps)(DropTarget(DragItems.MIL_STD_SYMBOL, spec, collect)(Map));
