import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {MapSelect} from '../shared';

class MapClearSelectedTest extends Component {
  constructor(props) {
    super(props);

    let selectedMapId = '';
    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId
    };

    this.updateSelectedMapId = this.updateSelectedMapId.bind(this);
    this.clearSelected = this.clearSelected.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  updateSelectedMapId(event) {
    this.setState({selectedMapId: event.target.value});
  }

  clearSelected() {
    const map = _.find(this.props.maps, {geoId: this.state.selectedMapId});

    try {
      map.clearSelected();
    } catch (err) {
      toastr.error(err.message);
    }
  }

  render() {
    return (
      <div className='mdl-layout'>

        <h3>Clear selected items from map</h3>


        <MapSelect label='Map'
                   selectedMapId={this.state.selectedMapId}
                   callback={this.updateSelectedMapId}/>

        <button className='blocky mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
                onClick={this.clearSelected}>
          Clear Selected Features
        </button>

        <RelatedTests relatedTests={[
          {text: 'Select a feature', target: 'mapSelectFeaturesTest'}
        ]}/>

      </div>
    );
  }
}

MapClearSelectedTest.propTypes = {
  maps: PropTypes.array.isRequired
};

export default MapClearSelectedTest;
