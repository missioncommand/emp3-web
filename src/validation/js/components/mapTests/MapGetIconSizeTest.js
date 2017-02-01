import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {MapSelect} from '../shared';

class MapGetIconSizeTest extends Component {
  constructor(props) {
    super(props);

    var selectedMapId = '';

    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId
    };

    this.getIconSize = this.getIconSize.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  getIconSize() {
    const map = _.find(this.props.maps, {geoId: this.state.selectedMapId});
    try {
      toastr.success("Icon Size is " + map.getIconSize());
    } catch (err) {
      toastr.error(err.message, 'Map.getIconSize: Critical');
    }
  }

  render() {
    return (
      <div>
        <span className='mdl-layout-title'>Get Icon Size</span>
        <div className='mdl-grid mdl-grid--no-spacing'>

          <div className='mdl-cell mdl-cell--12-col mdl-grid'>
            <div className='mdl-cell mdl-cell--12-col'>
              <MapSelect selectedMapId={this.state.selectedMapId} label='Select Map ' maps={this.props.maps}
                         callback={event => this.setState({selectedMapId: event.target.value})}/>
            </div>

            <button
              className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
              onClick={this.getIconSize} disabled={this.state.selectedMapId === ''}>
              Get
            </button>

            <div className='mdl-grid mdl-grid--12-col'>
              <RelatedTests relatedTests={[
                {text: 'Map.setIconSize', target: 'mapSetIconSizeTest'}
              ]}/>
            </div>

          </div>
        </div>
      </div>
    );
  }
}

MapGetIconSizeTest.propTypes = {
  maps: PropTypes.array.isRequired
};

export default MapGetIconSizeTest;
