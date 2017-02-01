import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {connect} from 'react-redux';
import {addCamera} from '../../actions/CameraActions';
import {MapSelect, VText} from '../shared';

class CreateCameraTest extends Component {
  constructor(props) {
    super(props);

    let selectedMapId = '';
    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId,
      camera: {
        name: '',
        geoId: '',
        description: '',
        latitude: '',
        longitude: '',
        altitude: '',
        altitudeMode: '',
        roll: '',
        tilt: '',
        heading: ''
      }
    };

    this.applyChanges = this.applyChanges.bind(this);
    this.updateSelectedMap = this.updateSelectedMap.bind(this);
    this.createCamera = this.createCamera.bind(this);
    this.updateCamera = this.updateCamera.bind(this);
    this.createAndSetCamera = this.createAndSetCamera.bind(this);
  }

  updateSelectedMap(event) {
    this.setState({selectedMapId: event.target.value});
  }

  createCamera() {
    const {addCamera} = this.props;

    let args = {
      name: this.state.camera.name === '' ? undefined : this.state.camera.name,
      geoId: this.state.camera.geoId === '' ? undefined : this.state.camera.geoId,
      description: this.state.camera.description === '' ? undefined : this.state.camera.description,
      latitude: this.state.camera.latitude === '' ? undefined : parseFloat(this.state.camera.latitude),
      longitude: this.state.camera.longitude === '' ? undefined : parseFloat(this.state.camera.longitude),
      altitude: this.state.camera.altitude === '' ? undefined : parseFloat(this.state.camera.altitude),
      roll: this.state.camera.roll === '' ? undefined : parseFloat(this.state.camera.roll),
      tilt: this.state.camera.tilt === '' ? undefined : parseFloat(this.state.camera.tilt),
      heading: this.state.camera.heading === '' ? undefined : parseFloat(this.state.camera.heading),
      altitudeMode: this.state.camera.altitudeMode === '' ? undefined : this.state.camera.altitudeMode
    };

    try {
      const camera = new emp3.api.Camera(args);
      addCamera(camera);
      toastr.success('Created Camera');
    } catch (err) {
      toastr.error(err.message, 'Camera Constructor: Critical');
    }
  }

  createAndSetCamera() {
    const {addCamera, maps, addError} = this.props;
    let args = {
      name: this.state.camera.name === '' ? undefined : this.state.camera.name,
      geoId: this.state.camera.geoId === '' ? undefined : this.state.camera.geoId,
      description: this.state.camera.description === '' ? undefined : this.state.camera.description,
      latitude: this.state.camera.latitude === '' ? undefined : parseFloat(this.state.camera.latitude),
      longitude: this.state.camera.longitude === '' ? undefined : parseFloat(this.state.camera.longitude),
      altitude: this.state.camera.altitude === '' ? undefined : parseFloat(this.state.camera.altitude),
      roll: this.state.camera.roll === '' ? undefined : parseFloat(this.state.camera.roll),
      tilt: this.state.camera.tilt === '' ? undefined : parseFloat(this.state.camera.tilt),
      heading: this.state.camera.heading === '' ? undefined : parseFloat(this.state.camera.heading),
      altitudeMode: this.state.camera.altitudeMode === '' ? undefined : this.state.camera.altitudeMode
    };

    try {
      const camera = new emp3.api.Camera(args);
      addCamera(camera);
      const map = _.find(maps, {geoId: this.state.selectedMapId});
      map.setCamera({
        camera: camera,
        onSuccess: (args) => {
          toastr.success('Set Camera On The Map: \n' + JSON.stringify(args.camera));
        },
        onError: (err) => {
          toastr.error('Failed to Set the Camera On The Map');
          addError(err, 'Map.setCamera');
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Camera Constructor: Critical');
    }
  }

  updateCamera(event) {
    const prop = event.target.id.split('-')[1];
    const newCamera = {...this.state.camera};
    newCamera[prop] = event.target.value;
    this.setState({camera: newCamera});
  }

  applyChanges() {
    const {maps} = this.props;
    const map = _.find(maps, {geoId: this.state.selectedMapId});
    const camera = map.getCamera();
    for (let prop in this.state.camera) {
      if (prop === 'altitudeMode') {
        camera[prop] = this.state.camera[prop] === '' ? camera[prop] : this.state.camera[prop];
      } else {
        camera[prop] = this.state.camera[prop] === '' ? camera[prop] : parseFloat(this.state.camera[prop]);
      }
    }
    try {
      camera.apply();
    } catch (err) {
      toastr.error(err.message, 'Camera.apply');
    }
  }

  render() {
    const {maps} = this.props;

    return (
      <div>
        <span className='mdl-layout-title'>Create a Camera</span>

        <div className='mdl-grid'>
          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.createCamera}>
            Create Camera
          </button>


          <div className='mdl-cell mdl-cell--12-col'>
            <MapSelect maps={maps}
                       selectedMapId={this.state.selectedMapId}
                       callback={this.updateSelectedMap}
                       label="Create cameras for "/>
          </div>

          <button className='mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
                  onClick={this.createAndSetCamera}
                  disabled={this.state.selectedMapId === ''}>
            Create and Set Camera
          </button>

          <button className='mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
                  onClick={this.applyChanges}>
            Update
          </button>

          <VText id='camera-name'
                 classes={['mdl-cell', 'mdl-cell--12-col']}
                 value={this.state.camera.name}
                 label='Name'
                 callback={this.updateCamera}/>

          <VText id='camera-geoId'
                 classes={['mdl-cell', 'mdl-cell--12-col']}
                 value={this.state.camera.geoId}
                 label='GeoId'
                 callback={this.updateCamera}/>

          <VText id='camera-description'
                 classes={['mdl-cell', 'mdl-cell--12-col']}
                 value={this.state.camera.description}
                 label='Description'
                 callback={this.updateCamera}/>


          <div className='mdl-grid mdl-cell mdl-cell--12-col'>
            <VText id='camera-latitude'
                   classes={['mdl-cell', 'mdl-cell--4-col']}
                   value={this.state.camera.latitude}
                   label='Lat'
                   callback={this.updateCamera}/>

            <VText id='camera-longitude'
                   classes={['mdl-cell', 'mdl-cell--4-col']}
                   value={this.state.camera.longitude}
                   label='Lon'
                   callback={this.updateCamera}/>

            <VText id='camera-altitude'
                   classes={['mdl-cell', 'mdl-cell--4-col']}
                   value={this.state.camera.altitude}
                   label='Alt'
                   callback={this.updateCamera}/>
          </div>

          <div className='mdl-grid mdl-cell mdl-cell--12-col'>
            <VText id='camera-roll'
                   classes={['mdl-cell', 'mdl-cell--4-col']}
                   value={this.state.camera.roll}
                   label='Roll'
                   callback={this.updateCamera}/>

            <VText id='camera-tilt'
                   classes={['mdl-cell', 'mdl-cell--4-col']}
                   value={this.state.camera.tilt}
                   label='Tilt'
                   callback={this.updateCamera}/>

            <VText id='camera-heading'
                   classes={['mdl-cell', 'mdl-cell--4-col']}
                   value={this.state.camera.heading}
                   label='Heading'
                   callback={this.updateCamera}/>
          </div>

          <div className='mdl-cell mdl-cell--12-col'>
            <label htmlFor='camera-altitudeMode'>Altitude Mode</label>
            <select id='camera-altitudeMode' value={this.state.camera.altitudeMode} onChange={this.updateCamera}>
              <option value=''>None</option>
            </select>
          </div>

          <RelatedTests relatedTests={[
            {text: 'Set a Camera on A Map', target: 'mapSetCameraTest'},
            {text: 'Create a Map', target: 'addMapTest'},
            {text: 'Create an Overlay', target: 'createOverlayTest'},
            {text: 'Create a Feature', target: 'createFeatureTest'},
            {text: 'Add event handlers', target: 'cameraEventHandlersTest'}
          ]}/>
        </div>
      </div>
    );
  }
}

CreateCameraTest.propTypes = {
  addCamera: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired,
  cameras: PropTypes.array.isRequired,
  maps: PropTypes.array.isRequired
};

// =============================================================================
// Connect to redux state management
// =============================================================================
const mapStateToProps = state => {
  return {
    maps: state.maps,
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateCameraTest);
