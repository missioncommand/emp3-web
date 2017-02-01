import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {MapSelect, FeatureSelect} from '../shared';

class MapDeselectFeatureTest extends Component {
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

    this.updateSelectedMapId = this.updateSelectedMapId.bind(this);
    this.updateSelectedFeature = this.updateSelectedFeature.bind(this);
    this.deselectFeature = this.deselectFeature.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }

    if (props.features.length > 0 && this.features.selectedFeatureId === '') {
      this.setState({selectedFeatureId: _.first(props.features).geoId});
    }
  }

  updateSelectedMapId(event) {
    this.setState({selectedMapId: event.target.value});
  }

  updateSelectedFeature(event) {
    this.setState({selectedFeatureId: event.target.value});
  }

  deselectFeature() {
    const map = _.find(this.props.maps, {geoId: this.state.selectedMapId});
    const feature = _.find(this.props.features, {geoId: this.state.selectedFeatureId});

    try {
      map.deselectFeature({
        feature: feature,
        onSuccess: (args) => {
          toastr.success('Feature selected successfully: \n' + JSON.stringify(args));
        },
        onError: err => {
          toastr.error('Failed to select feature: \n' + JSON.stringify(err));
        }
      });
    } catch (err) {
      toastr.error(err.message);
    }
  }

  render() {
    const {features} = this.props;

    return (
      <div className='mdl-layout'>
        <h3>Deselect a Feature on a Map</h3>

        <div>
          <MapSelect label='Map'
                     selectedMapId={this.state.selectedMapId}
                     callback={this.updateSelectedMapId}/>
        </div>

        <div>
          <FeatureSelect features={features}
                         selectedFeatureId={this.state.selectedFeatureId}
                         callback={this.updateSelectedFeature}
                         label="Feature"/>
        </div>

        <button className='mdl-button mdl-js-button mdl-button--raised mdl-button--colored'
                onClick={this.deselectFeature}
                disabled={this.state.selectedMapId === '' || this.state.selectedFeatureId === ''}>
          Deselect
        </button>

        <RelatedTests relatedTests={[
          {text: 'Select Feature', target: 'mapSelectFeatureTest'},
          {text: 'Select Features', target: 'mapSelectFeaturesTest'},
          {text: 'Get Selected Features', target: 'mapGetSelectedTest'},
          {text: 'Check Features for Selection', target: 'mapIsSelectedTest'}
        ]}/>
      </div>
    );
  }
}

MapDeselectFeatureTest.propTypes = {
  maps: PropTypes.array.isRequired,
  features: PropTypes.array.isRequired
};

export default MapDeselectFeatureTest;
