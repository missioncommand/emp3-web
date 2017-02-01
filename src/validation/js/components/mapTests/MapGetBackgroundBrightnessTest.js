import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {MapSelect} from '../shared';

class MapGetBackgroundBrightnessTest extends Component {
  constructor(props) {
    super(props);

    var selectedMapId = '';

    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId
    };

    this.getBackgroundBrightness = this.getBackgroundBrightness.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  getBackgroundBrightness() {
    const map = _.find(this.props.maps, {geoId: this.state.selectedMapId});
    try {
      toastr.success("Brightness is " + map.getBackgroundBrightness());
    } catch (err) {
      toastr.error(err.message, 'Map.getBackgroundBrightness: Critical');
    }
  }

  render() {
    return (
      <div>
        <span className='mdl-layout-title'>Get Background Brightness</span>
        <div className='mdl-grid mdl-grid--no-spacing'>

          <div className='mdl-cell mdl-cell--12-col mdl-grid'>
            <div className='mdl-cell mdl-cell--12-col'>
              <MapSelect selectedMapId={this.state.selectedMapId} label='Select Map ' maps={this.props.maps}
                         callback={event => this.setState({selectedMapId: event.target.value})}/>
            </div>

            <button
              className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
              onClick={this.getBackgroundBrightness} disabled={this.state.selectedMapId === ''}>
              Get
            </button>

            <div className='mdl-grid mdl-grid--12-col'>
              <RelatedTests relatedTests={[
                {text: 'Map.setBackgroundBrightness', target: 'mapSetBackgroundBrightnessTest'}
              ]}/>
            </div>

          </div>
        </div>
      </div>
    );
  }
}

MapGetBackgroundBrightnessTest.propTypes = {
  maps: PropTypes.array.isRequired
};

export default MapGetBackgroundBrightnessTest;
