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

  getMapServices() {
    const map = _.find(this.props.maps, {geoId: this.state.selectedMapId});

    try {
      map.getMapServices({
        onSuccess: args => {
          this.setState({mapServices: args.services});
          toastr.success('Map.getServices succeeded: \n ' +
            JSON.stringify(args));
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
        <h3>Get Map Service</h3>

        <label htmlFor='mapSelect'>Get Services From </label>
        <select id='mapSelect' value={this.state.selectedMapId} onChange={this.updateSelectedMap}>
          {this.props.maps.map(map => {
            return <option key={map.geoId} value={map.geoId}>{map.container}</option>;
          })}
        </select>

        <h5>Map Services</h5>
        <ul className='mdl-list' style={{maxHeight: '500px', overflowY:'auto'}}>
          {this.state.mapServices.map(service => {
            return (
            <li key={service.geoId} className='mdl-list__item mdl-list__item--two-line'>
              <span className='mdl-list__item-primary-content'>
                  {service.name}
                  <span className='mdl-list__item-sub-title'>{service.url}</span>
              </span>
            </li>);
          })}
          {this.state.mapServices.length === 0 ? <li className='mdl-list__item'>
            <span className='mdl-list__item-primary-content'>No Services Exist On This Map</span>
          </li> : null}
        </ul>

        <button className='blocky mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
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
