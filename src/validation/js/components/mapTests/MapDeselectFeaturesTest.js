import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {MapSelect, VPaginatedTemplate} from '../shared';

//======================================================================================================================
let FeatureTemplate = ({data}) => {
  return (
    <div className='mdl-cell mdl-cell--12-col mdl-grid mdl-grid--no-spacing'>
      <div className='mdl-cell mdl-cell--1-col'>
        <label className="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" htmlFor={data.geoId}>
          <input type="checkbox"
                 id={data.geoId}
                 className="mdl-checkbox__input"
                 onClick={data.callback}
                 checked={data.checked}/>
          <span className="mdl-checkbox__label"/>
        </label>
      </div>
      <div className='mdl-cell mdl-grid mdl-grid--no-spacing'>
        <div className='mdl-cell mdl-cell--12-col'>{data.name}</div>
        <div className='mdl-cell mdl-cell--12-col'><span
          style={{fontStyle: 'italic', fontSize: '0.8em'}}>{data.geoId}</span></div>
      </div>
    </div>
  );
};

FeatureTemplate.propTypes = {
  data: PropTypes.object
};

//======================================================================================================================

class MapDeselectFeatureTest extends Component {
  constructor(props) {
    super(props);

    let selectedMapId = '';
    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId,
      selectedFeatures: []
    };

    this.updateSelectedMapId = this.updateSelectedMapId.bind(this);
    this.toggleFeature = this.toggleFeature.bind(this);
    this.deselectFeatures = this.deselectFeatures.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  updateSelectedMapId(event) {
    this.setState({selectedMapId: event.target.value});
  }

  toggleFeature(featureId) {

    let newFeatures = [...this.state.selectedFeatures];
    if (_.includes(this.state.selectedFeatures, featureId)) {
      _.pull(newFeatures, featureId);
    } else {
      newFeatures.push(featureId);
    }
    setTimeout(this.setState({selectedFeatures: newFeatures}), 50);
  }

  deselectFeatures() {
    const map = _.find(this.props.maps, {geoId: this.state.selectedMapId});
    const features = this.state.selectedFeatures.map(featureId => {
      return _.find(this.props.features, {geoId: featureId});
    });

    try {
      map.deselectFeatures({
        features: features,
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

    let data = features.map(feature => {
      feature.checked = _.includes(this.state.selectedFeatures, feature.geoId);
      feature.callback = () => this.toggleFeature(feature.geoId);
      return feature;
    });

    return (
      <div className='mdl-layout'>
        <h3>Deselect Features on a Map</h3>

        <MapSelect label='Map'
                   selectedMapId={this.state.selectedMapId}
                   callback={this.updateSelectedMapId}/>

        <VPaginatedTemplate
          template={FeatureTemplate}
          data={data}/>

        <button className='mdl-button mdl-js-button mdl-button--raised mdl-button--colored'
                onClick={this.deselectFeatures}
                disabled={this.state.selectedMapId === ''}>
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
