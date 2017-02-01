import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {MapSelect} from '../shared';

class MapGetFarDistanceThresholdTest extends Component {
  constructor(props) {
    super(props);

    var selectedMapId = '';

    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId
    };

    this.getFarDistanceThreshold = this.getFarDistanceThreshold.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  getFarDistanceThreshold() {
    const map = _.find(this.props.maps, {geoId: this.state.selectedMapId});
    try {
      toastr.success("Far Distance Threshold is " + map.getFarDistanceThreshold() + "m");
    } catch(err) {
      toastr.error(err.message, 'Map.getFarDistanceThreshold: Critical');
    }
  }

  render() {
    return (
      <div className='mdl-grid'>
        <span className='mdl-layout-title'>Get Far-Distance Threshold</span>
        <div className='mdl-cell mdl-cell--12-col'>
          <MapSelect selectedMapId={this.state.selectedMapId} label='Select Map ' maps={this.props.maps}
                     callback={event => this.setState({selectedMapId: event.target.value})}/>

          <button className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
                  onClick={this.getFarDistanceThreshold} disabled={this.state.selectedMapId === ''}>
            Get
          </button>

          <RelatedTests relatedTests={[
            {text: 'Map.setFarDistanceThreshold', target: 'mapSetFarDistanceThresholdTest'},
            {text: 'Map.getMidDistanceThreshold', target: 'mapGetMidDistanceThresholdTest'},
            {text: 'Map.setMidDistanceThreshold', target: 'mapSetMidDistanceThresholdTest'}
          ]}/>
        </div>
      </div>
    );
  }
}

MapGetFarDistanceThresholdTest.propTypes = {
  maps: PropTypes.array.isRequired
};

export default MapGetFarDistanceThresholdTest;
