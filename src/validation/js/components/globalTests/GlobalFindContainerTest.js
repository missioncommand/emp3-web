import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {FeatureSelect, OverlaySelect} from '../shared';
import {RelatedTests} from '../../containers';
import classNames from 'classnames';
import {addError, addResult} from '../../actions/ResultActions';

// =====================================================================================================================
let ContainerDiv = ({container}) => {
  return (
    <div className='mdl-cell mdl-cell--12-col mdl-grid'>
      <div className='mdl-cell mdl-cell--12-col mdl-grid mdl-grid--no-spacing'>
        <div className='mdl-cell mdl-cell--3-col'>Name:</div>
        <div className='mdl-cell mdl-cell--9-col'>{container.name}</div>
      </div>

      <div className='mdl-cell mdl-cell--12-col mdl-grid mdl-grid--no-spacing'>
        <div className='mdl-cell mdl-cell--3-col'>GeoId:</div>
        <div className='mdl-cell mdl-cell--9-col'>{container.geoId}</div>
      </div>
    </div>
  );
};

ContainerDiv.propTypes = {
  container: PropTypes.shape({
    name: PropTypes.string.isRequired,
    geoId: PropTypes.string.isRequired
  }).isRequired
};
// =====================================================================================================================
class GlobalFindContainerTest extends Component {
  constructor(props) {
    super(props);

    this.state = {
      containerId: '',
      container: null
    };

    this.updateContainerId = this.updateContainerId.bind(this);
    this.findContainer = this.findContainer.bind(this);
  }

  updateContainerId(event) {
    this.setState({containerId: event.target.value});
  }

  findContainer() {
    const {dispatch} = this.props;
    try {
      emp3.api.global.findContainer({
        uuid: this.state.containerId,
        onSuccess: (args) => {
          if (args.container !== undefined) {
            toastr.success('Found a container with the id "' + this.state.containerId + '"');
            this.setState({container: args.container});
          } else {
            toastr.success('Found no container with the id "' + this.state.containerId + '"');
            this.setState({container: null});
          }
          dispatch(addResult(args, 'global.findContainer'));
        },
        onError: (err) => {
          toastr.error('An error occurred while looking for the container');
          dispatch(addError(err, 'global.findContainer'));
        }
      });
    } catch (err) {
      toastr.error(err.message, 'global.findContainer: Critical');
      dispatch(addError(err.message, 'global.findContainer: Critical'));
      this.setState({feature: null});
    }
  }

  render() {
    const {features, overlays} = this.props;

    let containerInputClass = classNames(
      'mdl-cell', 'mdl-cell--12-col', 'mdl-textfield', 'mdl-js-textfield', 'mdl-textfield--floating-label',
      {'is-dirty': this.state.containerId !== ''}
    );

    let containerResult = <div className='mdl-cell mdl-cell--12-col'>No Container Found</div>;

    if (this.state.container) {
      containerResult = <ContainerDiv container={this.state.container}/>;
    }

    return (
      <div>
        <span className='mdl-layout-title'>emp3.api.global.findContainer()</span>
        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--12-col'>
            <FeatureSelect
              features={features}
              selectedFeatureId={this.state.containerId}
              callback={this.updateContainerId}
              label='Search Feature Containers for '/>
          </div>

          <div className='mdl-cell mdl-cell--12-col'>
            <OverlaySelect
              overlays={overlays}
              selectedContainerId={this.state.containerId}
              callback={this.updateContainerId}
              label='Search Overlay Containers for '/>
          </div>

          <div className={containerInputClass}>
            <input className='mdl-textfield__input' type='text' id='featureId'
                   value={this.state.containerId} onChange={this.updateContainerId}/>
            <label className='mdl-textfield__label' htmlFor='featureId'>ContainerId</label>
          </div>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.findContainer}>
            Find Container
          </button>

          {containerResult}

          <div className='mdl-cell mdl-cell--12-col'>
            <RelatedTests relatedTests={[
              {text: 'global.findFeature', target: 'globalFindFeatureTest'},
              {text: 'global.findOverlay', target: 'globalFindOverlayTest'}
            ]}/>
          </div>
        </div>
      </div>
    );
  }
}

GlobalFindContainerTest.propTypes = {
  dispatch: PropTypes.func,
  features: PropTypes.array,
  overlays: PropTypes.array
};

const mapStateToProps = (state) => {
  return {
    features: state.features,
    overlays: state.overlays
  };
};

export default connect(mapStateToProps)(GlobalFindContainerTest);
