import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {RelatedTests} from '../../containers';
import {addError} from '../../actions/TestActions';

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

class OverlayGetParentsTest extends Component {
  constructor(props) {
    super(props);

    let selectedOverlayId = '';
    if (props.overlays.length > 0) {
      selectedOverlayId = _.first(props.overlays).geoId;
    }

    this.state = {
      selectedOverlayId: selectedOverlayId,
      overlayParents: []
    };

    this.updateSelectedOverlay = this.updateSelectedOverlay.bind(this);
    this.getParents = this.getParents.bind(this);
  }

  updateSelectedOverlay(event) {
    this.setState({selectedOverlayId: event.target.value}, this.getParents);
  }

  getParents() {
    if (this.state.selectedOverlayId === '') {
      return;
    }
    const overlay = _.find(this.props.overlays, {geoId: this.state.selectedOverlayId});
    const {dispatch} = this.props;

    try {
      overlay.getParents({
        onSuccess: cbArgs => {
          toastr.success('Retrieved the overlays parents: overlays(' + cbArgs.overlays.length + ')');
          this.setState({
            overlayParents: cbArgs.overlays
          });
        },
        onError: err => {
          toastr.error('Failed to retrieve parents');
          dispatch(addError(err, 'Overlay.getParents'));
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Overlay.getParents: Critical');
    }
  }


  render() {

    return (<div>
        <span className='mdl-layout-title'>Get Parents</span>

        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--12-col'>
            <label htmlFor='overlaySelect'>Select Overlay </label>
            <select id='overlaySelect' value={this.state.selectedOverlayId} onChange={this.updateSelectedOverlay}>
              {this.props.overlays.map(overlay => {
                return <option key={overlay.geoId} value={overlay.geoId}>{overlay.name}</option>;
              })}
            </select>
          </div>
        </div>

        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--12-col'>
            <button className='mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect'
                    onClick={this.getParents} disabled={this.state.selectedOverlayId === ''}>
              Get Parents
            </button>
          </div>
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

OverlayGetParentsTest.propTypes = {
  dispatch: PropTypes.func,
  overlays: PropTypes.array
};

const mapStateToProps = state => {
  return {
    overlays: state.overlays
  };
};

export default connect(mapStateToProps)(OverlayGetParentsTest);
