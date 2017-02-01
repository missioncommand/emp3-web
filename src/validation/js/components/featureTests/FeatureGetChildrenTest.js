import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import RelatedTests from '../../containers/RelatedTests';
import {addError} from '../../actions/TestActions';

//======================================================================================================================
let ChildEntry = ({name, geoId, type}) => {

  return (
    <div className='mdl-shadow--3dp'>
      <div className='mdl-grid'>
        <div className='mdl-cell mdl-cell--8-col'>
          <span style={{fontSize: '.7em'}}>Name:</span> {name}
        </div>
        <div className='mdl-cell'>
          <span style={{fontSize: '.7em'}}>Type:</span> {type}
        </div>
      </div>
      <div className='mdl-grid'>
        <div className='mdl-cell mdl-cell--12-col'>
          <span style={{fontSize: '.7em'}}>GeoID:</span> <span style={{fontSize: '0.9em'}}>{geoId}</span>
        </div>
      </div>
    </div>
  );
};

ChildEntry.propTypes = {
  name: PropTypes.string.isRequired,
  geoId: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired
};

//======================================================================================================================

class FeatureGetChildrenTest extends Component {
  constructor(props) {
    super(props);

    let selectedFeatureId = '';
    if (props.features.length > 0) {
      selectedFeatureId = _.first(props.features).geoId;
    }

    this.state = {
      selectedFeatureId: selectedFeatureId,
      children: []
    };

    this.getChildren = this.getChildren.bind(this);
    this.updateSelectedFeature = this.updateSelectedFeature.bind(this);
  }

  componentDidMount() {
    if (this.state.selectedFeatureId !== '') {
      this.getChildren();
    }
  }

  componentWillReceiveProps(props) {
    if (props.features.length > 0 && this.state.selectedFeatureId === '') {
      this.setState({selectedFeatureId: _.first(props.features).geoId}, this.getChildren);
    }
  }

  updateSelectedFeature(event) {
    this.setState({selectedFeatureId: event.target.value}, this.getChildren);
  }

  getChildren() {
    if (this.state.selectedFeatureId === '') {
      return;
    }

    const feature = _.find(this.props.features, {geoId: this.state.selectedFeatureId});
    const {dispatch} = this.props;

    try {
      feature.getChildren({
        onSuccess: cbArgs => {
          toastr.success('Successfully retrieved children (' + cbArgs.features.length + ')');
          this.setState({children: cbArgs.features});
        },
        onError: err => {
          dispatch(addError(err, 'Feature.getChildren'));
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Feature.getChildren: Critical');
      dispatch(addError(err.message, 'Feature.getChildren: Critical'));
    }
  }

  render() {
    return (
      <div className='mdl-layout__content'>
        <span className='mdl-layout-title'>Get Children</span>
        <div>
          <label htmlFor='featureSelect'>Select Feature </label>
          <select id='featureSelect' value={this.state.selectedFeatureId} onChange={this.updateSelectedFeature}>
            {this.props.features.map(feature => {
              return (<option key={feature.geoId} value={feature.geoId}>
                {feature.name !== '' ? feature.name : feature.geoId}
              </option>);
            })}
          </select>
        </div>

        <button className='mdl-button mdl-js-button mdl-button--raised mdl-button--colored'
                onClick={this.getChildren} disabled={this.state.selectedFeatureId === ''}>
          Get Children
        </button>

        <div>
          {this.state.children.map(child => {
            return <ChildEntry key={child.geoId} name={child.name} type={child.type} geoId={child.geoId}/>;
          })}
          {this.state.children.length === 0 ? <span>No children found</span> : null}
        </div>

        <RelatedTests relatedTests={[
          {text: 'Create Features', target: 'createMilStdSymbolTest'},
          {text: 'Add Child Features', target: 'featureAddFeatureTest'}
        ]}/>
      </div>
    );
  }
}

FeatureGetChildrenTest.propTypes = {
  dispatch: PropTypes.func,
  features: PropTypes.array
};

const mapStateToProps = state => {
  return {
    features: state.features
  };
};

export default connect(mapStateToProps)(FeatureGetChildrenTest);
