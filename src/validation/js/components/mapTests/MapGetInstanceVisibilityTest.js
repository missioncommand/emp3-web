import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {RelatedTests} from '../../containers';
import {MapSelect} from '../shared';
import {addError} from '../../actions/ResultActions';
import {toggleInstructions} from '../../actions/InstructionsStateActions';

//======================================================================================================================
class TreeNode extends Component {
  constructor(props) {
    super(props);
    const {map, parent, item} = props;

    let visibilityState = '';

    if (parent instanceof emp3.api.Overlay || parent instanceof emp3.api.Feature || parent instanceof emp3.api.Map) {
      let vs = map.getInstanceVisibility(parent, item);
      switch (vs) {
        case emp3.api.enums.VisibilityStateEnum.HIDDEN:
          visibilityState = 'HIDDEN';
          break;
        case emp3.api.enums.VisibilityStateEnum.VISIBLE_ANCESTOR_HIDDEN:
          visibilityState = 'VISIBLE_ANCESTOR_HIDDEN';
          break;
        case emp3.api.enums.VisibilityStateEnum.VISIBLE:
          visibilityState = 'VISIBLE';
          break;
        default:
          visibilityState = '';
      }
    }

    this.state = {
      children: [],
      showChildren: true,
      visibilityState: visibilityState
    };

    this.fetchChildren = this.fetchChildren.bind(this);
    this.toggleChildren = this.toggleChildren.bind(this);
  }

  componentDidMount() {
    this.fetchChildren();
  }

  fetchChildren() {
    const {item} = this.props;

    let type;
    if (item instanceof emp3.api.Overlay) {
      type = 'overlay';
    } else if (item instanceof emp3.api.Feature) {
      type = 'feature';
    } else {
      toastr.error('Could not locate parent with geoId ' + item.geoId);
      return;
    }

    try {
      item.getChildren({
        onSuccess: cbArgs => {
          if (type === 'overlay') {
            this.setState({children: _.concat(cbArgs.overlays, cbArgs.features)});
          } else {
            this.setState({children: cbArgs.features});
          }
        },
        onError: err => {
          toastr.error(err.message, type + '.getChildren');
        }
      });
    } catch (err) {
      toastr.error(err.message, type + '.getChildren: Critical');
    }
  }

  toggleChildren() {
    this.setState({showChildren: !this.state.showChildren});
  }

  render() {
    const {item, map, overlays, features} = this.props;
    const childNodes = this.state.children.map(childItem => {
      return <TreeNode key={childItem.geoId}
                       parent={item}
                       item={childItem}
                       map={map}
                       overlays={overlays}
                       features={features}/>;
    });

    return (
      <div className='mdl-cell mdl-cell--12-col mdl-grid mdl-grid--no-spacing'>
        <div className='mdl-cell mdl-cell--12-col mdl-grid mdl-grid--no-spacing'>
          <div className='mdl-cell mdl-cell--11-col mdl-grid mdl-grid--no-spacing'>
            <div className='mdl-cell mdl-cell--12-col'>
              {item.name || item.container}
              <span style={{fontSize: '0.8em', fontWeight: 'bold'}}> {this.state.visibilityState}</span>
            </div>
            <div className='mdl-cell mdl-cell--12-col'>
              <span style={{fontSize: '0.8em'}}>{item.geoId}</span>
            </div>
          </div>

          {childNodes.length > 0 ?
            <button
              className='mdl-cell mdl-cell--1-col mdl-button mdl-button mdl-js-button'
              onClick={this.toggleChildren}>
              <i className={this.state.showChildren ? 'fa fa-folder-open' : 'fa fa-folder'}/>
            </button> : null }
        </div>

        <div className='mdl-cell mdl-cell--12-col mdl-grid'>
          {this.state.showChildren ? childNodes : null}
        </div>
      </div>
    );
  }
}

TreeNode.propTypes = {
  map: PropTypes.object.isRequired,
  overlays: PropTypes.array.isRequired,
  features: PropTypes.array.isRequired,
  parent: PropTypes.string.isRequired,
  item: PropTypes.shape({
    name: PropTypes.string,
    geoId: PropTypes.string
  }).isRequired
};

//======================================================================================================================
class MapGetInstanceVisibilityTest extends Component {
  constructor(props) {
    super(props);

    let selectedMapId = '';
    let root;
    if (props.maps.length > 0) {
      root = _.first(props.maps);
      selectedMapId = root.geoId;
    }

    this.state = {
      selectedMapId: selectedMapId,
      map: root,
      parent: undefined,
      children: []
    };

    this.updateSelectedMapId = this.updateSelectedMapId.bind(this);
    this.setParent = this.setParent.bind(this);
    this.refreshTree = this.refreshTree.bind(this);
    this.fetchChildren = this.fetchChildren.bind(this);
  }

  componentDidMount() {
    if (this.state.map) {
      this.fetchChildren();
    }
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      let map = _.first(props.maps);
      this.setState({selectedMapId: map.geoId, map: map}, this.fetchChildren);
    }
  }

  updateSelectedMapId(event) {
    const {maps} = this.props;
    const map = _.find(maps, {geoId: event.target.value});
    this.setState({selectedMapId: event.target.value, root: map});
  }

  fetchChildren() {
    try {
      if (this.state.map) {
        this.state.map.getChildren({
          onSuccess: cbArgs => {
            this.setState({children: cbArgs.overlays});
          },
          onError: err => {
            toastr.error(err.message, 'Map.getChildren');
          }
        });
      } else {
        this.setState({children: []});
      }
    } catch (err) {
      toastr.error(err.message, 'Map.getChildren: Critical');
    }
  }

  refreshTree() {
    const {maps} = this.props;
    const map = _.find(maps, {geoId: this.state.selectedMapId});
    this.setState({map: null}, () => {
      this.setState({map: map});
    });
  }

  setParent(item) {
    if (!this.state.parent || item.geoId !== this.state.parent.geoId) {
      this.setState({parent: item});
    } else {
      this.setState({parent: null});
    }
  }

  render() {
    const {dispatch, maps, overlays, features} = this.props;

    const tree = this.state.children.map(overlay => {
      return (
        <TreeNode key={overlay.geoId}
                  item={overlay}
                  parent={this.state.map}
                  map={this.state.map}
                  overlays={overlays}
                  features={features}/>
      );
    });

    return (
      <div>
        <span className='mdl-layout-title'
              onClick={() => dispatch(toggleInstructions(this.constructor.name))}>
          Map.getInstanceVisibility</span>
        <div className='mdl-grid'>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-cell mdl-cell--12-col'
            onClick={this.refreshTree}>
            <i className='fa fa-refresh'/> Refresh
          </button>

          <div className='mdl-cell mdl-cell--12-col'>
            <MapSelect maps={maps}
                       selectedMapId={this.state.selectedMapId}
                       callback={this.updateSelectedMapId}
                       label='Show tree for '/>
          </div>

          {tree}

          <RelatedTests relatedTests={[]}/>
        </div>
      </div>
    );
  }
}

MapGetInstanceVisibilityTest.propTypes = {
  dispatch: PropTypes.func,
  maps: PropTypes.array,
  overlays: PropTypes.array,
  features: PropTypes.array,
  instructionsStates: PropTypes.object
};

const mapStateToProps = state => {
  return {
    maps: state.maps,
    overlays: state.overlays,
    features: state.features,
    instructionsStates: state.instructionsStates
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
)(MapGetInstanceVisibilityTest);
