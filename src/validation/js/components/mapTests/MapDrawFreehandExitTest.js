import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {MapSelect} from '../shared';

class MapDrawFreehandExitTest extends Component {
  constructor(props) {
    super(props);

    let selectedMapId = '';
    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId
    };

    this.drawFreehandExit = this.drawFreehandExit.bind(this);
    this.updateSelectedMap = this.updateSelectedMap.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  updateSelectedMap(event) {
    this.setState({selectedMapId: event.target.value});
  }


  drawFreehandExit() {
    const {maps} = this.props;
    const map = _.find(maps, {geoId: this.state.selectedMapId});
    try {
      map.drawFreehandExit();
    } catch (err) {
      toastr.error(err.message, 'Map.drawFreehandExit: Critical');
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
                     label='Select Map'/>


          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.drawFreehandExit}
            disabled={maps.length === 0}>
            Exit Freehand
          </button>


          <RelatedTests relatedTests={[
            {text: 'Freehand Draw', target: 'mapDrawFreehandTest'}
          ]}/>

        </div>
      </div>
    );
  }
}

MapDrawFreehandExitTest.propTypes = {
  maps: PropTypes.array.isRequired
};

export default MapDrawFreehandExitTest;
