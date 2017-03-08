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
    this.copyDataUrlToClipboard = this.copyDataUrlToClipboard.bind(this);
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
        toastr.success('Grabbed screenshot');
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
        // 0,0 is the origin on the canvas, 200,200 is the scaled dimension
        ctx.drawImage(img, 0, 0, 200, 200);
      } catch (err) {
        toastr.error(err.message);
        window.console.error(err);
      }
    };

    img.src = this.state.preview;
  }

  copyDataUrlToClipboard() {
    let range = document.createRange();
    range.selectNodeContents(this.refs.dataUrl);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    try {
      let successful = document.execCommand('copy');
      if (!successful) {
        toastr.error('Copy failed');
      }
    } catch (err) {
      window.console.error(err);
    }
    window.getSelection().removeAllRanges();
  }

  render() {
    const {maps} = this.props;

    return (
      <div className='mdl-grid'>
        <span className='mdl-layout-title'>Get Screen Capture</span>

        <div className='mdl-cell mdl-cell--12-col'>
          <MapSelect selectedMapId={this.state.selectedMapId}
                     label='Select Map '
                     maps={maps}
                     callback={event => this.setState({selectedMapId: event.target.value})}/>
        </div>

        <button
          className='mdl-button mdl-js-button mdl-js--ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
          onClick={this.getScreenCapture} disabled={this.state.selectedMapId === ''}>
          Get Screen Capture
        </button>

        <div className="mdl-cell mdl-cell--12-col" style={{alignContents: 'center'}}>
          <div>Scaled Preview</div>
          <canvas ref="canvas" width={200} height={200}/>
        </div>

        <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-cell mdl-cell--12-col"
                style={{alignContents: 'center'}}
                onClick={this.copyDataUrlToClipboard}
                disabled={!this.state.preview}>
          Copy DataURL <i className="fa fa-clipboard"/>
        </button>

        <div ref={'dataUrl'} style={{position: 'absolute', top: -1000, left: -99999999}}>
          {/* this is a kind of stupid way to do this */}
          {this.state.preview}
        </div>

        <RelatedTests relatedTests={[
          {text: 'Map.setMilStdLabels', target: 'mapSetMilStdLabelsTest'}
        ]}/>
      </div>
    );
  }
}

MapGetScreenCaptureTest.propTypes = {
  maps: PropTypes.array
};

export default MapGetScreenCaptureTest;
