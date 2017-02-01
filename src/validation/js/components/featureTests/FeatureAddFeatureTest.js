import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import RelatedTests from '../../containers/RelatedTests';
import {addFeature} from '../../actions/FeatureActions';
import {FeatureSelect, VPaginatedList} from '../shared';

class FeatureAddFeatureTest extends Component {
  constructor(props) {
    super(props);

    let selectedFeatureId = '';
    if (props.features.length > 0) {
      selectedFeatureId = _.first(props.features).geoId;
    }
    this.state = {
      selectedFeatureId: selectedFeatureId,
      childFeatures: [],
      selectedFeatureType: emp3.api.enums.FeatureTypeEnum.GEO_POINT
    };

    this.updateSelectedFeature = this.updateSelectedFeature.bind(this);
    this.fetchChildren = this.fetchChildren.bind(this);
    this.addChildFeature = this.addChildFeature.bind(this);
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
    this.setState({selectedFeatureId: event.target.value}, () => {
      const {features} = this.props;
      const feature = _.find(features, {geoId: this.state.selectedFeatureId});
      this.fetchChildren(feature);
    });
  }

  fetchChildren(feature) {
    const {addError} = this.props;
    feature.getChildFeatures({
      onSuccess: args => {
        this.setState({childFeatures: args.features});
      },
      onError: err => {
        toastr.error('Error Retrieving Child Features');
        addError(err, 'feature.getChildFeatures');
        this.setState({childFeatures: []});
      }
    });
  }

  addChildFeature(featureId) {
    const {addError, features} = this.props;
    const parentFeature = _.find(features, {geoId: this.state.selectedFeatureId}),
          childFeature = _.find(features, {geoId: featureId});

    try {
      parentFeature.addFeature({
        feature: childFeature,
        onSuccess: () => {
          toastr.success('Added child feature');
          this.fetchChildren(parentFeature);
        },
        onError: err => {
          toastr.error('Failed to add child feature');
          addError(err, 'Feature.addFeature');
          this.fetchChildren(parentFeature);
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Feature.addFeature: Critical');
      addError(err.message, 'Feature.addFeature: Critical ');
    }

  }

  render() {
    const {features} = this.props;

    return (
      <div>
        <span className='mdl-layout-title'>Add A Feature to a Feature</span>

        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--12-col'>
            <FeatureSelect features={features}
                           selectedFeatureId={this.state.selectedFeatureId}
                           callback={this.updateSelectedFeature}
                           label="Parent Feature"/>
          </div>

          <div className='mdl-cell mdl-cell--12-col'>
            <ul className='mdl-list'>
              {this.state.childFeatures.length === 0 ? <li className='mdl-list__item'>
                <span className='mdl-list__item-primary-content'>This feature has no children</span>
              </li> : null}
              {this.state.childFeatures.map(feature => {
                return (<li key={feature.geoId + '_child'} className='mdl-list__item mdl-list__item--two-line'>
              <span className='mdl-list__item-primary-content'>
                <span>{feature.name !== '' ? feature.name : feature.geoId}</span>
                <span className='mdl-list__item-sub-title'>{feature.featureType}</span>
              </span>
                </li>);
              })}
            </ul>
          </div>

          <div className='mdl-cell mdl-cell--12-col'>
            <h5>Click to add feature</h5>
            <VPaginatedList items={features} callback={this.addChildFeature} pageSize={5}/>
          </div>
        </div>

        <div className='mdl-cell mdl-cell--12-col'>
          <RelatedTests relatedTests={[
            {text: 'Create a MilStdSymbol', target: 'createMilStdSymbolTest'},
            {text: 'Create a Polygon', target: 'createPolygonTest'},
            {text: 'Clear Child Features', target: 'featureClearContainerTest'}
          ]}/>
        </div>
      </div>
    );
  }
}

FeatureAddFeatureTest.propTypes = {
  addError: PropTypes.func.isRequired,
  addFeature: PropTypes.func.isRequired,
  addResult: PropTypes.func.isRequired,
  features: PropTypes.array.isRequired
};

const mapStateToProps = state => {
  return {
    features: state.features
  };
};

const mapDispatchToProps = dispatch => {
  return {
    addFeature: feature => {
      dispatch(addFeature(feature));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FeatureAddFeatureTest);
