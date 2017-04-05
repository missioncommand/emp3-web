import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';

class MapGetMapServicesTest extends Component {
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
        setTimeout(this.getMapServices(), 2000);
      });
    }
  }

  updateSelectedMap(event) {
    this.setState({selectedMapId: event.target.value}, () => {
      this.getMapServices();
    });
  }

  getMapServices() {
    const {maps, addError} = this.props,
      map = _.find(maps, {geoId: this.state.selectedMapId});

    try {
      map.getMapServices({
        onSuccess: args => {
          this.setState({mapServices: args.services});
          toastr.success('Map.getServices succeeded: \n ' +
            JSON.stringify(args));
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
        <span className="mdl-layout-title">Get Map Service</span>

        <div className="mdl-cell mdl-cell--12-col">
          <label htmlFor='mapSelect'>Get Services From </label>
          <select id='mapSelect' value={this.state.selectedMapId} onChange={this.updateSelectedMap}>
            {maps.map(map => {
              return <option key={map.geoId} value={map.geoId}>{map.container}</option>;
            })}
          </select>
        </div>

        <div className='mdl-cell mdl-cell--12-col mdl-list'>
          {this.state.mapServices.map(service => {
            return (
              <div key={service.geoId} className='mdl-list__item mdl-list__item--two-line'
                   title={service.url}>
                <span className='mdl-list__item-primary-content'>
                  <span>{service.name}</span>
                  <span className='mdl-list__item-sub-title'>{
                    service.url.substring(0, 24) + '...' + service.url.substr(-10)}
                  </span>
                </span>
              </div>);
          })}
          {this.state.mapServices.length === 0 ?
            <div className='mdl-list__item'>
              <span className='mdl-list__item-primary-content'>No Services Exist On This Map</span>
            </div> : null}
        </div>

        <button
          className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
          onClick={this.getMapServices}>
          Get Map Services
        </button>

        <RelatedTests relatedTests={[
          {text: 'Add a Map Service', target: 'mapAddMapServiceTest'},
          {text: 'Remove a Map Service', target: 'mapRemoveMapServiceTest'}
        ]}/>
      </div>
    );
  }
}

MapGetMapServicesTest.propTypes = {
  maps: PropTypes.array.isRequired,
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired
};

export default MapGetMapServicesTest;
