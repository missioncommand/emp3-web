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
    if (this.state.selectedMapId) {
      this.getMapServices();
    }
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && !this.state.selectedMapId) {
      this.setState({selectedMapId: _.first(props.maps).geoId}, () => {
        setTimeout(this.getMapServices, 2000); // This should account for the map loading initially
      });
    }
  }

  updateSelectedMap(event) {
    this.setState({selectedMapId: event.target.value}, () => {
      this.getMapServices();
    });
  }

  removeService(serviceId) {
    const {maps, addError} = this.props,
      map = _.find(maps, {geoId: this.state.selectedMapId}),
      service = _.find(this.state.mapServices, {geoId: serviceId});

    try {
      map.removeMapService({
        mapService: service,
        onSuccess: () => {
          toastr.success('Successfully Removed Map Service');
          this.getMapServices();
        },
        onError: err => {
          toastr.error('Failed To Remove Map Service');
          addError(err, 'Map.removeMapService');
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Map.removeMapService: Critical');
      addError(err.message, 'Map.removeMapService: Critical');
    }

  }

  getMapServices() {
    const {maps, addError} = this.props,
      map = _.find(maps, {geoId: this.state.selectedMapId});

    try {
      map.getMapServices({
        onSuccess: args => {
          this.setState({mapServices: args.services});
        },
        onError: err => {
          toastr.error('Failed Retrieving Services');
          addError(err, 'Map.getMapServices');
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Map.getMapServices: Critical');
    }
  }

  render() {
    const {maps} = this.props;

    return (
      <div className="mdl-grid">
        <span className="mdl-layout-title">Remove Map Service</span>

        <div className="mdl-cell mdl-cell--12-col">
          <label htmlFor='mapSelect'>Remove Services From </label>
          <select id='mapSelect' value={this.state.selectedMapId} onChange={this.updateSelectedMap}>
            {maps.map(map => {
              return <option key={map.geoId} value={map.geoId}>{map.container}</option>;
            })}
          </select>
        </div>

        <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-cell mdl-cell--12-col"
                disabled={!this.state.selectedMapId}
                onClick={this.getMapServices}>
          <i className="fa fa-refresh"/> Refresh
        </button>

        <div className='mdl-cell mdl-cell--12-col mdl-list'>
          {this.state.mapServices.map(service => {
            return (
              <div key={service.geoId} className='mdl-list__item mdl-list__item--two-line'
                   title={service.url}>
                <span className='mdl-list__item-primary-content'>
                  <span>{service.name}</span>
                  <span className="mdl-list__item-sub-title">
                    {service.url.substring(0, 24) + '...' + service.url.substr(-10)}
                  </span>
                </span>
                <a href="#"
                   onClick={() => this.removeService(service.geoId)}
                   className='mdl-list__item-secondary-action'>
                  <i className='fa fa-times'/>
                </a>
              </div>
            );
          })}
          {this.state.mapServices.length === 0 ?
            <div className='mdl-list__item'>
              <span className='mdl-list__item-primary-content'>No Services Exist On This Map</span>
            </div> : null}
        </div>

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
