import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {addError} from '../../actions/ResultActions';
import {FeatureSelect} from '../shared';
import {RelatedTests} from '../../containers';

class FeatureRemoveFeatureTest extends Component {
  constructor(props) {
    super(props);
    const {features} = props;

    let selectedFeatureId = '';
    if (features.length > 0) {
      selectedFeatureId = _.first(features).geoId;
    }
    this.state = {
      selectedFeatureId: selectedFeatureId,
      childFeatures: [],
      selectedChildFeatures: []
    };

    this.removeFeatures = this.removeFeatures.bind(this);
    this.fetchChildren = this.fetchChildren.bind(this);
    this.updateSelectedFeatureId = this.updateSelectedFeatureId.bind(this);
    this.toggleChildFeature = this.toggleChildFeature.bind(this);
  }

  componentDidMount() {
    this.fetchChildren();
  }

  componentDidUpdate() {
    componentHandler.upgradeDom();
  }

  componentWillReceiveProps(props) {
    const {features} = props;

    if (features.length > 0 && this.state.selectedFeatureId === '') {
      this.setState({selectedFeatureId: _.first(features).geoId}, this.fetchChildren);
    }
  }

  fetchChildren() {
    const {dispatch, features} = this.props;
    const feature = _.find(features, {geoId: this.state.selectedFeatureId});
    if (!feature) {
      return;
    }
    try {
      feature.getChildren({
        onSuccess: (cbArgs) => {
          this.setState({
            childFeatures: cbArgs.features,
            selectedChildFeatures: []
          });
        },
        onError: (err) => {
          toastr.error('Failed to get child features');
          dispatch(addError(err, 'Feature.getChildren'));
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Feature.getChildren: Critical');
      dispatch(addError(err.message, 'Feature.getChildren: Critical'));
    }
  }

  updateSelectedFeatureId(event) {
    this.setState({selectedFeatureId: event.target.value}, this.fetchChildren);
  }

  toggleChildFeature(geoId) {
    let selectedFeatures = [...this.state.selectedChildFeatures];
    if (_.includes(selectedFeatures, geoId)) {
      _.pull(selectedFeatures, geoId);
    } else {
      selectedFeatures.push(geoId);
    }

    setTimeout(() =>
        this.setState({selectedChildFeatures: selectedFeatures}),
      50);
  }

  removeFeatures() {
    const {features, dispatch} = this.props;
    const parentFeature = _.find(features, {geoId: this.state.selectedFeatureId});

    let featuresToRemove = this.state.selectedChildFeatures.map(featureId => {
      return _.find(features, {geoId: featureId});
    });

    if (this.state.selectedChildFeatures.length === 1) {
      try {
        parentFeature.removeFeature({
          feature: featuresToRemove,
          onSuccess: () => {
            toastr.success('Removed child feature');
            this.fetchChildren();
          },
          onError: (err) => {
            toastr.error('Failed to remove child feature');
            dispatch(addError(err, 'Feature.removeFeature'));
          }
        });
      } catch (err) {
        toastr.error(err.message, 'Feature.removeFeature: Critical');
      }
    } else {
      try {
        parentFeature.removeFeatures({
          features: featuresToRemove,
          onSuccess: () => {
            toastr.success('Removed child features');
            this.fetchChildren();
          },
          onError: (err) => {
            toastr.error('Failed to remove child features');
            dispatch(addError(err, 'Feature.removeFeatures'));
          }
        });
      } catch (err) {
        toastr.error(err.message, 'Feature.removeFeatures: Critical');
      }
    }

  }

  render() {
    const {features} = this.props;

    let childItems = this.state.childFeatures.map(feature => {
      return (
        <div key={feature.geoId} className='mdl-list__item mdl-list__item--two-line'>
          <span className='mdl-list__item-primary-content'>
            {feature.name}
          </span>
          <span className='mdl-list__item-secondary-action'>
            <label className='mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect' htmlFor={feature.geoId + '_toggle'}>
              <input type='checkbox'
                     id={feature.geoId + '_toggle'}
                     className='mdl-checkbox__input'
                     onChange={() => this.toggleChildFeature(feature.geoId)}/>
            </label>
          </span>

        </div>
      );
    });

    if (this.state.childFeatures.length === 0) {
      childItems = (
        <div className='mdl-list__item'>
          <span className='mdl-list__item-primary-content'>
            No children on selected parent
          </span>
        </div>
      );
    }

    return (
      <div>
        <span className='mdl-layout-title'>Feature.removeFeature(s)</span>
        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--12-col'>
            <FeatureSelect
              features={features}
              selectedFeatureId={this.state.selectedFeatureId}
              callback={this.updateSelectedFeatureId}
              label='Remove features from '/>
          </div>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            disabled={this.updateSelectedFeatureId === ''}
            onClick={this.removeFeatures}>
            {this.state.selectedChildFeatures.length === 1 ? 'Remove Feature\u00a0' : 'Remove Features'}
          </button>

          <div className='mdl-cell mdl-cell--12-col mdl-list'>
            {childItems}
          </div>

          <div className='mdl-cell mdl-cell--12-col'>
            <RelatedTests relatedTests={[]}/>
          </div>
        </div>
      </div>
    );
  }
}

FeatureRemoveFeatureTest.propTypes = {
  dispatch: PropTypes.func,
  features: PropTypes.array
};

const mapStateToProps = state => {
  return {
    features: state.features
  };
};

export default connect(mapStateToProps)(FeatureRemoveFeatureTest);
