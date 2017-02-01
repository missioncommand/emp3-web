import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {MapSelect, VText} from '../shared';

class MapDrawFreehandTest extends Component {
  constructor(props) {
    super(props);

    let selectedMapId = '';
    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId,
      strokeColor: '',
      strokeWidth: ''
    };

    this.drawFreehand = this.drawFreehand.bind(this);
    this.updateSelectedMap = this.updateSelectedMap.bind(this);
    this.updateFreehand = this.updateFreehand.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  updateSelectedMap(event) {
    this.setState({selectedMapId: event.target.value});
  }

  updateFreehand(event) {
    if (event.target.id === 'drawFreehand-strokeColor') {
      this.setState({strokeColor: event.target.value});
    } else if (event.target.id === 'drawFreehand-strokeWidth') {
      this.setState({strokeWidth: event.target.value});
    }
  }

  createStyle(strokeColor, strokeWidth) {
    var style;

    if (strokeWidth !== '' || strokeColor !== '') {
      style = {};

      if (strokeWidth !== '') {
        style.strokeWidth = strokeWidth;
      }

      if (strokeColor !== '') {
        style.strokeColor = this.convertHexToColor(strokeColor);
      }
    }

    return style;
  }

  convertHexToColor(hex) {
    var color = {},
      alpha,
      red,
      blue,
      green;

    if (hex.length === 8) {
      alpha = hex.substr(0, 2);
      red = hex.substr(2, 2);
      green = hex.substr(4, 2);
      blue = hex.substr(6, 2);

      color.red = parseInt(red, 16);
      color.blue = parseInt(blue, 16);
      color.green = parseInt(green, 16);
      color.alpha = (parseInt(alpha, 16)) / 255;

      return color;
    } else {
      return undefined;
    }
  }

  drawFreehand() {
    const {maps} = this.props;
    const map = _.find(maps, {geoId: this.state.selectedMapId});
    let strokeStyle;
    try {

      strokeStyle = this.createStyle(this.state.strokeColor, this.state.strokeWidth);
      map.drawFreehand({
        strokeStyle: strokeStyle,
        onFreehandDraw: (args) => {
          toastr.success(JSON.stringify(args));
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Map.drawFreehand: Critical');
    }
  }

  render() {
    const {maps} = this.props;

    return (
      <div>
        <span className='mdl-layout-title'>Get All Overlays</span>

        <div className='mdl-cell mdl-cell--12-col'>
          <MapSelect maps={maps}
                     selectedMapId={this.state.selectedMapId}
                     callback={this.updateSelectedMap}
                     label='Get overlays for '/>

        </div>

        <div className='mdl-cell mdl-cell--12-col'>
          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.drawFreehand}
            disabled={maps.length === 0}>
            Draw Freehand
          </button>


          <span className='mdl-layout-title'>Stroke Style</span>

          <VText id='drawFreehand-strokeColor' classes={['mdl-cell', 'mdl-cell--12-col']} label='Stroke Color'
            value={this.state.strokeColor} callback={this.updateFreehand}/>
          <VText id='drawFreehand-strokeWidth' classes={['mdl-cell', 'mdl-cell--12-col']} label='Stroke Width'
            value={this.state.strokeWidth} callback={this.updateFreehand}/>
        </div>
        <div className='mdl-cell mdl-cell--12-col'>
          <RelatedTests relatedTests={[
            {text: 'Exit Freehand Draw', target: 'mapDrawFreehandExitTest'}
          ]}/>
        </div>
      </div>
    );
  }
}

MapDrawFreehandTest.propTypes = {
  maps: PropTypes.array.isRequired
};

export default MapDrawFreehandTest;
