import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {OverlaySelect, VPaginatedTemplate} from '../shared';
import RelatedTests from '../../containers/RelatedTests';
import {addError} from '../../actions/ResultActions';

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
class OverlayAddFeaturesTest extends Component {
  constructor(props) {
    super(props);

    let selectedOverlayId = '';
    if (props.overlays.length) {
      selectedOverlayId = _.first(props.overlays).geoId;
    }

    this.state = {
      selectedOverlayId: selectedOverlayId,
      selectedFeatures: []
    };

    this.updateSelectedOverlay = this.updateSelectedOverlay.bind(this);
    this.toggleFeature = this.toggleFeature.bind(this);
    this.addFeatures = this.addFeatures.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.overlays.length > 0 && this.state.selectedOverlayId === '') {
      this.setState({selectedOverlayId: _.first(props.overlays).geoId});
    }
  }

  updateSelectedOverlay(event) {
    this.setState({selectedOverlayId: event.target.value});
  }

  toggleFeature(featureId) {
    //let featureId = event.target.value;
    let newFeatures = [...this.state.selectedFeatures];
    if (_.includes(this.state.selectedFeatures, featureId)) {
      _.pull(newFeatures, featureId);
    } else {
      newFeatures.push(featureId);
    }
    setTimeout(this.setState({selectedFeatures: newFeatures}), 50);
  }

  addFeatures() {
    const {overlays, features, addError} = this.props;

    const overlay = _.find(overlays, {geoId: this.state.selectedOverlayId});
    const selectedFeatures = this.state.selectedFeatures.map(featureId => {
      return _.find(features, {geoId: featureId});
    });

    try {
      overlay.addFeatures({
        features: selectedFeatures,
        onSuccess: (args) => {
          toastr.success('Features Added Successfully: ' + args.features);
        },
        onError: err => {
          toastr.error('Failed To Add Features');
          addError(err, 'Overlay.addFeatures');
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Overlay.addFeatures: Critical');
      addError(err.message, 'Overlay.addFeatures: Critical');
    }
  }

  render() {
    const {features, overlays} = this.props;
    let data = features.map(feature => {
      feature.checked = _.includes(this.state.selectedFeatures, feature.geoId);
      feature.callback = () => this.toggleFeature(feature.geoId);
      return feature;
    });

    return (
      <div>
        <span className='mdl-layout-title'>Add Features To An Overlay</span>
        <div className='mdl-grid'>

          <div className='mdl-cell mdl-cell--12-col'>
            <OverlaySelect
              overlays={overlays}
              selectedOverlayId={this.state.selectedOverlayId}
              callback={this.updateSelectedOverlay}
              label='Add Features to '/>
          </div>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.addFeatures}
            disabled={this.state.selectedOverlayId === ''}>
            Add Features
          </button>

          <VPaginatedTemplate
            template={FeatureTemplate}
            data={data}/>

          <RelatedTests relatedTests={[
            {text: 'Create a Mil Std Symbol', target: 'createMilStdSymbolTest'}
          ]}/>
        </div>
      </div>
    );
  }
}

OverlayAddFeaturesTest.propTypes = {
  addError: PropTypes.func,
  overlays: PropTypes.array,
  features: PropTypes.array
};

const mapStateToProps = state => {
  return {
    features: state.features,
    overlays: state.overlays
  };
};

const mapDispatchToProps = dispatch => {
  return {
    addError: (err, title) => {
      dispatch(addError(err, title));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(OverlayAddFeaturesTest);
