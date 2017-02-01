import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {MapSelect, FeatureSelect} from '../shared';

class MapIsSelectedTest extends Component {
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
    this.isSelected = this.isSelected.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }

    if (props.features.length > 0 && this.features.selectedFeatureId === '') {
      this.setState({selectedFeatureId: _.first(props.features).geoId});
    }
  }

  updateSelectedMap(event) {
    this.setState({selectedMapId: event.target.value});
  }

  updateSelectedFeature(event) {
    this.setState({selectedFeatureId: event.target.value});
  }

  isSelected() {
    const map = _.find(this.props.maps, {geoId: this.state.selectedMapId});
    const feature = _.find(this.props.features, {geoId: this.state.selectedFeatureId});
    let selected;

    try {
      selected = map.isSelected({
        feature: feature
      });

      toastr.success(JSON.stringify(selected));

    } catch (err) {
      toastr.error(err.message);
    }
  }

  render() {
    const {features} = this.props;

    return (
      <div className='mdl-layout'>
        <h3>Determine a Feature's Selection State</h3>

        <MapSelect label='Map'
                   selectedMapId={this.state.selectedMapId}
                   callback={this.updateSelectedMap}/>

        <FeatureSelect features={features}
                       selectedFeatureId={this.state.selectedFeatureId}
                       callback={this.updateSelectedFeature}
                       label="Feature"/>

        <button className='mdl-button mdl-js-button mdl-button--raised mdl-button--colored'
                onClick={this.isSelected}
                disabled={this.state.selectedMapId === '' || this.state.selectedFeatureId === ''}>
          Is Selected?
        </button>

        <RelatedTests relatedTests={[
          {text: 'Deselect Feature', target: 'mapDeselectFeatureTest'},
          {text: 'Deselect Features', target: 'mapDeselectFeaturesTest'},
          {text: 'Get Selected Features', target: 'mapGetSelectedTest'},
          {text: 'Check Features for Selection', target: 'mapIsSelectedTest'}
        ]}/>
      </div>
    );
  }
}

MapIsSelectedTest.propTypes = {
  maps: PropTypes.array.isRequired,
  features: PropTypes.array.isRequired
};

export default MapIsSelectedTest;
