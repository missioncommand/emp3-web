import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {MapSelect, MapServiceSelect} from '../shared';

class MapAddMapServiceTest extends Component {
  constructor(props) {
    super(props);

    let selectedMapId = '';
    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    let selectedMapServiceId = '';
    if (props.mapServices.length > 0) {
      selectedMapServiceId = _.first(props.mapServices).geoId;
    }
    this.state = {
      selectedMapId: selectedMapId,
      selectedMapServiceId: selectedMapServiceId
    };

    this.mapAddService = this.mapAddService.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }

    if (props.mapServices.length > 0 && this.state.selectedMapServiceId === '') {
      this.setState({selectedMapServiceId: _.first(props.mapServices).geoId});
    }
  }

  mapAddService() {
    const map = _.find(this.props.maps, {geoId: this.state.selectedMapId});
    const mapService = _.find(this.props.mapServices, {geoId: this.state.selectedMapServiceId});

    try {
      map.addMapService({
        mapService: mapService,
        onSuccess:(args) => {
          toastr.success('Added Service Successfully: \n ' + JSON.stringify(args));
        },
        onError: err => {
          toastr.error('Failed To Add Service: \n' + JSON.stringify(err));
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Map Add Service: Critical');
    }
  }

  render() {

    const {maps, mapServices} = this.props;

    return (
      <div>
        <h3>Add A MapService to A Map</h3>

        <div className='mdl-cell mdl-cell--12-col'>
          <MapSelect maps={maps}
                     selectedMapId={this.state.selectedMapId}
                     label='Add map service to: '
                     callback={event => this.setState({selectedMapId: event.target.value})}/>
        </div>

        <div className='mdl-cell mdl-cell--12-col'>
          <MapServiceSelect mapServices={mapServices}
                 selectedMapServiceId={this.state.selectedMapServiceId}
                 label='Select a map service: '
                 callback={event => this.setState({selectedMapServiceId: event.target.value})}/>
        </div>

        <button className='blocky mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
                onClick={this.mapAddService} disabled={this.props.maps.length === 0}>
          Add Map Service
        </button>

        <RelatedTests relatedTests={[
          {text: 'Create an overlay', target: 'createOverlayTest'},
          {text: 'Remove a Map Service', target: 'mapRemoveMapServiceTest'}
        ]}/>
      </div>
    );
  }
}

MapAddMapServiceTest.propTypes = {
  maps: PropTypes.array.isRequired,
  mapServices: PropTypes.array.isRequired
};

export default MapAddMapServiceTest;
