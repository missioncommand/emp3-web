import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {OverlaySelect} from '../shared';
import {RelatedTests} from '../../containers';
import classNames from 'classnames';
import {addError, addResult} from '../../actions/ResultActions';

// =====================================================================================================================
let OverlayDiv = ({overlay}) => {
  return (
    <div className='mdl-cell mdl-cell--12-col mdl-grid'>
      <div className='mdl-cell mdl-cell--12-col mdl-grid mdl-grid--no-spacing'>
        <div className='mdl-cell mdl-cell--3-col'>Name:</div>
        <div className='mdl-cell mdl-cell--9-col'>{overlay.name}</div>
      </div>

      <div className='mdl-cell mdl-cell--12-col mdl-grid mdl-grid--no-spacing'>
        <div className='mdl-cell mdl-cell--3-col'>GeoId:</div>
        <div className='mdl-cell mdl-cell--9-col'>{overlay.geoId}</div>
      </div>
    </div>
  );
};

OverlayDiv.propTypes = {
  overlay: PropTypes.shape({
    name: PropTypes.string.isRequired,
    geoId: PropTypes.string.isRequired
  }).isRequired
};
// =====================================================================================================================
class GlobalFindOverlayTest extends Component {
  constructor(props) {
    super(props);

    this.state = {
      overlayId: '',
      overlay: null
    };

    this.updateOverlayId = this.updateOverlayId.bind(this);
    this.findOverlay = this.findOverlay.bind(this);
  }

  updateOverlayId(event) {
    this.setState({overlayId: event.target.value});
  }

  findOverlay() {
    const {dispatch} = this.props;
    try {
      emp3.api.global.findOverlay({
        uuid: this.state.overlayId,
        onSuccess: (args) => {
          if (args.overlay !== undefined) {
            toastr.success('Found an overlay with the id "' + this.state.overlayId + '"');
            this.setState({overlay: args.overlay});
          } else {
            toastr.success('Found no overlay with the id "' + this.state.overlayId + '"');
            this.setState({overlay: null});
          }
          dispatch(addResult(args, 'global.findOverlay'));
        },
        onError: (err) => {
          toastr.error('An error occurred while looking for the overlay');
          dispatch(addError(err, 'global.findOverlay'));
        }
      });
    } catch (err) {
      toastr.error(err.message, 'global.findOverlay: Critical');
      dispatch(addError(err.message, 'global.findOverlay: Critical'));
      this.setState({overlay: null});
    }
  }

  render() {
    const {overlays} = this.props;

    let overlayInputClass = classNames(
      'mdl-cell', 'mdl-cell--12-col', 'mdl-textfield', 'mdl-js-textfield', 'mdl-textfield--floating-label',
      {'is-dirty': this.state.overlayId !== ''}
    );

    let overlayResult = <div className='mdl-cell mdl-cell--12-col'>No Overlay Found</div>;

    if (this.state.overlay) {
      overlayResult = <OverlayDiv overlay={this.state.overlay}/>;
    }

    return (
      <div>
        <span className='mdl-layout-title'>emp3.api.global.findOverlay()</span>
        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--12-col'>
            <OverlaySelect
              overlays={overlays}
              selectedOverlayId={this.state.overlayId}
              callback={this.updateOverlayId}
              label='Search the core for '/>
          </div>

          <div className={overlayInputClass}>
            <input className='mdl-textfield__input' type='text' id='overlayId'
                   value={this.state.overlayId} onChange={this.updateOverlayId}/>
            <label className='mdl-textfield__label' htmlFor='overlayId'>OverlayId</label>
          </div>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.findOverlay}>
            Find Overlay
          </button>

          {overlayResult}

          <div className='mdl-cell mdl-cell--12-col'>
            <RelatedTests relatedTests={[
              {text: 'global.findFeature', target: 'globalFindFeatureTest'},
              {text: 'global.findContainer'}
            ]}/>
          </div>
        </div>
      </div>
    );
  }
}

GlobalFindOverlayTest.propTypes = {
  dispatch: PropTypes.func,
  overlays: PropTypes.array
};

const mapStateToProps = (state) => {
  return {
    overlays: state.overlays
  };
};

export default connect(mapStateToProps)(GlobalFindOverlayTest);
