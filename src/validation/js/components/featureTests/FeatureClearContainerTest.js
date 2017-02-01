import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import RelatedTests from '../../containers/RelatedTests';
import {VPaginatedList, FeatureSelect} from '../shared';

class FeatureClearContainerTest extends Component {
  constructor(props) {
    super(props);

    let selectedFeatureId = '';
    if (props.features.length > 0) {
      selectedFeatureId = _.first(props.features).geoId;
    }

    this.state = {
      selectedFeatureId: selectedFeatureId,
      childFeatures: []
    };

    this.clearContainer = this.clearContainer.bind(this);
    this.fetchChildren = this.fetchChildren.bind(this);
    this.updateSelectedFeature = this.updateSelectedFeature.bind(this);
  }

  componentDidMount() {
    if (this.state.selectedFeatureId === '') {
      return;
    }
    const {features} = this.props;
    const feature = _.find(features, {geoId: this.state.selectedFeatureId});
    this.fetchChildren(feature);
  }

  componentWillReceiveProps(props) {
    if (props.features.length > 0 && this.state.selectedFeatureId === '') {
      const feature = _.find(props.features, {geoId: this.state.selectedFeatureId});
      this.fetchChildren(feature);
    }
  }

  updateSelectedFeature(event) {
    const {features} = this.props;
    const feature = _.find(features, {geoId: event.target.value});
    if (!feature) {
      this.setState({selectedFeatureId: '', childFeatures: []});
    } else {
      this.setState({selectedFeatureId: feature.geoId}, () => {
        this.fetchChildren(feature);
      });
    }
  }

  fetchChildren(feature) {
    feature.getChildFeatures({
      onSuccess: args => {
        this.setState({childFeatures: args.features});
      },
      onError: () => {
        toastr.error('Error Retrieving Child Features');
        this.setState({childFeatures: []});
      }
    });
  }

  clearContainer() {
    const {features, addError} = this.props;
    const feature = _.find(features, {geoId: this.state.selectedFeatureId});
    try {
      feature.clearContainer({
        onSuccess: () => {
          toastr.success('Cleared Feature Container');
          this.fetchChildren(feature);
        },
        onError: err => {
          toastr.error('Failed to Clear Feature Container');
          addError(err, 'Feature.clearContainer');
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Feature.clearContainer: Critical');
    }
  }

  render() {
    const {features} = this.props;

    const childFeatures = this.state.childFeatures.length === 0 ?
      (<div>Selected feature has no children</div>) : (<VPaginatedList items={this.state.childFeatures}/>);

    return (
      <div>
        <span className='mdl-layout-title'>Feature.clearContainer</span>

        <div className='mdl-grid'>

          <div className='mdl-cell mdl-cell--12-col'>
            <FeatureSelect features={features}
                           label='Clear child features from '
                           selectedFeatureId={this.state.selectedFeatureId}
                           callback={this.updateSelectedFeature}/>
          </div>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            disabled={this.state.selectedFeatureId === ''}
            onClick={this.clearContainer}>
            Clear Container
          </button>

          <div className='mdl-cell mdl-cell--12-col'>
            <span className='mdl-layout-title'>Child Features</span>
            {childFeatures}
          </div>
        </div>

        <RelatedTests className='mdl-cell mdl-cell--12-col' relatedTests={[
          {text: 'Add Child Features To A Feature', target: 'featureAddFeatureTest'}
        ]}/>

      </div>
    );
  }
}

FeatureClearContainerTest.propTypes = {
  addError: PropTypes.func.isRequired,
  features: PropTypes.array.isRequired
};

const mapStateToProps = state => {
  return {
    features: state.features
  };
};

export default connect(mapStateToProps)(FeatureClearContainerTest);
