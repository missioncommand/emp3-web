import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {MapSelect} from '../shared';

class MapGetScreenCaptureTest extends Component {
  constructor(props) {
    super(props);

    let selectedMapId = '';
    if (props.maps.length) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId,
      preview: undefined
    };

    this.getScreenCapture = this.getScreenCapture.bind(this);
    this.updateCanvas = this.updateCanvas.bind(this);
  }

  componentDidMount() {
    const ctx = this.refs.canvas.getContext('2d');
    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  getScreenCapture() {
    const {maps} = this.props;

    let map = _.find(maps, {geoId: this.state.selectedMapId});
    if (!map) {
      return;
    }

    map.getScreenCapture({
      onSuccess: (cbArgs) => {
        toastr.success('Got the capture');
        window.console.log(cbArgs.dataUrl);
        this.setState({preview: cbArgs.dataUrl}, this.updateCanvas);
      },
      onError: (err) => {
        toastr.error('Failed to get the screenshot');
        window.console.error(err);
      }
    });
  }

  updateCanvas() {
    const ctx = this.refs.canvas.getContext('2d');
    let img = new Image();
    img.onload = () => {
      try {
        ctx.drawImage(img, 0, 0);
      } catch (err) {
        toastr.error(err.message);
        window.console.error(err);
      }
    };

    img.src = this.state.preview;
  }

  render() {
    const {maps} = this.props;

    return (
      <div className='mdl-grid'>
        <span className='mdl-layout-title'>Get Screen Capture</span>
        <div className='mdl-cell mdl-cell--12-col'>
          <MapSelect selectedMapId={this.state.selectedMapId} label='Select Map ' maps={maps}
                     callback={event => this.setState({selectedMapId: event.target.value})}/>

          <button
            className='mdl-button mdl-js-button mdl-js--ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.getScreenCapture} disabled={this.state.selectedMapId === ''}>
            Get Screen Capture
          </button>

          <div className="mdl-cell mdl-cell--12-col mdl-grid">
            <canvas ref="canvas" width={200} height={200}/>
          </div>

          <div>
            {this.state.preview}
          </div>

          <RelatedTests relatedTests={[
            {text: 'Map.setMilStdLabels', target: 'mapSetMilStdLabelsTest'}
          ]}/>
        </div>
      </div>
    );
  }
}

MapGetScreenCaptureTest.propTypes = {
  maps: PropTypes.array
};

export default MapGetScreenCaptureTest;
