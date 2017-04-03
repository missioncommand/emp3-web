import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';

class MapRemoveMapServiceTest extends Component {
  constructor(props) {
    super(props);

    let selectedMapId = '';
    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId,
      mapServices: []
    };

    this.getMapServices = this.getMapServices.bind(this);
    this.removeService = this.removeService.bind(this);
    this.updateSelectedMap = this.updateSelectedMap.bind(this);
  }

  componentDidMount() {
    if (this.state.selectedMapId !== '') {
      this.getMapServices();
    }
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId}, () => {
        setTimeout(this.getMapServices(), 2000); // This should account for the map loading initially
      });
    }
  }

  updateSelectedMap(event) {
    this.setState({selectedMapId: event.target.value}, () => {
      this.getMapServices();
    });
  }

  removeService(serviceId) {
    const map = _.find(this.props.maps, {geoId: this.state.selectedMapId});
    const service = _.find(this.state.mapServices, {geoId: serviceId});
    try {
      map.removeMapService({
        mapService: service,
        onSuccess: () => {
          toastr.success('Successfully Removed Map Service');
          this.getMapServices();
        },
        onError: err => {
          toastr.error('Failed To Remove Map Service');
          this.props.addError(err, 'Map.removeMapService');
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Map.removeMapService: Critical');
      this.props.addError(err.message, 'Map.removeMapService: Critical');
    }

  }

  getMapServices() {
    const map = _.find(this.props.maps, {geoId: this.state.selectedMapId});

    try {
      map.getMapServices({
        onSuccess: args => {
          this.setState({mapServices: args.services});
        },
        onError: err => {
          toastr.error('Failed Retrieving Services');
          this.props.addError(err, 'Map.getMapServices');
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Map.getMapServices: Critical');
    }
  }

  render() {

    return (
      <div>
        <h3>Remove Map Service</h3>

        <label htmlFor='mapSelect'>Remove Services From </label>
        <select id='mapSelect' value={this.state.selectedMapId} onChange={this.updateSelectedMap}>
          {this.props.maps.map(map => {
            return <option key={map.geoId} value={map.geoId}>{map.container}</option>;
          })}
        </select>

        <h5>Map Services</h5>
        <ul className='mdl-list' style={{maxHeight: '500px', overflowY: 'auto'}}>
          {this.state.mapServices.map(service => {
            return (
              <li key={service.geoId} className='mdl-list__item mdl-list__item--two-line'>
              <span className='mdl-list__item-primary-content'>
                  {service.name}
                <span className='mdl-list__item-sub-title'>{service.url}</span>
              </span>
                <span className='mdl-list__item-secondary-action'>
                <button className='mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab'
                        onClick={() => this.removeService(service.geoId)}>
                  <i className='fa fa-times'/>
                </button>
              </span>
              </li>);
          })}
          {this.state.mapServices.length === 0 ? <li className='mdl-list__item'>
            <span className='mdl-list__item-primary-content'>No Services Exist On This Map</span>
          </li> : null}
        </ul>

        <RelatedTests relatedTests={[
          {text: 'Add a Map Service', target: 'mapAddMapServiceTest'},
          {text: 'Create a KML link', target: 'createKMLLayerTest'},
          {text: 'Create a WMS Service', target: 'createWMSTest'},
          {text: 'Create a WMTS Service', target: 'createWMTSTest'}
        ]}/>
      </div>
    );
  }
}

MapRemoveMapServiceTest.propTypes = {
  maps: PropTypes.array,
  mapServices: PropTypes.array,
  removeMapServices: PropTypes.func,
  addResult: PropTypes.func,
  addError: PropTypes.func
};

export default MapRemoveMapServiceTest;
