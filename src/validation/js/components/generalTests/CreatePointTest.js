import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import assign from 'object-assign';
import RelatedTests from '../../containers/RelatedTests';
import {PropertiesBox, VText, OverlaySelect} from '../shared';

class CreatePointTest extends Component {
  constructor(props) {
    super(props);

    let selectedOverlayId = '';

    if (props.overlays.length > 0) {
      selectedOverlayId = _.first(props.overlays).geoId;
    }

    // set the default state for all of our parameters
    this.state = {
      feature: {
        name: '',
        geoId: '',
        position: '',
        description: ''
      },
      selectedOverlayId: selectedOverlayId
    };

    this.updateSelectedOverlay = this.updateSelectedOverlay.bind(this);
    this.update = this.update.bind(this);
    this.updateProperties = this.updateProperties.bind(this);
    this.createPoint = this.createPoint.bind(this);
    this.createPointAddToOverlay = this.createPointAddToOverlay.bind(this);
    this.apply = this.apply.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.overlays.length > 0 && this.state.selectedOverlayId === '') {
      this.setState({selectedOverlayId: _.first(props.overlays).geoId});
    }
  }

  /**
   * @param {boolean} silent will not display toastr message if set true
   * @throws Will throw an error if primitive constructor fails
   */
  createPoint(silent) {
    const {addFeature, addResult, addError} = this.props;
    let point;
    let position = this.state.feature.position.split(',');

    let geoPosition = new emp3.api.GeoPosition({
      longitude: position[0] === '' ? undefined : parseFloat(position[0]),
      latitude: position[1] === '' ? undefined : parseFloat(position[1]),
      altitude: position[2] === '' ? undefined : parseFloat(position[2])
    });

    let args = {...this.state.feature};

    args.name = this.state.feature.name.trim() === '' ? undefined : this.state.feature.name.trim();
    args.geoId = this.state.feature.geoId.trim() === '' ? undefined : this.state.feature.geoId.trim();
    args.position = geoPosition;

    // Try creating the point, log it if we have success or failure
    try {
      point = new emp3.api.Point(args);
      addFeature(point);
      addResult(args, 'createPoint');
      if (!silent) {
        toastr.success('Point Created Successfully');
      }
    } catch (err) {
      addError(err, 'createPoint');
      if (!silent) {
        toastr.error(err.message, 'Create Point Failed');
      } else {
        throw new Error(err);
      }
    }

    return point;
  }


  createPointAddToOverlay() {
    const {overlays, addResult, addError} = this.props;

    // Determine if an overlay is selected.
    if (this.state.selectedOverlayId === '') {
      toastr.warning('No overlay selected');
      return;
    }

    const overlay = _.find(overlays, {geoId: this.state.selectedOverlayId});

    try {
      const point = this.createPoint(true);
      overlay.addFeature({
        feature: point,
        onSuccess: () => {
          addResult(point, 'createPointAddToOverlay');
          toastr.success('Point Added to Overlay at ' + JSON.stringify(point.position));
        },
        onError: (err) => {
          addError(err, 'createPointAddToOverlay');
          toastr.error('Failed to add Point to overlay');
        }
      });
    } catch (err) {
      addError(err.message, 'createPointAddToOverlay:Critical');
      toastr.error(err.message, 'Create Point Add To Overlay: Critical');
    }
  }

  updateSelectedOverlay(ev) {
    this.setState({selectedOverlayId: ev.target.value});
  }

  update(ev) {
    let prop = ev.target.id.split('-')[1],
      feature = {...this.state.feature};

    feature[prop] = ev.target.value;
    this.setState({feature: feature});
  }

  updateProperties(propertyName, value) {
    const feature = {...this.state.feature};
    feature[propertyName] = value;

    this.setState({feature: feature});
  }

  apply() {
    const {features} = this.props;
    let point = _.find(features, {geoId: this.state.feature.geoId});
    if (!point) {
      toastr.error('No point found with the given id ' + this.state.feature.geoId);
      return;
    }

    let position = this.state.feature.position.split(',');
    let geoPosition = new emp3.api.GeoPosition({
      longitude: position[0] === '' ? undefined : parseFloat(position[0]),
      latitude: position[1] === '' ? undefined : parseFloat(position[1]),
      altitude: position[2] === '' ? undefined : parseFloat(position[2])
    });

    try {
      point = assign(point, {}, this.state.feature,
        {position: geoPosition}
      );
      point.apply();
    } catch (err) {
      toastr.error(err.message, 'Point.apply: Critical');
    }
  }

  render() {
    const {overlays} = this.props;

    return (
      <div>
        <span className='mdl-layout-title'>Create a Point</span>
        <div className='mdl-grid'>
          <VText id='createPoint-name'
                 label='name'
                 value={this.state.feature.name}
                 callback={this.update}
                 className="mdl-cell mdl-cell--12-col"/>

          <VText id='createPoint-geoId'
                 label='geoId'
                 value={this.state.feature.geoId}
                 callback={this.update}
                 className="mdl-cell mdl-cell--12-col"/>

          <VText id='createPoint-position'
                 label='position (lon,lat,alt)'
                 value={this.state.feature.position}
                 callback={this.update}
                 className="mdl-cell mdl-cell--12-col"/>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.createPoint}>
            Create Point
          </button>

          <OverlaySelect overlays={overlays}
                         className="mdl-cell mdl-cell--12-col"
                         selectedOverlayId={this.state.selectedOverlayId}
                         callback={this.updateSelectedOverlay}
                         label='Select which overlay to add to '/>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.createPointAddToOverlay}
            disabled={overlays.length === 0}>
            Create Point Add To Overlay
          </button>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={() => this.apply()}>
            Update
          </button>

          <PropertiesBox featureType={emp3.api.enums.FeatureTypeEnum.GEO_POINT}
                         callback={this.updateProperties}
                         properties={this.state.feature}/>

          <RelatedTests relatedTests={[
            {text: 'Add this feature to an overlay'},
            {text: 'Add this feature to another feature'}
          ]}/>
        </div>
      </div>
    );
  }
}

CreatePointTest.propTypes = {
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired,
  addFeature: PropTypes.func.isRequired,
  overlays: PropTypes.array,
  features: PropTypes.array
};

const mapStateToProps = state => {
  return {
    overlays: state.overlays,
    features: state.features
  };
};

export default connect(mapStateToProps)(CreatePointTest);
