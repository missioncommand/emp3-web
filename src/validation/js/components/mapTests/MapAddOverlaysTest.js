import React, {Component, PropTypes} from 'react';
import {MapSelect} from '../shared';
import RelatedTests from '../../containers/RelatedTests';

class MapAddOverlaysTest extends Component {
  constructor(props) {
    super(props);

    let selectedMapId = '';
    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId,
      selectedOverlays: []
    };

    this.addOverlays = this.addOverlays.bind(this);
    this.toggleOverlay = this.toggleOverlay.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  toggleOverlay(event) {
    let overlayId = event.target.value;
    let selectedOverlays = [...this.state.selectedOverlays];
    if (_.includes(selectedOverlays, overlayId)) {
      _.pull(selectedOverlays, overlayId);
    } else {
      selectedOverlays.push(overlayId);
    }

    setTimeout(this.setState({selectedOverlays: selectedOverlays}), 25);
  }

  addOverlays() {
    const {maps, overlays} = this.props;
    const map = _.find(maps, {geoId: this.state.selectedMapId});
    const selectedOverlays = _.filter(overlays, overlay => {
      return _.includes(this.state.selectedOverlays, overlay.geoId);
    });

    try {
      map.addOverlays({
        overlays: selectedOverlays,
        onSuccess: (cbArgs) => {
          toastr.success('Added Overlays To The Map: ' + JSON.stringify(cbArgs));
        },
        onError: () => {
          toastr.error('Failed to Add Overlays');
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Map.addOverlays: Critical');
    }
  }

  render() {
    const {maps, overlays} = this.props;
    return (
      <div>
        <span className='mdl-layout-title'>Add Overlay to Map </span>
        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--12-col'>
            <MapSelect maps={maps}
                       selectedMapId={this.state.selectedMapId}
                       label='Add to '
                       callback={event => this.setState({selectedMapId: event.target.value})}/>
          </div>

          <div className='mdl-cell mdl-cell--12-col'>
            <label htmlFor='availableOverlays'>Overlays</label>
            <ul id='availableOverlays' style={{listStyle: 'none', maxHeight: '400px', overflowY: 'auto'}}>
              {overlays.length === 0 ? <li>No Overlays Available</li> : null}
              {overlays.map((overlay, i) => {
                if (i > 50) {
                  return; // TODO paginate the results
                }
                let checked = _.includes(this.state.selectedOverlays, overlay.geoId);
                return (
                  <li key={overlay.geoId}>
                    <label className='mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect' htmlFor={overlay.geoId}>
                      <input type='checkbox'
                             id={overlay.geoId}
                             className='mdl-checkbox__input'
                             value={overlay.geoId}
                             onClick={this.toggleOverlay}
                             checked={checked}
                             title={overlay.name + ':' + overlay.geoId}/>
                      <span className='mdl-checkbox__label'>
                        {overlay.geoId.substr(0, 16) + '...'}
                      </span>
                    </label>
                  </li>);
              })}
            </ul>
          </div>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            disabled={this.state.selectedMapId === ''}
            onClick={this.addOverlays}>
            Add To Map
          </button>

          <div className='mdl-cell mdl-cell--12-col'>
            <RelatedTests relatedTests={[
              {text: 'Create Additional Overlays', target: 'createOverlayTest'},
              {text: 'Remove Overlays From The Map', target: 'removeOverlaysTest'},
              {text: 'Add Overlays to Overlays', target: 'overlayAddOverlaysTest'}
            ]}/>
          </div>
        </div>
      </div>
    );
  }
}

MapAddOverlaysTest.propTypes = {
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired,
  maps: PropTypes.array.isRequired,
  overlays: PropTypes.array.isRequired
};

export default MapAddOverlaysTest;
