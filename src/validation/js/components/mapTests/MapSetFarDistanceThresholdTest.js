import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {MapSelect, VText} from '../shared';

class MapSetFarDistanceThresholdTest extends Component {
  constructor(props) {
    super(props);

    var selectedMapId = '';

    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId,
      threshold: 600000,
      animate: false
    };

    this.setThreshold = this.setThreshold.bind(this);
    this.update = this.update.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  update(event) {
    this.setState({threshold: event.target.value});
  }

  setThreshold() {
    const map = _.find(this.props.maps, {geoId: this.state.selectedMapId});
    try {

      var threshold;
      if (isNaN(parseInt(this.state.threshold))) {
        threshold = this.state.threshold;
      } else {
        threshold = parseInt(this.state.threshold);
      }
      map.setFarDistanceThreshold(threshold);
      toastr.success("Changed Far-distance Threshold to " + threshold + "m");

    } catch(err) {
      toastr.error(err.message, 'Map.setFarDistanceThreshold: Critical');
    }
  }

  render() {
    return (
      <div className='mdl-grid'>
        <span className='mdl-layout-title'>Set Far-Distance Threshold</span>
        <div className='mdl-cell mdl-cell--12-col'>
          <MapSelect selectedMapId={this.state.selectedMapId} label='Select Map ' maps={this.props.maps}
                     callback={event => this.setState({selectedMapId: event.target.value})}/>

          <VText id='mapFarDistanceThreshold-threshold' value={this.state.threshold} label='Threshold' callback={this.update}/>

          <button className='mdl-button mdl-js-button mdl-js--ripple-effect mdl-button--raised mdl-button--colored'
                  onClick={this.setThreshold} disabled={this.state.selectedMapId === ''}>
            Set
          </button>

          <RelatedTests relatedTests={[
            {text: 'Map.getFarDistanceThreshold', target: 'mapGetFarDistanceThresholdTest'},
            {text: 'Map.setMidDistanceThreshold', target: 'mapSetMidDistanceThresholdTest'},
            {text: 'Map.getMidDistanceThreshold', target: 'mapGetMidDistanceThresholdTest'}
          ]}/>
        </div>
      </div>
    );
  }
}

MapSetFarDistanceThresholdTest.propTypes = {
  maps: PropTypes.array.isRequired
};

export default MapSetFarDistanceThresholdTest;
