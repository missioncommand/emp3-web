import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {MapSelect, VText} from '../shared';

class MapSetFreehandStyleTest extends Component {
  constructor(props) {
    super(props);

    var selectedMapId = '';

    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId,
      strokeWidth: '',
      strokeColor: ''
    };

    this.setFreehandStyle = this.setFreehandStyle.bind(this);
    this.update = this.update.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  update(event) {
    if (event.target.id === 'setFreehandStyle-strokeColor') {
      this.setState({strokeColor: event.target.value});
    } else if (event.target.id === 'setFreehandStyle-strokeWidth') {
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
    if(hex.length === 6){
      hex = "ff" + hex;
    }
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

  setFreehandStyle() {
    const map = _.find(this.props.maps, {geoId: this.state.selectedMapId});
    try {

      var style = this.createStyle(this.state.strokeColor, this.state.strokeWidth);
      map.setFreehandStyle({
        initialStyle: style
      });
      toastr.success("Changed Style " + JSON.stringify(style));

    } catch(err) {
      toastr.error(err.message, 'Map.setFreehandStyle: Critical');
    }
  }

  render() {
    return (
      <div className='mdl-grid'>
        <span className='mdl-layout-title'>Set Freehand Style</span>
        <div className='mdl-cell mdl-cell--12-col'>
          <MapSelect selectedMapId={this.state.selectedMapId} label='Select Map ' maps={this.props.maps}
                     callback={event => this.setState({selectedMapId: event.target.value})}/>
          <br/>
          <br/>
          <VText id='setFreehandStyle-strokeColor' classes={['mdl-cell', 'mdl-cell--12-col']} label='Stroke Color'
            value={this.state.strokeColor} callback={this.update}/>
          <VText id='setFreehandStyle-strokeWidth' classes={['mdl-cell', 'mdl-cell--12-col']} label='Stroke Width'
            value={this.state.strokeWidth} callback={this.update}/>

          <button className='mdl-button mdl-js-button mdl-js--ripple-effect mdl-button--raised mdl-button--colored'
                  onClick={this.setFreehandStyle} disabled={this.state.selectedMapId === ''}>
            Set
          </button>

          <RelatedTests relatedTests={[
            {text: 'Map.getIconSize', target: 'mapGetIconSizeTest'}
          ]}/>
        </div>
      </div>
    );
  }
}

MapSetFreehandStyleTest.propTypes = {
  maps: PropTypes.array.isRequired
};

export default MapSetFreehandStyleTest;
