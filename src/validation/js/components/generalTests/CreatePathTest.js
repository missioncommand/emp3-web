import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {OverlaySelect, VText} from '../shared';
import assign from 'object-assign';
import RelatedTests from '../../containers/RelatedTests';
import PropertiesBox from '../shared/PropertiesBox';
import {createRandomPositionsKML, convertPositionStringToGeoPositions} from '../../util/LocationGen.js';

class CreatePathTest extends Component {
  constructor(props) {
    super(props);

    let selectedOverlayId = '';
    if (props.overlays.length > 0) {
      selectedOverlayId = _.first(props.overlays).geoId;
    }
    this.state = {
      feature: {
        name: '',
        geoId: '',
        description: '',
        positions: ''
      },
      selectedOverlayId: selectedOverlayId
    };

    this.createPath = this.createPath.bind(this);
    this.createPathAddToOverlay = this.createPathAddToOverlay.bind(this);
    this.updateSelectedOverlay = this.updateSelectedOverlay.bind(this);
    this.updatePositionsWithRandom = this.updatePositionsWithRandom.bind(this);
    this.updatePath = this.updatePath.bind(this);
    this.updatePathProperties = this.updatePathProperties.bind(this);
    this.apply = this.apply.bind(this);
  }

  componentDidUpdate() {
    componentHandler.upgradeDom();
  }

  componentWillReceiveProps(props) {
    if (props.overlays.length > 0 && this.state.selectedOverlayId === '') {
      this.setState({selectedOverlayId: _.first(props.overlays).geoId});
    }
  }

  updateSelectedOverlay(ev) {
    this.setState({selectedOverlayId: ev.target.value});
  }

  /**
   * @param {boolean} silent will not display toastr message if set true
   * @throws Will throw an error if primitive constructor fails
   */
  createPath(silent) {
    const {addFeature, addResult, addError} = this.props;

    let path;
    let args = {...this.state.feature};

    args.name = this.state.feature.name.trim() === '' ? undefined : this.state.feature.geoId.trim();
    args.geoId = this.state.feature.geoId.trim() === '' ? undefined : this.state.feature.geoId.trim();
    args.positions = convertPositionStringToGeoPositions(this.state.feature.positions);

    try {
    if ( !_.find(this.props.features, {geoId: this.state.feature.geoId}))
    { // create only when feature not found in core
      path = new emp3.api.Path(args);
      addFeature(path);
      addResult(args, 'createPath');
      if (!silent) {
        toastr.success('Path Created Successfully');
      }
    }
    } catch (err) {
      addError(err.message, 'createPath');
      if (!silent) {
        toastr.error(err.message, 'Create Path Failed');
      }
      throw new Error(err.message);
    }
    return path;
  }

  createPathAddToOverlay() {
    if (this.state.selectedOverlayId === '') {
      toastr.warning('No overlay selected');
      return;
    }

    const {overlays, addResult, addError} = this.props;
    const overlay = _.find(overlays, {geoId: this.state.selectedOverlayId});

    try {
      const path = this.createPath(true);
      if (path)
      {
      overlay.addFeatures({
        features: [path],
        onSuccess: () => {
          addResult(path, 'createPathAddToOverlay');
          toastr.success('Added Path to Overlay at ' + JSON.stringify(path.positions[0]));
        },
        onError: (err) => {
          addError(err, 'createPathAddToOverlay');
          toastr.error(err.errorMessage, 'Failed to add Path to Overlay');
        }
      });
    }
    } catch (err) {
      addError(err.message, 'createPathAddToOverlay:Critical');
      toastr.error(err.message, 'Create Path Add To Overlay:Critical');
    }
  }

  updatePositionsWithRandom() {
    let feature = {...this.state.feature};
    feature.positions = createRandomPositionsKML(3);
    this.setState({feature: feature});
  }

  updatePath(ev) {
    let prop = ev.target.id.split('-')[1],
      feature = {...this.state.feature};

    feature[prop] = ev.target.value;
    this.setState({feature: feature});
  }

  updatePathProperties(propertyName, value) {
    const feature = {...this.state.feature};
    feature[propertyName] = value;
    this.setState({feature: feature});
  }

  apply() {
    const {features} = this.props;

    let path = _.find(features, {geoId: this.state.feature.geoId});
    if (!path) {
      toastr.error('No path found with the given id ' + this.state.feature.geoId);
    }

    try {
      path = assign(path, {}, this.state.feature,
        {positions: convertPositionStringToGeoPositions(this.state.feature.positions)},
      );
      path.apply();
    } catch (err) {
      toastr.error(err.message, 'Path.apply: Critical');
    }
  }

  render() {
    const {overlays} = this.props;

    return (
      <div>
        <span className='mdl-layout-title'>Create a Path</span>
        <div className='mdl-grid'>

          <VText id='createPath-name'
                 label='Name'
                 value={this.state.feature.name}
                 callback={this.updatePath}
                 className="mdl-cell mdl-cell--12-col"/>

          <VText id='createPath-geoId'
                 label='GeoId'
                 value={this.state.feature.geoId}
                 callback={this.updatePath}
                 className="mdl-cell mdl-cell--12-col"/>

          <VText id='createPath-description'
                 label='Description'
                 value={this.state.feature.description}
                 callback={this.updatePath}
                 className="mdl-cell mdl-cell--12-col"/>

          <VText id='createPath-positions'
                 className="mdl-cell mdl-cell--9-col"
                 value={this.state.feature.positions}
                 callback={this.updatePath}
                 label='positions (lon,lat,alt) (lon,lat...'/>

          <button className='mdl-button mdl-js-button mdl-button--icon mdl-button--colored mdl-cell mdl-cell--1-col'
                  onClick={this.updatePositionsWithRandom}
                  title='Generate random position'>
            <i className='material-icons'>+</i>
          </button>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.createPath}>
            Create Path
          </button>

          <OverlaySelect overlays={overlays}
                         className="mdl-cell mdl-cell--12-col"
                         callback={this.updateSelectedOverlay}
                         selectedOverlayId={this.state.selectedOverlayId}
                         label='Select which overlay to add to'/>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.createPathAddToOverlay}
            disabled={overlays.length === 0}>
            Create Path Add To Overlay
          </button>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.apply}>
            Update
          </button>

          <PropertiesBox featureType={emp3.api.enums.FeatureTypeEnum.GEO_PATH}
                         callback={this.updatePathProperties}
                         properties={this.state.feature}/>

          <RelatedTests relatedTests={[
            {text: 'Create an Overlay', target: 'createOverlayTest'},
            {text: 'Add this feature to an overlay'},
            {text: 'Add this feature to another feature'}
          ]}/>
        </div>
      </div>
    );
  }
}

CreatePathTest.propTypes = {
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired,
  addFeature: PropTypes.func.isRequired,
  maps: PropTypes.array,
  overlays: PropTypes.array,
  features: PropTypes.array
};

const mapStateToProps = state => {
  return {
    maps: state.maps,
    overlays: state.overlays,
    features: state.features
  };
};

export default connect(mapStateToProps)(CreatePathTest);
