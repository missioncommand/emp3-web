import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';

class MapEditFeatureTest extends Component {

  constructor(props) {
    super(props);

    let selectedMapId = '';
    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    let selectedFeatureId = '';
    if (props.features.length > 0) {
      selectedFeatureId = _.first(props.features).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId,
      selectedFeatureId: selectedFeatureId
    };

    this.updateSelectedMap = this.updateSelectedMap.bind(this);
    this.updateSelectedFeature = this.updateSelectedFeature.bind(this);
    this.mapEditFeature = this.mapEditFeature.bind(this);
    this.mapCancelEdit = this.mapCancelEdit.bind(this);
    this.mapCompleteEdit = this.mapCompleteEdit.bind(this);
  }

  componentWillReceiveProps(props) {
    let selectedFeatureId = this.state.selectedFeatureId;
    let selectedMapId = this.state.selectedMapId;

    if (props.features.length && this.state.selectedFeatureId === '') {
      selectedFeatureId = _.first(props.features).geoId;
    }
    if (props.maps.length && this.state.selectedMapId === '') {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.setState({selectedMapId: selectedMapId, selectedFeatureId: selectedFeatureId});
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

  mapCancelEdit() {
    var map;
    map = _.find(this.props.maps, {geoId: this.state.selectedMapId});

    map.cancelEdit();
  }

  mapCompleteEdit() {
    var map;
    map = _.find(this.props.maps, {geoId: this.state.selectedMapId});

    map.completeEdit();
  }

  mapEditFeature() {
    const {maps, features, addError} = this.props;
    let map,
      feature;

    map = _.find(maps, {geoId: this.state.selectedMapId});
    feature = _.find(features, {geoId: this.state.selectedFeatureId});

    if (map) {
      try {
        map.editFeature({
          feature: feature,
          onEditStart: (args) => {
            toastr.success('Map.editFeature onEditStart called: \n ' +
              'map instance: ' + args.map.geoId + '\n' +
              'feature: ' + JSON.stringify(args.feature));
          },
          onEditUpdate: (args) => {
            toastr.success('Map.editFeature onEditUpdate called: \n ' +
              'map instance: ' + args.map.geoId + '\n' +
              'updateList: ' + JSON.stringify(args.updateList) + '\n' +
              'feature: ' + JSON.stringify(args.feature));
          },
          onEditComplete: (args) => {
            toastr.success('Map.editFeature onEditComplete called: \n ' +
              'map instance: ' + args.map.geoId + '\n' +
              'updateList: ' + JSON.stringify(args.updateList) + '\n' +
              'feature: ' + JSON.stringify(args.feature));
          },
          onEditCancel: (args) => {
            toastr.success('Map.editFeature onEditCancel called: \n ' +
              'map instance: ' + args.map.geoId + '\n' +
              'updateList: ' + JSON.stringify(args.updateList) + '\n' +
              'feature: ' + JSON.stringify(args.feature));
          },
          onEditError: (err) => {
            toastr.error('Map.editFeature', JSON.stringify(err.errorMessage));
            addError(err, 'Map.editFeatures');
          }
        });
      } catch (err) {
        toastr.error('Map.editFeature: Critical', err.message);
      }
    }
  }

  render() {
    const {maps, features} = this.props;

    return (
      <div>
        <h3>Edit on the map</h3>

        <label htmlFor='mapEditFeature-map'>Select which map you want to edit</label>
        <select className='blocky' id='mapEditFeature-map' value={this.state.selectedMapId}
                onChange={this.updateSelectedMap}>
          {maps.map(map => {
            return <option key={map.geoId} value={map.geoId}>{map.container}</option>;
          })}
        </select>

        <label htmlFor='mapEditFeature-feature'>Select which feature you want to edit</label>
        <select className='blocky' id='mapEditFeature-feature' value={this.state.selectedFeatureId}
                onChange={this.updateSelectedFeature}>
          {features.map(feature => {
            return <option key={feature.geoId}
                           value={feature.geoId}>{feature.name ? feature.name : feature.geoId.substring(0, 6) + '...'}</option>;
          })}
        </select>

        <button
          className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
          onClick={this.mapEditFeature}>
          Edit
        </button>

        <button
          className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
          onClick={this.mapCancelEdit}>
          Cancel
        </button>

        <button
          className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
          onClick={this.mapCompleteEdit}>
          Complete
        </button>

        <RelatedTests relatedTests={[
          {text: 'Cancel the edit'},
          {text: 'Complete the edit'},
          {text: 'Edit a feature'}
        ]}/>
      </div>
    );
  }
}

MapEditFeatureTest.propTypes = {
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired,
  maps: PropTypes.array.isRequired,
  features: PropTypes.array.isRequired
};

export default MapEditFeatureTest;
