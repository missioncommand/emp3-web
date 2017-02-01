import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {MapSelect} from '../shared';
import RelatedTests from '../../containers/RelatedTests';
import {addError} from '../../actions/ResultActions';

//======================================================================================================================
let ChildEntry = ({child}) => {
  return (
    <div className='mdl-shadow--3dp mdl-cell mdl-cell--12-col mdl-grid'>
      <div className='mdl-cell mdl-cell--12-col mdl-grid mdl-grid--no-spacing'>
        <div className='mdl-cell mdl-cell--8-col'>
          <span style={{fontSize: '.7em'}}>Name:</span> {child.name}
        </div>
        <div className='mdl-cell'>
          <span style={{fontSize: '.7em'}}>Type:</span> {child.type}
        </div>
      </div>
      <div className='mdl-cell mdl-cell--12-col'>
        <span style={{fontSize: '.7em'}}>GeoID:</span> <span style={{fontSize: '0.9em'}}>{child.geoId}</span>
      </div>
    </div>
  );
};

ChildEntry.propTypes = {
  child: PropTypes.shape({
    name: PropTypes.string.isRequired,
    geoId: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
  }).isRequired
};
//======================================================================================================================

class MapGetChildrenTest extends Component {
  constructor(props) {
    super(props);

    let selectedMapId = '';
    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId,
      children: []
    };

    this.getChildren = this.getChildren.bind(this);
    this.updateSelectedMap = this.updateSelectedMap.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId}, this.getChildren);
    }
  }

  updateSelectedMap(event) {
    this.setState({selectedMapId: event.target.value}, this.getChildren);
  }

  getChildren() {
    const {maps, dispatch} = this.props;

    if (this.state.selectedMapId === '') {
      return;
    }

    const map = _.find(maps, {geoId: this.state.selectedMapId});
    try {
      map.getChildren({
        onSuccess: cbArgs => {
          toastr.success('Successfully retrieved the children');
          this.setState({
            children: cbArgs.overlays
          });
        },
        onError: err => {
          toastr.error('Failed to get the children');
          dispatch(addError(err, 'Map.getChildren'));
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Map.getChildren: Critical');
      dispatch(addError(err.message, 'Map.getChildren: Critical'));
    }
  }

  render() {
    const {maps} = this.props;

    return (
      <div>
        <span className='mdl-layout-title'>Get Children</span>
        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--12-col'>
            <MapSelect maps={maps}
                       selectedMapId={this.state.selectedMapId}
                       callback={this.updateSelectedMap}
                       label='Get children for '/>
          </div>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            disabled={this.state.selectedMapId === ''}
            onClick={this.getChildren}>
            Get Children
          </button>

          {this.state.children.map(child => {
            return <ChildEntry key={child.geoId} child={child}/>;
          })}

          {this.state.children.length === 0 ? <div>No Children Found</div> : null}

          <div className='mdl-cell mdl-cell--12-col'>
            <RelatedTests relatedTests={[
              {text: 'Populate the map with sample data', target: 'populateMapTest'},
              {text: 'Create a new overlay', target: 'createOverlayTest'},
              {text: 'Add an existing overlay to this map'},
              {text: 'Change this map\'s view'},
              {text: 'Zoom out as far as you can go'}
            ]}/>
          </div>
        </div>
      </div>
    );
  }
}

MapGetChildrenTest.propTypes = {
  dispatch: PropTypes.func,
  maps: PropTypes.array
};

const mapStateToProps = state => {
  return {
    maps: state.maps
  };
};

export default connect(mapStateToProps)(MapGetChildrenTest);
