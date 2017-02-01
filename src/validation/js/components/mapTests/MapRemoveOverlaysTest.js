import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {MapSelect, VPaginatedTemplate} from '../shared';
import RelatedTests from '../../containers/RelatedTests';
import {addError} from '../../actions/ResultActions';

//======================================================================================================================
let OverlayTemplate = ({data}) => {
  return (
    <div className='mdl-cell mdl-cell--12-col mdl-grid'>
      <button
        className='mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--raised mdl-cell'
        onClick={data.callback}>
        <icon className='fa fa-times'/>
      </button>

      <div className='mdl-cell mdl-grid mdl-grid--no-spacing'>
        <div className='mdl-cell mdl-cell--12-col'>{data.name}</div>
        <div className='mdl-cell mdl-cell--12-col'>
          <span style={{fontSize: '0.6em'}}>{data.geoId}</span>
        </div>
      </div>
    </div>
  );
};

OverlayTemplate.propTypes = {
  data: PropTypes.object
};

//======================================================================================================================
class MapRemoveOverlaysTest extends Component {
  constructor(props) {
    super(props);

    let selectedMapId = '';
    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId,
      childOverlays: []
    };

    this.updateSelectedMapId = this.updateSelectedMapId.bind(this);
    this.getAllOverlays = this.getAllOverlays.bind(this);
    this.removeOverlay = this.removeOverlay.bind(this);
  }

  componentDidMount() {
    if (this.state.selectedMapId === '') {
      return;
    }
    const {maps, addError} = this.props,
      map = _.find(maps, {geoId: this.state.selectedMapId});

    map.getAllOverlays({
      onSuccess: cbArgs => {
        this.setState({
          childOverlays: cbArgs.overlays
        });
      },
      onError: err => {
        toastr.error('Error Retrieving Child Overlays');
        addError(err, 'getAllOverlays');
        this.setState({
          selectedOverlayId: '',
          childOverlays: []
        });
      }
    });
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId}, () => {
        this.getAllOverlays(this.state.selectedMapId);
      });
    } else if (props.maps.length > 0) {
      this.getAllOverlays(this.state.selectedMapId);
    }
  }

  updateSelectedMapId(event) {
    this.setState({selectedMapId: event.target.value}, () => {
      this.getAllOverlays(this.state.selectedMapId);
    });
  }

  getAllOverlays(mapId) {
    const {maps, addError} = this.props;

    const map = _.find(maps, {geoId: mapId});
    map.getAllOverlays({
      onSuccess: cbArgs => {
        this.setState({
          childOverlays: cbArgs.overlays
        });
      },
      onError: err => {
        toastr.error('Error Retrieving Child Overlays');
        addError(err, 'getAllOverlays');
        this.setState({
          selectedOverlayId: '',
          childOverlays: []
        });
      }
    });
  }

  removeOverlay(overlayId) {
    const {maps, overlays} = this.props;

    const map = _.find(maps, {geoId: this.state.selectedMapId});
    const overlay = _.find(overlays, {geoId: overlayId});
    try {
      map.removeOverlay({
        overlay: overlay,
        onSuccess: () => {
          toastr.success('Removed Overlay');
        },
        onError: err => {
          toastr.error('Failed to remove overlay', 'Map.removeOverlay');
          addError(err, 'Map.removeOverlay');
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Map.removeOverlay: Critical');
      addError(err.message, 'Map.removeOverlay: Critical');
    } finally {
      this.getAllOverlays(map.geoId);
    }
  }

  render() {
    const {maps} = this.props;
    let data = this.state.childOverlays.map(overlay => {
      overlay.callback = () => this.removeOverlay(overlay.geoId);
      return overlay;
    });

    return (
      <div>
        <span className='mdl-layout-title'>Map.removeOverlays</span>
        <div className='mdl-grid'>

          <div className='mdl-cell mdl-cell--12-col'>
            <MapSelect maps={maps}
                       selectedMapId={this.state.selectedMapId}
                       callback={this.updateSelectedMapId}
                       label='Remove Overlays from '/>
          </div>

          <span className='mdl-layout-title'>Child Overlays</span>
          <VPaginatedTemplate
            template={OverlayTemplate}
            data={data}/>

          <RelatedTests relatedTests={[
            {text: 'Create a map', target: 'addMapTest'},
            {text: 'Create an overlay', target: 'createOverlayTest'},
            {text: 'Create a MilStd Feature', target: 'createMilStdSymbolTest'}
          ]}/>
        </div>
      </div>
    );
  }
}

MapRemoveOverlaysTest.propTypes = {
  addError: PropTypes.func.isRequired,
  addResult: PropTypes.func.isRequired,
  overlays: PropTypes.array.isRequired,
  maps: PropTypes.array.isRequired
};

const mapStateToProps = state => {
  return {
    overlays: state.overlays,
    maps: state.maps
  };
};

const mapDispatchToProps = dispatch => {
  return {
    addError: (err, title) => {
      dispatch(addError(err, title));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MapRemoveOverlaysTest);
