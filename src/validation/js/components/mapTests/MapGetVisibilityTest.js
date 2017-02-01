import React, {Component, PropTypes} from 'react';
import {MapSelect, OverlaySelect, FeatureSelect} from '../shared';

class MapGetVisibilityTest extends Component {
  constructor(props) {
    super(props);

    let selectedMapId = '';
    let selectedOverlayId = '';
    let selectedFeatureId = '';


    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    if (props.overlays.length > 0) {
      selectedOverlayId = _.first(props.overlays).geoId;
    }

    if (props.features.length > 0) {
      selectedFeatureId = _.first(props.features).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId,
      selectedOverlayId: selectedOverlayId,
      selectedFeatureId: selectedFeatureId,
      selectedParentOverlayId: '',
      selectedParentFeatureId: ''
    };

    this.updateSelectedOverlay = this.updateSelectedOverlay.bind(this);
    this.updateSelectedMap = this.updateSelectedMap.bind(this);
    this.updateSelectedFeature = this.updateSelectedFeature.bind(this);
    this.getFeatureVisibility = this.getFeatureVisibility.bind(this);
    this.getOverlayVisibility = this.getOverlayVisibility.bind(this);
    this.updateSelectedParentOverlay = this.updateSelectedParentOverlay.bind(this);
    this.updateSelectedParentFeature = this.updateSelectedParentFeature.bind(this);
  }

  updateSelectedOverlay(event) {
    this.setState({
      selectedOverlayId: event.target.value
    });
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

  updateSelectedParentOverlay(event) {
    this.setState({
      selectedParentOverlayId: event.target.value
    });
  }

  updateSelectedParentFeature(event) {
    this.setState({
      selectedParentFeatureId: event.target.value
    });
  }


  getOverlayVisibility() {
    let map = _.find(this.props.maps, {geoId: this.state.selectedMapId});
    let overlay = _.find(this.props.overlays, {geoId: this.state.selectedOverlayId});
    let parentOverlay = _.find(this.props.overlays, {geoId: this.state.selectedParentOverlayId});
    let parentFeature = _.find(this.props.features, {geoId: this.state.selectedParentFeatureId});
    let parent;

    if (map) {

      if (overlay) {

        if (parentOverlay) {
          parent = parentOverlay;
        } else if (parentFeature) {
          parent = parentFeature;
        }

        map.getVisibility({
          target: overlay,
          parent: parent,
          onSuccess: (args) => {
            toastr.success('Map.getVisibility succeeded: \n ' +
              JSON.stringify({
                visible: args.visible,
                target: args.target,
                parent: args.parent
              }));
          },
          onError: (args) => {
            toastr.error('Map getVisibility failed: \n' + JSON.stringify(args));
          }
        });
      } else {
        toastr.error('Could not find overlay');
      }
    } else {
      toastr.error('Could not find map');
    }
  }

  getFeatureVisibility() {
    let map = _.find(this.props.maps, {geoId: this.state.selectedMapId});
    let feature = _.find(this.props.features, {geoId: this.state.selectedFeatureId});
    let parentOverlay = _.find(this.props.overlays, {geoId: this.state.selectedParentOverlayId});
    let parentFeature = _.find(this.props.features, {geoId: this.state.selectedParentFeatureId});
    let parent;

    if (map) {
      if (feature) {

        if (parentOverlay) {
          parent = parentOverlay;
        } else if (parentFeature) {
          parent = parentFeature;
        }

        map.getVisibility({
          target: feature,
          parent: parent,
          onSuccess: (args) => {
            toastr.success('Map.getVisibility succeeded: \n ' +
              JSON.stringify({
                visible: args.visible,
                target: args.target,
                parent: args.parent
              }));
          },
          onError: (args) => {
            toastr.error('Map getVisibility failed: \n' + JSON.stringify(args));
          }
        });
      } else {
        toastr.error('Could not find feature');
      }
    } else {
      toastr.error('Could not find map');
    }
  }

  render() {

    return (
      <div>
        <h3>Get Visibility</h3>

        <MapSelect label='Choose which map to query' selectedMapId={this.state.selectedMapId} callback={this.updateSelectedMap}/>

        <OverlaySelect label='Choose an overlay' selectedOverlayId={this.state.selectedOverlayId} callback={this.updateSelectedOverlay}/>

        <FeatureSelect label='or a feature' selectedFeatureId={this.state.selectedFeatureId} callback={this.updateSelectedFeature}/>

        <button className='blocky mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
                onClick={this.getOverlayVisibility}>
          Get Overlay Visibility
        </button>
        <button className='blocky mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
                onClick={this.getFeatureVisibility}>
          Get Feature Visibility
        </button>

        <h6>To test instance visibility, choose the parent of the item you are
        looking for from either these overlays or features</h6>

        <OverlaySelect label='Parent Overlay' selectedOverlayId={this.state.selectedParentOverlayId} callback={this.updateSelectedParentOverlay}/>
        <FeatureSelect label='or Parent Feature' selectedFeatureId={this.state.selectedParentFeatureId} callback={this.updateSelectedParentFeature}/>

      </div>
    );
  }
}

MapGetVisibilityTest.propTypes = {
  maps: PropTypes.array.isRequired,
  overlays: PropTypes.array.isRequired,
  features: PropTypes.array.isRequired,
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired
};

export default MapGetVisibilityTest;
