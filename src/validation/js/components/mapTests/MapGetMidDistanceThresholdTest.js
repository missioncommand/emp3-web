import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {MapSelect} from '../shared';

class MapGetMidDistanceThresholdTest extends Component {
  constructor(props) {
    super(props);

    var selectedMapId = '';

    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId
    };

    this.getMidDistanceThreshold = this.getMidDistanceThreshold.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  getMidDistanceThreshold() {
    const map = _.find(this.props.maps, {geoId: this.state.selectedMapId});
    try {
      toastr.success("Mid Distance Threshold is " + map.getMidDistanceThreshold() + "m");
    } catch(err) {
      toastr.error(err.message, 'Map.getMidDistanceThreshold: Critical');
    }
  }

  render() {
    return (
      <div className='mdl-grid'>
        <span className='mdl-layout-title'>Get Mid-Distance Threshold</span>
        <div className='mdl-cell mdl-cell--12-col'>
          <MapSelect selectedMapId={this.state.selectedMapId} label='Select Map ' maps={this.props.maps}
                     callback={event => this.setState({selectedMapId: event.target.value})}/>

          <button className='mdl-button mdl-js-button mdl-js--ripple-effect mdl-button--raised mdl-button--colored'
                  onClick={this.getMidDistanceThreshold} disabled={this.state.selectedMapId === ''}>
            Get
          </button>

          <RelatedTests relatedTests={[
            {text: 'Map.setMidDistanceThreshold', target: 'mapSetMidDistanceThresholdTest'},
            {text: 'Map.getFarDistanceThreshold', target: 'mapGetFarDistanceThresholdTest'},
            {text: 'Map.setFarDistanceThreshold', target: 'mapSetFarDistanceThresholdTest'}
          ]}/>
        </div>
      </div>
    );
  }
}

MapGetMidDistanceThresholdTest.propTypes = {
  maps: PropTypes.array.isRequired
};

export default MapGetMidDistanceThresholdTest;
