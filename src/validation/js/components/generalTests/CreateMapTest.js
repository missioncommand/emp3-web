import React, {Component, PropTypes} from 'react';
import {VText, VCheckBox} from '../shared';
import RelatedTests from '../../containers/RelatedTests';

class CreateMapTest extends Component {
  constructor(props) {
    super(props);

    this.state = {
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

  /**
   * Creates a new map and map frame in the application.
   * This is a special case, this affects the whole application and requires some async work so it is just passed
   * up to the main application
   */
  addMap() {
    const {createMap} = this.props;

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

    createMap(bounds, this.state.engineId === '' ? undefined : this.state.engineId,
      false, this.state.recorder, parseInt(this.state.brightness), parseInt(this.state.midDistanceThreshold),
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

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.clearForm}>
            Reset Form
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
  createMap: PropTypes.func.isRequired,
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired
};

export default CreateMapTest;
