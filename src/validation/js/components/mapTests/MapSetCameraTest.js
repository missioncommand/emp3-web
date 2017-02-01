import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import RelatedTests from '../../containers/RelatedTests';

class MapSetCameraTest extends Component {
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
        altitude: '',
        altitudeMode: '',
        heading: '',
        latitude: '',
        longitude: '',
        roll: '',
        tilt: ''
      }
    };

    this.mapSetCamera = this.mapSetCamera.bind(this);
    this.updateAltitudeMode = this.updateAltitudeMode.bind(this);
    this.updateSelectedMap = this.updateSelectedMap.bind(this);
  }

  componentDidMount() {
    // TODO remove timers, have a subscribe or watch or event driven thing, timers === bad
    window.console.warn('There is a timer being used to watch the camera properties instead of an event handler or observer. This should be fixed');
    this.updateCameraValues = setInterval(() => {
      if (this.props.cameras.length) {
        this.forceUpdate();
      }
    }, 500);
  }

  componentWillUnmount() {
    clearInterval(this.updateCameraValues);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  updateCamera(event) {
    const prop = event.target.id.split('-')[1];
    let newCamera = {...this.state.camera};
    newCamera[prop] = event.target.value;
    this.setState({camera: newCamera});
  }

  updateAltitudeMode(event) {
    let newCamera = {...this.state.camera};
    newCamera.altitudeMode = event.target.value;
    this.setState({camera: newCamera});
  }

  mapSetCamera(cameraId) {
    if (this.state.selectedMapId === '') {
      toastr.warning('Please select a map first');
      return;
    }

    const map = _.find(this.props.maps, {geoId: this.state.selectedMapId});
    const camera = _.find(this.props.cameras, {geoId: cameraId});

    try {
      map.setCamera({
        camera: camera,
        onSuccess: (args) => {
          toastr.success('Camera Set Successfully: \n' + JSON.stringify(args.camera));
        },
        onError: err => {
          this.props.addError(err, 'mapSetCamera');
          toastr.error('Failed to Set Camera');
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Set Camera Failed: Critical');
      this.props.addError(err.message, 'mapSetCamera: Critical');
    }
  }

  updateSelectedMap(event) {
    this.setState({selectedMapId: event.target.value});
  }

  render() {
    return (
      <div>
        <span className='mdl-layout-title'>Set the Camera for a 3D Map</span>

        <label htmlFor='mapGetCamera-map'>Select which map's camera you want. (This will only work for 3D maps)</label>
        <select className='blocky' id='mapGetCamera-map' value={this.state.selectedMapId} onChange={this.updateSelectedMap}>
          {this.props.maps.map(map => {
            return <option key={map.geoId} value={map.geoId}>{map.container}</option>;
          })}
        </select>

        <ul className='mdl-list'>
          {this.props.cameras.map(camera => {
            return (<li key={camera.geoId} className='mdl-list__item mdl-list__item--three-line'>
              <span className='mdl-list__item-primary-content'>
                <span style={{fontSize:'0.8em'}}>{camera.geoId}</span>
                <span className='mdl-list__item-text-body' style={{fontSize:'0.7em'}}>
                  Lat: {camera.latitude.toFixed(2)}, Lon: {camera.longitude.toFixed(2)}, Alt: {camera.altitude.toFixed(2)}
                  Roll: {camera.roll.toFixed(2)}, Tilt: {camera.tilt.toFixed(2)}, Heading: {camera.heading.toFixed(2)}
                </span>
              </span>
              <span className='mdl-list__item-secondary-content'>
                <button className='mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-list__item-secondary-action'
                        onClick={() => this.mapSetCamera(camera.geoId)}><i className='fa fa-plus'/></button>
              </span>
            </li>);
          })}
        </ul>

        <RelatedTests relatedTests={[
          {text: 'Get Bounds', target: 'mapGetBoundsTest'},
          {text: 'Get Map Camera', target: 'mapGetCameraTest'},
          {text: 'Get Map LookAt', target: 'mapGetLookAtTest'},
          {text: 'Set Bounds', target: 'mapSetBoundsTest'},
          {text: 'Set Map LookAt', target: 'mapSetLookAtTest'}
          ]}/>
      </div>
    );
  }
}

MapSetCameraTest.propTypes = {
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired,
  cameras: PropTypes.array.isRequired,
  maps: PropTypes.array.isRequired
};

// =============================================================================
// Connect to redux state management
// =============================================================================
const mapStateToProps = state => {
  return {
    cameras: state.cameras
  };
};

export default connect(mapStateToProps)(MapSetCameraTest);
