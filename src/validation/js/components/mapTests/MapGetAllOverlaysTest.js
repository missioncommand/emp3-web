import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {MapSelect} from '../shared';

class MapGetAllOverlaysTest extends Component {
  constructor(props) {
    super(props);

    let selectedMapId = '';
    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId,
      overlays: []
    };

    this.getAllOverlays = this.getAllOverlays.bind(this);
    this.updateSelectedMap = this.updateSelectedMap.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  updateSelectedMap(event) {
    this.setState({selectedMapId: event.target.value}, () => {
      this.getAllOverlays();
    });
  }

  getAllOverlays() {
    const {maps, addError} = this.props;
    const map = _.find(maps, {geoId: this.state.selectedMapId});
    try {
      map.getAllOverlays({
        onSuccess: cbArgs => {
          this.setState({overlays: cbArgs.overlays});
          toastr.success('Retrieved Overlays For Map');
        },
        onError: err => {
          this.setState({overlays: []});
          toastr.error('Failed to Retrieve Overlays');
          addError(err, 'Map.getAllOverlays');
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Map.getAllOverlays: Critical');
      addError(err.message, 'Map.getAllOverlays: Critical');
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
                     callback={this.getAllOverlays}
                     label='Get overlays for '/>
        </div>

        <button
          className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
          onClick={this.getAllOverlays}
          disabled={maps.length === 0}>
          Get All Overlays
        </button>

        <ul className='mdl-cell mdl-cell--12-col mdl-list'>
          {this.state.overlays.length === 0 ? <li>No Overlays Exist For The Selected Map</li> : null}
          {this.state.overlays.map(overlay => {
            return (
              <li key={overlay.geoId} className='mdl-list__item mdl-list__item--two-line'>
                <span className='mdl-list__item-primary-content'>
                  <span>{overlay.name}</span>
                  <span className='mdl-list__item-sub-title'>{overlay.geoId}</span>
                </span>
              </li>);
          })}
        </ul>

        <div className='mdl-cell mdl-cell--12-col'>
          <RelatedTests relatedTests={[
            {text: 'Create An Overlay', target: 'createOverlayTest'},
            {text: 'Remove an Overlay', target: 'mapRemoveOverlaysTest'}
          ]}/>
        </div>
      </div>
    );
  }
}

MapGetAllOverlaysTest.propTypes = {
  maps: PropTypes.array.isRequired,
  addError: PropTypes.func.isRequired
};

export default MapGetAllOverlaysTest;
