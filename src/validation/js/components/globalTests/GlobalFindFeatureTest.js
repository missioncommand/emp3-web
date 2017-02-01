import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {FeatureSelect} from '../shared';
import {RelatedTests} from '../../containers';
import classNames from 'classnames';
import {addError, addResult} from '../../actions/ResultActions';

// =====================================================================================================================
let FeatureDiv = ({feature}) => {
  return (
    <div className='mdl-cell mdl-cell--12-col mdl-grid'>
      <div className='mdl-cell mdl-cell--12-col mdl-grid mdl-grid--no-spacing'>
        <div className='mdl-cell mdl-cell--3-col'>Name:</div>
        <div className='mdl-cell mdl-cell--9-col'>{feature.name}</div>
      </div>

      <div className='mdl-cell mdl-cell--12-col mdl-grid mdl-grid--no-spacing'>
        <div className='mdl-cell mdl-cell--3-col'>GeoId:</div>
        <div className='mdl-cell mdl-cell--9-col'>{feature.geoId}</div>
      </div>
    </div>
  );
};

FeatureDiv.propTypes = {
  feature: PropTypes.shape({
    name: PropTypes.string.isRequired,
    geoId: PropTypes.string.isRequired
  }).isRequired
};
// =====================================================================================================================
class GlobalFindFeatureTest extends Component {
  constructor(props) {
    super(props);

    this.state = {
      featureId: '',
      feature: null
    };

    this.updateFeatureId = this.updateFeatureId.bind(this);
    this.findFeature = this.findFeature.bind(this);
  }

  updateFeatureId(event) {
    this.setState({featureId: event.target.value});
  }

  findFeature() {
    const {dispatch} = this.props;
    try {
      emp3.api.global.findFeature({
        uuid: this.state.featureId,
        onSuccess: (args) => {
          if (args.feature !== undefined) {
            toastr.success('Found a feature with the id "' + this.state.featureId + '"');
            this.setState({feature: args.feature});
          } else {
            toastr.success('Found no feature with the id "' + this.state.featureId + '"');
            this.setState({feature: null});
          }
          dispatch(addResult(args, 'global.findFeature'));
        },
        onError: (err) => {
          toastr.error('An error occurred while looking for the feature');
          dispatch(addError(err, 'global.findFeature'));
        }
      });
    } catch (err) {
      toastr.error(err.message, 'global.findFeature: Critical');
      dispatch(addError(err.message, 'global.findFeature: Critical'));
      this.setState({feature: null});
    }
  }

  render() {
    const {features} = this.props;

    let featureInputClass = classNames(
      'mdl-cell', 'mdl-cell--12-col', 'mdl-textfield', 'mdl-js-textfield', 'mdl-textfield--floating-label',
      {'is-dirty': this.state.featureId !== ''}
    );

    let featureResult = <div className='mdl-cell mdl-cell--12-col'>No Feature Found</div>;

    if (this.state.feature) {
      featureResult = <FeatureDiv feature={this.state.feature}/>;
    }

    return (
      <div>
        <span className='mdl-layout-title'>emp3.api.global.findFeature()</span>
        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--12-col'>
            <FeatureSelect
              features={features}
              selectedFeatureId={this.state.featureId}
              callback={this.updateFeatureId}
              label='Search the core for '/>
          </div>

          <div className={featureInputClass}>
            <input className='mdl-textfield__input' type='text' id='featureId'
                   value={this.state.featureId} onChange={this.updateFeatureId}/>
            <label className='mdl-textfield__label' htmlFor='featureId'>FeatureId</label>
          </div>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.findFeature}>
            Find Feature
          </button>

          {featureResult}

          <div className='mdl-cell mdl-cell--12-col'>
            <RelatedTests relatedTests={[
              {text: 'global.findOverlay', target: 'globalFindOverlayTest'},
              {text: 'global.findContainer'}
            ]}/>
          </div>
        </div>
      </div>
    );
  }
}

GlobalFindFeatureTest.propTypes = {
  dispatch: PropTypes.func,
  features: PropTypes.array
};

const mapStateToProps = (state) => {
  return {
    features: state.features
  };
};

export default connect(mapStateToProps)(GlobalFindFeatureTest);
