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
    let selectedFeatureIds = [''];

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

  componentWillReceiveProps(props) {
    if (props.maps.length && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  updateSelectedMap(event) {
    this.setState({
      selectedMapId: event.target.value
    });
  }

  updateSelectedFeature(event) {
    this.setState({
      selectedFeatureId: event.target.value,
      selectedFeatureIds: [""],
      selectedOverlayId: ""
    });
  }

  updateSelectedFeatures(event) {
    // Clear other selections visibly
    let selectedFeatureIds = [];
    for (let i = 1; i < event.target.options.length; i++) {
      if (event.target.options[i].selected) {
        selectedFeatureIds.push(event.target.options[i].value);
      }
    }

    this.setState({
      selectedFeatureId: '',
      selectedFeatureIds: selectedFeatureIds,
      selectedOverlayId: ''
    });
  }

  updateSelectedOverlay(event) {
    this.setState({
      selectedOverlayId: event.target.value,
      selectedFeatureIds: [""],
      selectedFeatureId: ""
    });
  }

  zoom() {
    const {maps, features, overlays} = this.props;

    let map,
      feature,
      selectedFeatures = [],
      overlay,
      i,
      j;

    map = _.find(maps, {geoId: this.state.selectedMapId});
    feature = _.find(features, {geoId: this.state.selectedFeatureId});
    overlay = _.find(overlays, {geoId: this.state.selectedOverlayId});

    if (this.state.selectedFeatureIds.length > 0) {
      for (i = 0, j = this.state.selectedFeatureIds.length; i < j; i++) {
        let tempFeature = _.find(features, {geoId: this.state.selectedFeatureIds[i]});
        if (tempFeature) {
          selectedFeatures.push(tempFeature);
        }
      }
    }
    if (!selectedFeatures.length) {
      selectedFeatures = undefined;
    }

    if (map) {
      map.zoomTo({
        featureList: selectedFeatures,
        feature: feature,
        overlay: overlay
      });
    } else {
      toastr.error('Could not find selected map', 'Could not find selected map');
    }
  }

  render() {
    const {maps, overlays, features} = this.props;

    return (
      <div className="mdl-grid">
        <span className="mdl-layout-title">Zoom to something on Map</span>

        <div className="mdl-cell mdl-cell--12-col">
          <label htmlFor='mapZoomTo-map'> Choose which map you want to zoom</label>
          <select id='mapZoomTo-map'
                  style={{width: "100%"}}
                  value={this.state.selectedMapId}
                  onChange={this.updateSelectedMap}>
            {maps.map(map => {
              return <option key={map.geoId} value={map.geoId}>{map.container}</option>;
            })}
          </select>
        </div>

        <div className="mdl-cell mdl-cell--12-col">
          <label htmlFor='mapZoomTo-feature'>Choose a feature from this list</label>
          <select style={{width: "100%"}}
                  id='mapZoomTo-feature'
                  value={this.state.selectedFeatureId}
                  onChange={this.updateSelectedFeature}>
            <option value=''>None</option>
            {features.map(feature => {
              return <option key={feature.geoId}
                             value={feature.geoId}>{feature.name ? feature.name : feature.geoId.substr(0, 12) + "..."}</option>;
            })}
          </select>
        </div>

        <div className="mdl-cell mdl-cell--12-col">
          <label htmlFor='mapZoomTo-features'>Or choose one or more features to zoom to</label>
          <select id='mapZoomTo-features'
                  style={{width: "100%"}}
                  value={this.state.selectedFeatureIds}
                  onChange={this.updateSelectedFeatures}
                  multiple>
            <option value=''>None</option>
            {features.map(feature => {
              return <option key={feature.geoId}
                             value={feature.geoId}>
                {feature.name ? feature.name : feature.geoId.substr(0, 12) + "..."}
              </option>;
            })}
          </select>
        </div>

        <div className="mdl-cell mdl-cell--12-col">
          <label htmlFor='mapZoomTo-overlay'>Or choose zoom to an overlay</label>
          <select id='mapZoomTo-overlay'
                  style={{width: "100%"}}
                  value={this.state.selectedOverlayId}
                  onChange={this.updateSelectedOverlay}>
            <option value=''>None</option>
            {overlays.map(overlay => {
              return <option key={overlay.geoId} value={overlay.geoId}>{overlay.name}</option>;
            })}
          </select>
        </div>

        <button
          className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
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
