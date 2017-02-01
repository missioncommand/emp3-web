import React, {Component, PropTypes} from 'react';
import assign from 'object-assign';
import RelatedTests from '../../containers/RelatedTests';
import {VText, VCheckBox} from '../shared';

class CreateOverlayTest extends Component {
  constructor(props) {
    super(props);

    let selectedMapId = '';
    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    let selectedOverlayId = '';
    if (props.overlays.length > 0) {
      selectedOverlayId = _.first(props.overlays).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId,
      selectedOverlayId: selectedOverlayId,
      overlay: {
        geoId: '',
        name: '',
        description: '',
        iconUrl: '',
        readOnly: false,
        clusterDistance: '',
        clusterThreshold: '',
        clusterStyle: ''
      }
    };

    this.updateOverlay = this.updateOverlay.bind(this);
    this.createOverlay = this.createOverlay.bind(this);
    this.createOverlayAddToMap = this.createOverlayAddToMap.bind(this);
    this.updateSelectedMapId = this.updateSelectedMapId.bind(this);
    this.updateSelectedOverlayId = this.updateSelectedOverlayId.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }

    if (props.overlays.length > 0 && this.state.selectedOverlayId === '') {
      this.setState({selectedOverlayId: _.first(props.overlays).geoId});
    }
  }

  updateSelectedMapId(event) {
    this.setState({selectedMapId: event.target.value});
  }

  updateSelectedOverlayId(event) {
    this.setState({selectedOverlayId: event.target.value});
  }

  updateOverlay(event) {
    let newOverlay = assign({}, this.state.overlay);
    let prop = event.target.id.split('-')[1];

    if (prop === 'readOnly') {
      newOverlay[prop] = event.target.checked;
    } else {
      newOverlay[prop] = event.target.value;
    }
    this.setState({overlay: newOverlay});
  }

  createOverlay() {
    const {addOverlay, addResult, addError} = this.props;
    const args = {
      name: this.state.overlay.name.trim() === '' ? undefined : this.state.overlay.name,
      geoId: this.state.overlay.geoId.trim() === '' ? undefined : this.state.overlay.geoId,
      iconUrl: this.state.overlay.iconUrl.trim() === '' ? undefined : this.state.overlay.iconUrl,
      properties: this.state.overlay.properties
    };

    let overlay;
    try {
      overlay = new emp3.api.Overlay(args);
      addOverlay(overlay);
      addResult(args, 'createOverlay');
      toastr.success('Overlay [' + overlay.name + '] Created Successfully');
    } catch (err) {
      addError(err, 'createOverlay');
      toastr.error('Create Overlay');
    }
    return overlay;
  }

  createOverlayAddToMap() {
    const {maps} = this.props;
    if (maps.length === 0) {
      return;
    }
    const overlay = this.createOverlay();
    const selectedMap = _.find(this.props.maps, {geoId: this.state.selectedMapId});
    if (!selectedMap) {
      toastr.error('Could not find specified map', 'Create Overlay Add To Map');
    } else {
      try {
        selectedMap.addOverlay({
          overlay: overlay,
          onSuccess: args => {
            this.props.addResult(args, 'createOverlayAddToMap');
            toastr.success('Added Overlay To Map');
          },
          onError: err => {
            this.addError(err, 'map.addOverlay');
            toastr.error('Failed to Add Overlay To Map');
          }
        });
      } catch (err) {
        this.addError(err.message, 'createOverlayAddToMap:Critical');
        toastr.error(err.message, 'Create Overlay Add To Map:Critcal');
      }
    }
  }

  render() {
    const {maps} = this.props;
    return (
      <div>
        <span className='mdl-layout-title'>Create An Overlay</span>

        <div className='mdl-grid'>
          <VText id='createOverlay-name'
                 classes={['mdl-cell', 'mdl-cell--12-col']}
                 label='Name'
                 value={this.state.overlay.name}
                 callback={this.updateOverlay}/>

          <VText id='createOverlay-geoId'
                 classes={['mdl-cell', 'mdl-cell--12-col']}
                 label='GeoId'
                 value={this.state.overlay.geoId}
                 callback={this.updateOverlay}/>

          <div id='createOverlay-properties' className='mdl-cell mdl-cell--12-col mdl-grid mdl-grid--no-spacing'>
            <span className='mdl-layout-title'>Properties</span>
            <div className='mdl-cell mdl-cell--12-col'>
              <VText id='createOverlay-description'
                     classes={['mdl-cell', 'mdl-cell--12-col']}
                     rows={3}
                     value={this.state.overlay.description}
                     label='Description'
                     callback={this.updateOverlay}/>

              <VText id='createOverlay-iconUrl'
                     classes={['mdl-cell', 'mdl-cell--12-col']}
                     label='Icon URL'
                     value={this.state.overlay.iconUrl}
                     callback={this.updateOverlay}/>

              <VCheckBox id='createOverlay-readOnly'
                         classes={['mdl-cell', 'mdl-cell--12-col']}
                         label='Read Only'
                         checked={this.state.overlay.readOnly}
                         callback={this.updateOverlay}/>
            </div>
          </div>

          <button
            className='mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect mdl-cell mdl-cell--12-col'
            onClick={this.createOverlay}>
            Create Overlay
          </button>


          <div className='mdl-cell mdl-cell--12-col'>
            <label htmlFor='mapSelect'>Add To </label>
            <select id='mapSelect' value={this.state.selectedMapId} onChange={this.updateSelectedMapId}>
              {maps.map(map => {
                return <option key={map.geoId} value={map.geoId}>{map.container}</option>;
              })}
            </select>
          </div>

          <button
            className='mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect mdl-cell mdl-cell--12-col'
            disabled={maps.length === 0}
            onClick={this.createOverlayAddToMap}>
            Add Overlay To Map
          </button>

          <RelatedTests className='mdl-cell mdl-cell-12-col' relatedTests={[
            {text: 'Create a feature to add to this overlay', target: 'createFeatureTest'},
            {text: 'Create a MIL-STD symbol to add to this overlay', target: 'createSymbolTest'},
            {text: 'Add existing features to this overlay'},
            {text: 'Add an overlay to this overlay', target: 'overlayAddOverlaysTest'},
            {text: 'Draw a point', target: 'createPointTest'},
            {text: 'Draw a line', target: 'createLineTest'},
            {text: 'Draw a rectangle', target: 'createRectangleTest'},
            {text: 'Draw a polygon', target: 'createPolygonTest'},
            {text: 'Draw a symbol', target: 'createSymbolTest'}]}/>
        </div>
      </div>
    );
  }
}

CreateOverlayTest.propTypes = {
  maps: PropTypes.array.isRequired,
  overlays: PropTypes.array.isRequired,
  addOverlay: PropTypes.func.isRequired,
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired
};

export default CreateOverlayTest;
