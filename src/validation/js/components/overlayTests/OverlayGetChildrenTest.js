import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import RelatedTests from '../../containers/RelatedTests';
import {OverlaySelect} from '../shared';
import {addError} from '../../actions/ResultActions';

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

class OverlayGetChildrenTest extends Component {
  constructor(props) {
    super(props);

    let selectedOverlayId = '';
    if (props.overlays.length > 0) {
      selectedOverlayId = _.first(props.overlays).geoId;
    }

    this.state = {
      selectedOverlayId: selectedOverlayId,
      overlays: [],
      features: []
    };

    this.updateSelectedOverlay = this.updateSelectedOverlay.bind(this);
    this.getChildren = this.getChildren.bind(this);
  }

  componentDidMount() {
    if (this.state.selectedOverlayId !== '') {
      this.getChildren();
    }
  }

  componentWillReceiveProps(props) {
    if (props.overlays.length > 0 && this.state.selectedOverlayId === '') {
      this.setState({selectedOverlayId: _.first(props.overlays).geoId}, this.getChildren);
    }
  }

  updateSelectedOverlay(event) {
    this.setState({selectedOverlayId: event.target.value}, this.getChildren);
  }

  getChildren() {
    if (this.state.selectedOverlayId === '') {
      return;
    }
    const {dispatch} = this.props;
    const overlay = _.find(this.props.overlays, {geoId: this.state.selectedOverlayId});
    try {
      overlay.getChildren({
        onSuccess: cbArgs => {
          toastr.success('Retrieved children successfully' + '<br/>' + 'features (' +
            cbArgs.features.length + ') overlays (' + cbArgs.overlays.length + ')');
          this.setState({overlays: cbArgs.overlays, features: cbArgs.features});
        },
        onError: err => {
          toastr.error('Failed to get children');
          dispatch(addError(err, 'Overlay.getChildren'));
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Overlay.getChildren: Critical');
      dispatch(addError(err.message, 'Overlay.getChildren: Critical'));
    }
  }

  render() {

    return (
      <div>
        <span className='mdl-layout-title'>Get Children</span>
        <OverlaySelect selectedOverlayId={this.state.selectedOverlayId} overlays={this.props.overlays}
                       callback={this.updateSelectedOverlay}/>

        <button className='mdl-button mdl-js-button mdl-button--raised mdl-button--colored'
                onClick={this.getChildren}
                disabled={this.state.selectedOverlayId === ''}>
          Get Children
        </button>


        {this.state.overlays.map(child => {
          return <ChildEntry key={child.geoId} name={child.name} geoId={child.geoId} type={child.type} />;
        })}
        {this.state.overlays.length === 0 ? <div>No Child Overlays Found</div> : null}

        {this.state.features.map(child => {
          return <ChildEntry key={child.geoId} name={child.name} geoId={child.geoId} type={child.type} />;
        })}
        {this.state.features.length === 0 ? <div>No Child Features Found</div> : null}

        <RelatedTests relatedTests={[]}/>
      </div>
    );
  }
}

OverlayGetChildrenTest.propTypes = {
  dispatch: PropTypes.func,
  overlays: PropTypes.array
};


const mapStateToProps = state => {
  return {
    overlays: state.overlays
  };
};

export default connect(mapStateToProps)(OverlayGetChildrenTest);
