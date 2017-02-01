import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';

class MapZoomToTest extends Component {
  constructor(props) {
    super(props);

    let selectedMapId = '';
    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }
    let selectedFeatureId = '';
    let selectedOverlayId = '';
    let selectedFeatureIds = [];

    this.state = {
      selectedMapId: selectedMapId,
      selectedOverlayId: selectedOverlayId,
      selectedFeatureId: selectedFeatureId,
      selectedFeatureIds: selectedFeatureIds
    };

    this.updateSelectedMap = this.updateSelectedMap.bind(this);
    this.updateSelectedFeature = this.updateSelectedFeature.bind(this);
    this.updateSelectedFeatures = this.updateSelectedFeatures.bind(this);
    this.updateSelectedOverlay = this.updateSelectedOverlay.bind(this);
    this.zoom = this.zoom.bind(this);
  }

  updateSelectedMap(event) {
    this.setState({
      selectedMapId: event.target.value
    });
  }

  updateSelectedFeature(event) {
    this.setState({
      selectedFeatureId: event.target.value
    });
  }

  updateSelectedFeatures(event) {
    var values = [];

    for (var i = 0, len = event.target.length; i < len; i++) {
      if (event.target[i].selected) {
        values.push(event.target[i].value);
      }
    }

    this.setState({
      selectedFeatureIds: values
    });
  }

  updateSelectedOverlay(event) {
    this.setState({
      selectedOverlayId: event.target.value
    });
  }

  zoom() {

    var map,
      feature,
      features,
      overlay,
      i,
      j;

    map = _.find(this.props.maps, {geoId: this.state.selectedMapId});
    feature = _.find(this.props.features, {geoId: this.state.selectedFeatureId});
    overlay = _.find(this.props.overlays, {geoId: this.state.selectedOverlayId});

    if (this.state.selectedFeatureIds.length > 0) {
      features = [];
      for (i = 0, j = this.state.selectedFeatureIds.length; i < j; i++) {
        var tempFeature = _.find(this.props.features, {geoId: this.state.selectedFeatureIds[i]});
        if (tempFeature) {
          features.push(tempFeature);
        }
      }
    }

    if (map) {
      map.zoomTo({
        featureList: features,
        feature: feature,
        overlay: overlay
      });
    } else {
      toastr.error('Cound not find selected map', 'Cound not find selected map');
    }
  }

  render() {
    return (
      <div>
        <h3>Zoom to Something on Map</h3>

        <label htmlFor='mapZoomTo-map'> Choose which map you want to zoom</label>
        <select className='blocky' id='mapZoomTo-map' value={this.state.selectedMapId} onChange={this.updateSelectedMap}>
          {this.props.maps.map(map => {
            return <option key={map.geoId} value={map.geoId}>{map.container}</option>;
          })}
        </select>

        <label htmlFor='mapZoomTo-feature'>Chose a feature from this list</label>
        <select className='blocky' id='mapZoomTo-feature' value={this.state.selectedFeatureId} onChange={this.updateSelectedFeature}>
          <option value=''>None</option>
          {this.props.features.map(feature => {
            return <option key={feature.geoId} value={feature.geoId}>{feature.name}</option>;
          })}
        </select>

        <label htmlFor='mapZoomTo-features'>Or chose one or more features to zoom to</label>
        <select className='blocky' id='mapZoomTo-features' value={this.state.selectedFeatureIds} onChange={this.updateSelectedFeatures} multiple>
          {this.props.features.map(feature => {
            return <option key={feature.geoId} value={feature.geoId}>{feature.name}</option>;
          })}
        </select>

        <label htmlFor='mapZoomTo-overlay'>Or chose an overlay from this list to zoom to</label>
        <select className='blocky' id='mapZoomTo-overlay' value={this.state.selectedOverlayId} onChange={this.updateSelectedOverlay}>
          <option value=''>None</option>
          {this.props.overlays.map(overlay => {
            return <option key={overlay.geoId} value={overlay.geoId}>{overlay.name}</option>;
          })}
        </select>

        <button className='blocky mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
                onClick={this.zoom}>
          Zoom
        </button>

        <RelatedTests/>
      </div>
    );
  }
}

MapZoomToTest.propTypes = {
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired,
  maps: PropTypes.array.isRequired,
  features: PropTypes.array.isRequired,
  overlays: PropTypes.array.isRequired
};

export default MapZoomToTest;
