import React, {Component, PropTypes} from 'react';
import {VText, VCheckBox} from '../shared';
import RelatedTests from '../../containers/RelatedTests';

class CreateMapTest extends Component {
  constructor(props) {
    super(props);

    this.state = {
      bounds: {
        north: '50',
        south: '40',
        east: '50',
        west: '40',
        centerLat: '',
        centerLon: '',
        range: '',
        scale: ''
      },
      brightness: 50,
      enableOptimization: true,
      midDistanceThreshold: 20000,
      farDistanceThreshold: 600000,
      recorder: false,
      engineId: ''
    };

    this.updateBounds = this.updateBounds.bind(this);
    this.clearForm = this.clearForm.bind(this);
    this.updateRecorder = this.updateRecorder.bind(this);
    this.addMap = this.addMap.bind(this);
    this.createMap = this.createMap.bind(this);
  }

  clearForm() {
    this.setState({
      bounds: {
        north: '',
        south: '',
        east: '',
        west: '',
        centerLat: '',
        centerLon: '',
        range: '',
        scale: ''
      },
      engineId: ''
    });
  }

  /**
   * Updates the state
   * @param {event} event DOM Event
   */
  updateBounds(event) {
    let param = event.target.id.split('-')[1];
    let newBounds = {...this.state.bounds};
    switch (param) {
      case 'engineId':
        this.setState({engineId: event.target.value});
        break;
      case 'brightness':
        this.setState({brightness: event.target.value});
        break;
      case 'midDistanceThreshold':
        this.setState({midDistanceThreshold: event.target.value});
        break;
      case 'farDistanceThreshold':
        this.setState({farDistanceThreshold: event.target.value});
        break;
      default:
        newBounds[param] = event.target.value;
        this.setState({bounds: newBounds});
    }
  }

  updateRecorder(event) {
    this.setState({
      recorder: event.target.checked
    });
  }

  createMap(bounds, mapEngineId, recorder, brightness, midDistanceThreshold, farDistanceThreshold) {
    const {maps, addMap, addResult, addError} = this.props;
    if (maps.length >= 4) {
      toastr.error('Remove a map', 'Map Limit Reached');
      return;
    }

    let config = empConfig;

    if (typeof empConfig.recorder !== 'undefined') {
      recorder = empConfig.recorder;
    }

    if (config.engines.length === 0) {
      toastr.warning('No engines are specified in the config', 'EMP3 Validation');
      return;
    }

    try {
      let engine = _.find(empConfig.engines, {mapEngineId: mapEngineId});
      empConfig.startMapEngineId = engine.mapEngineId;
      let containerId = 'map' + maps.length;
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


  /**
   * Creates a new map and map frame in the application.
   * This is a special case, this affects the whole application and requires some async work so it is just passed
   * up to the main application
   */
  addMap() {
    let bounds = {
      north: this.state.bounds.north === '' ? undefined : parseFloat(this.state.bounds.north),
      south: this.state.bounds.south === '' ? undefined : parseFloat(this.state.bounds.south),
      east: this.state.bounds.east === '' ? undefined : parseFloat(this.state.bounds.east),
      west: this.state.bounds.west === '' ? undefined : parseFloat(this.state.bounds.west),
      centerLat: this.state.bounds.centerLat === '' ? undefined : parseFloat(this.state.bounds.centerLat),
      centerLon: this.state.bounds.centerLon === '' ? undefined : parseFloat(this.state.bounds.centerLon),
      range: this.state.bounds.range === '' ? undefined : parseFloat(this.state.bounds.range),
      scale: this.state.bounds.scale === '' ? undefined : parseFloat(this.state.bounds.scale)
    };

    let blankBounds = true;
    for (let prop in bounds) {
      if (typeof bounds[prop] !== 'undefined') {
        blankBounds = false;
        break;
      }
    }
    if (blankBounds) {
      bounds = undefined;
    }

    this.createMap(bounds,
      this.state.engineId === '' ? undefined : this.state.engineId,
      this.state.recorder,
      parseInt(this.state.brightness),
      parseInt(this.state.midDistanceThreshold),
      parseInt(this.state.farDistanceThreshold));
  }

  render() {
    const fields = [
      {value: this.state.bounds.north, id: 'createMap-north', text: 'North'},
      {value: this.state.bounds.south, id: 'createMap-south', text: 'South'},
      {value: this.state.bounds.east, id: 'createMap-east', text: 'East'},
      {value: this.state.bounds.west, id: 'createMap-west', text: 'West'},
      {value: this.state.engineId, id: 'createMap-engineId', text: 'Map Engine ID'}
    ];

    return (
      <div>
        <span className='mdl-layout-title'>Create a Map</span>

        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--12-col mdl-grid mdl-grid--no-spacing'>
            {_.map(fields, field => {
              return (
                <VText
                  key={field.id}
                  id={field.id}
                  classes={['mdl-cell', 'mdl-cell--12-col']}
                  value={field.value}
                  label={field.text}
                  callback={this.updateBounds}/>
              );
            })}
          </div>

          <VText id='createMap-brightness'
                 classes={['mdl-cell', 'mdl-cell--12-col']}
                 label='Background Brightness'
                 value={this.state.brightness}
                 callback={this.updateBounds}/>

          <VText id='createMap-midDistanceThreshold'
                 classes={['mdl-cell', 'mdl-cell--12-col']}
                 label='Mid-Distance Threshold'
                 value={this.state.midDistanceThreshold}
                 callback={this.updateBounds}/>

          <VText id='createMap-farDistanceThreshold'
                 classes={['mdl-cell', 'mdl-cell--12-col']}
                 label='Far-Distance Threshold'
                 value={this.state.farDistanceThreshold}
                 callback={this.updateBounds}/>

          <VCheckBox id='recorder' label='Recorder' checked={this.state.recorder} callback={this.updateRecorder}
                     classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.addMap}>
            Create a new map
          </button>

          <RelatedTests className='mdl-cell mdl-cell--12-col' relatedTests={[
            {text: 'Populate the map with sample data', target: 'populateMapTest'},
            {text: 'Create a new overlay', target: 'createOverlayTest'},
            {text: 'Add an existing overlay to this map'},
            {text: 'Change this map\'s view'},
            {text: 'Zoom out as far as you can go'}
          ]}/>
        </div>
      </div>
    );
  }
}

CreateMapTest.propTypes = {
  config: PropTypes.any,
  addResult: PropTypes.func,
  addError: PropTypes.func,
  addMap: PropTypes.func,
  maps: PropTypes.array
};

export default CreateMapTest;
