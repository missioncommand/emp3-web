import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {RelatedTests} from '../../containers';
import {addError} from '../../actions/TestActions';

//======================================================================================================================
let ParentFeature = ({id, name, overlayId}) => {
  return (<div>
    {id} {name} {overlayId}
  </div>);
};

ParentFeature.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  overlayId: PropTypes.string
};

//======================================================================================================================
let ParentOverlay = ({id, name, overlayId}) => {
  return (<div>
    {id} {name} {overlayId}
  </div>);
};

ParentOverlay.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  overlayId: PropTypes.string
};

//======================================================================================================================

class FeatureGetParentsTest extends Component {
  constructor(props) {
    super(props);

    let selectedFeatureId = '';
    if (props.features.length > 0) {
      selectedFeatureId = _.first(props.features).geoId;
    }

    this.state = {
      selectedFeatureId: selectedFeatureId,
      featureParents: [],
      overlayParents: []
    };

    this.updateSelectedFeature = this.updateSelectedFeature.bind(this);
    this.getParents = this.getParents.bind(this);
  }

  updateSelectedFeature(event) {
    this.setState({selectedFeatureId: event.target.value}, this.getParents);
  }

  getParents() {
    if (this.state.selectedFeatureId === '') {
      return;
    }
    const feature = _.find(this.props.features, {geoId: this.state.selectedFeatureId});
    const {dispatch} = this.props;

    try {
      feature.getParents({
        onSuccess: cbArgs => {
          toastr.success('Retrieved the features parents: features(' + cbArgs.features.length + ') overlays(' + cbArgs.overlays.length + ')');
          this.setState({
            featureParents: cbArgs.features,
            overlayParents: cbArgs.overlays
          });
        },
        onError: err => {
          toastr.error('Failed to retrieve parents');
          dispatch(addError(err, 'Feature.getParents'));
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Feature.getParents: Critical');
    }
  }


  render() {

    return (<div>

        <span className='mdl-layout-title'>Get Parents</span>

        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--12-col'>
            <label htmlFor='featureSelect'>Select Feature </label>
            <select id='featureSelect' value={this.state.selectedFeatureId} onChange={this.updateSelectedFeature}>
              {this.props.features.map(feature => {
                return <option key={feature.geoId} value={feature.geoId}>{feature.name}</option>;
              })}
            </select>
          </div>
        </div>

        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--12-col'>
            <button className='mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect'
                    onClick={this.getParents} disabled={this.state.selectedFeatureId === ''}>
              Get Parents
            </button>
          </div>
        </div>

        <div>
          <h5>Parent Features</h5>
          {this.state.featureParents.map(feature => {
            return <ParentFeature key={'parent_' + feature.geoId} id={feature.geoId} name={feature.name}/>;
          })}
          {this.state.featureParents.length === 0 ? 'No feature parents' : null}
        </div>

        <div>
          <h5>Parent Overlays</h5>
          {this.state.overlayParents.map(overlay => {
            return <ParentOverlay key={'parent_' + overlay.geoId} id={overlay.geoId} name={overlay.name}/>;
          })}
          {this.state.overlayParents.length === 0 ? 'No overlay parents' : null}
        </div>

        <RelatedTests relatedTests={[]}/>
      </div>
    );
  }
}

FeatureGetParentsTest.propTypes = {
  dispatch: PropTypes.func,
  features: PropTypes.array
};

const mapStateToProps = state => {
  return {
    features: state.features
  };
};

export default connect(mapStateToProps)(FeatureGetParentsTest);
