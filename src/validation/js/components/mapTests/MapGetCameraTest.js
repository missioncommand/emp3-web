import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import RelatedTests from '../../containers/RelatedTests';
import {VText} from '../shared';
import {addCamera} from '../../actions/CameraActions';

class MapGetCameraTest extends Component {
  constructor(props) {
    super(props);

    let selectedMapId = '';
    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }
    this.state = {
      selectedMapId: selectedMapId,
      camera: {
        altitude: '',
        altitudeMode: '',
        description: '',
        geoId: '',
        name: '',
        heading: '',
        latitude: '',
        longitude: '',
        roll: '',
        tilt: ''
      }
    };

    this.mapGetCamera = this.mapGetCamera.bind(this);
    this.updateSelectedMap = this.updateSelectedMap.bind(this);
    this.updateCallback = (event) => {
      this.setState({camera: event.target});
    };
  }

  componentDidMount() {
    const {maps} = this.props;
    if (this.state.selectedMapId !== '') {
      let map = _.find(maps, {geoId: this.state.selectedMapId});
      map.addEventListener({
        eventType: emp3.api.enums.EventType.CAMERA_EVENT,
        callback: this.updateCallback
      });
    }
  }

  componentWillUnmount() {
    const {maps} = this.props;
    if (this.state.selectedMapId !== '') {
      const map = _.find(maps, {geoId: this.state.selectedMapId});
      map.removeEventListener({
        eventType: emp3.api.enums.EventType.CAMERA_EVENT,
        callback: this.updateCallback
      });
    }
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      let map = _.first(props.maps);
      map.addEventListener({
        eventType: emp3.api.enums.EventType.CAMERA_EVENT,
        callback: this.updateCallback
      });
      this.setState({selectedMapId: map.geoId});
    }
  }

  mapGetCamera() {
    const {maps, addCamera, addError} = this.props;
    if (this.state.selectedMapId === '') {
      toastr.warning('Please select a map first');
      return;
    }

    const map = _.find(maps, {geoId: this.state.selectedMapId});
    try {
      let camera = map.getCamera();
      if (!camera) {
        toastr.error('Camera returned undefined');
      } else {
        this.setState({camera: camera});
        addCamera(camera);
      }
    } catch (err) {
      addError(err.message, 'mapGetCamera');
      toastr.error(err.message, 'Get Camera Failed');
    }
  }

  updateSelectedMap(event) {
    const {maps} = this.props;
    let map;
    // Take the event handler off the old map
    if (this.state.selectedMapId) {
      map = _.find(maps, {geoId: this.state.selectedMapId});
      map.removeEventListener({
        eventType: emp3.api.enums.EventType.CAMERA_EVENT,
        callback: this.updateCallback
      });
    }

    // Add the event handler to the new map
    map = _.find(maps, {geoId: event.target.value});
    map.addEventListener({
      eventType: emp3.api.enums.EventType.CAMERA_EVENT,
      callback: this.updateCallback
    });
    this.setState({selectedMapId: event.target.value});
  }

  render() {
    return (
      <div>

        <span className='mdl-layout-title'>Get the Camera for a 3D Map</span>
        <br/>

        <label htmlFor='mapGetCamera-map'>Select which map's camera you want. (This will only work for 3D maps)</label>
        <select className='blocky' id='mapGetCamera-map' value={this.state.selectedMapId}
                onChange={this.updateSelectedMap}>
          <option value=''>None</option>
          {this.props.maps.map(map => {
            return <option key={map.geoId} value={map.geoId}>{map.container}</option>;
          })}
        </select>

        <button className='blocky mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
                onClick={this.mapGetCamera} disabled={this.props.maps.length === 0}>
          Get Camera
        </button>

        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--12-col'>
            <VText id='camera-name' label='Name' value={this.state.camera.name}/>
          </div>
        </div>

        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--12-col'>
            <VText id='camera-name' label='GeoId' value={this.state.camera.geoId}/>
          </div>
        </div>

        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--12-col'>
            <VText id='camera-description' label='Description' value={this.state.camera.description}/>
          </div>
        </div>

        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--4-col'>
            <VText id='camera-latitude' label='Latitude' value={this.state.camera.latitude}/>
          </div>
          <div className='mdl-cell mdl-cell--4-col'>
            <VText id='camera-longitude' label='Longitude' value={this.state.camera.longitude}/>
          </div>
          <div className='mdl-cell mdl-cell--4-col'>
            <VText id='camera-altitude' label='Altitude' value={this.state.camera.altitude}/>
          </div>
        </div>

        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--4-col'>
            <VText id='camera-roll' label='Roll' value={this.state.camera.roll}/>
          </div>
          <div className='mdl-cell mdl-cell--4-col'>
            <VText id='camera-tilt' label='Tilt' value={this.state.camera.tilt}/>
          </div>
          <div className='mdl-cell mdl-cell--4-col'>
            <VText id='camera-heading' label='Heading' value={this.state.camera.heading}/>
          </div>
        </div>

        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--12-col'>
            <VText id='camera-altitudeMode' label='Altitude Mode' value={this.state.camera.altitudeMode}/>
          </div>
        </div>

        <RelatedTests relatedTests={[
          {text: 'Get Bounds', target: 'mapGetBoundsTest'},
          {text: 'Get Map LookAt', target: 'mapGetLookAtTest'},
          {text: 'Set Bounds', target: 'mapSetBoundsTest'},
          {text: 'Set Map Camera', target: 'mapSetCameraTest'},
          {text: 'Set Map LookAt', target: 'mapSetLookAtTest'}
        ]}/>
      </div>
    );
  }
}

MapGetCameraTest.propTypes = {
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired,
  maps: PropTypes.array.isRequired,
  cameras: PropTypes.array.isRequired,
  addCamera: PropTypes.func.isRequired
};

// =============================================================================
// Connect to redux state management
// =============================================================================
const mapStateToProps = state => {
  return {
    cameras: state.cameras
  };
};

const mapDispatchToProps = dispatch => {
  return {
    addCamera: camera => {
      dispatch(addCamera(camera));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MapGetCameraTest);
