/**
 * Created by the US Army SEC on 12/19/2016.
 */
import React, {Component, PropTypes} from 'react';
import DropdownList from 'react-widgets/lib/DropdownList';
import {RelatedTests} from '../../containers';

class CameraEventHandlersTest extends Component {
  constructor(props) {
    super(props);

    let selectedCameraId = '';

    let map = _.first(props.maps);
    if (map && props.cameras.length === 0) {
      let camera = map.getCamera();
      if (!camera.name) {
        camera.name = 'camera';
        camera.apply();
      }
      props.addCamera(camera);
      selectedCameraId = camera.geoId;
    }

    this.state = {
      selectedCameraId: selectedCameraId
    };

    this.handleCameraSelect = this.handleCameraSelect.bind(this);
    this.addCameraEventListeners = this.addCameraEventListeners.bind(this);
    this.removeEventListeners = this.removeEventListeners.bind(this);
  }

  componentWillReceiveProps(props) {
    let map = _.first(props.maps);
    if (map && this.state.selectedCameraId === '') {
      let camera = map.getCamera();
      if (!camera.name) {
        camera.name = 'camera';
        camera.apply();
      }
      props.addCamera(camera);
      this.setState({selectedCameraId: camera.geoId});
    }
  }

  handleCameraSelect(camera) {
    this.setState({selectedCameraId: camera.geoId});
  }

  addCameraEventListeners() {
    const {cameras} = this.props;
    let camera = _.find(cameras, {geoId: this.state.selectedCameraId});

    let cameraInMotionEventHandler = () => {
      toastr.info('emp3.api.enums.CameraEventEnum.CAMERA_IN_MOTION listener fired');
    };

    let cameraMotionStoppedEventHandler = () => {
      toastr.info('emp3.api.enums.CameraEventEnum.CAMERA_MOTION_STOPPED listener fired');
    };

    try {
      camera.addCameraEventListener({
        eventType: emp3.api.enums.CameraEventEnum.CAMERA_IN_MOTION,
        callback: cameraInMotionEventHandler
      });

      camera.addCameraEventListener({
        eventType: emp3.api.enums.CameraEventEnum.CAMERA_MOTION_STOPPED,
        callback: cameraMotionStoppedEventHandler
      });

      this.setState({eventListeners: [cameraInMotionEventHandler, cameraMotionStoppedEventHandler]});
    } catch (err) {
      toastr.error(err.message);
      window.console.debug(err);
    }
  }

  removeEventListeners() {
    const {cameras} = this.props;
    let camera = _.find(cameras, {geoId: this.state.selectedCameraId});

    try {
      camera.removeEventListener({
        eventType: emp3.api.enums.CameraEventEnum.CAMERA_IN_MOTION,
        callback: this.state.eventListeners[0]
      });
      camera.removeEventListener({
        eventType: emp3.api.enums.CameraEventEnum.CAMERA_MOTION_STOPPED,
        callback: this.state.eventListeners[1]
      });
      this.setState({eventListeners: []});
    } catch (err) {
      toastr.error(err.message);
      window.console.error(err);
    }
  }

  render() {
    const {cameras} = this.props;

    return (
      <div>
        <span className="mdl-container-title">Camera Event Handlers</span>
        <div className="mdl-grid">

          <DropdownList className="mdl-cell mdl-cell--12-col"
                        data={cameras}
                        valueField="geoId"
                        textField="name"
                        value={this.state.selectedCameraId}
                        onChange={this.handleCameraSelect}/>

          <button
            className="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col"
            onClick={this.addCameraEventListeners}
            disabled={this.state.selectedCameraId === ''}>
            Add Camera Events
          </button>

          <button
            className="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col"
            onClick={this.removeEventListeners}
            disabled={this.state.selectedCameraId === ''}>
            Remove Camera Events
          </button>

          <RelatedTests className="mdl-cell mdl-cell--12-col"
                        relatedTests={[{text: 'Create a camera', target: 'createCameraTest'}]}/>
        </div>
      </div>
    );
  }
}

CameraEventHandlersTest.propTypes = {
  cameras: PropTypes.array,
  maps: PropTypes.array,
  addCamera: PropTypes.func
};

export default CameraEventHandlersTest;
