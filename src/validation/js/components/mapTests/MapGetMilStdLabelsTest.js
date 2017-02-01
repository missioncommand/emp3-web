import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {MapSelect} from '../shared';

class MapGetMilStdLabelsTest extends Component {
  constructor(props) {
    super(props);

    var selectedMapId = '';

    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId
    };

    this.getMilStdLabels = this.getMilStdLabels.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  getMilStdLabels() {
    const map = _.find(this.props.maps, {geoId: this.state.selectedMapId});
    try {
      toastr.success("MIL-STD-2525 icon label settings are " + map.getMilStdLabels());
    } catch(err) {
      toastr.error(err.message, 'Map.getMilStdLabels: Critical');
    }
  }

  render() {
    return (
      <div className='mdl-grid'>
        <span className='mdl-layout-title'>Get MIL-STD-2525 Label Settings</span>
        <div className='mdl-cell mdl-cell--12-col'>
          <MapSelect selectedMapId={this.state.selectedMapId} label='Select Map ' maps={this.props.maps}
                     callback={event => this.setState({selectedMapId: event.target.value})}/>

          <button className='mdl-button mdl-js-button mdl-js--ripple-effect mdl-button--raised mdl-button--colored'
                  onClick={this.getMilStdLabels} disabled={this.state.selectedMapId === ''}>
            Get
          </button>

          <RelatedTests relatedTests={[
            {text: 'Map.setMilStdLabels', target: 'mapSetMilStdLabelsTest'}
          ]}/>
        </div>
      </div>
    );
  }
}

MapGetMilStdLabelsTest.propTypes = {
  maps: PropTypes.array.isRequired
};

export default MapGetMilStdLabelsTest;
